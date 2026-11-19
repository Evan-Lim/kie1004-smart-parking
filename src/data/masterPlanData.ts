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
  subsystem: 'Power & Rails' | 'Ultrasonic Sensors' | '9 LEDs & 330 Ω' | '3× I2C LCDs' | 'Overstay Buzzer';
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
    toPoint: 'Breadboard Row 55 (SDA Junction) & Row 56 (SCL Junction)',
    wireColor: 'Blue (SDA) / Purple (SCL)',
    beginnerNote: 'Creates a clean 5-hole I2C hub on the breadboard where all 3 LCDs plug in parallel.',
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

  // Overstay Buzzer
  {
    wireNo: 'B1',
    subsystem: 'Overstay Buzzer',
    fromPoint: '5 V Passive Piezo Buzzer (+ / −)',
    toPoint: '(+) Longer/Marked Pin → Arduino A3 · (−) Pin → Blue GND Rail',
    wireColor: 'Orange / Black (M-M)',
    beginnerNote: 'Verify green PCB underneath (passive buzzer). D0 (RX) & D1 (TX) remain 100% untouched!',
  },
];

export const PRE_POWER_SMOKE_TEST: string[] = [
  'Check Red (+5V) and Blue (GND) rails have zero accidental short-circuit jumper between them.',
  'Confirm both 100 µF electrolytic capacitors have their white (−) stripe plugged into the Blue GND rail.',
  'Verify every single one of the 9 LEDs has a 330 Ω resistor in series (never LED directly from pin to GND).',
  'Verify Bay 2 LCD has ONLY pad A0 bridged and Bay 3 LCD has ONLY pad A1 bridged (no stray solder touching adjacent pads).',
  'Confirm Arduino pins D0 and D1 are completely empty so USB flashing and Serial Monitor run without interference.',
];

export const MASTER_PLAN_PHASES: MasterPlanPhase[] = [
  {
    id: 'phase-0',
    phaseNumber: 0,
    title: 'Zero-State Shopping & Desk Setup',
    subtitle: 'Ordering the exact RM 69.70 kit and learning component polarity from scratch.',
    estimatedHours: '1.5 hrs',
    milestone: 'All 9 component families inspected, sorted by bay, and verified before powering on.',
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
    title: 'PCF8574 I2C Solder Bridges & 3-LCD Bus',
    subtitle: 'Assigning 0x27, 0x26, and 0x25 so all three 16×2 LCDs share Arduino pins A4 and A5.',
    estimatedHours: '2.0 hrs',
    milestone: 'I2C Scanner detects 0x25, 0x26, and 0x27 simultaneously with zero bus hangs.',
  },
  {
    id: 'phase-4',
    phaseNumber: 4,
    title: 'Exact Circuit Assembly & 1:20 Physical Rig',
    subtitle: 'Wire-by-wire breadboard assembly for all 20 pins, smoke-test check, and foamboard gantry.',
    estimatedHours: '3.0 hrs',
    milestone: 'All 20/20 Uno pins wired cleanly with LCD above 3 LEDs above HC-SR04 per bay.',
  },
  {
    id: 'phase-5',
    phaseNumber: 5,
    title: 'Firmware Upload, 10-Point QA & Viva',
    subtitle: 'Uploading kie1004_smart_parking_v3.ino, passing all 10 tests, and rehearsing defense.',
    estimatedHours: '2.0 hrs',
    milestone: '10/10 QA pass and every member can explain arrays, sorting, searching, and pointers.',
  },
];

export const MASTER_PLAN_STEPS: MasterPlanStep[] = [
  // PHASE 0
  {
    id: 'p0-s1',
    phaseId: 'phase-0',
    stepNumber: 1,
    title: 'Purchase Exact Recalculated Hardware Kit (RM 69.70)',
    durationMin: 30,
    difficulty: 'Beginner',
    goal: 'Order every required component once with zero incompatible parts (RM 63.50 active + RM 6.20 mandatory spares).',
    actions: [
      '1× Arduino Uno R3 (ATmega328P) with USB data cable (~RM 18.00). Genuine or CH340 clone both work.',
      '4× HC-SR04 Ultrasonic Sensors (3 active bays + 1 spare, ~RM 12.00 total). Confirm 5 V TTL model.',
      '3× 16×2 LCD Displays WITH pre-soldered PCF8574 I2C backpacks (~RM 22.50 total). Check seller photos for visible A0, A1, A2 copper pads on the back.',
      '9× active + 6 spare 5 mm Diffused LEDs (Green, Yellow, Red, ~RM 1.80) and 10× 330 Ω 1/4 W resistors (Orange-Orange-Brown-Gold, ~RM 1.00).',
      '1× 5 V Passive Piezo Buzzer (~RM 1.50 — check exposed green PCB underneath so tone() works), 2× 100 µF electrolytic + 2× 0.1 µF ceramic decoupling caps (~RM 1.20), 1× 830-point breadboard + 2× M-M & 3× 30 cm M-F jumper packs (~RM 11.50).',
    ],
    expectedOutput: 'Complete kit matching Table 5 (~RM 13.94/student across 5 team members).',
    rookieMistake: 'Buying plain 16-pin LCDs without I2C backpacks or buying an active black-epoxy buzzer instead of a passive buzzer (passive buzzers support tone(A3, 2000) cleanly).',
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
      'HC-SR04 Sensors: Front labels show VCC (+5 V), TRIG, ECHO, GND. Passive Buzzer: "+" pin to Arduino A3, "−" pin to GND.',
    ],
    expectedOutput: 'All parts sorted into 3 bay trays with polarity verified visually.',
    rookieMistake: 'Reversing a 100 µF electrolytic capacitor polarity across +5 V and GND — always double-check the white minus stripe goes to GND.',
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
    title: 'Solder PCF8574 Address Pads A0 (0x26) & A1 (0x25)',
    durationMin: 35,
    difficulty: 'Hands-On',
    goal: 'Give each bay LCD its own unique 7-bit I2C address so all 3 share A4/A5 cleanly.',
    actions: [
      'Stick tape labels on the back: "BAY 1 (0x27)", "BAY 2 (0x26)", "BAY 3 (0x25)".',
      'LCD #1 (Bay 1): Leave A0, A1, A2 completely OPEN → Address = 0x27.',
      'LCD #2 (Bay 2): Place a neat solder bridge across copper pad A0 ONLY → Address = 0x26.',
      'LCD #3 (Bay 3): Place a neat solder bridge across copper pad A1 ONLY → Address = 0x25.',
      'Zoom in with your phone camera to confirm clean blobs touching only the target pad pair.',
    ],
    expectedOutput: 'Three uniquely hardware-addressed I2C LCD modules ready for parallel bus wiring.',
    rookieMistake: 'Bridging both A0 and A1 on the same LCD (produces 0x24) or overheating the pad for >5 seconds.',
  },
  {
    id: 'p3-s14',
    phaseId: 'phase-3',
    stepNumber: 14,
    title: 'Daisy-Chain All 3 LCDs on A4/A5 & Run Multi-I2C Scan',
    durationMin: 30,
    difficulty: 'Verification',
    goal: 'Verify all three displays respond simultaneously without bus lockups.',
    actions: [
      'Create a dedicated 2-row I2C hub on the breadboard: Row 55 for SDA (wired to Uno A4) and Row 56 for SCL (wired to Uno A5).',
      'Connect all three LCD backpacks in parallel to Row 55 (SDA), Row 56 (SCL), Red +5 V rail, and Blue GND rail, placing the second 100 µF + 0.1 µF decoupling pair right beside the LCD power taps.',
      'Do NOT install extra external 4.7 kΩ pull-up resistors — the 3 backpacks already create a 1.57 kΩ parallel pull-up (3.19 mA sink).',
      'Run I2C Scanner and confirm Serial Monitor lists all 3 addresses: 0x25, 0x26, and 0x27.',
    ],
    expectedOutput: 'I2C Scanner reports 3 devices (0x25, 0x26, 0x27) and each display prints its own bay header independently.',
    rookieMistake: 'Swapping A4 (SDA) and A5 (SCL) — Scanner will output "No I2C devices found".',
    snippetLabel: 'Expected Multi-LCD I2C Scanner Output',
    snippet: 'I2C device found at address 0x25  (Bay 3 LCD)\nI2C device found at address 0x26  (Bay 2 LCD)\nI2C device found at address 0x27  (Bay 1 LCD)\nDone. 3 devices detected.',
  },

  // PHASE 4
  {
    id: 'p4-s15',
    phaseId: 'phase-4',
    stepNumber: 15,
    title: 'Complete Full 20-Pin Breadboard Wiring (Follow Exact Wire Table)',
    durationMin: 50,
    difficulty: 'Hands-On',
    goal: 'Connect all remaining bays, 6 LEDs, and Pin A3 buzzer with zero pin conflicts while keeping D0/D1 untouched.',
    actions: [
      'Unplug USB power completely! Follow the "Exact Wire-by-Wire Circuit Assembly Table" in the sub-tab above from Wire P1 through Wire B1.',
      'Ultrasonic Sensors: Bay 1 Trig/Echo → D2/D3, Bay 2 → D4/D5, Bay 3 → D6/D7 (all VCC → Red +5 V, GND → Blue GND).',
      '9 Diffused LEDs (each with its own 330 Ω resistor to GND): Bay 1 G/Y/R → D8/D9/D10, Bay 2 G/Y/R → D11/D12/D13, Bay 3 G/Y/R → A0/A1/A2.',
      'Overstay Buzzer: Passive piezo (+) pin → Arduino A3, (−) pin → Blue GND rail.',
    ],
    expectedOutput: 'All 20/20 Arduino Uno pins connected cleanly with zero tangled loops and D0/D1 free.',
    rookieMistake: 'Forgetting that analog pins A0–A2 work identically to digital pins for Bay 3 LEDs, or accidentally wiring to VIN instead of 5V.',
  },
  {
    id: 'p4-s16',
    phaseId: 'phase-4',
    stepNumber: 16,
    title: 'Run the 5-Point Pre-Power Smoke Test Before Plugging USB',
    durationMin: 15,
    difficulty: 'Verification',
    goal: 'Catch shorts, reversed capacitors, or missing resistors BEFORE electricity enters the board.',
    actions: [
      'Visually trace Red (+5V) and Blue (GND) rails end-to-end to confirm zero direct short between them.',
      'Double-check BOTH 100 µF electrolytic capacitors have their white (−) stripe on the Blue GND rail.',
      'Count all 9× 330 Ω resistors (one touching every LED short cathode leg to GND).',
      'Verify A4 → SDA hub and A5 → SCL hub, and confirm D0/D1 are empty. Plug in USB and verify Uno green ON LED glows steady (unplug immediately if anything feels warm!).',
    ],
    expectedOutput: 'Cool, stable 5 V power rail (≥ 4.75 V), all 3 LCD backlights glowing evenly, zero resets.',
    rookieMistake: 'Plugging USB in before double-checking capacitor polarity or VCC/GND taps on the 4-pin LCD ribbons.',
  },
  {
    id: 'p4-s17',
    phaseId: 'phase-4',
    stepNumber: 17,
    title: 'Assemble 1:20 Felt-Lined 3-Bay Vertical Gantry Rig',
    durationMin: 60,
    difficulty: 'Hands-On',
    goal: 'Mount every bay in exact vertical alignment: HC-SR04 bottom → 3 LEDs middle → 16×2 LCD top.',
    actions: [
      'Cut a 36 × 26 cm foamboard/cardboard base and mark three 10 × 20 cm bays separated by 5 cm tall felt-lined cardboard dividers (absorbs stray 40 kHz echoes).',
      'Glue a sturdy 16 cm tall back gantry wall across the rear of all 3 bays.',
      'Mount per bay from BOTTOM to TOP: (1) HC-SR04 strictly vertical 2 cm above floor, (2) Green/Yellow/Red LED trio at 7.5 cm height directly above sensor, (3) 16×2 I2C LCD at 12.5 cm directly above the LEDs.',
      'Route the 30 cm M-F jumper ribbons cleanly through small slots behind the back wall to the breadboard and secure the passive buzzer on top.',
    ],
    expectedOutput: 'Clean tabletop prototype where all 3 LCDs, 9 LEDs, and 3 toy-car stalls are visible at once.',
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
      'Test T01–T04: Verify I2C addresses (0x25/0x26/0x27), empty baseline, motion-reset during 5 s hold, and clean 00:00 count-up start after 5.0 s stillness.',
      'Test T05–T06: Park cars at 4 cm, 8 cm, and 15 cm simultaneously → verify Red/Yellow/Green LEDs with SILENT buzzer; let one bay cross 180 s (180 sim min at 60×) → verify Pin A3 bay-coded 2000 Hz overstay alarm.',
      'Test T07–T10: Verify 3.0 s exit debounce & Serial RM 3/hr receipt, test Serial commands (S, T, D, R), verify Insertion Sort rejects a quick hand-wave spike, and run a 30-min stability soak.',
    ],
    expectedOutput: '10/10 QA items checked off in the "BOM, QA & Defense" tab.',
    rookieMistake: 'Skipping the 180-second live overstay check — run it at least twice on the real rig to confirm both LCD "OVERSTAY!" and Pin A3 bay-coded pulse groups.',
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
