import React, { useState } from 'react';
import {
  AlertTriangle,
  Cable,
  CheckCircle2,
  CheckSquare,
  Clock,
  Compass,
  ShieldCheck,
  Square,
  Terminal,
} from 'lucide-react';
import {
  CIRCUIT_WIRING_GUIDE,
  MASTER_PLAN_PHASES,
  MASTER_PLAN_STEPS,
  PRE_POWER_SMOKE_TEST,
  type CircuitWireConnection,
} from '../data/masterPlanData';

type MasterPlanView = 'phases' | 'circuit-wiring';
type WireSubsystemFilter = 'All' | CircuitWireConnection['subsystem'];

const SUBSYSTEM_FILTERS: WireSubsystemFilter[] = [
  'All',
  'Power & Rails',
  'Ultrasonic Sensors',
  '9 LEDs & 330 Ω',
  '3× I2C LCDs',
  '3× Passive Buzzers',
];

export const MasterPlanTab: React.FC = () => {
  const [viewMode, setViewMode] = useState<MasterPlanView>('phases');
  const [activePhaseId, setActivePhaseId] = useState<string>(MASTER_PLAN_PHASES[0].id);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [wiredConnections, setWiredConnections] = useState<Record<string, boolean>>({});
  const [smokeChecks, setSmokeChecks] = useState<Record<number, boolean>>({});
  const [wireFilter, setWireFilter] = useState<WireSubsystemFilter>('All');

  const toggleStep = (id: string) =>
    setCompletedSteps((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleWire = (wireNo: string) =>
    setWiredConnections((prev) => ({ ...prev, [wireNo]: !prev[wireNo] }));

  const toggleSmokeCheck = (idx: number) =>
    setSmokeChecks((prev) => ({ ...prev, [idx]: !prev[idx] }));

  const totalSteps = MASTER_PLAN_STEPS.length;
  const doneCount = MASTER_PLAN_STEPS.filter((s) => completedSteps[s.id]).length;
  const progressPct = Math.round((doneCount / totalSteps) * 100);
  const remainingMin = MASTER_PLAN_STEPS.filter((s) => !completedSteps[s.id]).reduce(
    (acc, s) => acc + s.durationMin,
    0,
  );
  const remainingHrs = (remainingMin / 60).toFixed(1);

  const wiredCount = CIRCUIT_WIRING_GUIDE.filter((w) => wiredConnections[w.wireNo]).length;
  const smokePassedCount = PRE_POWER_SMOKE_TEST.filter((_, idx) => smokeChecks[idx]).length;

  const activePhase =
    MASTER_PLAN_PHASES.find((p) => p.id === activePhaseId) ?? MASTER_PLAN_PHASES[0];
  const phaseSteps = MASTER_PLAN_STEPS.filter((s) => s.phaseId === activePhase.id);

  const visibleWires =
    wireFilter === 'All'
      ? CIRCUIT_WIRING_GUIDE
      : CIRCUIT_WIRING_GUIDE.filter((w) => w.subsystem === wireFilter);

  return (
    <div className="h-full flex flex-col gap-3 min-h-0">
      {/* Top Dense Progress Bar & Mode Switcher */}
      <div className="bg-white border border-[#DADCE0] px-3.5 sm:px-4 py-3 shrink-0 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <Compass className="w-4 h-4 text-[#1A73E8] shrink-0" />
            <div className="min-w-0">
              <h2 className="text-sm sm:text-[15px] font-normal text-[#202124] leading-tight truncate">
                Absolute-Beginner Master Plan &amp; Exact Circuit Assembly
              </h2>
              <p className="text-[11px] font-light text-[#5F6368] truncate">
                6 build phases ({totalSteps} steps) + wire-by-wire 20-pin breadboard guide &amp; smoke test
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div role="tablist" aria-label="Master plan views" className="inline-flex border border-[#DADCE0] bg-[#F4F6F9] max-w-full overflow-x-auto">
              <button
                type="button"
                role="tab"
                data-testid="master-plan-tab-phases"
                aria-selected={viewMode === 'phases'}
                onClick={() => setViewMode('phases')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs whitespace-nowrap cursor-pointer ${
                  viewMode === 'phases'
                    ? 'bg-white text-[#1A73E8] font-medium border-b-2 border-[#1A73E8]'
                    : 'text-[#5F6368] hover:text-[#202124]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                Build Steps ({doneCount}/{totalSteps})
              </button>
              <button
                type="button"
                role="tab"
                data-testid="master-plan-tab-wiring"
                aria-selected={viewMode === 'circuit-wiring'}
                onClick={() => setViewMode('circuit-wiring')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs whitespace-nowrap cursor-pointer ${
                  viewMode === 'circuit-wiring'
                    ? 'bg-white text-[#1A73E8] font-medium border-b-2 border-[#1A73E8]'
                    : 'text-[#5F6368] hover:text-[#202124]'
                }`}
              >
                <Cable className="w-3.5 h-3.5" />
                Exact Circuit Assembly ({wiredCount}/{CIRCUIT_WIRING_GUIDE.length})
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'phases' && (
          <>
            <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-[#5F6368]">
              <span>
                Overall Progress: <span className="text-[#1A73E8] font-medium">{doneCount}/{totalSteps}</span> ({progressPct}%)
              </span>
              <span>
                Est. Time Left: <span className="text-[#202124]">{remainingHrs} hrs</span>
              </span>
            </div>

            <div className="h-1.5 bg-[#E8EAED] w-full overflow-hidden">
              <div
                className="h-full bg-[#1A73E8] transition-all duration-200"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* 6 Phase Tabs */}
            <div
              role="tablist"
              aria-label="Master Plan Phases"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 pt-0.5"
            >
              {MASTER_PLAN_PHASES.map((phase) => {
                const pSteps = MASTER_PLAN_STEPS.filter((s) => s.phaseId === phase.id);
                const pDone = pSteps.filter((s) => completedSteps[s.id]).length;
                const isSelected = phase.id === activePhase.id;
                return (
                  <button
                    key={phase.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActivePhaseId(phase.id)}
                    className={`text-left px-2.5 py-1.5 border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#E8F0FE] border-[#1A73E8] text-[#174EA6]'
                        : 'bg-[#F8F9FA] border-[#DADCE0] text-[#3C4043] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className={isSelected ? 'text-[#1A73E8] font-medium' : 'text-[#5F6368]'}>
                        PHASE {phase.phaseNumber}
                      </span>
                      <span className="text-[#5F6368]">
                        {pDone}/{pSteps.length}
                      </span>
                    </div>
                    <div className="text-[11px] font-normal text-[#202124] mt-0.5 truncate">
                      {phase.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* VIEW 1: 6-Phase Beginner Step Plan */}
      {viewMode === 'phases' && (
        <div className="flex-1 min-h-0 overflow-y-auto dash-scroll space-y-3 pr-0.5 pb-2">
          <div className="bg-[#F8F9FA] border border-[#DADCE0] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-mono text-[11px] text-[#1A73E8] uppercase">
                Phase {activePhase.phaseNumber} · {activePhase.estimatedHours}
              </span>
              <h3 className="text-sm font-medium text-[#202124]">
                {activePhase.title}
              </h3>
              <p className="text-xs font-light text-[#5F6368]">{activePhase.subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {activePhase.phaseNumber === 4 && (
                <button
                  type="button"
                  onClick={() => setViewMode('circuit-wiring')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-[#1A73E8] text-white hover:bg-[#1557B0] cursor-pointer"
                >
                  <Cable className="w-3.5 h-3.5" />
                  Open Wire-by-Wire Table
                </button>
              )}
              <div className="bg-white border border-[#DADCE0] px-3 py-1.5 text-xs font-light text-[#137333] flex items-center gap-1.5 max-w-md">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Milestone: {activePhase.milestone}</span>
              </div>
            </div>
          </div>

          {/* Concrete Beginner Step Cards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {phaseSteps.map((step) => {
              const done = Boolean(completedSteps[step.id]);
              return (
                <article
                  key={step.id}
                  className={`bg-white border p-4 flex flex-col justify-between gap-3 transition-colors ${
                    done ? 'border-[#137333]/60 bg-[#E6F4EA]/20' : 'border-[#DADCE0]'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => toggleStep(step.id)}
                        className="flex items-start gap-2.5 text-left cursor-pointer group"
                      >
                        {done ? (
                          <CheckSquare className="w-4 h-4 text-[#137333] mt-0.5 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-[#80868B] group-hover:text-[#1A73E8] mt-0.5 shrink-0" />
                        )}
                        <div>
                          <div className="flex items-center gap-2 text-[10.5px] font-mono text-[#5F6368]">
                            <span className="text-[#1A73E8] font-medium">
                              STEP {String(step.stepNumber).padStart(2, '0')}
                            </span>
                            <span>·</span>
                            <span>{step.difficulty}</span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              {step.durationMin}m
                            </span>
                          </div>
                          <h4
                            className={`text-sm font-medium mt-0.5 ${
                              done ? 'line-through text-[#5F6368]' : 'text-[#202124]'
                            }`}
                          >
                            {step.title}
                          </h4>
                        </div>
                      </button>
                    </div>

                    <p className="text-xs font-light text-[#5F6368] leading-relaxed">
                      <span className="font-medium text-[#202124]">Goal: </span>
                      {step.goal}
                    </p>

                    <ol className="space-y-1.5 text-xs font-light text-[#202124] leading-relaxed list-decimal list-inside pl-0.5">
                      {step.actions.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ol>

                    {step.snippet && (
                      <div className="border border-[#DADCE0] bg-[#161B22] text-[#E6EDF3]">
                        <div className="px-2.5 py-1 border-b border-[#30363D] flex items-center gap-1.5 text-[10px] font-mono text-[#8B949E]">
                          <Terminal className="w-3 h-3" />
                          {step.snippetLabel ?? 'Verification Snippet'}
                        </div>
                        <pre className="p-2.5 font-mono text-[11px] leading-snug overflow-x-auto">
                          {step.snippet}
                        </pre>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[#E8EAED] text-[11.5px]">
                    <div className="flex items-start gap-1.5 text-[#137333]">
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span className="font-light">
                        <span className="font-medium">Expected: </span>
                        {step.expectedOutput}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5 text-[#B06000]">
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span className="font-light">
                        <span className="font-medium">Rookie Trap: </span>
                        {step.rookieMistake}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: Exact Wire-by-Wire Circuit Assembly Guide */}
      {viewMode === 'circuit-wiring' && (
        <div className="flex-1 min-h-0 overflow-y-auto dash-scroll space-y-3 pr-0.5 pb-2">
          {/* Polarity & Breadboard Quick-Reference Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="bg-white border border-[#DADCE0] border-l-[3px] border-l-[#C5221F] p-3">
              <div className="text-[10.5px] font-mono text-[#C5221F] uppercase">1. Unplug USB First</div>
              <p className="text-xs font-light text-[#3C4043] mt-1">
                Never wire breadboard jumpers while Arduino is powered. Check rails before plugging in.
              </p>
            </div>
            <div className="bg-white border border-[#DADCE0] border-l-[3px] border-l-[#B06000] p-3">
              <div className="text-[10.5px] font-mono text-[#B06000] uppercase">2. LED + 330 Ω Polarity</div>
              <p className="text-xs font-light text-[#3C4043] mt-1">
                Long leg (+) → Arduino Pin. Short flat-edge leg (−) → 330 Ω resistor → Blue GND rail.
              </p>
            </div>
            <div className="bg-white border border-[#DADCE0] border-l-[3px] border-l-[#1A73E8] p-3">
              <div className="text-[10.5px] font-mono text-[#1A73E8] uppercase">3. 4-Device I2C Hub</div>
              <p className="text-xs font-light text-[#3C4043] mt-1">
                Row 55 = SDA (A4), Row 56 = SCL (A5). Plug 3 LCDs (0x27–0x25) + PCF8574 (0x24) in parallel.
              </p>
            </div>
            <div className="bg-white border border-[#DADCE0] border-l-[3px] border-l-[#137333] p-3">
              <div className="text-[10.5px] font-mono text-[#137333] uppercase">4. 2N2222 &amp; 3 Buzzers</div>
              <p className="text-xs font-light text-[#3C4043] mt-1">
                A3→1kΩ→2N2222 Base; Emitter→Row 50 (TONE_BUS)→all 3 buzzers (+); (−)→0x24 P0/P1/P2.
              </p>
            </div>
          </div>

          {/* Interactive Wire-by-Wire Assembly Table */}
          <div className="bg-white border border-[#DADCE0] p-3.5 sm:p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-medium text-[#202124]">
                  Exact Wire-by-Wire Circuit Assembly Checklist ({wiredCount}/{CIRCUIT_WIRING_GUIDE.length} Wired)
                </h3>
                <p className="text-[11px] font-light text-[#5F6368] mt-0.5">
                  Plug each wire from P1 through B4 in order and tick the checkbox as you go.
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {SUBSYSTEM_FILTERS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setWireFilter(cat)}
                    className={`px-2 py-1 text-[11px] border cursor-pointer ${
                      wireFilter === cat
                        ? 'bg-[#1A73E8] border-[#1A73E8] text-white font-medium'
                        : 'bg-[#F4F6F9] border-[#DADCE0] text-[#5F6368] hover:text-[#202124]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="booktabs-table text-left text-xs">
                <thead>
                  <tr className="text-[#202124]">
                    <th className="py-2 pr-2 w-8 font-medium">Done</th>
                    <th className="py-2 pr-3 font-medium">Wire</th>
                    <th className="py-2 pr-3 font-medium">Subsystem</th>
                    <th className="py-2 pr-4 font-medium">From (Source)</th>
                    <th className="py-2 pr-4 font-medium">To (Exact Pin / Rail)</th>
                    <th className="py-2 pr-3 font-medium">Cable</th>
                    <th className="py-2 font-medium">Beginner Placement Note</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleWires.map((w) => {
                    const checked = Boolean(wiredConnections[w.wireNo]);
                    return (
                      <tr
                        key={w.wireNo}
                        className={`align-top ${checked ? 'bg-[#E6F4EA]/35' : 'hover:bg-[#F8F9FA]'}`}
                      >
                        <td className="py-2.5 pr-2">
                          <button
                            type="button"
                            onClick={() => toggleWire(w.wireNo)}
                            aria-label={`Mark wire ${w.wireNo} connected`}
                            aria-pressed={checked}
                            className="cursor-pointer"
                          >
                            {checked ? (
                              <CheckSquare className="w-4 h-4 text-[#137333]" />
                            ) : (
                              <Square className="w-4 h-4 text-[#9AA0A6]" />
                            )}
                          </button>
                        </td>
                        <td className="py-2.5 pr-3 font-mono font-medium text-[#1A73E8] whitespace-nowrap">
                          {w.wireNo}
                        </td>
                        <td className="py-2.5 pr-3 whitespace-nowrap text-[11px] font-mono text-[#5F6368]">
                          {w.subsystem}
                        </td>
                        <td className="py-2.5 pr-4 font-medium text-[#202124] min-w-[155px]">
                          {w.fromPoint}
                        </td>
                        <td className="py-2.5 pr-4 font-mono text-[11px] text-[#174EA6] min-w-[190px]">
                          {w.toPoint}
                        </td>
                        <td className="py-2.5 pr-3 whitespace-nowrap text-[11px] font-light text-[#5F6368]">
                          {w.wireColor}
                        </td>
                        <td className="py-2.5 font-light text-[#3C4043] leading-relaxed min-w-[200px]">
                          {w.beginnerNote}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5-Point Pre-Power Smoke Test */}
          <div className="bg-white border border-[#DADCE0] border-l-[3px] border-l-[#137333] p-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#137333]" />
                <h3 className="text-xs font-medium text-[#202124]">
                  6-Point Pre-Power Smoke Test — Complete BEFORE Plugging USB Cable
                </h3>
              </div>
              <span className="font-mono text-xs text-[#137333] font-medium">
                {smokePassedCount} / {PRE_POWER_SMOKE_TEST.length} Verified Safe
              </span>
            </div>

            <div className="space-y-1.5">
              {PRE_POWER_SMOKE_TEST.map((checkText, idx) => {
                const ok = Boolean(smokeChecks[idx]);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleSmokeCheck(idx)}
                    className={`w-full text-left px-3 py-2 border flex items-start gap-2.5 text-xs transition-colors cursor-pointer ${
                      ok
                        ? 'bg-[#E6F4EA]/50 border-[#137333]/50 text-[#137333]'
                        : 'bg-[#F8F9FA] border-[#DADCE0] text-[#202124] hover:bg-white'
                    }`}
                  >
                    {ok ? (
                      <CheckSquare className="w-4 h-4 text-[#137333] shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-[#80868B] shrink-0 mt-0.5" />
                    )}
                    <span className="font-light leading-relaxed">
                      <span className="font-mono font-medium mr-1.5">CHECK {idx + 1}:</span>
                      {checkText}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
