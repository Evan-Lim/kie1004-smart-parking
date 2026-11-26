import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyEmaFilter,
  calculateElectricalBudget,
  calculateParkingFee,
  classifyDistance,
  computeBayBuzzer,
  computeBayLeds,
  computeBuzzerBus,
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

test('calculateParkingFee applies 15-min free grace first, then RM 1 per started 30-min block', () => {
  assert.equal(calculateParkingFee(0), 0);
  assert.equal(calculateParkingFee(15), 0);
  assert.equal(calculateParkingFee(16), 1);
  assert.equal(calculateParkingFee(45), 1);
  assert.equal(calculateParkingFee(46), 2);
  assert.equal(calculateParkingFee(75), 2);
  assert.equal(calculateParkingFee(76), 3);
  assert.equal(calculateParkingFee(239), 8);
  assert.equal(calculateParkingFee(240), 8);
  assert.equal(calculateParkingFee(255), 8);
  assert.equal(calculateParkingFee(256), 9);
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
  assert.equal(bay.accruedFeeRM, 1);
  assert.equal(bay.isOverstaying, false);

  // Boundary check: 239 sim min is still within 4-hour limit; 240 sim min triggers inclusive >= 240 overstay
  res = stepParkingBay(bay, bay.anchorDistCm, 9500 + 239000, 60);
  bay = res.bay;
  assert.equal(bay.elapsedSimMins, 239);
  assert.equal(bay.accruedFeeRM, 8);
  assert.equal(bay.isOverstaying, false);

  res = stepParkingBay(bay, bay.anchorDistCm, 9500 + 240000, 60);
  bay = res.bay;
  assert.equal(bay.elapsedSimMins, 240);
  assert.equal(bay.accruedFeeRM, 8);
  assert.equal(bay.isOverstaying, true);
});

test('3x independent passive buzzers enforce Danger (2500 Hz), Overstay (1800 Hz), Mixed (2000 Hz) & active-LOW 0x24 masks', () => {
  const b1Safe = { ...createInitialBay(0), zone: 'SAFE' as const, state: 'OCCUPIED' as const, isOverstaying: false };
  const b2Caution = { ...createInitialBay(1), zone: 'CAUTION' as const, state: 'OCCUPIED' as const, isOverstaying: false };
  const b3Empty = createInitialBay(2);

  // Silent baseline: all gates HIGH -> 0xFF (255), carrier 0 Hz
  const silentBus = computeBuzzerBus([b1Safe, b2Caution, b3Empty], 0);
  assert.equal(silentBus.anyAlerting, false);
  assert.equal(silentBus.anySoundingNow, false);
  assert.equal(silentBus.carrierFreqHz, 0);
  assert.equal(silentBus.byteMask, 255);
  assert.equal(silentBus.byteHex, '0xFF');
  assert.equal(silentBus.byteBinary, '11111111');

  // Bay 1 Danger (<5 cm) only -> 2500 Hz, 150 ms ON/OFF, P0 LOW -> 0xFE (254) at t=0, 0xFF at t=150
  const b1Danger = { ...b1Safe, zone: 'DANGER' as const, filteredDistCm: 4 };
  const dangerOn = computeBuzzerBus([b1Danger, b2Caution, b3Empty], 0);
  assert.equal(dangerOn.carrierFreqHz, 2500);
  assert.equal(dangerOn.byteMask, 254);
  assert.equal(dangerOn.byteHex, '0xFE');
  assert.deepEqual(dangerOn.dangerBayNumbers, [1]);
  assert.equal(dangerOn.bays[0].isGateLow, true);
  assert.equal(dangerOn.bays[1].isGateLow, false);

  const dangerOff = computeBuzzerBus([b1Danger, b2Caution, b3Empty], 150);
  assert.equal(dangerOff.byteMask, 255);
  assert.equal(dangerOff.anySoundingNow, false);

  // Bay 2 Overstay (>= 240 min / 4h) only -> 1800 Hz, 500 ms ON / 1000 ms OFF, P1 LOW -> 0xFD (253) at t=200, 0xFF at t=600
  const b2Over = { ...b2Caution, elapsedSimMins: 240, isOverstaying: true };
  const overOn = computeBuzzerBus([b1Safe, b2Over, b3Empty], 200);
  assert.equal(overOn.carrierFreqHz, 1800);
  assert.equal(overOn.byteMask, 253);
  assert.equal(overOn.byteHex, '0xFD');
  assert.deepEqual(overOn.overstayBayNumbers, [2]);

  const overOff = computeBuzzerBus([b1Safe, b2Over, b3Empty], 600);
  assert.equal(overOff.byteMask, 255);

  // Simultaneous Mixed: Bay 1 Danger + Bay 3 Overstay -> 2000 Hz shared carrier, P0 & P2 LOW -> 255 - 1 - 4 = 250 (0xFA) at t=0
  const b3Over = { ...createInitialBay(2), zone: 'SAFE' as const, state: 'OCCUPIED' as const, elapsedSimMins: 256, isOverstaying: true };
  const mixedBothOn = computeBuzzerBus([b1Danger, b2Caution, b3Over], 0);
  assert.equal(mixedBothOn.carrierFreqHz, 2000);
  assert.equal(mixedBothOn.byteMask, 250);
  assert.equal(mixedBothOn.byteHex, '0xFA');
  assert.equal(mixedBothOn.activeSoundingCount, 2);
  assert.deepEqual(mixedBothOn.dangerBayNumbers, [1]);
  assert.deepEqual(mixedBothOn.overstayBayNumbers, [3]);

  // At t=150ms, Bay 1 Danger is in OFF phase (150ms), while Bay 3 Overstay is still ON (<500ms) -> 255 - 4 = 251 (0xFB)
  const mixedB3Only = computeBuzzerBus([b1Danger, b2Caution, b3Over], 150);
  assert.equal(mixedB3Only.byteMask, 251);
  assert.equal(mixedB3Only.byteHex, '0xFB');
  assert.equal(mixedB3Only.carrierFreqHz, 2000);

  // All 3 bays alerting & ON at t=0 -> 255 - 1 - 2 - 4 = 248 (0xF8)
  const allThreeOn = computeBuzzerBus([b1Danger, b2Over, b3Over], 0);
  assert.equal(allThreeOn.byteMask, 248);
  assert.equal(allThreeOn.byteHex, '0xF8');
  assert.equal(allThreeOn.activeSoundingCount, 3);

  // Danger priority overrides Overstay on the same bay
  const b1Both = { ...b1Danger, isOverstaying: true };
  assert.equal(computeBayBuzzer(b1Both, 0).mode, 'DANGER');

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
    accruedFeeRM: 3,
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
  assert.equal(res.receipt?.finalFeeRM, 3);
});

test('EEPROM serialization and power-cycle restoration preserves active occupied bay & elapsed seconds', () => {
  const b0 = {
    ...createInitialBay(0),
    state: 'OCCUPIED' as const,
    elapsedRealSec: 45,
    elapsedSimMins: 45,
    isOverstaying: false,
  };
  const b2 = {
    ...createInitialBay(2),
    state: 'OCCUPIED' as const,
    elapsedRealSec: 240,
    elapsedSimMins: 240,
    isOverstaying: true,
  };
  const rec = serializeEeprom([b0, createInitialBay(1), b2]);
  assert.equal(rec.magic, '0x4B494533');
  const restored = restoreFromEeprom(rec, 1000, 60);
  assert.equal(restored[0].state, 'OCCUPIED');
  assert.equal(restored[0].priorElapsedRealSec, 45);
  assert.equal(restored[0].elapsedSimMins, 45);
  assert.equal(restored[0].accruedFeeRM, 1);
  assert.equal(restored[0].isOverstaying, false);
  assert.equal(restored[1].state, 'AVAILABLE');
  assert.equal(restored[2].state, 'OCCUPIED');
  assert.equal(restored[2].elapsedSimMins, 240);
  assert.equal(restored[2].accruedFeeRM, 8);
  assert.equal(restored[2].isOverstaying, true);
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
    elapsedSimMins: 240,
    accruedFeeRM: 8,
    isOverstaying: true,
  };
  const [o0, o1] = formatBayLcdLines(overBay, 60);
  assert.equal(o0.length, 16);
  assert.equal(o1.length, 16);
  assert.ok(o0.includes('RM8'), `Expected RM8 in "${o0}"`);
});

test('calculateElectricalBudget accurately computes 3-LCD, 9-LED, 2N2222, PCF8574 (0x24) & 3-passive-buzzer budgets', () => {
  const budget = calculateElectricalBudget({
    resistorOhms: 330,
    activeLcdCount: 3,
    lcdBacklightMa: 25,
    activeLedsCount: 3,
    activeBuzzerCount: 0,
    i2cDevicesWithPullups: 4,
  });
  assert.equal(budget.ledCurrentRedYellowMa, 9.09);
  assert.equal(budget.ledCurrentGreenMa, 8.48);
  assert.equal(budget.parallelI2cPullupKOhm, 1.18);
  assert.equal(budget.i2cSinkMa, 4.26);
  assert.equal(budget.mcuTotalTypicalMa, 46.5);
  assert.equal(budget.mcuTotalWorstCaseMa, 100.3);
  assert.equal(budget.pcf8574SinkWorstCaseMa, 45.0);
  assert.equal(budget.transistorLoadWorstCaseMa, 49.3);
  assert.equal(budget.buzzerSubSystemWorstCaseMa, 50.3);
  assert.equal(budget.usbTotalTypicalMa, 141.5);
  assert.equal(budget.usbTotalWorstCaseMa, 285.6);
  assert.equal(budget.mcuWithinSpec, true);
  assert.equal(budget.pcf8574WithinSpec, true);
  assert.equal(budget.transistorWithinSpec, true);
  assert.equal(budget.usbWithinSpec, true);
  assert.equal(budget.pinCurrentWithinSpec, true);
});

test('ARDUINO_FIRMWARE_V3 strictly enforces KIE1004 W01-W13 syntax & includes 3-buzzer PCF8574 0x24 logic', () => {
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
    'const int PCF8574_BUZZER_ADDR = 0x24;',
    'const int BUZZER_BIT_WEIGHT[NUM_BAYS] = { 1, 2, 4 };',
    'const int BILLING_BLOCK_MIN  = 30;',
    'const int RATE_RM_PER_30MIN  = 1;',
    'const int OVERSTAY_MIN       = 240;',
    'void writeBuzzerBus(int activeLowMask)',
    'void updateThreeBayBuzzers(',
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
      `Expected W01-W13 / 3-buzzer construct missing: ${snippet}`,
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

test('computeBomTotals calculates RM 76.70 default kit (11 items) and dynamically updates when quantities change', () => {
  assert.equal(BOM_ITEMS.length, 11);
  const defaults = createDefaultBomQuantities(BOM_ITEMS);
  const base = computeBomTotals(BOM_ITEMS, defaults, {}, 5);
  assert.equal(base.grandTotalRM, 76.7);
  assert.equal(base.perStudentRM, 15.34);

  // Increase LCD count from 3 to 5 (+2 x RM 7.50 = +RM 15.00 -> RM 91.70)
  const modified = computeBomTotals(BOM_ITEMS, { ...defaults, lcds: 5 }, { lcds: true }, 5);
  assert.equal(modified.grandTotalRM, 91.7);
  assert.equal(modified.checkedTotalRM, 37.5);
  assert.equal(modified.perStudentRM, 18.34);

  // Zero out Uno (-RM 18.00 -> RM 58.70)
  const zeroed = computeBomTotals(BOM_ITEMS, { ...defaults, uno: 0 }, {}, 5);
  assert.equal(zeroed.grandTotalRM, 58.7);
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
