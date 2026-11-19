export type SlideLayoutType =
  | 'cover-hero'
  | 'three-pillar'
  | 'diagram-focus'
  | 'split-code'
  | 'comparison-grid'
  | 'timeline-closing';

export type SlideDiagramType =
  | 'cover-blueprint'
  | 'driver-experience'
  | 'pinout-i2c'
  | 'fsm-tdm'
  | 'tradeoffs-matrix'
  | 'code-arrays-funcs'
  | 'code-sort-pointers'
  | 'electrical-cost'
  | 'limitations-3axis'
  | 'demo-timeline';

export interface SlideCallout {
  title: string;
  body: string;
  accent?: 'blue' | 'green' | 'amber' | 'red';
}

export interface PresentationSlide {
  id: string;
  slideNumber: number;
  layout: SlideLayoutType;
  sectionTag: string;
  title: string;
  subtitle: string;
  presenter: string;
  rubricCoverage: string;
  /** Concise slide content only — never includes the spoken script */
  highlights: SlideCallout[];
  /** Optional real C++ code snippet (used on split-code slides) */
  codeSnippetTitle?: string;
  codeSnippet?: string;
  /** Optional compact metric strip (used selectively, NOT stamped on every slide) */
  stats?: { label: string; value: string }[];
  diagramType: SlideDiagramType;
  diagramCaption: string;
  /** Complete word-for-word spoken script for the presenter (kept outside the slide) */
  spokenScript: string;
  stageCue: string;
  estSeconds: number;
}

export const PRESENTATION_SLIDES: PresentationSlide[] = [
  {
    id: 'slide-1',
    slideNumber: 1,
    layout: 'cover-hero',
    sectionTag: 'KIE1004 PROGRAMMING 1 · SEMESTER 1, 2026/2027',
    title: 'Smart Multi-Space Parking Assistance & Management System',
    subtitle: 'Three independent Arduino parking bays with live reverse guidance, 5-second stop confirmation, automatic fee timers, and an overstay alarm.',
    presenter: 'Member 1 · System Architect',
    rubricCoverage: 'Project Overview & 5-Member Team Roles (Req 7 · Teamwork)',
    stats: [
      { label: 'Independent Bays', value: '3 Slots' },
      { label: 'Hardware Kit', value: 'RM 69.70' },
      { label: 'Uno Pin Budget', value: '20 / 20 Pins' },
    ],
    highlights: [
      { title: 'Member 1 · Architect', body: 'Round-Robin scheduler & lot summary logic' },
      { title: 'Member 2 · Sensing', body: 'Ultrasonic filtering & 5-second stop rule' },
      { title: 'Member 3 · Billing', body: 'Count-up timer, fee math & receipts' },
      { title: 'Member 4 · Hardware', body: '20-pin wiring, I2C LCDs & power safety' },
      { title: 'Member 5 · HMI & QA', body: '9 LEDs, overstay alarm & 10-point testing' },
    ],
    diagramType: 'cover-blueprint',
    diagramCaption: 'Each parking slot stacks an ultrasonic sensor at bumper level, 3 distance LEDs above it, and a dedicated live timer screen on top.',
    stageCue: 'Greet the panel warmly, introduce all 5 teammates briefly, and gesture to the three-bay stack diagram.',
    estSeconds: 30,
    spokenScript:
      'Good morning everyone. Today our five-member team presents our Smart Multi-Space Parking Assistance and Management System built on a single Arduino Uno. Imagine driving into a busy parking garage where every bay actually helps you park safely, tracks your stay fairly, and alerts management if someone overstays—without needing an expensive computer. Our prototype manages three completely independent parking spaces simultaneously for under RM 70 total. On the bottom bar you can see how our five members split the work across scheduling, sensing, billing, hardware wiring, and testing so every single part of the system works together seamlessly.',
  },
  {
    id: 'slide-2',
    slideNumber: 2,
    layout: 'three-pillar',
    sectionTag: '01 · HOW IT WORKS FOR EVERYDAY DRIVERS',
    title: 'Three Simple Steps From Reversing In to Driving Out',
    subtitle: 'Designed so any driver understands what to do at a glance—without reading a manual.',
    presenter: 'Member 5 · HMI & QA Lead',
    rubricCoverage: 'Core Objectives, Distance Zones & Overstay Policy (Req 2–5)',
    highlights: [
      {
        title: '1. Reverse With Traffic-Light LEDs',
        body: 'Green means safe space, Yellow means slow down, and flashing Red means stop right before the back wall.',
        accent: 'green',
      },
      {
        title: '2. Stop Still for 5 Seconds',
        body: 'The clock waits until your car is completely parked and still for 5 seconds, then starts counting up from 00:00.',
        accent: 'blue',
      },
      {
        title: '3. Fair Billing & Overstay Alert',
        body: 'First 15 minutes are free, then RM 3 per started hour. Exceeding 3 hours sounds a bay-coded alarm.',
        accent: 'red',
      },
    ],
    diagramType: 'driver-experience',
    diagramCaption: 'Visual traffic-light distance guidance (silent) paired with a dedicated overhead screen and overstay-only alarm.',
    stageCue: 'Point across the three columns from left to right as if narrating a real car parking in a shopping mall.',
    estSeconds: 35,
    spokenScript:
      'Let us look at what an everyday driver actually experiences. First, as you reverse into a bay, three bright LEDs right above the sensor act like a simple traffic light: green when you have plenty of room, yellow as you get close, and flashing red when you are right near the wall. Second, unlike cheap sensors that start charging while you are still maneuvering back and forth, our system waits until your car stays completely still for five full seconds—and only then starts the overhead timer cleanly at zero. Third, the first fifteen minutes are free for quick drop-offs, after that it is three ringgit per started hour, and if a car stays past the three-hour limit, our alarm beeps a specific pattern to alert staff.',
  },
  {
    id: 'slide-3',
    slideNumber: 3,
    layout: 'diagram-focus',
    sectionTag: '02 · CIRCUIT SCHEMATIC & PIN CONNECTIONS',
    title: 'Fitting 3 Sensors, 9 LEDs, 3 Screens & an Alarm on One Uno',
    subtitle: '100% of the 20 Arduino Uno pins utilized cleanly with zero extra expander chips.',
    presenter: 'Member 4 · Hardware & Electrical Lead',
    rubricCoverage: 'Mandatory Item 1 — Detailed Circuit Schematic & Pin Connections (Req 1 & 9)',
    highlights: [
      {
        title: '3 Ultrasonic Sensors (D2–D7)',
        body: 'Each bay gets its own dedicated Trigger and Echo pair so measurements never collide.',
        accent: 'green',
      },
      {
        title: '9 Diffused LEDs (D8–D13, A0–A2)',
        body: 'Every LED uses a 330 Ω resistor (~9 mA) to stay bright while protecting the chip.',
        accent: 'amber',
      },
      {
        title: '3 LCDs on Just 2 Wires (A4 & A5)',
        body: 'Tiny solder bridges give each screen its own address: 0x27, 0x26, and 0x25.',
        accent: 'blue',
      },
      {
        title: 'Alarm (A3) & Clean USB (D0–D1)',
        body: 'Buzzer sits on Pin A3 while D0/D1 stay free for smooth code uploads and receipts.',
        accent: 'red',
      },
    ],
    diagramType: 'pinout-i2c',
    diagramCaption: 'Complete 20-pin Arduino Uno R3 schematic showing exact pin assignments, 330 Ω LED resistors, dual decoupling capacitors, and shared I2C bus.',
    stageCue: 'Trace the left side (sensors), right top (9 LEDs), and right bottom (the 3 shared-wire I2C screens) on the schematic.',
    estSeconds: 40,
    spokenScript:
      'Here is our complete twenty-pin circuit schematic. A normal LCD screen needs six wires each—so three screens would eat up eighteen pins by themselves, leaving almost nothing left on an Arduino Uno! Our breakthrough was using I2C adapter boards on the back of all three screens. By placing just two tiny solder dots on address pads A0 and A1, we give Bay 1, Bay 2, and Bay 3 unique digital street addresses—0x27, 0x26, and 0x25—so all three screens talk over the exact same two wires, A4 and A5. That frees up Pins D2 through D7 for our three distance sensors, nine pins for the three-color LEDs, Pin A3 for the overstay buzzer, and keeps USB serial pins D0 and D1 completely clear.',
  },
  {
    id: 'slide-4',
    slideNumber: 4,
    layout: 'diagram-focus',
    sectionTag: '03 · ROUND-ROBIN SCHEDULER & STOP FLOWCHART',
    title: 'How One Tiny Brain Monitors Three Bays Simultaneously',
    subtitle: 'Non-blocking Round-Robin scheduling prevents freezing and stops adjacent sensors from interfering.',
    presenter: 'Member 1 · System Architect',
    rubricCoverage: 'Mandatory Item 2 — Round-Robin Scheduler Flowchart & Independence (Req 4 & 6)',
    highlights: [
      {
        title: 'Zero delay() Freezes',
        body: 'Uses the internal millis() stopwatch so Bay 1 never pauses Bay 2 or Bay 3.',
        accent: 'blue',
      },
      {
        title: 'Taking Turns Every 40 ms',
        body: 'Sensors fire one at a time (Bay 1 → 2 → 3) so sound waves never cross-talk.',
        accent: 'green',
      },
      {
        title: 'Staggered Screen Updates',
        body: 'Refreshes one screen every 200 ms and skips unchanged text to prevent flicker.',
        accent: 'amber',
      },
      {
        title: '5-Second Stillness Gate',
        body: 'If the car shifts more than ±1 cm while parking, the 5-second countdown resets.',
        accent: 'red',
      },
    ],
    diagramType: 'fsm-tdm',
    diagramCaption: 'Top: 4-state bay lifecycle enforcing 5.0 s stillness before starting 00:00. Bottom: Cooperative 40 ms sensor turns + 200 ms staggered screen refreshes.',
    stageCue: 'Point first to the top 4-box state cycle, then slide your hand across the bottom turn-taking timeline.',
    estSeconds: 40,
    spokenScript:
      'How does a single small microcontroller watch three cars at once without getting confused? Instead of using delay commands that freeze the entire program, we built a Round-Robin scheduler—just like a friendly traffic officer checking one lane after another in quick, timed turns. Every forty milliseconds, the Arduino triggers just one ultrasonic sensor, giving its sound echo plenty of time to fade before checking the next bay. Every two hundred milliseconds, it refreshes just one LCD screen—and only if the numbers actually changed. Meanwhile, each bay runs its own four-step lifecycle: Empty, Waiting Five Seconds Still, Counting Up, and a three-second exit check so a brief sensor glitch never wipes out a driver’s session.',
  },
  {
    id: 'slide-5',
    slideNumber: 5,
    layout: 'comparison-grid',
    sectionTag: '04 · ENGINEERING ASSUMPTIONS & TRADE-OFFS',
    title: 'Balancing Real-World Constraints With Smart Assumptions',
    subtitle: 'Every design choice resolves a real conflict between accuracy, hardware limits, and driver fairness.',
    presenter: 'Member 2 · Sensing & FSM Lead',
    rubricCoverage: 'Conflicting Requirements (WP2) & Justified Engineering Assumptions (Req 10)',
    highlights: [
      {
        title: '1 : 20 Tabletop Scale',
        body: '1 cm on our tabletop equals 20 cm in real life—matching the sensor’s 2 cm minimum range.',
        accent: 'blue',
      },
      {
        title: '60× Demo Clock (Toggleable)',
        body: '1 real second equals 1 simulated minute so we can prove 3-hour overstay live in 3 minutes.',
        accent: 'green',
      },
      {
        title: '±1 cm Jitter Cushion',
        body: 'Small ultrasonic rounding noise will not falsely reset the 5-second stillness countdown.',
        accent: 'amber',
      },
      {
        title: 'Grace-First Fee Rule',
        body: 'Subtracts 15 free minutes first, then rounds up started hours so 16 minutes = RM 3, 75 = RM 3.',
        accent: 'red',
      },
    ],
    diagramType: 'tradeoffs-matrix',
    diagramCaption: 'Four real stakeholder & hardware conflicts resolved systematically without adding costly hardware.',
    stageCue: 'Highlight the right-hand conflict-to-resolution matrix—this directly answers the WP2 conflicting requirements rubric.',
    estSeconds: 35,
    spokenScript:
      'Real engineering is always about balancing competing demands. First, to demonstrate a realistic four-meter parking bay on a classroom table, we assumed a one-to-twenty scale where twenty centimeters represents four meters. Second, nobody wants to sit for three real hours during a five-minute grading demo, so we run a sixty-times simulation clock—one real second equals one parking minute—which we can flip back to real-time with a single keyboard letter. On the right, you can see the four main conflicts we solved: compressing eighteen LCD pins down to two I2C wires, preventing slow screen updates from blocking sensors, absorbing one-centimeter sensor jitter during our five-second stillness check, and letting one buzzer identify all three bays using distinct one-, two-, or three-beep patterns.',
  },
  {
    id: 'slide-6',
    slideNumber: 6,
    layout: 'split-code',
    sectionTag: '05 · C++ CODE ARCHITECTURE: ARRAYS, LOOPS & FUNCTIONS',
    title: 'One Clean Loop Drives All Three Bays — Zero Copy-Paste Code',
    subtitle: 'Core C++ fundamentals keep the firmware concise, modular, and easy to verify.',
    presenter: 'Member 3 · Billing & Firmware Lead',
    rubricCoverage: 'Mandatory Item 3 — C++ Code Snippets: Constants, 1D/2D Arrays, Loops & Overloaded Functions (WP1)',
    codeSnippetTitle: '2D Pin Matrix, Default Arguments & Function Overloading',
    codeSnippet: `// 2D Array: Row = Bay (0..2), Col = Green, Yellow, Red
const int LED_PINS[3][3] = {
  { 8,  9,  10 },  // Bay 1
  { 11, 12, 13 },  // Bay 2
  { A0, A1, A2 }   // Bay 3
};

// User-defined function with default grace & rate
int calculateParkingFee(int elapsedMin,
                        int graceMin = 15,
                        int rateRM = 3) {
  if (elapsedMin <= graceMin) return 0;
  int billable = elapsedMin - graceMin;
  return ((billable + 59) / 60) * rateRM;
}`,
    highlights: [
      {
        title: '1D Parallel & 2D Arrays',
        body: 'Store all bay timers and the 3×3 LED pin grid so a single loop controls every bay.',
        accent: 'blue',
      },
      {
        title: 'Selection & Nested Loops',
        body: 'switch-case handles the 4 states; nested for-loops initialize and update all 9 LEDs.',
        accent: 'green',
      },
      {
        title: 'Function Overloading',
        body: 'printTwoDigits() formats clean "05" numbers on both the LCD screens and PC console.',
        accent: 'amber',
      },
    ],
    diagramType: 'code-arrays-funcs',
    diagramCaption: 'How 1D parallel bay arrays and the 2D LED_PINS[3][3] grid map cleanly to physical hardware without duplicating code.',
    stageCue: 'Point to the 2D array grid on the left and explain in plain English why writing one shared function beats copying code three times.',
    estSeconds: 40,
    spokenScript:
      'Now let us look under the hood at our C++ programming design. A common beginner mistake is copying and pasting the same code three separate times for Bay 1, Bay 2, and Bay 3—which triples the chance of bugs. Instead, we organized all nine LED pins into a neat three-by-three two-dimensional array, and stored each bay’s timer and status in synchronized one-dimensional arrays. That means one short loop can run all three bays identically. Below that, you can see our parking fee function using default arguments and integer ceiling division—adding fifty-nine before dividing by sixty guarantees that even one minute past the free grace period bills cleanly for the started hour. We also used function overloading on our two-digit formatter so the exact same function name prints tidy leading zeros on both the LCD screens and the computer monitor.',
  },
  {
    id: 'slide-7',
    slideNumber: 7,
    layout: 'split-code',
    sectionTag: '06 · C++ ALGORITHMS: SORTING, SEARCHING & POINTERS',
    title: 'Filtering Noisy Echoes & Returning Live Lot Summaries',
    subtitle: 'Classic C++ sorting, searching, and pointer pass-by-reference solve real hardware noise.',
    presenter: 'Member 2 · Sensing & FSM Lead',
    rubricCoverage: 'Mandatory Item 3 — Insertion Sort, Linear Search & Pointer Pass-by-Reference (WP1)',
    codeSnippetTitle: 'Insertion Sort Median Filter & Pointer Summary',
    codeSnippet: `// Insertion Sort finds true median of 3 sonar samples
void insertionSort(int items[], int n) {
  for (int i = 1; i < n; i++) {
    int move = i;
    while (move > 0 && items[move] < items[move - 1]) {
      int temp = items[move];
      items[move] = items[move - 1];
      items[move - 1] = temp;
      move--;
    }
  }
}
// Pointers return 2 live lot counts in one call
void computeLotSummary(const int states[], int n,
                       int *occupiedPtr, int *overstayPtr);`,
    highlights: [
      {
        title: 'Insertion Sort Noise Filter',
        body: 'Sorts each bay’s last 3 readings and picks the middle value—ignoring sudden 98 cm spikes.',
        accent: 'green',
      },
      {
        title: 'Linear Search Bay Finder',
        body: 'Scans the status array to report the first open slot (or −1 when the lot is full).',
        accent: 'blue',
      },
      {
        title: 'Pointer Pass-by-Reference',
        body: 'Updates both occupied and overstay counts directly in caller memory in a single call.',
        accent: 'amber',
      },
    ],
    diagramType: 'code-sort-pointers',
    diagramCaption: 'Top: Sorting [14, 98, 13] picks 14 cm and rejects the glitch. Bottom: Pointers write two outputs directly back to loop().',
    stageCue: 'Walk the audience through [14, 98, 13]—explain why taking the middle value beats averaging when a sensor glitches.',
    estSeconds: 40,
    spokenScript:
      'Ultrasonic sensors occasionally throw a wild false reading—for example, reading fourteen centimeters, suddenly jumping to ninety-eight, then right back to thirteen. If we simply averaged those three numbers, the system would think the car drove away! Instead, we apply Insertion Sort to each bay’s three most recent readings and pick the middle value—fourteen centimeters—completely rejecting the ninety-eight-centimeter glitch. We also use Linear Search to scan the three spaces and tell drivers the first available bay number, or minus one when full. Finally, because a C++ function can normally only return one value, we pass memory addresses using pointers into our lot summary function so it updates both the occupied count and the overstay count in one clean pass.',
  },
  {
    id: 'slide-8',
    slideNumber: 8,
    layout: 'comparison-grid',
    sectionTag: '07 · ELECTRICAL SAFETY & COST MINIMIZATION',
    title: 'Safe Within Datasheet Limits & Under RM 14 Per Student',
    subtitle: 'Verified against ATmega328P, PCF8574, and HC-SR04 specifications with full spare parts included.',
    presenter: 'Member 4 · Hardware & Electrical Lead',
    rubricCoverage: 'Cost Minimization (Req 8) & Datasheet Electrical Verification (Req 9)',
    stats: [
      { label: 'MCU Pin Peak', value: '113.2 / 200 mA' },
      { label: 'USB 5V Peak', value: '248.2 / 500 mA' },
      { label: 'Complete Kit', value: 'RM 69.70' },
      { label: 'Per Student (5)', value: 'RM 13.94' },
    ],
    highlights: [
      {
        title: 'Why 330 Ω Resistors Matter',
        body: 'Caps each LED at ~9 mA so even all 9 LEDs on at once stay safely below the chip’s 200 mA limit.',
        accent: 'green',
      },
      {
        title: 'Clean Power For 3 Screens',
        body: 'Two 100 µF + 0.1 µF capacitor pairs absorb sudden surges so LCD text never dims or resets.',
        accent: 'blue',
      },
      {
        title: 'Smart Cost Control',
        body: 'RM 63.50 active parts + RM 6.20 spares (including a 4th spare sensor) = RM 13.94 per member.',
        accent: 'amber',
      },
    ],
    diagramType: 'electrical-cost',
    diagramCaption: 'Left: Worst-case current stays under 50% of the 500 mA USB fuse. Right: Itemized RM 69.70 cost breakdown.',
    stageCue: 'Emphasize how affordable RM 13.94 per student is while still proving full electrical safety from the component datasheets.',
    estSeconds: 35,
    spokenScript:
      'Before plugging anything into a laptop USB port, we checked every component’s official datasheet. Many builders forget that an Arduino chip has a two-hundred-milliamp pin limit, while a USB port has a five-hundred-milliamp fuse. By choosing three-hundred-thirty-ohm resistors instead of smaller ones, our worst-case chip load stays at one-hundred-thirteen milliamps—safely below two hundred. Even with all three backlit LCD screens, all sensors, and the buzzer running at once, total USB draw peaks at two-hundred-forty-eight milliamps—less than half of the USB limit. And by using simple solder bridges instead of extra converter chips, our entire prototype—including a spare fourth sensor and extra LEDs—costs just sixty-nine ringgit seventy, or under fourteen ringgit per student.',
  },
  {
    id: 'slide-9',
    slideNumber: 9,
    layout: 'three-pillar',
    sectionTag: '08 · TECHNICAL LIMITATIONS & MITIGATION ANALYSIS',
    title: 'Honest Limits Across Hardware, Software & Algorithms',
    subtitle: 'Evaluating our prototype across three independent engineering perspectives.',
    presenter: 'Member 5 · HMI & QA Lead',
    rubricCoverage: 'Mandatory Item 4 — Multi-Perspective Technical Limitations (EA1)',
    highlights: [
      {
        title: 'Hardware Limitations',
        body: 'Ultrasonic cones (15°) bounce off curved plastic bumpers; temperature shifts sound speed by 0.6 m/s/°C; 3 parallel I2C pull-ups drop bus resistance to 1.57 kΩ.',
        accent: 'red',
      },
      {
        title: 'Software Limitations',
        body: 'pulseIn() briefly pauses up to 15 ms per open bay; loose I2C wires can stall AVR Wire; single Timer 2 shares one buzzer across 3 bays.',
        accent: 'amber',
      },
      {
        title: 'Algorithmic Limitations',
        body: '3-sample median filtering adds ~240 ms lag; the 5-second stop check trades instant start for zero false triggers; RAM timers clear on power loss.',
        accent: 'blue',
      },
    ],
    diagramType: 'limitations-3axis',
    diagramCaption: 'Each limitation is paired with a concrete built-in mitigation today and a clear upgrade path for real-world deployment.',
    stageCue: 'Highlight that we analyzed all three axes—Hardware, Software, and Algorithmic—rather than just listing one.',
    estSeconds: 35,
    spokenScript:
      'No engineering design is perfect, so we examined our system’s limitations from three distinct angles. On the hardware side, ultrasonic sound waves can glance off sharply curved toy-car surfaces, room temperature slightly changes the speed of sound, and wiring three LCD backpacks in parallel lowers I2C pull-up resistance to 1.57 kilo-ohms—which works cleanly over short wires, or can be tuned by removing extra pull-ups. On the software side, our echo reading waits up to fifteen milliseconds when a bay is empty, and a loose I2C wire could pause the bus. Algorithmically, our three-sample median filter and five-second stop rule deliberately trade a tiny bit of response speed in exchange for rock-solid accuracy. For future scaling, we would add pin-change interrupts, temperature compensation, and an ESP32 cloud dashboard.',
  },
  {
    id: 'slide-10',
    slideNumber: 10,
    layout: 'timeline-closing',
    sectionTag: '09 · VERIFICATION & LIVE 5-MINUTE DEMONSTRATION',
    title: '10-Point Quality Check & Live Bench Demonstration',
    subtitle: 'Ready to prove independent 3-bay tracking, 5-second stillness, fair fees, and overstay alerts live.',
    presenter: 'Member 3 · Billing & Firmware Lead',
    rubricCoverage: 'Live Demonstration Readiness & Quality Verification',
    highlights: [
      { title: 'Min 0–1 · Distance LEDs', body: 'Slide toy cars to 15, 8, and 4 cm—confirm Green, Yellow, and Red with buzzer silent.' },
      { title: 'Min 1–2 · 5-Second Hold', body: 'Nudge a car to prove countdown resets; hold still 5 s to start 00:00 cleanly.' },
      { title: 'Min 2–3 · Multi-Bay & Fee', body: 'Park all 3 bays independently and show 15 m free → RM 3/hr live LCD count-up.' },
      { title: 'Min 3–5 · Overstay & Q&A', body: 'Cross 180 min for Pin A3 bay-coded alarm, exit for Serial receipt, and code Q&A.' },
    ],
    diagramType: 'demo-timeline',
    diagramCaption: 'All 10 acceptance tests verified prior to demonstration. Thank you—we welcome your questions and live bench testing.',
    stageCue: 'Smile, gesture toward the physical prototype or live simulator, and invite the examiners to test any bay themselves.',
    estSeconds: 30,
    spokenScript:
      'Before today, we verified our prototype against a ten-point quality checklist covering I2C scanning, motion resets, jitter immunity, fee boundaries, and a thirty-minute continuous stability run. Right now, we will run a quick five-minute live demo: first showing the traffic-light distance LEDs across all three bays, next nudging a car to prove the five-second stillness reset, then running all three screens independently through the fifteen-minute free grace period into hourly billing, and finally triggering the three-hour overstay alarm and itemized exit receipt. Thank you very much for listening—we would love to answer your questions and let you test the bays live!',
  },
];
