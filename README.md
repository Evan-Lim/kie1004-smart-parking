# KIE1004 Smart Multi-Space Parking Assistance & Management System (v3.1)

Interactive engineering dashboard, live 3-bay Arduino Uno hardware simulator, procedural C++ firmware studio, 10-slide presentation deck with vector PDF export & speaker scripts, beginner wire-by-wire assembly plan, and live BOM pricing calculator for **KIE1004: Programming 1 (Semester 1, 2026/2027)**.

---

## System Overview & Hardware Specification

Built around a single **Arduino Uno R3 (ATmega328P)** utilizing **20 / 20 native pins** plus one **PCF8574 I2C 8-bit expander (`0x24`)** and one **2N2222 NPN emitter-follower tone buffer** to drive **3 independent 5 V passive buzzers** (one per parking bay):

| Subsystem | Specification | Arduino Uno / I2C Pins |
| :--- | :--- | :--- |
| **USB Serial Monitor** | 9600 baud telemetry, receipts & live commands (`S`, `T`, `D`, `R1`–`R3`) | `D0 (RX)`, `D1 (TX)` |
| **Ultrasonic Sensors** | 3 active + 1 spare **HC-SR04** (40 ms Time-Division Multiplexed polling) | `D2/D3`, `D4/D5`, `D6/D7` |
| **Per-Bay Distance LEDs** | 9× 5 mm diffused LEDs (Green / Yellow / Red per bay) via `9× 330 Ω` resistors | `D8–D10`, `D11–D13`, `A0–A2` |
| **3× Independent Passive Buzzers** | 3× 5 V passive buzzers: `A3 → 1 kΩ → 2N2222` Emitter Follower → `TONE_BUS (+)` · `(−)` gated Active-LOW via PCF8574 (`0x24`) `P0` / `P1` / `P2` | `A3` (carrier) + `0x24 P0–P2` |
| **Per-Bay Count-Up LCDs** | 3× `16×2` I2C LCDs (`0x27` open, `0x26` bridge `A0`, `0x25` bridge `A1`) + PCF8574 (`0x24` bridge `A0+A1`) | `A4 (SDA)`, `A5 (SCL)` |

### Core Behavioral Rules
- **1 : 20 Scale Distance Zones**: `DANGER` (`2–5 cm`, Red flash + Bay Passive Buzzer rapid `150 ms` beep), `CAUTION` (`6–10 cm`, Yellow solid), `SAFE` (`11–20 cm`, Green solid), `EMPTY` (`> 20 cm`, Green solid).
- **Per-Bay Passive Buzzer Policy**:
  - **Danger (`2–5 cm`, priority 1)**: Rapid `150 ms ON / 150 ms OFF` staccato beep (`2500 Hz` when Danger-only).
  - **Overstay (`≥ 240 sim min` / `≥ 4 hours`, priority 2)**: Steady `500 ms ON / 1000 ms OFF` slow pulse (`1800 Hz` when Overstay-only).
  - **Simultaneous Mixed Alerts**: Shared **`2000 Hz`** carrier on Pin `A3` while PCF8574 (`0x24`) gates each bay's rapid vs. slow rhythm independently via beginner-friendly subtraction (`mask = 255 - 1/-2/-4`).
- **5.0-Second Stationary Stop Rule**: A vehicle must remain inside the bay (`≤ 20 cm`) and motionless within `±1 cm` for **5.0 continuous seconds** before count-up starts cleanly at `00:00`. Moving `> 1 cm` resets the 5-second countdown.
- **Grace-First 30-Minute Tariff**: First `15` simulated minutes free, then **`RM 1.00` per started 30-minute block** via integer ceiling division `((billableMin + 29) / 30) * 1`. Reaching `≥ 240 min` (4 hours) triggers the overstay alarm while continuing normal `RM 1 / 30 min` billing with no extra surcharge. Default `60×` demo clock (`1 s = 1 sim min`), toggleable to `1×` real time.
- **Electrical & Cost Budget**: `100.3 mA` worst-case MCU pin load (`< 200 mA` ATmega328P limit), `45.0 mA` PCF8574 sink (`< 80 mA`), `49.3 mA` 2N2222 load (`< 600 mA`), `285.6 mA` peak USB 5 V rail load (`< 500 mA` polyfuse), default 11-item hardware kit **`RM 76.70`** (`RM 15.34` per student across 5 members).

---

## Dashboard Features (7 Interactive Views)

1. **Live Simulator** — Real-time 3-bay bench with distance sliders, `±1 cm` jitter injection, 5-second stillness gate, per-bay passive buzzer status rows (`BZ1 P0`, `BZ2 P1`, `BZ3 P2`), live PCF8574 `0x24` hex/binary bus monitor, multi-pitch Web Audio synthesis (`2500 / 1800 / 2000 Hz`), `RM 1 / 30 min` billing (`≥ 4 h` overstay), power-cycle recovery, and interactive Serial Monitor.
2. **C++ Code Studio** — Complete procedural Arduino C++ firmware (`kie1004_smart_parking_v3.ino`) written strictly with KIE1004 fundamentals (variables/constants, selection, loops, 1D/2D arrays, subtraction-based active-LOW PCF8574 gating, function overloading, Insertion Sort median filtering, Linear Search, and pointer pass-by-reference) plus one-click `.ino` download.
3. **Presentation Slides** — 10 uncluttered, layperson-friendly slides across 6 diversified layouts with custom SVG diagrams, complete external word-for-word **Speaker Scripts** (never printed on slides), and one-click 10-page vector **`.pdf`** export.
4. **Master Plan** — 6-phase absolute-beginner build guide (`20` steps) plus an interactive **Exact Circuit Assembly (Wire-by-Wire)** checklist (`P1`–`B4`, including `2N2222` E-B-C and `PCF8574 0x24`) and **6-Point Pre-Power Smoke Test**.
5. **Schematic & Pins** — Three dedicated sub-views:
   - **Wiring Interconnections (CAD Schematic)**: Full-width pin-to-pin electrical diagram showing explicit orthogonal nets, junction solder dots, `9× 330 Ω` resistors, LED polarities, `2N2222` TO-92 E-B-C pinout + dual `1 kΩ` resistors, `100 µF` + `100 nF` decoupling capacitors, 4-device I2C trunk (`0x27–0x24`), and `P0/P1/P2` active-LOW buzzer returns, complete with interactive net isolation, `75%–150%` zoom, and one-click `.svg` vector export.
   - **Overview & I2C Pads**: High-level architecture overview and 4-device I2C solder-pad configuration guide (`0x27–0x24`).
   - **20-Pin Table 1**: Filterable 20-pin Uno + PCF8574 (`0x24`) allocation table with direct jump-to-net trace links.
6. **Math & Proofs** — Interactive Ohm's Law (`330 Ω`), 0–3 simultaneous buzzers, 4-device I2C pull-up (`1.18 kΩ`), ATmega328P/PCF8574/2N2222/USB power calculators, 4-state stationary FSM diagram, and Grace-First `RM 1 / 30 min` + `≥ 4 h` overstay tariff verifier.
7. **BOM, QA & Defense** — Editable 11-item BOM quantities (`RM 76.70` default) with instant live pricing & per-student split, interactive 10-point QA checklist, official KIE1004 rubric mapping, and 12-question Viva defense bank.

---

## Deploy to Netlify (Drag & Drop — Zero Config)

This repository includes a pre-built, 100% self-contained static bundle inside **`netlify-static/`**. All simulation logic, `.ino` download, `.pdf` generation, `.svg` schematic export, Web Audio multi-pitch buzzer, and BOM calculations run entirely in the browser with **zero backend required**.

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

# Run unit tests (FSM, 3-bay passive buzzers, RM 1/30 min tariff, >= 4h overstay, power budget, BOM, firmware, PDF)
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
3. Configure unique 7-bit I2C addresses across all **4** modules before connecting to `A4 (SDA)` and `A5 (SCL)`:
   - **Bay 1 LCD**: Leave `A0`, `A1`, `A2` open → `0x27`
   - **Bay 2 LCD**: Solder bridge `A0` → `0x26`
   - **Bay 3 LCD**: Solder bridge `A1` → `0x25`
   - **PCF8574 Buzzer Expander**: Bridge / shunt `A0 + A1` to GND → `0x24`
4. Wire the **2N2222 Emitter Follower**: Collector (`C`) → `+5 V`, Base (`B`) ← `1 kΩ` ← Arduino `A3`, Emitter (`E`) → `TONE_BUS` (+ `1 kΩ` to `GND`) → all 3 passive buzzers' `(+)` pins; wire Bay 1/2/3 passive buzzers' `(−)` pins to PCF8574 `P0`, `P1`, `P2`.
5. Select **Board: Arduino Uno**, pick your COM/USB port (keep pins `D0`/`D1` empty), and click **Upload**.
6. Open **Serial Monitor** at `9600 baud` and test live commands `S`, `T`, `D`, `R1`, `R2`, `R3`.

---

## Repository Structure

```text
├── README.md                           # Project documentation & deployment guide
├── index.html                          # Entry HTML with Inter & JetBrains Mono fonts
├── package.json                        # Scripts (dev, build, build:netlify, lint, test)
├── scripts/
│   └── build-netlify-static.mjs        # Generates self-contained netlify-static/ bundle
├── netlify-static/                     # Ready-to-drag-and-drop Netlify static site
│   ├── index.html
│   ├── _redirects
│   ├── _headers
│   └── assets/
└── src/
    ├── App.tsx                         # Material 3 dashboard shell & collapsible sidebar
    ├── components/
    │   ├── ParkingSimulator.tsx        # Live 3-bay ultrasonic, LED, LCD & 3-buzzer bench
    │   ├── CodeStudioTab.tsx           # Procedural C++ firmware viewer & .ino exporter
    │   ├── SlideDeckStudio.tsx         # 10-slide deck, SVG diagrams & speaker scripts
    │   ├── MasterPlanTab.tsx           # 6-phase guide + P1–B4 wire-by-wire checklist
    │   ├── InteractiveSchematic.tsx    # Schematic host (Interconnections, Overview & Table 1)
    │   ├── WiringInterconnectionDiagram.tsx # Full-width CAD pin-to-pin wiring SVG & exporter
    │   ├── EngineeringCalculations.tsx # Power, PCF8574, 2N2222 & RM 1/30 min proofs
    │   └── BomAndAssembly.tsx          # Editable RM 76.70 BOM, 10-point QA & Viva FAQ
    ├── data/
    │   ├── blueprintData.ts            # Pins, 11-item BOM, assumptions, QA, rubric & FAQ
    │   ├── firmwareCode.ts             # Complete KIE1004 procedural Arduino .ino source
    │   ├── masterPlanData.ts           # 20 beginner steps, P1–B4 wiring & 6-point smoke test
    │   └── slidesData.ts               # 10 slides & complete layperson spoken scripts
    └── lib/
        ├── parkingEngine.ts            # Pure FSM, EMA filter, 3-buzzer bus & power math
        ├── bomCalculator.ts            # Live BOM quantity & pricing calculator
        ├── slidePdfExporter.ts         # Client-side 10-page 16:9 vector PDF generator
        └── parkingEngine.test.ts       # Automated node:test verification suite
```
