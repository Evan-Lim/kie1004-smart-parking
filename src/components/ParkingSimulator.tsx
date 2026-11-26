import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Zap,
  Terminal,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2,
  MoveHorizontal,
  FastForward,
} from 'lucide-react';
import {
  ENGINEERING_CONSTANTS,
  ParkingBayState,
  ExitReceipt,
  EepromRecord,
  createInitialBay,
  stepParkingBay,
  computeBayLeds,
  computeBuzzerBus,
  formatBayLcdLines,
  serializeEeprom,
  restoreFromEeprom,
} from '../lib/parkingEngine';

interface ConsoleEntry {
  id: string;
  timeLabel: string;
  text: string;
  kind: 'info' | 'alarm' | 'receipt' | 'cmd';
}

export const ParkingSimulator: React.FC = () => {
  const [bays, setBays] = useState<ParkingBayState[]>(() => [
    createInitialBay(0),
    createInitialBay(1),
    createInitialBay(2),
  ]);
  const [targetDistances, setTargetDistances] = useState<number[]>([32, 32, 32]);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [timeScaleFactor, setTimeScaleFactor] = useState<number>(60);
  const [injectJitter, setInjectJitter] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [simMs, setSimMs] = useState<number>(0);
  const [receipts, setReceipts] = useState<ExitReceipt[]>([]);
  const [serialInput, setSerialInput] = useState<string>('');
  const [consoleLogs, setConsoleLogs] = useState<ConsoleEntry[]>([
    {
      id: 'boot-1',
      timeLabel: '00:00',
      text: 'KIE1004 SMART PARKING v3.1 | 3x LCD (0x27–0x25) + 3x Passive Buzzers (A3→2N2222 + PCF8574 0x24)',
      kind: 'info',
    },
    {
      id: 'boot-2',
      timeLabel: '00:00',
      text: 'Ready. Danger (2–5 cm) fires 2500 Hz rapid; Overstay (>180m) fires 1800 Hz pulse; Mixed = 2000 Hz.',
      kind: 'info',
    },
  ]);

  const eepromRef = useRef<EepromRecord>(serializeEeprom(bays));
  const targetDistancesRef = useRef<number[]>(targetDistances);
  const injectJitterRef = useRef<boolean>(injectJitter);
  const timeScaleRef = useRef<number>(timeScaleFactor);
  const simMsRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastBeepStateRef = useRef<boolean>(false);

  targetDistancesRef.current = targetDistances;
  injectJitterRef.current = injectJitter;
  timeScaleRef.current = timeScaleFactor;

  const formatClock = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const pushLog = (text: string, kind: ConsoleEntry['kind'] = 'info') => {
    setConsoleLogs((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timeLabel: formatClock(simMsRef.current),
        text,
        kind,
      },
      ...prev.slice(0, 29),
    ]);
  };

  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => {
      const nextNowMs = simMsRef.current + 100;
      simMsRef.current = nextNowMs;
      setSimMs(nextNowMs);

      setBays((prevBays) => {
        let anyEepromDirty = false;
        const newLogs: { text: string; kind: ConsoleEntry['kind'] }[] = [];
        const newReceipts: ExitReceipt[] = [];

        const updated = prevBays.map((bay, idx) => {
          const baseDist = targetDistancesRef.current[idx];
          const jitterOffset =
            injectJitterRef.current && baseDist <= 20
              ? ((Math.floor(nextNowMs / 200) + idx) % 3) - 1
              : 0;
          const noisyDist = Math.max(2, baseDist + jitterOffset);
          const res = stepParkingBay(bay, noisyDist, nextNowMs, timeScaleRef.current);

          if (res.eepromDirty) anyEepromDirty = true;
          if (res.eventLog) {
            newLogs.push({
              text: res.eventLog,
              kind: res.eventLog.startsWith('[ALARM]')
                ? 'alarm'
                : res.eventLog.startsWith('[RECEIPT]')
                  ? 'receipt'
                  : 'info',
            });
          }
          if (res.receipt) newReceipts.push(res.receipt);
          return res.bay;
        });

        if (anyEepromDirty) eepromRef.current = serializeEeprom(updated);
        if (newLogs.length > 0) {
          setConsoleLogs((prev) => [
            ...newLogs.map((l) => ({
              id: `${nextNowMs}-${Math.random().toString(36).slice(2, 6)}`,
              timeLabel: formatClock(nextNowMs),
              text: l.text,
              kind: l.kind,
            })),
            ...prev.slice(0, 29),
          ]);
        }
        if (newReceipts.length > 0) {
          setReceipts((prev) => [...newReceipts, ...prev.slice(0, 5)]);
        }
        return updated;
      });
    }, 100);

    return () => window.clearInterval(interval);
  }, [isRunning]);

  const buzzerBus = computeBuzzerBus(bays, simMs);

  useEffect(() => {
    if (!audioEnabled) {
      lastBeepStateRef.current = false;
      return;
    }
    const shouldSound = buzzerBus.anySoundingNow && buzzerBus.carrierFreqHz > 0;
    if (shouldSound && !lastBeepStateRef.current) {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!audioCtxRef.current && AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx) {
          if (ctx.state === 'suspended') ctx.resume().catch(() => {});
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.value = buzzerBus.carrierFreqHz;
          gain.gain.value = 0.04;
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.14);
        }
      } catch {
        // Ignore headless audio restrictions
      }
    }
    lastBeepStateRef.current = shouldSound;
  }, [audioEnabled, buzzerBus.anySoundingNow, buzzerBus.carrierFreqHz, buzzerBus.byteMask]);

  const setBayDistance = (bayIdx: number, distCm: number) => {
    setTargetDistances((prev) => {
      const copy = [...prev];
      copy[bayIdx] = distCm;
      return copy;
    });
  };

  const nudgeBayCar = (bayIdx: number) => {
    setTargetDistances((prev) => {
      const copy = [...prev];
      const current = copy[bayIdx];
      copy[bayIdx] = current <= 12 ? Math.min(18, current + 4) : Math.max(4, current - 4);
      return copy;
    });
  };

  const fastForwardBay = (bayIdx: number, addRealSeconds: number) => {
    setBays((prev) =>
      prev.map((b, idx) => {
        if (idx !== bayIdx) return b;
        if (b.state === 'PARKING_SETTLE') {
          return {
            ...b,
            stationaryStartMs: simMsRef.current - ENGINEERING_CONSTANTS.STATIONARY_CONFIRM_MS,
            stationaryHeldMs: ENGINEERING_CONSTANTS.STATIONARY_CONFIRM_MS,
          };
        }
        if (b.state === 'OCCUPIED' || b.state === 'EXITING_DEBOUNCE') {
          return {
            ...b,
            priorElapsedRealSec: b.priorElapsedRealSec + addRealSeconds,
          };
        }
        return b;
      }),
    );
    pushLog(
      `[TEST] Fast-forwarded Bay ${bayIdx + 1} by +${addRealSeconds}s (${Math.round((addRealSeconds * timeScaleFactor) / 60)} sim min).`,
      'cmd',
    );
  };

  const completeSettleNow = (bayIdx: number) => {
    setBays((prev) =>
      prev.map((b, idx) => {
        if (idx !== bayIdx || b.state !== 'PARKING_SETTLE') return b;
        return {
          ...b,
          stationaryStartMs: simMsRef.current - ENGINEERING_CONSTANTS.STATIONARY_CONFIRM_MS,
          stationaryHeldMs: ENGINEERING_CONSTANTS.STATIONARY_CONFIRM_MS,
        };
      }),
    );
  };

  const simulatePowerCycle = () => {
    const saved = serializeEeprom(bays);
    eepromRef.current = saved;
    const restored = restoreFromEeprom(saved, simMsRef.current, timeScaleFactor);
    setBays(restored);
    setTargetDistances(restored.map((b) => (b.state === 'OCCUPIED' ? 14 : 32)));
    const activeCount = restored.filter((b) => b.state === 'OCCUPIED').length;
    pushLog(
      `[REBOOT] Power cycle verified; restored ${activeCount} occupied bay(s) seamlessly.`,
      'cmd',
    );
  };

  const resetAllBays = () => {
    const fresh = [createInitialBay(0), createInitialBay(1), createInitialBay(2)];
    setBays(fresh);
    setTargetDistances([32, 32, 32]);
    eepromRef.current = serializeEeprom(fresh);
    pushLog('[CMD] All 3 bays reset to AVAILABLE.', 'cmd');
  };

  const executeSerialCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim().toUpperCase();
    if (!cmd) return;

    if (cmd === 'S') {
      const summary = bays
        .map(
          (b) =>
            `B${b.id + 1}(${b.lcdAddress}): ${b.filteredDistCm > 20 ? 'OPEN' : b.filteredDistCm + 'cm'} ${b.state} ${b.elapsedSimMins}m RM${b.accruedFeeRM.toFixed(0)}`,
        )
        .join(' | ');
      pushLog(`[STATUS] ${summary}`, 'cmd');
    } else if (cmd === 'T') {
      const nextScale = timeScaleFactor === 60 ? 1 : 60;
      setTimeScaleFactor(nextScale);
      pushLog(
        `[CMD] Time scale toggled to ${nextScale}x (${nextScale === 60 ? '1s = 1 sim min' : '1s = 1 real sec'}).`,
        'cmd',
      );
    } else if (cmd === 'D') {
      const dump = bays
        .map((b) => `B${b.id + 1}=${b.filteredDistCm}cm(${b.state})`)
        .join(' | ');
      pushLog(`[DEBUG] ${dump}`, 'cmd');
    } else if (cmd === 'R1' || cmd === 'R2' || cmd === 'R3') {
      const idx = Number(cmd[1]) - 1;
      setTargetDistances((prev) => {
        const copy = [...prev];
        copy[idx] = 32;
        return copy;
      });
      setBays((prev) => {
        const copy = prev.map((b, i) => (i === idx ? createInitialBay(idx) : b));
        eepromRef.current = serializeEeprom(copy);
        return copy;
      });
      pushLog(`[CMD] Bay ${idx + 1} force-reset to AVAILABLE.`, 'cmd');
    } else {
      pushLog(`[CMD] Unknown "${cmd}". Valid: S, T, D, R1, R2, R3`, 'cmd');
    }
  };

  const handleSerialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSerialCommand(serialInput);
    setSerialInput('');
  };

  const occupiedCount = bays.filter((b) => b.state === 'OCCUPIED' || b.state === 'EXITING_DEBOUNCE').length;
  const overstayCount = bays.filter((b) => b.isOverstaying).length;

  return (
    <div
      data-testid="simulator-scroll-container"
      className="h-full overflow-y-auto dash-scroll space-y-3 pr-0.5 pb-3"
    >
      {/* Compact 4-KPI Architectural Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="bg-white border border-[#DADCE0] px-3.5 py-2.5">
          <div className="text-[10.5px] font-mono uppercase text-[#5F6368]">Hardware Topology</div>
          <div className="text-base font-normal text-[#202124] mt-0.5 tabular-nums">
            3 US · 9 LED · 3 LCD · 3 BZ
          </div>
          <div className="text-[11px] font-light text-[#1A73E8] font-mono">
            20/20 Uno Pins + 0x24 Expander
          </div>
        </div>
        <div className="bg-white border border-[#DADCE0] px-3.5 py-2.5">
          <div className="text-[10.5px] font-mono uppercase text-[#5F6368]">Lot Occupancy</div>
          <div className="text-base font-normal text-[#202124] mt-0.5 tabular-nums">
            {occupiedCount} / 3 Occupied
          </div>
          <div className="text-[11px] font-light text-[#137333] font-mono">
            {3 - occupiedCount} Open · {overstayCount} Overstay · {buzzerBus.dangerBayNumbers.length} Danger
          </div>
        </div>
        <div className="bg-white border border-[#DADCE0] px-3.5 py-2.5">
          <div className="text-[10.5px] font-mono uppercase text-[#5F6368]">Stationary Stop Rule</div>
          <div className="text-base font-normal text-[#202124] mt-0.5 tabular-nums">
            5.0 s Hold · ±1 cm
          </div>
          <div className="text-[11px] font-light text-[#5F6368]">
            Count-up starts cleanly at 00:00
          </div>
        </div>
        <div className="bg-white border border-[#DADCE0] px-3.5 py-2.5">
          <div className="text-[10.5px] font-mono uppercase text-[#5F6368]">Sim Clock &amp; Power</div>
          <div className="text-base font-normal text-[#202124] mt-0.5 font-mono tabular-nums">
            {formatClock(simMs)} · {timeScaleFactor}×
          </div>
          <div className="text-[11px] font-light text-[#5F6368] font-mono">
            100.3 mA MCU · 285.6 mA USB
          </div>
        </div>
      </div>

      {/* Sharp Dense Material 3 Control Bar */}
      <div className="bg-white border border-[#DADCE0] px-3.5 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsRunning((r) => !r)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1A73E8] text-white hover:bg-[#1557B0] transition-colors whitespace-nowrap cursor-pointer"
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isRunning ? 'Pause' : 'Resume'}
          </button>

          <div
            role="group"
            aria-label="Simulation time scale"
            className="inline-flex border border-[#DADCE0] bg-[#F4F6F9]"
          >
            <button
              type="button"
              onClick={() => setTimeScaleFactor(60)}
              className={`px-2.5 py-1.5 text-xs transition-colors whitespace-nowrap cursor-pointer ${
                timeScaleFactor === 60
                  ? 'bg-white text-[#1A73E8] font-medium'
                  : 'text-[#5F6368] hover:text-[#202124]'
              }`}
            >
              60× (1s=1m)
            </button>
            <button
              type="button"
              onClick={() => setTimeScaleFactor(1)}
              className={`px-2.5 py-1.5 text-xs transition-colors whitespace-nowrap cursor-pointer ${
                timeScaleFactor === 1
                  ? 'bg-white text-[#1A73E8] font-medium'
                  : 'text-[#5F6368] hover:text-[#202124]'
              }`}
            >
              1× Real-Time
            </button>
          </div>

          <button
            type="button"
            onClick={() => setInjectJitter((j) => !j)}
            aria-pressed={injectJitter}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs border transition-colors whitespace-nowrap cursor-pointer ${
              injectJitter
                ? 'bg-[#FEF7E0] border-[#B06000] text-[#7A4100] font-medium'
                : 'bg-white border-[#DADCE0] text-[#202124] hover:bg-[#F4F6F9]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            {injectJitter ? '±1 cm Jitter ON' : 'Inject ±1 cm Jitter'}
          </button>

          <button
            type="button"
            onClick={() => setAudioEnabled((a) => !a)}
            aria-pressed={audioEnabled}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs border transition-colors whitespace-nowrap cursor-pointer ${
              audioEnabled
                ? 'bg-[#FCE8E6] border-[#C5221F] text-[#A50E0E] font-medium'
                : 'bg-white border-[#DADCE0] text-[#202124] hover:bg-[#F4F6F9]'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            {audioEnabled ? 'Audio ON' : 'Audio Muted'}
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={simulatePowerCycle}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs border border-[#DADCE0] bg-white text-[#202124] hover:bg-[#F4F6F9] transition-colors whitespace-nowrap cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-[#1A73E8]" />
            Power Cycle
          </button>
          <button
            type="button"
            onClick={resetAllBays}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs border border-[#DADCE0] bg-white text-[#5F6368] hover:text-[#202124] hover:bg-[#F4F6F9] transition-colors whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All
          </button>
        </div>
      </div>

      {/* 3 Independent Parking Bays Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {bays.map((bay, idx) => {
          const [lcdRow0, lcdRow1] = formatBayLcdLines(bay, timeScaleFactor);
          const leds = computeBayLeds(bay, simMs);
          const bayBuzzer = buzzerBus.bays[idx];
          const settleProgressPct =
            bay.state === 'PARKING_SETTLE'
              ? Math.min(
                  100,
                  Math.round(
                    (bay.stationaryHeldMs / ENGINEERING_CONSTANTS.STATIONARY_CONFIRM_MS) * 100,
                  ),
                )
              : bay.state === 'OCCUPIED' || bay.state === 'EXITING_DEBOUNCE'
                ? 100
                : 0;
          const settleSeconds = (bay.stationaryHeldMs / 1000).toFixed(1);
          const clampedDist = Math.max(2, Math.min(35, targetDistances[idx]));
          const carOffsetPct = Math.min(82, Math.max(6, ((clampedDist - 2) / 33) * 80));

          return (
            <article
              key={bay.id}
              data-testid={`parking-bay-${idx + 1}`}
              className="bg-white border border-[#DADCE0] p-3.5 flex flex-col justify-between gap-3"
            >
              {/* Bay Header */}
              <div className="flex items-baseline justify-between gap-2 border-b border-[#E8EAED] pb-2">
                <div>
                  <h3 className="text-sm font-medium text-[#202124]">
                    Parking Slot {idx + 1}
                  </h3>
                  <p className="text-[11px] font-mono text-[#5F6368]">
                    LCD {bay.lcdAddress} · US D{idx * 2 + 2}/D{idx * 2 + 3} · BZ{idx + 1} 0x24 {bayBuzzer.pcfPin}
                  </p>
                </div>
                <span
                  className={`text-[11px] font-mono font-medium ${
                    bay.isOverstaying
                      ? 'text-[#C5221F]'
                      : bay.state === 'OCCUPIED'
                        ? 'text-[#1A73E8]'
                        : bay.state === 'PARKING_SETTLE'
                          ? 'text-[#B06000]'
                          : 'text-[#137333]'
                  }`}
                >
                  {bay.isOverstaying
                    ? 'OVERSTAY'
                    : bay.state === 'PARKING_SETTLE'
                      ? 'HOLDING 5s'
                      : bay.state}
                </span>
              </div>

              {/* Layer 1: Dedicated 16x2 I2C LCD */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10.5px] text-[#5F6368]">
                  <span>16×2 I2C Count-Up LCD</span>
                  <span className="font-mono">{bay.lcdAddress}</span>
                </div>
                <div
                  className={`p-2.5 border border-[#2D333B] ${
                    bay.isOverstaying ? 'lcd-screen-overstay' : 'lcd-screen'
                  }`}
                  aria-label={`Bay ${idx + 1} LCD Display`}
                >
                  <div className="font-mono text-[13.5px] tracking-[0.12em] whitespace-pre leading-snug">
                    {lcdRow0}
                  </div>
                  <div className="font-mono text-[13.5px] tracking-[0.12em] whitespace-pre leading-snug mt-0.5">
                    {lcdRow1}
                  </div>
                </div>
              </div>

              {/* Layer 2: 3 Distance LEDs */}
              <div className="bg-[#F8F9FA] px-3 py-2 border border-[#DADCE0] flex items-center justify-between gap-2">
                <div className="flex items-center gap-3.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-3 h-3 rounded-full border transition-all duration-100 ${
                        leds.green
                          ? 'bg-[#188038] border-[#0D652D] shadow-[0_0_8px_rgba(24,128,56,0.7)]'
                          : 'bg-[#DDE3EA] border-[#BDC1C6]'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="text-[10.5px] font-mono text-[#5F6368]">G</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-3 h-3 rounded-full border transition-all duration-100 ${
                        leds.yellow
                          ? 'bg-[#F9AB00] border-[#B06000] shadow-[0_0_8px_rgba(249,171,0,0.8)]'
                          : 'bg-[#DDE3EA] border-[#BDC1C6]'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="text-[10.5px] font-mono text-[#5F6368]">Y</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-3 h-3 rounded-full border transition-all duration-100 ${
                        leds.red
                          ? 'bg-[#D93025] border-[#A50E0E] shadow-[0_0_8px_rgba(217,48,37,0.8)]'
                          : 'bg-[#DDE3EA] border-[#BDC1C6]'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="text-[10.5px] font-mono text-[#5F6368]">R</span>
                  </div>
                </div>
                <span className="text-[11px] font-normal text-[#202124] truncate">
                  {leds.modeLabel}
                </span>
              </div>

              {/* Layer 2B: Dedicated Bay Passive Buzzer Status (PCF8574 0x24 P0/P1/P2) */}
              <div
                data-testid={`bay-buzzer-${idx + 1}`}
                className={`px-3 py-1.5 border flex items-center justify-between gap-2 transition-colors ${
                  bayBuzzer.mode === 'DANGER'
                    ? bayBuzzer.isGateLow
                      ? 'bg-[#FCE8E6] border-[#C5221F] text-[#A50E0E]'
                      : 'bg-[#FFF5F4] border-[#F6AEA9] text-[#A50E0E]'
                    : bayBuzzer.mode === 'OVERSTAY'
                      ? bayBuzzer.isGateLow
                        ? 'bg-[#FEF7E0] border-[#B06000] text-[#7A4100]'
                        : 'bg-[#FFFDF5] border-[#FDE293] text-[#7A4100]'
                      : 'bg-[#F8F9FA] border-[#DADCE0] text-[#5F6368]'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {bayBuzzer.isGateLow ? (
                    <Volume2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 shrink-0 opacity-65" />
                  )}
                  <span className="text-[10.5px] font-mono font-medium whitespace-nowrap">
                    BZ{idx + 1} ({bayBuzzer.pcfPin})
                  </span>
                  <span className="text-[10.5px] truncate">{bayBuzzer.cadenceLabel}</span>
                </div>
                <span className="text-[10px] font-mono font-medium shrink-0">
                  {bayBuzzer.isGateLow ? 'LOW (ON)' : 'HIGH (OFF)'}
                </span>
              </div>

              {/* Layer 3: 1:20 Scale Bay + HC-SR04 Ultrasonic */}
              <div className="space-y-2">
                <div className="relative h-16 bg-[#F4F6F9] border border-[#DADCE0] overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-[#FCE8E6]/85 border-r border-dashed border-[#C5221F]/60"
                    style={{ width: '16%' }}
                    title="DANGER (2–5 cm)"
                  />
                  <div
                    className="absolute inset-y-0 bg-[#FEF7E0]/85 border-r border-dashed border-[#B06000]/60"
                    style={{ left: '16%', width: '15%' }}
                    title="CAUTION (6–10 cm)"
                  />
                  <div
                    className="absolute inset-y-0 bg-[#E6F4EA]/75 border-r border-dashed border-[#137333]/60"
                    style={{ left: '31%', width: '28%' }}
                    title="SAFE (11–20 cm)"
                  />

                  <div className="absolute left-1 top-1/2 -translate-y-1/2 w-3 h-9 bg-[#1A73E8] flex flex-col items-center justify-around py-1 z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D2E3FC]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D2E3FC]" />
                  </div>

                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 300 64"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <polygon
                      points={`16,32 ${Math.round(carOffsetPct * 3)},16 ${Math.round(carOffsetPct * 3)},48`}
                      fill="rgba(26, 115, 232, 0.10)"
                    />
                    <line
                      x1="16"
                      y1="32"
                      x2={Math.round(carOffsetPct * 3)}
                      y2="32"
                      stroke="#1A73E8"
                      strokeWidth="1.1"
                      strokeDasharray="3 3"
                    />
                  </svg>

                  <div
                    className={`absolute top-1/2 -translate-y-1/2 h-9 w-12 border flex flex-col items-center justify-center transition-transform duration-150 ${
                      clampedDist > 20
                        ? 'bg-white/85 border-[#9AA0A6] text-[#5F6368] border-dashed'
                        : bay.isOverstaying
                          ? 'bg-[#FCE8E6] border-[#C5221F] text-[#A50E0E]'
                          : 'bg-white border-[#1A73E8] text-[#174EA6]'
                    }`}
                    style={{ left: `${carOffsetPct}%` }}
                  >
                    <span className="text-[9.5px] font-mono font-medium leading-none">
                      {clampedDist > 20 ? 'OUT' : 'CAR'}
                    </span>
                    <span className="text-[9.5px] font-mono tabular-nums mt-0.5">
                      {bay.filteredDistCm}cm
                    </span>
                  </div>

                  <div className="absolute bottom-0.5 right-1.5 text-[9.5px] font-mono text-[#5F6368]">
                    5 · 10 · 20 cm
                  </div>
                </div>

                {/* 5-Second Stationary Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10.5px] font-mono tabular-nums">
                    <span className="text-[#5F6368] truncate">
                      {bay.state === 'PARKING_SETTLE'
                        ? `Hold anchor ${bay.anchorDistCm}±1 cm`
                        : bay.state === 'OCCUPIED'
                          ? `Fee RM ${bay.accruedFeeRM.toFixed(2)}`
                          : bay.state === 'EXITING_DEBOUNCE'
                            ? 'Exit Debounce (3.0 s)'
                            : 'Open · Waiting'}
                    </span>
                    <span className="font-medium text-[#202124]">
                      {bay.state === 'PARKING_SETTLE'
                        ? `${settleSeconds}/5.0 s`
                        : bay.state === 'OCCUPIED'
                          ? `${bay.elapsedSimMins}m`
                          : '0.0 s'}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#E8EAED] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-100 ${
                        bay.isOverstaying
                          ? 'bg-[#C5221F]'
                          : bay.state === 'OCCUPIED'
                            ? 'bg-[#137333]'
                            : 'bg-[#1A73E8]'
                      }`}
                      style={{ width: `${settleProgressPct}%` }}
                    />
                  </div>
                </div>

                {/* Distance Slider */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <label htmlFor={`bay-slider-${idx + 1}`} className="text-[#202124]">
                      Distance
                    </label>
                    <span className="font-mono tabular-nums text-[#1A73E8] font-medium">
                      {targetDistances[idx]} cm (EMA {bay.filteredDistCm})
                    </span>
                  </div>
                  <input
                    id={`bay-slider-${idx + 1}`}
                    type="range"
                    min={2}
                    max={35}
                    step={1}
                    value={targetDistances[idx]}
                    onChange={(e) => setBayDistance(idx, Number(e.target.value))}
                    className="m3-slider w-full"
                  />
                </div>

                {/* Preset Zone Buttons */}
                <div className="grid grid-cols-4 gap-1">
                  <button
                    type="button"
                    onClick={() => setBayDistance(idx, 32)}
                    className="py-1 text-[10.5px] bg-[#F4F6F9] border border-[#DADCE0] hover:bg-[#E8F0FE] text-[#202124] cursor-pointer"
                  >
                    Empty
                  </button>
                  <button
                    type="button"
                    onClick={() => setBayDistance(idx, 15)}
                    className="py-1 text-[10.5px] bg-[#E6F4EA] border border-[#CEEAD6] hover:bg-[#CEEAD6] text-[#137333] cursor-pointer"
                  >
                    Safe 15
                  </button>
                  <button
                    type="button"
                    onClick={() => setBayDistance(idx, 8)}
                    className="py-1 text-[10.5px] bg-[#FEF7E0] border border-[#FDE293] hover:bg-[#FDE293] text-[#7A4100] cursor-pointer"
                  >
                    Caut 8
                  </button>
                  <button
                    type="button"
                    onClick={() => setBayDistance(idx, 4)}
                    className="py-1 text-[10.5px] bg-[#FCE8E6] border border-[#FAD2CF] hover:bg-[#FAD2CF] text-[#C5221F] cursor-pointer"
                  >
                    Dang 4
                  </button>
                </div>

                {/* Contextual Test Actions */}
                <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-[#E8EAED]">
                  <button
                    type="button"
                    onClick={() => nudgeBayCar(idx)}
                    disabled={targetDistances[idx] > 20}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[10.5px] border border-[#DADCE0] text-[#202124] hover:bg-[#F4F6F9] disabled:opacity-40 cursor-pointer"
                  >
                    <MoveHorizontal className="w-3 h-3" />
                    Nudge
                  </button>

                  {bay.state === 'PARKING_SETTLE' && (
                    <button
                      type="button"
                      onClick={() => completeSettleNow(idx)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[10.5px] bg-[#E8F0FE] border border-[#AECBFA] text-[#174EA6] hover:bg-[#D2E3FC] cursor-pointer"
                    >
                      <Clock className="w-3 h-3" />
                      Skip 5s
                    </button>
                  )}

                  {(bay.state === 'OCCUPIED' || bay.state === 'EXITING_DEBOUNCE') && (
                    <>
                      <button
                        type="button"
                        onClick={() => fastForwardBay(idx, 60)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[10.5px] bg-[#F4F6F9] border border-[#DADCE0] text-[#202124] hover:bg-[#E8F0FE] cursor-pointer"
                      >
                        <FastForward className="w-3 h-3" />
                        +60m
                      </button>
                      <button
                        type="button"
                        onClick={() => fastForwardBay(idx, 185)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[10.5px] bg-[#FCE8E6] border border-[#FAD2CF] text-[#C5221F] hover:bg-[#FAD2CF] cursor-pointer"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        Overstay
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Bottom Split: 3-Buzzer Tone Bus & PCF8574 (0x24) Monitor + Receipt & Serial Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-4 bg-white border border-[#DADCE0] p-3.5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-medium text-[#202124]">
              3-Buzzer Tone Bus (A3→2N2222) &amp; PCF8574 (0x24)
            </h3>
            <span className="font-mono text-[10.5px] text-[#5F6368] shrink-0">Active-LOW</span>
          </div>

          <div
            data-testid="overstay-buzzer-panel"
            className={`p-3 border transition-colors ${
              buzzerBus.anyAlerting
                ? 'bg-[#FCE8E6] border-[#C5221F]'
                : 'bg-[#F8F9FA] border-[#DADCE0]'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                {buzzerBus.anyAlerting ? (
                  <AlertTriangle className="w-4 h-4 text-[#C5221F] shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#137333] shrink-0" />
                )}
                <span
                  className={`text-xs font-medium truncate ${
                    buzzerBus.anyAlerting ? 'text-[#A50E0E]' : 'text-[#137333]'
                  }`}
                >
                  {buzzerBus.anyAlerting
                    ? `${buzzerBus.activeSoundingCount}/3 BUZZER(S) SOUNDING`
                    : 'ALL 3 BUZZERS SILENT'}
                </span>
              </div>
              <span
                data-testid="buzzer-carrier-hz"
                className="font-mono text-[11px] font-medium tabular-nums text-[#202124] shrink-0"
              >
                {buzzerBus.carrierFreqHz > 0 ? `${buzzerBus.carrierFreqHz} Hz` : '0 Hz'}
              </span>
            </div>

            <p className="text-[11px] font-mono text-[#202124] mt-1.5">
              {buzzerBus.carrierModeLabel}
            </p>

            {/* Live PCF8574 (0x24) I2C Register Readout */}
            <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10.5px] font-mono tabular-nums">
              <div className="bg-white/90 border border-[#DADCE0] px-2 py-1 flex items-center justify-between">
                <span className="text-[#5F6368]">0x24 Byte</span>
                <span data-testid="pcf8574-byte-hex" className="font-medium text-[#1A73E8]">
                  {buzzerBus.byteHex} ({buzzerBus.byteMask})
                </span>
              </div>
              <div className="bg-white/90 border border-[#DADCE0] px-2 py-1 flex items-center justify-between">
                <span className="text-[#5F6368]">P2·P1·P0</span>
                <span className="font-medium text-[#202124]">
                  {buzzerBus.byteBinary.slice(5)}
                </span>
              </div>
            </div>

            {/* 3 Independent Buzzer Gate Bars */}
            <div className="mt-2 grid grid-cols-3 gap-1.5 text-[10px] font-mono">
              {buzzerBus.bays.map((b) => (
                <div
                  key={b.bayIndex}
                  className={`px-1.5 py-1 border text-center transition-colors ${
                    b.isGateLow
                      ? 'bg-[#C5221F] border-[#A50E0E] text-white font-medium'
                      : b.isAlerting
                        ? 'bg-[#FAD2CF] border-[#C5221F] text-[#A50E0E]'
                        : 'bg-white border-[#DADCE0] text-[#5F6368]'
                  }`}
                >
                  BZ{b.bayNumber} {b.pcfPin}: {b.isGateLow ? '0' : '1'}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[#E8EAED]">
            <div className="text-[11px] text-[#5F6368] mb-1">Latest Serial Exit Receipt</div>
            {receipts.length === 0 ? (
              <p className="text-[11px] font-light text-[#5F6368]">
                Park for ≥5 s, then move to Empty (&gt;20 cm) for 3 s to print receipt.
              </p>
            ) : (
              <div className="bg-[#F8F9FA] border border-[#DADCE0] p-2 font-mono text-[11px] text-[#202124] tabular-nums">
                <div className="font-medium text-[#174EA6]">
                  RECEIPT — BAY {receipts[0].bayNumber} · {receipts[0].totalMins}m
                </div>
                <div className="text-[#1A73E8]">
                  Payable: RM {receipts[0].finalFeeRM.toFixed(2)} (15m free grace)
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-8 bg-white border border-[#DADCE0] p-3.5 flex flex-col justify-between gap-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#1A73E8]" />
              <h3 className="text-xs font-medium text-[#202124]">
                USB Serial Monitor (9600 baud · Live Commands)
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {(['S', 'T', 'D', 'R1', 'R2', 'R3'] as const).map((cmd) => (
                <button
                  key={cmd}
                  type="button"
                  onClick={() => executeSerialCommand(cmd)}
                  className="px-2 py-0.5 font-mono text-[11px] bg-[#F4F6F9] border border-[#DADCE0] hover:bg-[#E8F0FE] text-[#174EA6] cursor-pointer"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>

          <div
            className="bg-[#161B22] text-[#E6EDF3] p-2.5 h-32 overflow-y-auto dash-scroll font-mono text-[11px] space-y-1 tabular-nums"
            aria-live="polite"
            aria-label="Serial Monitor Output"
          >
            {consoleLogs.map((entry) => (
              <div key={entry.id} className="leading-snug">
                <span className="text-[#8B949E] mr-2">[{entry.timeLabel}]</span>
                <span
                  className={
                    entry.kind === 'alarm'
                      ? 'text-[#FF7B72]'
                      : entry.kind === 'receipt'
                        ? 'text-[#7EE787]'
                        : entry.kind === 'cmd'
                          ? 'text-[#79C0FF]'
                          : 'text-[#E6EDF3]'
                  }
                >
                  {entry.text}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSerialSubmit} className="flex items-center gap-1.5">
            <label htmlFor="serial-cmd-input" className="sr-only">
              Serial Monitor Command
            </label>
            <input
              id="serial-cmd-input"
              type="text"
              value={serialInput}
              onChange={(e) => setSerialInput(e.target.value)}
              placeholder="Command: S (Status), T (60x/1x), D (Debug), R1..R3 (Reset)"
              className="flex-1 px-2.5 py-1.5 border border-[#DADCE0] bg-[#F8F9FA] text-xs font-mono text-[#202124] focus:outline-none focus:border-[#1A73E8] focus:bg-white"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-medium bg-[#1A73E8] text-white hover:bg-[#1557B0] whitespace-nowrap cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
