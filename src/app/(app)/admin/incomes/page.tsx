"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { IncomesTable } from "./_components/IncomesTable";
import { IncomeModal } from "./_components/IncomeModal";

interface Income {
  id: string;
  title: string;
  amount: number;
  type: string;
  description: string | null;
  date: Date;
  createdBy: { id: string; name: string | null } | null;
}

interface IncomeFormData {
  title: string;
  amount: number;
  type: string;
  description: string;
  date: string;
}

export default function IncomesPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  const utils = api.useUtils();
  const { data: incomes, isLoading } = api.incomes.getAll.useQuery();

  const createMutation = api.incomes.create.useMutation({
    onSuccess: () => {
      void utils.incomes.getAll.invalidate();
      setShowModal(false);
    },
  });

  const updateMutation = api.incomes.update.useMutation({
    onSuccess: () => {
      void utils.incomes.getAll.invalidate();
      setEditingIncome(null);
    },
  });

  const deleteMutation = api.incomes.delete.useMutation({
    onSuccess: () => {
      void utils.incomes.getAll.invalidate();
    },
  });

  const handleSave = (data: IncomeFormData) => {
    if (editingIncome) {
      updateMutation.mutate({
        id: editingIncome.id,
        title: data.title,
        amount: data.amount,
        type: data.type,
        description: data.description || undefined,
        date: new Date(data.date),
      });
    } else {
      createMutation.mutate({
        title: data.title,
        amount: data.amount,
        type: data.type,
        description: data.description || undefined,
        date: new Date(data.date),
      });
    }
  };

  const handleDelete = (income: Income) => {
    if (confirm(`ต้องการลบรายการ "${income.title}" หรือไม่?`)) {
      deleteMutation.mutate({ id: income.id });
    }
  };

  // Calculate stats
  // Filter only General for "Income" stats, or show all?
  // User wants separation. Let's show separate cards.

  const generalIncomes = incomes?.filter((i) => i.type !== "CAPITAL") ?? [];
  const capitalIncomes = incomes?.filter((i) => i.type === "CAPITAL") ?? [];

  const totalGeneralIncome = generalIncomes.reduce(
    (sum, i) => sum + i.amount,
    0,
  );
  const totalCapital = capitalIncomes.reduce((sum, i) => sum + i.amount, 0);

  const currentMonthGeneral = generalIncomes
    .filter((i) => {
      const d = new Date(i.date);
      const now = new Date();
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, i) => sum + i.amount, 0);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#FAFAFA]">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#D7CCC8] border-t-[#3E2723]"></div>
        <span className="mt-4 text-xs font-bold tracking-widest text-[#3E2723] uppercase">
          Loading
        </span>
      </div>
    );
  }

  // Workaround for type mismatch in IncomesTable props (expected string|undefined for type, getting string from query)
  // Casting or ensuring the types match. The Income interface above has type: string. The query returns type string (from schema).
  // The IncomesTable expects Income[], which matches.

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#FAFAFA]">
      {/* Header */}
      <header className="flex shrink-0 items-end justify-between border-b border-[#D7CCC8]/30 px-6 py-6 lg:px-10">
        <div>
          <h1 className="text-3xl font-bold text-[#3E2723] lg:text-4xl">
            รายรับอื่นๆ / เงินทุน
          </h1>
          <p className="mt-2 text-sm font-medium tracking-wide text-[#8D6E63]">
            บันทึกเงินเข้าที่ไม่ใช่ยอดขายสินค้า
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#3E2723] px-5 py-2.5 font-bold text-white shadow-lg transition hover:bg-[#2D1B18] active:scale-[0.98]"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          เพิ่มรายการ
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {/* General Income */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-medium text-emerald-700">
              รายรับทั่วไป (เดือนนี้)
            </p>
            <p className="text-3xl font-bold text-emerald-600">
              +{currentMonthGeneral.toLocaleString()}
            </p>
          </div>

          {/* Capital */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm font-medium text-blue-700">
              เงินทุนสะสม (ทั้งหมด)
            </p>
            <p className="text-3xl font-bold text-blue-600">
              +{totalCapital.toLocaleString()}
            </p>
          </div>

          {/* Total Combined (Optional, maybe confusing? Let's show total general) */}
          <div className="rounded-xl border border-[#D7CCC8]/30 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-[#8D6E63]">
              รายรับทั่วไป (ทั้งหมด)
            </p>
            <p className="text-3xl font-bold text-[#3E2723]">
              +{totalGeneralIncome.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-2xl border border-[#D7CCC8]/30 bg-white shadow-sm">
          <IncomesTable
            incomes={incomes ?? []}
            onEdit={setEditingIncome}
            onDelete={handleDelete}
          />
        </div>
      </main>

      {/* Modals */}
      <IncomeModal
        isOpen={showModal || !!editingIncome}
        onClose={() => {
          setShowModal(false);
          setEditingIncome(null);
        }}
        onSave={handleSave}
        income={editingIncome}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
