import React, { useMemo, useRef, useState } from 'react';
import {
  Check,
  Code2,
  Copy,
  Download,
  FileCode,
  Search,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';
import {
  ARDUINO_FIRMWARE_V3,
  FIRMWARE_FILENAME,
  REMOVED_ADVANCED_CONCEPTS,
  SYLLABUS_CONCEPT_MAP,
  type SyllabusConceptEntry,
} from '../data/firmwareCode';

type CodeSubTab = 'editor' | 'syllabus' | 'diff';

export function downloadArduinoSketch(): void {
  const blob = new Blob([ARDUINO_FIRMWARE_V3], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = FIRMWARE_FILENAME;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const CodeStudioTab: React.FC = () => {
  const [subTab, setSubTab] = useState<CodeSubTab>('editor');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeConceptId, setActiveConceptId] = useState<string>('w11');
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const codeContainerRef = useRef<HTMLDivElement | null>(null);

  const lines = useMemo(() => ARDUINO_FIRMWARE_V3.split('\n'), []);

  const activeConcept: SyllabusConceptEntry =
    SYLLABUS_CONCEPT_MAP.find((c) => c.id === activeConceptId) ?? SYLLABUS_CONCEPT_MAP[0];

  const matchingLineNumbers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return new Set<number>();
    const matches = new Set<number>();
    lines.forEach((line, idx) => {
      if (line.toLowerCase().includes(q)) {
        matches.add(idx + 1);
      }
    });
    return matches;
  }, [lines, searchQuery]);

  const jumpToConcept = (concept: SyllabusConceptEntry) => {
    setActiveConceptId(concept.id);
    const targetIdx = lines.findIndex((ln) => ln.includes(concept.searchAnchor));
    if (targetIdx >= 0) {
      const lineNum = targetIdx + 1;
      setHighlightedLine(lineNum);
      const container = codeContainerRef.current;
      if (container) {
        const lineEl = container.querySelector(`[data-line="${lineNum}"]`) as HTMLElement | null;
        if (lineEl) {
          lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ARDUINO_FIRMWARE_V3);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-3 min-h-0">
      {/* Dense Top Header & Sub-Tab Controls */}
      <div className="bg-white border border-[#DADCE0] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <FileCode className="w-4 h-4 text-[#1A73E8] shrink-0" />
          <div className="min-w-0">
            <h2 className="text-[15px] font-normal text-[#202124] leading-tight truncate">
              C++ Code Studio — Strictly KIE1004 W01–W13 Firmware
            </h2>
            <p className="text-[11px] font-light text-[#5F6368] truncate">
              {FIRMWARE_FILENAME} · {lines.length} lines · Zero structs, zero enums, zero snprintf/EEPROM templates
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="tablist"
            aria-label="Code Studio Views"
            className="inline-flex border border-[#DADCE0] bg-[#F4F6F9]"
          >
            {(
              [
                ['editor', 'Arduino Sketch (.ino)', Code2],
                ['syllabus', 'W01–W13 Syllabus Map', BookOpen],
                ['diff', 'Simplified vs. Advanced', ShieldCheck],
              ] as const
            ).map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={subTab === key}
                onClick={() => setSubTab(key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-normal transition-colors whitespace-nowrap cursor-pointer ${
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

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-normal border border-[#DADCE0] bg-white text-[#202124] hover:bg-[#F4F6F9] transition-colors whitespace-nowrap cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#137333]" /> : <Copy className="w-3.5 h-3.5 text-[#5F6368]" />}
            {copied ? 'Copied' : 'Copy Code'}
          </button>

          <button
            type="button"
            onClick={downloadArduinoSketch}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1A73E8] text-white hover:bg-[#1557B0] transition-colors whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download .ino
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Split Concept Navigator + Full Code Viewer */}
      {subTab === 'editor' && (
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Left: KIE1004 W02–W13 Concept Jump List */}
          <aside className="lg:col-span-4 bg-white border border-[#DADCE0] flex flex-col min-h-0">
            <div className="px-3.5 py-2.5 border-b border-[#DADCE0] flex items-center justify-between shrink-0">
              <span className="text-xs font-medium text-[#202124]">
                Jump by KIE1004 Lecture Week
              </span>
              <span className="font-mono text-[11px] text-[#1A73E8]">
                {SYLLABUS_CONCEPT_MAP.length} modules
              </span>
            </div>

            <div className="flex-1 overflow-y-auto dash-scroll divide-y divide-[#E8EAED]">
              {SYLLABUS_CONCEPT_MAP.map((entry) => {
                const isActive = entry.id === activeConcept.id;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => jumpToConcept(entry)}
                    className={`w-full text-left px-3.5 py-2.5 transition-colors cursor-pointer ${
                      isActive ? 'bg-[#E8F0FE]' : 'hover:bg-[#F8F9FA]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-mono text-[11px] font-medium ${
                          isActive ? 'text-[#1A73E8]' : 'text-[#5F6368]'
                        }`}
                      >
                        {entry.week}
                      </span>
                      <span className="text-[11px] font-light text-[#5F6368] truncate">
                        {entry.whereUsed.split('&')[0].trim()}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-[#202124] mt-0.5">
                      {entry.topic}
                    </div>
                    <div className="font-mono text-[10.5px] text-[#5F6368] mt-1 truncate">
                      {entry.codeExcerpt}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Concept Explanation Footer */}
            <div className="p-3.5 bg-[#F8F9FA] border-t border-[#DADCE0] shrink-0 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-medium text-[#1A73E8]">
                  {activeConcept.week} · {activeConcept.topic}
                </span>
              </div>
              <p className="text-[11.5px] font-light text-[#3C4043] leading-relaxed">
                {activeConcept.explanation}
              </p>
            </div>
          </aside>

          {/* Right: Full Searchable Line-Numbered Arduino C++ Viewer */}
          <div className="lg:col-span-8 bg-white border border-[#DADCE0] flex flex-col min-h-0">
            <div className="px-3.5 py-2 border-b border-[#DADCE0] flex flex-wrap items-center justify-between gap-2 shrink-0 bg-[#F8F9FA]">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-[#5F6368] shrink-0" />
                <label htmlFor="firmware-search" className="sr-only">
                  Search firmware source code
                </label>
                <input
                  id="firmware-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sketch (e.g. insertionSort, LED_PINS, occupiedPtr, printTwoDigits)..."
                  className="w-full bg-transparent text-xs font-mono text-[#202124] placeholder:text-[#80868B] focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-[#5F6368] shrink-0">
                {searchQuery.trim() && (
                  <span className="text-[#1A73E8]">
                    {matchingLineNumbers.size} match{matchingLineNumbers.size === 1 ? '' : 'es'}
                  </span>
                )}
                <span>Arduino Uno · C++</span>
              </div>
            </div>

            <div
              ref={codeContainerRef}
              className="flex-1 overflow-auto dash-scroll bg-[#161B22] text-[#E6EDF3] font-mono text-[12px] leading-[1.55] py-2"
              aria-label="Full Arduino C++ W01 to W13 firmware source code"
            >
              {lines.map((line, idx) => {
                const lineNum = idx + 1;
                const isJump = highlightedLine === lineNum;
                const isMatch = matchingLineNumbers.has(lineNum);
                const isComment = line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*');
                return (
                  <div
                    key={lineNum}
                    data-line={lineNum}
                    className={`flex px-3 ${
                      isJump
                        ? 'bg-[#1A73E8]/35'
                        : isMatch
                          ? 'bg-[#F9AB00]/25'
                          : 'hover:bg-white/5'
                    }`}
                  >
                    <span className="w-10 shrink-0 select-none text-right pr-3 text-[#6E7681] tabular-nums">
                      {lineNum}
                    </span>
                    <span
                      className={`whitespace-pre ${
                        isComment ? 'text-[#8B949E]' : 'text-[#E6EDF3]'
                      }`}
                    >
                      {line || ' '}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: W01-W13 Syllabus Mapping Matrix */}
      {subTab === 'syllabus' && (
        <div className="flex-1 min-h-0 overflow-y-auto dash-scroll bg-white border border-[#DADCE0] p-4">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-medium text-[#202124]">
              Complete KIE1004 W01–W13 Lecture-to-Firmware Traceability Matrix
            </h3>
            <span className="text-xs font-light text-[#5F6368]">
              Click any row to open and jump directly to that implementation in the sketch
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="booktabs-table text-left text-xs">
              <thead>
                <tr className="text-[#202124]">
                  <th className="py-2 pr-3 font-medium">Week</th>
                  <th className="py-2 pr-4 font-medium">KIE1004 Concept</th>
                  <th className="py-2 pr-4 font-medium">Firmware Location</th>
                  <th className="py-2 pr-4 font-medium">Exact Code Pattern</th>
                  <th className="py-2 font-medium">Engineering Purpose</th>
                </tr>
              </thead>
              <tbody>
                {SYLLABUS_CONCEPT_MAP.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => {
                      setSubTab('editor');
                      window.setTimeout(() => jumpToConcept(item), 60);
                    }}
                    className="align-top hover:bg-[#F4F6F9] cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 pr-3 font-mono font-medium text-[#1A73E8] whitespace-nowrap">
                      {item.week}
                    </td>
                    <td className="py-2.5 pr-4 font-medium text-[#202124] min-w-[165px]">
                      {item.topic}
                    </td>
                    <td className="py-2.5 pr-4 text-[#5F6368] min-w-[160px]">
                      {item.whereUsed}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-[11px] text-[#202124] min-w-[210px]">
                      {item.codeExcerpt}
                    </td>
                    <td className="py-2.5 font-light text-[#3C4043] leading-relaxed">
                      {item.explanation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Removed Advanced Constructs Comparison */}
      {subTab === 'diff' && (
        <div className="flex-1 min-h-0 overflow-y-auto dash-scroll bg-white border border-[#DADCE0] p-4 space-y-4">
          <div className="border-b border-[#DADCE0] pb-3">
            <h3 className="text-sm font-medium text-[#202124]">
              Syllabus Compliance Audit — Advanced Constructs Removed & Replaced
            </h3>
            <p className="text-xs font-light text-[#5F6368] mt-1">
              Every construct outside the 13 attached KIE1004 lecture PDFs was deliberately eliminated while preserving 100% of the 3-bay ultrasonic, 9-LED, 3-LCD, 5.0-second stationary rule, and overstay buzzer functionality.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="booktabs-table text-left text-xs">
              <thead>
                <tr className="text-[#202124]">
                  <th className="py-2 pr-4 font-medium">Removed Advanced Construct</th>
                  <th className="py-2 pr-4 font-medium">Reason Excluded</th>
                  <th className="py-2 pr-4 font-medium">KIE1004 Replacement Used</th>
                  <th className="py-2 font-medium whitespace-nowrap">Lecture Ref</th>
                </tr>
              </thead>
              <tbody>
                {REMOVED_ADVANCED_CONCEPTS.map((row) => (
                  <tr key={row.removedFeature} className="align-top">
                    <td className="py-2.5 pr-4 font-mono text-[#C5221F] min-w-[200px]">
                      {row.removedFeature}
                    </td>
                    <td className="py-2.5 pr-4 font-light text-[#5F6368] min-w-[190px]">
                      {row.whyRemoved}
                    </td>
                    <td className="py-2.5 pr-4 text-[#137333] leading-relaxed">
                      {row.kie1004Replacement}
                    </td>
                    <td className="py-2.5 font-mono text-[#1A73E8] whitespace-nowrap">
                      {row.weekRef}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
