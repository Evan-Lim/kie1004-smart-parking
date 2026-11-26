import React, { useState } from 'react';
import { Cpu, Check, Layers, Table2 } from 'lucide-react';
import { PIN_ALLOCATION_TABLE, PinMapping } from '../data/blueprintData';

type SchematicGroup = 'all' | 'ultrasonic' | 'leds' | 'i2c' | 'buzzer' | 'uart';
type SchematicViewTab = 'diagram' | 'table';

export const InteractiveSchematic: React.FC = () => {
  const [viewTab, setViewTab] = useState<SchematicViewTab>('diagram');
  const [selectedPinId, setSelectedPinId] = useState<string>('buzzer');
  const [activeGroup, setActiveGroup] = useState<SchematicGroup>('all');

  const selectedPin: PinMapping =
    PIN_ALLOCATION_TABLE.find((p) => p.id === selectedPinId) ?? PIN_ALLOCATION_TABLE[0];

  const isHighlighted = (group: PinMapping['group'], id?: string) => {
    if (id && selectedPinId === id) return true;
    if (activeGroup !== 'all' && activeGroup === group) return true;
    return false;
  };

  const filteredPins =
    activeGroup === 'all'
      ? PIN_ALLOCATION_TABLE
      : PIN_ALLOCATION_TABLE.filter((p) => p.group === activeGroup);

  const buzzerHighlight =
    activeGroup === 'buzzer' ||
    selectedPinId === 'buzzer' ||
    activeGroup === 'i2c' ||
    selectedPinId === 'i2c_sda' ||
    selectedPinId === 'i2c_scl';

  return (
    <div className="h-full flex flex-col gap-3 min-h-0">
      {/* Dense Top Controls */}
      <div className="bg-white border border-[#DADCE0] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <Cpu className="w-4 h-4 text-[#1A73E8] shrink-0" />
          <div className="min-w-0">
            <h2 className="text-[15px] font-normal text-[#202124] leading-tight truncate">
              20/20 Arduino Uno R3 + PCF8574 (0x24) 3-Passive-Buzzer Schematic
            </h2>
            <p className="text-[11px] font-light text-[#5F6368] truncate">
              3× HC-SR04 (D2–D7) · 9 LEDs (D8–D13, A0–A2) · A3→2N2222→3× Passive Buzzers ← PCF8574 (0x24) · 3× LCDs (0x27–0x25)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div role="tablist" className="inline-flex border border-[#DADCE0] bg-[#F4F6F9]">
            <button
              type="button"
              role="tab"
              aria-selected={viewTab === 'diagram'}
              onClick={() => setViewTab('diagram')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs whitespace-nowrap cursor-pointer ${
                viewTab === 'diagram'
                  ? 'bg-white text-[#1A73E8] font-medium border-b-2 border-[#1A73E8]'
                  : 'text-[#5F6368] hover:text-[#202124]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Schematic &amp; I2C Pads
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewTab === 'table'}
              onClick={() => setViewTab('table')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs whitespace-nowrap cursor-pointer ${
                viewTab === 'table'
                  ? 'bg-white text-[#1A73E8] font-medium border-b-2 border-[#1A73E8]'
                  : 'text-[#5F6368] hover:text-[#202124]'
              }`}
            >
              <Table2 className="w-3.5 h-3.5" />
              20-Pin Table 1
            </button>
          </div>

          <div role="group" aria-label="Filter subsystem" className="inline-flex border border-[#DADCE0] bg-[#F4F6F9]">
            {(
              [
                ['all', 'All'],
                ['i2c', '4× I2C'],
                ['ultrasonic', '3× US'],
                ['leds', '9× LED'],
                ['buzzer', '3× BZ'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveGroup(key)}
                className={`px-2.5 py-1.5 text-[11px] whitespace-nowrap cursor-pointer ${
                  activeGroup === key
                    ? 'bg-white text-[#1A73E8] font-medium'
                    : 'text-[#5F6368] hover:text-[#202124]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* View 1: Interactive SVG Schematic + Pin Inspector & 4-Device I2C Guide */}
      {viewTab === 'diagram' && (
        <div className="flex-1 min-h-0 overflow-y-auto dash-scroll grid grid-cols-1 xl:grid-cols-12 gap-3 items-start pr-0.5">
          <figure className="xl:col-span-8 bg-white border border-[#DADCE0] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-light text-[#5F6368]">
                Fig. 1 — Baseline v3.1 Architecture: Click any subsystem to inspect current &amp; datasheet notes
              </span>
              <span className="text-[11px] font-mono text-[#174EA6] bg-[#E8F0FE] border border-[#AECBFA] px-2 py-0.5">
                20/20 Uno Pins + 4× I2C (0x27–0x24)
              </span>
            </div>

            <div className="overflow-x-auto">
              <svg
                viewBox="0 0 920 620"
                className="w-full min-w-[660px] h-auto select-none"
                role="img"
                aria-label="Interactive 20-pin Arduino Uno R3 schematic with 3 HC-SR04 sensors, 9 LEDs, 3 I2C LCDs, 2N2222 buffer, PCF8574 0x24, and 3 passive buzzers"
              >
                <rect x="0" y="0" width="920" height="620" fill="#F8FAFC" />

                <line x1="28" y1="26" x2="28" y2="594" stroke="#C5221F" strokeWidth="2.2" />
                <text x="16" y="18" fill="#C5221F" fontSize="11" fontWeight="500" fontFamily="JetBrains Mono">
                  +5V
                </text>
                <line x1="50" y1="42" x2="50" y2="604" stroke="#202124" strokeWidth="2" />
                <text x="41" y="34" fill="#202124" fontSize="11" fontWeight="500" fontFamily="JetBrains Mono">
                  GND
                </text>

                {/* Center Arduino Uno R3 */}
                <g>
                  <rect x="330" y="30" width="210" height="500" fill="#E8F0FE" stroke="#1A73E8" strokeWidth="1.6" />
                  <text x="435" y="56" textAnchor="middle" fill="#174EA6" fontSize="15" fontWeight="500" fontFamily="Inter, sans-serif">
                    Arduino Uno R3
                  </text>
                  <text x="435" y="73" textAnchor="middle" fill="#1A73E8" fontSize="10.5" fontFamily="JetBrains Mono">
                    ATmega328P · 20/20 Pins
                  </text>

                  {[
                    { y: 106, label: '5V', color: '#C5221F' },
                    { y: 126, label: 'GND', color: '#202124' },
                    { y: 162, label: 'D2 (TRIG_1)', id: 'trig1' },
                    { y: 184, label: 'D3 (ECHO_1)', id: 'echo1' },
                    { y: 234, label: 'D4 (TRIG_2)', id: 'trig2' },
                    { y: 256, label: 'D5 (ECHO_2)', id: 'echo2' },
                    { y: 306, label: 'D6 (TRIG_3)', id: 'trig3' },
                    { y: 328, label: 'D7 (ECHO_3)', id: 'echo3' },
                    { y: 392, label: 'D0 (RX)', id: 'uart' },
                    { y: 414, label: 'D1 (TX)', id: 'uart' },
                  ].map((pin) => (
                    <g key={pin.label}>
                      <circle cx="330" cy={pin.y} r="3.5" fill={pin.color ?? '#1A73E8'} />
                      <text
                        x="341"
                        y={pin.y + 4}
                        fill={pin.color ?? '#202124'}
                        fontSize="10.5"
                        fontFamily="JetBrains Mono"
                        fontWeight={pin.id === selectedPinId ? '500' : '400'}
                      >
                        {pin.label}
                      </text>
                    </g>
                  ))}

                  {[
                    { y: 106, label: 'D8 (LED_G1)', id: 'led_g1' },
                    { y: 124, label: 'D9 (LED_Y1)', id: 'led_y1' },
                    { y: 142, label: 'D10 (LED_R1)', id: 'led_r1' },
                    { y: 174, label: 'D11 (LED_G2)', id: 'led_g2' },
                    { y: 192, label: 'D12 (LED_Y2)', id: 'led_y2' },
                    { y: 210, label: 'D13 (LED_R2)', id: 'led_r2' },
                    { y: 242, label: 'A0 (LED_G3)', id: 'led_g3' },
                    { y: 260, label: 'A1 (LED_Y3)', id: 'led_y3' },
                    { y: 278, label: 'A2 (LED_R3)', id: 'led_r3' },
                    { y: 332, label: 'A3 (TONE_BUS)', id: 'buzzer' },
                    { y: 432, label: 'A4 (I2C SDA)', id: 'i2c_sda' },
                    { y: 462, label: 'A5 (I2C SCL)', id: 'i2c_scl' },
                  ].map((pin) => (
                    <g key={pin.label}>
                      <circle cx="540" cy={pin.y} r="3.5" fill={pin.id === 'buzzer' ? '#C5221F' : '#1A73E8'} />
                      <text
                        x="529"
                        y={pin.y + 4}
                        textAnchor="end"
                        fill={pin.id === 'buzzer' ? '#A50E0E' : '#202124'}
                        fontSize="10.5"
                        fontFamily="JetBrains Mono"
                        fontWeight={pin.id === selectedPinId ? '500' : '400'}
                      >
                        {pin.label}
                      </text>
                    </g>
                  ))}
                </g>

                <line x1="28" y1="106" x2="330" y2="106" stroke="#C5221F" strokeWidth="1.6" />
                <line x1="50" y1="126" x2="330" y2="126" stroke="#202124" strokeWidth="1.5" />

                {/* 3x HC-SR04 Sensors */}
                {[
                  { bay: 1, y: 146, trigId: 'trig1', echoId: 'echo1', ty: 162, ey: 184 },
                  { bay: 2, y: 218, trigId: 'trig2', echoId: 'echo2', ty: 234, ey: 256 },
                  { bay: 3, y: 290, trigId: 'trig3', echoId: 'echo3', ty: 306, ey: 328 },
                ].map((s) => {
                  const active = isHighlighted('ultrasonic', s.trigId) || selectedPinId === s.echoId;
                  return (
                    <g key={s.bay} onClick={() => setSelectedPinId(s.trigId)} className="cursor-pointer">
                      <rect
                        x="90"
                        y={s.y}
                        width="156"
                        height="56"
                        fill={active ? '#E6F4EA' : '#FFFFFF'}
                        stroke={active ? '#137333' : '#9AA0A6'}
                        strokeWidth={active ? '1.8' : '1.2'}
                      />
                      <text x="168" y={s.y + 22} textAnchor="middle" fill="#137333" fontSize="11.5" fontWeight="500" fontFamily="Inter, sans-serif">
                        HC-SR04 (Bay {s.bay})
                      </text>
                      <text x="168" y={s.y + 40} textAnchor="middle" fill="#5F6368" fontSize="9.8" fontFamily="JetBrains Mono">
                        5V · 40 kHz · 15° Cone
                      </text>
                      <line x1="28" y1={s.y + 18} x2="90" y2={s.y + 18} stroke="#C5221F" strokeWidth="1.3" />
                      <line x1="50" y1={s.y + 38} x2="90" y2={s.y + 38} stroke="#202124" strokeWidth="1.3" />
                      <line x1="246" y1={s.ty} x2="330" y2={s.ty} stroke="#1A73E8" strokeWidth={active ? '2.2' : '1.3'} />
                      <line x1="246" y1={s.ey} x2="330" y2={s.ey} stroke="#137333" strokeWidth={active ? '2.2' : '1.3'} />
                    </g>
                  );
                })}

                {/* USB Serial */}
                <g onClick={() => setSelectedPinId('uart')} className="cursor-pointer">
                  <rect
                    x="90"
                    y="376"
                    width="156"
                    height="52"
                    fill={isHighlighted('uart', 'uart') ? '#E8F0FE' : '#FFFFFF'}
                    stroke={isHighlighted('uart', 'uart') ? '#1A73E8' : '#9AA0A6'}
                    strokeWidth="1.3"
                  />
                  <text x="168" y="398" textAnchor="middle" fill="#202124" fontSize="11" fontWeight="500" fontFamily="Inter, sans-serif">
                    PC USB Serial (9600)
                  </text>
                  <text x="168" y="415" textAnchor="middle" fill="#5F6368" fontSize="9.5" fontFamily="JetBrains Mono">
                    S, T, D, R &amp; Receipts
                  </text>
                  <line x1="246" y1="392" x2="330" y2="392" stroke="#5F6368" strokeWidth="1.3" />
                  <line x1="246" y1="414" x2="330" y2="414" stroke="#5F6368" strokeWidth="1.3" />
                </g>

                {/* Dual Decoupling */}
                <g>
                  <rect x="90" y="450" width="200" height="68" fill="#FEF7E0" stroke="#B06000" strokeWidth="1.3" />
                  <text x="190" y="471" textAnchor="middle" fill="#7A4100" fontSize="10.5" fontWeight="500" fontFamily="Inter, sans-serif">
                    Dual Rail Decoupling (v3.1)
                  </text>
                  <text x="190" y="488" textAnchor="middle" fill="#5F6368" fontSize="9.5" fontFamily="JetBrains Mono">
                    2× 100 µF + 2× 0.1 µF Ceramic
                  </text>
                  <text x="190" y="505" textAnchor="middle" fill="#5F6368" fontSize="9" fontFamily="Inter, sans-serif">
                    Near 3× HC-SR04 &amp; 4× I2C + 2N2222
                  </text>
                  <line x1="28" y1="472" x2="90" y2="472" stroke="#C5221F" strokeWidth="1.3" />
                  <line x1="50" y1="496" x2="90" y2="496" stroke="#202124" strokeWidth="1.3" />
                </g>

                {/* Power Summary Box */}
                <g>
                  <rect x="90" y="534" width="200" height="62" fill="#E6F4EA" stroke="#137333" strokeWidth="1.2" />
                  <text x="190" y="553" textAnchor="middle" fill="#137333" fontSize="10" fontWeight="500" fontFamily="Inter, sans-serif">
                    Verified Peak Thermal Margins
                  </text>
                  <text x="190" y="570" textAnchor="middle" fill="#202124" fontSize="9.3" fontFamily="JetBrains Mono">
                    MCU 100.3/200 · PCF 45/80 mA
                  </text>
                  <text x="190" y="585" textAnchor="middle" fill="#202124" fontSize="9.3" fontFamily="JetBrains Mono">
                    2N2222 49.3/600 · USB 285.6 mA
                  </text>
                </g>

                {/* 3x LED Banks */}
                {[
                  { bay: 1, y: 92, pins: [106, 124, 142], id: 'led_g1' },
                  { bay: 2, y: 160, pins: [174, 192, 210], id: 'led_g2' },
                  { bay: 3, y: 228, pins: [242, 260, 278], id: 'led_g3' },
                ].map((bank) => {
                  const active =
                    activeGroup === 'leds' ||
                    (selectedPin.group === 'leds' && selectedPin.bay === bank.bay);
                  return (
                    <g key={bank.bay} onClick={() => setSelectedPinId(bank.id)} className="cursor-pointer">
                      <rect
                        x="616"
                        y={bank.y}
                        width="278"
                        height="60"
                        fill={active ? '#E8F0FE' : '#FFFFFF'}
                        stroke={active ? '#1A73E8' : '#9AA0A6'}
                        strokeWidth={active ? '1.8' : '1.2'}
                      />
                      <text x="630" y={bank.y + 18} fill="#202124" fontSize="11" fontWeight="500" fontFamily="Inter, sans-serif">
                        Bay {bank.bay} LEDs (3× 330 Ω)
                      </text>
                      <text x="630" y={bank.y + 34} fill="#5F6368" fontSize="9.5" fontFamily="JetBrains Mono">
                        G 8.5 · Y 9.1 · R 9.1 mA
                      </text>
                      <circle cx="826" cy={bank.y + 22} r="5.5" fill="#188038" />
                      <circle cx="848" cy={bank.y + 22} r="5.5" fill="#F9AB00" />
                      <circle cx="870" cy={bank.y + 22} r="5.5" fill="#D93025" />
                      <text x="630" y={bank.y + 50} fill="#5F6368" fontSize="9.3" fontFamily="Inter, sans-serif">
                        Mounted directly above Bay {bank.bay} HC-SR04
                      </text>
                      {bank.pins.map((py, pIdx) => (
                        <line
                          key={py}
                          x1="540"
                          y1={py}
                          x2="616"
                          y2={py}
                          stroke={pIdx === 0 ? '#188038' : pIdx === 1 ? '#B06000' : '#D93025'}
                          strokeWidth={active ? '2' : '1.3'}
                        />
                      ))}
                    </g>
                  );
                })}

                {/* Pin A3 -> 1k -> 2N2222 Emitter Follower -> 3x Passive Buzzers (+) <- PCF8574 (0x24) */}
                <g onClick={() => setSelectedPinId('buzzer')} className="cursor-pointer">
                  <line
                    x1="540"
                    y1="332"
                    x2="616"
                    y2="332"
                    stroke="#C5221F"
                    strokeWidth={buzzerHighlight ? '2.4' : '1.6'}
                  />
                  <rect
                    x="616"
                    y="298"
                    width="278"
                    height="92"
                    fill={buzzerHighlight ? '#FCE8E6' : '#FFFFFF'}
                    stroke={buzzerHighlight ? '#C5221F' : '#9AA0A6'}
                    strokeWidth={buzzerHighlight ? '1.8' : '1.2'}
                  />
                  <text x="630" y="317" fill="#A50E0E" fontSize="11" fontWeight="500" fontFamily="Inter, sans-serif">
                    2N2222 Tone Buffer → 3× Passive Buzzers
                  </text>
                  <text x="630" y="333" fill="#5F6368" fontSize="9.2" fontFamily="JetBrains Mono">
                    A3 → 1kΩ → B · C→+5V · E→TONE_BUS (+1kΩ GND)
                  </text>
                  <text x="630" y="348" fill="#A50E0E" fontSize="9.2" fontFamily="JetBrains Mono">
                    2500Hz Danger · 1800Hz Overstay · 2000Hz Mix
                  </text>
                  {[
                    { bay: 1, x: 630, pin: 'P0' },
                    { bay: 2, x: 718, pin: 'P1' },
                    { bay: 3, x: 806, pin: 'P2' },
                  ].map((bz) => (
                    <g key={bz.bay}>
                      <rect x={bz.x} y="357" width="76" height="24" fill="#FFFFFF" stroke="#C5221F" strokeWidth="1" />
                      <text x={bz.x + 38} y="372" textAnchor="middle" fill="#202124" fontSize="9.2" fontFamily="JetBrains Mono">
                        BZ{bz.bay} (+)←{bz.pin}
                      </text>
                    </g>
                  ))}
                  {/* Gate return line from PCF8574 0x24 up to 3x Passive Buzzers (-) */}
                  <line x1="876" y1="390" x2="876" y2="554" stroke="#C5221F" strokeWidth="1.5" strokeDasharray="4 2" />
                </g>

                {/* Shared I2C Bus -> 3x LCDs + PCF8574 (0x24) */}
                <g onClick={() => setSelectedPinId('i2c_sda')} className="cursor-pointer">
                  <line x1="540" y1="432" x2="598" y2="432" stroke="#1A73E8" strokeWidth={isHighlighted('i2c', 'i2c_sda') ? '2.6' : '1.8'} />
                  <line x1="540" y1="462" x2="586" y2="462" stroke="#7B1FA2" strokeWidth={isHighlighted('i2c', 'i2c_scl') ? '2.6' : '1.8'} />
                  <line x1="598" y1="414" x2="598" y2="574" stroke="#1A73E8" strokeWidth="1.8" />
                  <line x1="586" y1="426" x2="586" y2="586" stroke="#7B1FA2" strokeWidth="1.8" />

                  {[
                    { title: 'Bay 1 16×2 I2C LCD (0x27)', sub: 'PCF8574: A0/A1/A2 Open · ~25 mA', y: 402, isBuzzerIc: false },
                    { title: 'Bay 2 16×2 I2C LCD (0x26)', sub: 'PCF8574: Bridge A0 · ~25 mA', y: 452, isBuzzerIc: false },
                    { title: 'Bay 3 16×2 I2C LCD (0x25)', sub: 'PCF8574: Bridge A1 · ~25 mA', y: 502, isBuzzerIc: false },
                    { title: 'PCF8574 Buzzer Expander (0x24)', sub: 'Bridge A0+A1 · P0/P1/P2 Active-LOW Sink', y: 552, isBuzzerIc: true },
                  ].map((dev) => {
                    const active = dev.isBuzzerIc
                      ? buzzerHighlight
                      : activeGroup === 'i2c' || selectedPinId === 'i2c_sda' || selectedPinId === 'i2c_scl';
                    return (
                      <g
                        key={dev.title}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPinId(dev.isBuzzerIc ? 'buzzer' : 'i2c_sda');
                        }}
                      >
                        <line x1="598" y1={dev.y + 14} x2="616" y2={dev.y + 14} stroke="#1A73E8" strokeWidth="1.5" />
                        <line x1="586" y1={dev.y + 28} x2="616" y2={dev.y + 28} stroke="#7B1FA2" strokeWidth="1.5" />
                        <rect
                          x="616"
                          y={dev.y}
                          width="278"
                          height="42"
                          fill={dev.isBuzzerIc ? (active ? '#FCE8E6' : '#FFF8F7') : active ? '#E8F0FE' : '#FFFFFF'}
                          stroke={dev.isBuzzerIc ? '#C5221F' : active ? '#1A73E8' : '#9AA0A6'}
                          strokeWidth={active ? '1.8' : '1.2'}
                        />
                        <text
                          x="630"
                          y={dev.y + 17}
                          fill={dev.isBuzzerIc ? '#A50E0E' : '#174EA6'}
                          fontSize="10.8"
                          fontWeight="500"
                          fontFamily="Inter, sans-serif"
                        >
                          {dev.title}
                        </text>
                        <text x="630" y={dev.y + 32} fill="#5F6368" fontSize="9.2" fontFamily="JetBrains Mono">
                          {dev.sub}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          </figure>

          {/* Right Inspector + 4-Device I2C Address Pad Guide */}
          <div className="xl:col-span-4 space-y-3">
            <div className="bg-white border border-[#DADCE0] p-4 space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#E8EAED] pb-2">
                <span className="text-xs font-medium text-[#202124]">Active Pin Inspector</span>
                <span className="font-mono text-xs font-medium text-[#1A73E8]">{selectedPin.arduinoPin}</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#202124]">{selectedPin.signalName}</h3>
                <p className="text-xs font-light text-[#5F6368] mt-0.5">{selectedPin.component}</p>
              </div>
              <dl className="space-y-2 pt-2 border-t border-[#E8EAED] text-xs">
                <div>
                  <dt className="text-[11px] text-[#5F6368]">Direction / Mode</dt>
                  <dd className="font-mono text-[#202124]">{selectedPin.direction}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-[#5F6368]">Electrical Current Load</dt>
                  <dd className="font-mono text-[#202124]">{selectedPin.currentNote}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-[#5F6368]">Datasheet &amp; Engineering Rationale</dt>
                  <dd className="font-light text-[#3C4043] leading-relaxed mt-0.5">{selectedPin.datasheetNote}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-white border border-[#DADCE0] p-4 space-y-2.5">
              <h3 className="text-xs font-medium text-[#202124]">
                4-Device PCF8574 Address Map (3× LCD + 0x24 Expander)
              </h3>
              <p className="text-[11.5px] font-light text-[#5F6368] leading-relaxed">
                Set unique A0/A1 pads across all 4 I2C boards so SDA/SCL never collide (4× 4.7 kΩ parallel ={' '}
                <span className="font-mono">1.18 kΩ / 4.26 mA</span>):
              </p>
              <div className="space-y-1.5">
                {[
                  { label: 'Bay 1 LCD', addr: '0x27', a0: false, a1: false, a2: false, note: 'Factory default (open)', isBuzzer: false },
                  { label: 'Bay 2 LCD', addr: '0x26', a0: true, a1: false, a2: false, note: 'Bridge A0 pad', isBuzzer: false },
                  { label: 'Bay 3 LCD', addr: '0x25', a0: false, a1: true, a2: false, note: 'Bridge A1 pad', isBuzzer: false },
                  { label: '3× Buzzer Expander', addr: '0x24', a0: true, a1: true, a2: false, note: 'Bridge A0 + A1 (P0–P2 sink)', isBuzzer: true },
                ].map((cfg) => (
                  <div
                    key={cfg.addr}
                    className={`flex items-center justify-between gap-2 px-2.5 py-2 border ${
                      cfg.isBuzzer
                        ? 'bg-[#FCE8E6]/60 border-[#FAD2CF]'
                        : 'bg-[#F8F9FA] border-[#DADCE0]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-medium text-[#202124]">
                        {cfg.label} ·{' '}
                        <span className={`font-mono ${cfg.isBuzzer ? 'text-[#C5221F]' : 'text-[#1A73E8]'}`}>
                          {cfg.addr}
                        </span>
                      </div>
                      <div className="text-[10.5px] font-light text-[#5F6368]">{cfg.note}</div>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[10px]">
                      {[
                        ['A0', cfg.a0],
                        ['A1', cfg.a1],
                        ['A2', cfg.a2],
                      ].map(([pad, bridged]) => (
                        <div
                          key={String(pad)}
                          className={`px-1.5 py-0.5 border ${
                            bridged
                              ? cfg.isBuzzer
                                ? 'bg-[#C5221F] border-[#C5221F] text-white'
                                : 'bg-[#1A73E8] border-[#1A73E8] text-white'
                              : 'bg-white border-[#DADCE0] text-[#5F6368]'
                          }`}
                        >
                          {String(pad)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] font-light text-[#5F6368] flex items-start gap-1.5 pt-1">
                <Check className="w-3.5 h-3.5 text-[#137333] shrink-0 mt-0.5" />
                <span>
                  On PCF8574 breakout boards with jumper pins, move A0 &amp; A1 shunts to GND (0x24) — zero soldering required.
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* View 2: 20-Pin Booktabs Table */}
      {viewTab === 'table' && (
        <div className="flex-1 min-h-0 overflow-y-auto dash-scroll bg-white border border-[#DADCE0] p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
            <h3 className="text-sm font-medium text-[#202124]">
              Table 1 — Complete 20-Pin Allocation Mapping (Arduino Uno R3 + PCF8574 0x24)
            </h3>
            <span className="text-xs font-light text-[#5F6368]">
              Click any row to highlight &amp; inspect in Figure 1
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="booktabs-table text-left text-xs">
              <thead>
                <tr className="text-[#202124]">
                  <th className="py-2 pr-4 font-medium">Arduino Pin</th>
                  <th className="py-2 pr-4 font-medium">Signal Name</th>
                  <th className="py-2 pr-4 font-medium">Connected Component (v3.1)</th>
                  <th className="py-2 pr-4 font-medium">Mode</th>
                  <th className="py-2 text-right font-medium">Current Load</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {filteredPins.map((pin) => {
                  const isSelected = pin.id === selectedPinId;
                  return (
                    <tr
                      key={pin.id}
                      onClick={() => {
                        setSelectedPinId(pin.id);
                        setViewTab('diagram');
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#E8F0FE]' : 'hover:bg-[#F8F9FA]'
                      }`}
                    >
                      <td className="py-2 pr-4 font-mono font-medium text-[#1A73E8] whitespace-nowrap">
                        {pin.arduinoPin}
                      </td>
                      <td className="py-2 pr-4 font-mono text-[#202124] whitespace-nowrap">
                        {pin.signalName}
                      </td>
                      <td className="py-2 pr-4 font-light text-[#202124]">{pin.component}</td>
                      <td className="py-2 pr-4 font-mono text-[#5F6368] whitespace-nowrap">
                        {pin.direction}
                      </td>
                      <td className="py-2 text-right font-mono text-[#5F6368] whitespace-nowrap">
                        {pin.currentNote.split('(')[0].trim()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
