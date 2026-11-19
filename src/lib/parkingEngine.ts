/**
 * Pure TypeScript simulation & engineering calculation engine for
 * KIE1004 Smart Multi-Space Parking System (v3.0 — 3x I2C LCDs, 5s Stationary Hold, Overstay Buzzer).
 * Mirrors the exact Arduino Uno R3 ATmega328P firmware semantics.
 */

export const ENGINEERING_CONSTANTS = {
  NUM_BAYS: 3,
  DIST_MIN_VALID_CM: 2,
  DIST_DANGER_CM: 5,
  DIST_CAUTION_CM: 10,
  DIST_SAFE_MAX_CM: 20,
  STATIONARY_CONFIRM_MS: 5000, // 5.0 s continuous presence AND stationary distance
  STATIONARY_TOLERANCE_CM: 1, // +/- 1 cm HC-SR04 quantization deadband
  EXIT_DEBOUNCE_MS: 3000, // 3.0 s absence to confirm departure
  SENSOR_TDM_INTERVAL_MS: 40, // 40 ms per bay -> 120 ms cycle (8.33 Hz/bay)
  LCD_STAGGER_INTERVAL_MS: 200, // 1 LCD updated every 200 ms -> 600 ms cycle
  PULSE_TIMEOUT_US: 15000, // ~257 cm max echo wait
  FREE_PARKING_MINS: 15,
  MAX_PARKING_LIMIT_MINS: 180, // 3 hours overstay threshold
  HOURLY_RATE_RM: 3.0,
  SPEED_OF_SOUND_M_S: 343,
  VCC_VOLTS: 5.0,
  LED_VF_RED_YELLOW: 2.0,
  LED_VF_GREEN: 2.2,
  ATMEGA_MAX_VCC_MA: 200,
  ATMEGA_REC_PIN_MA: 20,
  USB_POLY_MAX_MA: 500,
  I2C_ADDRESSES: ['0x27', '0x26', '0x25'] as const,
} as const;

export type DistanceZone = 'EMPTY' | 'SAFE' | 'CAUTION' | 'DANGER';

export type OccupancyState =
  | 'AVAILABLE'
  | 'PARKING_SETTLE'
  | 'OCCUPIED'
  | 'EXITING_DEBOUNCE';

export interface ParkingBayState {
  id: number; // 0, 1, 2
  lcdAddress: string;
  rawDistanceCm: number;
  filteredDistCm: number;
  zone: DistanceZone;
  state: OccupancyState;
  anchorDistCm: number;
  stationaryStartMs: number;
  stationaryHeldMs: number;
  wasMotionReset: boolean;
  exitStartMs: number;
  entryTimestampMs: number;
  priorElapsedRealSec: number;
  elapsedRealSec: number;
  elapsedSimMins: number;
  accruedFeeRM: number;
  isOverstaying: boolean;
}

export interface ExitReceipt {
  id: string;
  bayNumber: number;
  totalMins: number;
  freeGraceMins: number;
  finalFeeRM: number;
  wasOverstay: boolean;
  timestampMs: number;
}

export interface EepromBaySnapshot {
  state: 'AVAILABLE' | 'OCCUPIED';
  savedElapsedRealSec: number;
  isOverstaying: boolean;
}

export interface EepromRecord {
  magic: string;
  bays: EepromBaySnapshot[];
}

export interface LedOutputs {
  green: boolean;
  yellow: boolean;
  red: boolean;
  modeLabel: string;
}

export interface BuzzerStatus {
  active: boolean;
  overstayBayNumbers: number[];
  freqHz: number;
  cadenceLabel: string;
  toneHigh: boolean;
}

export interface ElectricalBudgetResult {
  ledCurrentRedYellowMa: number;
  ledCurrentGreenMa: number;
  allNineLedsMa: number;
  activeLedsMa: number;
  mcuCoreMa: number;
  buzzerMa: number;
  i2cSinkMa: number;
  mcuTotalTypicalMa: number;
  mcuTotalWorstCaseMa: number;
  mcuWithinSpec: boolean;
  sensorsRailMa: number;
  lcdsRailMa: number;
  usbTotalTypicalMa: number;
  usbTotalWorstCaseMa: number;
  usbWithinSpec: boolean;
  parallelI2cPullupKOhm: number;
  pinCurrentWithinSpec: boolean;
}

export function classifyDistance(distCm: number): DistanceZone {
  if (
    distCm >= ENGINEERING_CONSTANTS.DIST_MIN_VALID_CM &&
    distCm <= ENGINEERING_CONSTANTS.DIST_DANGER_CM
  ) {
    return 'DANGER';
  }
  if (
    distCm > ENGINEERING_CONSTANTS.DIST_DANGER_CM &&
    distCm <= ENGINEERING_CONSTANTS.DIST_CAUTION_CM
  ) {
    return 'CAUTION';
  }
  if (
    distCm > ENGINEERING_CONSTANTS.DIST_CAUTION_CM &&
    distCm <= ENGINEERING_CONSTANTS.DIST_SAFE_MAX_CM
  ) {
    return 'SAFE';
  }
  return 'EMPTY';
}

/**
 * Exact 70/30 integer EMA filter matching Arduino firmware:
 * (7 * prev + 3 * raw) / 10, bypassing filter when transitioning across >100 cm.
 */
export function applyEmaFilter(prevFilteredCm: number, rawDistCm: number): number {
  if (prevFilteredCm > 100 || rawDistCm > 100) {
    return Math.round(rawDistCm);
  }
  return Math.floor((7 * prevFilteredCm + 3 * Math.round(rawDistCm)) / 10);
}

/**
 * Grace-First Ceiling Tariff Calculation:
 * Step 1: If duration <= 15 sim min -> RM 0.00
 * Step 2: billableMins = duration - 15
 * Step 3: billableHours = floor((billableMins + 59) / 60)
 * Step 4: fee = billableHours * RM 3.00
 */
export function calculateParkingFee(durationMins: number): number {
  if (durationMins <= ENGINEERING_CONSTANTS.FREE_PARKING_MINS) {
    return 0;
  }
  const billableMins = durationMins - ENGINEERING_CONSTANTS.FREE_PARKING_MINS;
  const billableHours = Math.floor((billableMins + 59) / 60);
  return billableHours * ENGINEERING_CONSTANTS.HOURLY_RATE_RM;
}

export function createInitialBay(id: number): ParkingBayState {
  return {
    id,
    lcdAddress: ENGINEERING_CONSTANTS.I2C_ADDRESSES[id] ?? '0x27',
    rawDistanceCm: 32,
    filteredDistCm: 32,
    zone: 'EMPTY',
    state: 'AVAILABLE',
    anchorDistCm: 32,
    stationaryStartMs: 0,
    stationaryHeldMs: 0,
    wasMotionReset: false,
    exitStartMs: 0,
    entryTimestampMs: 0,
    priorElapsedRealSec: 0,
    elapsedRealSec: 0,
    elapsedSimMins: 0,
    accruedFeeRM: 0,
    isOverstaying: false,
  };
}

export interface BayStepResult {
  bay: ParkingBayState;
  eventLog?: string;
  receipt?: ExitReceipt;
  eepromDirty: boolean;
}

/**
 * Advances a single parking bay's 4-state Stationary-Aware FSM.
 * Core rule: Car must be in slot (2..20 cm) AND distance must not change (> +/-1 cm)
 * for 5.0 continuous seconds before the count-up timer begins at 00:00.
 */
export function stepParkingBay(
  prev: ParkingBayState,
  rawDistanceCm: number,
  nowMs: number,
  timeScaleFactor: number
): BayStepResult {
  const filteredDistCm = applyEmaFilter(prev.filteredDistCm, rawDistanceCm);
  const zone = classifyDistance(filteredDistCm);
  const vehicleDetected = zone !== 'EMPTY';

  const next: ParkingBayState = {
    ...prev,
    rawDistanceCm: Math.round(rawDistanceCm),
    filteredDistCm,
    zone,
    wasMotionReset: false,
  };

  let eventLog: string | undefined;
  let receipt: ExitReceipt | undefined;
  let eepromDirty = false;

  // Keep elapsed duration, live fee, and overstay flag current during OCCUPIED & EXITING_DEBOUNCE
  if (next.state === 'OCCUPIED' || next.state === 'EXITING_DEBOUNCE') {
    const activeRealSec = Math.max(
      0,
      Math.floor((nowMs - next.entryTimestampMs) / 1000)
    );
    const totalRealSec = next.priorElapsedRealSec + activeRealSec;
    next.elapsedRealSec = totalRealSec;
    next.elapsedSimMins = Math.floor((totalRealSec * timeScaleFactor) / 60);
    next.accruedFeeRM = calculateParkingFee(next.elapsedSimMins);
    const wasOverstay = next.isOverstaying;
    next.isOverstaying =
      next.elapsedSimMins > ENGINEERING_CONSTANTS.MAX_PARKING_LIMIT_MINS;
    if (!wasOverstay && next.isOverstaying) {
      eventLog = `[ALARM] Bay ${next.id + 1} exceeded ${ENGINEERING_CONSTANTS.MAX_PARKING_LIMIT_MINS} sim min limit! Buzzer ON.`;
      eepromDirty = true;
    }
  }

  switch (next.state) {
    case 'AVAILABLE': {
      next.stationaryHeldMs = 0;
      if (vehicleDetected) {
        next.state = 'PARKING_SETTLE';
        next.anchorDistCm = filteredDistCm;
        next.stationaryStartMs = nowMs;
        next.stationaryHeldMs = 0;
        eventLog = `[ENTRY] Bay ${next.id + 1} detected car at ${filteredDistCm} cm. Waiting 5.0 s stationary stop.`;
      }
      break;
    }

    case 'PARKING_SETTLE': {
      if (!vehicleDetected) {
        next.state = 'AVAILABLE';
        next.stationaryHeldMs = 0;
        eventLog = `[CLEAR] Bay ${next.id + 1} cleared before 5.0 s stationary confirmation.`;
      } else {
        const deltaCm = Math.abs(filteredDistCm - next.anchorDistCm);
        if (deltaCm > ENGINEERING_CONSTANTS.STATIONARY_TOLERANCE_CM) {
          // Vehicle is still moving/maneuvering -> reset 5-second stop timer
          next.anchorDistCm = filteredDistCm;
          next.stationaryStartMs = nowMs;
          next.stationaryHeldMs = 0;
          next.wasMotionReset = true;
          eventLog = `[MOTION] Bay ${next.id + 1} moved to ${filteredDistCm} cm (|Δd|=${deltaCm} cm > 1 cm). 5.0 s hold reset.`;
        } else {
          next.stationaryHeldMs = Math.max(0, nowMs - next.stationaryStartMs);
          if (next.stationaryHeldMs >= ENGINEERING_CONSTANTS.STATIONARY_CONFIRM_MS) {
            // 5.0 seconds stationary confirmed -> Count-up starts cleanly at 00:00!
            next.state = 'OCCUPIED';
            next.entryTimestampMs = nowMs;
            next.priorElapsedRealSec = 0;
            next.elapsedRealSec = 0;
            next.elapsedSimMins = 0;
            next.accruedFeeRM = 0;
            next.isOverstaying = false;
            next.stationaryHeldMs = ENGINEERING_CONSTANTS.STATIONARY_CONFIRM_MS;
            eepromDirty = true;
            eventLog = `[OCCUPIED] Bay ${next.id + 1} stationary 5.0 s at ${filteredDistCm} cm. Count-up timer started at 00:00 & saved to EEPROM.`;
          }
        }
      }
      break;
    }

    case 'OCCUPIED': {
      if (!vehicleDetected) {
        next.state = 'EXITING_DEBOUNCE';
        next.exitStartMs = nowMs;
        eventLog = `[EXIT?] Bay ${next.id + 1} echo lost. Confirming exit for 3.0 s (timer keeps running).`;
      }
      break;
    }

    case 'EXITING_DEBOUNCE': {
      if (vehicleDetected) {
        next.state = 'OCCUPIED';
        eventLog = `[RESUME] Bay ${next.id + 1} echo returned (${filteredDistCm} cm). Transient glitch ignored.`;
      } else if (nowMs - next.exitStartMs >= ENGINEERING_CONSTANTS.EXIT_DEBOUNCE_MS) {
        const finalMins = next.elapsedSimMins;
        const finalFeeRM = calculateParkingFee(finalMins);
        receipt = {
          id: `RCP-${next.id + 1}-${nowMs}`,
          bayNumber: next.id + 1,
          totalMins: finalMins,
          freeGraceMins: ENGINEERING_CONSTANTS.FREE_PARKING_MINS,
          finalFeeRM,
          wasOverstay: next.isOverstaying,
          timestampMs: nowMs,
        };
        eventLog = `[RECEIPT] Bay ${next.id + 1} exited after ${finalMins} sim min -> RM ${finalFeeRM.toFixed(2)}.`;
        next.state = 'AVAILABLE';
        next.entryTimestampMs = 0;
        next.priorElapsedRealSec = 0;
        next.elapsedRealSec = 0;
        next.elapsedSimMins = 0;
        next.accruedFeeRM = 0;
        next.isOverstaying = false;
        next.stationaryHeldMs = 0;
        eepromDirty = true;
      }
      break;
    }
  }

  return { bay: next, eventLog, receipt, eepromDirty };
}

/**
 * Evaluates the 3 distance LEDs (Green, Yellow, Red) mounted above each bay's ultrasonic sensor.
 */
export function computeBayLeds(bay: ParkingBayState, nowMs: number): LedOutputs {
  if (bay.isOverstaying) {
    const strobe = Math.floor(nowMs / 250) % 2 === 0;
    return {
      green: false,
      yellow: !strobe,
      red: strobe,
      modeLabel: 'Overstay Strobe (R/Y)',
    };
  }
  switch (bay.zone) {
    case 'EMPTY':
      return { green: true, yellow: false, red: false, modeLabel: 'Green Solid (Open)' };
    case 'SAFE':
      return { green: true, yellow: false, red: false, modeLabel: 'Green Solid (Safe)' };
    case 'CAUTION':
      return { green: false, yellow: true, red: false, modeLabel: 'Yellow Solid (Caution)' };
    case 'DANGER': {
      const flash = Math.floor(nowMs / 150) % 2 === 0;
      return { green: false, yellow: false, red: flash, modeLabel: 'Red Flash (Danger)' };
    }
  }
}

/**
 * Evaluates the Overstay Buzzer Engine:
 * Sounds ONLY once one or more cars exceed the 180-minute parking time limit.
 * Distance feedback is handled exclusively by the 3 per-bay LEDs.
 * Uses bay-coded pulse groups (1, 2, or 3 pulses) on Pin A3 so staff can identify
 * which bay is overstaying even with a single shared passive buzzer.
 */
export function computeOverstayBuzzer(
  bays: ParkingBayState[],
  nowMs: number
): BuzzerStatus {
  const overstayBayNumbers = bays
    .filter((b) => b.isOverstaying)
    .map((b) => b.id + 1);

  if (overstayBayNumbers.length === 0) {
    return {
      active: false,
      overstayBayNumbers: [],
      freqHz: 0,
      cadenceLabel: 'Silent (All within limit)',
      toneHigh: false,
    };
  }

  // Bay-coded pulse cadence: 200 ms on / 200 ms off, repeated per highest-priority overstay bay
  const primaryBay = overstayBayNumbers[0];
  const cycleStep = Math.floor(nowMs / 200) % (primaryBay * 2 + 2);
  const toneHigh = cycleStep < primaryBay * 2 && cycleStep % 2 === 0;

  return {
    active: true,
    overstayBayNumbers,
    freqHz: 2000,
    cadenceLabel:
      overstayBayNumbers.length === 1
        ? `Bay ${primaryBay} Overstay (${primaryBay}× pulse @ 2000 Hz)`
        : `Multi-Bay Overstay (Bays ${overstayBayNumbers.join(', ')} @ 2000 Hz)`,
    toneHigh,
  };
}

/**
 * Formats the exact 2 lines (16 chars each) displayed on a bay's dedicated 16x2 I2C LCD.
 */
export function formatBayLcdLines(
  bay: ParkingBayState,
  timeScaleFactor: number
): [string, string] {
  const bayTag = `B${bay.id + 1}`;
  const distStr =
    bay.filteredDistCm > 99
      ? '--'
      : String(bay.filteredDistCm).padStart(2, '0');

  if (bay.state === 'AVAILABLE') {
    return [
      `${bayTag} AVAILABLE     `.slice(0, 16),
      `D:${distStr}cm  T:00:00 `.slice(0, 16),
    ];
  }

  if (bay.state === 'PARKING_SETTLE') {
    const remSec = Math.max(
      0,
      Math.ceil(
        (ENGINEERING_CONSTANTS.STATIONARY_CONFIRM_MS - bay.stationaryHeldMs) /
          1000
      )
    );
    const status = bay.wasMotionReset ? 'MOVING...' : `STOP ${remSec}s  `;
    return [
      `${bayTag} ${status}`.padEnd(16, ' ').slice(0, 16),
      `D:${distStr}cm  WAIT 5s `.slice(0, 16),
    ];
  }

  // OCCUPIED or EXITING_DEBOUNCE
  let timerStr: string;
  if (timeScaleFactor === 60) {
    // 1 real sec = 1 sim min -> show HH:MM simulated count-up
    const hrs = Math.floor(bay.elapsedSimMins / 60);
    const mins = bay.elapsedSimMins % 60;
    timerStr = `${String(hrs).padStart(2, '0')}h${String(mins).padStart(2, '0')}m`;
  } else {
    // 1x real-time -> show MM:SS count-up
    const mins = Math.floor(bay.elapsedRealSec / 60);
    const secs = bay.elapsedRealSec % 60;
    timerStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  const feeStr = `RM${Math.round(bay.accruedFeeRM)}`.padStart(4, ' ');
  if (bay.isOverstaying) {
    return [
      `${bayTag} OVERSTAY ${feeStr}`.slice(0, 16),
      `T:${timerStr} D:${distStr}cm`.padEnd(16, ' ').slice(0, 16),
    ];
  }

  const headerStatus =
    bay.state === 'EXITING_DEBOUNCE' ? 'EXITING?' : 'OCCUPIED';
  return [
    `${bayTag} ${headerStatus} ${feeStr}`.slice(0, 16),
    `T:${timerStr} D:${distStr}cm`.padEnd(16, ' ').slice(0, 16),
  ];
}

export function serializeEeprom(bays: ParkingBayState[]): EepromRecord {
  return {
    magic: '0x4B494533', // "KIE3" v3.0 signature
    bays: bays.map((b) => ({
      state:
        b.state === 'OCCUPIED' || b.state === 'EXITING_DEBOUNCE'
          ? 'OCCUPIED'
          : 'AVAILABLE',
      savedElapsedRealSec:
        b.state === 'OCCUPIED' || b.state === 'EXITING_DEBOUNCE'
          ? b.elapsedRealSec
          : 0,
      isOverstaying:
        b.state === 'OCCUPIED' || b.state === 'EXITING_DEBOUNCE'
          ? b.isOverstaying
          : false,
    })),
  };
}

export function restoreFromEeprom(
  record: EepromRecord,
  nowMs: number,
  timeScaleFactor: number
): ParkingBayState[] {
  return record.bays.map((snap, idx) => {
    const base = createInitialBay(idx);
    if (snap.state === 'OCCUPIED') {
      const simMins = Math.floor(
        (snap.savedElapsedRealSec * timeScaleFactor) / 60
      );
      return {
        ...base,
        rawDistanceCm: 14,
        filteredDistCm: 14,
        zone: 'SAFE',
        state: 'OCCUPIED',
        anchorDistCm: 14,
        entryTimestampMs: nowMs,
        priorElapsedRealSec: snap.savedElapsedRealSec,
        elapsedRealSec: snap.savedElapsedRealSec,
        elapsedSimMins: simMins,
        accruedFeeRM: calculateParkingFee(simMins),
        isOverstaying:
          simMins > ENGINEERING_CONSTANTS.MAX_PARKING_LIMIT_MINS ||
          snap.isOverstaying,
      };
    }
    return base;
  });
}

/**
 * Recalculated electrical current & I2C pull-up budget for the 3-LCD, 9-LED, 3-HC-SR04 Uno R3 build.
 */
export function calculateElectricalBudget(params: {
  resistorOhms: number;
  activeLcdCount: number;
  lcdBacklightMa: number;
  activeLedsCount: number;
  buzzerOn: boolean;
  i2cBackpacksWithPullups: number;
}): ElectricalBudgetResult {
  const {
    resistorOhms,
    activeLcdCount,
    lcdBacklightMa,
    activeLedsCount,
    buzzerOn,
    i2cBackpacksWithPullups,
  } = params;

  const r = Math.max(100, resistorOhms);
  const ledCurrentRedYellowMa =
    ((ENGINEERING_CONSTANTS.VCC_VOLTS -
      ENGINEERING_CONSTANTS.LED_VF_RED_YELLOW) /
      r) *
    1000;
  const ledCurrentGreenMa =
    ((ENGINEERING_CONSTANTS.VCC_VOLTS - ENGINEERING_CONSTANTS.LED_VF_GREEN) /
      r) *
    1000;

  const allNineLedsMa = 6 * ledCurrentRedYellowMa + 3 * ledCurrentGreenMa;
  const clampedActiveLeds = Math.max(0, Math.min(9, activeLedsCount));
  const activeLedsMa = clampedActiveLeds * ledCurrentRedYellowMa;

  const mcuCoreMa = 15.0;
  const buzzerMa = buzzerOn ? 15.0 : 0.0;
  const parallelI2cPullupKOhm =
    i2cBackpacksWithPullups > 0 ? 4.7 / i2cBackpacksWithPullups : 4.7;
  const i2cSinkMa = ENGINEERING_CONSTANTS.VCC_VOLTS / parallelI2cPullupKOhm;

  const mcuTotalTypicalMa = mcuCoreMa + activeLedsMa + buzzerMa + i2cSinkMa;
  const mcuTotalWorstCaseMa = mcuCoreMa + allNineLedsMa + 15.0 + i2cSinkMa;

  // External 5V rail loads (do not pass through ATmega328P Vcc/GND pins)
  const sensorsRailTypicalMa = 19.0; // 1 firing (~15 mA) + 2 idle (~2 mA each) under TDM
  const sensorsRailWorstMa = 3 * 15.0; // Conservative datasheet steady sum = 45 mA
  const lcdsRailMa = activeLcdCount * lcdBacklightMa;

  const usbTotalTypicalMa = mcuTotalTypicalMa + sensorsRailTypicalMa + lcdsRailMa;
  const usbTotalWorstCaseMa =
    mcuTotalWorstCaseMa + sensorsRailWorstMa + activeLcdCount * Math.max(lcdBacklightMa, 30);

  return {
    ledCurrentRedYellowMa: Number(ledCurrentRedYellowMa.toFixed(2)),
    ledCurrentGreenMa: Number(ledCurrentGreenMa.toFixed(2)),
    allNineLedsMa: Number(allNineLedsMa.toFixed(1)),
    activeLedsMa: Number(activeLedsMa.toFixed(1)),
    mcuCoreMa,
    buzzerMa,
    i2cSinkMa: Number(i2cSinkMa.toFixed(2)),
    mcuTotalTypicalMa: Number(mcuTotalTypicalMa.toFixed(1)),
    mcuTotalWorstCaseMa: Number(mcuTotalWorstCaseMa.toFixed(1)),
    mcuWithinSpec: mcuTotalWorstCaseMa <= ENGINEERING_CONSTANTS.ATMEGA_MAX_VCC_MA,
    sensorsRailMa: sensorsRailWorstMa,
    lcdsRailMa: Number(lcdsRailMa.toFixed(1)),
    usbTotalTypicalMa: Number(usbTotalTypicalMa.toFixed(1)),
    usbTotalWorstCaseMa: Number(usbTotalWorstCaseMa.toFixed(1)),
    usbWithinSpec: usbTotalWorstCaseMa <= ENGINEERING_CONSTANTS.USB_POLY_MAX_MA,
    parallelI2cPullupKOhm: Number(parallelI2cPullupKOhm.toFixed(2)),
    pinCurrentWithinSpec:
      ledCurrentRedYellowMa <= ENGINEERING_CONSTANTS.ATMEGA_REC_PIN_MA,
  };
}
