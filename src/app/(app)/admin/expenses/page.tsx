"use client";

import { useState, useMemo } from "react";
import { api } from "@/trpc/react";
import { useToast } from "@/components/Toast";
import { ExpenseModal } from "./_components/ExpenseModal";

interface Expense {
  id: string;
  title: string;
  amount: number;
  description: string | null;
  date: Date;
}

export default function ExpensesPage() {
  const { showToast } = useToast();
  const utils = api.useUtils();

  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Default to current month
  const [startDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [endDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1, 0);
    d.setHours(23, 59, 59, 999);
    return d;
  });

  const { data: expenses, isLoading } = api.expenses.getAll.useQuery({
    startDate,
    endDate,
  });

  const deleteMutation = api.expenses.delete.useMutation({
    onSuccess: () => {
      showToast("ลบรายจ่ายเรียบร้อย", "success");
      void utils.expenses.invalidate();
    },
    onError: (error) => {
      showToast("เกิดข้อผิดพลาด: " + error.message, "error");
    },
  });

  const handleDelete = (expense: Expense) => {
    if (confirm(`ต้องการลบ "${expense.title}" หรือไม่?`)) {
      deleteMutation.mutate({ id: expense.id });
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExpense(null);
  };

  // Summary calculations
  const totalExpense = useMemo(() => {
    if (!expenses) return 0;
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

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

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#FAFAFA]">
      {/* Header */}
      <header className="flex shrink-0 items-end justify-between border-b border-[#D7CCC8]/30 px-6 py-6 lg:px-10">
        <div>
          <h1 className="text-3xl font-bold text-[#3E2723] lg:text-4xl">
            รายจ่าย (Expenses)
          </h1>
          <p className="mt-2 text-sm font-medium tracking-wide text-[#8D6E63]">
            บันทึกและติดตามค่าใช้จ่ายในร้าน
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
          เพิ่มรายจ่าย
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6 lg:p-10">
        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[#D7CCC8]/30 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-[#8D6E63]">รายจ่ายรวม</p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              ฿{totalExpense.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="overflow-hidden rounded-2xl border border-[#D7CCC8]/30 bg-white shadow-sm">
          {expenses && expenses.length > 0 ? (
            <table className="w-full">
              <thead className="border-b border-[#E0E0E0] bg-[#FFF8E1]/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-[#5D4037] uppercase">
                    วันที่
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-[#5D4037] uppercase">
                    รายการ
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold tracking-wider text-[#5D4037] uppercase">
                    จำนวนเงิน
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold tracking-wider text-[#5D4037] uppercase">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F5]">
                {expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-[#3E2723]">
                      {new Date(expense.date).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#3E2723]">
                        {expense.title}
                      </p>
                      {expense.description && (
                        <p className="mt-0.5 text-xs text-[#8D6E63]">
                          {expense.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-red-600">
                      -฿{expense.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8D6E63] transition hover:bg-[#EFEBE9] hover:text-[#5D4037]"
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
                          onClick={() => handleDelete(expense)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#BDBDBD] transition hover:bg-red-50 hover:text-red-500"
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
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center opacity-60">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EFEBE9] text-4xl">
                💰
              </div>
              <div>
                <p className="text-lg font-bold text-[#3E2723]">
                  ยังไม่มีรายจ่าย
                </p>
                <p className="mt-1 text-sm text-[#8D6E63]">
                  เริ่มบันทึกค่าใช้จ่ายเพื่อติดตามต้นทุนของร้าน
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <ExpenseModal expense={editingExpense} onClose={handleCloseModal} />
      )}
    </div>
  );
}
