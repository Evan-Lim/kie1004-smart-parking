import type { BomItem } from '../data/blueprintData';

export interface ComputedBomRow {
  id: string;
  quantity: number;
  unitPriceRM: number;
  subtotalRM: number;
  checked: boolean;
}

export interface ComputedBomSummary {
  rows: ComputedBomRow[];
  grandTotalRM: number;
  checkedTotalRM: number;
  perStudentRM: number;
  totalUnits: number;
  teamSize: number;
}

const roundMoney = (value: number): number => Math.round(value * 100) / 100;

export function createDefaultBomQuantities(items: readonly BomItem[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const item of items) {
    map[item.id] = item.defaultQty;
  }
  return map;
}

export function sanitizeQuantity(raw: number): number {
  if (!Number.isFinite(raw) || raw < 0) return 0;
  return Math.min(999, Math.floor(raw));
}

export function computeBomTotals(
  items: readonly BomItem[],
  quantities: Record<string, number>,
  checkedMap: Record<string, boolean>,
  teamSize = 5,
): ComputedBomSummary {
  const safeTeamSize = Math.max(1, Math.floor(teamSize));
  let grandTotal = 0;
  let checkedTotal = 0;
  let totalUnits = 0;

  const rows: ComputedBomRow[] = items.map((item) => {
    const qty = sanitizeQuantity(
      quantities[item.id] !== undefined ? quantities[item.id] : item.defaultQty,
    );
    const subtotalRM = roundMoney(qty * item.unitPriceRM);
    const checked = Boolean(checkedMap[item.id]);

    grandTotal += subtotalRM;
    if (checked) checkedTotal += subtotalRM;
    totalUnits += qty;

    return {
      id: item.id,
      quantity: qty,
      unitPriceRM: item.unitPriceRM,
      subtotalRM,
      checked,
    };
  });

  const roundedGrand = roundMoney(grandTotal);
  const roundedChecked = roundMoney(checkedTotal);
  const perStudentRM = roundMoney(roundedGrand / safeTeamSize);

  return {
    rows,
    grandTotalRM: roundedGrand,
    checkedTotalRM: roundedChecked,
    perStudentRM,
    totalUnits,
    teamSize: safeTeamSize,
  };
}
