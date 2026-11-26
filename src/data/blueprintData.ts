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
    dimension: 'Per-Bay Buzzers (3×)',
    v2Original: '1× shared passive buzzer on Pin A3',
    v3Updated: '3× 5V passive buzzers (A3 → 2N2222 + PCF8574 0x24 P0–P2)',
    impact: 'Every bay gets its own passive buzzer; 2N2222 protects Pin A3 (≤1 mA) while P0/P1/P2 gate each bay independently.',
  },
  {
    dimension: 'Buzzer Activation Rule',
    v2Original: 'Single buzzer overstay-only',
    v3Updated: 'Per-Bay Danger (2–5 cm, 150 ms) + Overstay (>180 m, 500 ms)',
    impact: '2500 Hz Danger-only, 1800 Hz Overstay-only, or shared 2000 Hz carrier when simultaneous with independent bay gating.',
  },
  {
    dimension: 'Count-Up Start Trigger',
    v2Original: '3.0 s presence debounce (backdated)',
    v3Updated: '5.0 s stationary stop (in slot AND |Δd| ≤ 1 cm)',
    impact: 'Count-up starts cleanly at 00:00 only after vehicle stops moving for 5.0 continuous seconds.',
  },
  {
    dimension: 'Power & Decoupling Budget',
    v2Original: '113.2 mA MCU / 248.2 mA USB',
    v3Updated: '100.3 mA MCU max / 285.6 mA USB max; 2× 100 µF + 2× 0.1 µF',
    impact: '2N2222 offloads buzzer current from MCU (< 51% of 200 mA); PCF8574 sinks ≤45 mA (<80 mA); USB stays <58% of 500 mA.',
  },
  {
    dimension: 'Total Procurement Cost',
    v2Original: 'RM 63.50 active / RM 69.70 w/ spares',
    v3Updated: 'RM 70.50 active / RM 76.70 w/ spares',
    impact: '≈ RM 15.34 per student across 5 members (+RM 7.00 total for +2 passive buzzers, PCF8574 0x24 & 2N2222 buffer kit).',
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
    datasheetNote: 'Keep D0/D1 completely free of external wires to guarantee clean sketch uploads and live Serial commands (S, T, D, R).',
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
    datasheetNote: 'Read via pulseIn(D3, HIGH, 15000UL). Safe alongside tone(A3) since only digitalRead/pulseIn is used (no PWM).',
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
    datasheetNote: 'Fast-flashes (150 ms) in DANGER (2–5 cm) synced with Bay 1 passive buzzer; strobes with Yellow on OVERSTAY.',
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
    datasheetNote: 'Digital HIGH/LOW only (no analogWrite PWM), so Timer 2 usage by tone(A3) causes zero conflict on D11.',
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
    datasheetNote: 'D13 drives Uno onboard L-LED via op-amp buffer (negligible load); flashes with Bay 2 passive buzzer on Danger.',
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
    signalName: 'BUZZER_TONE_PIN',
    component: 'Shared Tone Carrier → 1 kΩ → 2N2222 NPN Emitter Follower → 3× Passive Buzzers (+)',
    direction: 'OUTPUT (tone)',
    group: 'buzzer',
    currentNote: '≤ 1.0 mA base drive (offloads 45 mA to +5V rail)',
    datasheetNote: 'Generates 2500 Hz (Danger-only), 1800 Hz (Overstay-only), or 2000 Hz (Mixed). 2N2222 Collector ties to +5V; Emitter (+1 kΩ to GND) drives all 3 passive buzzer (+) pins safely.',
  },
  {
    id: 'i2c_sda',
    arduinoPin: 'A4 (SDA)',
    signalName: 'I2C_SDA',
    component: 'Shared I2C Data Bus → 3× LCDs (0x27, 0x26, 0x25) + PCF8574 Buzzer Gate (0x24)',
    direction: 'Hardware I2C',
    group: 'i2c',
    currentNote: '4.26 mA max sink (4× 4.7 kΩ in parallel = 1.18 kΩ)',
    datasheetNote: 'Connects in parallel to Bay 1–3 LCD backpacks (0x27/0x26/0x25) and PCF8574 (0x24, bridge A0+A1) whose P0/P1/P2 sink each bay’s passive buzzer (−) pin.',
  },
  {
    id: 'i2c_scl',
    arduinoPin: 'A5 (SCL)',
    signalName: 'I2C_SCL',
    component: 'Shared I2C Clock Bus → 4× PCF8574 Devices (100 kHz Standard Mode)',
    direction: 'Hardware I2C',
    group: 'i2c',
    currentNote: '4.26 mA max sink (< 20 mA ATmega328P pin max)',
    datasheetNote: 'Works reliably over 30 cm ribbons; optional removal of onboard pull-ups on 2–3 boards restores ≤ 3.0 mA I2C spec.',
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
    changeNote: '20/20 pins utilized (A3 Tone + 4× I2C)',
    isChanged: false,
    datasheetSpecs: 'VCC=5V, 16 MHz, 32 KB Flash, 2 KB SRAM, Max VCC/GND=200 mA, USB Polyfuse=500 mA.',
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
    changeNote: '3 dedicated LCDs (0x27, 0x26, 0x25)',
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
    changeNote: 'Dual bulk + HF rail stabilization',
    isChanged: true,
    datasheetSpecs: 'Dual bulk + high-frequency rail stabilization: 1 pair near 3× HC-SR04s, 1 pair near 3× LCDs & 0x24 expander.',
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
    datasheetSpecs: 'Only installed if modules omit onboard pull-ups; 4 onboard 4.7 kΩ yield 1.18 kΩ (4.26 mA sink).',
    trapAvoidance: 'Yellow–Violet–Red–Gold. Do not add extra pull-ups when all 4 I2C boards already include onboard 4.7 kΩ.',
  },
  {
    id: 'buzzers',
    component: '5V Passive Piezo Buzzers (1 dedicated per parking bay)',
    qty: '3',
    defaultQty: 3,
    unitPriceRM: 1.5,
    unitLabel: 'pcs',
    activeCostRM: 4.5,
    spareCostRM: 0,
    totalCostRM: 4.5,
    changeNote: 'Upgraded: 1 → 3 passive buzzers (+RM 3.00)',
    isChanged: true,
    datasheetSpecs: 'Driven by A3→2N2222 tone carrier (2500 / 1800 / 2000 Hz) & gated individually via PCF8574 P0/P1/P2 (~15 mA peak ea).',
    trapAvoidance: 'Flip upside down: passive buzzers show an exposed green PCB underneath (do NOT buy sealed black-epoxy active buzzers for tone()).',
  },
  {
    id: 'pcf8574',
    component: 'PCF8574 I2C 8-Bit I/O Expander Module (Address 0x24)',
    qty: '1',
    defaultQty: 1,
    unitPriceRM: 3.5,
    unitLabel: 'module',
    activeCostRM: 3.5,
    spareCostRM: 0,
    totalCostRM: 3.5,
    changeNote: 'New: 3-bay independent buzzer gate (+RM 3.50)',
    isChanged: true,
    datasheetSpecs: 'Shares A4/A5 bus at 0x24 (bridge A0+A1). Active-LOW outputs P0/P1/P2 sink up to 25 mA/pin (45 mA total < 80 mA pkg max).',
    trapAvoidance: 'Confirm PCF8574T chip (base 0x20–0x27) with A0/A1/A2 DIP switches or solder pads so 0x24 avoids colliding with 0x25–0x27 LCDs.',
  },
  {
    id: 'transistor',
    component: '2N2222 NPN Transistor + 2× 1 kΩ Resistors (Pin A3 Tone Buffer Kit)',
    qty: '1 kit',
    defaultQty: 1,
    unitPriceRM: 0.5,
    unitLabel: 'kit',
    activeCostRM: 0.5,
    spareCostRM: 0,
    totalCostRM: 0.5,
    changeNote: 'New: protects Pin A3 from 3-buzzer load (+RM 0.50)',
    isChanged: true,
    datasheetSpecs: 'TO-92 NPN (600 mA Ic max, hFE ≥ 100). Emitter follower buffers 49.3 mA peak while keeping Pin A3 draw ≤ 1.0 mA. 1 kΩ base + 1 kΩ emitter pull-down.',
    trapAvoidance: 'Check 2N2222 flat face facing you: Left=Emitter (E), Middle=Base (B), Right=Collector (C). (Note: PN2222A vs P2N2222A pinouts differ — verify label!)',
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
    changeNote: 'Supports 4× I2C + 3× passive buzzers',
    isChanged: true,
    datasheetSpecs: '3× HC-SR04 (12 M-F) + 3× LCDs (12 M-F) + PCF8574 & 3× buzzers (10 wires) + LEDs/rails + spare pack.',
    trapAvoidance: 'Must buy 830-point board (not 400-point) and 30 cm M-F ribbons so all 3 elevated LCDs & buzzers reach cleanly.',
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
    parameter: 'Distance Zones (Per-Bay LEDs + Buzzer)',
    oldValue: 'DANGER 2–5 | CAUTION 6–10 | SAFE 11–20 | EMPTY >20 cm',
    newValue: 'DANGER 2–5 (Red Flash + Rapid Buzzer) | CAUTION 6–10 | SAFE 11–20 | EMPTY >20 cm',
    justification: 'At 1:20 scale, DANGER is ≤1.0 m from the rear wall—triggering both that bay’s flashing Red LED and its own rapid 150 ms passive buzzer.',
    changed: true,
  },
  {
    parameter: 'Stationary Entry Confirmation',
    oldValue: '3.0 s continuous presence (backdated timer)',
    newValue: '5.0 s continuous presence AND stationary (|Δd| ≤ 1 cm)',
    justification: 'Car must be inside slot (≤20 cm) and motionless for 5.0 real seconds before count-up starts cleanly at 00:00. ±1 cm deadband absorbs HC-SR04 ±3 mm / integer-division LSB jitter.',
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
    parameter: '4-Device Shared I2C Bus Addressing',
    oldValue: '3 LCDs: 0x27, 0x26, 0x25',
    newValue: '3 LCDs (0x27, 0x26, 0x25) + PCF8574 Buzzer Expander (0x24)',
    justification: 'Bridging A0 (LCD 2), A1 (LCD 3), and A0+A1 (PCF8574 buzzer expander) puts 4 independent I2C devices on A4/A5 with zero address collisions.',
    changed: true,
  },
  {
    parameter: '3× Passive Buzzer Policy & Pitch',
    oldValue: '1 shared passive buzzer on A3 (overstay only)',
    newValue: '3 independent passive buzzers: Danger (150 ms, 2500 Hz) + Overstay (500 ms, 1800 Hz; 2000 Hz mixed)',
    justification: 'Pin A3 generates the tone() square wave buffered by a 2N2222 emitter follower (≤1 mA on A3), while PCF8574 P0/P1/P2 independently ground-gate each bay’s passive buzzer.',
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
    conflict: '3 LCDs + 3 Independent Passive Buzzers vs. 20-Pin Uno R3 Limit',
    bottleneck: 'Three parallel LCDs (18 pins) plus 3 passive buzzers (3 pins) plus 3 ultrasonic sensors (6 pins) and 9 LEDs (9 pins) would require 36 GPIO pins—nearly double the Uno’s 20 pins.',
    resolution: 'Share A4/A5 across 4 I2C modules (3× LCDs at 0x27/0x26/0x25 + 1× PCF8574 at 0x24) while Pin A3 drives the shared tone() wave via 2N2222—fitting everything cleanly into 20/20 Uno pins.',
  },
  {
    id: 'c2',
    conflict: '3 Simultaneous Passive Buzzers vs. 20 mA Pin A3 Limit & Single Timer 2',
    bottleneck: 'Passive buzzers need a ~2 kHz AC wave (I2C cannot toggle at 2 kHz), yet 3 passive buzzers directly on Pin A3 draw ~45 mA (> 20 mA Uno pin rating) and share 1 hardware Timer 2.',
    resolution: 'Buffer Pin A3 with one RM 0.50 2N2222 NPN emitter follower (keeps A3 ≤ 1 mA), gate each bay’s (−) leg independently with PCF8574 P0/P1/P2, and arbitrate pitch (2500 Hz Danger / 1800 Hz Overstay / 2000 Hz Mixed).',
  },
  {
    id: 'c3',
    conflict: 'Triple-LCD + PCF8574 I2C Traffic vs. 40 ms Ultrasonic TDM Schedule',
    bottleneck: 'Refreshing all 3 I2C LCDs with lcd.clear() and spamming PCF8574 writes every loop tick would stall the 100 kHz I2C bus and break the 40 ms sensor cadence.',
    resolution: 'Staggered Round-Robin LCD refresh (1 bay every 200 ms, zero lcd.clear()) + dirty-checked PCF8574 writes (only transmit 1 byte to 0x24 when mask changes).',
  },
  {
    id: 'c4',
    conflict: 'Strict 5-Second Stationary Detection vs. HC-SR04 ±1 cm Sensor Jitter',
    bottleneck: 'Integer division (durationUs / 58) causes a motionless car to toggle between e.g. 8 cm and 9 cm; exact equality (d == prev) would reset the 5 s hold endlessly.',
    resolution: 'W11 Insertion Sort median-of-3 + 70/30 integer smoothing paired with a ±1 cm anchor deadband ignores LSB jitter while immediately resetting on genuine car motion.',
  },
  {
    id: 'c5',
    conflict: '4 Parallel I2C Modules vs. Pull-Up Impedance & 5V Rail Brownouts',
    bottleneck: '4× onboard 4.7 kΩ pull-ups lower bus pull-up resistance to 1.18 kΩ (4.26 mA sink), and 3 backlit LCDs + 3 buzzers peak at 285.6 mA on USB 5V.',
    resolution: 'Verify 100.3 mA MCU (<200 mA) and 285.6 mA USB (<500 mA), install dual 100 µF + 0.1 µF decoupling pairs, and document optional pull-up removal on 2–3 I2C boards.',
  },
];

export const TEAM_ROLES: TeamRole[] = [
  {
    member: 'Member 1',
    title: 'System Architect, Scheduler & Git Lead',
    responsibilities: 'Designs the cooperative Round-Robin scheduler (40 ms TDM + 200 ms staggered 3-LCD refresh), 1D parallel bay arrays, pointer summary functions, and system flowcharts.',
  },
  {
    member: 'Member 2',
    title: 'Sensor, Signal Processing & Stationary FSM Lead',
    responsibilities: 'Implements HC-SR04 TDM polling, 15 ms pulseIn() cap, 2D history matrix + Insertion Sort median filter, 70/30 smoothing, and the 5.0-second ±1 cm stationary stop rule.',
  },
  {
    member: 'Member 3',
    title: 'Billing, Count-Up Timer & Overstay Engine Lead',
    responsibilities: 'Codes clean 00:00 count-up start post-settle, Grace-First Ceiling tariff math, 3 s exit debounce continuity, and Serial exit receipts.',
  },
  {
    member: 'Member 4',
    title: 'Hardware, 4-Device I2C Bus & 2N2222 Electrical Lead',
    responsibilities: 'Solders A0/A1 address pads (0x27/0x26/0x25/0x24), wires the 2N2222 Pin A3 tone buffer, verifies 100.3 mA MCU & 285.6 mA USB budgets, and builds the 3-bay rig.',
  },
  {
    member: 'Member 5',
    title: 'HMI (3× LCD + 9 LEDs + 3× Passive Buzzers) & QA Lead',
    responsibilities: 'Builds dirty-checked 16×2 LCD formatters, 3×3 LED driver, PCF8574 0x24 active-LOW buzzer gating + A3 pitch arbitration, and executes the 10-point QA suite.',
  },
];

export const QA_TEST_SUITE: QaTestItem[] = [
  {
    id: 'T01',
    tester: 'Member 4',
    title: '4-Device I2C Address Scan (3× LCD + PCF8574)',
    expectedResult: 'I2C scanner prints exactly 4 addresses: 0x24 (Buzzer Expander), 0x25 (Bay 3), 0x26 (Bay 2), and 0x27 (Bay 1) with zero bus hangs.',
    notes: 'Confirms A0 (0x26), A1 (0x25), and A0+A1 (0x24) bridges before full firmware upload.',
  },
  {
    id: 'T02',
    tester: 'Member 5',
    title: 'Empty Baseline State (All 3 Bays & 3 Buzzers)',
    expectedResult: 'All 9 LEDs show Green solid; all 3 LCDs show AVAILABLE & 00:00; PCF8574 0x24 = 0xFF (all 3 passive buzzers completely silent, noTone(A3)).',
    notes: 'Verify contrast screw tuned crisply on all 3 backlit LCDs.',
  },
  {
    id: 'T03',
    tester: 'Member 2',
    title: '5-Second Stationary Hold & Motion Reset',
    expectedResult: 'Car enters at 16 cm → LCD counts HOLD 5s..3s; moving car to 9 cm resets countdown back to 5s.',
    notes: 'Proves count-up does NOT begin while driver is still maneuvering.',
  },
  {
    id: 'T04',
    tester: 'Member 2',
    title: '±1 cm Jitter Immunity & 00:00 Start',
    expectedResult: 'Holding car motionless for 5.0 s (despite ±1 cm LSB noise) transitions to OCCUPIED with count-up starting cleanly at 00:00.',
    notes: 'Validates Insertion Sort median + 70/30 smoothing + STATIONARY_TOL_CM = 1.',
  },
  {
    id: 'T05',
    tester: 'Member 5',
    title: 'Per-Bay Danger Buzzer (2–5 cm) & Acoustic Isolation',
    expectedResult: 'Bay 1 at 4 cm flashes Red LED & sounds ONLY Bay 1’s passive buzzer (rapid 150 ms @ 2500 Hz, mask 0xFE); Bay 2 (8 cm Yellow) & Bay 3 (15 cm Green) remain silent.',
    notes: 'Confirms PCF8574 P0 active-LOW gating isolates sound strictly to the triggering bay.',
  },
  {
    id: 'T06',
    tester: 'Member 3',
    title: 'Grace Period, Ceiling Fee & Simultaneous Mixed Buzzers',
    expectedResult: 'At 60×: 15 s = RM 0; 16 s = RM 3; >180 s on Bay 3 sounds Bay 3 slow pulse (1800 Hz, P2); putting Bay 1 at 4 cm simultaneously switches A3 carrier to 2000 Hz while Bay 1 beeps fast (P0) and Bay 3 pulses slow (P2).',
    notes: 'Proves zero cross-bay interference under simultaneous Danger + Overstay.',
  },
  {
    id: 'T07',
    tester: 'Member 3',
    title: 'Exit Debounce & Itemized Serial Receipt',
    expectedResult: 'Removing car for 1.5 s then returning preserves timer; removing for ≥3.0 s prints receipt, silences that bay’s buzzer, and clears its LCD to AVAILABLE.',
    notes: 'Confirm adjacent bays’ LCDs, timers, and buzzers are completely unaffected.',
  },
  {
    id: 'T08',
    tester: 'Member 1',
    title: 'Insertion Sort Spike Filter & Linear Search Check',
    expectedResult: 'Brief hand-wave spike (98 cm between 14 cm samples) is rejected by insertionSort() median; Serial S prints accurate Linear Search next open bay and PCF8574 mask.',
    notes: 'Confirms sorting, searching, and pointer lot summary counters work under noisy echoes.',
  },
  {
    id: 'T09',
    tester: 'Member 4',
    title: '2N2222 Buffer & 5V Rail Stability Under All-3-Buzzers Load',
    expectedResult: 'All 3 LCDs + all 3 passive buzzers sounding simultaneously (mask 0xF8) → Pin A3 ≤ 1 mA, 2N2222 cool, zero brownout resets, Vcc ≥ 4.75 V.',
    notes: 'Validates 2N2222 emitter follower and dual 100 µF + 0.1 µF decoupling capacitors.',
  },
  {
    id: 'T10',
    tester: 'Member 1',
    title: '30-Minute Soak & SRAM Headroom Check',
    expectedResult: 'Compile SRAM < 45% (< 70% limit); 30-min continuous run with zero lockups, zero LCD corruption, accurate timing & buzzer gating.',
    notes: 'Archive Serial log and compile output in /test-logs.',
  },
];

export const SLIDE_DECK_BLUEPRINT: SlideBlueprint[] = [];

export const RUBRIC_MAPPING = [
  { criterion: 'WP1 · Technical / Programming (CLO2, PO3)', coverage: 'Clean procedural C++: constants, selection, loops, 1D/2D arrays (LED_PINS[3][3], distHistory[3][3], BUZZER_BIT_WEIGHT[3]), arithmetic PCF8574 byte masking (255 - 1/-2/-4), overloaded printTwoDigits(), Insertion Sort, Linear Search, and pointer pass-by-reference.', slides: 'Slides 6–7' },
  { criterion: 'WP2 · Conflicting Requirements (CLO2, PO3)', coverage: 'Resolves 3 LCDs + 3 buzzers vs. 20 Uno pins (4-device I2C bus 0x24–0x27), 3 passive buzzers vs. 20 mA Pin A3 limit (2N2222 emitter follower), single Timer 2 pitch arbitration, and 5 s stillness vs. ±1 cm sonar jitter.', slides: 'Slide 5' },
  { criterion: 'EA1 · Depth of Analysis & Originality (CLO3, PO9)', coverage: '3-axis limitations analysis: Hardware (15° acoustic reflection, 0.6 m/s/°C drift, 1.18 kΩ 4-device I2C pull-ups), Software (15 ms pulseIn cap, single Timer 2 shared pitch when mixed, AVR Wire hang), and Algorithmic (median & 5 s settle latency).', slides: 'Slide 9' },
  { criterion: 'Teamwork & Roles (CLO3, PO9)', coverage: 'Balanced 5-member responsibility split across Architecture, Sensing, Billing, Hardware/2N2222, and HMI/3-Buzzer QA with synchronized SPeCTRUM delivery (due 27 Dec 2026, 5:00 PM).', slides: 'Slide 1' },
  { criterion: 'Mandatory Item 1 · Schematic & Pins', coverage: '20/20 Arduino Uno R3 pin connections, 4-device I2C bus (0x27/0x26/0x25 LCDs + 0x24 PCF8574), Pin A3 → 2N2222 tone buffer, 9× 330 Ω LED resistors, and dual decoupling caps.', slides: 'Slide 3' },
  { criterion: 'Mandatory Item 2 · Scheduler Flowchart', coverage: 'Cooperative non-blocking Round-Robin scheduler (40 ms TDM ultrasonic turns + 200 ms staggered LCD refresh + dirty-checked 0x24 buzzer gating) paired with 4-state 5.0 s stationary FSM.', slides: 'Slide 4' },
  { criterion: 'Cost Minimization & Datasheets (Req 8–9)', coverage: 'Editable RM 76.70 BOM (RM 70.50 active + RM 6.20 spares = RM 15.34/student) verified against ATmega328P (100.3/200 mA), PCF8574 (45/80 mA), 2N2222 (49.3/600 mA), and USB (285.6/500 mA).', slides: 'Slide 8' },
  { criterion: 'Engineering Assumptions & Live Demo (Req 10)', coverage: '1:20 physical scale, 5.0 s ±1 cm stillness rule, toggleable 60× demo clock, grace-first ceiling fee, simultaneous per-bay Danger + Overstay buzzer test, and 10-point QA.', slides: 'Slides 2, 5, 10' },
];

export const DEFENSE_FAQ: DefenseFaqItem[] = [
  {
    id: 'q1',
    category: 'Hardware & I2C',
    isNewV3: true,
    question: 'How are you driving THREE 16×2 LCDs AND THREE independent passive buzzers on one 20-pin Arduino Uno?',
    answer: 'We place four I2C modules on the shared A4 (SDA) / A5 (SCL) bus using unique hardware address bridges: Bay 1 LCD at 0x27 (open), Bay 2 LCD at 0x26 (A0), Bay 3 LCD at 0x25 (A1), and a PCF8574 8-bit expander at 0x24 (A0 + A1). Arduino Pin A3 generates the tone() square wave through a 2N2222 NPN emitter-follower buffer to all 3 passive buzzers’ (+) pins, while PCF8574 pins P0, P1, and P2 independently switch each bay’s (−) pin to ground (active-LOW). Total Uno pin usage stays right at 20/20.',
  },
  {
    id: 'q2',
    category: 'Hardware & I2C',
    isNewV3: true,
    question: 'Why did you add a 2N2222 NPN transistor on Pin A3 instead of wiring the 3 passive buzzers directly to A3?',
    answer: 'An Arduino Uno GPIO pin has a recommended continuous limit of 20 mA (40 mA absolute max). If all three 5V passive buzzers sound simultaneously, they can draw up to ~45 mA combined—overloading Pin A3. Using a single RM 0.50 2N2222 NPN transistor as an emitter follower (Collector to +5V, Base via 1 kΩ to A3, Emitter to the shared TONE_BUS with a 1 kΩ pull-down to GND) offloads the 49.3 mA peak onto the 5V rail while keeping Pin A3 current safely below 1.0 mA!',
  },
  {
    id: 'q3',
    category: 'Hardware & I2C',
    isNewV3: true,
    question: 'Wait—with FOUR I2C boards (3 LCDs + 1 PCF8574), what happens to the onboard 4.7 kΩ pull-up resistors in parallel?',
    answer: 'Four onboard 4.7 kΩ pull-up resistors in parallel give R_eq = 4.7 kΩ / 4 = 1.18 kΩ, producing a LOW-state sink current of I = 5V / 1.18 kΩ = 4.26 mA. That is well inside the ATmega328P’s 20 mA pin limit and works reliably at 100 kHz over 30 cm ribbons, though it exceeds the strict 3.0 mA I2C standard-mode guideline. Desoldering or cutting the pull-up resistors on 2 or 3 of the 4 boards restores an ideal 2.35–4.7 kΩ (1.06–2.13 mA).',
  },
  {
    id: 'q4',
    category: 'Hardware & I2C',
    isNewV3: true,
    question: 'Why wire the passive buzzers’ (−) legs to PCF8574 P0–P2 (active-LOW) instead of sourcing from P0–P2?',
    answer: 'Per the PCF8574 datasheet, its quasi-bidirectional outputs can only source ~100 µA when HIGH, which cannot drive a 15 mA buzzer. However, when pulled LOW (0), each pin can sink up to 25 mA continuously (80 mA total package max). Sinking all 3 passive buzzers simultaneously draws 45 mA—safely within PCF8574’s 80 mA ceiling with zero extra transistors needed on P0–P2.',
  },
  {
    id: 'q5',
    category: 'Scheduler & Firmware',
    isNewV3: true,
    question: 'What happens if Bay 1 is in Danger (2–5 cm) and Bay 3 is Overstay (>180 min) at the exact same time on one Timer 2?',
    answer: 'Arduino Uno’s tone() library uses hardware Timer 2, so Pin A3 outputs one carrier frequency at any instant. When only Danger bay(s) alert, A3 drives 2500 Hz; when only Overstay bay(s) alert, A3 drives 1800 Hz. When both occur simultaneously on different bays, our arbitrator smoothly switches A3 to a shared 2000 Hz carrier while PCF8574 (0x24) continues gating Bay 1 at rapid 150 ms staccato (P0) and Bay 3 at slow 500 ms / 1000 ms pulses (P2)—so both bays sound independently at once!',
  },
  {
    id: 'q6',
    category: 'Power & Tariff',
    isNewV3: true,
    question: 'Did adding 3 LCDs, a PCF8574, and 3 passive buzzers exceed the Uno’s 200 mA MCU or 500 mA USB limits?',
    answer: 'No! In fact, offloading buzzer drive from Pin A3 onto the 2N2222 buffer REDUCED worst-case ATmega328P MCU pin current from 113.2 mA down to 100.3 mA (50.1% of 200 mA). On the USB 5V rail, MCU (100.3 mA) + 3× HC-SR04 (45 mA) + 3× LCDs (90 mA) + PCF8574/2N2222/3× Buzzers (50.3 mA) peaks at 285.6 mA worst-case (57.1% of the 500 mA USB polyfuse) and ~141.5 mA typical idle.',
  },
  {
    id: 'q7',
    category: '5s Stationary FSM',
    isNewV3: true,
    question: 'Why allow a ±1 cm deadband during the 5-second stationary stop check instead of requiring exact distance equality?',
    answer: 'HC-SR04 acoustic resolution is ±3 mm and integer conversion (durationUs / 58UL) causes ±1 cm quantization jitter even on a motionless toy car. Requiring strict equality (d == prev) would falsely reset the 5 s hold endlessly. Our Insertion Sort median + 70/30 smoothing + |filteredDist - anchorDist| ≤ 1 cm deadband absorbs LSB jitter while instantly resetting on genuine car motion.',
  },
  {
    id: 'q8',
    category: 'Scheduler & Firmware',
    isNewV3: true,
    question: 'How do you control the PCF8574 (0x24) pins P0–P2 without using advanced bitwise operators like << or ~?',
    answer: 'Because binary bit weights for P0, P1, and P2 are simply 1, 2, and 4, we start with int mask = 255 (all 8 pins HIGH = silent) and subtract 1 for Bay 1, 2 for Bay 2, or 4 for Bay 3 whenever that bay’s cadence is ON. That produces the exact active-LOW byte (0xFF down to 0xF8) using only elementary subtraction and a 1D constant array BUZZER_BIT_WEIGHT[3] = {1, 2, 4}, and we only send it over Wire when mask != lastBuzzerMask.',
  },
  {
    id: 'q9',
    category: 'Scheduler & Firmware',
    question: 'You call your Round-Robin scheduler non-blocking, yet pulseIn() is inside measureRawDistanceCm(). Isn’t pulseIn() blocking?',
    answer: 'We classify our architecture as cooperative with bounded blocking. Default pulseIn() waits up to 1,000,000 µs (1 s), freezing the CPU. Passing PULSE_TIMEOUT_US = 15000UL (~257 cm) strictly caps worst-case wait at 15 ms (37.5% of a 40 ms slot), and parked bays return in ~1.16 ms. A zero-blocking PCINT interrupt upgrade is documented in Future Work.',
  },
  {
    id: 'q10',
    category: '5s Stationary FSM',
    question: 'Once a car is OCCUPIED and counting up, what happens if the driver nudges the car 3 cm forward? Does the count-up reset?',
    answer: 'No! The 5-second stationary gate only governs the transition from STATE_SETTLING into STATE_OCCUPIED. Once OCCUPIED, nudging the car within 2–20 cm immediately updates the distance LEDs (and triggers that bay’s Danger buzzer if ≤ 5 cm) while the billing timer continues uninterrupted.',
  },
  {
    id: 'q11',
    category: 'Power & Tariff',
    question: 'Explain (billableMin + 59) / 60 and why the 15-minute grace period is subtracted first.',
    answer: 'C++ integer division truncates toward zero, whereas parking tariffs charge per started hour (ceiling division ⌈a/b⌉ = ⌊(a+b−1)/b⌋). Subtracting the 15 free minutes first ensures exact billing boundaries: 15 m → RM 0; 16 m → 1 billable m → RM 3; 75 m → 60 m → RM 3; 76 m → 61 m → RM 6.',
  },
  {
    id: 'q12',
    category: 'Scheduler & Firmware',
    isNewV3: true,
    question: 'Why did you replace C++ structs, enums, bitwise shifts, and snprintf() with parallel arrays, Insertion Sort, and pointers?',
    answer: 'KIE1004 Programming 1 covers procedural C++ fundamentals (variables, arithmetic, selection, loops, functions/overloading, 1D/2D arrays, Linear Search, Insertion Sort, and pointers) without structs, enums, or C printf. Using synchronized parallel arrays, 2D arrays, arithmetic byte masking for PCF8574, Insertion Sort median filtering, and pointer pass-by-reference delivers 100% full 3-bay + 3-buzzer functionality using concepts every student can trace and defend.',
  },
];
