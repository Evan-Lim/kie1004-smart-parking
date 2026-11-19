# KIE1004 Smart Multi-Space Parking Assistance & Management System (v3.0)

Interactive engineering dashboard, live 3-bay Arduino Uno hardware simulator, procedural C++ firmware studio, 10-slide presentation deck with vector PDF export & speaker scripts, beginner wire-by-wire assembly plan, and live BOM pricing calculator for **KIE1004: Programming 1 (Semester 1, 2026/2027)**.

---

## System Overview & Hardware Specification

Built around a single **Arduino Uno R3 (ATmega328P)** utilizing **20 / 20 pins** with zero external I/O expander chips:

| Subsystem | Specification | Arduino Uno Pins |
| :--- | :--- | :--- |
| **USB Serial Monitor** | 9600 baud telemetry, receipts & live commands (`S`, `T`, `D`, `R1`–`R3`) | `D0 (RX)`, `D1 (TX)` |
| **Ultrasonic Sensors** | 3 active + 1 spare **HC-SR04** (40 ms Time-Division Multiplexed polling) | `D2/D3`, `D4/D5`, `D6/D7` |
| **Per-Bay Distance LEDs** | 9× 5 mm diffused LEDs (Green / Yellow / Red per bay) via `9× 330 Ω` resistors | `D8–D10`, `D11–D13`, `A0–A2` |
| **Overstay Alarm** | 1× 5 V passive piezo buzzer (sounds strictly `> 180 sim min`, 1×/2×/3× bay cadence) | `A3` |
| **Per-Bay Count-Up LCDs** | 3× `16×2` I2C LCDs (`0x27` open, `0x26` bridge `A0`, `0x25` bridge `A1`) | `A4 (SDA)`, `A5 (SCL)` |

### Core Behavioral Rules
- **1 : 20 Scale Distance Zones**: `DANGER` (`2–5 cm`, Red flash), `CAUTION` (`6–10 cm`, Yellow solid), `SAFE` (`11–20 cm`, Green solid), `EMPTY` (`> 20 cm`, Green solid).
- **5.0-Second Stationary Stop Rule**: A vehicle must remain inside the bay (`≤ 20 cm`) and motionless within `±1 cm` for **5.0 continuous seconds** before count-up starts cleanly at `00:00`. Moving `> 1 cm` resets the 5-second countdown.
- **Grace-First Hourly Tariff**: First `15` simulated minutes free, then `RM 3.00` per started hour via integer ceiling division `((billableMin + 59) / 60) * 3`. Default `60×` demo clock (`1 s = 1 sim min`), toggleable to `1×` real time.
- **Electrical & Cost Budget**: `113.2 mA` worst-case MCU pin load (`< 200 mA` ATmega328P limit), `248.2 mA` peak USB 5 V rail load (`< 500 mA` polyfuse), default hardware kit **`RM 69.70`** (`RM 13.94` per student across 5 members).

---

## Dashboard Features (7 Interactive Views)

1. **Live Simulator** — Real-time 3-bay bench with distance sliders, `±1 cm` jitter injection, 5-second stillness gate, `60× / 1×` clock toggle, Web Audio overstay buzzer, power-cycle recovery, and interactive Serial Monitor.
2. **C++ Code Studio** — Complete procedural Arduino C++ firmware (`kie1004_smart_parking_v3.ino`) written strictly with KIE1004 fundamentals (variables/constants, selection, loops, 1D/2D arrays, function overloading, Insertion Sort median filtering, Linear Search, and pointer pass-by-reference) plus one-click `.ino` download.
3. **Presentation Slides** — 10 uncluttered, layperson-friendly slides across 6 diversified layouts with custom SVG diagrams, complete external word-for-word **Speaker Scripts** (never printed on slides), and one-click 10-page vector **`.pdf`** export.
4. **Master Plan** — 6-phase absolute-beginner build guide (`20` steps) plus an interactive **Exact Circuit Assembly (Wire-by-Wire)** checklist (`P1`–`B1`) and **5-Point Pre-Power Smoke Test**.
5. **Schematic & Pins** — Interactive 20-pin Arduino Uno R3 architecture diagram, filterable pin allocation table, and I2C solder-bridge guide.
6. **Math & Proofs** — Interactive Ohm's Law (`330 Ω`) & MCU/USB power budget calculator, 4-state stationary FSM breakdown, and Grace-First tariff verifier.
7. **BOM, QA & Defense** — Editable BOM quantities with instant live pricing & per-student split, interactive 10-point QA checklist, official KIE1004 rubric mapping, and 12-question Viva defense bank.

---

## Deploy to Netlify (Drag & Drop — Zero Config)

This repository includes a pre-built, 100% self-contained static bundle inside **`netlify-static/`**. All simulation logic, `.ino` download, `.pdf` generation, Web Audio buzzer, and BOM calculations run entirely in the browser with **zero backend required**.

### Instant Drag-and-Drop Steps
1. Open **[Netlify Drop](https://app.netlify.com/drop)** in your browser.
2. Drag the **`netlify-static`** folder from this repository straight into the Netlify Drop upload box.
3. Wait a few seconds — your live static URL is published with full functionality intact.

### Rebuilding `netlify-static/` After Code Changes
If you modify any source code in `src/`, refresh the drag-and-drop folder with:

```bash
npm install
npm run build:netlify
```

This outputs a fresh static site into `netlify-static/` with relative asset paths (`./assets/...`), `_redirects` SPA routing, and `_headers`.

---

## Local Development & Verification

### Prerequisites
- **Node.js 20+** and **npm**

### Commands

```bash
# Install dependencies
npm install

# Start local dev server on http://localhost:3000
npm run dev

# Run TypeScript type check
npm run lint

# Run unit tests (FSM, tariff math, power budget, BOM pricing, firmware rules, PDF binary)
npm test

# Build standard Vite production bundle (dist/)
npm run build

# Build drag-and-drop Netlify static folder (netlify-static/)
npm run build:netlify
```

---

## Hardware Firmware Upload (Arduino IDE 2.x)

1. Open **C++ Code Studio** in the web dashboard and click **Download .ino** to save `kie1004_smart_parking_v3.ino`.
2. In **Arduino IDE 2.x**, install **LiquidCrystal I2C** (by Frank de Brabander) via Library Manager (`Wire.h` is built-in).
3. Assign unique PCF8574 backpack addresses before connecting all three LCDs to `A4 (SDA)` and `A5 (SCL)`:
   - **Bay 1 LCD**: Leave `A0`, `A1`, `A2` open → `0x27`
   - **Bay 2 LCD**: Solder bridge `A0` → `0x26`
   - **Bay 3 LCD**: Solder bridge `A1` → `0x25`
4. Select **Board: Arduino Uno**, pick your COM/USB port (keep pins `D0`/`D1` empty), and click **Upload**.
5. Open **Serial Monitor** at `9600 baud` and test live commands `S`, `T`, `D`, `R1`, `R2`, `R3`.

---

## Repository Structure

```text
├── README.md                       # Project documentation & deployment guide
├── index.html                      # Entry HTML with Inter & JetBrains Mono fonts
├── package.json                    # Scripts (dev, build, build:netlify, lint, test)
├── scripts/
│   └── build-netlify-static.mjs    # Generates self-contained netlify-static/ bundle
├── netlify-static/                 # Ready-to-drag-and-drop Netlify static site
│   ├── index.html
│   ├── _redirects
│   ├── _headers
│   └── assets/
└── src/
    ├── App.tsx                     # Material 3 dashboard shell & collapsible sidebar
    ├── components/
    │   ├── ParkingSimulator.tsx    # Live 3-bay ultrasonic, LED, LCD & buzzer bench
    │   ├── CodeStudioTab.tsx       # Procedural C++ firmware viewer & .ino exporter
    │   ├── SlideDeckStudio.tsx     # 10-slide deck, SVG diagrams & speaker scripts
    │   ├── MasterPlanTab.tsx       # 6-phase guide + wire-by-wire assembly checklist
    │   ├── InteractiveSchematic.tsx# 20-pin Uno diagram & pin filter table
    │   ├── EngineeringCalculations.tsx # Power, resistor & tariff calculators
    │   └── BomAndAssembly.tsx      # Editable BOM pricing, 10-point QA & Viva FAQ
    ├── data/
    │   ├── blueprintData.ts        # Pins, BOM items, assumptions, QA, rubric & FAQ
    │   ├── firmwareCode.ts         # Complete KIE1004 procedural Arduino .ino source
    │   ├── masterPlanData.ts       # 20 beginner steps, P1-B1 wiring & smoke test
    │   └── slidesData.ts           # 10 slides & complete layperson spoken scripts
    └── lib/
        ├── parkingEngine.ts        # Pure FSM, EMA filter, tariff, buzzer & power math
        ├── bomCalculator.ts        # Live BOM quantity & pricing calculator
        ├── slidePdfExporter.ts     # Client-side 10-page 16:9 vector PDF generator
        └── parkingEngine.test.ts   # Automated node:test verification suite
```
