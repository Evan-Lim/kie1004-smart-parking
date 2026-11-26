/**
 * Pure TypeScript simulation & engineering calculation engine for
 * KIE1004 Smart Multi-Space Parking System (v3.1 — 3x I2C LCDs, 5s Stationary Hold,
 * 3x Independent Passive Buzzers via Pin A3 Tone Bus + 2N2222 Buffer + PCF8574 0x24).
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
  BILLING_BLOCK_MINS: 30, // RM 1.00 per started 30-min block
  MAX_PARKING_LIMIT_MINS: 240, // >= 4 hours (240 sim min) overstay threshold
  RATE_PER_30MIN_RM: 1.0,
  SPEED_OF_SOUND_M_S: 343,
  VCC_VOLTS: 5.0,
  LED_VF_RED_YELLOW: 2.0,
  LED_VF_GREEN: 2.2,
  ATMEGA_MAX_VCC_MA: 200,
  ATMEGA_REC_PIN_MA: 20,
  PCF8574_MAX_PKG_MA: 80,
  NPN_2N2222_MAX_IC_MA: 600,
  USB_POLY_MAX_MA: 500,
  I2C_ADDRESSES: ['0x27', '0x26', '0x25'] as const,
  PCF8574_BUZZER_ADDRESS: '0x24' as const,
  PCF8574_BUZZER_PINS: ['P0', 'P1', 'P2'] as const,
  BUZZER_FREQ_DANGER_HZ: 2500,
  BUZZER_FREQ_OVERSTAY_HZ: 1800,
  BUZZER_FREQ_MIXED_HZ: 2000,
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

export type BayBuzzerMode = 'SILENT' | 'DANGER' | 'OVERSTAY';

export interface BayBuzzerState {
  bayIndex: number;
  bayNumber: number;
  pcfPin: 'P0' | 'P1' | 'P2';
  bitWeight: 1 | 2 | 4;
  mode: BayBuzzerMode;
  isAlerting: boolean; // True whenever Danger or Overstay condition is active
  isGateLow: boolean; // Active-LOW PCF8574 output pin (true = LOW = sounding right now)
  cadenceLabel: string;
}

export interface BuzzerBusStatus {
  pcf8574Address: '0x24';
  bays: BayBuzzerState[];
  anyAlerting: boolean;
  anySoundingNow: boolean;
  activeSoundingCount: number;
  dangerBayNumbers: number[];
  overstayBayNumbers: number[];
  carrierFreqHz: number; // 2500 (Danger-only), 1800 (Overstay-only), 2000 (Mixed), 0 (Idle)
  carrierModeLabel: string;
  byteMask: number; // 255 (0xFF all OFF) down to 248 (0xF8 all 3 ON)
  byteHex: string; // e.g. '0xFF', '0xFE', '0xF8'
  byteBinary: string; // e.g. '11111111'
}

export interface ElectricalBudgetResult {
  ledCurrentRedYellowMa: number;
  ledCurrentGreenMa: number;
  allNineLedsMa: number;
  activeLedsMa: number;
  mcuCoreMa: number;
  a3BaseDriveMa: number;
  i2cSinkMa: number;
  mcuTotalTypicalMa: number;
  mcuTotalWorstCaseMa: number;
  mcuWithinSpec: boolean;
  pcf8574SinkTypicalMa: number;
  pcf8574SinkWorstCaseMa: number;
  pcf8574WithinSpec: boolean;
  transistorLoadTypicalMa: number;
  transistorLoadWorstCaseMa: number;
  transistorWithinSpec: boolean;
  sensorsRailMa: number;
  lcdsRailMa: number;
  buzzerSubSystemTypicalMa: number;
  buzzerSubSystemWorstCaseMa: number;
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
 * Grace-First 30-Minute Ceiling Tariff Calculation:
 * Step 1: If duration <= 15 sim min -> RM 0.00
 * Step 2: billableMins = duration - 15
 * Step 3: billableBlocks = floor((billableMins + 29) / 30)
 * Step 4: fee = billableBlocks * RM 1.00
 */
export function calculateParkingFee(durationMins: number): number {
  if (durationMins <= ENGINEERING_CONSTANTS.FREE_PARKING_MINS) {
    return 0;
  }
  const billableMins = durationMins - ENGINEERING_CONSTANTS.FREE_PARKING_MINS;
  const billableBlocks = Math.floor(
    (billableMins + ENGINEERING_CONSTANTS.BILLING_BLOCK_MINS - 1) /
      ENGINEERING_CONSTANTS.BILLING_BLOCK_MINS
  );
  return billableBlocks * ENGINEERING_CONSTANTS.RATE_PER_30MIN_RM;
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
      next.elapsedSimMins >= ENGINEERING_CONSTANTS.MAX_PARKING_LIMIT_MINS;
    if (!wasOverstay && next.isOverstaying) {
      eventLog = `[ALARM] Bay ${next.id + 1} reached ${ENGINEERING_CONSTANTS.MAX_PARKING_LIMIT_MINS} sim min (4h) overstay limit! Bay ${next.id + 1} passive buzzer (0x24 P${next.id}) ON.`;
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
 * Evaluates a single bay's dedicated 5V Passive Piezo Buzzer gated by PCF8574 (0x24):
 * - Priority 1 (DANGER zone 2-5 cm): Rapid 150 ms ON / 150 ms OFF staccato warning synced with Red LED.
 * - Priority 2 (OVERSTAY >= 240 sim min / 4h): Steady 500 ms ON / 1000 ms OFF pulse synced with R/Y strobe.
 * - Otherwise: SILENT (PCF8574 pin stays HIGH / open).
 */
export function computeBayBuzzer(
  bay: ParkingBayState,
  nowMs: number
): BayBuzzerState {
  const pcfPin = ENGINEERING_CONSTANTS.PCF8574_BUZZER_PINS[bay.id] ?? 'P0';
  const bitWeight = ([1, 2, 4] as const)[bay.id] ?? 1;

  if (bay.zone === 'DANGER') {
    const isGateLow = Math.floor(nowMs / 150) % 2 === 0;
    return {
      bayIndex: bay.id,
      bayNumber: bay.id + 1,
      pcfPin,
      bitWeight,
      mode: 'DANGER',
      isAlerting: true,
      isGateLow,
      cadenceLabel: 'DANGER · 150ms rapid',
    };
  }

  if (bay.isOverstaying) {
    const isGateLow = nowMs % 1500 < 500;
    return {
      bayIndex: bay.id,
      bayNumber: bay.id + 1,
      pcfPin,
      bitWeight,
      mode: 'OVERSTAY',
      isAlerting: true,
      isGateLow,
      cadenceLabel: 'OVERSTAY · 500ms/1s',
    };
  }

  return {
    bayIndex: bay.id,
    bayNumber: bay.id + 1,
    pcfPin,
    bitWeight,
    mode: 'SILENT',
    isAlerting: false,
    isGateLow: false,
    cadenceLabel: 'SILENT',
  };
}

/**
 * Evaluates the complete 3-Bay Passive Buzzer Bus:
 * - Pin A3 drives a 2N2222 NPN emitter-follower tone bus at 2500 Hz (Danger-only),
 *   1800 Hz (Overstay-only), 2000 Hz (Mixed simultaneous Danger + Overstay), or 0 Hz (Idle).
 * - PCF8574 (0x24) sinks P0 (Bay 1), P1 (Bay 2), and P2 (Bay 3) active-LOW independently
 *   using beginner-friendly subtraction: mask = 255 - weight (0xFF = all OFF, 0xF8 = all 3 ON).
 */
export function computeBuzzerBus(
  bays: ParkingBayState[],
  nowMs: number
): BuzzerBusStatus {
  const bayBuzzers = bays.map((bay) => computeBayBuzzer(bay, nowMs));
  const dangerBayNumbers = bayBuzzers
    .filter((b) => b.mode === 'DANGER')
    .map((b) => b.bayNumber);
  const overstayBayNumbers = bayBuzzers
    .filter((b) => b.mode === 'OVERSTAY')
    .map((b) => b.bayNumber);

  let byteMask = 255;
  let activeSoundingCount = 0;
  for (const bz of bayBuzzers) {
    if (bz.isGateLow) {
      byteMask -= bz.bitWeight;
      activeSoundingCount += 1;
    }
  }

  const anyDanger = dangerBayNumbers.length > 0;
  const anyOverstay = overstayBayNumbers.length > 0;
  const anyAlerting = anyDanger || anyOverstay;
  const anySoundingNow = activeSoundingCount > 0;

  let carrierFreqHz = 0;
  let carrierModeLabel = 'Carrier Idle (noTone on A3)';
  if (anyDanger && anyOverstay) {
    carrierFreqHz = ENGINEERING_CONSTANTS.BUZZER_FREQ_MIXED_HZ;
    carrierModeLabel = `Mixed Carrier 2000 Hz (Danger B${dangerBayNumbers.join(',')} + Overstay B${overstayBayNumbers.join(',')})`;
  } else if (anyDanger) {
    carrierFreqHz = ENGINEERING_CONSTANTS.BUZZER_FREQ_DANGER_HZ;
    carrierModeLabel = `Danger Carrier 2500 Hz (Bay ${dangerBayNumbers.join(', ')} < 5 cm)`;
  } else if (anyOverstay) {
    carrierFreqHz = ENGINEERING_CONSTANTS.BUZZER_FREQ_OVERSTAY_HZ;
    carrierModeLabel = `Overstay Carrier 1800 Hz (Bay ${overstayBayNumbers.join(', ')} ≥ 240 min)`;
  }

  const byteHex = `0x${byteMask.toString(16).toUpperCase().padStart(2, '0')}`;
  const byteBinary = byteMask.toString(2).padStart(8, '0');

  return {
    pcf8574Address: ENGINEERING_CONSTANTS.PCF8574_BUZZER_ADDRESS,
    bays: bayBuzzers,
    anyAlerting,
    anySoundingNow,
    activeSoundingCount,
    dangerBayNumbers,
    overstayBayNumbers,
    carrierFreqHz,
    carrierModeLabel,
    byteMask,
    byteHex,
    byteBinary,
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
          simMins >= ENGINEERING_CONSTANTS.MAX_PARKING_LIMIT_MINS ||
          snap.isOverstaying,
      };
    }
    return base;
  });
}

/**
 * Recalculated electrical current, transistor/expander load, and I2C pull-up budget
 * for the 3-LCD, 9-LED, 3-HC-SR04, 3-Passive-Buzzer (A3 + 2N2222 + PCF8574 0x24) Uno R3 build.
 */
export function calculateElectricalBudget(params: {
  resistorOhms: number;
  activeLcdCount: number;
  lcdBacklightMa: number;
  activeLedsCount: number;
  activeBuzzerCount: number;
  i2cDevicesWithPullups: number;
}): ElectricalBudgetResult {
  const {
    resistorOhms,
    activeLcdCount,
    lcdBacklightMa,
    activeLedsCount,
    activeBuzzerCount,
    i2cDevicesWithPullups,
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

  const clampedActiveBuzzers = Math.max(0, Math.min(3, activeBuzzerCount));
  const mcuCoreMa = 15.0;
  // Pin A3 only drives the 2N2222 NPN Base through 1 kOhm (<= 1.0 mA when carrier active)
  const a3BaseDriveMa = clampedActiveBuzzers > 0 ? 1.0 : 0.0;
  const a3BaseDriveWorstMa = 1.0;

  const parallelI2cPullupKOhm =
    i2cDevicesWithPullups > 0 ? 4.7 / i2cDevicesWithPullups : 4.7;
  const i2cSinkMa = ENGINEERING_CONSTANTS.VCC_VOLTS / parallelI2cPullupKOhm;

  const mcuTotalTypicalMa = mcuCoreMa + activeLedsMa + a3BaseDriveMa + i2cSinkMa;
  const mcuTotalWorstCaseMa =
    mcuCoreMa + allNineLedsMa + a3BaseDriveWorstMa + i2cSinkMa;

  // PCF8574 (0x24) active-LOW current sink (15 mA per active passive buzzer, max 80 mA pkg)
  const pcf8574SinkTypicalMa = clampedActiveBuzzers * 15.0;
  const pcf8574SinkWorstCaseMa = 3 * 15.0; // 45.0 mA max

  // 2N2222 NPN emitter-follower load (buzzers + 1 kOhm emitter pull-down = 4.3 mA when active)
  const emitterPulldownMa = 4.3;
  const transistorLoadTypicalMa =
    clampedActiveBuzzers > 0 ? pcf8574SinkTypicalMa + emitterPulldownMa : 0.0;
  const transistorLoadWorstCaseMa = pcf8574SinkWorstCaseMa + emitterPulldownMa; // 49.3 mA

  // Total external buzzer subsystem draw from 5V rail (PCF8574 quiescent 1 mA + transistor load)
  const pcf8574QuiescentMa = 1.0;
  const buzzerSubSystemTypicalMa = pcf8574QuiescentMa + transistorLoadTypicalMa;
  const buzzerSubSystemWorstCaseMa = pcf8574QuiescentMa + transistorLoadWorstCaseMa; // 50.3 mA

  // External 5V rail loads (do not pass through ATmega328P Vcc/GND pins)
  const sensorsRailTypicalMa = 19.0; // 1 firing (~15 mA) + 2 idle (~2 mA each) under TDM
  const sensorsRailWorstMa = 3 * 15.0; // Conservative datasheet steady sum = 45.0 mA
  const lcdsRailMa = activeLcdCount * lcdBacklightMa;

  const usbTotalTypicalMa =
    mcuTotalTypicalMa +
    sensorsRailTypicalMa +
    lcdsRailMa +
    buzzerSubSystemTypicalMa;
  const usbTotalWorstCaseMa =
    mcuTotalWorstCaseMa +
    sensorsRailWorstMa +
    activeLcdCount * Math.max(lcdBacklightMa, 30) +
    buzzerSubSystemWorstCaseMa;

  return {
    ledCurrentRedYellowMa: Number(ledCurrentRedYellowMa.toFixed(2)),
    ledCurrentGreenMa: Number(ledCurrentGreenMa.toFixed(2)),
    allNineLedsMa: Number(allNineLedsMa.toFixed(1)),
    activeLedsMa: Number(activeLedsMa.toFixed(1)),
    mcuCoreMa,
    a3BaseDriveMa,
    i2cSinkMa: Number(i2cSinkMa.toFixed(2)),
    mcuTotalTypicalMa: Number(mcuTotalTypicalMa.toFixed(1)),
    mcuTotalWorstCaseMa: Number(mcuTotalWorstCaseMa.toFixed(1)),
    mcuWithinSpec: mcuTotalWorstCaseMa <= ENGINEERING_CONSTANTS.ATMEGA_MAX_VCC_MA,
    pcf8574SinkTypicalMa: Number(pcf8574SinkTypicalMa.toFixed(1)),
    pcf8574SinkWorstCaseMa: Number(pcf8574SinkWorstCaseMa.toFixed(1)),
    pcf8574WithinSpec:
      pcf8574SinkWorstCaseMa <= ENGINEERING_CONSTANTS.PCF8574_MAX_PKG_MA,
    transistorLoadTypicalMa: Number(transistorLoadTypicalMa.toFixed(1)),
    transistorLoadWorstCaseMa: Number(transistorLoadWorstCaseMa.toFixed(1)),
    transistorWithinSpec:
      transistorLoadWorstCaseMa <= ENGINEERING_CONSTANTS.NPN_2N2222_MAX_IC_MA,
    sensorsRailMa: sensorsRailWorstMa,
    lcdsRailMa: Number(lcdsRailMa.toFixed(1)),
    buzzerSubSystemTypicalMa: Number(buzzerSubSystemTypicalMa.toFixed(1)),
    buzzerSubSystemWorstCaseMa: Number(buzzerSubSystemWorstCaseMa.toFixed(1)),
    usbTotalTypicalMa: Number(usbTotalTypicalMa.toFixed(1)),
    usbTotalWorstCaseMa: Number(usbTotalWorstCaseMa.toFixed(1)),
    usbWithinSpec: usbTotalWorstCaseMa <= ENGINEERING_CONSTANTS.USB_POLY_MAX_MA,
    parallelI2cPullupKOhm: Number(parallelI2cPullupKOhm.toFixed(2)),
    pinCurrentWithinSpec:
      ledCurrentRedYellowMa <= ENGINEERING_CONSTANTS.ATMEGA_REC_PIN_MA,
  };
}
