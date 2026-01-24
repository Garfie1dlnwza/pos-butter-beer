"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { useToast } from "@/components/Toast";

const EXPENSE_CATEGORIES = [
  { id: "rent", label: "ค่าเช่า" },
  { id: "utilities", label: "ค่าน้ำ/ไฟ" },
  { id: "labor", label: "ค่าแรง" },
  { id: "marketing", label: "การตลาด" },
  { id: "equipment", label: "อุปกรณ์" },
  { id: "supplies", label: "วัสดุสิ้นเปลือง" },
  { id: "experiment", label: "ทดลองสูตร" },
  { id: "other", label: "อื่นๆ" },
];

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  description: string | null;
  date: Date;
}

interface ExpenseModalProps {
  expense?: Expense | null;
  onClose: () => void;
}

export function ExpenseModal({ expense, onClose }: ExpenseModalProps) {
  const { showToast } = useToast();
  const utils = api.useUtils();
  const isEditing = !!expense;

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("other");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => {
    return new Date().toISOString().split("T")[0] ?? "";
  });

  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      setAmount(expense.amount.toString());
      setCategory(expense.category);
      setDescription(expense.description ?? "");
      setDate(new Date(expense.date).toISOString().split("T")[0] ?? "");
    }
  }, [expense]);

  const createMutation = api.expenses.create.useMutation({
    onSuccess: () => {
      showToast("เพิ่มรายจ่ายเรียบร้อย", "success");
      void utils.expenses.invalidate();
      onClose();
    },
    onError: (error) => {
      showToast("เกิดข้อผิดพลาด: " + error.message, "error");
    },
  });

  const updateMutation = api.expenses.update.useMutation({
    onSuccess: () => {
      showToast("แก้ไขรายจ่ายเรียบร้อย", "success");
      void utils.expenses.invalidate();
      onClose();
    },
    onError: (error) => {
      showToast("เกิดข้อผิดพลาด: " + error.message, "error");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      title,
      amount: parseFloat(amount),
      category,
      description: description || undefined,
      date: new Date(date),
    };

    if (isEditing && expense) {
      updateMutation.mutate({ id: expense.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-[#3E2723]">
            {isEditing ? "แก้ไขรายจ่าย" : "เพิ่มรายจ่าย"}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#5D4037]">
              ชื่อรายการ *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="เช่น ค่าป้ายร้าน, ค่าทดลองสูตร"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#5D4037]">
              จำนวนเงิน (บาท) *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#5D4037]">
              หมวดหมู่
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#5D4037]">
              วันที่
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#5D4037]">
              รายละเอียดเพิ่มเติม
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="รายละเอียด (ถ้ามี)"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-5 py-2 font-medium text-gray-700 transition hover:bg-gray-100"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-amber-600 px-5 py-2 font-medium text-white transition hover:bg-amber-700 disabled:opacity-50"
            >
              {isLoading ? "กำลังบันทึก..." : isEditing ? "บันทึก" : "เพิ่ม"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
