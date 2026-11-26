import React, { useRef, useState } from 'react';
import { Download, ZoomIn, ZoomOut, CheckCircle2, Cable } from 'lucide-react';

export type WiringNetGroup =
  | 'all'
  | 'power'
  | 'ultrasonic'
  | 'leds'
  | 'buzzer'
  | 'i2c'
  | 'uart';

interface NetDetail {
  id: WiringNetGroup;
  title: string;
  route: string;
  components: string;
  checkNote: string;
}

const NET_DETAILS: Record<WiringNetGroup, NetDetail> = {
  all: {
    id: 'all',
    title: 'Complete 20/20 Uno R3 + 4× I2C + 2N2222 Wiring Netlist',
    route: 'Power Rails (+5V/GND) · 3× HC-SR04 (D2–D7) · 9× LED (D8–D13, A0–A2) · A3→2N2222→3× BZ ← 0x24 · A4/A5→4× I2C',
    components: '9× 330 Ω · 2× 1 kΩ · 1× 2N2222 (E-B-C) · 2× 100 µF + 2× 0.1 µF · 3× LCD (0x27–0x25) · 1× PCF8574 (0x24)',
    checkNote: 'Click any subsystem filter or click directly on a wire/block in the schematic to isolate its copper path.',
  },
  power: {
    id: 'power',
    title: 'Regulated +5V & Common GND Distribution Bus',
    route: 'Uno 5V/GND → Left Vertical Rails → All 3× HC-SR04, 2N2222 Collector, 9× LED Cathodes, 3× LCDs & PCF8574 (0x24)',
    components: '2× 100 µF (≥10V electrolytic, stripe to GND) + 2× 0.1 µF ceramic (104) rail decoupling pairs',
    checkNote: 'Bridge midpoint splits on 830-pt breadboard rails; verify 0 Ω GND continuity and ≥4.75 V under full load.',
  },
  ultrasonic: {
    id: 'ultrasonic',
    title: '3× HC-SR04 Ultrasonic Distance Sensors (40 ms TDM)',
    route: 'Bay 1: TRIG→D2, ECHO→D3 · Bay 2: TRIG→D4, ECHO→D5 · Bay 3: TRIG→D6, ECHO→D7 (+VCC/GND from rails)',
    components: '3 active + 1 spare HC-SR04 (5V, 40 kHz, 15° cone, 15 mA burst / 2 mA idle)',
    checkNote: 'Confirm TRIG and ECHO are not swapped; mount each sensor strictly 90° vertical, 2 cm above tabletop.',
  },
  leds: {
    id: 'leds',
    title: '9× Diffused Guidance LEDs + 9× Individual 330 Ω Resistors',
    route: 'Bay 1: D8(G), D9(Y), D10(R) · Bay 2: D11(G), D12(Y), D13(R) · Bay 3: A0(G), A1(Y), A2(R) → 330 Ω → LED → GND',
    components: '9× 5 mm diffused LEDs + 9× 330 Ω 1/4W resistors (Orange–Orange–Brown–Gold; 8.5–9.1 mA each)',
    checkNote: 'Every LED needs its own 330 Ω resistor in series. Long leg (+) faces resistor/pin; flat-rim short leg (−) goes to GND.',
  },
  buzzer: {
    id: 'buzzer',
    title: 'Pin A3 → 2N2222 Emitter Follower → 3× Passive Buzzers ← PCF8574 (0x24)',
    route: 'A3 → 1 kΩ → 2N2222 Base · C→+5V · E→TONE_BUS (+1 kΩ to GND) → BZ1/2/3 (+) · BZ1/2/3 (−) → PCF8574 P0/P1/P2',
    components: '1× 2N2222 NPN (flat face left→right: E-B-C) · 2× 1 kΩ resistors · 3× 5V passive piezo buzzers (green PCB)',
    checkNote: 'Pin A3 sources ≤1 mA; 2N2222 supplies 49.3 mA peak; PCF8574 P0/P1/P2 sink 15 mA each Active-LOW (0=ON, 1=OFF).',
  },
  i2c: {
    id: 'i2c',
    title: '4-Device Shared Hardware I2C Trunk (100 kHz Standard Mode)',
    route: 'Arduino A4 (SDA) & A5 (SCL) → Parallel Bus to LCD 1 (0x27), LCD 2 (0x26), LCD 3 (0x25) & PCF8574 (0x24)',
    components: '4× PCF8574 I2C boards (onboard 4× 4.7 kΩ parallel = 1.18 kΩ / 4.26 mA sink; do NOT add external pull-ups)',
    checkNote: 'Set address pads BEFORE powering: 0x27 Open, 0x26 Bridge A0, 0x25 Bridge A1, 0x24 Bridge A0+A1.',
  },
  uart: {
    id: 'uart',
    title: 'Hardware USB-UART Serial Monitor & Flash Port',
    route: 'Arduino D0 (RX) & D1 (TX) ↔ Onboard USB-UART Bridge (ATmega16U2 / CH340) ↔ PC USB (9600 baud)',
    components: 'USB-A to USB-B data cable (keep D0 and D1 header sockets completely empty)',
    checkNote: 'Never plug external jumpers into D0 or D1; keeps code uploads reliable and runs live S/T/D/R commands.',
  },
};

interface WiringInterconnectionDiagramProps {
  activeNet: WiringNetGroup;
  onSelectNet: (net: WiringNetGroup) => void;
}

export const WiringInterconnectionDiagram: React.FC<WiringInterconnectionDiagramProps> = ({
  activeNet,
  onSelectNet,
}) => {
  const [zoomPct, setZoomPct] = useState<number>(100);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const netOpacity = (group: WiringNetGroup) => {
    if (activeNet === 'all') return 1;
    if (activeNet === group) return 1;
    // Keep power visible subtly when inspecting buzzers or I2C so context stays clear
    if (group === 'power' && (activeNet === 'buzzer' || activeNet === 'i2c' || activeNet === 'ultrasonic')) {
      return 0.35;
    }
    return 0.16;
  };

  const isFocus = (group: WiringNetGroup) => activeNet === group;

  const handleExportSvg = () => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const raw = serializer.serializeToString(svgEl);
    const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${raw}`], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'kie1004_wiring_interconnections_v3_2.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const detail = NET_DETAILS[activeNet];

  const ledRows = [
    { bay: 1, pin: 'D8', label: 'G1', color: '#188038', y: 112 },
    { bay: 1, pin: 'D9', label: 'Y1', color: '#E37400', y: 140 },
    { bay: 1, pin: 'D10', label: 'R1', color: '#D93025', y: 168 },
    { bay: 2, pin: 'D11', label: 'G2', color: '#188038', y: 214 },
    { bay: 2, pin: 'D12', label: 'Y2', color: '#E37400', y: 242 },
    { bay: 2, pin: 'D13', label: 'R2', color: '#D93025', y: 270 },
    { bay: 3, pin: 'A0', label: 'G3', color: '#188038', y: 316 },
    { bay: 3, pin: 'A1', label: 'Y3', color: '#E37400', y: 344 },
    { bay: 3, pin: 'A2', label: 'R3', color: '#D93025', y: 372 },
  ];

  const ultrasonicBays = [
    { bay: 1, y: 162, trigPin: 'D2', echoPin: 'D3', trigY: 196, echoY: 230 },
    { bay: 2, y: 314, trigPin: 'D4', echoPin: 'D5', trigY: 348, echoY: 382 },
    { bay: 3, y: 466, trigPin: 'D6', echoPin: 'D7', trigY: 500, echoY: 534 },
  ];

  const i2cModules = [
    { name: 'BAY 1 LCD', addr: '0x27', pads: 'A0/A1/A2 Open', x: 700, isExpander: false },
    { name: 'BAY 2 LCD', addr: '0x26', pads: 'Bridge A0', x: 862, isExpander: false },
    { name: 'BAY 3 LCD', addr: '0x25', pads: 'Bridge A1', x: 1024, isExpander: false },
    { name: 'PCF8574', addr: '0x24', pads: 'Bridge A0+A1', x: 1186, isExpander: true },
  ];

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2.5 overflow-hidden">
      {/* Toolbar: Net Isolation Filters + Zoom + Vector SVG Export */}
      <div className="bg-white border border-[#DADCE0] px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[11px] font-mono text-[#5F6368] mr-1 inline-flex items-center gap-1">
            <Cable className="w-3.5 h-3.5 text-[#1A73E8]" />
            Isolate Net:
          </span>
          {(
            [
              ['all', 'All Nets'],
              ['power', 'Power +5V/GND'],
              ['ultrasonic', '3× HC-SR04'],
              ['leds', '9× LEDs + 330 Ω'],
              ['buzzer', '3× Buzzers (2N2222+0x24)'],
              ['i2c', '4× I2C Bus'],
              ['uart', 'USB D0/D1'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              data-testid={`wiring-filter-${id}`}
              onClick={() => onSelectNet(id)}
              className={`px-2.5 py-1 text-[11px] border transition-colors whitespace-nowrap cursor-pointer ${
                activeNet === id
                  ? 'bg-[#1A73E8] border-[#1A73E8] text-white font-medium'
                  : 'bg-[#F8F9FA] border-[#DADCE0] text-[#3C4043] hover:bg-[#E8F0FE] hover:text-[#174EA6]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="inline-flex items-center border border-[#DADCE0] bg-[#F4F6F9]">
            <button
              type="button"
              onClick={() => setZoomPct((z) => Math.max(75, z - 25))}
              disabled={zoomPct <= 75}
              aria-label="Zoom out schematic"
              className="px-2 py-1 text-[#202124] hover:bg-white disabled:opacity-40 cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-[#202124] tabular-nums bg-white border-x border-[#DADCE0] py-1">
              {zoomPct}%
            </span>
            <button
              type="button"
              onClick={() => setZoomPct((z) => Math.min(150, z + 25))}
              disabled={zoomPct >= 150}
              aria-label="Zoom in schematic"
              className="px-2 py-1 text-[#202124] hover:bg-white disabled:opacity-40 cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            type="button"
            data-testid="export-wiring-svg"
            onClick={handleExportSvg}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium border border-[#DADCE0] bg-white text-[#202124] hover:bg-[#F4F6F9] whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#1A73E8]" />
            Export SVG
          </button>
        </div>
      </div>

      {/* Scrollable CAD Blueprint Canvas */}
      <div className="flex-1 min-h-0 bg-white border border-[#DADCE0] overflow-auto dash-scroll p-3">
        <div
          style={{
            width: `${zoomPct}%`,
            minWidth: `${Math.round((980 * zoomPct) / 100)}px`,
          }}
        >
          <svg
            ref={svgRef}
            data-testid="wiring-interconnection-svg"
            viewBox="0 0 1380 870"
            className="w-full h-auto block select-none"
            role="img"
            aria-label="Detailed pin-to-pin wiring interconnection schematic showing Arduino Uno R3, 3 HC-SR04 sensors, 9 LEDs with 330 ohm resistors, 2N2222 NPN transistor with 1k resistors, 3 passive buzzers, PCF8574 0x24 expander, and 3 I2C LCDs"
          >
            <defs>
              <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#EDF1F7" strokeWidth="0.8" />
              </pattern>
            </defs>

            {/* CAD Drafting Canvas & Title Block */}
            <rect x="0" y="0" width="1380" height="870" fill="#FAFBFD" />
            <rect x="0" y="0" width="1380" height="870" fill="url(#cadGrid)" />
            <rect x="10" y="10" width="1360" height="850" fill="none" stroke="#CBD5E1" strokeWidth="1.2" />

            {/* Top Sheet Header */}
            <rect x="10" y="10" width="1360" height="36" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
            <text x="24" y="32" fill="#174EA6" fontSize="12.5" fontWeight="500" fontFamily="Inter, sans-serif">
              SHEET 1 OF 1 — PIN-TO-PIN WIRING INTERCONNECTION SCHEMATIC (ARDUINO UNO R3 + 2N2222 + PCF8574 0x24)
            </text>
            <text x="1356" y="32" textAnchor="end" fill="#5F6368" fontSize="10.5" fontFamily="JetBrains Mono, monospace">
              REV v3.2 · 20/20 PINS · 4× I2C · 100.3 mA MCU / 285.6 mA USB
            </text>

            {/* ============================================================== */}
            {/* NET 1: POWER RAILS (+5V & GND) + DUAL DECOUPLING CAPACITORS    */}
            {/* ============================================================== */}
            <g
              opacity={netOpacity('power')}
              onClick={() => onSelectNet(activeNet === 'power' ? 'all' : 'power')}
              className="cursor-pointer transition-opacity duration-150"
            >
              {/* Left Vertical Power Bus Bars */}
              <line x1="36" y1="68" x2="36" y2="820" stroke="#C5221F" strokeWidth={isFocus('power') ? '3.4' : '2.4'} />
              <line x1="66" y1="68" x2="66" y2="842" stroke="#202124" strokeWidth={isFocus('power') ? '3.4' : '2.4'} />
              <rect x="20" y="52" width="32" height="17" fill="#FCE8E6" stroke="#C5221F" strokeWidth="1" />
              <text x="36" y="64" textAnchor="middle" fill="#A50E0E" fontSize="10" fontWeight="500" fontFamily="JetBrains Mono, monospace">+5V</text>
              <rect x="52" y="52" width="30" height="17" fill="#E8EAED" stroke="#202124" strokeWidth="1" />
              <text x="67" y="64" textAnchor="middle" fill="#202124" fontSize="10" fontWeight="500" fontFamily="JetBrains Mono, monospace">GND</text>

              {/* Bottom Horizontal Power Bus Bars feeding all 4 I2C Modules & LED GND Return */}
              <line x1="36" y1="820" x2="1280" y2="820" stroke="#C5221F" strokeWidth={isFocus('power') ? '3' : '2'} />
              <line x1="66" y1="842" x2="1306" y2="842" stroke="#202124" strokeWidth={isFocus('power') ? '3' : '2'} />
              <circle cx="36" cy="820" r="3.5" fill="#C5221F" />
              <circle cx="66" cy="842" r="3.5" fill="#202124" />
              <text x="410" y="814" fill="#A50E0E" fontSize="9.5" fontFamily="JetBrains Mono, monospace">+5V MAIN BREADBOARD RAIL (285.6 mA peak)</text>
              <text x="410" y="837" fill="#202124" fontSize="9.5" fontFamily="JetBrains Mono, monospace">COMMON GND RETURN RAIL (STAR BONDED)</text>

              {/* Uno 5V & GND Feed Taps */}
              <line x1="36" y1="108" x2="404" y2="108" stroke="#C5221F" strokeWidth={isFocus('power') ? '2.8' : '2'} />
              <circle cx="36" cy="108" r="3.5" fill="#C5221F" />
              <line x1="66" y1="132" x2="404" y2="132" stroke="#202124" strokeWidth={isFocus('power') ? '2.8' : '2'} />
              <circle cx="66" cy="132" r="3.5" fill="#202124" />
              <text x="200" y="103" textAnchor="middle" fill="#A50E0E" fontSize="9" fontFamily="JetBrains Mono, monospace">Uno 5V Out → +5V Rail</text>
              <text x="200" y="127" textAnchor="middle" fill="#202124" fontSize="9" fontFamily="JetBrains Mono, monospace">Uno GND → Common GND Rail</text>

              {/* Decoupling Pair #1 (Near Ultrasonic Sensors) */}
              <rect x="116" y="54" width="234" height="42" fill="#FFFDF5" stroke="#B06000" strokeWidth="1" strokeDasharray="3 2" />
              <text x="124" y="68" fill="#7A4100" fontSize="9.2" fontWeight="500" fontFamily="Inter, sans-serif">
                Decoupling Pair #1 (Near 3× HC-SR04)
              </text>
              <text x="124" y="82" fill="#5F6368" fontSize="8.8" fontFamily="JetBrains Mono, monospace">
                C1: 100 µF (+→5V, −→GND) ‖ C2: 0.1 µF (104)
              </text>
              <line x1="36" y1="74" x2="116" y2="74" stroke="#C5221F" strokeWidth="1.4" />
              <circle cx="36" cy="74" r="3" fill="#C5221F" />
              <line x1="66" y1="86" x2="116" y2="86" stroke="#202124" strokeWidth="1.4" />
              <circle cx="66" cy="86" r="3" fill="#202124" />

              {/* Decoupling Pair #2 (Near 4× I2C + 2N2222) */}
              <rect x="116" y="742" width="246" height="58" fill="#FFFDF5" stroke="#B06000" strokeWidth="1" strokeDasharray="3 2" />
              <text x="124" y="758" fill="#7A4100" fontSize="9.2" fontWeight="500" fontFamily="Inter, sans-serif">
                Decoupling Pair #2 (Near 4× I2C &amp; 2N2222)
              </text>
              {/* Capacitor Schematic Symbols */}
              <line x1="146" y1="764" x2="146" y2="774" stroke="#C5221F" strokeWidth="1.4" />
              <line x1="136" y1="774" x2="156" y2="774" stroke="#202124" strokeWidth="2" />
              <path d="M 136 782 Q 146 777 156 782" fill="none" stroke="#202124" strokeWidth="1.8" />
              <line x1="146" y1="780" x2="146" y2="792" stroke="#202124" strokeWidth="1.4" />
              <text x="162" y="776" fill="#202124" fontSize="8.6" fontFamily="JetBrains Mono, monospace">C3: 100 µF (Electrolytic +/−)</text>
              <text x="162" y="790" fill="#5F6368" fontSize="8.6" fontFamily="JetBrains Mono, monospace">C4: 0.1 µF Ceramic (104)</text>
              <line x1="36" y1="764" x2="116" y2="764" stroke="#C5221F" strokeWidth="1.4" />
              <circle cx="36" cy="764" r="3" fill="#C5221F" />
              <line x1="66" y1="786" x2="116" y2="786" stroke="#202124" strokeWidth="1.4" />
              <circle cx="66" cy="786" r="3" fill="#202124" />
            </g>

            {/* ============================================================== */}
            {/* NET 2: 3x HC-SR04 ULTRASONIC SENSORS (D2–D7)                   */}
            {/* ============================================================== */}
            <g
              opacity={netOpacity('ultrasonic')}
              onClick={() => onSelectNet(activeNet === 'ultrasonic' ? 'all' : 'ultrasonic')}
              className="cursor-pointer transition-opacity duration-150"
            >
              {ultrasonicBays.map((s) => (
                <g key={s.bay}>
                  {/* Module Outline */}
                  <rect
                    x="116"
                    y={s.y}
                    width="180"
                    height="122"
                    fill="#FFFFFF"
                    stroke={isFocus('ultrasonic') ? '#137333' : '#5F6368'}
                    strokeWidth={isFocus('ultrasonic') ? '2' : '1.3'}
                  />
                  <rect x="116" y={s.y} width="180" height="24" fill="#E6F4EA" stroke="#137333" strokeWidth="1" />
                  <text x="206" y={s.y + 16} textAnchor="middle" fill="#137333" fontSize="10.8" fontWeight="500" fontFamily="Inter, sans-serif">
                    HC-SR04 · BAY {s.bay}
                  </text>

                  {/* Transducer Circles */}
                  <circle cx="176" cy={s.y + 58} r="16" fill="#F8FAFD" stroke="#9AA0A6" strokeWidth="1.2" />
                  <circle cx="176" cy={s.y + 58} r="7" fill="#E8EAED" stroke="#9AA0A6" strokeWidth="0.8" />
                  <text x="176" y={s.y + 88} textAnchor="middle" fill="#5F6368" fontSize="8.2" fontFamily="JetBrains Mono, monospace">TX 40kHz</text>

                  <circle cx="236" cy={s.y + 58} r="16" fill="#F8FAFD" stroke="#9AA0A6" strokeWidth="1.2" />
                  <circle cx="236" cy={s.y + 58} r="7" fill="#E8EAED" stroke="#9AA0A6" strokeWidth="0.8" />
                  <text x="236" y={s.y + 88} textAnchor="middle" fill="#5F6368" fontSize="8.2" fontFamily="JetBrains Mono, monospace">RX Echo</text>

                  <text x="206" y={s.y + 112} textAnchor="middle" fill="#5F6368" fontSize="8.4" fontFamily="JetBrains Mono, monospace">
                    Slot t={(s.bay - 1) * 40}ms · 15 mA burst
                  </text>

                  {/* Left Power Pins: VCC & GND */}
                  <circle cx="116" cy={s.y + 42} r="3" fill="#C5221F" />
                  <text x="123" y={s.y + 45} fill="#A50E0E" fontSize="8.8" fontFamily="JetBrains Mono, monospace">VCC</text>
                  <line x1="36" y1={s.y + 42} x2="116" y2={s.y + 42} stroke="#C5221F" strokeWidth="1.6" />
                  <circle cx="36" cy={s.y + 42} r="3.2" fill="#C5221F" />

                  <circle cx="116" cy={s.y + 98} r="3" fill="#202124" />
                  <text x="123" y={s.y + 101} fill="#202124" fontSize="8.8" fontFamily="JetBrains Mono, monospace">GND</text>
                  <line x1="66" y1={s.y + 98} x2="116" y2={s.y + 98} stroke="#202124" strokeWidth="1.6" />
                  <circle cx="66" cy={s.y + 98} r="3.2" fill="#202124" />

                  {/* Right Signal Pins: TRIG & ECHO -> Orthogonal to Uno */}
                  <circle cx="296" cy={s.trigY} r="3" fill="#1A73E8" />
                  <text x="288" y={s.trigY + 3} textAnchor="end" fill="#174EA6" fontSize="8.8" fontFamily="JetBrains Mono, monospace">TRIG</text>
                  <line x1="296" y1={s.trigY} x2="404" y2={s.trigY} stroke="#1A73E8" strokeWidth={isFocus('ultrasonic') ? '2.4' : '1.7'} />
                  <text x="350" y={s.trigY - 5} textAnchor="middle" fill="#174EA6" fontSize="8.8" fontFamily="JetBrains Mono, monospace">
                    TRIG_{s.bay} → {s.trigPin}
                  </text>

                  <circle cx="296" cy={s.echoY} r="3" fill="#137333" />
                  <text x="288" y={s.echoY + 3} textAnchor="end" fill="#137333" fontSize="8.8" fontFamily="JetBrains Mono, monospace">ECHO</text>
                  <line x1="296" y1={s.echoY} x2="404" y2={s.echoY} stroke="#137333" strokeWidth={isFocus('ultrasonic') ? '2.4' : '1.7'} />
                  <text x="350" y={s.echoY - 5} textAnchor="middle" fill="#137333" fontSize="8.8" fontFamily="JetBrains Mono, monospace">
                    ECHO_{s.bay} → {s.echoPin}
                  </text>
                </g>
              ))}
            </g>

            {/* ============================================================== */}
            {/* NET 3: USB SERIAL MONITOR (D0/D1)                              */}
            {/* ============================================================== */}
            <g
              opacity={netOpacity('uart')}
              onClick={() => onSelectNet(activeNet === 'uart' ? 'all' : 'uart')}
              className="cursor-pointer transition-opacity duration-150"
            >
              <rect
                x="116"
                y="620"
                width="180"
                height="94"
                fill="#FFFFFF"
                stroke={isFocus('uart') ? '#1A73E8' : '#5F6368'}
                strokeWidth={isFocus('uart') ? '2' : '1.3'}
              />
              <rect x="116" y="620" width="180" height="22" fill="#F1F3F4" stroke="#9AA0A6" strokeWidth="1" />
              <text x="206" y="635" textAnchor="middle" fill="#202124" fontSize="10.2" fontWeight="500" fontFamily="Inter, sans-serif">
                PC USB SERIAL (9600 BAUD)
              </text>
              <text x="206" y="662" textAnchor="middle" fill="#3C4043" fontSize="9.2" fontFamily="JetBrains Mono, monospace">
                Commands: S, T, D, R1–R3
              </text>
              <text x="206" y="680" textAnchor="middle" fill="#137333" fontSize="8.8" fontFamily="Inter, sans-serif">
                Receipts · Live Telemetry
              </text>
              <text x="206" y="700" textAnchor="middle" fill="#C5221F" fontSize="8.5" fontFamily="JetBrains Mono, monospace">
                Keep D0/D1 jumpers EMPTY
              </text>

              <line x1="296" y1="652" x2="404" y2="652" stroke="#5F6368" strokeWidth={isFocus('uart') ? '2.4' : '1.5'} strokeDasharray="5 3" />
              <text x="350" y="646" textAnchor="middle" fill="#5F6368" fontSize="8.8" fontFamily="JetBrains Mono, monospace">USB RX (D0)</text>
              <line x1="296" y1="686" x2="404" y2="686" stroke="#5F6368" strokeWidth={isFocus('uart') ? '2.4' : '1.5'} strokeDasharray="5 3" />
              <text x="350" y="680" textAnchor="middle" fill="#5F6368" fontSize="8.8" fontFamily="JetBrains Mono, monospace">USB TX (D1)</text>
            </g>

            {/* ============================================================== */}
            {/* CENTER MCU: ARDUINO UNO R3 (ALWAYS CRISP & READABLE)           */}
            {/* ============================================================== */}
            <g>
              {/* USB-B Silver Connector Header */}
              <rect x="484" y="56" width="60" height="22" fill="#E8EAED" stroke="#5F6368" strokeWidth="1.2" />
              <text x="514" y="70" textAnchor="middle" fill="#3C4043" fontSize="8.5" fontFamily="JetBrains Mono, monospace">USB-B</text>

              {/* Uno Main Board Body */}
              <rect x="404" y="78" width="220" height="656" fill="#EBF3FE" stroke="#1A73E8" strokeWidth="2" />
              <text x="514" y="102" textAnchor="middle" fill="#174EA6" fontSize="14.5" fontWeight="500" fontFamily="Inter, sans-serif">
                ARDUINO UNO R3
              </text>
              <text x="514" y="119" textAnchor="middle" fill="#1A73E8" fontSize="9.8" fontFamily="JetBrains Mono, monospace">
                ATmega328P · 16 MHz · 20/20
              </text>

              {/* Internal IC Die Graphic */}
              <rect x="482" y="420" width="64" height="148" fill="#202124" stroke="#5F6368" strokeWidth="1" />
              <text
                x="514"
                y="494"
                textAnchor="middle"
                fill="#E8EAED"
                fontSize="8.8"
                fontFamily="JetBrains Mono, monospace"
                transform="rotate(-90 514 494)"
              >
                ATMEGA328P-PU
              </text>

              {/* Left Pin Stubs */}
              {[
                { y: 108, label: '5V', color: '#C5221F' },
                { y: 132, label: 'GND', color: '#202124' },
                { y: 196, label: 'D2  TRIG_1', color: '#174EA6' },
                { y: 230, label: 'D3  ECHO_1', color: '#137333' },
                { y: 348, label: 'D4  TRIG_2', color: '#174EA6' },
                { y: 382, label: 'D5  ECHO_2', color: '#137333' },
                { y: 500, label: 'D6  TRIG_3', color: '#174EA6' },
                { y: 534, label: 'D7  ECHO_3', color: '#137333' },
                { y: 652, label: 'D0  RX', color: '#5F6368' },
                { y: 686, label: 'D1  TX', color: '#5F6368' },
              ].map((p) => (
                <g key={p.label}>
                  <rect x="398" y={p.y - 4} width="10" height="8" fill="#FFFFFF" stroke={p.color} strokeWidth="1.4" />
                  <text x="415" y={p.y + 3.5} fill={p.color} fontSize="9.5" fontWeight="500" fontFamily="JetBrains Mono, monospace">
                    {p.label}
                  </text>
                </g>
              ))}

              {/* Right Pin Stubs */}
              {[
                { y: 112, label: 'LED_G1  D8', color: '#188038' },
                { y: 140, label: 'LED_Y1  D9', color: '#B06000' },
                { y: 168, label: 'LED_R1  D10', color: '#C5221F' },
                { y: 214, label: 'LED_G2  D11', color: '#188038' },
                { y: 242, label: 'LED_Y2  D12', color: '#B06000' },
                { y: 270, label: 'LED_R2  D13', color: '#C5221F' },
                { y: 316, label: 'LED_G3  A0', color: '#188038' },
                { y: 344, label: 'LED_Y3  A1', color: '#B06000' },
                { y: 372, label: 'LED_R3  A2', color: '#C5221F' },
                { y: 464, label: 'TONE    A3', color: '#C5221F' },
                { y: 652, label: 'SDA     A4', color: '#1A73E8' },
                { y: 686, label: 'SCL     A5', color: '#7B1FA2' },
              ].map((p) => (
                <g key={p.label}>
                  <rect x="620" y={p.y - 4} width="10" height="8" fill="#FFFFFF" stroke={p.color} strokeWidth="1.4" />
                  <text x="613" y={p.y + 3.5} textAnchor="end" fill={p.color} fontSize="9.5" fontWeight="500" fontFamily="JetBrains Mono, monospace">
                    {p.label}
                  </text>
                </g>
              ))}

              {/* MCU Budget Footnote inside Uno */}
              <rect x="418" y="704" width="192" height="22" fill="#FFFFFF" stroke="#AECBFA" strokeWidth="1" />
              <text x="514" y="718" textAnchor="middle" fill="#174EA6" fontSize="8.8" fontFamily="JetBrains Mono, monospace">
                MCU Max: 100.3 / 200 mA (50.1%)
              </text>
            </g>

            {/* ============================================================== */}
            {/* NET 4: 9x LEDs + 9x 330 OHM SERIES RESISTORS + GND RETURN      */}
            {/* ============================================================== */}
            <g
              opacity={netOpacity('leds')}
              onClick={() => onSelectNet(activeNet === 'leds' ? 'all' : 'leds')}
              className="cursor-pointer transition-opacity duration-150"
            >
              {/* Group Container Boxes for Bay 1, 2, 3 LEDs */}
              {[
                { bay: 1, y: 92, title: 'BAY 1 GUIDANCE LEDS (D8–D10)' },
                { bay: 2, y: 194, title: 'BAY 2 GUIDANCE LEDS (D11–D13)' },
                { bay: 3, y: 296, title: 'BAY 3 GUIDANCE LEDS (A0–A2)' },
              ].map((grp) => (
                <g key={grp.bay}>
                  <rect x="688" y={grp.y} width="286" height="90" fill="#FFFFFF" stroke="#DADCE0" strokeWidth="1.1" />
                  <text x="698" y={grp.y + 12} fill="#5F6368" fontSize="8.5" fontWeight="500" fontFamily="JetBrains Mono, monospace">
                    {grp.title}
                  </text>
                </g>
              ))}

              {/* 9 Individual Wires -> 330 Ohm Resistor Symbol -> LED Diode Symbol -> Common GND Bus */}
              {ledRows.map((row) => (
                <g key={row.pin}>
                  {/* Wire from Uno Pin to Resistor */}
                  <line
                    x1="630"
                    y1={row.y}
                    x2="718"
                    y2={row.y}
                    stroke={row.color}
                    strokeWidth={isFocus('leds') ? '2.2' : '1.5'}
                  />
                  {/* IEC 330 Ohm Resistor Box */}
                  <rect x="718" y={row.y - 6} width="54" height="12" fill="#FEF7E0" stroke="#B06000" strokeWidth="1.2" />
                  <text x="745" y={row.y + 3} textAnchor="middle" fill="#7A4100" fontSize="8" fontWeight="500" fontFamily="JetBrains Mono, monospace">
                    330 Ω
                  </text>
                  {/* Wire from Resistor to LED Anode (+) */}
                  <line x1="772" y1={row.y} x2="834" y2={row.y} stroke={row.color} strokeWidth={isFocus('leds') ? '2.2' : '1.5'} />
                  <text x="826" y={row.y - 4} textAnchor="end" fill="#5F6368" fontSize="7.5" fontFamily="JetBrains Mono, monospace">+</text>

                  {/* LED Diode Symbol (Triangle + Cathode Bar) */}
                  <polygon
                    points={`834,${row.y - 7} 834,${row.y + 7} 850,${row.y}`}
                    fill={row.color}
                    stroke={row.color}
                    strokeWidth="1"
                  />
                  <line x1="850" y1={row.y - 7} x2="850" y2={row.y + 7} stroke="#202124" strokeWidth="1.8" />
                  <text x="857" y={row.y - 4} fill="#5F6368" fontSize="7.5" fontFamily="JetBrains Mono, monospace">−</text>
                  <text x="876" y={row.y + 3.5} fill={row.color} fontSize="9.2" fontWeight="500" fontFamily="JetBrains Mono, monospace">
                    {row.label}
                  </text>

                  {/* Cathode Wire to Shared LED GND Bus (x=942) */}
                  <line x1="850" y1={row.y} x2="942" y2={row.y} stroke="#202124" strokeWidth="1.4" />
                  <circle cx="942" cy={row.y} r="2.8" fill="#202124" />
                </g>
              ))}

              {/* Shared Vertical LED Cathode Return Trunk -> Bottom GND Bus */}
              <line x1="942" y1="112" x2="942" y2="396" stroke="#202124" strokeWidth={isFocus('leds') ? '2.6' : '1.8'} />
              <line x1="942" y1="396" x2="1352" y2="396" stroke="#202124" strokeWidth={isFocus('leds') ? '2.6' : '1.6'} />
              <line x1="1352" y1="396" x2="1352" y2="842" stroke="#202124" strokeWidth={isFocus('leds') ? '2.6' : '1.6'} />
              <line x1="1306" y1="842" x2="1352" y2="842" stroke="#202124" strokeWidth="1.8" />
              <circle cx="1352" cy="842" r="3.2" fill="#202124" />
              <text x="1346" y="595" textAnchor="end" fill="#5F6368" fontSize="8.5" fontFamily="JetBrains Mono, monospace" transform="rotate(-90 1346 595)">
                LED CATHODE GND RETURN → COMMON GND RAIL
              </text>

              {/* Right Side LED Assembly Spec Box */}
              <rect x="996" y="92" width="336" height="294" fill="#FFFFFF" stroke="#DADCE0" strokeWidth="1.2" />
              <rect x="996" y="92" width="336" height="26" fill="#F8F9FA" stroke="#DADCE0" strokeWidth="1" />
              <text x="1010" y="109" fill="#202124" fontSize="10.2" fontWeight="500" fontFamily="Inter, sans-serif">
                LED &amp; 330 Ω SERIES WIRING SPECIFICATION
              </text>
              <text x="1010" y="138" fill="#3C4043" fontSize="9.5" fontFamily="Inter, sans-serif">
                • Every LED uses a dedicated 330 Ω resistor (9 total).
              </text>
              <text x="1010" y="156" fill="#5F6368" fontSize="9" fontFamily="JetBrains Mono, monospace">
                Color Code: Orange · Orange · Brown · Gold
              </text>
              <line x1="1010" y1="170" x2="1318" y2="170" stroke="#E8EAED" />
              <text x="1010" y="190" fill="#137333" fontSize="9.3" fontFamily="JetBrains Mono, monospace">
                Green (VF=2.2V): (5.0−2.2)/330 = 8.48 mA
              </text>
              <text x="1010" y="208" fill="#B06000" fontSize="9.3" fontFamily="JetBrains Mono, monospace">
                Yellow(VF=2.0V): (5.0−2.0)/330 = 9.09 mA
              </text>
              <text x="1010" y="226" fill="#C5221F" fontSize="9.3" fontFamily="JetBrains Mono, monospace">
                Red   (VF=2.0V): (5.0−2.0)/330 = 9.09 mA
              </text>
              <text x="1010" y="248" fill="#174EA6" fontSize="9.2" fontWeight="500" fontFamily="JetBrains Mono, monospace">
                Worst-Case All 9 LEDs ON = 80.0 mA (≪200 mA)
              </text>
              <line x1="1010" y1="262" x2="1318" y2="262" stroke="#E8EAED" />
              <text x="1010" y="282" fill="#202124" fontSize="9.5" fontWeight="500" fontFamily="Inter, sans-serif">
                Distance Zone &amp; Overstay Mapping (1:20 Scale)
              </text>
              <text x="1010" y="302" fill="#137333" fontSize="9" fontFamily="JetBrains Mono, monospace">
                &gt; 20 cm / 11–20 cm → Green Solid (Silent)
              </text>
              <text x="1010" y="320" fill="#B06000" fontSize="9" fontFamily="JetBrains Mono, monospace">
                6–10 cm (Caution)  → Yellow Solid (Silent)
              </text>
              <text x="1010" y="338" fill="#C5221F" fontSize="9" fontFamily="JetBrains Mono, monospace">
                2–5 cm (Danger)    → Red Flash + 2500Hz BZ
              </text>
              <text x="1010" y="356" fill="#A50E0E" fontSize="9" fontFamily="JetBrains Mono, monospace">
                ≥ 240 min (4 hrs)  → R/Y Strobe + 1800Hz BZ
              </text>
              <text x="1010" y="374" fill="#5F6368" fontSize="8.8" fontFamily="Inter, sans-serif">
                Tariff: 15 min free, then RM 1.00 / started 30 min
              </text>
            </g>

            {/* ============================================================== */}
            {/* NET 5: 2N2222 EMITTER FOLLOWER + 3x PASSIVE BUZZERS + P0..P2   */}
            {/* ============================================================== */}
            <g
              opacity={netOpacity('buzzer')}
              onClick={() => onSelectNet(activeNet === 'buzzer' ? 'all' : 'buzzer')}
              className="cursor-pointer transition-opacity duration-150"
            >
              {/* Stage Frame */}
              <rect
                x="688"
                y="412"
                width="644"
                height="196"
                fill="#FFFBFB"
                stroke={isFocus('buzzer') ? '#C5221F' : '#E57373'}
                strokeWidth={isFocus('buzzer') ? '2' : '1.3'}
              />
              <rect x="688" y="412" width="644" height="22" fill="#FCE8E6" stroke="#E57373" strokeWidth="1" />
              <text x="700" y="427" fill="#A50E0E" fontSize="10" fontWeight="500" fontFamily="Inter, sans-serif">
                3× INDEPENDENT 5V PASSIVE BUZZER STAGE — PIN A3 → 2N2222 EMITTER FOLLOWER → TONE_BUS (+) · PCF8574 (0x24) GATES (−)
              </text>

              {/* Wire from Arduino Pin A3 -> Base Resistor R_B (1 kOhm) */}
              <line x1="630" y1="464" x2="696" y2="464" stroke="#C5221F" strokeWidth={isFocus('buzzer') ? '2.6' : '2'} />
              <text x="660" y="457" textAnchor="middle" fill="#A50E0E" fontSize="8.5" fontFamily="JetBrains Mono, monospace">tone()</text>
              <rect x="696" y="457" width="52" height="14" fill="#FEF7E0" stroke="#B06000" strokeWidth="1.3" />
              <text x="722" y="467" textAnchor="middle" fill="#7A4100" fontSize="8.2" fontWeight="500" fontFamily="JetBrains Mono, monospace">1 kΩ</text>
              <text x="722" y="451" textAnchor="middle" fill="#5F6368" fontSize="7.8" fontFamily="JetBrains Mono, monospace">R_B (≤1mA)</text>
              <line x1="748" y1="464" x2="788" y2="464" stroke="#C5221F" strokeWidth="1.8" />

              {/* 2N2222 NPN Transistor Symbol */}
              <circle cx="804" cy="464" r="22" fill="#FFFFFF" stroke="#202124" strokeWidth="1.6" />
              {/* Base Bar */}
              <line x1="795" y1="452" x2="795" y2="476" stroke="#202124" strokeWidth="2.4" />
              <line x1="788" y1="464" x2="795" y2="464" stroke="#202124" strokeWidth="1.8" />
              <text x="780" y="476" textAnchor="end" fill="#202124" fontSize="8.2" fontWeight="500" fontFamily="JetBrains Mono, monospace">B</text>
              {/* Collector Leg -> +5V */}
              <line x1="795" y1="457" x2="812" y2="446" stroke="#202124" strokeWidth="1.8" />
              <line x1="812" y1="446" x2="812" y2="438" stroke="#C5221F" strokeWidth="1.8" />
              <text x="822" y="447" fill="#C5221F" fontSize="8.5" fontWeight="500" fontFamily="JetBrains Mono, monospace">C → +5V</text>
              {/* Emitter Leg with Arrow -> TONE_BUS */}
              <line x1="795" y1="471" x2="812" y2="482" stroke="#202124" strokeWidth="1.8" />
              <polygon points="810,481 801,480 806,474" fill="#202124" />
              <line x1="812" y1="482" x2="812" y2="512" stroke="#D93025" strokeWidth="2.2" />
              <circle cx="812" cy="512" r="3.5" fill="#D93025" />
              <text x="822" y="492" fill="#202124" fontSize="8.5" fontWeight="500" fontFamily="JetBrains Mono, monospace">E (4.3 Vpp)</text>

              {/* 2N2222 Pinout Guide Label */}
              <rect x="696" y="498" width="96" height="44" fill="#FFFFFF" stroke="#DADCE0" strokeWidth="1" />
              <text x="744" y="512" textAnchor="middle" fill="#202124" fontSize="8.4" fontWeight="500" fontFamily="JetBrains Mono, monospace">2N2222 TO-92</text>
              <text x="744" y="524" textAnchor="middle" fill="#5F6368" fontSize="7.6" fontFamily="Inter, sans-serif">Flat face to you:</text>
              <text x="744" y="536" textAnchor="middle" fill="#174EA6" fontSize="8.2" fontWeight="500" fontFamily="JetBrains Mono, monospace">L=E · M=B · R=C</text>

              {/* Emitter Pull-Down Resistor R_PD (1 kOhm -> GND) */}
              <line x1="812" y1="512" x2="812" y2="532" stroke="#202124" strokeWidth="1.6" />
              <rect x="804" y="532" width="16" height="40" fill="#FEF7E0" stroke="#B06000" strokeWidth="1.2" />
              <text x="826" y="550" fill="#7A4100" fontSize="8.2" fontWeight="500" fontFamily="JetBrains Mono, monospace">R_PD 1 kΩ</text>
              <text x="826" y="562" fill="#5F6368" fontSize="7.6" fontFamily="Inter, sans-serif">Pull-down</text>
              <line x1="812" y1="572" x2="812" y2="588" stroke="#202124" strokeWidth="1.6" />
              {/* Ground Symbol */}
              <line x1="800" y1="588" x2="824" y2="588" stroke="#202124" strokeWidth="2" />
              <line x1="804" y1="593" x2="820" y2="593" stroke="#202124" strokeWidth="1.6" />
              <line x1="808" y1="598" x2="816" y2="598" stroke="#202124" strokeWidth="1.2" />
              <text x="828" y="595" fill="#202124" fontSize="8" fontFamily="JetBrains Mono, monospace">GND</text>

              {/* Shared Horizontal TONE_BUS feeding BZ1, BZ2, BZ3 (+) */}
              <line x1="812" y1="512" x2="1222" y2="512" stroke="#D93025" strokeWidth={isFocus('buzzer') ? '3' : '2.2'} />
              <text x="900" y="505" fill="#A50E0E" fontSize="8.8" fontWeight="500" fontFamily="JetBrains Mono, monospace">
                SHARED TONE_BUS (Row 50) · 2500 / 1800 / 2000 Hz
              </text>

              {/* 3x Passive Piezo Buzzer Symbols */}
              {[
                { bay: 1, x: 966, pin: 'P0', gateX: 1216, routeY: 576 },
                { bay: 2, x: 1094, pin: 'P1', gateX: 1244, routeY: 588 },
                { bay: 3, x: 1222, pin: 'P2', gateX: 1272, routeY: 600 },
              ].map((bz) => (
                <g key={bz.bay}>
                  {/* Tap from TONE_BUS down into Buzzer (+) */}
                  <circle cx={bz.x} cy="512" r="3.4" fill="#D93025" />
                  <line x1={bz.x} y1="512" x2={bz.x} y2="526" stroke="#D93025" strokeWidth="1.8" />
                  <text x={bz.x + 7} y="523" fill="#A50E0E" fontSize="8.5" fontWeight="500" fontFamily="JetBrains Mono, monospace">(+)</text>

                  {/* Buzzer Symbol Body */}
                  <rect x={bz.x - 44} y="526" width="88" height="36" fill="#FFFFFF" stroke="#C5221F" strokeWidth="1.4" />
                  <text x={bz.x} y="542" textAnchor="middle" fill="#A50E0E" fontSize="9.5" fontWeight="500" fontFamily="Inter, sans-serif">
                    BZ{bz.bay} Passive
                  </text>
                  <text x={bz.x} y="555" textAnchor="middle" fill="#5F6368" fontSize="8" fontFamily="JetBrains Mono, monospace">
                    Bay {bz.bay} · 15 mA
                  </text>

                  {/* (−) Leg routed orthogonally into PCF8574 (0x24) P0/P1/P2 */}
                  <text x={bz.x + 7} y="572" fill="#174EA6" fontSize="8.2" fontWeight="500" fontFamily="JetBrains Mono, monospace">(−)→{bz.pin}</text>
                  <polyline
                    points={`${bz.x},562 ${bz.x},${bz.routeY} ${bz.gateX},${bz.routeY} ${bz.gateX},712`}
                    fill="none"
                    stroke={bz.bay === 1 ? '#1A73E8' : bz.bay === 2 ? '#137333' : '#B06000'}
                    strokeWidth={isFocus('buzzer') ? '2.4' : '1.7'}
                  />
                  <circle cx={bz.gateX} cy="712" r="3" fill={bz.bay === 1 ? '#1A73E8' : bz.bay === 2 ? '#137333' : '#B06000'} />
                </g>
              ))}
            </g>

            {/* ============================================================== */}
            {/* NET 6: 4-DEVICE SHARED I2C BUS (A4 SDA / A5 SCL)               */}
            {/* ============================================================== */}
            <g
              opacity={netOpacity('i2c')}
              onClick={() => onSelectNet(activeNet === 'i2c' ? 'all' : 'i2c')}
              className="cursor-pointer transition-opacity duration-150"
            >
              {/* Main SDA & SCL Trunk Lines */}
              <line x1="630" y1="652" x2="1220" y2="652" stroke="#1A73E8" strokeWidth={isFocus('i2c') ? '3' : '2.2'} />
              <line x1="630" y1="686" x2="1248" y2="686" stroke="#7B1FA2" strokeWidth={isFocus('i2c') ? '3' : '2.2'} />
              <text x="642" y="646" fill="#174EA6" fontSize="9.2" fontWeight="500" fontFamily="JetBrains Mono, monospace">
                SDA TRUNK (A4 · Row 55) — 4× 4.7 kΩ Parallel = 1.18 kΩ (4.26 mA sink)
              </text>
              <text x="642" y="680" fill="#7B1FA2" fontSize="9.2" fontWeight="500" fontFamily="JetBrains Mono, monospace">
                SCL TRUNK (A5 · Row 56) — 100 kHz Hardware I2C Clock
              </text>

              {i2cModules.map((mod) => {
                const sdaX = mod.x + 34;
                const sclX = mod.x + 62;
                const vccX = mod.x + 94;
                const gndX = mod.x + 120;
                return (
                  <g key={mod.addr}>
                    {/* SDA & SCL Drops from Trunk */}
                    <circle cx={sdaX} cy="652" r="3.4" fill="#1A73E8" />
                    <line x1={sdaX} y1="652" x2={sdaX} y2="712" stroke="#1A73E8" strokeWidth="1.7" />
                    <circle cx={sclX} cy="686" r="3.4" fill="#7B1FA2" />
                    <line x1={sclX} y1="686" x2={sclX} y2="712" stroke="#7B1FA2" strokeWidth="1.7" />

                    {/* Module Box */}
                    <rect
                      x={mod.x}
                      y="712"
                      width="146"
                      height="84"
                      fill={mod.isExpander ? '#FFF5F4' : '#FFFFFF'}
                      stroke={mod.isExpander ? '#C5221F' : '#1A73E8'}
                      strokeWidth={isFocus('i2c') ? '2' : '1.4'}
                    />
                    <rect
                      x={mod.x}
                      y="712"
                      width="146"
                      height="22"
                      fill={mod.isExpander ? '#FCE8E6' : '#E8F0FE'}
                      stroke={mod.isExpander ? '#C5221F' : '#1A73E8'}
                      strokeWidth="1"
                    />
                    <text
                      x={mod.x + 73}
                      y="727"
                      textAnchor="middle"
                      fill={mod.isExpander ? '#A50E0E' : '#174EA6'}
                      fontSize="9.8"
                      fontWeight="500"
                      fontFamily="Inter, sans-serif"
                    >
                      {mod.name} · {mod.addr}
                    </text>

                    {/* Explicit Pin Labels Inside Module */}
                    <text x={sdaX} y="746" textAnchor="middle" fill="#174EA6" fontSize="7.8" fontFamily="JetBrains Mono, monospace">SDA</text>
                    <text x={sclX} y="746" textAnchor="middle" fill="#7B1FA2" fontSize="7.8" fontFamily="JetBrains Mono, monospace">SCL</text>
                    {mod.isExpander ? (
                      <>
                        <text x={mod.x + 30} y="762" fill="#1A73E8" fontSize="8" fontWeight="500" fontFamily="JetBrains Mono, monospace">P0</text>
                        <text x={mod.x + 58} y="762" fill="#137333" fontSize="8" fontWeight="500" fontFamily="JetBrains Mono, monospace">P1</text>
                        <text x={mod.x + 86} y="762" fill="#B06000" fontSize="8" fontWeight="500" fontFamily="JetBrains Mono, monospace">P2</text>
                        <text x={mod.x + 114} y="762" fill="#80868B" fontSize="7.5" fontFamily="JetBrains Mono, monospace">P3-7</text>
                      </>
                    ) : (
                      <text x={mod.x + 73} y="762" textAnchor="middle" fill="#3C4043" fontSize="8.4" fontFamily="JetBrains Mono, monospace">
                        16×2 LCD · 25mA
                      </text>
                    )}

                    <text x={mod.x + 73} y="778" textAnchor="middle" fill="#5F6368" fontSize="8.2" fontFamily="JetBrains Mono, monospace">
                      {mod.pads}
                    </text>

                    {/* Bottom Power Pins: VCC & GND -> Bottom Power Bus */}
                    <text x={vccX} y="792" textAnchor="middle" fill="#A50E0E" fontSize="7.5" fontFamily="JetBrains Mono, monospace">VCC</text>
                    <text x={gndX} y="792" textAnchor="middle" fill="#202124" fontSize="7.5" fontFamily="JetBrains Mono, monospace">GND</text>
                    <line x1={vccX} y1="796" x2={vccX} y2="820" stroke="#C5221F" strokeWidth="1.6" />
                    <circle cx={vccX} cy="820" r="3" fill="#C5221F" />
                    <line x1={gndX} y1="796" x2={gndX} y2="842" stroke="#202124" strokeWidth="1.6" />
                    <circle cx={gndX} cy="842" r="3" fill="#202124" />
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      {/* Bottom Active Net Specification Strip */}
      <div
        data-testid="wiring-net-callout"
        className="bg-white border border-[#DADCE0] px-4 py-2.5 grid grid-cols-1 lg:grid-cols-12 gap-2 text-xs shrink-0"
      >
        <div className="lg:col-span-4 min-w-0">
          <div className="text-[10.5px] font-mono uppercase text-[#1A73E8]">Selected Net Path</div>
          <div className="font-medium text-[#202124] truncate">{detail.title}</div>
          <div className="text-[11px] font-mono text-[#5F6368] mt-0.5 truncate">{detail.components}</div>
        </div>
        <div className="lg:col-span-5 min-w-0 lg:border-l lg:border-[#E8EAED] lg:pl-3">
          <div className="text-[10.5px] font-mono uppercase text-[#5F6368]">Pin-to-Pin Interconnections</div>
          <div className="text-[11.5px] font-mono text-[#202124] leading-snug mt-0.5">{detail.route}</div>
        </div>
        <div className="lg:col-span-3 min-w-0 lg:border-l lg:border-[#E8EAED] lg:pl-3 flex items-start gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#137333] shrink-0 mt-0.5" />
          <div className="text-[11px] font-light text-[#3C4043] leading-snug">{detail.checkNote}</div>
        </div>
      </div>
    </div>
  );
};
