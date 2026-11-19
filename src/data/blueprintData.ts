export interface PinMapping {
  id: string;
  arduinoPin: string;
  signalName: string;
  component: string;
  direction: string;
  group: 'uart' | 'ultrasonic' | 'leds' | 'buzzer' | 'i2c';
  bay?: number;
  currentNote: string;
  datasheetNote: string;
}

export interface BomItem {
  id: string;
  component: string;
  qty: string;
  defaultQty: number;
  unitPriceRM: number;
  unitLabel: string;
  activeCostRM: number;
  spareCostRM: number;
  totalCostRM: number;
  changeNote: string;
  isChanged: boolean;
  datasheetSpecs: string;
  trapAvoidance: string;
}

export interface EngineeringAssumption {
  parameter: string;
  oldValue: string;
  newValue: string;
  justification: string;
  changed: boolean;
}

export interface ConflictItem {
  id: string;
  conflict: string;
  bottleneck: string;
  resolution: string;
}

export interface TeamRole {
  member: string;
  title: string;
  responsibilities: string;
}

export interface QaTestItem {
  id: string;
  tester: string;
  title: string;
  expectedResult: string;
  notes: string;
}

export interface SlideBlueprint {
  number: number;
  title: string;
  presenter: string;
  rubricTag: string;
  visuals: string;
  script: string;
}

export interface DefenseFaqItem {
  id: string;
  question: string;
  category: 'Hardware & I2C' | '5s Stationary FSM' | 'Scheduler & Firmware' | 'Power & Tariff';
  answer: string;
  isNewV3?: boolean;
}

export const REVISION_DELTA_SUMMARY = [
  {
    dimension: 'Per-Bay LCD Displays',
    v2Original: '1× shared 16×2 I2C LCD (0x27)',
    v3Updated: '3× dedicated 16×2 I2C LCDs (0x27, 0x26, 0x25)',
    impact: '0 extra MCU pins via PCF8574 A0/A1 jumper bridges; staggered 200 ms dirty-checked updates.',
  },
  {
    dimension: 'Count-Up Start Trigger',
    v2Original: '3.0 s presence debounce (backdated)',
    v3Updated: '5.0 s stationary stop (in slot AND |Δd| ≤ 1 cm)',
    impact: 'Count-up starts cleanly at 00:00 only after vehicle stops moving for 5.0 continuous seconds.',
  },
  {
    dimension: 'Buzzer Activation Rule',
    v2Original: '3-tier audio (Danger > Overstay > Caution)',
    v3Updated: 'Dedicated Overstay Alarm (> 180 sim min)',
    impact: 'Per-bay 3 LEDs handle distance; buzzer on A3 sounds bay-coded cadence strictly on time-limit violation.',
  },
  {
    dimension: 'Power & Decoupling Budget',
    v2Original: '~167 mA total; 1× 100 µF cap',
    v3Updated: '154.5 mA typ / 248.2 mA max USB; 2× 100 µF + 2× 0.1 µF',
    impact: 'ATmega328P MCU stays ≤ 113.2 mA (< 200 mA limit); USB 5V bus stays < 500 mA polyfuse limit.',
  },
  {
    dimension: 'Total Procurement Cost',
    v2Original: 'RM 46.50 active / RM 52.50 w/ spares',
    v3Updated: 'RM 63.50 active / RM 69.70 w/ spares',
    impact: '≈ RM 13.94 per student across 5 members (+RM 17.20 total for +2 LCDs, caps & extra M-F jumpers).',
  },
];

export const PIN_ALLOCATION_TABLE: PinMapping[] = [
  {
    id: 'uart',
    arduinoPin: 'D0 (RX), D1 (TX)',
    signalName: 'UART_SERIAL',
    component: 'PC USB Serial Monitor (9600 baud Dashboard, Commands & Receipts)',
    direction: 'Hardware UART',
    group: 'uart',
    currentNote: 'On-board USB-UART bridge (CH340 / ATmega16U2)',
    datasheetNote: 'Avoid external loads on D0/D1 to preserve reliable sketch upload and live Serial commands (S, T, D, R1-R3).',
  },
  {
    id: 'trig1',
    arduinoPin: 'D2',
    signalName: 'TRIG_1',
    component: 'Bay 1 HC-SR04 Ultrasonic Trigger Pin',
    direction: 'OUTPUT',
    group: 'ultrasonic',
    bay: 1,
    currentNote: '< 1 mA CMOS logic pulse (10 µs HIGH)',
    datasheetNote: 'HC-SR04 requires ≥ 10 µs TTL trigger pulse; fired at t = 0 ms in 40 ms TDM cycle.',
  },
  {
    id: 'echo1',
    arduinoPin: 'D3',
    signalName: 'ECHO_1',
    component: 'Bay 1 HC-SR04 Ultrasonic Echo Pin',
    direction: 'INPUT',
    group: 'ultrasonic',
    bay: 1,
    currentNote: 'High-impedance CMOS input',
    datasheetNote: 'Read via pulseIn(D3, HIGH, 15000UL). Safe alongside tone() since only digitalRead/pulseIn is used (no PWM).',
  },
  {
    id: 'trig2',
    arduinoPin: 'D4',
    signalName: 'TRIG_2',
    component: 'Bay 2 HC-SR04 Ultrasonic Trigger Pin',
    direction: 'OUTPUT',
    group: 'ultrasonic',
    bay: 2,
    currentNote: '< 1 mA CMOS logic pulse (10 µs HIGH)',
    datasheetNote: 'Fired at t = 40 ms in TDM schedule to eliminate 40 kHz acoustic cross-talk with Bay 1 & Bay 3.',
  },
  {
    id: 'echo2',
    arduinoPin: 'D5',
    signalName: 'ECHO_2',
    component: 'Bay 2 HC-SR04 Ultrasonic Echo Pin',
    direction: 'INPUT',
    group: 'ultrasonic',
    bay: 2,
    currentNote: 'High-impedance CMOS input',
    datasheetNote: 'Bounded 15,000 µs timeout (~257 cm max) prevents 1-second CPU lockup when bay is open.',
  },
  {
    id: 'trig3',
    arduinoPin: 'D6',
    signalName: 'TRIG_3',
    component: 'Bay 3 HC-SR04 Ultrasonic Trigger Pin',
    direction: 'OUTPUT',
    group: 'ultrasonic',
    bay: 3,
    currentNote: '< 1 mA CMOS logic pulse (10 µs HIGH)',
    datasheetNote: 'Fired at t = 80 ms in TDM schedule; full 3-bay scan completes in 120 ms (8.33 Hz per bay).',
  },
  {
    id: 'echo3',
    arduinoPin: 'D7',
    signalName: 'ECHO_3',
    component: 'Bay 3 HC-SR04 Ultrasonic Echo Pin',
    direction: 'INPUT',
    group: 'ultrasonic',
    bay: 3,
    currentNote: 'High-impedance CMOS input',
    datasheetNote: 'Paired with Bay 3 HC-SR04; spare 4th HC-SR04 kept in kit for rapid swap.',
  },
  {
    id: 'led_g1',
    arduinoPin: 'D8',
    signalName: 'LED_G1',
    component: 'Bay 1 Green LED (above Bay 1 sensor, via 330 Ω)',
    direction: 'OUTPUT',
    group: 'leds',
    bay: 1,
    currentNote: '8.48 mA ((5.0V - 2.2V) / 330 Ω)',
    datasheetNote: 'Diffused 5 mm Green LED; ON solid for AVAILABLE (>20 cm) or SAFE (11–20 cm).',
  },
  {
    id: 'led_y1',
    arduinoPin: 'D9',
    signalName: 'LED_Y1',
    component: 'Bay 1 Yellow LED (above Bay 1 sensor, via 330 Ω)',
    direction: 'OUTPUT',
    group: 'leds',
    bay: 1,
    currentNote: '9.09 mA ((5.0V - 2.0V) / 330 Ω)',
    datasheetNote: 'ON solid for CAUTION (6–10 cm); alternates with Red LED during OVERSTAY (>180 sim min).',
  },
  {
    id: 'led_r1',
    arduinoPin: 'D10',
    signalName: 'LED_R1',
    component: 'Bay 1 Red LED (above Bay 1 sensor, via 330 Ω)',
    direction: 'OUTPUT',
    group: 'leds',
    bay: 1,
    currentNote: '9.09 mA ((5.0V - 2.0V) / 330 Ω)',
    datasheetNote: 'Fast-flashes (150 ms) in DANGER (2–5 cm); strobes with Yellow on OVERSTAY.',
  },
  {
    id: 'led_g2',
    arduinoPin: 'D11',
    signalName: 'LED_G2',
    component: 'Bay 2 Green LED (above Bay 2 sensor, via 330 Ω)',
    direction: 'OUTPUT',
    group: 'leds',
    bay: 2,
    currentNote: '8.48 mA ((5.0V - 2.2V) / 330 Ω)',
    datasheetNote: 'Digital HIGH/LOW only (no PWM), so Timer 2 usage by tone() causes zero conflict on D11.',
  },
  {
    id: 'led_y2',
    arduinoPin: 'D12',
    signalName: 'LED_Y2',
    component: 'Bay 2 Yellow LED (above Bay 2 sensor, via 330 Ω)',
    direction: 'OUTPUT',
    group: 'leds',
    bay: 2,
    currentNote: '9.09 mA ((5.0V - 2.0V) / 330 Ω)',
    datasheetNote: 'Mounted cleanly above Bay 2 sensor and below Bay 2 I2C LCD (0x26).',
  },
  {
    id: 'led_r2',
    arduinoPin: 'D13',
    signalName: 'LED_R2',
    component: 'Bay 2 Red LED (above Bay 2 sensor, via 330 Ω)',
    direction: 'OUTPUT',
    group: 'leds',
    bay: 2,
    currentNote: '9.09 mA ((5.0V - 2.0V) / 330 Ω)',
    datasheetNote: 'Note: D13 drives Uno onboard L-LED via op-amp buffer (negligible load); blinks briefly during bootloader reset.',
  },
  {
    id: 'led_g3',
    arduinoPin: 'A0 (D14)',
    signalName: 'LED_G3',
    component: 'Bay 3 Green LED (above Bay 3 sensor, via 330 Ω)',
    direction: 'OUTPUT',
    group: 'leds',
    bay: 3,
    currentNote: '8.48 mA via PORTC PC0',
    datasheetNote: 'ATmega328P PORTC pins A0–A3 are full digital CMOS I/O pins with identical 20 mA recommended drive.',
  },
  {
    id: 'led_y3',
    arduinoPin: 'A1 (D15)',
    signalName: 'LED_Y3',
    component: 'Bay 3 Yellow LED (above Bay 3 sensor, via 330 Ω)',
    direction: 'OUTPUT',
    group: 'leds',
    bay: 3,
    currentNote: '9.09 mA via PORTC PC1',
    datasheetNote: 'Mounted above Bay 3 sensor and below Bay 3 I2C LCD (0x25).',
  },
  {
    id: 'led_r3',
    arduinoPin: 'A2 (D16)',
    signalName: 'LED_R3',
    component: 'Bay 3 Red LED (above Bay 3 sensor, via 330 Ω)',
    direction: 'OUTPUT',
    group: 'leds',
    bay: 3,
    currentNote: '9.09 mA via PORTC PC2',
    datasheetNote: 'Completes the 9-LED array while keeping total MCU GPIO load safely below 200 mA.',
  },
  {
    id: 'buzzer',
    arduinoPin: 'A3 (D17)',
    signalName: 'BUZZER_PIN',
    component: '5V Passive Piezo Overstay Buzzer (+ Terminal)',
    direction: 'OUTPUT (tone)',
    group: 'buzzer',
    currentNote: '≤ 15 mA square-wave drive via Timer 2',
    datasheetNote: 'Sounds strictly when any bay exceeds 180 sim min limit (bay-coded 1/2/3-pulse cadence @ 2000 Hz).',
  },
  {
    id: 'i2c_sda',
    arduinoPin: 'A4 (SDA)',
    signalName: 'I2C_SDA',
    component: 'Shared I2C Data Bus → 3× 16×2 LCDs (0x27, 0x26, 0x25)',
    direction: 'Hardware I2C',
    group: 'i2c',
    currentNote: '3.19 mA max sink (3× 4.7 kΩ in parallel = 1.57 kΩ)',
    datasheetNote: 'Connects in parallel to Bay 1 (0x27, open), Bay 2 (0x26, bridge A0), and Bay 3 (0x25, bridge A1) LCD backpacks.',
  },
  {
    id: 'i2c_scl',
    arduinoPin: 'A5 (SCL)',
    signalName: 'I2C_SCL',
    component: 'Shared I2C Clock Bus → 3× 16×2 LCDs (100 kHz)',
    direction: 'Hardware I2C',
    group: 'i2c',
    currentNote: '3.19 mA max sink (100 kHz standard mode)',
    datasheetNote: 'Optional: also hosts a 4th PCF8574 (0x24) if upgrading to 3 physically separate per-bay buzzers.',
  },
];

export const BOM_ITEMS: BomItem[] = [
  {
    id: 'uno',
    component: 'Arduino Uno R3 (ATmega328P + USB Data Cable)',
    qty: '1',
    defaultQty: 1,
    unitPriceRM: 18.0,
    unitLabel: 'board',
    activeCostRM: 18.0,
    spareCostRM: 0,
    totalCostRM: 18.0,
    changeNote: 'Unchanged (20/20 pins utilized)',
    isChanged: false,
    datasheetSpecs: 'VCC=5V, 16 MHz, 32 KB Flash, 2 KB SRAM, 1 KB EEPROM, Max VCC/GND=200 mA, USB Polyfuse=500 mA.',
    trapAvoidance: 'Verify USB-A to USB-B (or Type-C) cable carries data lines; install CH341SER driver on Day 1.',
  },
  {
    id: 'hcsr04',
    component: 'HC-SR04 Ultrasonic Distance Sensor (3 active + 1 spare)',
    qty: '4',
    defaultQty: 4,
    unitPriceRM: 3.0,
    unitLabel: 'pcs',
    activeCostRM: 9.0,
    spareCostRM: 3.0,
    totalCostRM: 12.0,
    changeNote: 'Unchanged (3+1 total)',
    isChanged: false,
    datasheetSpecs: 'VCC=5V, 15 mA burst / 2 mA idle, 40 kHz, 2–400 cm range, 15° cone, ±3 mm resolution, ≥10 µs trigger.',
    trapAvoidance: 'Verify 4 pins (VCC, Trig, Echo, GND) and 5V rating. Keep 4th sensor as immediate swap spare.',
  },
  {
    id: 'lcds',
    component: '16×2 LCD Display with Pre-Soldered PCF8574 I2C Backpack',
    qty: '3',
    defaultQty: 3,
    unitPriceRM: 7.5,
    unitLabel: 'pcs',
    activeCostRM: 22.5,
    spareCostRM: 0,
    totalCostRM: 22.5,
    changeNote: 'Upgraded: 1 → 3 LCDs (+RM 15.00)',
    isChanged: true,
    datasheetSpecs: 'VCC=5V, ~25 mA typ (30 mA max w/ backlight) each → 75–90 mA total on 5V rail. Addresses: 0x27, 0x26, 0x25.',
    trapAvoidance: 'Check product photos: PCF8574 backpack MUST be pre-soldered AND expose A0/A1/A2 solder-bridge pads.',
  },
  {
    id: 'leds',
    component: '5mm Diffused LEDs (3× Green, 3× Yellow, 3× Red + 6 spares)',
    qty: '9 active (15 pack)',
    defaultQty: 15,
    unitPriceRM: 0.12,
    unitLabel: 'pcs',
    activeCostRM: 1.8,
    spareCostRM: 0,
    totalCostRM: 1.8,
    changeNote: 'Unchanged (9 active + 6 spares)',
    isChanged: false,
    datasheetSpecs: 'Red/Yellow VF ≈ 2.0V, Green VF ≈ 2.2V. Max continuous IF = 20 mA; driven at 8.5–9.1 mA via 330 Ω.',
    trapAvoidance: 'Buy diffused colored lenses (not water-clear) so bay distance colors read clearly from across the lab.',
  },
  {
    id: 'res330',
    component: '330 Ω Carbon/Metal Film Resistors (1/4 W)',
    qty: '10 (9 + 1 spare)',
    defaultQty: 10,
    unitPriceRM: 0.1,
    unitLabel: 'pcs',
    activeCostRM: 1.0,
    spareCostRM: 0,
    totalCostRM: 1.0,
    changeNote: 'Unchanged',
    isChanged: false,
    datasheetSpecs: 'Limits LED current to 9.09 mA (R/Y) and 8.48 mA (G), keeping all-9-LED worst case at 80.0 mA.',
    trapAvoidance: '4-band color code: Orange–Orange–Brown–Gold. (5-band: Orange–Orange–Black–Black–Brown.)',
  },
  {
    id: 'caps',
    component: 'Decoupling Capacitors (2× 100 µF ≥10V Electrolytic + 2× 0.1 µF Ceramic)',
    qty: '4',
    defaultQty: 4,
    unitPriceRM: 0.3,
    unitLabel: 'pcs',
    activeCostRM: 1.2,
    spareCostRM: 0,
    totalCostRM: 1.2,
    changeNote: 'Upgraded: 1 → 4 caps (+RM 0.70)',
    isChanged: true,
    datasheetSpecs: 'Dual bulk + high-frequency rail stabilization: 1 pair near 3× HC-SR04s, 1 pair near 3× I2C LCD headers.',
    trapAvoidance: 'Electrolytic caps are polarized: striped shorter (−) leg to GND, longer (+) leg to +5V rail.',
  },
  {
    id: 'pullups',
    component: '4.7 kΩ Spare I2C Pull-Up Resistors (1/4 W)',
    qty: '2',
    defaultQty: 2,
    unitPriceRM: 0.1,
    unitLabel: 'pcs',
    activeCostRM: 0,
    spareCostRM: 0.2,
    totalCostRM: 0.2,
    changeNote: 'Unchanged (spare)',
    isChanged: false,
    datasheetSpecs: 'Only installed if low-cost PCF8574 backpacks omit onboard pull-ups; otherwise 3 onboard 4.7 kΩ yield 1.57 kΩ.',
    trapAvoidance: 'Yellow–Violet–Red–Gold. Do not add extra pull-ups if all 3 backpacks already have onboard 4.7 kΩ.',
  },
  {
    id: 'buzzer',
    component: '5V Passive Piezo Buzzer (Overstay Alarm)',
    qty: '1',
    defaultQty: 1,
    unitPriceRM: 1.5,
    unitLabel: 'pcs',
    activeCostRM: 1.5,
    spareCostRM: 0,
    totalCostRM: 1.5,
    changeNote: 'Role refined: Overstay-only',
    isChanged: true,
    datasheetSpecs: 'Driven via tone(A3, 2000) square wave; current < 15 mA. Optional 3-buzzer PCF8574 expansion: +RM 5.50.',
    trapAvoidance: 'Flip upside down: passive buzzers show an exposed green PCB underneath (never buy black-epoxy active type for tone()).',
  },
  {
    id: 'breadboard',
    component: '830-Point Breadboard + 2× M-M & 3× M-F Jumper Packs (incl. spares)',
    qty: '1 bundle',
    defaultQty: 1,
    unitPriceRM: 11.5,
    unitLabel: 'bundle',
    activeCostRM: 8.5,
    spareCostRM: 3.0,
    totalCostRM: 11.5,
    changeNote: 'Upgraded: +1 M-F pack (+RM 1.50)',
    isChanged: true,
    datasheetSpecs: '3× HC-SR04 (12 M-F) + 3× I2C LCDs (12 M-F) = 24 active M-F wires + 18 M-M wires + full spare pack.',
    trapAvoidance: 'Must buy 830-point board (not 400-point) and 30 cm M-F ribbons so all 3 elevated LCDs reach cleanly.',
  },
];

export const ENGINEERING_ASSUMPTIONS: EngineeringAssumption[] = [
  {
    parameter: 'Physical Scale Factor',
    oldValue: '1 : 20 Scale Model (1 cm = 20 cm)',
    newValue: '1 : 20 Scale Model (1 cm = 20 cm)',
    justification: 'HC-SR04 minimum detection distance is 2 cm. Scaling 1:20 maps a 20 cm tabletop bay to a 4.0 m real-world bay.',
    changed: false,
  },
  {
    parameter: 'Distance Zones (Per-Bay LEDs)',
    oldValue: 'DANGER 2–5 | CAUTION 6–10 | SAFE 11–20 | EMPTY >20 cm',
    newValue: 'DANGER 2–5 | CAUTION 6–10 | SAFE 11–20 | EMPTY >20 cm',
    justification: 'At 1:20 scale, DANGER is ≤1.0 m from the back wall (Red flash), CAUTION is 1.2–2.0 m (Yellow solid), SAFE is 2.2–4.0 m (Green solid).',
    changed: false,
  },
  {
    parameter: 'Stationary Entry Confirmation',
    oldValue: '3.0 s continuous presence (backdated timer)',
    newValue: '5.0 s continuous presence AND stationary (|Δd| ≤ 1 cm)',
    justification: 'Car must be inside slot (≤20 cm) and motionless for 5.0 real seconds before count-up starts at 00:00. ±1 cm deadband absorbs HC-SR04 ±3 mm / integer-division LSB jitter.',
    changed: true,
  },
  {
    parameter: 'Exit Confirmation Debounce',
    oldValue: '3.0 s absence (billing runs during window)',
    newValue: '3.0 s absence (billing runs during window)',
    justification: 'Prevents a single dropped echo off curved toy-car plastic from prematurely terminating a session or printing a false receipt.',
    changed: false,
  },
  {
    parameter: 'Per-Bay I2C LCD Addressing',
    oldValue: '1 shared LCD at 0x27 (alternating focus bay)',
    newValue: '3 dedicated LCDs: Bay 1 = 0x27, Bay 2 = 0x26, Bay 3 = 0x25',
    justification: 'Bridging pad A0 on LCD 2 and pad A1 on LCD 3 assigns unique 7-bit PCF8574 addresses on the same A4/A5 bus with zero extra MCU pins.',
    changed: true,
  },
  {
    parameter: 'Buzzer Alarm Policy',
    oldValue: 'DANGER (2500 Hz) > OVERSTAY (1800 Hz) > CAUTION (1000 Hz)',
    newValue: 'Overstay-Only Alarm (> 180 sim min), bay-coded @ 2000 Hz',
    justification: '3 per-bay LEDs handle real-time distance guidance; buzzer sounds strictly when a vehicle exceeds the time limit, pulsing 1×, 2×, or 3× for Bay 1, 2, or 3.',
    changed: true,
  },
  {
    parameter: 'Time Compression & Tariff',
    oldValue: '60× (1s = 1 sim min), 15m free, RM 3/hr ceiling, 180m limit',
    newValue: '60× (1s = 1 sim min), 15m free, RM 3/hr ceiling, 180m limit',
    justification: 'Subtract 15 min free grace FIRST, then apply ceiling (billableMins + 59) / 60. Runtime toggleable 60× ↔ 1× via Serial command T.',
    changed: false,
  },
];

export const CONFLICTING_REQUIREMENTS: ConflictItem[] = [
  {
    id: 'c1',
    conflict: '3 Dedicated Per-Bay LCDs vs. 20-Pin Uno R3 Exhaustion',
    bottleneck: 'Three parallel 16×2 LCDs require 18 GPIO pins alone, leaving zero pins for 3 ultrasonic sensors, 9 LEDs, and buzzer.',
    resolution: 'Daisy-chain all 3 PCF8574 I2C LCDs onto shared A4/A5 using hardware solder pads (0x27, 0x26, 0x25) — 18 pins compressed into 2 pins at RM 0 extra silicon.',
  },
  {
    id: 'c2',
    conflict: 'Triple-LCD Refresh Latency vs. 40 ms Ultrasonic TDM Schedule',
    bottleneck: 'Refreshing all 3 I2C LCDs with lcd.clear() in one loop tick blocks the 100 kHz I2C bus for ~100–120 ms, breaking the 40 ms sensor cadence.',
    resolution: 'Staggered Round-Robin LCD refresh (1 bay every 200 ms) + 16-char line diffing (skip unchanged lines) + zero lcd.clear() calls keeps each I2C slot ≤ 18 ms.',
  },
  {
    id: 'c3',
    conflict: 'Strict 5-Second Stationary Detection vs. HC-SR04 ±1 cm Sensor Jitter',
    bottleneck: 'Integer division (durationUs / 58) causes a motionless car to toggle between e.g. 8 cm and 9 cm; exact equality (d == prev) would reset the 5 s hold endlessly.',
    resolution: '70/30 integer EMA filter paired with a ±1 cm anchor deadband (|filteredDist - anchorDist| ≤ 1 cm) ignores LSB jitter while immediately resetting on genuine car motion.',
  },
  {
    id: 'c4',
    conflict: 'Fast Multi-Bay Sensor Polling vs. 40 kHz Acoustic Cross-Talk',
    bottleneck: '40 kHz ultrasonic bursts reverberate inside tabletop dividers for ~25–30 ms; simultaneous firing causes phantom echoes across adjacent bays.',
    resolution: '40 ms Time-Division Multiplexed (TDM) staggered polling (Bay 1 → 0 ms, Bay 2 → 40 ms, Bay 3 → 80 ms) + 15 ms pulseIn() cap + felt-lined divider walls.',
  },
  {
    id: 'c5',
    conflict: '3 Parallel I2C Backpacks vs. I2C Bus Sink Current & Rail Brownouts',
    bottleneck: '3× backlit LCDs add ~75–90 mA on the 5V rail, and 3× onboard 4.7 kΩ pull-ups lower bus pull-up impedance to 1.57 kΩ (~3.19 mA sink).',
    resolution: 'Verify 248.2 mA worst-case < 500 mA USB polyfuse, add dual 100 µF + 0.1 µF decoupling pairs, and document optional pull-up removal on 2 backpacks.',
  },
];

export const TEAM_ROLES: TeamRole[] = [
  {
    member: 'Member 1',
    title: 'System Architect, Scheduler & Git Lead',
    responsibilities: 'Designs the cooperative Round-Robin scheduler (40 ms TDM + 200 ms staggered 3-LCD refresh), 1D parallel bay arrays (W09), pointer summary functions (W13), and system flowcharts.',
  },
  {
    member: 'Member 2',
    title: 'Sensor, Signal Processing & Stationary FSM Lead',
    responsibilities: 'Implements HC-SR04 TDM polling, 15 ms pulseIn() cap, 2D history matrix + W11 Insertion Sort median filter, 70/30 smoothing, and the 5.0-second ±1 cm stationary stop rule.',
  },
  {
    member: 'Member 3',
    title: 'Billing, Count-Up Timer & Overstay Engine Lead',
    responsibilities: 'Codes clean 00:00 count-up start post-settle, Grace-First Ceiling tariff math, 3 s exit debounce continuity, and Serial exit receipts.',
  },
  {
    member: 'Member 4',
    title: 'Hardware, 3-LCD I2C Bus & Electrical Lead',
    responsibilities: 'Solders A0/A1 PCF8574 address pads (0x27/0x26/0x25), verifies 200 mA MCU & 500 mA USB budgets, installs dual 100 µF caps, and builds the 3-bay model.',
  },
  {
    member: 'Member 5',
    title: 'HMI (3× LCD + 9 LEDs + Overstay Buzzer) & QA Lead',
    responsibilities: 'Builds dirty-checked 16×2 LCD formatters, independent per-bay LED driver, bay-coded overstay buzzer on A3, and executes the 10-point QA suite.',
  },
];

export const QA_TEST_SUITE: QaTestItem[] = [
  {
    id: 'T01',
    tester: 'Member 4',
    title: 'Multi-Device I2C Address Scan',
    expectedResult: 'I2C scanner prints exactly 3 addresses: 0x25, 0x26, and 0x27 without bus hang.',
    notes: 'Confirms A0 (Bay 2) and A1 (Bay 3) solder bridges before full firmware upload.',
  },
  {
    id: 'T02',
    tester: 'Member 5',
    title: 'Empty Baseline State (All 3 Bays)',
    expectedResult: 'All 9 LEDs show Green solid; all 3 LCDs show AVAILABLE & T:00:00; buzzer silent.',
    notes: 'Verify contrast screw tuned crisply on all 3 backlit LCDs.',
  },
  {
    id: 'T03',
    tester: 'Member 2',
    title: '5-Second Stationary Hold & Motion Reset',
    expectedResult: 'Car enters at 16 cm → LCD counts STOP 5s..3s; moving car to 9 cm resets countdown back to 5s.',
    notes: 'Proves count-up does NOT begin while driver is still maneuvering.',
  },
  {
    id: 'T04',
    tester: 'Member 2',
    title: '±1 cm Jitter Immunity & 00:00 Start',
    expectedResult: 'Holding car motionless for 5.0 s (despite ±1 cm LSB noise) transitions to OCCUPIED with count-up starting cleanly at 00:00.',
    notes: 'Validates EMA filter + STATIONARY_TOLERANCE_CM = 1.',
  },
  {
    id: 'T05',
    tester: 'Member 5',
    title: 'Per-Bay Distance LEDs vs. Silent Buzzer',
    expectedResult: 'Bay 1 at 4 cm flashes Red LED, Bay 2 at 8 cm lights Yellow LED, Bay 3 at 15 cm lights Green LED; buzzer remains SILENT (not overstay).',
    notes: 'Verifies updated spec: LEDs show distance, buzzer reserved strictly for time limit.',
  },
  {
    id: 'T06',
    tester: 'Member 3',
    title: 'Grace Period, Hourly Ceiling & Overstay Buzzer',
    expectedResult: 'At 60× scale: 15 s = RM 0; 16 s = RM 3; 76 s = RM 6; >180 s = LCD shows OVERSTAY!, R/Y LEDs strobe, buzzer emits bay-coded 2000 Hz alarm.',
    notes: 'Test Bay 1 (1× pulse) and Bay 2 (2× pulse) overstay cadence.',
  },
  {
    id: 'T07',
    tester: 'Member 3',
    title: 'Exit Debounce & Itemized Serial Receipt',
    expectedResult: 'Removing car for 1.5 s then returning preserves timer; removing for ≥3.0 s prints receipt and clears that bay’s LCD to AVAILABLE.',
    notes: 'Confirm adjacent bays’ LCDs and timers are completely unaffected.',
  },
  {
    id: 'T08',
    tester: 'Member 1',
    title: 'W11 Insertion Sort Spike Filter & Linear Search Check',
    expectedResult: 'Brief hand-wave spike (e.g., 98 cm between 14 cm samples) is rejected by insertionSort() median; Serial S prints accurate Linear Search next open bay.',
    notes: 'Confirms Week 11 algorithms and Week 13 pointer lot counters work under noisy echoes.',
  },
  {
    id: 'T09',
    tester: 'Member 4',
    title: '5V Rail Stability Under Peak Load',
    expectedResult: 'All 3 LCD backlights ON + 3 active bays + overstay buzzer active → zero brownout resets, crisp LCD contrast, Vcc ≥ 4.75 V.',
    notes: 'Validates dual 100 µF + 0.1 µF rail decoupling capacitors.',
  },
  {
    id: 'T10',
    tester: 'Member 1',
    title: '30-Minute Soak & SRAM Headroom Check',
    expectedResult: 'Compile SRAM < 45% (< 70% limit); 30-min continuous run with zero lockups, zero LCD corruption, accurate timing.',
    notes: 'Archive Serial log and compile output in /test-logs.',
  },
];

export const SLIDE_DECK_BLUEPRINT: SlideBlueprint[] = [
  {
    number: 1,
    title: 'Title, System Overview & 5-Member Task Matrix',
    presenter: 'Member 1',
    rubricTag: 'Req 7 · Overview',
    visuals: 'Project Title (v3.0 Architecture), 5-Member Task Table, and Upgraded Block Diagram showing 3 dedicated I2C LCDs (0x27, 0x26, 0x25) + 9 LEDs + 3 HC-SR04s + Overstay Buzzer.',
    script: 'Good morning Dr. We present our upgraded Smart Multi-Space Parking System on an Arduino Uno R3. Every slot features its own ultrasonic sensor, 3 overhead distance LEDs, a dedicated 16×2 I2C count-up LCD, and an automated overstay alarm triggered after a strict 5-second stationary stop.',
  },
  {
    number: 2,
    title: 'Detailed 20-Pin Circuit Schematic & Triple-LCD I2C Bus',
    presenter: 'Member 4',
    rubricTag: 'Req 1 & 9 · Mandatory',
    visuals: 'Complete 20-Pin Schematic (all 20 Uno pins utilized), PCF8574 A0/A1 solder-bridge address map (0x27/0x26/0x25), Ohm’s Law 330 Ω proof, and split MCU (113.2 mA < 200 mA) vs USB 5V rail (248.2 mA < 500 mA) current budgets.',
    script: 'By assigning unique I2C addresses (0x27, 0x26, 0x25) via PCF8574 A0 and A1 solder bridges, we drive three independent 16×2 LCDs over just two pins (A4/A5), preserving 100% Uno pin utilization without extra shift registers. Dual 100 µF decoupling caps stabilize the 3 backlit displays and ultrasonic bursts.',
  },
  {
    number: 3,
    title: 'Engineering Assumptions, Tariff Math & Conflicting Requirements',
    presenter: 'Member 4',
    rubricTag: 'Req 10 & WP2',
    visuals: 'Updated Assumptions Table (1:20 scale, 5.0 s ±1 cm stationary trigger, 60× toggleable clock), Grace-First Ceiling equations, and the 5-row Conflicting Requirements Resolution Matrix.',
    script: 'To prevent premature billing while a driver is still reversing into a bay, our system requires continuous presence AND stationary distance within ±1 cm for 5 full seconds before the count-up starts at 00:00. Our tariff subtracts the 15-minute grace window first before ceiling division.',
  },
  {
    number: 4,
    title: 'Cooperative Round-Robin Scheduler & Staggered I2C Refresh',
    presenter: 'Member 1',
    rubricTag: 'Req 2 · Mandatory',
    visuals: 'Scheduler Flowchart + Dual-Timeline Timing Diagram: 40 ms TDM ultrasonic polling (15 ms bounded pulseIn cap) interleaved with 200 ms single-LCD dirty-checked refreshes (zero lcd.clear()).',
    script: 'Refreshing three I2C LCDs back-to-back would stall the CPU for over 100 ms. Instead, our cooperative millis() scheduler updates only one LCD per 200 ms slot and skips unchanged lines via string diffing—keeping every bay’s ultrasonic scan cleanly staggered at 40 ms.',
  },
  {
    number: 5,
    title: '5-Second Stationary Occupancy FSM & 70/30 EMA Filtering',
    presenter: 'Member 2',
    rubricTag: 'Signal & FSM',
    visuals: '4-State Stationary FSM Diagram (AVAILABLE → PARKING_SETTLE [5s & |Δd| ≤ 1 cm] → OCCUPIED → EXITING_DEBOUNCE [3s]) alongside the integer EMA formula.',
    script: 'If the car shifts by more than ±1 cm during the 5-second settle window, the anchor distance updates and the 5-second timer resets immediately. Once stationary for 5.0 seconds, count-up starts cleanly at 00:00 and resists brief exit echo glitches with a 3-second departure window.',
  },
  {
    number: 6,
    title: 'KIE1004 C++ Implementation: Struct Arrays, LCD Array & EEPROM',
    presenter: 'Member 1',
    rubricTag: 'WP1 · Mandatory',
    visuals: 'Code excerpt showing LiquidCrystal_I2C lcds[NUM_BAYS], struct ParkingBay (with anchorDistCm & stationaryStartMs), unified for-loop, and wear-safe EEPROM.put() persistence.',
    script: 'All three bays share one deterministic struct ParkingBay array and one LiquidCrystal_I2C array indexed by a single loop—zero copy-pasted bay code. Active sessions persist to the ATmega328P’s 1 KB EEPROM on transitions and 30-second checkpoints.',
  },
  {
    number: 7,
    title: 'KIE1004 C++ Implementation: Stationary Check, Tariff & Time Math',
    presenter: 'Member 3',
    rubricTag: 'WP1 · Mandatory',
    visuals: 'Const-correct functions: classifyDistance(), calculateParkingFee(), abs() stationary check, rollover-safe unsigned subtraction (nowMs - startMs >= interval), and #ifdef DEBUG build toggle.',
    script: 'Every timer uses unsigned modular subtraction, guaranteeing exact operation across the 49.7-day millis() rollover. Constant strings are wrapped in the F() macro so static SRAM stays near 40% even with three LCD objects.',
  },
  {
    number: 8,
    title: 'Per-Bay Visual HMI, Bay-Coded Overstay Buzzer & Serial Console',
    presenter: 'Member 5',
    rubricTag: 'HMI & Demo Control',
    visuals: 'Live 3-Bay LCD Screen Mockups (0x27, 0x26, 0x25), LED Zone Matrix, Bay-Coded Overstay Buzzer Cadence (1×/2×/3× pulse on A3), and Serial Demo Commands (S, T, D, R1–R3).',
    script: 'Each bay displays its own real-time count-up clock and fee directly overhead. Distance guidance is handled silently by the 3 LEDs above each sensor, while Pin A3 sounds a distinct 1-, 2-, or 3-pulse 2000 Hz alarm the instant any bay exceeds the 180-minute limit.',
  },
  {
    number: 9,
    title: '3-Dimensional Technical Limitations Analysis',
    presenter: 'Member 2 & 5',
    rubricTag: 'EA1 · Mandatory',
    visuals: '3-Column Matrix: Hardware (15° reflection, 0.6 m/s/°C drift, 1.57 kΩ parallel I2C pull-ups), Software (15 ms bounded pulseIn, AVR Wire hang risk, single Timer 2 buzzer), Algorithmic (EMA lag, 5 s settle latency, EEPROM 100k limit).',
    script: 'We evaluated constraints across hardware, ATmega328P architecture, and algorithms—including the subtle parallel I2C pull-up resistance drop to 1.57 kΩ across three PCF8574 backpacks and AVR Wire bus-hang risk if an LCD wire detaches.',
  },
  {
    number: 10,
    title: 'Recalculated BOM Cost, Live Demo Cue Card & Future Work',
    presenter: 'Member 3',
    rubricTag: 'Req 8 · Closing',
    visuals: 'Verified v3.0 BOM (RM 63.50 active / RM 69.70 with spares ≈ RM 13.94/student), 5-Step Live Demo Sequence, and Future Work (PCINT zero-blocking echo, PCF8574 0x24 per-bay buzzers, DHT22 temp compensation, ESP32 dashboard).',
    script: 'Our complete 3-LCD, 9-LED, 3+1 sensor prototype totals RM 63.50 in deployed hardware (RM 69.70 with full spares, or RM 13.94 per student). Let us now demonstrate live motion reset, 5-second stationary count-up, overstay alarm, EEPROM recovery, and exit billing.',
  },
];

export const RUBRIC_MAPPING = [
  { criterion: 'WP1 · Technical / Programming (CLO2, PO3)', coverage: 'Clean modular procedural C++: constants, selection, loops, 1D/2D arrays (LED_PINS[3][3], distHistory[3][3]), overloaded printTwoDigits(), Insertion Sort median filter, Linear Search, and pointer pass-by-reference computeLotSummary().', slides: 'Slides 6–7' },
  { criterion: 'WP2 · Conflicting Requirements (CLO2, PO3)', coverage: 'Resolves 3 LCDs vs. 20 Uno pins (I2C A0/A1 bridges), 3-LCD refresh latency vs. 40 ms TDM, 5 s stop rule vs. ±1 cm sonar jitter, and single buzzer vs. 3-bay identity.', slides: 'Slide 5' },
  { criterion: 'EA1 · Depth of Analysis & Originality (CLO3, PO9)', coverage: '3-axis limitations analysis: Hardware (15° acoustic reflection, 0.6 m/s/°C drift, 1.57 kΩ parallel pull-ups), Software (15 ms pulseIn cap, Wire hang, single Timer 2), and Algorithmic (3-sample median & 5 s settle latency).', slides: 'Slide 9' },
  { criterion: 'Teamwork & Roles (CLO3, PO9)', coverage: 'Balanced 5-member responsibility split across Architecture, Sensing, Billing, Hardware, and HMI/QA with Git milestones and synchronized SPeCTRUM delivery (due 27 Dec 2026, 5:00 PM).', slides: 'Slide 1' },
  { criterion: 'Mandatory Item 1 · Schematic & Pins', coverage: '20/20 Arduino Uno R3 pin connections, 3× I2C LCD address bridges (0x27/0x26/0x25), 9× 330 Ω LED resistors, and dual 100 µF + 0.1 µF decoupling capacitors.', slides: 'Slide 3' },
  { criterion: 'Mandatory Item 2 · Scheduler Flowchart', coverage: 'Cooperative non-blocking Round-Robin scheduler (40 ms TDM ultrasonic turns + 200 ms staggered LCD refresh) paired with 4-state 5.0 s stationary FSM.', slides: 'Slide 4' },
  { criterion: 'Cost Minimization & Datasheets (Req 8–9)', coverage: 'Editable RM 69.70 BOM (RM 63.50 active + RM 6.20 spares = RM 13.94/student) verified against ATmega328P 200 mA MCU and 500 mA USB limits.', slides: 'Slide 8' },
  { criterion: 'Engineering Assumptions & Live Demo (Req 10)', coverage: '1:20 physical scale, 5.0 s ±1 cm stillness rule, toggleable 60× demo clock, grace-first ceiling fee, and 10-point QA + 5-min bench cue card.', slides: 'Slides 2, 5, 10' },
];

export const DEFENSE_FAQ: DefenseFaqItem[] = [
  {
    id: 'q1',
    category: 'Hardware & I2C',
    isNewV3: true,
    question: 'How are you driving THREE 16×2 LCD displays from only two Arduino pins (A4/A5) without address collisions?',
    answer: 'Every PCF8574 I2C LCD backpack includes three exposed hardware address jumper pads labeled A0, A1, and A2. By default (all pads open), the 7-bit address is 0x27. We leave Bay 1 open (0x27), solder a tiny bridge across A0 on Bay 2 (0x26), and solder a bridge across A1 on Bay 3 (0x25). All three displays share the same SDA (A4) and SCL (A5) bus cleanly at zero extra pin or hardware cost.',
  },
  {
    id: 'q2',
    category: 'Hardware & I2C',
    isNewV3: true,
    question: 'Wait—each PCF8574 backpack has onboard 4.7 kΩ I2C pull-up resistors. What happens when you wire three in parallel?',
    answer: 'Putting three 4.7 kΩ pull-ups in parallel reduces the effective bus pull-up resistance to R_eq = 4.7 kΩ / 3 = 1.57 kΩ, increasing LOW-state sink current to I = 5V / 1.57 kΩ = 3.19 mA. That is well inside the ATmega328P’s 20 mA pin limit and works reliably at 100 kHz over short 30 cm ribbons, though it slightly exceeds the strict 3.0 mA I2C standard-mode spec. If bus edges show ringing, removing the pull-up resistor pair on 2 of the 3 backpacks restores an ideal 4.7 kΩ (1.06 mA).',
  },
  {
    id: 'q3',
    category: '5s Stationary FSM',
    isNewV3: true,
    question: 'Why do you allow a ±1 cm deadband during the 5-second stationary stop check instead of requiring exact distance equality?',
    answer: 'Per the HC-SR04 datasheet, acoustic resolution is ±3 mm (±0.3 cm) and integer conversion (durationUs / 58UL) introduces ±1 cm quantization jitter even on a completely motionless toy car. Requiring strict equality (d == prev) would cause false resets every few hundred milliseconds so the timer might never start. Our 70/30 EMA filter plus |filteredDistCm - anchorDistCm| ≤ 1 cm deadband ignores LSB jitter while immediately resetting the 5.0 s timer on genuine vehicle movement.',
  },
  {
    id: 'q4',
    category: 'Scheduler & Firmware',
    isNewV3: true,
    question: 'Doesn’t updating three 16×2 I2C LCD displays block your 40 ms ultrasonic TDM scheduler?',
    answer: 'It would if we refreshed all three LCDs at once using lcd.clear() (~100–120 ms stall). Instead, we eliminated lcd.clear() completely by overwriting padded 16-character buffers, added a per-line dirty check that skips unchanged lines (0 ms cost), and staggered updates in Round-Robin fashion—updating at most ONE LCD every 200 ms. Worst-case I2C update latency is ~15 ms, refreshing every bay cleanly every 600 ms with zero flicker.',
  },
  {
    id: 'q5',
    category: 'Power & Tariff',
    isNewV3: true,
    question: 'You tripled the LCD count from 1 to 3. Did you blow past the Arduino Uno’s 200 mA current limit?',
    answer: 'No, because we distinguish carefully between ATmega328P MCU pin current (200 mA limit) and USB 5V rail current (500 mA polyfuse limit). The three LCDs and three HC-SR04 sensors draw power directly from the 5V rail—NOT through the ATmega328P’s Vcc/GND pins. Total MCU pin load (15 mA core + max 80 mA all 9 LEDs + 15 mA buzzer + 3.2 mA I2C) is 113.2 mA (< 200 mA). Total USB 5V bus load including 3 backlit LCDs (~75–90 mA) and 3 sensors (~19–45 mA) is 154.5 mA typical and 248.2 mA conservative worst-case—still under 50% of the 500 mA USB polyfuse.',
  },
  {
    id: 'q6',
    category: 'Hardware & I2C',
    isNewV3: true,
    question: 'Your spec mentions 1 buzzer per slot concept, yet Pin A3 drives 1 shared buzzer. Why, and how would you add 3 physical buzzers?',
    answer: 'With 3 ultrasonic sensors (6 pins), 9 LEDs (9 pins), UART Serial (2 pins), and the shared I2C bus (2 pins), exactly 1 native Uno pin remains (A3), and the ATmega328P has only 1 Timer 2 tone channel. Our baseline keeps 20/20 zero-expander perfection by driving a passive buzzer on A3 strictly on overstay with bay-coded pulse groups (1×/2×/3× beeps for Bay 1/2/3). If physically separate per-bay buzzers are required, we add one PCF8574 I2C I/O expander at 0x24 (+RM 2.50) on the existing A4/A5 bus to switch 3 active 5V buzzers independently.',
  },
  {
    id: 'q7',
    category: 'Scheduler & Firmware',
    question: 'You call your Round-Robin scheduler non-blocking, yet pulseIn() is inside measureDistanceCm(). Isn’t pulseIn() blocking?',
    answer: 'We explicitly classify our architecture as cooperative with bounded blocking. Default pulseIn() waits up to 1,000,000 µs (1 s), which freezes the CPU. By passing PULSE_TIMEOUT_US = 15000UL (~257 cm), worst-case wait is strictly capped at 15 ms (37.5% of a 40 ms slot), and parked bays return in ~1.16 ms. A zero-blocking Port-D Pin Change Interrupt (PCINT) state machine is documented in Future Work.',
  },
  {
    id: 'q8',
    category: '5s Stationary FSM',
    question: 'Once a car is OCCUPIED and counting up, what happens if the driver nudges the car 3 cm forward? Does the count-up reset?',
    answer: 'No! The 5-second stationary gate only governs the transition from PARKING_SETTLE into OCCUPIED. Once OCCUPIED, nudging the car within the 2–20 cm bay updates the distance LEDs in real time while the billing clock continues uninterrupted—preventing drivers from gaming the timer by creeping forward.',
  },
  {
    id: 'q9',
    category: 'Power & Tariff',
    question: 'Explain (billableMins + 59UL) / 60UL and why the 15-minute grace period is subtracted first.',
    answer: 'C++ integer division truncates toward zero, whereas parking tariffs charge per started hour (ceiling division ⌈a/b⌉ = ⌊(a+b−1)/b⌋). Subtracting the 15 free minutes first ensures exact billing boundaries: 15 m → RM 0.00; 16 m → 1 billable m → RM 3.00; 75 m → 60 m → RM 3.00; 76 m → 61 m → RM 6.00.',
  },
  {
    id: 'q10',
    category: 'Scheduler & Firmware',
    question: 'What happens to your timers when millis() overflows after 49.7 days?',
    answer: 'Because every elapsed check uses unsigned 32-bit modular subtraction—(currentMillis - startMillis >= interval) instead of (currentMillis >= startMillis + interval)—C++ unsigned wrap-around arithmetic yields the exact elapsed interval even across the 2³² − 1 rollover boundary.',
  },
  {
    id: 'q11',
    category: 'Hardware & I2C',
    question: 'Why did you choose 330 Ω resistors instead of 220 Ω for the 9 LEDs?',
    answer: 'Per ATmega328P Section 29.1, total Vcc/GND current must stay under 200 mA. With 330 Ω, each Red/Yellow LED draws (5V − 2V)/330 Ω = 9.09 mA (Green 8.48 mA), capping all 9 LEDs simultaneously at 80.0 mA vs. 122.7 mA with 220 Ω—preserving over 43% thermal headroom.',
  },
  {
    id: 'q12',
    category: 'Scheduler & Firmware',
    isNewV3: true,
    question: 'Why did you replace C++ structs, enums, and snprintf() with parallel arrays, Insertion Sort, and pointer parameters?',
    answer: 'KIE1004 Programming 1 covers Weeks 1–13 procedural C++ (variables, operators, selection, loops, functions/overloading, 1D/2D arrays, Linear Search, Insertion Sort, and pointers) and does not cover structs, enums, or C printf/snprintf. By using synchronized 1D arrays (bayState[3], parkStartMs[3]), 2D arrays (LED_PINS[3][3], distHistory[3][3]), W11 Insertion Sort median filtering, and W13 pointer pass-by-reference (computeLotSummary), we deliver 100% full functionality using only concepts every student in the class has formally learned.',
  },
];
