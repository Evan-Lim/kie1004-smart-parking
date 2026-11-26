import React, { useState } from 'react';
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  FileText,
  Mic,
  Presentation,
} from 'lucide-react';
import {
  PRESENTATION_SLIDES,
  type PresentationSlide,
  type SlideCallout,
  type SlideDiagramType,
} from '../data/slidesData';
import { downloadSlidesPdf } from '../lib/slidePdfExporter';

const ACCENT_BORDER: Record<NonNullable<SlideCallout['accent']>, string> = {
  blue: 'border-l-[#1A73E8]',
  green: 'border-l-[#137333]',
  amber: 'border-l-[#B06000]',
  red: 'border-l-[#C5221F]',
};

const ACCENT_DOT: Record<NonNullable<SlideCallout['accent']>, string> = {
  blue: 'bg-[#1A73E8]',
  green: 'bg-[#137333]',
  amber: 'bg-[#F9AB00]',
  red: 'bg-[#D93025]',
};

const SlideLatexDiagram: React.FC<{ type: SlideDiagramType }> = ({ type }) => {
  switch (type) {
    case 'cover-blueprint':
      return (
        <svg viewBox="0 0 420 230" className="w-full h-full" role="img" aria-label="Three-bay stacked hardware diagram">
          <rect x="6" y="6" width="408" height="218" fill="#F8FAFD" stroke="#DADCE0" />
          <text x="18" y="25" fontSize="9.5" fill="#1A73E8" fontFamily="Inter, sans-serif" fontWeight="500">
            FIG. 1 — THREE INDEPENDENT PARKING SLOTS ON ONE ARDUINO UNO
          </text>
          {[
            { bay: 'BAY 1', addr: '0x27', x: 20, status: 'OPEN', led: '#188038' },
            { bay: 'BAY 2', addr: '0x26', x: 152, status: '00:45 · RM 3', led: '#F9AB00' },
            { bay: 'BAY 3', addr: '0x25', x: 284, status: 'OVERSTAY!', led: '#D93025' },
          ].map((slot) => (
            <g key={slot.bay}>
              <rect x={slot.x} y="38" width="116" height="142" fill="#FFFFFF" stroke="#DADCE0" />
              <text x={slot.x + 8} y="53" fontSize="9" fill="#202124" fontFamily="Inter, sans-serif" fontWeight="500">
                {slot.bay}
              </text>
              <text x={slot.x + 108} y="53" textAnchor="end" fontSize="8" fill="#1A73E8" fontFamily="JetBrains Mono, monospace">
                {slot.addr}
              </text>
              {/* Top: 16x2 LCD */}
              <rect x={slot.x + 8} y="60" width="100" height="32" fill="#163327" stroke="#2D333B" />
              <text x={slot.x + 14} y="74" fontSize="8" fill="#B9F6CA" fontFamily="JetBrains Mono, monospace">
                {slot.bay} TIMER
              </text>
              <text x={slot.x + 14} y="86" fontSize="8" fill="#B9F6CA" fontFamily="JetBrains Mono, monospace">
                {slot.status}
              </text>
              {/* Middle: 3 LEDs */}
              <rect x={slot.x + 8} y="100" width="100" height="24" fill="#F8F9FA" stroke="#DADCE0" />
              <circle cx={slot.x + 30} cy="112" r="5" fill={slot.led === '#188038' ? '#188038' : '#E0E3E7'} />
              <circle cx={slot.x + 58} cy="112" r="5" fill={slot.led === '#F9AB00' ? '#F9AB00' : '#E0E3E7'} />
              <circle cx={slot.x + 86} cy="112" r="5" fill={slot.led === '#D93025' ? '#D93025' : '#E0E3E7'} />
              {/* Bottom: HC-SR04 */}
              <rect x={slot.x + 16} y="134" width="84" height="36" fill="#E8F0FE" stroke="#1A73E8" />
              <circle cx={slot.x + 38} cy="152" r="9" fill="#FFFFFF" stroke="#1A73E8" />
              <circle cx={slot.x + 78} cy="152" r="9" fill="#FFFFFF" stroke="#1A73E8" />
              <text x={slot.x + 58} y="177" textAnchor="middle" fontSize="7.3" fill="#5F6368" fontFamily="Inter, sans-serif">
                HC-SR04 + Bay Buzzer
              </text>
            </g>
          ))}
          {/* Bottom Shared Uno Bar */}
          <rect x="20" y="190" width="380" height="24" fill="#1A73E8" />
          <text x="210" y="205" textAnchor="middle" fontSize="9.2" fill="#FFFFFF" fontFamily="Inter, sans-serif" fontWeight="500">
            UNO R3 (20/20) + 2N2222 + PCF8574 (0x24) · 3× PASSIVE BUZZERS
          </text>
        </svg>
      );

    case 'driver-experience':
      return (
        <svg viewBox="0 0 640 120" className="w-full h-full" role="img" aria-label="Driver distance zones and tariff timeline">
          <rect x="4" y="4" width="632" height="112" fill="#F8FAFD" stroke="#DADCE0" />
          <text x="16" y="22" fontSize="9.5" fill="#1A73E8" fontFamily="Inter, sans-serif" fontWeight="500">
            FIG. 2 — DISTANCE GUIDANCE ZONES (1:20 SCALE) &amp; AUTOMATED BILLING TIMELINE
          </text>
          {/* Distance bars */}
          <rect x="16" y="34" width="118" height="32" fill="#FCE8E6" stroke="#C5221F" />
          <text x="75" y="48" textAnchor="middle" fontSize="8.8" fill="#A50E0E" fontFamily="Inter, sans-serif" fontWeight="500">DANGER (2–5 cm)</text>
          <text x="75" y="60" textAnchor="middle" fontSize="7.6" fill="#C5221F" fontFamily="Inter, sans-serif">Red Flash + 2500Hz Beep</text>

          <rect x="140" y="34" width="108" height="32" fill="#FEF7E0" stroke="#B06000" />
          <text x="194" y="48" textAnchor="middle" fontSize="8.8" fill="#7A4100" fontFamily="Inter, sans-serif" fontWeight="500">CAUTION (6–10 cm)</text>
          <text x="194" y="60" textAnchor="middle" fontSize="7.6" fill="#5F6368" fontFamily="Inter, sans-serif">Yellow Solid (Silent)</text>

          <rect x="254" y="34" width="114" height="32" fill="#E6F4EA" stroke="#137333" />
          <text x="311" y="48" textAnchor="middle" fontSize="8.8" fill="#137333" fontFamily="Inter, sans-serif" fontWeight="500">SAFE (11–20 cm)</text>
          <text x="311" y="60" textAnchor="middle" fontSize="7.6" fill="#5F6368" fontFamily="Inter, sans-serif">Green Solid (Silent)</text>

          {/* Arrow into Billing Timeline */}
          <line x1="376" y1="50" x2="398" y2="50" stroke="#1A73E8" strokeWidth="1.5" />
          <polygon points="398,46 406,50 398,54" fill="#1A73E8" />

          <rect x="410" y="34" width="214" height="32" fill="#E8F0FE" stroke="#1A73E8" />
          <text x="517" y="48" textAnchor="middle" fontSize="8.8" fill="#174EA6" fontFamily="Inter, sans-serif" fontWeight="500">STILL 5.0 s → COUNT UP 00:00</text>
          <text x="517" y="60" textAnchor="middle" fontSize="7.8" fill="#3C4043" fontFamily="Inter, sans-serif">15m Free → RM 3/hr → &gt;180m 1800Hz</text>

          {/* Bottom note */}
          <line x1="16" y1="84" x2="624" y2="84" stroke="#DADCE0" />
          <text x="16" y="101" fontSize="8.3" fill="#5F6368" fontFamily="Inter, sans-serif">
            Each bay’s dedicated passive buzzer sounds 2500 Hz rapid in Danger (&lt;5 cm), 1800 Hz slow on Overstay (&gt;180 m), or 2000 Hz if mixed.
          </text>
        </svg>
      );

    case 'pinout-i2c':
      return (
        <svg viewBox="0 0 460 255" className="w-full h-full" role="img" aria-label="20-pin Arduino Uno R3 schematic and shared I2C bus">
          <rect x="4" y="4" width="452" height="247" fill="#FFFFFF" stroke="#DADCE0" />
          <text x="14" y="21" fontSize="9" fill="#1A73E8" fontFamily="Inter, sans-serif" fontWeight="500">
            FIG. 3 — COMPLETE 20-PIN ARDUINO UNO R3 SCHEMATIC &amp; SHARED I2C BUS
          </text>

          {/* Left: 3 Ultrasonic Sensors */}
          {[
            { label: 'Bay 1 HC-SR04', pins: 'D2 / D3', y: 40 },
            { label: 'Bay 2 HC-SR04', pins: 'D4 / D5', y: 92 },
            { label: 'Bay 3 HC-SR04', pins: 'D6 / D7', y: 144 },
          ].map((s) => (
            <g key={s.label}>
              <rect x="14" y={s.y} width="112" height="38" fill="#E6F4EA" stroke="#137333" />
              <text x="20" y={s.y + 15} fontSize="8.5" fill="#137333" fontFamily="Inter, sans-serif" fontWeight="500">{s.label}</text>
              <text x="20" y={s.y + 28} fontSize="8" fill="#3C4043" fontFamily="JetBrains Mono, monospace">TRIG/ECHO: {s.pins}</text>
              <line x1="126" y1={s.y + 19} x2="158" y2={s.y + 19} stroke="#137333" strokeWidth="1.2" />
            </g>
          ))}
          <rect x="14" y="196" width="112" height="40" fill="#F8F9FA" stroke="#DADCE0" />
          <text x="20" y="212" fontSize="8" fill="#202124" fontFamily="Inter, sans-serif" fontWeight="500">5V Rail Decoupling</text>
          <text x="20" y="226" fontSize="7.5" fill="#5F6368" fontFamily="JetBrains Mono, monospace">2×100µF + 2×0.1µF</text>

          {/* Center: Arduino Uno R3 */}
          <rect x="158" y="34" width="136" height="202" fill="#E8F0FE" stroke="#1A73E8" strokeWidth="1.4" />
          <text x="226" y="54" textAnchor="middle" fontSize="10.5" fill="#174EA6" fontFamily="Inter, sans-serif" fontWeight="500">ARDUINO UNO R3</text>
          <text x="226" y="68" textAnchor="middle" fontSize="8" fill="#5F6368" fontFamily="JetBrains Mono, monospace">ATmega328P · 20/20</text>
          <line x1="168" y1="76" x2="284" y2="76" stroke="#AECBFA" />
          <text x="168" y="92" fontSize="8" fill="#202124" fontFamily="JetBrains Mono, monospace">D0,D1 : USB Serial</text>
          <text x="168" y="108" fontSize="8" fill="#137333" fontFamily="JetBrains Mono, monospace">D2–D7 : 3× HC-SR04</text>
          <text x="168" y="124" fontSize="8" fill="#B06000" fontFamily="JetBrains Mono, monospace">D8–D13: Bay 1&amp;2 LED</text>
          <text x="168" y="140" fontSize="8" fill="#B06000" fontFamily="JetBrains Mono, monospace">A0–A2 : Bay 3 LED</text>
          <text x="168" y="156" fontSize="8" fill="#C5221F" fontFamily="JetBrains Mono, monospace">A3    : 2N2222 Tone</text>
          <text x="168" y="172" fontSize="8" fill="#1A73E8" fontFamily="JetBrains Mono, monospace">A4    : I2C SDA (4×)</text>
          <text x="168" y="188" fontSize="8" fill="#1A73E8" fontFamily="JetBrains Mono, monospace">A5    : I2C SCL (4×)</text>
          <rect x="170" y="202" width="112" height="24" fill="#FFFFFF" stroke="#AECBFA" />
          <text x="226" y="217" textAnchor="middle" fontSize="7.8" fill="#174EA6" fontFamily="Inter, sans-serif">20/20 + PCF8574 (0x24)</text>

          {/* Right Top: 9 LEDs + 330 Ohm */}
          <rect x="320" y="34" width="126" height="52" fill="#FEF7E0" stroke="#B06000" />
          <text x="327" y="49" fontSize="8.2" fill="#7A4100" fontFamily="Inter, sans-serif" fontWeight="500">9 LEDs via 9× 330 Ω</text>
          <text x="327" y="62" fontSize="7.5" fill="#3C4043" fontFamily="JetBrains Mono, monospace">B1:D8–10 · B2:D11–13</text>
          <text x="327" y="75" fontSize="7.5" fill="#3C4043" fontFamily="JetBrains Mono, monospace">B3:A0–A2 (~9 mA ea)</text>
          <line x1="294" y1="60" x2="320" y2="60" stroke="#B06000" strokeWidth="1.2" />

          {/* Right Mid: 2N2222 + 3 Passive Buzzers */}
          <rect x="320" y="92" width="126" height="44" fill="#FCE8E6" stroke="#C5221F" />
          <text x="327" y="106" fontSize="8.2" fill="#A50E0E" fontFamily="Inter, sans-serif" fontWeight="500">2N2222 → 3× Passive BZ</text>
          <text x="327" y="118" fontSize="7.3" fill="#3C4043" fontFamily="JetBrains Mono, monospace">A3→1k→B · (+)→TONE_BUS</text>
          <text x="327" y="130" fontSize="7.3" fill="#A50E0E" fontFamily="JetBrains Mono, monospace">(−)→0x24 P0 / P1 / P2</text>
          <line x1="294" y1="114" x2="320" y2="114" stroke="#C5221F" strokeWidth="1.2" />

          {/* Right Bottom: 4x I2C Bus */}
          <rect x="320" y="142" width="126" height="96" fill="#E8F0FE" stroke="#1A73E8" />
          <text x="327" y="156" fontSize="8.2" fill="#174EA6" fontFamily="Inter, sans-serif" fontWeight="500">4× I2C Bus (A4/A5)</text>
          <rect x="327" y="162" width="112" height="15" fill="#163327" />
          <text x="332" y="172" fontSize="7.3" fill="#B9F6CA" fontFamily="JetBrains Mono, monospace">B1 LCD 0x27 (Open)</text>
          <rect x="327" y="180" width="112" height="15" fill="#163327" />
          <text x="332" y="190" fontSize="7.3" fill="#B9F6CA" fontFamily="JetBrains Mono, monospace">B2 LCD 0x26 (A0)</text>
          <rect x="327" y="198" width="112" height="15" fill="#163327" />
          <text x="332" y="208" fontSize="7.3" fill="#B9F6CA" fontFamily="JetBrains Mono, monospace">B3 LCD 0x25 (A1)</text>
          <rect x="327" y="216" width="112" height="16" fill="#C5221F" />
          <text x="332" y="227" fontSize="7.3" fill="#FFFFFF" fontFamily="JetBrains Mono, monospace">PCF8574 0x24 (A0+A1)</text>
          <line x1="294" y1="184" x2="320" y2="184" stroke="#1A73E8" strokeWidth="1.6" />
        </svg>
      );

    case 'fsm-tdm':
      return (
        <svg viewBox="0 0 460 255" className="w-full h-full" role="img" aria-label="4-state stationary FSM and 40ms Round-Robin timing diagram">
          <rect x="4" y="4" width="452" height="247" fill="#FFFFFF" stroke="#DADCE0" />
          <text x="14" y="21" fontSize="9" fill="#1A73E8" fontFamily="Inter, sans-serif" fontWeight="500">
            FIG. 4 — 4-STATE STATIONARY LIFECYCLE &amp; COOPERATIVE ROUND-ROBIN TURNS
          </text>

          {/* Top: 4-State Flowchart */}
          {[
            { label: '0. EMPTY', sub: 'd > 20 cm', x: 16, fill: '#E6F4EA', stroke: '#137333' },
            { label: '1. HOLD 5s', sub: 'Still ±1 cm', x: 126, fill: '#FEF7E0', stroke: '#B06000' },
            { label: '2. COUNT UP', sub: 'Starts 00:00', x: 236, fill: '#E8F0FE', stroke: '#1A73E8' },
            { label: '3. EXIT 3s', sub: 'Glitch Guard', x: 346, fill: '#FCE8E6', stroke: '#C5221F' },
          ].map((st, idx) => (
            <g key={st.label}>
              <rect x={st.x} y="36" width="96" height="44" fill={st.fill} stroke={st.stroke} />
              <text x={st.x + 48} y="54" textAnchor="middle" fontSize="8.5" fill="#202124" fontFamily="Inter, sans-serif" fontWeight="500">{st.label}</text>
              <text x={st.x + 48} y="69" textAnchor="middle" fontSize="7.5" fill="#5F6368" fontFamily="JetBrains Mono, monospace">{st.sub}</text>
              {idx < 3 && (
                <g>
                  <line x1={st.x + 96} y1="58" x2={st.x + 110} y2="58" stroke="#5F6368" strokeWidth="1.2" />
                  <polygon points={`${st.x + 105},55 ${st.x + 110},58 ${st.x + 105},61`} fill="#5F6368" />
                </g>
              )}
            </g>
          ))}
          {/* Motion reset loop */}
          <path d="M 192 80 L 192 98 L 154 98 L 154 80" fill="none" stroke="#C5221F" strokeDasharray="3 2" />
          <text x="173" y="110" textAnchor="middle" fontSize="7.5" fill="#C5221F" fontFamily="Inter, sans-serif">Moved &gt;1 cm → Reset 5s</text>

          {/* Exit back to Empty */}
          <path d="M 394 80 L 394 116 L 64 116 L 64 80" fill="none" stroke="#5F6368" strokeDasharray="3 2" />
          <text x="290" y="112" textAnchor="middle" fontSize="7.5" fill="#5F6368" fontFamily="Inter, sans-serif">3.0 s empty → Print Receipt &amp; Reset</text>

          {/* Bottom: Cooperative Round-Robin Timing */}
          <line x1="16" y1="132" x2="444" y2="132" stroke="#DADCE0" />
          <text x="16" y="148" fontSize="8.5" fill="#202124" fontFamily="Inter, sans-serif" fontWeight="500">
            Non-Blocking millis() Turn-Taking Schedule (Zero delay() Freezes)
          </text>

          <text x="16" y="170" fontSize="8" fill="#5F6368" fontFamily="JetBrains Mono, monospace">Sonar (40ms)</text>
          {[
            { t: 'B1', x: 96, c: '#1A73E8' },
            { t: 'B2', x: 146, c: '#137333' },
            { t: 'B3', x: 196, c: '#B06000' },
            { t: 'B1', x: 246, c: '#1A73E8' },
            { t: 'B2', x: 296, c: '#137333' },
            { t: 'B3', x: 346, c: '#B06000' },
            { t: 'B1', x: 396, c: '#1A73E8' },
          ].map((slot, i) => (
            <g key={i}>
              <rect x={slot.x} y="158" width="44" height="18" fill={slot.c} />
              <text x={slot.x + 22} y="170" textAnchor="middle" fontSize="8" fill="#FFFFFF" fontFamily="JetBrains Mono, monospace">{slot.t}</text>
            </g>
          ))}

          <text x="16" y="200" fontSize="8" fill="#5F6368" fontFamily="JetBrains Mono, monospace">LCDs (200ms)</text>
          <rect x="96" y="188" width="94" height="18" fill="#E8F0FE" stroke="#1A73E8" />
          <text x="143" y="200" textAnchor="middle" fontSize="7.8" fill="#174EA6" fontFamily="JetBrains Mono, monospace">Refresh LCD 1</text>
          <rect x="216" y="188" width="94" height="18" fill="#E6F4EA" stroke="#137333" />
          <text x="263" y="200" textAnchor="middle" fontSize="7.8" fill="#137333" fontFamily="JetBrains Mono, monospace">Refresh LCD 2</text>
          <rect x="336" y="188" width="94" height="18" fill="#FEF7E0" stroke="#B06000" />
          <text x="383" y="200" textAnchor="middle" fontSize="7.8" fill="#7A4100" fontFamily="JetBrains Mono, monospace">Refresh LCD 3</text>

          <text x="16" y="232" fontSize="7.8" fill="#5F6368" fontFamily="Inter, sans-serif">
            Full 3-bay scan every 120 ms · LCDs every 200 ms · 0x24 buzzer byte written only on cadence edges.
          </text>
        </svg>
      );

    case 'tradeoffs-matrix':
      return (
        <svg viewBox="0 0 420 235" className="w-full h-full" role="img" aria-label="Conflicting engineering requirements matrix">
          <rect x="4" y="4" width="412" height="227" fill="#FFFFFF" stroke="#DADCE0" />
          <text x="14" y="22" fontSize="9" fill="#1A73E8" fontFamily="Inter, sans-serif" fontWeight="500">
            FIG. 5 — RESOLVING CONFLICTING REQUIREMENTS (WP2)
          </text>
          {[
            { conflict: '3 LCDs + 3 buzzers exceed 20 Uno pins', fix: '4× I2C (0x27–0x24) on shared A4/A5', y: 34, c: '#1A73E8' },
            { conflict: '3 passive buzzers overload Pin A3 (45 mA)', fix: '2N2222 buffer (A3 ≤1 mA) + 0x24 sink', y: 82, c: '#C5221F' },
            { conflict: '3 LCD refreshes freeze sensors (~120 ms)', fix: 'Stagger 1 LCD / 200 ms + skip unchanged', y: 130, c: '#137333' },
            { conflict: '5 s stillness check vs. ±1 cm sonar noise', fix: 'Median + EMA filter + ±1 cm cushion', y: 178, c: '#B06000' },
          ].map((row) => (
            <g key={row.conflict}>
              <rect x="14" y={row.y} width="186" height="38" fill="#F8F9FA" stroke="#DADCE0" />
              <text x="20" y={row.y + 16} fontSize="7.8" fill="#5F6368" fontFamily="Inter, sans-serif">CONFLICT</text>
              <text x="20" y={row.y + 30} fontSize="8" fill="#202124" fontFamily="Inter, sans-serif" fontWeight="500">{row.conflict}</text>

              <line x1="200" y1={row.y + 19} x2="218" y2={row.y + 19} stroke={row.c} strokeWidth="1.5" />
              <polygon points={`214,${row.y + 16} 220,${row.y + 19} 214,${row.y + 22}`} fill={row.c} />

              <rect x="222" y={row.y} width="184" height="38" fill="#FFFFFF" stroke={row.c} />
              <text x="228" y={row.y + 16} fontSize="7.8" fill={row.c} fontFamily="Inter, sans-serif" fontWeight="500">RESOLUTION</text>
              <text x="228" y={row.y + 30} fontSize="8" fill="#202124" fontFamily="Inter, sans-serif">{row.fix}</text>
            </g>
          ))}
        </svg>
      );

    case 'code-arrays-funcs':
      return (
        <svg viewBox="0 0 380 120" className="w-full h-full" role="img" aria-label="2D LED pin array mapping diagram">
          <rect x="2" y="2" width="376" height="116" fill="#F8FAFD" stroke="#DADCE0" />
          <text x="12" y="19" fontSize="8.5" fill="#1A73E8" fontFamily="Inter, sans-serif" fontWeight="500">
            HOW ONE 2D ARRAY MAPS ALL 9 LED PINS
          </text>
          {/* Headers */}
          <text x="90" y="36" textAnchor="middle" fontSize="8" fill="#137333" fontFamily="JetBrains Mono, monospace">Col 0 (Green)</text>
          <text x="195" y="36" textAnchor="middle" fontSize="8" fill="#B06000" fontFamily="JetBrains Mono, monospace">Col 1 (Yellow)</text>
          <text x="300" y="36" textAnchor="middle" fontSize="8" fill="#C5221F" fontFamily="JetBrains Mono, monospace">Col 2 (Red)</text>
          {[
            { row: 'Bay 0', vals: ['D8', 'D9', 'D10'], y: 42 },
            { row: 'Bay 1', vals: ['D11', 'D12', 'D13'], y: 65 },
            { row: 'Bay 2', vals: ['A0', 'A1', 'A2'], y: 88 },
          ].map((r) => (
            <g key={r.row}>
              <text x="12" y={r.y + 13} fontSize="8" fill="#5F6368" fontFamily="JetBrains Mono, monospace">{r.row}</text>
              {r.vals.map((v, ci) => (
                <g key={v}>
                  <rect x={48 + ci * 105} y={r.y} width="88" height="19" fill="#FFFFFF" stroke="#DADCE0" />
                  <text x={92 + ci * 105} y={r.y + 13} textAnchor="middle" fontSize="8.5" fill="#202124" fontFamily="JetBrains Mono, monospace">{v}</text>
                </g>
              ))}
            </g>
          ))}
        </svg>
      );

    case 'code-sort-pointers':
      return (
        <svg viewBox="0 0 380 120" className="w-full h-full" role="img" aria-label="Insertion Sort median spike rejection diagram">
          <rect x="2" y="2" width="376" height="116" fill="#F8FAFD" stroke="#DADCE0" />
          <text x="12" y="19" fontSize="8.5" fill="#1A73E8" fontFamily="Inter, sans-serif" fontWeight="500">
            INSERTION SORT MEDIAN FILTER REJECTS SONAR GLITCHES
          </text>
          <rect x="12" y="32" width="110" height="34" fill="#FCE8E6" stroke="#C5221F" />
          <text x="67" y="46" textAnchor="middle" fontSize="7.5" fill="#A50E0E" fontFamily="Inter, sans-serif">Raw Samples</text>
          <text x="67" y="59" textAnchor="middle" fontSize="9" fill="#202124" fontFamily="JetBrains Mono, monospace">[14, 98, 13]</text>

          <line x1="122" y1="49" x2="146" y2="49" stroke="#1A73E8" strokeWidth="1.5" />
          <polygon points="142,46 148,49 142,52" fill="#1A73E8" />

          <rect x="150" y="32" width="106" height="34" fill="#E8F0FE" stroke="#1A73E8" />
          <text x="203" y="46" textAnchor="middle" fontSize="7.5" fill="#174EA6" fontFamily="Inter, sans-serif">After Sort</text>
          <text x="203" y="59" textAnchor="middle" fontSize="9" fill="#202124" fontFamily="JetBrains Mono, monospace">[13, 14, 98]</text>

          <line x1="256" y1="49" x2="278" y2="49" stroke="#137333" strokeWidth="1.5" />
          <polygon points="274,46 280,49 274,52" fill="#137333" />

          <rect x="282" y="32" width="84" height="34" fill="#E6F4EA" stroke="#137333" />
          <text x="324" y="46" textAnchor="middle" fontSize="7.5" fill="#137333" fontFamily="Inter, sans-serif">True Median</text>
          <text x="324" y="59" textAnchor="middle" fontSize="9.5" fill="#137333" fontFamily="JetBrains Mono, monospace" fontWeight="500">14 cm ✓</text>

          <rect x="12" y="78" width="354" height="28" fill="#FFFFFF" stroke="#DADCE0" />
          <text x="189" y="95" textAnchor="middle" fontSize="8" fill="#3C4043" fontFamily="JetBrains Mono, monospace">
            Pointers: computeLotSummary(bayState, 3, &amp;occ, &amp;over) → updates 2 vars
          </text>
        </svg>
      );

    case 'electrical-cost':
      return (
        <svg viewBox="0 0 420 220" className="w-full h-full" role="img" aria-label="Power headroom and RM 76.70 cost breakdown charts">
          <rect x="4" y="4" width="412" height="212" fill="#FFFFFF" stroke="#DADCE0" />
          <text x="14" y="21" fontSize="9" fill="#1A73E8" fontFamily="Inter, sans-serif" fontWeight="500">
            FIG. 6 — ELECTRICAL SAFETY HEADROOM &amp; RM 76.70 KIT BREAKDOWN
          </text>

          {/* Current Bars */}
          <text x="16" y="39" fontSize="7.8" fill="#202124" fontFamily="Inter, sans-serif" fontWeight="500">ATmega328P MCU Pin Load (Limit 200 mA)</text>
          <rect x="16" y="44" width="386" height="15" fill="#F4F6F9" stroke="#DADCE0" />
          <rect x="16" y="44" width="194" height="15" fill="#1A73E8" />
          <text x="24" y="54.5" fontSize="7.6" fill="#FFFFFF" fontFamily="JetBrains Mono, monospace">100.3 mA Peak (50.1% · 2N2222 offloads buzzers)</text>

          <text x="16" y="72" fontSize="7.8" fill="#202124" fontFamily="Inter, sans-serif" fontWeight="500">PCF8574 (0x24) 3-Buzzer Sink (Limit 80 mA)</text>
          <rect x="16" y="77" width="386" height="15" fill="#F4F6F9" stroke="#DADCE0" />
          <rect x="16" y="77" width="217" height="15" fill="#B06000" />
          <text x="24" y="87.5" fontSize="7.6" fill="#FFFFFF" fontFamily="JetBrains Mono, monospace">45.0 mA Peak (56.3% · 3× 15 mA)</text>

          <text x="16" y="105" fontSize="7.8" fill="#202124" fontFamily="Inter, sans-serif" fontWeight="500">Total USB 5V Rail Load (Polyfuse Limit 500 mA)</text>
          <rect x="16" y="110" width="386" height="15" fill="#F4F6F9" stroke="#DADCE0" />
          <rect x="16" y="110" width="220" height="15" fill="#137333" />
          <text x="24" y="120.5" fontSize="7.6" fill="#FFFFFF" fontFamily="JetBrains Mono, monospace">285.6 mA Peak (57.1% of 500 mA)</text>

          {/* Cost Breakdown Boxes */}
          <line x1="16" y1="134" x2="402" y2="134" stroke="#DADCE0" />
          <text x="16" y="148" fontSize="7.8" fill="#202124" fontFamily="Inter, sans-serif" fontWeight="500">Complete 11-Item Kit Cost — RM 76.70 (RM 15.34 / student)</text>
          {[
            { name: '3× I2C LCDs', cost: 'RM 22.50', w: 94, x: 16, c: '#1A73E8' },
            { name: 'Uno R3', cost: 'RM 18.00', w: 84, x: 114, c: '#137333' },
            { name: '4× Sonar', cost: 'RM 12.00', w: 76, x: 202, c: '#B06000' },
            { name: '3BZ+0x24+NPN', cost: 'RM 8.50', w: 120, x: 282, c: '#C5221F' },
          ].map((b) => (
            <g key={b.name}>
              <rect x={b.x} y="156" width={b.w} height="48" fill="#F8FAFD" stroke={b.c} />
              <rect x={b.x} y="156" width={b.w} height="5" fill={b.c} />
              <text x={b.x + b.w / 2} y="177" textAnchor="middle" fontSize="8" fill="#202124" fontFamily="Inter, sans-serif" fontWeight="500">{b.name}</text>
              <text x={b.x + b.w / 2} y="193" textAnchor="middle" fontSize="8.6" fill={b.c} fontFamily="JetBrains Mono, monospace">{b.cost}</text>
            </g>
          ))}
        </svg>
      );

    case 'limitations-3axis':
      return (
        <svg viewBox="0 0 640 108" className="w-full h-full" role="img" aria-label="Built-in mitigations and future upgrades summary">
          <rect x="4" y="4" width="632" height="100" fill="#F8FAFD" stroke="#DADCE0" />
          <text x="16" y="21" fontSize="9" fill="#1A73E8" fontFamily="Inter, sans-serif" fontWeight="500">
            FIG. 7 — MITIGATIONS BUILT TODAY &amp; SCALING ROADMAP
          </text>
          {[
            { x: 16, title: 'Hardware Mitigation', now: '2N2222 buffer + 1.18 kΩ short bus', next: 'Upgrade: DHT22 + ToF LiDAR', c: '#C5221F' },
            { x: 224, title: 'Software Mitigation', now: '2000 Hz shared mixed carrier', next: 'Upgrade: Dedicated PWM IC', c: '#B06000' },
            { x: 432, title: 'Algorithm Mitigation', now: '3-sample median + ±1 cm band', next: 'Upgrade: ESP32 cloud sync', c: '#1A73E8' },
          ].map((col) => (
            <g key={col.title}>
              <rect x={col.x} y="30" width="192" height="64" fill="#FFFFFF" stroke="#DADCE0" />
              <rect x={col.x} y="30" width="192" height="3" fill={col.c} />
              <text x={col.x + 10} y="48" fontSize="8.5" fill="#202124" fontFamily="Inter, sans-serif" fontWeight="500">{col.title}</text>
              <text x={col.x + 10} y="65" fontSize="7.8" fill="#137333" fontFamily="Inter, sans-serif">Now: {col.now}</text>
              <text x={col.x + 10} y="82" fontSize="7.8" fill="#5F6368" fontFamily="Inter, sans-serif">{col.next}</text>
            </g>
          ))}
        </svg>
      );

    case 'demo-timeline':
    default:
      return (
        <svg viewBox="0 0 640 118" className="w-full h-full" role="img" aria-label="5-minute live bench demonstration sequence">
          <rect x="4" y="4" width="632" height="110" fill="#F8FAFD" stroke="#DADCE0" />
          <text x="16" y="22" fontSize="9" fill="#1A73E8" fontFamily="Inter, sans-serif" fontWeight="500">
            FIG. 8 — 5-MINUTE LIVE BENCH DEMONSTRATION FLOW
          </text>
          <line x1="48" y1="62" x2="592" y2="62" stroke="#AECBFA" strokeWidth="2" />
          {[
            { x: 76, t: '0:00–1:00', l: 'LEDs + Danger BZ', s: '2500Hz Bay 1 Only' },
            { x: 208, t: '1:00–2:00', l: '5 s Stop Reset', s: 'Nudge vs Still' },
            { x: 340, t: '2:00–3:00', l: '3-Bay Billing', s: '15m Free → RM 3' },
            { x: 472, t: '3:00–4:00', l: 'Mixed 0x24 Buzzers', s: 'B1 Dang + B3 Over' },
            { x: 582, t: '4:00–5:00', l: 'Receipt & Q&A', s: 'Serial Exit Log' },
          ].map((step, i) => (
            <g key={step.t}>
              <circle cx={step.x} cy="62" r="11" fill="#1A73E8" />
              <text x={step.x} y="65.5" textAnchor="middle" fontSize="8.5" fill="#FFFFFF" fontFamily="JetBrains Mono, monospace">{i + 1}</text>
              <text x={step.x} y="42" textAnchor="middle" fontSize="7.8" fill="#1A73E8" fontFamily="JetBrains Mono, monospace">{step.t}</text>
              <text x={step.x} y="88" textAnchor="middle" fontSize="8.3" fill="#202124" fontFamily="Inter, sans-serif" fontWeight="500">{step.l}</text>
              <text x={step.x} y="101" textAnchor="middle" fontSize="7.3" fill="#5F6368" fontFamily="Inter, sans-serif">{step.s}</text>
            </g>
          ))}
        </svg>
      );
  }
};

const SlideCanvasBody: React.FC<{ slide: PresentationSlide }> = ({ slide }) => {
  switch (slide.layout) {
    case 'cover-hero':
      return (
        <div className="flex-1 flex flex-col justify-between gap-4 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center flex-1 min-h-0">
            <div className="md:col-span-6 space-y-3">
              <div className="text-[10.5px] font-mono tracking-[0.14em] text-[#1A73E8] uppercase">
                {slide.sectionTag}
              </div>
              <h3 className="text-2xl sm:text-[28px] font-light text-[#202124] leading-[1.15] tracking-tight">
                {slide.title}
              </h3>
              <p className="text-xs sm:text-[13px] font-light text-[#5F6368] leading-relaxed">
                {slide.subtitle}
              </p>
              {slide.stats && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {slide.stats.map((st) => (
                    <div key={st.label} className="bg-[#F8FAFD] border border-[#DADCE0] border-t-2 border-t-[#1A73E8] px-2.5 py-2">
                      <div className="text-[9.5px] font-mono uppercase text-[#5F6368]">{st.label}</div>
                      <div className="text-sm font-medium text-[#202124] tabular-nums mt-0.5">{st.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="md:col-span-6 flex flex-col justify-center">
              <div className="w-full aspect-[420/230]">
                <SlideLatexDiagram type={slide.diagramType} />
              </div>
            </div>
          </div>
          {/* Bottom 5-member clean team strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-2 border-t border-[#E8EAED]">
            {slide.highlights.map((h) => (
              <div key={h.title} className="bg-[#F8F9FA] border border-[#E8EAED] px-2 py-1.5">
                <div className="text-[10px] font-medium text-[#1A73E8] truncate">{h.title}</div>
                <div className="text-[10px] font-light text-[#5F6368] leading-snug mt-0.5">{h.body}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'three-pillar':
      return (
        <div className="flex-1 flex flex-col justify-between gap-4 min-h-0">
          <div>
            <div className="text-[10px] font-mono tracking-[0.14em] text-[#1A73E8] uppercase">
              {slide.sectionTag}
            </div>
            <h3 className="text-xl sm:text-2xl font-light text-[#202124] tracking-tight mt-0.5">
              {slide.title}
            </h3>
            <p className="text-xs font-light text-[#5F6368] mt-1">{slide.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {slide.highlights.map((h) => {
              const accent = h.accent ?? 'blue';
              return (
                <div
                  key={h.title}
                  className={`bg-[#F8FAFD] border border-[#DADCE0] border-l-[3px] ${ACCENT_BORDER[accent]} p-4 flex flex-col justify-between`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 ${ACCENT_DOT[accent]} shrink-0`} />
                    <h4 className="text-[13px] font-medium text-[#202124]">{h.title}</h4>
                  </div>
                  <p className="text-xs font-light text-[#3C4043] leading-relaxed mt-2.5">
                    {h.body}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="w-full h-[112px] sm:h-[126px]">
            <SlideLatexDiagram type={slide.diagramType} />
          </div>
        </div>
      );

    case 'diagram-focus':
      return (
        <div className="flex-1 flex flex-col justify-between gap-3 min-h-0">
          <div>
            <div className="text-[10px] font-mono tracking-[0.14em] text-[#1A73E8] uppercase">
              {slide.sectionTag}
            </div>
            <h3 className="text-xl sm:text-[22px] font-light text-[#202124] tracking-tight mt-0.5">
              {slide.title}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center flex-1 min-h-0">
            <div className="md:col-span-7 flex flex-col">
              <div className="w-full aspect-[460/255]">
                <SlideLatexDiagram type={slide.diagramType} />
              </div>
              <p className="text-[10.5px] font-light text-[#5F6368] mt-1.5">
                {slide.diagramCaption}
              </p>
            </div>
            <div className="md:col-span-5 space-y-2">
              {slide.highlights.map((h) => {
                const accent = h.accent ?? 'blue';
                return (
                  <div
                    key={h.title}
                    className={`bg-[#F8F9FA] border border-[#DADCE0] border-l-[3px] ${ACCENT_BORDER[accent]} px-3 py-2`}
                  >
                    <div className="text-xs font-medium text-[#202124]">{h.title}</div>
                    <p className="text-[11px] font-light text-[#5F6368] leading-snug mt-0.5">
                      {h.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );

    case 'split-code':
      return (
        <div className="flex-1 flex flex-col justify-between gap-3 min-h-0">
          <div>
            <div className="text-[10px] font-mono tracking-[0.14em] text-[#1A73E8] uppercase">
              {slide.sectionTag}
            </div>
            <h3 className="text-xl sm:text-[22px] font-light text-[#202124] tracking-tight mt-0.5">
              {slide.title}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch flex-1 min-h-0">
            {/* Real C++ Code Card */}
            <div className="md:col-span-7 bg-[#161B22] border border-[#30363D] flex flex-col overflow-hidden">
              <div className="px-3 py-1.5 bg-[#0D1117] border-b border-[#30363D] flex items-center justify-between text-[10px] font-mono text-[#8B949E]">
                <span>{slide.codeSnippetTitle ?? 'Arduino C++ Implementation'}</span>
                <span className="text-[#79C0FF]">C++ · Arduino Uno</span>
              </div>
              <pre className="p-3 font-mono text-[10.5px] sm:text-[11px] leading-[1.48] text-[#E6EDF3] overflow-x-auto flex-1">
                {slide.codeSnippet}
              </pre>
            </div>

            {/* Right: Concise Concepts + Compact Visual */}
            <div className="md:col-span-5 flex flex-col justify-between gap-2.5">
              <div className="space-y-2">
                {slide.highlights.map((h) => {
                  const accent = h.accent ?? 'blue';
                  return (
                    <div
                      key={h.title}
                      className={`bg-[#F8FAFD] border border-[#DADCE0] border-l-[3px] ${ACCENT_BORDER[accent]} px-3 py-2`}
                    >
                      <div className="text-xs font-medium text-[#202124]">{h.title}</div>
                      <p className="text-[11px] font-light text-[#5F6368] leading-snug mt-0.5">
                        {h.body}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="w-full aspect-[380/120]">
                <SlideLatexDiagram type={slide.diagramType} />
              </div>
            </div>
          </div>
        </div>
      );

    case 'comparison-grid':
      return (
        <div className="flex-1 flex flex-col justify-between gap-3 min-h-0">
          <div>
            <div className="text-[10px] font-mono tracking-[0.14em] text-[#1A73E8] uppercase">
              {slide.sectionTag}
            </div>
            <h3 className="text-xl sm:text-[22px] font-light text-[#202124] tracking-tight mt-0.5">
              {slide.title}
            </h3>
            <p className="text-xs font-light text-[#5F6368] mt-0.5">{slide.subtitle}</p>
          </div>

          {slide.stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {slide.stats.map((st) => (
                <div key={st.label} className="bg-[#F8FAFD] border border-[#DADCE0] px-2.5 py-1.5">
                  <div className="text-[9.5px] font-mono uppercase text-[#5F6368]">{st.label}</div>
                  <div className="text-sm font-medium text-[#1A73E8] tabular-nums">{st.value}</div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center flex-1 min-h-0">
            <div className="md:col-span-5 space-y-2">
              {slide.highlights.map((h) => {
                const accent = h.accent ?? 'blue';
                return (
                  <div
                    key={h.title}
                    className={`bg-white border border-[#DADCE0] border-l-[3px] ${ACCENT_BORDER[accent]} px-3 py-2`}
                  >
                    <div className="text-xs font-medium text-[#202124]">{h.title}</div>
                    <p className="text-[11px] font-light text-[#5F6368] leading-snug mt-0.5">
                      {h.body}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="md:col-span-7">
              <div className="w-full aspect-[420/230]">
                <SlideLatexDiagram type={slide.diagramType} />
              </div>
            </div>
          </div>
        </div>
      );

    case 'timeline-closing':
    default:
      return (
        <div className="flex-1 flex flex-col justify-between gap-4 min-h-0">
          <div>
            <div className="text-[10px] font-mono tracking-[0.14em] text-[#1A73E8] uppercase">
              {slide.sectionTag}
            </div>
            <h3 className="text-xl sm:text-2xl font-light text-[#202124] tracking-tight mt-0.5">
              {slide.title}
            </h3>
            <p className="text-xs font-light text-[#5F6368] mt-1">{slide.subtitle}</p>
          </div>

          <div className="w-full h-[112px] sm:h-[124px]">
            <SlideLatexDiagram type={slide.diagramType} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {slide.highlights.map((h, i) => (
              <div key={h.title} className="bg-[#F8FAFD] border border-[#DADCE0] border-t-2 border-t-[#1A73E8] p-3">
                <div className="text-[10px] font-mono text-[#1A73E8]">STEP 0{i + 1}</div>
                <div className="text-xs font-medium text-[#202124] mt-0.5">{h.title}</div>
                <p className="text-[11px] font-light text-[#5F6368] leading-snug mt-1">{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      );
  }
};

export const SlideDeckStudio: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'deck' | 'all-scripts'>('deck');
  const [downloading, setDownloading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const slide = PRESENTATION_SLIDES[activeIndex];
  const totalSeconds = PRESENTATION_SLIDES.reduce((acc, s) => acc + s.estSeconds, 0);
  const totalMinLabel = `${Math.floor(totalSeconds / 60)}m ${totalSeconds % 60}s`;

  const goPrev = () => setActiveIndex((i) => Math.max(0, i - 1));
  const goNext = () => setActiveIndex((i) => Math.min(PRESENTATION_SLIDES.length - 1, i + 1));

  const handleDownloadPdf = () => {
    setDownloading(true);
    try {
      downloadSlidesPdf();
    } finally {
      window.setTimeout(() => setDownloading(false), 350);
    }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedId(id);
    window.setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1500);
  };

  const fullScriptDocument = PRESENTATION_SLIDES.map(
    (s) =>
      `SLIDE ${String(s.slideNumber).padStart(2, '0')} — ${s.title}\nPresenter: ${s.presenter} (~${s.estSeconds}s)\nStage Cue: ${s.stageCue}\nScript:\n${s.spokenScript}\n`,
  ).join('\n--------------------------------------------------\n\n');

  return (
    <div className="h-full flex flex-col gap-3 min-h-0">
      {/* Top Studio Bar */}
      <div className="bg-white border border-[#DADCE0] px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <Presentation className="w-4 h-4 text-[#1A73E8] shrink-0" />
          <div className="min-w-0">
            <h2 className="text-sm sm:text-[15px] font-normal text-[#202124] leading-tight truncate">
              10-Slide Presentation Deck &amp; Layperson Speaker Scripts
            </h2>
            <p className="text-[11px] font-light text-[#5F6368] truncate">
              6 diversified layouts · Scripts kept strictly outside slides · Total talk time ~{totalMinLabel}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Deck vs All-Scripts Mode Switcher */}
          <div role="tablist" className="inline-flex border border-[#DADCE0] bg-[#F4F6F9]">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'deck'}
              onClick={() => setViewMode('deck')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs cursor-pointer ${
                viewMode === 'deck'
                  ? 'bg-white text-[#1A73E8] font-medium'
                  : 'text-[#5F6368] hover:text-[#202124]'
              }`}
            >
              <Presentation className="w-3.5 h-3.5" />
              Slide + Script
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'all-scripts'}
              onClick={() => setViewMode('all-scripts')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs cursor-pointer ${
                viewMode === 'all-scripts'
                  ? 'bg-white text-[#1A73E8] font-medium'
                  : 'text-[#5F6368] hover:text-[#202124]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              All 10 Scripts
            </button>
          </div>

          {viewMode === 'deck' && (
            <div className="inline-flex border border-[#DADCE0] bg-[#F4F6F9]">
              <button
                type="button"
                onClick={goPrev}
                disabled={activeIndex === 0}
                aria-label="Previous slide"
                className="px-2 py-1.5 text-[#202124] hover:bg-white disabled:opacity-35 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2.5 py-1.5 font-mono text-xs tabular-nums text-[#202124] bg-white border-x border-[#DADCE0]">
                {String(activeIndex + 1).padStart(2, '0')} / {PRESENTATION_SLIDES.length}
              </span>
              <button
                type="button"
                onClick={goNext}
                disabled={activeIndex === PRESENTATION_SLIDES.length - 1}
                aria-label="Next slide"
                className="px-2 py-1.5 text-[#202124] hover:bg-white disabled:opacity-35 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            data-testid="download-slides-pdf-btn"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1A73E8] text-white hover:bg-[#1557B0] transition-colors whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? 'Exporting PDF...' : 'Download Slides (.pdf)'}
          </button>
        </div>
      </div>

      {/* MODE 1: Slide Deck + Dedicated External Speaker Script Panel */}
      {viewMode === 'deck' && (
        <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-12 gap-3 overflow-hidden">
          {/* Filmstrip Rail: Horizontal on Mobile/Tablet, Vertical Left Rail on Desktop */}
          <aside
            aria-label="Slide filmstrip"
            className="lg:col-span-3 bg-white border border-[#DADCE0] flex lg:flex-col shrink-0 lg:min-h-0 overflow-hidden"
          >
            <div className="hidden lg:flex px-3 py-2 border-b border-[#DADCE0] bg-[#F8F9FA] items-center justify-between shrink-0">
              <span className="text-[11px] font-medium text-[#202124]">Slide Deck (10 Max)</span>
              <span className="font-mono text-[10px] text-[#5F6368]">16:9 Vector</span>
            </div>
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden dash-scroll divide-x lg:divide-x-0 lg:divide-y divide-[#E8EAED] w-full">
              {PRESENTATION_SLIDES.map((item, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-testid={`slide-thumb-${item.slideNumber}`}
                    onClick={() => setActiveIndex(idx)}
                    className={`shrink-0 lg:shrink lg:w-full text-left px-3 py-2 lg:py-2.5 transition-colors cursor-pointer border-b-2 lg:border-b-0 lg:border-l-2 min-w-[160px] lg:min-w-0 ${
                      isSelected
                        ? 'bg-[#E8F0FE] border-[#1A73E8]'
                        : 'bg-white border-transparent hover:bg-[#F8F9FA]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-mono text-[10px] ${isSelected ? 'text-[#1A73E8] font-medium' : 'text-[#5F6368]'}`}>
                        SLIDE {String(item.slideNumber).padStart(2, '0')}
                      </span>
                      <span className="font-mono text-[9.5px] text-[#80868B] uppercase">
                        {item.layout.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="text-[11.5px] font-normal text-[#202124] mt-0.5 line-clamp-1 lg:line-clamp-2 leading-snug">
                      {item.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main Stage + External Speaker Script */}
          <div className="flex-1 lg:col-span-9 min-h-0 overflow-y-auto dash-scroll space-y-3 pr-0.5">
            {/* Clean 16:9 Slide Canvas (NO spoken script inside!) */}
            <article
              data-testid="active-slide-canvas"
              className="bg-white border border-[#DADCE0] shadow-xs w-full min-h-[380px] sm:aspect-[16/9] flex flex-col justify-between overflow-hidden"
            >
              {/* Top Sharp Architectural Accent */}
              <div className="h-1 bg-[#1A73E8] w-full shrink-0" />

              {/* Diversified Slide Body */}
              <div className="flex-1 p-5 sm:p-7 flex flex-col min-h-0 overflow-hidden">
                <SlideCanvasBody slide={slide} />
              </div>

              {/* Clean Minimal Slide Footer */}
              <div className="px-5 sm:px-7 py-2 border-t border-[#E8EAED] bg-[#F8FAFD] flex items-center justify-between text-[10px] font-mono text-[#5F6368] shrink-0">
                <span className="truncate">KIE1004 Smart Multi-Space Parking · Arduino Uno R3</span>
                <span className="shrink-0">
                  {String(slide.slideNumber).padStart(2, '0')} / {PRESENTATION_SLIDES.length}
                </span>
              </div>
            </article>

            {/* DEDICATED EXTERNAL SPEAKER SCRIPT PANEL (Strictly Outside Slide & PDF) */}
            <section
              data-testid="speaker-script-panel"
              aria-label="Complete presenter spoken script"
              className="bg-white border border-[#DADCE0] border-l-[3px] border-l-[#1A73E8] p-4 space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E8EAED]">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-[#1A73E8]" />
                  <span className="text-xs font-medium text-[#202124]">
                    Complete Spoken Script — Slide {String(slide.slideNumber).padStart(2, '0')} (Not Shown on Slide or PDF)
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#5F6368]">
                  <span className="text-[#174EA6] bg-[#E8F0FE] px-2 py-0.5">{slide.presenter}</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />~{slide.estSeconds}s
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText(slide.id, slide.spokenScript)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#DADCE0] bg-[#F8F9FA] text-[#202124] hover:bg-[#E8F0FE] cursor-pointer"
                  >
                    {copiedId === slide.id ? (
                      <>
                        <Check className="w-3 h-3 text-[#137333]" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy Script
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-[11px] font-light text-[#5F6368] bg-[#F8F9FA] border border-[#E8EAED] px-3 py-1.5">
                <span className="font-medium text-[#202124]">Stage Cue: </span>
                {slide.stageCue}
                <span className="mx-2 text-[#DADCE0]">|</span>
                <span className="font-medium text-[#202124]">Rubric Link: </span>
                {slide.rubricCoverage}
              </div>

              <p className="text-[13px] font-light text-[#202124] leading-[1.68]">
                “{slide.spokenScript}”
              </p>
            </section>
          </div>
        </div>
      )}

      {/* MODE 2: All 10 Complete Speaker Scripts Sheet */}
      {viewMode === 'all-scripts' && (
        <div className="flex-1 min-h-0 overflow-y-auto dash-scroll bg-white border border-[#DADCE0] p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#DADCE0]">
            <div>
              <h3 className="text-sm font-medium text-[#202124]">
                Complete 10-Slide Presenter Script Sheet (Layperson-Friendly · ~{totalMinLabel} Total)
              </h3>
              <p className="text-xs font-light text-[#5F6368]">
                Print or copy this script for rehearsal. Zero week numbers — written in clear, everyday language.
              </p>
            </div>
            <button
              type="button"
              onClick={() => copyText('all-scripts', fullScriptDocument)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#DADCE0] bg-[#F8F9FA] text-[#202124] hover:bg-[#E8F0FE] cursor-pointer"
            >
              {copiedId === 'all-scripts' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#137333]" />
                  Copied All 10 Scripts
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 text-[#1A73E8]" />
                  Copy All 10 Scripts
                </>
              )}
            </button>
          </div>

          <div className="space-y-3">
            {PRESENTATION_SLIDES.map((item) => (
              <div key={item.id} className="border border-[#DADCE0] p-3.5 bg-[#F8FAFD] space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-medium text-[#1A73E8]">
                      SLIDE {String(item.slideNumber).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-medium text-[#202124]">{item.title}</span>
                  </div>
                  <span className="font-mono text-[10.5px] text-[#5F6368]">
                    {item.presenter} · ~{item.estSeconds}s
                  </span>
                </div>
                <div className="text-[11px] font-light text-[#5F6368]">
                  <span className="font-medium text-[#202124]">Cue: </span>
                  {item.stageCue}
                </div>
                <p className="text-xs font-light text-[#202124] leading-relaxed bg-white border border-[#E8EAED] p-3">
                  “{item.spokenScript}”
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
