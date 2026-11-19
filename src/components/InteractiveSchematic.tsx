import React, { useState } from 'react';
import { Cpu, Check, Layers, Table2 } from 'lucide-react';
import { PIN_ALLOCATION_TABLE, PinMapping } from '../data/blueprintData';

type SchematicGroup = 'all' | 'ultrasonic' | 'leds' | 'i2c' | 'buzzer' | 'uart';
type SchematicViewTab = 'diagram' | 'table';

export const InteractiveSchematic: React.FC = () => {
  const [viewTab, setViewTab] = useState<SchematicViewTab>('diagram');
  const [selectedPinId, setSelectedPinId] = useState<string>('i2c_sda');
  const [activeGroup, setActiveGroup] = useState<SchematicGroup>('all');
  const [showThreeBuzzerOption, setShowThreeBuzzerOption] = useState<boolean>(false);

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

  return (
    <div className="h-full flex flex-col gap-3 min-h-0">
      {/* Dense Top Controls */}
      <div className="bg-white border border-[#DADCE0] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <Cpu className="w-4 h-4 text-[#1A73E8] shrink-0" />
          <div className="min-w-0">
            <h2 className="text-[15px] font-normal text-[#202124] leading-tight truncate">
              20/20 Arduino Uno R3 Schematic &amp; Shared I2C Bus Addressing
            </h2>
            <p className="text-[11px] font-light text-[#5F6368] truncate">
              3× HC-SR04 (D2–D7) · 9 LEDs via 330 Ω (D8–D13, A0–A2) · Buzzer (A3) · 3× I2C LCDs (0x27, 0x26, 0x25 on A4/A5)
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
                ['i2c', '3× LCD'],
                ['ultrasonic', '3× US'],
                ['leds', '9× LED'],
                ['buzzer', 'A3'],
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

      {/* View 1: Interactive SVG Schematic + Pin Inspector & I2C Guide */}
      {viewTab === 'diagram' && (
        <div className="flex-1 min-h-0 overflow-y-auto dash-scroll grid grid-cols-1 xl:grid-cols-12 gap-3 items-start pr-0.5">
          <figure className="xl:col-span-8 bg-white border border-[#DADCE0] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-light text-[#5F6368]">
                Fig. 1 — Click any component block to inspect electrical load &amp; datasheet notes
              </span>
              <button
                type="button"
                onClick={() => setShowThreeBuzzerOption((v) => !v)}
                aria-pressed={showThreeBuzzerOption}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] border cursor-pointer ${
                  showThreeBuzzerOption
                    ? 'bg-[#E8F0FE] border-[#1A73E8] text-[#174EA6] font-medium'
                    : 'bg-[#F8F9FA] border-[#DADCE0] text-[#5F6368] hover:text-[#202124]'
                }`}
              >
                <Layers className="w-3 h-3" />
                {showThreeBuzzerOption ? 'Showing Optional 0x24 Expander' : 'Optional 3-Buzzer Expander'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <svg
                viewBox="0 0 920 555"
                className="w-full min-w-[660px] h-auto select-none"
                role="img"
                aria-label="Interactive 20-pin Arduino Uno R3 schematic with 3 HC-SR04 sensors, 9 LEDs, 3 I2C LCDs, and Pin A3 buzzer"
              >
                <rect x="0" y="0" width="920" height="555" fill="#F8FAFC" />

                <line x1="28" y1="26" x2="28" y2="528" stroke="#C5221F" strokeWidth="2.2" />
                <text x="16" y="18" fill="#C5221F" fontSize="11" fontWeight="500" fontFamily="JetBrains Mono">
                  +5V
                </text>
                <line x1="50" y1="42" x2="50" y2="538" stroke="#202124" strokeWidth="2" />
                <text x="41" y="34" fill="#202124" fontSize="11" fontWeight="500" fontFamily="JetBrains Mono">
                  GND
                </text>

                {/* Center Arduino Uno R3 */}
                <g>
                  <rect x="335" y="30" width="210" height="478" fill="#E8F0FE" stroke="#1A73E8" strokeWidth="1.6" />
                  <text x="440" y="58" textAnchor="middle" fill="#174EA6" fontSize="15" fontWeight="500" fontFamily="Inter, sans-serif">
                    Arduino Uno R3
                  </text>
                  <text x="440" y="75" textAnchor="middle" fill="#1A73E8" fontSize="10.5" fontFamily="JetBrains Mono">
                    ATmega328P · 20/20 Pins
                  </text>

                  {[
                    { y: 108, label: '5V', color: '#C5221F' },
                    { y: 128, label: 'GND', color: '#202124' },
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
                      <circle cx="335" cy={pin.y} r="3.5" fill={pin.color ?? '#1A73E8'} />
                      <text
                        x="346"
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
                    { y: 108, label: 'D8 (LED_G1)', id: 'led_g1' },
                    { y: 128, label: 'D9 (LED_Y1)', id: 'led_y1' },
                    { y: 148, label: 'D10 (LED_R1)', id: 'led_r1' },
                    { y: 182, label: 'D11 (LED_G2)', id: 'led_g2' },
                    { y: 202, label: 'D12 (LED_Y2)', id: 'led_y2' },
                    { y: 222, label: 'D13 (LED_R2)', id: 'led_r2' },
                    { y: 256, label: 'A0 (LED_G3)', id: 'led_g3' },
                    { y: 276, label: 'A1 (LED_Y3)', id: 'led_y3' },
                    { y: 296, label: 'A2 (LED_R3)', id: 'led_r3' },
                    { y: 344, label: 'A3 (BUZZER)', id: 'buzzer' },
                    { y: 416, label: 'A4 (I2C SDA)', id: 'i2c_sda' },
                    { y: 446, label: 'A5 (I2C SCL)', id: 'i2c_scl' },
                  ].map((pin) => (
                    <g key={pin.label}>
                      <circle cx="545" cy={pin.y} r="3.5" fill="#1A73E8" />
                      <text
                        x="534"
                        y={pin.y + 4}
                        textAnchor="end"
                        fill="#202124"
                        fontSize="10.5"
                        fontFamily="JetBrains Mono"
                        fontWeight={pin.id === selectedPinId ? '500' : '400'}
                      >
                        {pin.label}
                      </text>
                    </g>
                  ))}
                </g>

                <line x1="28" y1="108" x2="335" y2="108" stroke="#C5221F" strokeWidth="1.6" />
                <line x1="50" y1="128" x2="335" y2="128" stroke="#202124" strokeWidth="1.5" />

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
                        x="92"
                        y={s.y}
                        width="156"
                        height="56"
                        fill={active ? '#E6F4EA' : '#FFFFFF'}
                        stroke={active ? '#137333' : '#9AA0A6'}
                        strokeWidth={active ? '1.8' : '1.2'}
                      />
                      <text x="170" y={s.y + 22} textAnchor="middle" fill="#137333" fontSize="11.5" fontWeight="500" fontFamily="Inter, sans-serif">
                        HC-SR04 (Bay {s.bay})
                      </text>
                      <text x="170" y={s.y + 40} textAnchor="middle" fill="#5F6368" fontSize="9.8" fontFamily="JetBrains Mono">
                        5V · 40 kHz · 15° Cone
                      </text>
                      <line x1="28" y1={s.y + 18} x2="92" y2={s.y + 18} stroke="#C5221F" strokeWidth="1.3" />
                      <line x1="50" y1={s.y + 38} x2="92" y2={s.y + 38} stroke="#202124" strokeWidth="1.3" />
                      <line x1="248" y1={s.ty} x2="335" y2={s.ty} stroke="#1A73E8" strokeWidth={active ? '2.2' : '1.3'} />
                      <line x1="248" y1={s.ey} x2="335" y2={s.ey} stroke="#137333" strokeWidth={active ? '2.2' : '1.3'} />
                    </g>
                  );
                })}

                {/* USB Serial */}
                <g onClick={() => setSelectedPinId('uart')} className="cursor-pointer">
                  <rect
                    x="92"
                    y="376"
                    width="156"
                    height="52"
                    fill={isHighlighted('uart', 'uart') ? '#E8F0FE' : '#FFFFFF'}
                    stroke={isHighlighted('uart', 'uart') ? '#1A73E8' : '#9AA0A6'}
                    strokeWidth="1.3"
                  />
                  <text x="170" y="398" textAnchor="middle" fill="#202124" fontSize="11" fontWeight="500" fontFamily="Inter, sans-serif">
                    PC USB Serial (9600)
                  </text>
                  <text x="170" y="415" textAnchor="middle" fill="#5F6368" fontSize="9.5" fontFamily="JetBrains Mono">
                    S, T, D, R &amp; Receipts
                  </text>
                  <line x1="248" y1="392" x2="335" y2="392" stroke="#5F6368" strokeWidth="1.3" />
                  <line x1="248" y1="414" x2="335" y2="414" stroke="#5F6368" strokeWidth="1.3" />
                </g>

                {/* Dual Decoupling */}
                <g>
                  <rect x="92" y="450" width="195" height="62" fill="#FEF7E0" stroke="#B06000" strokeWidth="1.3" />
                  <text x="189" y="471" textAnchor="middle" fill="#7A4100" fontSize="10.5" fontWeight="500" fontFamily="Inter, sans-serif">
                    Dual Rail Decoupling (v3.0)
                  </text>
                  <text x="189" y="488" textAnchor="middle" fill="#5F6368" fontSize="9.5" fontFamily="JetBrains Mono">
                    2× 100 µF + 2× 0.1 µF Ceramic
                  </text>
                  <text x="189" y="503" textAnchor="middle" fill="#5F6368" fontSize="9" fontFamily="Inter, sans-serif">
                    Near 3× HC-SR04 &amp; 3× I2C LCDs
                  </text>
                  <line x1="28" y1="472" x2="92" y2="472" stroke="#C5221F" strokeWidth="1.3" />
                  <line x1="50" y1="494" x2="92" y2="494" stroke="#202124" strokeWidth="1.3" />
                </g>

                {/* 3x LED Banks */}
                {[
                  { bay: 1, y: 94, pins: [108, 128, 148], id: 'led_g1' },
                  { bay: 2, y: 168, pins: [182, 202, 222], id: 'led_g2' },
                  { bay: 3, y: 242, pins: [256, 276, 296], id: 'led_g3' },
                ].map((bank) => {
                  const active =
                    activeGroup === 'leds' ||
                    (selectedPin.group === 'leds' && selectedPin.bay === bank.bay);
                  return (
                    <g key={bank.bay} onClick={() => setSelectedPinId(bank.id)} className="cursor-pointer">
                      <rect
                        x="618"
                        y={bank.y}
                        width="274"
                        height="64"
                        fill={active ? '#E8F0FE' : '#FFFFFF'}
                        stroke={active ? '#1A73E8' : '#9AA0A6'}
                        strokeWidth={active ? '1.8' : '1.2'}
                      />
                      <text x="632" y={bank.y + 19} fill="#202124" fontSize="11" fontWeight="500" fontFamily="Inter, sans-serif">
                        Bay {bank.bay} LEDs (3× 330 Ω)
                      </text>
                      <text x="632" y={bank.y + 35} fill="#5F6368" fontSize="9.5" fontFamily="JetBrains Mono">
                        G 8.5 · Y 9.1 · R 9.1 mA
                      </text>
                      <circle cx="826" cy={bank.y + 24} r="5.5" fill="#188038" />
                      <circle cx="848" cy={bank.y + 24} r="5.5" fill="#F9AB00" />
                      <circle cx="870" cy={bank.y + 24} r="5.5" fill="#D93025" />
                      <text x="632" y={bank.y + 52} fill="#5F6368" fontSize="9.5" fontFamily="Inter, sans-serif">
                        Mounted directly above Bay {bank.bay} HC-SR04
                      </text>
                      {bank.pins.map((py, pIdx) => (
                        <line
                          key={py}
                          x1="545"
                          y1={py}
                          x2="618"
                          y2={py}
                          stroke={pIdx === 0 ? '#188038' : pIdx === 1 ? '#B06000' : '#D93025'}
                          strokeWidth={active ? '2' : '1.3'}
                        />
                      ))}
                    </g>
                  );
                })}

                {/* Pin A3 Buzzer */}
                <g onClick={() => setSelectedPinId('buzzer')} className="cursor-pointer">
                  <rect
                    x="618"
                    y="318"
                    width="274"
                    height="54"
                    fill={isHighlighted('buzzer', 'buzzer') ? '#FCE8E6' : '#FFFFFF'}
                    stroke={isHighlighted('buzzer', 'buzzer') ? '#C5221F' : '#9AA0A6'}
                    strokeWidth={isHighlighted('buzzer', 'buzzer') ? '1.8' : '1.2'}
                  />
                  <text x="632" y="340" fill="#A50E0E" fontSize="11.5" fontWeight="500" fontFamily="Inter, sans-serif">
                    5V Passive Buzzer (Overstay Alarm)
                  </text>
                  <text x="632" y="358" fill="#5F6368" fontSize="9.5" fontFamily="JetBrains Mono">
                    tone(A3, 2000Hz) · Bay-Coded 1×/2×/3×
                  </text>
                  <line
                    x1="545"
                    y1="344"
                    x2="618"
                    y2="344"
                    stroke="#C5221F"
                    strokeWidth={isHighlighted('buzzer', 'buzzer') ? '2.2' : '1.5'}
                  />
                </g>

                {/* Shared I2C Bus -> 3x LCDs */}
                <g onClick={() => setSelectedPinId('i2c_sda')} className="cursor-pointer">
                  <line x1="545" y1="416" x2="600" y2="416" stroke="#1A73E8" strokeWidth={isHighlighted('i2c', 'i2c_sda') ? '2.6' : '1.8'} />
                  <line x1="545" y1="446" x2="588" y2="446" stroke="#7B1FA2" strokeWidth={isHighlighted('i2c', 'i2c_scl') ? '2.6' : '1.8'} />
                  <line x1="600" y1="395" x2="600" y2="515" stroke="#1A73E8" strokeWidth="1.8" />
                  <line x1="588" y1="405" x2="588" y2="525" stroke="#7B1FA2" strokeWidth="1.8" />

                  {[
                    { bay: 1, addr: '0x27', pads: 'A0/A1/A2 Open', y: 384 },
                    { bay: 2, addr: '0x26', pads: 'Bridge A0 Pad', y: 440 },
                    { bay: 3, addr: '0x25', pads: 'Bridge A1 Pad', y: 496 },
                  ].map((lcd) => {
                    const active = activeGroup === 'i2c' || selectedPinId === 'i2c_sda' || selectedPinId === 'i2c_scl';
                    return (
                      <g key={lcd.addr}>
                        <line x1="600" y1={lcd.y + 16} x2="618" y2={lcd.y + 16} stroke="#1A73E8" strokeWidth="1.5" />
                        <line x1="588" y1={lcd.y + 30} x2="618" y2={lcd.y + 30} stroke="#7B1FA2" strokeWidth="1.5" />
                        <rect
                          x="618"
                          y={lcd.y}
                          width="274"
                          height="46"
                          fill={active ? '#E8F0FE' : '#FFFFFF'}
                          stroke={active ? '#1A73E8' : '#9AA0A6'}
                          strokeWidth={active ? '1.8' : '1.2'}
                        />
                        <text x="632" y={lcd.y + 19} fill="#174EA6" fontSize="11" fontWeight="500" fontFamily="Inter, sans-serif">
                          Bay {lcd.bay} 16×2 I2C LCD ({lcd.addr})
                        </text>
                        <text x="632" y={lcd.y + 35} fill="#5F6368" fontSize="9.5" fontFamily="JetBrains Mono">
                          PCF8574: {lcd.pads} · ~25 mA
                        </text>
                      </g>
                    );
                  })}

                  {showThreeBuzzerOption && (
                    <g>
                      <rect x="335" y="514" width="245" height="32" fill="#E8F0FE" stroke="#1A73E8" strokeWidth="1.3" />
                      <text x="457" y="534" textAnchor="middle" fill="#174EA6" fontSize="10" fontWeight="500" fontFamily="JetBrains Mono">
                        +Opt PCF8574 (0x24) → 3× Active Buzzers
                      </text>
                    </g>
                  )}
                </g>
              </svg>
            </div>
          </figure>

          {/* Right Inspector + I2C Address Pad Guide */}
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
                PCF8574 Solder-Bridge Pads (3× LCD Setup)
              </h3>
              <p className="text-[11.5px] font-light text-[#5F6368] leading-relaxed">
                Solder a tiny tin bridge across the target pad on the back of each I2C backpack (PCF8574AT chips shift to{' '}
                <span className="font-mono">0x3F / 0x3E / 0x3D</span>):
              </p>
              <div className="space-y-1.5">
                {[
                  { bay: 1, addr: '0x27', a0: false, a1: false, a2: false, note: 'Factory default (open)' },
                  { bay: 2, addr: '0x26', a0: true, a1: false, a2: false, note: 'Solder bridge A0' },
                  { bay: 3, addr: '0x25', a0: false, a1: true, a2: false, note: 'Solder bridge A1' },
                ].map((cfg) => (
                  <div
                    key={cfg.addr}
                    className="flex items-center justify-between gap-2 bg-[#F8F9FA] px-2.5 py-2 border border-[#DADCE0]"
                  >
                    <div>
                      <div className="text-xs font-medium text-[#202124]">
                        Bay {cfg.bay} · <span className="font-mono text-[#1A73E8]">{cfg.addr}</span>
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
                              ? 'bg-[#1A73E8] border-[#1A73E8] text-white'
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
                <span>Zero-solder alternative: TCA9548A I2C mux (+RM 4.50). Bridging A0 &amp; A1 costs RM 0.00.</span>
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
              Table 1 — Complete 20-Pin Allocation Mapping (Arduino Uno R3 · 100% Utilized)
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
                  <th className="py-2 pr-4 font-medium">Connected Component (v3.0)</th>
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
