"use client";

import { Fragment } from "react";

interface User {
  id: string;
  name: string | null;
}

interface Income {
  id: string;
  title: string;
  amount: number;
  type: string;
  description: string | null;
  date: Date;
  createdBy: User | null;
}

interface IncomesTableProps {
  incomes: Income[];
  onEdit: (income: Income) => void;
  onDelete: (income: Income) => void;
}

export function IncomesTable({ incomes, onEdit, onDelete }: IncomesTableProps) {
  if (incomes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F5E9]">
          <svg
            className="h-8 w-8 text-[#A5D6A7]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-[#1B5E20]">เล่มรายรับว่างเปล่า</p>
          <p className="mt-1 text-sm text-[#4CAF50]">
            ยังไม่มีรายการรับเงินบันทึกไว้
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#E0E0E0]">
            <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-[#8D6E63] uppercase">
              วันที่
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-[#8D6E63] uppercase">
              รายการ
            </th>
            <th className="px-6 py-4 text-center text-xs font-bold tracking-wider text-[#8D6E63] uppercase">
              ประเภท
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold tracking-wider text-[#8D6E63] uppercase">
              จำนวนเงิน
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-[#8D6E63] uppercase">
              บันทึกโดย
            </th>
            <th className="px-6 py-4 text-right text-xs font-bold tracking-wider text-[#8D6E63] uppercase">
              จัดการ
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F5F5F5]">
          {incomes.map((income) => (
            <tr
              key={income.id}
              className="transition-colors hover:bg-[#FAFAFA]"
            >
              <td className="px-6 py-4 text-sm whitespace-nowrap text-[#5D4037]">
                {new Date(income.date).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
              <td className="px-6 py-4">
                <p className="font-semibold text-[#3E2723]">{income.title}</p>
                {income.description && (
                  <p className="max-w-xs truncate text-xs text-[#8D6E63]">
                    {income.description}
                  </p>
                )}
              </td>
              <td className="px-6 py-4 text-center">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    income.type === "CAPITAL"
                      ? "border border-blue-100 bg-blue-50 text-blue-600"
                      : "bg-[#FFF8E1] text-[#FBC02D]"
                  }`}
                >
                  {income.type === "CAPITAL" ? "เงินทุน" : "รายรับทั่วไป"}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <span className="font-mono font-bold text-emerald-600">
                  +{income.amount.toLocaleString()}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-[#8D6E63]">
                {income.createdBy?.name ?? "-"}
              </td>
              <td className="px-6 py-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onEdit(income)}
                    className="cursor-pointer rounded-lg p-2 text-[#8D6E63] transition hover:bg-[#FFF8E1] hover:text-[#5D4037]"
                    title="แก้ไข"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(income)}
                    className="cursor-pointer rounded-lg p-2 text-[#BDBDBD] transition hover:bg-red-50 hover:text-red-500"
                    title="ลบ"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
