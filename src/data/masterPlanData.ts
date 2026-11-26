export interface MasterPlanStep {
  id: string;
  phaseId: string;
  stepNumber: number;
  title: string;
  durationMin: number;
  difficulty: 'Beginner' | 'Guided' | 'Hands-On' | 'Verification';
  goal: string;
  actions: string[];
  expectedOutput: string;
  rookieMistake: string;
  snippetLabel?: string;
  snippet?: string;
}

export interface MasterPlanPhase {
  id: string;
  phaseNumber: number;
  title: string;
  subtitle: string;
  estimatedHours: string;
  milestone: string;
}

export interface CircuitWireConnection {
  wireNo: string;
  subsystem: 'Power & Rails' | 'Ultrasonic Sensors' | '9 LEDs & 330 Ω' | '3× I2C LCDs' | '3× Passive Buzzers';
  fromPoint: string;
  toPoint: string;
  wireColor: string;
  beginnerNote: string;
}

export const CIRCUIT_WIRING_GUIDE: CircuitWireConnection[] = [
  // Power & Decoupling Rails
  {
    wireNo: 'P1',
    subsystem: 'Power & Rails',
    fromPoint: 'Arduino Uno 5V pin',
    toPoint: 'Breadboard Top Red (+) Rail',
    wireColor: 'Red (M-M)',
    beginnerNote: 'Supplies regulated 5 V to all sensors & LCDs. Bridge midpoint rail gap if printed line breaks.',
  },
  {
    wireNo: 'P2',
    subsystem: 'Power & Rails',
    fromPoint: 'Arduino Uno GND pin',
    toPoint: 'Breadboard Top Blue (−) Rail',
    wireColor: 'Black (M-M)',
    beginnerNote: 'Common ground for the entire circuit. Bridge both top and bottom blue GND rails together.',
  },
  {
    wireNo: 'P3',
    subsystem: 'Power & Rails',
    fromPoint: '2× 100 µF Electrolytic Caps',
    toPoint: 'Long (+) leg → Red Rail, White-stripe (−) leg → Blue Rail',
    wireColor: 'Component',
    beginnerNote: 'Place one near the 3× HC-SR04 power taps and one near the 3× LCD power taps. Polarity matters!',
  },
  {
    wireNo: 'P4',
    subsystem: 'Power & Rails',
    fromPoint: '2× 0.1 µF Ceramic Caps (104)',
    toPoint: 'Across Red (+) Rail and Blue (−) Rail next to 100 µF caps',
    wireColor: 'Component',
    beginnerNote: 'Non-polarized (either direction works). Filters high-frequency digital switching noise.',
  },

  // 3x HC-SR04 Ultrasonic Sensors
  {
    wireNo: 'U1',
    subsystem: 'Ultrasonic Sensors',
    fromPoint: 'Bay 1 HC-SR04 (VCC / GND)',
    toPoint: 'VCC → Red (+) Rail · GND → Blue (−) Rail',
    wireColor: 'Red / Black (M-F)',
    beginnerNote: 'Use 30 cm M-F jumper ribbon so sensor mounts cleanly at Bay 1 bottom wall.',
  },
  {
    wireNo: 'U2',
    subsystem: 'Ultrasonic Sensors',
    fromPoint: 'Bay 1 HC-SR04 (TRIG / ECHO)',
    toPoint: 'TRIG → Arduino D2 · ECHO → Arduino D3',
    wireColor: 'Blue / Green (M-F)',
    beginnerNote: 'Double-check TRIG vs ECHO labels printed on front of HC-SR04 PCB.',
  },
  {
    wireNo: 'U3',
    subsystem: 'Ultrasonic Sensors',
    fromPoint: 'Bay 2 HC-SR04 (VCC / GND)',
    toPoint: 'VCC → Red (+) Rail · GND → Blue (−) Rail',
    wireColor: 'Red / Black (M-F)',
    beginnerNote: 'Keep Bay 2 ribbon neatly bundled behind the cardboard divider wall.',
  },
  {
    wireNo: 'U4',
    subsystem: 'Ultrasonic Sensors',
    fromPoint: 'Bay 2 HC-SR04 (TRIG / ECHO)',
    toPoint: 'TRIG → Arduino D4 · ECHO → Arduino D5',
    wireColor: 'Yellow / Orange (M-F)',
    beginnerNote: '40 ms TDM firing prevents acoustic echo cross-talk with Bay 1 and Bay 3.',
  },
  {
    wireNo: 'U5',
    subsystem: 'Ultrasonic Sensors',
    fromPoint: 'Bay 3 HC-SR04 (VCC / GND)',
    toPoint: 'VCC → Red (+) Rail · GND → Blue (−) Rail',
    wireColor: 'Red / Black (M-F)',
    beginnerNote: 'Keep the 4th HC-SR04 safely in your kit bag as an instant hot-swap spare.',
  },
  {
    wireNo: 'U6',
    subsystem: 'Ultrasonic Sensors',
    fromPoint: 'Bay 3 HC-SR04 (TRIG / ECHO)',
    toPoint: 'TRIG → Arduino D6 · ECHO → Arduino D7',
    wireColor: 'Purple / White (M-F)',
    beginnerNote: 'All 3 sensors mount strictly vertical (90°) 2 cm above the tabletop floor.',
  },

  // 9x Diffused LEDs + 9x 330 Ohm Resistors
  {
    wireNo: 'L1–L3',
    subsystem: '9 LEDs & 330 Ω',
    fromPoint: 'Arduino D8 (G), D9 (Y), D10 (R)',
    toPoint: 'Each pin → LED Long Leg (+) → LED Short Leg (−) → 330 Ω Resistor → Blue GND Rail',
    wireColor: 'Green / Yellow / Red',
    beginnerNote: 'Bay 1 LEDs. Put each LED across TWO separate breadboard rows — never in the same 5-hole row!',
  },
  {
    wireNo: 'L4–L6',
    subsystem: '9 LEDs & 330 Ω',
    fromPoint: 'Arduino D11 (G), D12 (Y), D13 (R)',
    toPoint: 'Each pin → LED Long Leg (+) → LED Short Leg (−) → 330 Ω Resistor → Blue GND Rail',
    wireColor: 'Green / Yellow / Red',
    beginnerNote: 'Bay 2 LEDs. Every single LED MUST have its own 330 Ω resistor (Orange-Orange-Brown-Gold).',
  },
  {
    wireNo: 'L7–L9',
    subsystem: '9 LEDs & 330 Ω',
    fromPoint: 'Arduino A0 (G), A1 (Y), A2 (R)',
    toPoint: 'Each pin → LED Long Leg (+) → LED Short Leg (−) → 330 Ω Resistor → Blue GND Rail',
    wireColor: 'Green / Yellow / Red',
    beginnerNote: 'Bay 3 LEDs. Analog pins A0–A2 work natively as digital outputs via pinMode(A0, OUTPUT).',
  },

  // 3x 16x2 I2C LCD Displays (Shared Bus)
  {
    wireNo: 'I1',
    subsystem: '3× I2C LCDs',
    fromPoint: 'Arduino A4 (SDA) & A5 (SCL)',
    toPoint: 'Breadboard Row 55 (SDA Hub) & Row 56 (SCL Hub)',
    wireColor: 'Blue (SDA) / Purple (SCL)',
    beginnerNote: 'Creates a shared 5-hole I2C hub where all 4 I2C modules (3× LCD + PCF8574 0x24) plug in parallel.',
  },
  {
    wireNo: 'I2',
    subsystem: '3× I2C LCDs',
    fromPoint: 'Bay 1 LCD (0x27 — A0/A1/A2 Open)',
    toPoint: 'GND→Blue · VCC→Red · SDA→Row 55 · SCL→Row 56',
    wireColor: '4-pin M-F Ribbon',
    beginnerNote: 'Leave Bay 1 backpack untouched (factory default 0x27). Tune blue contrast screw on back.',
  },
  {
    wireNo: 'I3',
    subsystem: '3× I2C LCDs',
    fromPoint: 'Bay 2 LCD (0x26 — Solder Bridge A0)',
    toPoint: 'GND→Blue · VCC→Red · SDA→Row 55 · SCL→Row 56',
    wireColor: '4-pin M-F Ribbon',
    beginnerNote: 'Solder tiny tin blob bridging ONLY pad A0 on the backpack BEFORE connecting power.',
  },
  {
    wireNo: 'I4',
    subsystem: '3× I2C LCDs',
    fromPoint: 'Bay 3 LCD (0x25 — Solder Bridge A1)',
    toPoint: 'GND→Blue · VCC→Red · SDA→Row 55 · SCL→Row 56',
    wireColor: '4-pin M-F Ribbon',
    beginnerNote: 'Solder tiny tin blob bridging ONLY pad A1 on the backpack. Do NOT add external pull-ups.',
  },
  {
    wireNo: 'I5',
    subsystem: '3× Passive Buzzers',
    fromPoint: 'PCF8574 Buzzer Expander (0x24 — Bridge A0 + A1)',
    toPoint: 'GND→Blue · VCC→Red · SDA→Row 55 · SCL→Row 56',
    wireColor: '4-pin M-F Ribbon',
    beginnerNote: 'Move A0 & A1 jumpers to GND (or bridge both pads) for 0x24. All 4 I2C modules share 1.18 kΩ pull-up.',
  },

  // 3x Independent Passive Buzzers (Pin A3 -> 2N2222 Emitter Follower -> TONE_BUS + PCF8574 0x24 P0/P1/P2)
  {
    wireNo: 'B1',
    subsystem: '3× Passive Buzzers',
    fromPoint: '2N2222 NPN Transistor (Flat Face Facing You: Left=E, Mid=B, Right=C)',
    toPoint: 'Collector (C)→Red +5V · Base (B)←1 kΩ←Arduino A3 · Emitter (E)→Row 50 (TONE_BUS) + 1 kΩ→Blue GND',
    wireColor: 'Orange / Red / Black',
    beginnerNote: 'Buffers Pin A3 tone() so Arduino sources ≤1.0 mA while Row 50 drives all 3 passive buzzers cleanly.',
  },
  {
    wireNo: 'B2',
    subsystem: '3× Passive Buzzers',
    fromPoint: 'Bay 1 Passive Piezo Buzzer (+ / −)',
    toPoint: '(+) Marked Pin → Row 50 (TONE_BUS) · (−) Pin → PCF8574 (0x24) Pin P0',
    wireColor: 'Red / Blue (M-F)',
    beginnerNote: 'Active-LOW gating: P0=LOW sinks Bay 1 current (Danger 2500 Hz rapid / Overstay 1800 Hz pulse).',
  },
  {
    wireNo: 'B3',
    subsystem: '3× Passive Buzzers',
    fromPoint: 'Bay 2 Passive Piezo Buzzer (+ / −)',
    toPoint: '(+) Marked Pin → Row 50 (TONE_BUS) · (−) Pin → PCF8574 (0x24) Pin P1',
    wireColor: 'Red / Green (M-F)',
    beginnerNote: 'Mount beside Bay 2 gantry. Verify exposed green PCB underneath (passive buzzer, not active!).',
  },
  {
    wireNo: 'B4',
    subsystem: '3× Passive Buzzers',
    fromPoint: 'Bay 3 Passive Piezo Buzzer (+ / −)',
    toPoint: '(+) Marked Pin → Row 50 (TONE_BUS) · (−) Pin → PCF8574 (0x24) Pin P2',
    wireColor: 'Red / Yellow (M-F)',
    beginnerNote: 'D0 (RX) & D1 (TX) stay 100% untouched. PCF8574 pins P3–P7 remain spare for future expansion.',
  },
];

export const PRE_POWER_SMOKE_TEST: string[] = [
  'Check Red (+5V) and Blue (GND) rails have zero accidental short-circuit jumper between them.',
  'Confirm both 100 µF electrolytic capacitors have their white (−) stripe plugged into the Blue GND rail.',
  'Verify every single one of the 9 LEDs has a 330 Ω resistor in series (never LED directly from pin to GND).',
  'Check 2N2222 pinout (flat side toward you: Left=Emitter→TONE_BUS + 1 kΩ to GND, Middle=Base←1 kΩ←A3, Right=Collector→+5V).',
  'Verify all 4 I2C addresses are unique: LCD1=0x27 (open), LCD2=0x26 (A0), LCD3=0x25 (A1), PCF8574=0x24 (A0+A1), and passive buzzer (+) pins go to TONE_BUS while (−) pins go to P0/P1/P2.',
  'Confirm Arduino pins D0 and D1 are completely empty so USB flashing and Serial Monitor run without interference.',
];

export const MASTER_PLAN_PHASES: MasterPlanPhase[] = [
  {
    id: 'phase-0',
    phaseNumber: 0,
    title: 'Zero-State Shopping & Desk Setup',
    subtitle: 'Ordering the exact RM 76.70 kit (incl. 3× passive buzzers, PCF8574 & 2N2222) and learning polarity.',
    estimatedHours: '1.5 hrs',
    milestone: 'All 11 component families inspected, sorted by bay, and verified before powering on.',
  },
  {
    id: 'phase-1',
    phaseNumber: 1,
    title: 'Arduino IDE, CH340 Driver & First LED',
    subtitle: 'Installing software from zero and proving USB upload + Serial Monitor output.',
    estimatedHours: '1.0 hr',
    milestone: 'Uno flashes cleanly over USB, prints at 9600 baud, and blinks 1 breadboard LED via 330 Ω.',
  },
  {
    id: 'phase-2',
    phaseNumber: 2,
    title: 'Bay 1 Ultrasonic Sensor & 3-LED Matrix',
    subtitle: 'Measuring 2–20 cm distances with 1 HC-SR04 and driving Green, Yellow, and Red LEDs.',
    estimatedHours: '1.5 hrs',
    milestone: 'Moving a toy car switches LEDs cleanly across >20 cm, 10–20 cm, 5–9 cm, and <5 cm.',
  },
  {
    id: 'phase-3',
    phaseNumber: 3,
    title: '4-Device I2C Bus (3× LCD + PCF8574 0x24)',
    subtitle: 'Assigning 0x27, 0x26, 0x25 (LCDs) and 0x24 (Buzzer Expander) on shared pins A4/A5.',
    estimatedHours: '2.0 hrs',
    milestone: 'I2C Scanner detects 0x24, 0x25, 0x26, and 0x27 simultaneously with zero bus hangs.',
  },
  {
    id: 'phase-4',
    phaseNumber: 4,
    title: '2N2222 3-Buzzer Bus & 1:20 Physical Rig',
    subtitle: 'Wire-by-wire assembly for all 20 pins, 2N2222 tone buffer, 3 passive buzzers & gantry.',
    estimatedHours: '3.0 hrs',
    milestone: 'All 20/20 Uno pins + 0x24 expander wired cleanly with LCD, 3 LEDs, HC-SR04 & buzzer per bay.',
  },
  {
    id: 'phase-5',
    phaseNumber: 5,
    title: 'Firmware Upload, 10-Point QA & Viva',
    subtitle: 'Uploading kie1004_smart_parking_v3.ino, passing all 10 tests, and rehearsing defense.',
    estimatedHours: '2.0 hrs',
    milestone: '10/10 QA pass (incl. mixed 2000 Hz test) and every member can explain the full code.',
  },
];

export const MASTER_PLAN_STEPS: MasterPlanStep[] = [
  // PHASE 0
  {
    id: 'p0-s1',
    phaseId: 'phase-0',
    stepNumber: 1,
    title: 'Purchase Exact Recalculated Hardware Kit (RM 76.70)',
    durationMin: 30,
    difficulty: 'Beginner',
    goal: 'Order all 11 component families once with zero incompatible parts (RM 70.50 active + RM 6.20 mandatory spares).',
    actions: [
      '1× Arduino Uno R3 (ATmega328P) with USB data cable (~RM 18.00). Genuine or CH340 clone both work.',
      '4× HC-SR04 Ultrasonic Sensors (3 active bays + 1 spare, ~RM 12.00 total) and 3× 16×2 I2C LCD Displays with pre-soldered PCF8574 backpacks (~RM 22.50 total).',
      '1× PCF8574 I2C 8-Bit I/O Expander Module (~RM 3.50, set to 0x24 via A0+A1) + 1× 2N2222 NPN Transistor TO-92 with 2× 1 kΩ resistors (~RM 0.50).',
      '3× 5 V Passive Piezo Buzzers (~RM 4.50 total — confirm exposed green PCB underneath so multi-pitch tone() works on all 3 bays).',
      '15× 5 mm Diffused LEDs (~RM 1.80), 10× 330 Ω resistors (~RM 1.00), 2× 100 µF + 2× 0.1 µF decoupling caps (~RM 1.20), 830-pt breadboard + jumper cables (~RM 11.70).',
    ],
    expectedOutput: 'Complete 11-item kit matching Table 5 (RM 76.70 total = RM 15.34/student across 5 members).',
    rookieMistake: 'Buying active black-epoxy buzzers instead of passive green-PCB buzzers — passive buzzers let our 2N2222 bus play 2500 Hz (Danger), 1800 Hz (Overstay), and 2000 Hz (Mixed)!',
  },
  {
    id: 'p0-s2',
    phaseId: 'phase-0',
    stepNumber: 2,
    title: 'Gather Tools & 1:20 Tabletop Rig Materials',
    durationMin: 20,
    difficulty: 'Beginner',
    goal: 'Prepare basic lab tools and cardboard/felt supplies before assembly.',
    actions: [
      'Borrow a 30–60 W soldering iron and solder wire from the faculty lab (needed ONLY for 2 tiny pads: A0 on LCD #2 and A1 on LCD #3).',
      'Prepare a small Phillips screwdriver to tune the blue contrast potentiometer on the back of each I2C LCD.',
      'Collect a 36 × 26 cm foamboard/cardboard base, 5 cm tall divider strips lined with thin felt (absorbs stray 40 kHz echoes), hot-glue gun, ruler, and 3 solid die-cast toy cars (~9–10 cm long).',
      'Optional: borrow a multimeter to verify 5 V rail stability (≥ 4.75 V) and solder bridge continuity.',
    ],
    expectedOutput: 'Dry, organized bench with soldering iron, screwdriver, felt-lined cardboard materials, and 3 toy cars.',
    rookieMistake: 'Using lightweight hollow paper cutouts as test vehicles — solid plastic or die-cast cars reflect flat 40 kHz echoes reliably.',
  },
  {
    id: 'p0-s3',
    phaseId: 'phase-0',
    stepNumber: 3,
    title: 'Learn Component Polarity & 330 Ω Resistor Rules',
    durationMin: 20,
    difficulty: 'Beginner',
    goal: 'Identify positive (+) and negative (−) terminals so zero parts get damaged.',
    actions: [
      'Diffused LEDs: Longer leg = Anode (+) toward Arduino pin; shorter leg on flat rim = Cathode (−) via 330 Ω resistor to GND.',
      'Electrolytic Capacitors (100 µF): White stripe with "−" signs marks the negative leg → MUST go to Blue GND rail; longer unmarked leg → Red +5 V rail.',
      'Ceramic Capacitors (0.1 µF) & 330 Ω Resistors: Non-polarized — either orientation works identically.',
      'HC-SR04 Sensors: Front labels show VCC (+5 V), TRIG, ECHO, GND. Passive Buzzers (×3): "+" marked leg → shared TONE_BUS (2N2222 Emitter), "−" leg → PCF8574 P0/P1/P2.',
      '2N2222 NPN Transistor (TO-92 flat face toward you): Left = Emitter (E), Middle = Base (B), Right = Collector (C). Always use a 1 kΩ resistor on Base and 1 kΩ pull-down on Emitter.',
    ],
    expectedOutput: 'All 11 part families sorted into 3 bay trays with polarity & TO-92 E-B-C legs verified visually.',
    rookieMistake: 'Reversing a 100 µF electrolytic capacitor polarity or flipping the 2N2222 backwards — always verify flat face orientation before wiring.',
  },
  {
    id: 'p0-s4',
    phaseId: 'phase-0',
    stepNumber: 4,
    title: 'Prepare Your 830-Point Breadboard Power Rails',
    durationMin: 20,
    difficulty: 'Beginner',
    goal: 'Eliminate the #1 beginner wiring bug: unbridged split power rails on 830-point breadboards.',
    actions: [
      'Inspect the red (+) and blue (−) lines running down the edges of your 830-point breadboard. If there is a gap halfway down, bridge it with short red/black jumper wires.',
      'Connect the top Blue (−) rail to the bottom Blue (−) rail with a black wire so ground is shared on both sides of the board.',
      'Remember the golden rule: each 5-hole vertical column (a–e or f–j) is connected internally, separated by the center ravine.',
    ],
    expectedOutput: 'Continuous +5 V and GND rails along the entire 830-point breadboard.',
    rookieMistake: 'Placing both legs of a 330 Ω resistor or LED in the exact same 5-hole column — that shorts the component across itself.',
  },

  // PHASE 1
  {
    id: 'p1-s5',
    phaseId: 'phase-1',
    stepNumber: 5,
    title: 'Install Arduino IDE 2.x & CH340 USB Driver',
    durationMin: 20,
    difficulty: 'Beginner',
    goal: 'Establish working C++ compilation and USB flashing from your laptop to Arduino Uno.',
    actions: [
      'Install Arduino IDE 2.x from arduino.cc/en/software.',
      'Connect Arduino Uno via USB data cable; confirm the green ON LED lights up on the board.',
      'Select Tools > Board > Arduino AVR Boards > Arduino Uno and pick the active COM / usbserial port.',
      'If no port appears on a clone Uno with a rectangular CH340 chip near the USB port, install the WCH CH341SER driver and replug USB.',
    ],
    expectedOutput: 'Arduino IDE displays "Arduino Uno on COMx" cleanly with zero port errors.',
    rookieMistake: 'Using a power-only USB cable with no data wires, or accidentally plugging wires into D0/D1 during upload.',
  },
  {
    id: 'p1-s6',
    phaseId: 'phase-1',
    stepNumber: 6,
    title: 'Install the LiquidCrystal I2C Library',
    durationMin: 10,
    difficulty: 'Beginner',
    goal: 'Add the single external library required alongside built-in Wire.h.',
    actions: [
      'Click the Library Manager icon in Arduino IDE 2.x.',
      'Search "LiquidCrystal I2C" and install the package by Frank de Brabander.',
      'Verify Wire.h is already built into the AVR core (no download needed).',
    ],
    expectedOutput: 'LiquidCrystal_I2C compiles cleanly in a blank test sketch.',
    rookieMistake: 'Installing a different fork whose constructor takes 8 arguments instead of LiquidCrystal_I2C(0x27, 16, 2).',
    snippetLabel: 'Required Sketch Includes',
    snippet: '#include <Wire.h>\n#include <LiquidCrystal_I2C.h>',
  },
  {
    id: 'p1-s7',
    phaseId: 'phase-1',
    stepNumber: 7,
    title: 'Upload Serial Hello Test & Verify 9600 Baud',
    durationMin: 15,
    difficulty: 'Beginner',
    goal: 'Confirm upload pipeline and Serial Monitor debugging work reliably.',
    actions: [
      'Upload the 8-line sanity sketch below to Arduino Uno.',
      'Open Serial Monitor (Ctrl+Shift+M) and set baud rate to 9600.',
      'Verify clean text lines print every second.',
    ],
    expectedOutput: '"KIE1004 Uno Ready!" prints once per second with zero garbled characters.',
    rookieMistake: 'Leaving Serial Monitor at 115200 baud while code calls Serial.begin(9600).',
    snippetLabel: 'Phase 1 Sanity Sketch',
    snippet: 'void setup() {\n  Serial.begin(9600);\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(13, HIGH); Serial.println("KIE1004 Uno Ready!"); delay(500);\n  digitalWrite(13, LOW);  delay(500);\n}',
  },
  {
    id: 'p1-s8',
    phaseId: 'phase-1',
    stepNumber: 8,
    title: 'Wire Power Rails, Decoupling Caps & First Breadboard LED',
    durationMin: 15,
    difficulty: 'Hands-On',
    goal: 'Build your power rails safely and verify LED polarity with a 330 Ω resistor on Pin D8.',
    actions: [
      'Unplug USB power first! Wire Uno 5V → Red (+) Rail and Uno GND → Blue (−) Rail.',
      'Insert 1× 100 µF electrolytic cap (white − stripe to Blue rail) + 1× 0.1 µF ceramic cap across the rails.',
      'Place Bay 1 Green LED across two separate rows: Long leg (+) → jumper to Arduino D8; Short leg (−) → 330 Ω resistor → Blue GND rail.',
      'Plug USB back in and blink Pin 8 to confirm bright, cool 8.5 mA operation.',
    ],
    expectedOutput: 'Bay 1 Green LED blinks crisply without getting warm.',
    rookieMistake: 'Inserting the LED backwards — it will not break, simply flip its legs 180° if it stays dark.',
  },

  // PHASE 2
  {
    id: 'p2-s9',
    phaseId: 'phase-2',
    stepNumber: 9,
    title: 'Wire & Calibrate Bay 1 HC-SR04 Ultrasonic Sensor',
    durationMin: 25,
    difficulty: 'Hands-On',
    goal: 'Verify accurate 2–20 cm centimeter readings on Pins D2 (TRIG_1) and D3 (ECHO_1).',
    actions: [
      'Wire Bay 1 HC-SR04 using 30 cm M-F jumpers: VCC → Red +5 V rail, GND → Blue GND rail, TRIG → D2, ECHO → D3.',
      'Upload the probe snippet below and hold a flat toy car at 5 cm, 10 cm, and 20 cm beside a ruler.',
      'Check Serial Monitor readings match your physical ruler within ±1 cm.',
    ],
    expectedOutput: 'Steady centimeter readout with 15,000 µs bounded pulseIn() timeout preventing freezes.',
    rookieMistake: 'Swapping TRIG (D2) and ECHO (D3), which causes pulseIn() to always return 0.',
    snippetLabel: 'Bay 1 Bounded Ultrasonic Test',
    snippet: 'digitalWrite(2, LOW); delayMicroseconds(2);\ndigitalWrite(2, HIGH); delayMicroseconds(10);\ndigitalWrite(2, LOW);\nunsigned long dur = pulseIn(3, HIGH, 15000UL);\nint cm = (dur == 0) ? 999 : (int)(dur / 58UL);\nSerial.println(cm);',
  },
  {
    id: 'p2-s10',
    phaseId: 'phase-2',
    stepNumber: 10,
    title: 'Wire Bay 1 Full 3-LED Distance Matrix (D8, D9, D10)',
    durationMin: 30,
    difficulty: 'Hands-On',
    goal: 'Verify the exact 1:20 scale zones: >20 cm (Green), 10–20 cm (Green), 5–9 cm (Yellow), <5 cm (Red flash).',
    actions: [
      'Add Yellow LED on D9 and Red LED on D10, each with its own 330 Ω resistor from short leg (−) to Blue GND rail.',
      'Slide a toy car slowly from 25 cm down to 3 cm and verify clean transitions at 20 cm, 10 cm, and 5 cm.',
      'Verify Green, Yellow, and Red glow brightly without dimming each other.',
    ],
    expectedOutput: 'Clear traffic-light distance feedback across all 4 zones.',
    rookieMistake: 'Sharing one 330 Ω resistor across multiple LEDs causes brightness drops. Give every LED its own 330 Ω resistor.',
  },
  {
    id: 'p2-s11',
    phaseId: 'phase-2',
    stepNumber: 11,
    title: 'Verify 5.0-Second Stationary Hold & ±1 cm Deadband',
    durationMin: 35,
    difficulty: 'Guided',
    goal: 'Prove that moving the car resets the 5 s countdown and stopping motionless starts count-up cleanly at 00:00.',
    actions: [
      'Place a toy car at ~12 cm and nudge it by 3–4 cm after 2 seconds — verify the 5.0 s timer resets immediately.',
      'Leave the car motionless at ~12 cm for 5.0 continuous seconds — confirm state switches to OCCUPIED and elapsed time starts cleanly at 00:00 (NOT 00:05).',
      'Lift the car out for 1.5 s and put it back — verify 3.0 s exit debounce keeps the session alive; remove for ≥3.0 s to print receipt.',
    ],
    expectedOutput: 'Zero false starts during slow reverse maneuvers and immunity to ±1 cm ultrasonic jitter.',
    rookieMistake: 'Testing by holding the car in a shaky hand (>1 cm movement resets the stationary anchor as designed!). Rest the car flat on the table.',
  },

  // PHASE 3
  {
    id: 'p3-s12',
    phaseId: 'phase-3',
    stepNumber: 12,
    title: 'Test All 3 I2C LCDs One-by-One at Default 0x27',
    durationMin: 20,
    difficulty: 'Beginner',
    goal: 'Confirm all three screens work and have tuned contrast BEFORE soldering any address pads.',
    actions: [
      'Wire ONLY LCD #1: GND → Blue GND, VCC → Red +5 V, SDA → Arduino A4, SCL → Arduino A5.',
      'Run the Arduino I2C Scanner sketch and confirm Serial Monitor prints "Found device at 0x27" (if it says 0x3F, note PCF8574AT chips use 0x3F/0x3E/0x3D).',
      'Display "BAY 1 READY" and turn the blue contrast screw on the back until white characters look crisp.',
      'Unplug LCD #1 and repeat this quick health check on LCD #2 and LCD #3.',
    ],
    expectedOutput: 'All 3 LCDs confirmed healthy with contrast adjusted before soldering.',
    rookieMistake: 'Assuming a blank glowing LCD is dead when its blue contrast potentiometer simply needs a half-turn clockwise.',
  },
  {
    id: 'p3-s13',
    phaseId: 'phase-3',
    stepNumber: 13,
    title: 'Configure Unique Addresses: 0x27, 0x26, 0x25 & PCF8574 0x24',
    durationMin: 35,
    difficulty: 'Hands-On',
    goal: 'Assign 4 distinct 7-bit I2C addresses so 3 LCDs and the 3-buzzer expander share A4/A5 cleanly.',
    actions: [
      'Stick tape labels on each module: "BAY 1 LCD (0x27)", "BAY 2 LCD (0x26)", "BAY 3 LCD (0x25)", and "3× BUZZER EXPANDER (0x24)".',
      'LCD #1 (Bay 1): Leave A0, A1, A2 completely OPEN → Address = 0x27.',
      'LCD #2 (Bay 2): Place a neat solder bridge across copper pad A0 ONLY → Address = 0x26.',
      'LCD #3 (Bay 3): Place a neat solder bridge across copper pad A1 ONLY → Address = 0x25.',
      'PCF8574 Buzzer Expander: Move A0 and A1 jumper shunts to GND (or bridge both A0 + A1 pads) → Address = 0x24.',
    ],
    expectedOutput: 'Four uniquely addressed I2C devices ready for parallel bus wiring on A4/A5.',
    rookieMistake: 'Leaving PCF8574 at default 0x27 where it collides with Bay 1 LCD — always set A0+A1 to GND for 0x24.',
  },
  {
    id: 'p3-s14',
    phaseId: 'phase-3',
    stepNumber: 14,
    title: 'Daisy-Chain All 4 I2C Modules on A4/A5 & Run Multi-I2C Scan',
    durationMin: 30,
    difficulty: 'Verification',
    goal: 'Verify all 3 displays AND the 0x24 buzzer expander respond simultaneously without bus lockups.',
    actions: [
      'Create a dedicated 2-row I2C hub on the breadboard: Row 55 for SDA (wired to Uno A4) and Row 56 for SCL (wired to Uno A5).',
      'Connect all 3 LCD backpacks AND the PCF8574 (0x24) in parallel to Row 55 (SDA), Row 56 (SCL), Red +5 V rail, and Blue GND rail, placing the second 100 µF + 0.1 µF decoupling pair nearby.',
      'Do NOT install extra external 4.7 kΩ pull-up resistors — the 4 onboard 4.7 kΩ pull-ups already yield R_eq = 1.18 kΩ (4.26 mA sink, well within I2C/ATmega spec).',
      'Run I2C Scanner and confirm Serial Monitor lists all 4 addresses: 0x24, 0x25, 0x26, and 0x27.',
    ],
    expectedOutput: 'I2C Scanner reports 4 devices (0x24, 0x25, 0x26, 0x27) with zero bus hangs.',
    rookieMistake: 'Swapping A4 (SDA) and A5 (SCL) — Scanner will output "No I2C devices found".',
    snippetLabel: 'Expected 4-Device I2C Scanner Output',
    snippet: 'I2C device found at address 0x24  (PCF8574 3-Buzzer Expander)\nI2C device found at address 0x25  (Bay 3 LCD)\nI2C device found at address 0x26  (Bay 2 LCD)\nI2C device found at address 0x27  (Bay 1 LCD)\nDone. 4 devices detected.',
  },

  // PHASE 4
  {
    id: 'p4-s15',
    phaseId: 'phase-4',
    stepNumber: 15,
    title: 'Wire 2N2222 Tone Buffer, 3 Passive Buzzers & Full 20-Pin Circuit',
    durationMin: 55,
    difficulty: 'Hands-On',
    goal: 'Connect all remaining bays, 6 LEDs, 2N2222 buffer, and 3 passive buzzers (0x24 P0–P2) while keeping D0/D1 untouched.',
    actions: [
      'Unplug USB power completely! Follow the "Exact Circuit Assembly" sub-tab above from Wire P1 through Wire B4.',
      'Ultrasonic Sensors: Bay 1 Trig/Echo → D2/D3, Bay 2 → D4/D5, Bay 3 → D6/D7. 9 Diffused LEDs (each with 330 Ω to GND): D8–D13 & A0–A2.',
      '2N2222 Emitter Follower (flat face toward you): Collector (right) → Red +5V; Base (middle) ← 1 kΩ ← Arduino A3; Emitter (left) → Row 50 (TONE_BUS) + 1 kΩ pull-down to Blue GND.',
      '3× Passive Buzzers: Plug all three (+) marked pins into Row 50 (TONE_BUS), and wire their (−) pins to PCF8574 (0x24) pins P0 (Bay 1), P1 (Bay 2), and P2 (Bay 3).',
    ],
    expectedOutput: 'All 20/20 Arduino Uno pins + PCF8574 0x24 wired cleanly with zero pin conflicts and D0/D1 free.',
    rookieMistake: 'Wiring passive buzzers directly to Pin A3 without the 2N2222 buffer (exceeds 40 mA absolute pin limit when all 3 sound) or reversing 2N2222 Collector and Emitter.',
  },
  {
    id: 'p4-s16',
    phaseId: 'phase-4',
    stepNumber: 16,
    title: 'Run the 6-Point Pre-Power Smoke Test Before Plugging USB',
    durationMin: 15,
    difficulty: 'Verification',
    goal: 'Catch shorts, reversed caps, or flipped transistor pins BEFORE electricity enters the board.',
    actions: [
      'Visually trace Red (+5V) and Blue (GND) rails end-to-end to confirm zero direct short between them.',
      'Double-check BOTH 100 µF electrolytic capacitors have their white (−) stripe on the Blue GND rail and all 9 LEDs have 330 Ω resistors.',
      'Double-check 2N2222 pinout (E=left→TONE_BUS+1kΩ GND, B=mid←1kΩ←A3, C=right→+5V) and passive buzzer polarity (+→TONE_BUS, −→P0/P1/P2).',
      'Confirm D0/D1 are empty. Plug in USB and verify Uno green ON LED glows steady (unplug immediately if anything feels warm!).',
    ],
    expectedOutput: 'Cool, stable 5 V power rail (≥ 4.75 V), all 3 LCD backlights glowing evenly, all 3 buzzers silent on boot (0xFF).',
    rookieMistake: 'Forgetting the 1 kΩ emitter pull-down resistor on Row 50 — without it, the piezo elements float and sound faint.',
  },
  {
    id: 'p4-s17',
    phaseId: 'phase-4',
    stepNumber: 17,
    title: 'Assemble 1:20 Felt-Lined 3-Bay Vertical Gantry Rig',
    durationMin: 60,
    difficulty: 'Hands-On',
    goal: 'Mount every bay in vertical alignment: HC-SR04 bottom → 3 LEDs + dedicated passive buzzer middle → 16×2 LCD top.',
    actions: [
      'Cut a 36 × 26 cm foamboard/cardboard base and mark three 10 × 20 cm bays separated by 5 cm tall felt-lined cardboard dividers (absorbs stray 40 kHz echoes).',
      'Glue a sturdy 16 cm tall back gantry wall across the rear of all 3 bays.',
      'Mount per bay from BOTTOM to TOP: (1) HC-SR04 strictly vertical 2 cm above floor, (2) Green/Yellow/Red LED trio + Bay Passive Buzzer at 7.5 cm height, (3) 16×2 I2C LCD at 12.5 cm.',
      'Route the 30 cm M-F jumper ribbons cleanly through small slots behind the back wall to the breadboard (housing Uno, 2N2222 buffer, and PCF8574 0x24).',
    ],
    expectedOutput: 'Clean tabletop prototype where all 3 LCDs, 9 LEDs, 3 passive buzzers, and 3 toy-car stalls are clearly visible & audible.',
    rookieMistake: 'Tilting an HC-SR04 slightly downward so it echoes off the cardboard floor permanently — keep the sensor face strictly 90° vertical.',
  },

  // PHASE 5
  {
    id: 'p5-s18',
    phaseId: 'phase-5',
    stepNumber: 18,
    title: 'Download & Flash Full KIE1004 Arduino Firmware',
    durationMin: 20,
    difficulty: 'Guided',
    goal: 'Upload kie1004_smart_parking_v3.ino and verify clean boot across all 3 LCDs.',
    actions: [
      'Go to the "C++ Code Studio" tab in this dashboard and click "Download .ino".',
      'Open kie1004_smart_parking_v3.ino in Arduino IDE and click Upload (D0/D1 are free so zero unplugging needed).',
      'Open Serial Monitor at 9600 baud and verify all 3 LCDs show their startup banner then settle to "B1 AVAILABLE / D:32cm T:00:00".',
    ],
    expectedOutput: 'Zero compiler errors, SRAM well below 50%, all 3 LCDs updating smoothly without flicker.',
    rookieMistake: 'Forgetting to update 0x27/0x26/0x25 if your vendor shipped PCF8574AT chips (0x3F/0x3E/0x3D).',
  },
  {
    id: 'p5-s19',
    phaseId: 'phase-5',
    stepNumber: 19,
    title: 'Run Full 10-Point QA Verification Suite',
    durationMin: 40,
    difficulty: 'Verification',
    goal: 'Sign off every test case (T01–T10) before demonstration day.',
    actions: [
      'Test T01–T04: Verify 4-device I2C scan (0x24–0x27), empty baseline (0xFF silent), motion-reset during 5 s hold, and clean 00:00 count-up start after 5.0 s stillness.',
      'Test T05–T06: Park cars at 4 cm, 8 cm, and 15 cm simultaneously → verify ONLY Bay 1 buzzer sounds (2500 Hz rapid, P0=LOW) while Bays 2–3 stay silent; let Bay 3 reach 240 sim min (4 hours) → verify mixed 2000 Hz carrier with Bay 1 rapid (150 ms) & Bay 3 slow (500/1000 ms) simultaneously!',
      'Test T07–T10: Verify 3.0 s exit debounce & Serial RM 1/30 min receipt (15 m free grace), test Serial commands (S, T, D, R), verify Insertion Sort rejects a quick hand-wave spike, and run a 30-min stability soak.',
    ],
    expectedOutput: '10/10 QA items checked off in the "BOM, QA & Defense" tab.',
    rookieMistake: 'Skipping the simultaneous mixed-alert test (Bay 1 Danger + Bay 3 Overstay) — verify both distinct cadences run independently on 0x24.',
  },
  {
    id: 'p5-s20',
    phaseId: 'phase-5',
    stepNumber: 20,
    title: 'Rehearse Layperson Presentation Scripts & 5-Min Viva',
    durationMin: 40,
    difficulty: 'Verification',
    goal: 'Prepare every team member to present smoothly and answer lecturer questions.',
    actions: [
      'Download the Presentation Slides (.pdf) from the "Presentation Slides" tab and practice using the complete word-for-word Speaker Scripts provided for each slide.',
      'Practice tracing 4 key code mechanisms live: 2D LED_PINS[3][3] & distHistory[3][3] arrays, Insertion Sort median filter & Linear Search open-bay finder, overloaded printTwoDigits(), and pointer pass-by-reference computeLotSummary().',
      'Submit your zipped project files and 10-slide PDF deck via SPeCTRUM before 27 December 2026, 5:00 PM.',
    ],
    expectedOutput: 'Confident 5-minute demo + spotless answers to lecturer programming and hardware questions.',
    rookieMistake: 'Reading slides word-for-word instead of using the conversational speaker script while pointing at the clean diagrams.',
  },
];
