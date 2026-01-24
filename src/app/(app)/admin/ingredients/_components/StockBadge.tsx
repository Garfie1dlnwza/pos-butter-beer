"use client";

interface StockBadgeProps {
  currentStock: number;
  minStock: number;
}

export function StockBadge({ currentStock, minStock }: StockBadgeProps) {
  const ratio =
    minStock > 0 ? currentStock / minStock : currentStock > 0 ? 2 : 0;

  if (ratio <= 0.5) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        ต่ำมาก
      </span>
    );
  } else if (ratio <= 1) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        ใกล้หมด
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      ปกติ
    </span>
  );
}
