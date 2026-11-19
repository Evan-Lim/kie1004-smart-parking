import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyEmaFilter,
  calculateElectricalBudget,
  calculateParkingFee,
  classifyDistance,
  computeBayLeds,
  computeOverstayBuzzer,
  createInitialBay,
  formatBayLcdLines,
  restoreFromEeprom,
  serializeEeprom,
  stepParkingBay,
} from './parkingEngine';
import { ARDUINO_FIRMWARE_V3 } from '../data/firmwareCode';
import { BOM_ITEMS } from '../data/blueprintData';
import { PRESENTATION_SLIDES } from '../data/slidesData';
import { computeBomTotals, createDefaultBomQuantities } from './bomCalculator';
import { getSlidesPdfBytes } from './slidePdfExporter';

test('classifyDistance matches 1:20 scale distance thresholds', () => {
  assert.equal(classifyDistance(1), 'EMPTY');
  assert.equal(classifyDistance(2), 'DANGER');
  assert.equal(classifyDistance(5), 'DANGER');
  assert.equal(classifyDistance(6), 'CAUTION');
  assert.equal(classifyDistance(10), 'CAUTION');
  assert.equal(classifyDistance(11), 'SAFE');
  assert.equal(classifyDistance(20), 'SAFE');
  assert.equal(classifyDistance(21), 'EMPTY');
  assert.equal(classifyDistance(999), 'EMPTY');
});

test('applyEmaFilter computes 70/30 integer EMA and bypasses >100 cm transitions', () => {
  assert.equal(applyEmaFilter(999, 15), 15);
  assert.equal(applyEmaFilter(15, 999), 999);
  // (7*20 + 3*10)/10 = 17
  assert.equal(applyEmaFilter(20, 10), 17);
});

test('calculateParkingFee applies 15-min free grace first, then hourly ceiling', () => {
  assert.equal(calculateParkingFee(0), 0);
  assert.equal(calculateParkingFee(15), 0);
  assert.equal(calculateParkingFee(16), 3);
  assert.equal(calculateParkingFee(75), 3);
  assert.equal(calculateParkingFee(76), 6);
  assert.equal(calculateParkingFee(180), 9);
  assert.equal(calculateParkingFee(181), 9);
  assert.equal(calculateParkingFee(196), 12);
});

test('5-second stationary hold resets on motion (>1 cm) and starts count-up at 00:00 after 5s steady', () => {
  let bay = createInitialBay(0);
  bay = { ...bay, filteredDistCm: 15, rawDistanceCm: 15 };

  let res = stepParkingBay(bay, 15, 1000, 60);
  bay = res.bay;
  assert.equal(bay.state, 'PARKING_SETTLE');
  assert.equal(bay.stationaryHeldMs, 0);

  res = stepParkingBay(bay, 14, 4000, 60);
  bay = res.bay;
  assert.equal(bay.state, 'PARKING_SETTLE');
  assert.equal(bay.stationaryHeldMs, 3000);
  assert.equal(bay.elapsedSimMins, 0);

  res = stepParkingBay(bay, 8, 4500, 60);
  bay = res.bay;
  assert.equal(bay.wasMotionReset, true);
  assert.equal(bay.state, 'PARKING_SETTLE');
  assert.equal(bay.stationaryHeldMs, 0);
  assert.equal(bay.stationaryStartMs, 4500);

  res = stepParkingBay(bay, bay.anchorDistCm, 9400, 60);
  bay = res.bay;
  assert.equal(bay.state, 'PARKING_SETTLE');

  res = stepParkingBay(bay, bay.anchorDistCm, 9500, 60);
  bay = res.bay;
  assert.equal(bay.state, 'OCCUPIED');
  assert.equal(bay.elapsedRealSec, 0);
  assert.equal(bay.elapsedSimMins, 0);
  assert.equal(res.eepromDirty, true);

  res = stepParkingBay(bay, bay.anchorDistCm, 9500 + 16000, 60);
  bay = res.bay;
  assert.equal(bay.elapsedSimMins, 16);
  assert.equal(bay.accruedFeeRM, 3);
  assert.equal(bay.isOverstaying, false);
});

test('Overstay buzzer remains silent during CAUTION/DANGER and sounds ONLY when time limit is exceeded', () => {
  const b1 = { ...createInitialBay(0), zone: 'DANGER' as const, state: 'OCCUPIED' as const, isOverstaying: false };
  const b2 = { ...createInitialBay(1), zone: 'CAUTION' as const, state: 'OCCUPIED' as const, isOverstaying: false };
  const b3 = createInitialBay(2);

  const silent = computeOverstayBuzzer([b1, b2, b3], 1000);
  assert.equal(silent.active, false);

  const b2Over = { ...b2, elapsedSimMins: 185, isOverstaying: true };
  const sounding = computeOverstayBuzzer([b1, b2Over, b3], 1000);
  assert.equal(sounding.active, true);
  assert.deepEqual(sounding.overstayBayNumbers, [2]);
  assert.equal(sounding.freqHz, 2000);

  const leds = computeBayLeds(b2Over, 0);
  assert.equal(leds.red, true);
  assert.equal(leds.yellow, false);
});

test('Exit debounce ignores brief echo drops and issues receipt after 3.0 s empty', () => {
  let bay: ReturnType<typeof createInitialBay> = {
    ...createInitialBay(0),
    rawDistanceCm: 12,
    filteredDistCm: 12,
    zone: 'SAFE',
    state: 'OCCUPIED',
    entryTimestampMs: 0,
    elapsedRealSec: 76,
    elapsedSimMins: 76,
    accruedFeeRM: 6,
  };

  let res = stepParkingBay(bay, 120, 76000, 60);
  bay = res.bay;
  assert.equal(bay.state, 'EXITING_DEBOUNCE');

  res = stepParkingBay(bay, 12, 77500, 60);
  bay = res.bay;
  assert.equal(bay.state, 'OCCUPIED');
  assert.equal(res.receipt, undefined);

  res = stepParkingBay(bay, 120, 78000, 60);
  bay = res.bay;
  res = stepParkingBay(bay, 120, 81000, 60);
  assert.equal(res.bay.state, 'AVAILABLE');
  assert.ok(res.receipt);
  assert.equal(res.receipt?.totalMins, 81);
  assert.equal(res.receipt?.finalFeeRM, 6);
});

test('EEPROM serialization and power-cycle restoration preserves active occupied bay & elapsed seconds', () => {
  const b0 = {
    ...createInitialBay(0),
    state: 'OCCUPIED' as const,
    elapsedRealSec: 45,
    elapsedSimMins: 45,
    isOverstaying: false,
  };
  const rec = serializeEeprom([b0, createInitialBay(1), createInitialBay(2)]);
  assert.equal(rec.magic, '0x4B494533');
  const restored = restoreFromEeprom(rec, 1000, 60);
  assert.equal(restored[0].state, 'OCCUPIED');
  assert.equal(restored[0].priorElapsedRealSec, 45);
  assert.equal(restored[0].elapsedSimMins, 45);
  assert.equal(restored[0].accruedFeeRM, 3);
  assert.equal(restored[1].state, 'AVAILABLE');
});

test('formatBayLcdLines always returns two exact 16-character strings including overstay fee', () => {
  const bay = createInitialBay(0);
  const [l0, l1] = formatBayLcdLines(bay, 60);
  assert.equal(l0.length, 16);
  assert.equal(l1.length, 16);

  const overBay = {
    ...bay,
    state: 'OCCUPIED' as const,
    filteredDistCm: 11,
    elapsedSimMins: 186,
    accruedFeeRM: 9,
    isOverstaying: true,
  };
  const [o0, o1] = formatBayLcdLines(overBay, 60);
  assert.equal(o0.length, 16);
  assert.equal(o1.length, 16);
  assert.ok(o0.includes('RM9'), `Expected RM9 in "${o0}"`);
});

test('calculateElectricalBudget accurately computes 3-LCD, 9-LED, 330-ohm current budgets', () => {
  const budget = calculateElectricalBudget({
    resistorOhms: 330,
    activeLcdCount: 3,
    lcdBacklightMa: 25,
    activeLedsCount: 3,
    buzzerOn: true,
    i2cBackpacksWithPullups: 3,
  });
  assert.equal(budget.ledCurrentRedYellowMa, 9.09);
  assert.equal(budget.ledCurrentGreenMa, 8.48);
  assert.equal(budget.parallelI2cPullupKOhm, 1.57);
  assert.equal(budget.mcuWithinSpec, true);
  assert.equal(budget.usbWithinSpec, true);
  assert.equal(budget.pinCurrentWithinSpec, true);
  assert.ok(budget.mcuTotalWorstCaseMa < 200);
  assert.ok(budget.usbTotalWorstCaseMa < 500);
});

test('ARDUINO_FIRMWARE_V3 strictly enforces KIE1004 W01-W13 syntax (no advanced structs/enums/snprintf)', () => {
  const codeWithoutComments = ARDUINO_FIRMWARE_V3.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const bannedPatterns = [
    /\bstruct\s+/,
    /\benum\s+/,
    /\bsnprintf\s*\(/,
    /EEPROM\.put/,
    /\buint8_t\b/,
    /\buint16_t\b/,
    /\buint32_t\b/,
    /\bF\s*\(/,
  ];
  for (const pattern of bannedPatterns) {
    assert.equal(
      pattern.test(codeWithoutComments),
      false,
      `Found banned advanced syntax matching ${pattern}`,
    );
  }

  const requiredConstructs = [
    'const int LED_PINS[NUM_BAYS][LEDS_PER_BAY]',
    'void insertionSort(int items[], int n)',
    'int findFirstAvailableBay(const int states[], int numBays)',
    'int *occupiedPtr',
    'void printTwoDigits(LiquidCrystal_I2C',
    'const int TRIG_PINS[NUM_BAYS] = { 2, 4, 6 };',
    'const int ECHO_PINS[NUM_BAYS] = { 3, 5, 7 };',
  ];
  for (const snippet of requiredConstructs) {
    assert.ok(
      ARDUINO_FIRMWARE_V3.includes(snippet),
      `Expected W01-W13 construct missing: ${snippet}`,
    );
  }
});

test('getSlidesPdfBytes generates a valid 10-page vector PDF binary without spoken scripts', () => {
  const bytes = getSlidesPdfBytes();
  assert.ok(bytes instanceof Uint8Array);
  assert.ok(bytes.byteLength > 8000, `Expected PDF > 8KB, got ${bytes.byteLength}`);
  const header = new TextDecoder().decode(bytes.slice(0, 5));
  assert.equal(header, '%PDF-');
  const fullText = new TextDecoder('latin1').decode(bytes);
  const pageCountMatches = fullText.match(/\/Type\s*\/Page\b/g) ?? [];
  assert.equal(pageCountMatches.length, 10, `Expected 10 PDF pages, found ${pageCountMatches.length}`);
});

test('computeBomTotals calculates RM 69.70 default kit and dynamically updates when quantities change', () => {
  const defaults = createDefaultBomQuantities(BOM_ITEMS);
  const base = computeBomTotals(BOM_ITEMS, defaults, {}, 5);
  assert.equal(base.grandTotalRM, 69.7);
  assert.equal(base.perStudentRM, 13.94);

  // Increase LCD count from 3 to 5 (+2 x RM 7.50 = +RM 15.00 -> RM 84.70)
  const modified = computeBomTotals(BOM_ITEMS, { ...defaults, lcds: 5 }, { lcds: true }, 5);
  assert.equal(modified.grandTotalRM, 84.7);
  assert.equal(modified.checkedTotalRM, 37.5);
  assert.equal(modified.perStudentRM, 16.94);

  // Zero out Uno (-RM 18.00 -> RM 51.70)
  const zeroed = computeBomTotals(BOM_ITEMS, { ...defaults, uno: 0 }, {}, 5);
  assert.equal(zeroed.grandTotalRM, 51.7);
});

test('PRESENTATION_SLIDES has 10 diversified slides, zero week numbers, and complete layperson scripts', () => {
  assert.equal(PRESENTATION_SLIDES.length, 10);
  const uniqueLayouts = new Set(PRESENTATION_SLIDES.map((s) => s.layout));
  assert.ok(uniqueLayouts.size >= 5, `Expected >= 5 slide layouts, got ${uniqueLayouts.size}`);

  const weekRegex = /\b(W0?\d|W1[0-3]|Week\s*\d+)\b/i;
  for (const slide of PRESENTATION_SLIDES) {
    const allText = [
      slide.sectionTag,
      slide.title,
      slide.subtitle,
      slide.diagramCaption,
      slide.spokenScript,
      ...slide.highlights.map((h) => `${h.title} ${h.body}`),
    ].join(' ');
    assert.equal(
      weekRegex.test(allText),
      false,
      `Slide ${slide.slideNumber} should not mention week numbers: matched in "${allText}"`,
    );
    const wordCount = slide.spokenScript.trim().split(/\s+/).length;
    assert.ok(wordCount >= 60, `Slide ${slide.slideNumber} spoken script too short (${wordCount} words)`);
  }
});


