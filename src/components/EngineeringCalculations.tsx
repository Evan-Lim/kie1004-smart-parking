import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Calculator, GitBranch, Scale } from 'lucide-react';
import {
  calculateElectricalBudget,
  calculateParkingFee,
  ENGINEERING_CONSTANTS,
} from '../lib/parkingEngine';
import {
  CONFLICTING_REQUIREMENTS,
  ENGINEERING_ASSUMPTIONS,
} from '../data/blueprintData';

type CalcSubTab = 'electrical' | 'fsm-tariff' | 'assumptions';

export const EngineeringCalculations: React.FC = () => {
  const [subTab, setSubTab] = useState<CalcSubTab>('electrical');
  const [resistorOhms, setResistorOhms] = useState<number>(330);
  const [activeLcdCount, setActiveLcdCount] = useState<number>(3);
  const [activeLedsCount, setActiveLedsCount] = useState<number>(3);
  const [activeBuzzerCount, setActiveBuzzerCount] = useState<number>(0);
  const [pullupDevices, setPullupDevices] = useState<number>(4);
  const [tariffMins, setTariffMins] = useState<number>(76);

  const budget = calculateElectricalBudget({
    resistorOhms,
    activeLcdCount,
    lcdBacklightMa: 25,
    activeLedsCount,
    activeBuzzerCount,
    i2cDevicesWithPullups: pullupDevices,
  });

  const billableMins = Math.max(0, tariffMins - ENGINEERING_CONSTANTS.FREE_PARKING_MINS);
  const billableHours = billableMins === 0 ? 0 : Math.floor((billableMins + 59) / 60);
  const computedFee = calculateParkingFee(tariffMins);
  const isOverstay = tariffMins > ENGINEERING_CONSTANTS.MAX_PARKING_LIMIT_MINS;

  const mcuPct = Math.min(100, Math.round((budget.mcuTotalWorstCaseMa / 200) * 100));
  const pcfPct = Math.min(100, Math.round((budget.pcf8574SinkWorstCaseMa / 80) * 100));
  const npnPct = Math.min(100, Math.round((budget.transistorLoadWorstCaseMa / 600) * 100));
  const usbPct = Math.min(100, Math.round((budget.usbTotalWorstCaseMa / 500) * 100));

  return (
    <div className="h-full flex flex-col gap-3 min-h-0">
      {/* Dense Header & Sub-Tab Switcher */}
      <div className="bg-white border border-[#DADCE0] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <Calculator className="w-4 h-4 text-[#1A73E8] shrink-0" />
          <div className="min-w-0">
            <h2 className="text-[15px] font-normal text-[#202124] leading-tight truncate">
              Recalculated Electrical Budgets, LaTeX Proofs &amp; Stationary FSM Math
            </h2>
            <p className="text-[11px] font-light text-[#5F6368] truncate">
              Interactive ATmega328P §29.1 current verifier · Parallel I2C pull-ups · 5.0 s FSM &amp; Grace-First Ceiling Tariff
            </p>
          </div>
        </div>

        <div role="tablist" className="inline-flex border border-[#DADCE0] bg-[#F4F6F9]">
          {(
            [
              ['electrical', 'Electrical & I2C Proofs', Calculator],
              ['fsm-tariff', '5s FSM, TDM & Tariff', GitBranch],
              ['assumptions', 'Assumptions & Conflicts', Scale],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={subTab === key}
              onClick={() => setSubTab(key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs whitespace-nowrap cursor-pointer ${
                subTab === key
                  ? 'bg-white text-[#1A73E8] font-medium border-b-2 border-[#1A73E8]'
                  : 'text-[#5F6368] hover:text-[#202124]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Tab 1: Electrical Lab + Inter LaTeX Proofs */}
      {subTab === 'electrical' && (
        <div className="flex-1 min-h-0 overflow-y-auto dash-scroll grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch pr-0.5">
          <div className="lg:col-span-5 bg-white border border-[#DADCE0] p-4 flex flex-col justify-between gap-4">
            <div className="space-y-3.5">
              <h3 className="text-xs font-medium text-[#202124] border-b border-[#E8EAED] pb-2">
                Interactive Circuit Budget Lab
              </h3>

              <div className="space-y-1">
                <span className="text-xs text-[#202124] block">
                  LED Current-Limiting Resistor (<span className="latex-math">R</span>)
                </span>
                <div className="grid grid-cols-3 gap-1 bg-[#F4F6F9] p-1 border border-[#DADCE0]">
                  {[220, 330, 470].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setResistorOhms(r)}
                      className={`py-1.5 text-xs font-mono cursor-pointer ${
                        resistorOhms === r
                          ? 'bg-[#1A73E8] text-white font-medium'
                          : 'text-[#5F6368] hover:bg-white'
                      }`}
                    >
                      {r} Ω{r === 330 ? ' ★' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label htmlFor="lcd-count-slider" className="text-[#202124]">
                    Backlit 16×2 I2C LCDs on 5V Rail
                  </label>
                  <span className="font-mono tabular-nums font-medium text-[#1A73E8]">
                    {activeLcdCount} LCD ({activeLcdCount * 25} mA typ)
                  </span>
                </div>
                <input
                  id="lcd-count-slider"
                  type="range"
                  min={1}
                  max={3}
                  step={1}
                  value={activeLcdCount}
                  onChange={(e) => setActiveLcdCount(Number(e.target.value))}
                  className="m3-slider w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label htmlFor="leds-count-slider" className="text-[#202124]">
                    Simultaneous Active LEDs (Normal = 3, Test = 9)
                  </label>
                  <span className="font-mono tabular-nums font-medium text-[#1A73E8]">
                    {activeLedsCount} / 9 LEDs
                  </span>
                </div>
                <input
                  id="leds-count-slider"
                  type="range"
                  min={0}
                  max={9}
                  step={1}
                  value={activeLedsCount}
                  onChange={(e) => setActiveLedsCount(Number(e.target.value))}
                  className="m3-slider w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label htmlFor="pullup-slider" className="text-[#202124]">
                    I2C Modules w/ 4.7 kΩ Pull-Ups (3× LCD + 0x24)
                  </label>
                  <span className="font-mono tabular-nums font-medium text-[#1A73E8]">
                    {pullupDevices} → {budget.parallelI2cPullupKOhm} kΩ
                  </span>
                </div>
                <input
                  id="pullup-slider"
                  type="range"
                  min={1}
                  max={4}
                  step={1}
                  value={pullupDevices}
                  onChange={(e) => setPullupDevices(Number(e.target.value))}
                  className="m3-slider w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label htmlFor="buzzer-count-slider" className="text-[#202124]">
                    Simultaneous Active Passive Buzzers (0x24 P0–P2)
                  </label>
                  <span className="font-mono tabular-nums font-medium text-[#C5221F]">
                    {activeBuzzerCount} / 3 ({budget.pcf8574SinkTypicalMa} mA sink)
                  </span>
                </div>
                <input
                  id="buzzer-count-slider"
                  type="range"
                  min={0}
                  max={3}
                  step={1}
                  value={activeBuzzerCount}
                  onChange={(e) => setActiveBuzzerCount(Number(e.target.value))}
                  className="m3-slider w-full"
                />
              </div>
            </div>

            <div className="bg-[#F8F9FA] p-3 border border-[#DADCE0] space-y-2 text-xs tabular-nums">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#202124]">ATmega328P MCU (Max 200 mA)</span>
                  <span className={`font-mono font-medium ${budget.mcuWithinSpec ? 'text-[#137333]' : 'text-[#C5221F]'}`}>
                    {budget.mcuTotalWorstCaseMa} mA ({mcuPct}%)
                  </span>
                </div>
                <div className="h-1.5 bg-[#E8EAED] overflow-hidden">
                  <div
                    className={budget.mcuWithinSpec ? 'h-full bg-[#137333]' : 'h-full bg-[#C5221F]'}
                    style={{ width: `${mcuPct}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#202124]">PCF8574 (0x24) Sink (Max 80 mA)</span>
                  <span className={`font-mono font-medium ${budget.pcf8574WithinSpec ? 'text-[#137333]' : 'text-[#C5221F]'}`}>
                    {budget.pcf8574SinkWorstCaseMa} mA ({pcfPct}%)
                  </span>
                </div>
                <div className="h-1.5 bg-[#E8EAED] overflow-hidden">
                  <div
                    className={budget.pcf8574WithinSpec ? 'h-full bg-[#137333]' : 'h-full bg-[#C5221F]'}
                    style={{ width: `${pcfPct}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#202124]">2N2222 Emitter Follower (Max 600 mA)</span>
                  <span className="font-mono font-medium text-[#137333]">
                    {budget.transistorLoadWorstCaseMa} mA ({npnPct}%)
                  </span>
                </div>
                <div className="h-1.5 bg-[#E8EAED] overflow-hidden">
                  <div className="h-full bg-[#137333]" style={{ width: `${Math.max(4, npnPct)}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#202124]">USB 5V Polyfuse (Max 500 mA)</span>
                  <span className={`font-mono font-medium ${budget.usbWithinSpec ? 'text-[#137333]' : 'text-[#C5221F]'}`}>
                    {budget.usbTotalWorstCaseMa} mA ({usbPct}%)
                  </span>
                </div>
                <div className="h-1.5 bg-[#E8EAED] overflow-hidden">
                  <div
                    className={budget.usbWithinSpec ? 'h-full bg-[#1A73E8]' : 'h-full bg-[#C5221F]'}
                    style={{ width: `${usbPct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 pt-1 text-[11px]">
                {budget.mcuWithinSpec && budget.usbWithinSpec && budget.pcf8574WithinSpec ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#137333] shrink-0" />
                    <span className="text-[#137333]">
                      SAFE · Typ USB {budget.usbTotalTypicalMa} mA · Typ MCU {budget.mcuTotalTypicalMa} mA
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-[#C5221F] shrink-0" />
                    <span className="text-[#C5221F]">Exceeds rating — restore R to 330 Ω.</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-[#DADCE0] p-4 space-y-3">
            <h3 className="text-xs font-medium text-[#202124] border-b border-[#E8EAED] pb-2">
              LaTeX-Style Datasheet Proofs (Inter Mathematical Typography · v3.1)
            </h3>

            {[
              {
                num: '(1)',
                title: 'Single-LED Forward Current (Red/Yellow V_F = 2.0 V, Green V_F = 2.2 V)',
                body: (
                  <>
                    <var>I</var><sub>LED,RY</sub> <span className="op">=</span> (5.0 V − 2.0 V) / {resistorOhms} Ω <span className="op">=</span>{' '}
                    <span className="not-italic font-medium text-[#1A73E8]">{budget.ledCurrentRedYellowMa} mA</span>{' '}
                    <span className="text-xs not-italic text-[#5F6368]">(Green: {budget.ledCurrentGreenMa} mA ≪ 20 mA pin limit)</span>
                  </>
                ),
              },
              {
                num: '(2)',
                title: 'ATmega328P V_CC / GND Pin Current (All 9 LEDs + 1.0 mA A3 Base Drive + I2C)',
                body: (
                  <>
                    <var>I</var><sub>MCU,max</sub> <span className="op">=</span> 15.0 + {budget.allNineLedsMa} + 1.0 + {budget.i2cSinkMa} <span className="op">=</span>{' '}
                    <span className="not-italic font-medium text-[#137333]">{budget.mcuTotalWorstCaseMa} mA</span>{' '}
                    <span className="text-xs not-italic text-[#5F6368]">&lt; 200 mA limit (2N2222 offloads 45 mA buzzers!)</span>
                  </>
                ),
              },
              {
                num: '(3)',
                title: `Total USB 5V Bus Load (MCU + 3× HC-SR04 + ${activeLcdCount}× LCD + 2N2222/0x24 3× Buzzers)`,
                body: (
                  <>
                    <var>I</var><sub>USB,max</sub> <span className="op">=</span> {budget.mcuTotalWorstCaseMa} + 45.0 + ({activeLcdCount} × 30.0) + {budget.buzzerSubSystemWorstCaseMa} <span className="op">=</span>{' '}
                    <span className="not-italic font-medium text-[#1A73E8]">{budget.usbTotalWorstCaseMa} mA</span>{' '}
                    <span className="text-xs not-italic text-[#5F6368]">&lt; 500 mA polyfuse (Typ: {budget.usbTotalTypicalMa} mA)</span>
                  </>
                ),
              },
              {
                num: '(4)',
                title: `Parallel I2C Pull-Ups (${pullupDevices}× 4.7 kΩ) & PCF8574 (0x24) 3-Buzzer Sink`,
                body: (
                  <>
                    <var>R</var><sub>eq</sub> <span className="op">=</span> 4.7 kΩ / {pullupDevices} <span className="op">=</span>{' '}
                    <span className="not-italic font-medium text-[#202124]">{budget.parallelI2cPullupKOhm} kΩ</span>
                    <span className="op px-1.5">⇒</span>
                    <var>I</var><sub>I2C</sub> <span className="op">=</span>{' '}
                    <span className="not-italic font-medium text-[#1A73E8]">{budget.i2cSinkMa} mA</span>
                    <span className="op px-1.5">·</span>
                    <var>I</var><sub>PCF,max</sub> <span className="op">=</span>{' '}
                    <span className="not-italic font-medium text-[#137333]">{budget.pcf8574SinkWorstCaseMa}/80 mA</span>
                  </>
                ),
              },
            ].map((eq) => (
              <div key={eq.num} className="bg-[#F8F9FA] border border-[#DADCE0] px-4 py-3">
                <div className="text-[11px] font-light text-[#5F6368] mb-1">{eq.title}</div>
                <div className="flex items-center justify-between gap-4">
                  <div className="latex-math text-sm text-[#202124] tabular-nums">{eq.body}</div>
                  <span className="font-mono text-xs text-[#5F6368] shrink-0">{eq.num}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 2: 5s FSM Diagram + Tariff Verifier */}
      {subTab === 'fsm-tariff' && (
        <div className="flex-1 min-h-0 overflow-y-auto dash-scroll grid grid-cols-1 xl:grid-cols-12 gap-3 items-stretch pr-0.5">
          <figure className="xl:col-span-7 bg-white border border-[#DADCE0] p-4 space-y-3">
            <h3 className="text-xs font-medium text-[#202124]">
              Figure 2 — 5.0-Second Stationary FSM &amp; Staggered 40 ms TDM + 200 ms LCD Schedule
            </h3>
            <div className="overflow-x-auto">
              <svg viewBox="0 0 680 340" className="w-full min-w-[520px] h-auto" role="img" aria-label="4-state stationary occupancy FSM and TDM schedule">
                <rect x="0" y="0" width="680" height="340" fill="#F8FAFC" />
                <defs>
                  <marker id="arrowBlue2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#1A73E8" />
                  </marker>
                  <marker id="arrowGray2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#5F6368" />
                  </marker>
                </defs>

                <rect x="20" y="20" width="190" height="62" fill="#E6F4EA" stroke="#137333" strokeWidth="1.4" />
                <text x="115" y="42" textAnchor="middle" fill="#137333" fontSize="11" fontWeight="500" fontFamily="JetBrains Mono">STATE_AVAILABLE</text>
                <text x="115" y="59" textAnchor="middle" fill="#202124" fontSize="9.5" fontFamily="Inter, sans-serif">Green Solid · LCD: 00:00</text>
                <text x="115" y="72" textAnchor="middle" fill="#5F6368" fontSize="9" fontFamily="Inter, sans-serif">d &gt; 20 cm (Slot Empty)</text>

                <rect x="420" y="20" width="240" height="62" fill="#FEF7E0" stroke="#B06000" strokeWidth="1.5" />
                <text x="540" y="42" textAnchor="middle" fill="#7A4100" fontSize="11" fontWeight="500" fontFamily="JetBrains Mono">STATE_SETTLING</text>
                <text x="540" y="58" textAnchor="middle" fill="#202124" fontSize="9.5" fontFamily="Inter, sans-serif">In slot (≤20 cm) AND |d − anchor| ≤ 1 cm</text>
                <text x="540" y="72" textAnchor="middle" fill="#B06000" fontSize="9" fontWeight="500" fontFamily="Inter, sans-serif">If moved &gt;1 cm → Reset 5.0 s timer</text>

                <rect x="420" y="132" width="240" height="62" fill="#E8F0FE" stroke="#1A73E8" strokeWidth="1.5" />
                <text x="540" y="154" textAnchor="middle" fill="#174EA6" fontSize="11" fontWeight="500" fontFamily="JetBrains Mono">STATE_OCCUPIED</text>
                <text x="540" y="171" textAnchor="middle" fill="#202124" fontSize="9.5" fontFamily="Inter, sans-serif">Count-Up Starts Cleanly at 00:00</text>
                <text x="540" y="184" textAnchor="middle" fill="#C5221F" fontSize="9" fontWeight="500" fontFamily="Inter, sans-serif">&gt;180m → 1800 Hz · Danger → 2500 Hz (0x24)</text>

                <rect x="20" y="132" width="190" height="62" fill="#FCE8E6" stroke="#C5221F" strokeWidth="1.4" />
                <text x="115" y="154" textAnchor="middle" fill="#A50E0E" fontSize="11" fontWeight="500" fontFamily="JetBrains Mono">STATE_EXITING</text>
                <text x="115" y="171" textAnchor="middle" fill="#202124" fontSize="9.5" fontFamily="Inter, sans-serif">Confirming Exit (3.0 s)</text>
                <text x="115" y="184" textAnchor="middle" fill="#5F6368" fontSize="9" fontFamily="Inter, sans-serif">Count-Up Clock Keeps Running</text>

                <line x1="210" y1="38" x2="416" y2="38" stroke="#1A73E8" strokeWidth="1.4" markerEnd="url(#arrowBlue2)" />
                <text x="313" y="32" textAnchor="middle" fill="#1A73E8" fontSize="9.5" fontWeight="500" fontFamily="Inter, sans-serif">d ≤ 20 cm (Car Enters)</text>

                <line x1="420" y1="64" x2="214" y2="64" stroke="#5F6368" strokeWidth="1.2" strokeDasharray="4 3" markerEnd="url(#arrowGray2)" />
                <text x="317" y="76" textAnchor="middle" fill="#5F6368" fontSize="9" fontFamily="Inter, sans-serif">d &gt; 20 cm (Leaves before 5 s)</text>

                <line x1="540" y1="82" x2="540" y2="128" stroke="#1A73E8" strokeWidth="1.6" markerEnd="url(#arrowBlue2)" />
                <text x="530" y="110" textAnchor="end" fill="#174EA6" fontSize="9.5" fontWeight="500" fontFamily="Inter, sans-serif">Stationary ≥ 5.0 s → Start 00:00</text>

                <line x1="420" y1="176" x2="214" y2="176" stroke="#C5221F" strokeWidth="1.4" markerEnd="url(#arrowGray2)" />
                <text x="317" y="190" textAnchor="middle" fill="#A50E0E" fontSize="9" fontFamily="Inter, sans-serif">d &gt; 20 cm (Echo Lost)</text>

                <line x1="210" y1="150" x2="416" y2="150" stroke="#5F6368" strokeWidth="1.2" strokeDasharray="4 3" markerEnd="url(#arrowGray2)" />
                <text x="313" y="144" textAnchor="middle" fill="#5F6368" fontSize="9" fontFamily="Inter, sans-serif">d ≤ 20 cm (Glitch Ignored)</text>

                <line x1="115" y1="132" x2="115" y2="86" stroke="#137333" strokeWidth="1.4" markerEnd="url(#arrowBlue2)" />
                <text x="124" y="112" fill="#137333" fontSize="9" fontWeight="500" fontFamily="Inter, sans-serif">Empty ≥ 3.0 s → Receipt</text>

                <line x1="20" y1="214" x2="660" y2="214" stroke="#DADCE0" strokeWidth="1" />
                <text x="20" y="234" fill="#202124" fontSize="10.5" fontWeight="500" fontFamily="Inter, sans-serif">
                  Cooperative Schedule: 40 ms TDM Ultrasonic Slots + 200 ms Staggered Single-LCD Refresh
                </text>

                <text x="20" y="264" fill="#5F6368" fontSize="9.5" fontFamily="JetBrains Mono">HC-SR04 TDM</text>
                {[
                  { x: 112, label: 'B1 0ms', color: '#E8F0FE', stroke: '#1A73E8' },
                  { x: 174, label: 'B2 40ms', color: '#E6F4EA', stroke: '#137333' },
                  { x: 236, label: 'B3 80ms', color: '#FEF7E0', stroke: '#B06000' },
                  { x: 298, label: 'B1 120ms', color: '#E8F0FE', stroke: '#1A73E8' },
                  { x: 360, label: 'B2 160ms', color: '#E6F4EA', stroke: '#137333' },
                  { x: 422, label: 'B3 200ms', color: '#FEF7E0', stroke: '#B06000' },
                  { x: 484, label: 'B1 240ms', color: '#E8F0FE', stroke: '#1A73E8' },
                  { x: 546, label: 'B2 280ms', color: '#E6F4EA', stroke: '#137333' },
                ].map((slot) => (
                  <g key={slot.label}>
                    <rect x={slot.x} y="248" width="56" height="22" fill={slot.color} stroke={slot.stroke} strokeWidth="1" />
                    <text x={slot.x + 28} y="262" textAnchor="middle" fill="#202124" fontSize="8.5" fontFamily="JetBrains Mono">{slot.label}</text>
                  </g>
                ))}

                <text x="20" y="302" fill="#5F6368" fontSize="9.5" fontFamily="JetBrains Mono">3× I2C LCDs</text>
                {[
                  { x: 112, w: 120, label: 'LCD1 (0x27) @ 0ms' },
                  { x: 360, w: 120, label: 'LCD2 (0x26) @ 200ms' },
                  { x: 546, w: 114, label: 'LCD3 (0x25) @ 400ms' },
                ].map((lcdSlot) => (
                  <g key={lcdSlot.label}>
                    <rect x={lcdSlot.x} y="286" width={lcdSlot.w} height="22" fill="#E8F0FE" stroke="#1A73E8" strokeWidth="1.1" />
                    <text x={lcdSlot.x + lcdSlot.w / 2} y="300" textAnchor="middle" fill="#174EA6" fontSize="8.5" fontFamily="JetBrains Mono" fontWeight="500">
                      {lcdSlot.label}
                    </text>
                  </g>
                ))}
                <text x="20" y="328" fill="#5F6368" fontSize="9" fontFamily="Inter, sans-serif">
                  Zero lcd.clear() + displayKey dirty diffing keeps each I2C refresh ≤ 18 ms (0 ms when unchanged).
                </text>
              </svg>
            </div>
          </figure>

          <div className="xl:col-span-5 bg-white border border-[#DADCE0] p-4 flex flex-col justify-between gap-3">
            <div className="space-y-3.5">
              <div className="border-b border-[#E8EAED] pb-2">
                <h3 className="text-xs font-medium text-[#202124]">
                  Interactive Grace-First Tariff &amp; Overstay Verifier
                </h3>
                <p className="text-[11px] font-light text-[#5F6368] mt-0.5">
                  Verify exact integer ceiling division boundaries and &gt;180 min per-bay passive buzzer trigger (1800 Hz on 0x24).
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label htmlFor="tariff-slider" className="text-[#202124]">
                    Count-Up Duration (<span className="latex-math">T</span>)
                  </label>
                  <span className="font-mono tabular-nums font-medium text-[#1A73E8]">
                    {tariffMins} sim min ({Math.floor(tariffMins / 60)}h {tariffMins % 60}m)
                  </span>
                </div>
                <input
                  id="tariff-slider"
                  type="range"
                  min={0}
                  max={240}
                  step={1}
                  value={tariffMins}
                  onChange={(e) => setTariffMins(Number(e.target.value))}
                  className="m3-slider w-full"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {[15, 16, 75, 76, 180, 181].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTariffMins(preset)}
                      className={`px-2.5 py-1 font-mono text-[11px] border cursor-pointer ${
                        tariffMins === preset
                          ? 'bg-[#1A73E8] border-[#1A73E8] text-white font-medium'
                          : 'bg-[#F4F6F9] border-[#DADCE0] text-[#202124] hover:bg-[#E8F0FE]'
                      }`}
                    >
                      {preset}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 bg-[#F8F9FA] border border-[#DADCE0] p-3 text-xs tabular-nums">
                <div className="flex items-center justify-between">
                  <span className="font-light text-[#5F6368]">1. Free Grace Check (T ≤ 15 m)</span>
                  <span className="font-mono font-medium text-[#202124]">
                    {tariffMins <= 15 ? 'WITHIN GRACE' : 'EXCEEDS GRACE'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-[#E8EAED] pt-2">
                  <span className="font-light text-[#5F6368]">2. Subtract Grace First</span>
                  <span className="font-mono text-[#202124]">max(0, {tariffMins} − 15) = {billableMins} m</span>
                </div>
                <div className="flex items-center justify-between border-t border-[#E8EAED] pt-2">
                  <span className="font-light text-[#5F6368]">3. Integer Ceiling Division</span>
                  <span className="font-mono text-[#202124]">({billableMins} + 59) / 60 = {billableHours} hr</span>
                </div>
                <div className="flex items-center justify-between border-t border-[#E8EAED] pt-2">
                  <span className="font-light text-[#5F6368]">4. Payable Fee (RM 3.00/hr)</span>
                  <span className="font-mono text-sm font-medium text-[#1A73E8]">RM {computedFee.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div
              className={`px-3.5 py-2.5 border text-xs flex items-center justify-between ${
                isOverstay
                  ? 'bg-[#FCE8E6] border-[#C5221F] text-[#A50E0E]'
                  : 'bg-[#E6F4EA] border-[#137333] text-[#137333]'
              }`}
            >
              <span className="font-medium">
                {isOverstay ? 'OVERSTAY EXCEEDED (> 180 m)' : 'WITHIN 3-HOUR LIMIT'}
              </span>
              <span className="font-mono">
                {isOverstay ? 'Bay Buzzer (0x24): ON 1800 Hz' : 'Bay Buzzer (0x24): SILENT'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Assumptions & Conflicting Requirements */}
      {subTab === 'assumptions' && (
        <div className="flex-1 min-h-0 overflow-y-auto dash-scroll space-y-3 pr-0.5">
          <div className="bg-white border border-[#DADCE0] p-4 space-y-2.5">
            <h3 className="text-xs font-medium text-[#202124]">
              Table 2 — Updated Engineering Assumptions &amp; Justifications (Requirement 10)
            </h3>
            <div className="overflow-x-auto">
              <table className="booktabs-table text-left text-xs">
                <thead>
                  <tr className="text-[#202124]">
                    <th className="py-2 pr-4 font-medium">Parameter</th>
                    <th className="py-2 pr-4 font-medium">Assumed Value (v3.1)</th>
                    <th className="py-2 font-medium">Engineering Justification</th>
                  </tr>
                </thead>
                <tbody>
                  {ENGINEERING_ASSUMPTIONS.map((item) => (
                    <tr key={item.parameter} className="align-top">
                      <td className="py-2.5 pr-4 font-medium text-[#202124] whitespace-nowrap">
                        {item.parameter}
                        {item.changed && (
                          <span className="block text-[10px] font-mono text-[#1A73E8]">Updated v3.1</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-[#202124] min-w-[200px]">{item.newValue}</td>
                      <td className="py-2.5 font-light text-[#5F6368] leading-relaxed">{item.justification}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-[#DADCE0] p-4 space-y-2.5">
            <h3 className="text-xs font-medium text-[#202124]">
              Table 3 — Conflicting Stakeholder Requirements &amp; Resolutions (Rubric WP2)
            </h3>
            <div className="overflow-x-auto">
              <table className="booktabs-table text-left text-xs">
                <thead>
                  <tr className="text-[#202124]">
                    <th className="py-2 pr-4 font-medium">Stakeholder Conflict</th>
                    <th className="py-2 pr-4 font-medium">Physical / MCU Bottleneck</th>
                    <th className="py-2 font-medium">Engineering Resolution (v3.0)</th>
                  </tr>
                </thead>
                <tbody>
                  {CONFLICTING_REQUIREMENTS.map((row) => (
                    <tr key={row.id} className="align-top">
                      <td className="py-2.5 pr-4 font-medium text-[#202124] min-w-[190px]">{row.conflict}</td>
                      <td className="py-2.5 pr-4 font-light text-[#5F6368] leading-relaxed min-w-[210px]">{row.bottleneck}</td>
                      <td className="py-2.5 text-[#174EA6] leading-relaxed">{row.resolution}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
