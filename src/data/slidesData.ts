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
    subtitle: 'Three independent Arduino parking bays with live reverse guidance, 5-second stop confirmation, automatic fee timers, and 3 individual bay buzzers.',
    presenter: 'Member 1 · System Architect',
    rubricCoverage: 'Project Overview & 5-Member Team Roles (Req 7 · Teamwork)',
    stats: [
      { label: 'Independent Bays', value: '3 Slots' },
      { label: 'Hardware Kit', value: 'RM 76.70' },
      { label: 'I/O Architecture', value: '20 Pins + 0x24' },
    ],
    highlights: [
      { title: 'Member 1 · Architect', body: 'Round-Robin scheduler & lot summary logic' },
      { title: 'Member 2 · Sensing', body: 'Ultrasonic filtering & 5-second stop rule' },
      { title: 'Member 3 · Billing', body: 'Count-up timer, fee math & receipts' },
      { title: 'Member 4 · Hardware', body: '20-pin Uno, 2N2222 buffer & 4× I2C bus' },
      { title: 'Member 5 · HMI & QA', body: '9 LEDs, 3 passive buzzers & 10-point QA' },
    ],
    diagramType: 'cover-blueprint',
    diagramCaption: 'Each parking slot stacks an ultrasonic sensor at bumper level, 3 distance LEDs plus its own passive buzzer above it, and a live timer screen on top.',
    stageCue: 'Greet the panel warmly, introduce all 5 teammates briefly, and gesture to the three-bay stack diagram.',
    estSeconds: 30,
    spokenScript:
      'Good morning everyone. Today our five-member team presents our Smart Multi-Space Parking Assistance and Management System built on a single Arduino Uno. Imagine driving into a busy parking garage where every bay actually guides you safely into place, tracks your stay fairly, and sounds its own local warning buzzer if you back up too close or overstay—without needing an expensive computer. Our prototype manages three completely independent parking spaces simultaneously for RM 76.70 total, or just over fifteen ringgit per student. On the bottom bar you can see how our five members divided scheduling, sensing, billing, hardware wiring, and testing so every subsystem fits together seamlessly.',
  },
  {
    id: 'slide-2',
    slideNumber: 2,
    layout: 'three-pillar',
    sectionTag: '01 · HOW IT WORKS FOR EVERYDAY DRIVERS',
    title: 'Three Simple Steps From Reversing In to Driving Out',
    subtitle: 'Designed so any driver understands visual and audible cues at a glance—without reading a manual.',
    presenter: 'Member 5 · HMI & QA Lead',
    rubricCoverage: 'Core Objectives, Distance Zones & Dual Buzzer Policy (Req 2–5)',
    highlights: [
      {
        title: '1. Reverse With LEDs & Danger Beep',
        body: 'Green means safe space, Yellow means slow down, and Red (<5 cm) flashes with a rapid 2500 Hz beep on that bay’s own buzzer.',
        accent: 'green',
      },
      {
        title: '2. Stop Still for 5 Seconds',
        body: 'The clock waits until your car stays completely still for 5 seconds, then starts counting up cleanly from 00:00.',
        accent: 'blue',
      },
      {
        title: '3. Fair Billing & Overstay Alert',
        body: 'First 15 minutes are free, then RM 3 per started hour. Exceeding 3 hours pulses that bay’s buzzer at a slower 1800 Hz beat.',
        accent: 'red',
      },
    ],
    diagramType: 'driver-experience',
    diagramCaption: 'Every bay combines traffic-light LEDs, an overhead timer screen, and a dedicated passive buzzer with distinct Danger vs. Overstay pitches.',
    stageCue: 'Point across the three columns from left to right as if narrating a real car parking in a shopping mall.',
    estSeconds: 35,
    spokenScript:
      'Let us look at what an everyday driver experiences. First, as you reverse into a bay, three bright LEDs act like a simple traffic light: green means plenty of room, yellow means slow down, and if you get closer than five centimeters, the red light flashes and that bay’s own buzzer sounds a sharp, rapid warning beep so you stop before hitting the wall. Second, unlike basic sensors that start charging while you are still maneuvering, our system waits until your car stays motionless for five full seconds—and only then starts the overhead timer cleanly at zero. Third, the first fifteen minutes are free for quick drop-offs, after that it is three ringgit per started hour, and staying past three hours triggers a slower, lower-pitched alarm right at that specific bay.',
  },
  {
    id: 'slide-3',
    slideNumber: 3,
    layout: 'diagram-focus',
    sectionTag: '02 · CIRCUIT SCHEMATIC & PIN CONNECTIONS',
    title: '3 Sensors, 9 LEDs, 3 Screens & 3 Passive Buzzers on One Uno',
    subtitle: '20/20 Arduino pins + one RM 3.50 PCF8574 expander (0x24) and one RM 0.50 2N2222 buffer drive everything safely.',
    presenter: 'Member 4 · Hardware & Electrical Lead',
    rubricCoverage: 'Mandatory Item 1 — Detailed Circuit Schematic & Pin Connections (Req 1 & 9)',
    highlights: [
      {
        title: '3 Ultrasonic Sensors (D2–D7)',
        body: 'Each bay has its own Trigger and Echo pins so distance pulses never collide.',
        accent: 'green',
      },
      {
        title: '9 Diffused LEDs (D8–D13, A0–A2)',
        body: 'Each LED uses a 330 Ω resistor (~9 mA) to stay bright while keeping MCU current cool.',
        accent: 'amber',
      },
      {
        title: '4 Modules on 2 I2C Wires (A4 & A5)',
        body: '3 LCDs (0x27, 0x26, 0x25) plus PCF8574 (0x24) share the same two wires cleanly.',
        accent: 'blue',
      },
      {
        title: '2N2222 + 3 Passive Buzzers (A3 + 0x24)',
        body: 'Pin A3 feeds a 2N2222 tone bus while PCF8574 pins P0–P2 gate each bay independently.',
        accent: 'red',
      },
    ],
    diagramType: 'pinout-i2c',
    diagramCaption: 'Complete 20-pin Uno R3 + PCF8574 (0x24) + 2N2222 emitter-follower schematic keeping USB pins D0/D1 completely free.',
    stageCue: 'Trace the left side (sensors), right top (9 LEDs), middle (2N2222 + 3 buzzers), and bottom (4 shared I2C devices).',
    estSeconds: 40,
    spokenScript:
      'Here is our complete twenty-pin circuit schematic. A normal LCD needs six pins each, and three independent buzzers would need three more pins—far more than an Arduino Uno has! Our solution puts four I2C modules on the exact same two wires, A4 and A5: three LCD screens at addresses 0x27, 0x26, and 0x25, plus one low-cost PCF8574 expander chip at 0x24. To let all three passive buzzers play crisp multi-pitch tones without overloading Arduino Pin A3, Pin A3 sends the musical tone signal through a tiny fifty-sen 2N2222 transistor amplifier to all three buzzers’ positive legs, while the PCF8574 switches each bay’s negative leg on or off individually. That leaves D2 through D7 for our three sensors, nine pins for the LEDs, and keeps USB pins D0 and D1 completely free.',
  },
  {
    id: 'slide-4',
    slideNumber: 4,
    layout: 'diagram-focus',
    sectionTag: '03 · ROUND-ROBIN SCHEDULER & STOP FLOWCHART',
    title: 'How One Tiny Brain Monitors Three Bays Simultaneously',
    subtitle: 'Non-blocking Round-Robin scheduling prevents freezing, stops echo cross-talk, and gates 3 buzzers independently.',
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
        title: 'Staggered Screens & Dirty-Checked 0x24',
        body: 'Refreshes one LCD every 200 ms and writes to PCF8574 only when a buzzer flips state.',
        accent: 'amber',
      },
      {
        title: 'Independent Bay Buzzers + Pitch Arbitration',
        body: 'Danger plays 2500 Hz rapid (150 ms); Overstay plays 1800 Hz slow; simultaneous mixed alerts share 2000 Hz.',
        accent: 'red',
      },
    ],
    diagramType: 'fsm-tdm',
    diagramCaption: 'Top: 4-state bay lifecycle enforcing 5.0 s stillness before starting 00:00. Bottom: Cooperative 40 ms sensor turns, 200 ms LCD slots, and 0x24 buzzer gating.',
    stageCue: 'Point first to the top 4-box state cycle, then trace the bottom turn-taking timeline.',
    estSeconds: 40,
    spokenScript:
      'How does one tiny microcontroller watch three cars and control three independent buzzers without freezing? Instead of pause commands that lock up the board, we built a Round-Robin scheduler—like a focused traffic officer checking each lane in quick, timed turns. Every forty milliseconds, the Arduino triggers just one ultrasonic sensor so its echo fades before checking the next bay. Every two hundred milliseconds, it updates one LCD screen—and only if the text changed. Meanwhile, every bay runs its own four-step lifecycle: Empty, Waiting Five Seconds Still, Counting Up, and a three-second exit check. At the same time, our buzzer controller independently gates each bay’s buzzer through chip 0x24—playing a rapid 2500-hertz beep for Danger, a slower 1800-hertz pulse for Overstay, or a shared 2000-hertz tone if one bay is in Danger while another overstays.',
  },
  {
    id: 'slide-5',
    slideNumber: 5,
    layout: 'comparison-grid',
    sectionTag: '04 · ENGINEERING ASSUMPTIONS & TRADE-OFFS',
    title: 'Balancing Real-World Constraints With Smart Assumptions',
    subtitle: 'Every design choice resolves a real conflict between accuracy, hardware pin limits, and driver safety.',
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
    diagramCaption: 'Four real stakeholder & hardware conflicts resolved systematically with under RM 4 of extra driver circuitry.',
    stageCue: 'Highlight the right-hand conflict-to-resolution matrix—this directly answers the WP2 conflicting requirements rubric.',
    estSeconds: 35,
    spokenScript:
      'Good engineering is always about balancing competing demands. First, to model a realistic four-meter parking bay on a classroom table, we chose a one-to-twenty scale where twenty centimeters equals four meters. Second, nobody wants to wait three real hours during a five-minute demonstration, so our clock runs sixty times faster—one real second equals one parking minute—and flips back to real time with a single letter command. On the right are the four conflicts we solved: compressing eighteen LCD pins down to two I2C wires, staggering screen updates so sensors never stall, absorbing one-centimeter sensor jitter during our five-second stillness gate, and giving all three bays their own multi-pitch passive buzzers using just one transistor buffer and one PCF8574 chip on the existing I2C bus.',
  },
  {
    id: 'slide-6',
    slideNumber: 6,
    layout: 'split-code',
    sectionTag: '05 · C++ CODE ARCHITECTURE: ARRAYS, LOOPS & FUNCTIONS',
    title: 'One Clean Loop Drives All Three Bays — Zero Copy-Paste Code',
    subtitle: 'Core C++ fundamentals keep the firmware concise, readable, and easy to verify—even for 3 independent buzzers.',
    presenter: 'Member 3 · Billing & Firmware Lead',
    rubricCoverage: 'Mandatory Item 3 — C++ Code Snippets: Arrays, Loops, Subtraction Gating & Functions (WP1)',
    codeSnippetTitle: '2D LED Matrix & Active-LOW 3-Buzzer Subtraction Mask',
    codeSnippet: `// 2D Array: Row = Bay (0..2), Col = Green, Yellow, Red
const int LED_PINS[3][3] = {
  { 8,  9,  10 },  // Bay 1
  { 11, 12, 13 },  // Bay 2
  { A0, A1, A2 }   // Bay 3
};
const int BUZZER_WEIGHT[3] = { 1, 2, 4 }; // P0, P1, P2

// Pure subtraction builds PCF8574 (0x24) active-LOW byte
int mask = 255;                // 0xFF = all 3 buzzers OFF
for (int i = 0; i < 3; i++) {
  if (bayBuzzerActive(i, nowMs)) mask = mask - BUZZER_WEIGHT[i];
}
writeBuzzerBus(mask);          // Send 1 byte over I2C (0x24)`,
    highlights: [
      {
        title: '1D Parallel & 2D Arrays',
        body: 'Store all bay timers, buzzer bit weights {1, 2, 4}, and the 3×3 LED grid so one loop drives all bays.',
        accent: 'blue',
      },
      {
        title: 'Simple Subtraction (No Bitwise Tricks)',
        body: 'Starting from 255 and subtracting 1, 2, or 4 turns on Bay 1, 2, or 3 cleanly using basic arithmetic.',
        accent: 'green',
      },
      {
        title: 'Default Arguments & Overloading',
        body: 'calculateParkingFee() sets 15 m free & RM 3/hr defaults; overloaded printTwoDigits() formats LCD & Serial.',
        accent: 'amber',
      },
    ],
    diagramType: 'code-arrays-funcs',
    diagramCaption: 'How the 2D LED_PINS[3][3] grid and {1, 2, 4} buzzer weights map cleanly to physical pins without duplicating code.',
    stageCue: 'Explain how subtracting 1, 2, or 4 from 255 controls three buzzers over I2C with plain beginner arithmetic.',
    estSeconds: 40,
    spokenScript:
      'Now let us look under the hood at our C++ program. Beginners often copy and paste the same code three separate times for Bay 1, Bay 2, and Bay 3, which triples the chance of mistakes. Instead, we placed all nine LED pins in one neat three-by-three two-dimensional array, and stored each bay’s timer and buzzer weight in synchronized one-dimensional arrays. Even better, look at how we control all three passive buzzers through the PCF8574 chip without any complicated bitwise operators: we start with the number 255, which means all three buzzers are off, and simply subtract one for Bay 1, two for Bay 2, or four for Bay 3 whenever that bay needs to beep, then send that single number over I2C. Combined with default arguments for our fee formula and function overloading for tidy two-digit printing, the code stays super clean and readable.',
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
      'Ultrasonic sensors occasionally throw a wild false reading—for example, reading fourteen centimeters, suddenly jumping to ninety-eight, then right back to thirteen. If we simply averaged those three numbers, the system would think the car drove away or trigger a false buzzer! Instead, we apply Insertion Sort to each bay’s three most recent readings and pick the middle value—fourteen centimeters—completely rejecting the ninety-eight-centimeter glitch. We also use Linear Search to scan the three spaces and tell drivers the first available bay number, or minus one when full. Finally, because a C++ function normally returns only one value, we pass memory addresses using pointers into our lot summary function so it updates both the occupied count and the overstay count in one clean pass.',
  },
  {
    id: 'slide-8',
    slideNumber: 8,
    layout: 'comparison-grid',
    sectionTag: '07 · ELECTRICAL SAFETY & COST MINIMIZATION',
    title: 'Cooler Chip Load (100.3 mA) & Just RM 15.34 Per Student',
    subtitle: 'Verified across ATmega328P, PCF8574, 2N2222, and USB 5 V datasheets with spares included.',
    presenter: 'Member 4 · Hardware & Electrical Lead',
    rubricCoverage: 'Cost Minimization (Req 8) & Datasheet Electrical Verification (Req 9)',
    stats: [
      { label: 'MCU Pin Peak', value: '100.3 / 200 mA' },
      { label: 'PCF8574 Sink', value: '45.0 / 80 mA' },
      { label: 'USB 5V Peak', value: '285.6 / 500 mA' },
      { label: 'Complete Kit', value: 'RM 76.70' },
    ],
    highlights: [
      {
        title: '2N2222 Protects the Arduino Chip',
        body: 'Pin A3 sends only ≤1.0 mA to the transistor base while the 5 V rail powers all 3 buzzers (49.3 / 600 mA).',
        accent: 'green',
      },
      {
        title: 'Safe PCF8574 & 4-Device I2C Bus',
        body: 'All 3 buzzers sink 45 mA (< 80 mA IC limit); 4 parallel 4.7 kΩ pull-ups equal 1.18 kΩ (4.26 mA).',
        accent: 'blue',
      },
      {
        title: 'Complete Kit With Spares',
        body: 'RM 70.50 active parts + RM 6.20 spares (4th sensor + extra LEDs) = RM 15.34 per student (÷ 5).',
        accent: 'amber',
      },
    ],
    diagramType: 'electrical-cost',
    diagramCaption: 'Left: MCU (50.1%), PCF8574 (56.3%), and USB 5V (57.1%) all hold wide thermal margins. Right: RM 76.70 breakdown.',
    stageCue: 'Highlight the counter-intuitive win: adding the 2N2222 buffer actually lowered the Arduino MCU peak from 113 mA down to 100.3 mA.',
    estSeconds: 35,
    spokenScript:
      'Before plugging anything into a laptop USB port, we verified every single chip against its official datasheet. Notice something really neat: because our 2N2222 transistor amplifier supplies the buzzer power straight from the five-volt rail, Arduino Pin A3 only provides one tiny milliamp of control signal! That actually keeps our Arduino chip cooler at just 100.3 milliamps worst-case—half of its 200-milliamp limit. On the PCF8574 expander, even if all three bays sound their buzzers at the exact same moment, it sinks 45 milliamps against an 80-milliamp ceiling, and total USB draw peaks at 285.6 milliamps against the 500-milliamp fuse. Best of all, the entire 11-item kit—including all three passive buzzers, the expander, the transistor, and spare sensors—costs only RM 76.70, or RM 15.34 per student.',
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
        body: 'Ultrasonic cones (15°) bounce off curved plastic bumpers; 4 parallel I2C pull-ups drop bus impedance to 1.18 kΩ; 2N2222 drops ~0.7 V (~4.3 Vpp tone bus).',
        accent: 'red',
      },
      {
        title: 'Software Limitations',
        body: 'Single AVR Timer 2 shares one carrier pitch (2000 Hz) during mixed simultaneous alerts; pulseIn() pauses up to 15 ms per empty bay; loose I2C wires can stall Wire.',
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
    stageCue: 'Highlight that we analyzed Hardware, Software, and Algorithmic axes honestly—including the shared Timer 2 carrier arbitration.',
    estSeconds: 35,
    spokenScript:
      'No engineering design is without trade-offs, so we evaluated our prototype from three honest angles. On the hardware side, ultrasonic waves can glance off sharply curved bumpers, four I2C modules in parallel lower pull-up resistance to 1.18 kilo-ohms—which stays crisp on short breadboard wires—and the 2N2222 emitter follower drops about 0.7 volts while still keeping all three buzzers loud and clear. On the software side, because an Arduino Uno only has one tone timer, if Bay 1 hits Danger while Bay 3 is Overstaying at the exact same second, both buzzers share a 2000-hertz carrier pitch while keeping their completely separate rapid versus slow beep rhythms. Algorithmically, our median filter and five-second stillness check deliberately trade a fraction of a second for rock-solid accuracy. Future upgrades would add hardware PWM chips, temperature compensation, and ESP32 cloud sync.',
  },
  {
    id: 'slide-10',
    slideNumber: 10,
    layout: 'timeline-closing',
    sectionTag: '09 · VERIFICATION & LIVE 5-MINUTE DEMONSTRATION',
    title: '10-Point Quality Check & Live Bench Demonstration',
    subtitle: 'Ready to prove 3-bay tracking, 5-second stillness, fair fees, and independent Danger + Overstay buzzers live.',
    presenter: 'Member 3 · Billing & Firmware Lead',
    rubricCoverage: 'Live Demonstration Readiness & Quality Verification',
    highlights: [
      { title: 'Min 0–1 · LEDs & Danger Beep', body: 'Slide cars to 15, 8, and 4 cm—confirm Bay 1 rapid 2500 Hz beep while Bays 2–3 stay silent.' },
      { title: 'Min 1–2 · 5-Second Hold', body: 'Nudge a car to prove countdown resets; hold still 5 s to start 00:00 cleanly.' },
      { title: 'Min 2–3 · Multi-Bay & Fee', body: 'Park all 3 bays independently and show 15 m free → RM 3/hr live LCD count-up.' },
      { title: 'Min 3–5 · Mixed Buzzers & Q&A', body: 'Trigger Bay 1 Danger + Bay 3 Overstay simultaneously (2000 Hz, 0x24), exit receipt & Q&A.' },
    ],
    diagramType: 'demo-timeline',
    diagramCaption: 'All 10 acceptance tests verified prior to demonstration. Thank you—we welcome your questions and live bench testing.',
    stageCue: 'Smile, gesture toward the physical prototype or live simulator, and invite the examiners to test simultaneous Danger + Overstay alerts.',
    estSeconds: 30,
    spokenScript:
      'Before today, we verified our prototype against a ten-point quality checklist covering our four-device I2C scan, motion resets, jitter immunity, fee boundaries, simultaneous multi-bay buzzers, and a thirty-minute continuous stability run. Right now, we will run a crisp five-minute live demo: first showing the traffic-light LEDs and Bay 1’s rapid 2500-hertz Danger warning while the other two bays stay silent; next nudging a car to prove the five-second stillness reset; then running all three screens independently from free grace into hourly billing; and finally triggering Bay 1 Danger and Bay 3 Overstay at the exact same moment so you can hear both independent rhythms live before printing an itemized exit receipt. Thank you very much—we welcome your questions!',
  },
];
