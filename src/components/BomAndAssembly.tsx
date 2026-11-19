import React, { useMemo, useState } from 'react';
import {
  Award,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  HelpCircle,
  Minus,
  Plus,
  RotateCcw,
  ShoppingBag,
  Square,
} from 'lucide-react';
import {
  BOM_ITEMS,
  DEFENSE_FAQ,
  QA_TEST_SUITE,
  REVISION_DELTA_SUMMARY,
  RUBRIC_MAPPING,
  TEAM_ROLES,
  type DefenseFaqItem,
} from '../data/blueprintData';
import {
  computeBomTotals,
  createDefaultBomQuantities,
  sanitizeQuantity,
} from '../lib/bomCalculator';

type BomSubTab = 'bom' | 'qa' | 'rubric' | 'faq';

export const BomAndAssembly: React.FC = () => {
  const [subTab, setSubTab] = useState<BomSubTab>('bom');
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    createDefaultBomQuantities(BOM_ITEMS),
  );
  const [teamSize, setTeamSize] = useState<number>(5);
  const [checkedBom, setCheckedBom] = useState<Record<string, boolean>>({});
  const [passedQa, setPassedQa] = useState<Record<string, boolean>>({});
  const [faqCategory, setFaqCategory] = useState<'All' | DefenseFaqItem['category']>('All');
  const [openFaqId, setOpenFaqId] = useState<string>('q1');

  const toggleBom = (id: string) =>
    setCheckedBom((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleQa = (id: string) =>
    setPassedQa((prev) => ({ ...prev, [id]: !prev[id] }));

  const updateItemQty = (id: string, nextValue: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: sanitizeQuantity(nextValue),
    }));
  };

  const resetQuantities = () => {
    setQuantities(createDefaultBomQuantities(BOM_ITEMS));
    setTeamSize(5);
  };

  const bomSummary = useMemo(
    () => computeBomTotals(BOM_ITEMS, quantities, checkedBom, teamSize),
    [quantities, checkedBom, teamSize],
  );

  const rowById = useMemo(() => {
    const map: Record<string, (typeof bomSummary.rows)[number]> = {};
    for (const r of bomSummary.rows) map[r.id] = r;
    return map;
  }, [bomSummary]);

  const isModified = BOM_ITEMS.some((item) => quantities[item.id] !== item.defaultQty) || teamSize !== 5;
  const qaPassCount = QA_TEST_SUITE.filter((t) => passedQa[t.id]).length;

  const filteredFaqs =
    faqCategory === 'All'
      ? DEFENSE_FAQ
      : DEFENSE_FAQ.filter((f) => f.category === faqCategory);

  return (
    <div className="h-full flex flex-col gap-3 min-h-0">
      {/* Dense Header + Scrollable Mobile-Friendly Sub-Tabs */}
      <div className="bg-white border border-[#DADCE0] px-3.5 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <ShoppingBag className="w-4 h-4 text-[#1A73E8] shrink-0" />
          <div className="min-w-0">
            <h2 className="text-sm sm:text-[15px] font-normal text-[#202124] leading-tight truncate">
              Editable Materials BOM, 10-Point QA, Rubric &amp; Viva FAQ
            </h2>
            <p className="text-[11px] font-light text-[#5F6368] truncate tabular-nums">
              Total: RM {bomSummary.grandTotalRM.toFixed(2)} (RM {bomSummary.perStudentRM.toFixed(2)}/student ÷ {bomSummary.teamSize}) · {qaPassCount}/{QA_TEST_SUITE.length} QA Passed
            </p>
          </div>
        </div>

        <div role="tablist" className="inline-flex border border-[#DADCE0] bg-[#F4F6F9] max-w-full overflow-x-auto">
          {(
            [
              ['bom', 'Editable BOM', ShoppingBag],
              ['qa', `10-Point QA (${qaPassCount}/10)`, ClipboardCheck],
              ['rubric', 'Rubric & Roles', Award],
              ['faq', '12-Q Viva FAQ', HelpCircle],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={subTab === key}
              onClick={() => setSubTab(key)}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs whitespace-nowrap cursor-pointer ${
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

      {/* Sub-Tab 1: Editable BOM + Live Auto-Pricing + Revision Delta */}
      {subTab === 'bom' && (
        <div className="flex-1 min-h-0 overflow-y-auto dash-scroll space-y-3 pr-0.5 pb-2">
          {/* Live Pricing Summary Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="bg-white border border-[#DADCE0] border-t-2 border-t-[#1A73E8] px-3.5 py-2.5">
              <div className="text-[10px] font-mono uppercase text-[#5F6368]">Live Total Cost</div>
              <div
                data-testid="bom-grand-total"
                className="text-lg font-medium text-[#1A73E8] font-mono tabular-nums mt-0.5"
              >
                RM {bomSummary.grandTotalRM.toFixed(2)}
              </div>
              <div className="text-[10.5px] font-light text-[#5F6368] tabular-nums">
                {bomSummary.totalUnits} total parts selected
              </div>
            </div>

            <div className="bg-white border border-[#DADCE0] px-3.5 py-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#5F6368]">Cost / Student</span>
                <label className="text-[10px] font-mono text-[#5F6368] flex items-center gap-1">
                  Team:
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={teamSize}
                    onChange={(e) => setTeamSize(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
                    aria-label="Team member count"
                    className="w-10 px-1 py-0.5 border border-[#DADCE0] bg-[#F8F9FA] text-[#202124] text-center font-mono text-[10.5px]"
                  />
                </label>
              </div>
              <div
                data-testid="bom-per-student"
                className="text-lg font-medium text-[#137333] font-mono tabular-nums mt-0.5"
              >
                RM {bomSummary.perStudentRM.toFixed(2)}
              </div>
              <div className="text-[10.5px] font-light text-[#5F6368]">
                Split evenly across {bomSummary.teamSize} member{bomSummary.teamSize > 1 ? 's' : ''}
              </div>
            </div>

            <div className="bg-white border border-[#DADCE0] px-3.5 py-2.5">
              <div className="text-[10px] font-mono uppercase text-[#5F6368]">Purchased Cart</div>
              <div
                data-testid="bom-cart-total"
                className="text-lg font-medium text-[#202124] font-mono tabular-nums mt-0.5"
              >
                RM {bomSummary.checkedTotalRM.toFixed(2)}
              </div>
              <div className="text-[10.5px] font-light text-[#5F6368] tabular-nums">
                Remaining: RM {Math.max(0, bomSummary.grandTotalRM - bomSummary.checkedTotalRM).toFixed(2)}
              </div>
            </div>

            <div className="bg-white border border-[#DADCE0] px-3.5 py-2.5 flex flex-col justify-between">
              <div className="text-[10px] font-mono uppercase text-[#5F6368]">Quantity Controls</div>
              <div className="text-[11px] font-light text-[#5F6368]">
                Edit any row quantity below to recalculate live pricing.
              </div>
              <button
                type="button"
                data-testid="bom-reset-qty"
                onClick={resetQuantities}
                disabled={!isModified}
                className="mt-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-[11px] border border-[#DADCE0] bg-[#F8F9FA] text-[#202124] hover:bg-[#E8F0FE] disabled:opacity-45 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Default Kit (RM 69.70)
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#DADCE0] p-3.5 sm:p-4 space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h3 className="text-xs font-medium text-[#202124]">
                  Interactive Bill of Materials — Change Quantity for Instant Pricing Updates
                </h3>
                <p className="text-[11px] font-light text-[#5F6368] mt-0.5">
                  Use − / + or type a quantity directly. Row subtotals, grand total, per-student split, and cart update automatically.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="booktabs-table text-left text-xs">
                <thead>
                  <tr className="text-[#202124]">
                    <th className="py-2 pr-2 w-8 font-medium">Buy</th>
                    <th className="py-2 pr-4 font-medium">Component</th>
                    <th className="py-2 pr-3 text-right font-medium whitespace-nowrap">Unit (RM)</th>
                    <th className="py-2 pr-4 font-medium whitespace-nowrap">Quantity</th>
                    <th className="py-2 pr-4 text-right font-medium whitespace-nowrap">Subtotal (RM)</th>
                    <th className="py-2 pr-4 font-medium">Datasheet Specs</th>
                    <th className="py-2 font-medium">Trap Avoidance</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {BOM_ITEMS.map((item) => {
                    const checked = Boolean(checkedBom[item.id]);
                    const computed = rowById[item.id];
                    const currentQty = computed?.quantity ?? item.defaultQty;
                    const subtotal = computed?.subtotalRM ?? item.totalCostRM;
                    const qtyChanged = currentQty !== item.defaultQty;

                    return (
                      <tr
                        key={item.id}
                        className={`align-top ${checked ? 'bg-[#E6F4EA]/35' : 'hover:bg-[#F8F9FA]'}`}
                      >
                        <td className="py-2.5 pr-2">
                          <button
                            type="button"
                            onClick={() => toggleBom(item.id)}
                            aria-label={`Mark ${item.component} as purchased`}
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
                        <td className="py-2.5 pr-4 min-w-[185px]">
                          <div className="font-medium text-[#202124]">{item.component}</div>
                          <div className={`text-[10.5px] ${item.isChanged ? 'text-[#1A73E8]' : 'text-[#5F6368]'}`}>
                            {item.changeNote} · Default: {item.defaultQty} {item.unitLabel}
                          </div>
                        </td>
                        <td className="py-2.5 pr-3 font-mono text-right whitespace-nowrap text-[#5F6368]">
                          {item.unitPriceRM.toFixed(2)}
                        </td>
                        <td className="py-2.5 pr-4 whitespace-nowrap">
                          <div className="inline-flex items-center border border-[#DADCE0] bg-white">
                            <button
                              type="button"
                              data-testid={`bom-qty-dec-${item.id}`}
                              aria-label={`Decrease quantity for ${item.component}`}
                              onClick={() => updateItemQty(item.id, currentQty - 1)}
                              className="px-1.5 py-1 text-[#5F6368] hover:bg-[#F4F6F9] hover:text-[#202124] cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              min={0}
                              max={999}
                              data-testid={`bom-qty-input-${item.id}`}
                              aria-label={`Quantity for ${item.component}`}
                              value={currentQty}
                              onChange={(e) => updateItemQty(item.id, Number(e.target.value))}
                              className={`w-12 py-0.5 text-center font-mono text-xs border-x border-[#DADCE0] focus:outline-none focus:bg-[#E8F0FE]/40 ${
                                qtyChanged ? 'text-[#1A73E8] font-medium' : 'text-[#202124]'
                              }`}
                            />
                            <button
                              type="button"
                              data-testid={`bom-qty-inc-${item.id}`}
                              aria-label={`Increase quantity for ${item.component}`}
                              onClick={() => updateItemQty(item.id, currentQty + 1)}
                              className="px-1.5 py-1 text-[#5F6368] hover:bg-[#F4F6F9] hover:text-[#202124] cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td
                          data-testid={`bom-subtotal-${item.id}`}
                          className={`py-2.5 pr-4 font-mono text-right whitespace-nowrap font-medium ${
                            qtyChanged ? 'text-[#1A73E8]' : 'text-[#202124]'
                          }`}
                        >
                          RM {subtotal.toFixed(2)}
                        </td>
                        <td className="py-2.5 pr-4 font-light text-[#5F6368] leading-relaxed min-w-[190px]">
                          {item.datasheetSpecs}
                        </td>
                        <td className="py-2.5 font-light text-[#5F6368] leading-relaxed min-w-[180px]">
                          {item.trapAvoidance}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-[#DADCE0] p-3.5 sm:p-4 space-y-2.5">
            <h3 className="text-xs font-medium text-[#202124]">
              Revision Delta Summary (Original Schematic v2.0 → Updated Spec v3.0)
            </h3>
            <div className="overflow-x-auto">
              <table className="booktabs-table text-left text-xs">
                <thead>
                  <tr className="text-[#202124]">
                    <th className="py-2 pr-4 font-medium">Dimension</th>
                    <th className="py-2 pr-4 font-medium">Original (v2.0)</th>
                    <th className="py-2 pr-4 font-medium">Updated (v3.0)</th>
                    <th className="py-2 font-medium">System Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {REVISION_DELTA_SUMMARY.map((row) => (
                    <tr key={row.dimension} className="align-top">
                      <td className="py-2 pr-4 font-medium text-[#202124] whitespace-nowrap">{row.dimension}</td>
                      <td className="py-2 pr-4 font-light text-[#5F6368]">{row.v2Original}</td>
                      <td className="py-2 pr-4 font-medium text-[#1A73E8]">{row.v3Updated}</td>
                      <td className="py-2 font-light text-[#5F6368] leading-relaxed">{row.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: 10-Point QA Verification Suite */}
      {subTab === 'qa' && (
        <div className="flex-1 min-h-0 overflow-y-auto dash-scroll bg-white border border-[#DADCE0] p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-medium text-[#202124]">
              Interactive 10-Point QA Verification Suite (v3.0 Hardware &amp; Firmware)
            </h3>
            <span className="font-mono text-xs text-[#1A73E8] font-medium">
              Verified: {qaPassCount} / {QA_TEST_SUITE.length} Passed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="booktabs-table text-left text-xs">
              <thead>
                <tr className="text-[#202124]">
                  <th className="py-2 pr-3 font-medium">ID</th>
                  <th className="py-2 pr-3 font-medium">Owner</th>
                  <th className="py-2 pr-4 font-medium">Test Case</th>
                  <th className="py-2 pr-4 font-medium">Expected Pass Criteria</th>
                  <th className="py-2 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {QA_TEST_SUITE.map((t) => {
                  const passed = Boolean(passedQa[t.id]);
                  return (
                    <tr key={t.id} className={`align-top ${passed ? 'bg-[#E6F4EA]/35' : 'hover:bg-[#F8F9FA]'}`}>
                      <td className="py-2.5 pr-3 font-mono font-medium text-[#1A73E8]">{t.id}</td>
                      <td className="py-2.5 pr-3 whitespace-nowrap font-light text-[#5F6368]">{t.tester}</td>
                      <td className="py-2.5 pr-4 font-medium text-[#202124] min-w-[165px]">{t.title}</td>
                      <td className="py-2.5 pr-4 font-light text-[#5F6368] leading-relaxed">{t.expectedResult}</td>
                      <td className="py-2.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => toggleQa(t.id)}
                          className={`px-2.5 py-1 text-[11px] border cursor-pointer ${
                            passed
                              ? 'bg-[#E6F4EA] border-[#137333] text-[#137333] font-medium'
                              : 'bg-[#F4F6F9] border-[#DADCE0] text-[#5F6368] hover:bg-[#E8F0FE] hover:text-[#174EA6]'
                          }`}
                        >
                          {passed ? 'PASS ✓' : 'Mark Pass'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Official KIE1004 Rubric Mapping & 5-Member Team Roles */}
      {subTab === 'rubric' && (
        <div className="flex-1 min-h-0 overflow-y-auto dash-scroll grid grid-cols-1 xl:grid-cols-12 gap-3 items-start pr-0.5 pb-2">
          <div className="xl:col-span-7 bg-white border border-[#DADCE0] p-4 space-y-2.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-xs font-medium text-[#202124]">
                Official KIE1004 Grading Rubric Traceability (Sem 1, 2026/2027 · 20%)
              </h3>
              <span className="font-mono text-[10.5px] text-[#1A73E8]">
                SPeCTRUM Due: 27 Dec 2026, 5:00 PM
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="booktabs-table text-left text-xs">
                <thead>
                  <tr className="text-[#202124]">
                    <th className="py-2 pr-3 font-medium">Criterion</th>
                    <th className="py-2 pr-3 font-medium">Project Coverage (v3.0)</th>
                    <th className="py-2 text-right font-medium">Slides</th>
                  </tr>
                </thead>
                <tbody>
                  {RUBRIC_MAPPING.map((r) => (
                    <tr key={r.criterion} className="align-top">
                      <td className="py-2 pr-3 font-mono font-medium text-[#1A73E8] min-w-[165px]">{r.criterion}</td>
                      <td className="py-2 pr-3 font-light text-[#3C4043] leading-relaxed">{r.coverage}</td>
                      <td className="py-2 text-right font-mono text-[#5F6368] whitespace-nowrap">{r.slides}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="xl:col-span-5 bg-white border border-[#DADCE0] p-4 space-y-2.5">
            <h3 className="text-xs font-medium text-[#202124]">
              5-Member Engineering Task Matrix (Teamwork · CLO3, PO9)
            </h3>
            <div className="divide-y divide-[#E8EAED]">
              {TEAM_ROLES.map((r) => (
                <div key={r.member} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-medium text-[#1A73E8]">{r.member}</span>
                    <span className="text-xs font-medium text-[#202124]">{r.title}</span>
                  </div>
                  <p className="text-[11.5px] font-light text-[#5F6368] leading-relaxed mt-1">
                    {r.responsibilities}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: 12-Question Viva Defense FAQ */}
      {subTab === 'faq' && (
        <div className="flex-1 min-h-0 flex flex-col gap-2.5">
          <div className="bg-white border border-[#DADCE0] px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <span className="text-xs font-medium text-[#202124]">
              Examiner Viva Defense Bank ({filteredFaqs.length} Q&amp;A)
            </span>
            <div className="flex flex-wrap gap-1">
              {(['All', 'Hardware & I2C', '5s Stationary FSM', 'Scheduler & Firmware', 'Power & Tariff'] as const).map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFaqCategory(cat)}
                    className={`px-2.5 py-1 text-[11px] border cursor-pointer ${
                      faqCategory === cat
                        ? 'bg-[#1A73E8] border-[#1A73E8] text-white font-medium'
                        : 'bg-[#F4F6F9] border-[#DADCE0] text-[#5F6368] hover:text-[#202124]'
                    }`}
                  >
                    {cat}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto dash-scroll space-y-2 pr-0.5 pb-2">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div key={faq.id} className="bg-white border border-[#DADCE0]">
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? '' : faq.id)}
                    aria-expanded={isOpen}
                    className="w-full px-4 py-2.5 text-left flex items-center justify-between gap-3 hover:bg-[#F8F9FA] cursor-pointer"
                  >
                    <div className="flex items-baseline gap-2.5 min-w-0">
                      <span className="font-mono text-[11px] text-[#1A73E8] shrink-0">
                        Q{String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-xs font-medium text-[#202124] leading-snug">
                        {faq.question}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#5F6368] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#5F6368] shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 pt-1 border-t border-[#E8EAED] bg-[#F8F9FA]">
                      <div className="text-[10px] font-mono text-[#1A73E8] mb-1">
                        {faq.category}{faq.isNewV3 ? ' · Updated v3.0' : ''}
                      </div>
                      <p className="text-xs font-light text-[#3C4043] leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
