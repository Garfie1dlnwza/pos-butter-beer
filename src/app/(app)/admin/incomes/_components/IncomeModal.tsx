import { useState, useEffect } from "react";
import { Modal } from "./Modal";

interface IncomeFormData {
  title: string;
  amount: number;
  description: string;
  date: string; // ISO date string YYYY-MM-DD
}

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  income?: {
    id: string;
    title: string;
    amount: number;
    description: string | null;
    date: Date;
  } | null;
  onSave: (data: IncomeFormData) => void;
  isLoading: boolean;
}

export function IncomeModal({
  isOpen,
  onClose,
  income,
  onSave,
  isLoading,
}: IncomeModalProps) {
  const [formData, setFormData] = useState<IncomeFormData>({
    title: "",
    amount: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (isOpen) {
      if (income) {
        setFormData({
          title: income.title,
          amount: income.amount,
          description: income.description ?? "",
          date: new Date(income.date).toISOString().split("T")[0],
        });
      } else {
        setFormData({
          title: "",
          amount: 0,
          description: "",
          date: new Date().toISOString().split("T")[0],
        });
      }
    }
  }, [isOpen, income]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={income ? "แก้ไขรายรับ" : "บันทึกรายรับ"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="mb-1 block text-sm font-medium text-[#5D4037]">
            รายการรับเงิน
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full rounded-xl border border-[#D7CCC8] bg-[#FAFAFA] px-4 py-3 text-[#3E2723] outline-none focus:border-[#8D6E63] focus:bg-white"
            placeholder="ระบุรายการ เช่น เงินทุน, ขายขวดเก่า"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="mb-1 block text-sm font-medium text-[#5D4037]">
            จำนวนเงิน (฿)
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.amount || ""}
            onChange={(e) => {
              const value = e.target.value;
              setFormData((prev) => ({
                ...prev,
                amount: value === "" ? 0 : parseFloat(value),
              }));
            }}
            className="w-full rounded-xl border border-[#D7CCC8] bg-[#FAFAFA] px-4 py-3 text-[#3E2723] outline-none focus:border-[#8D6E63] focus:bg-white"
            placeholder="0.00"
          />
        </div>

        {/* Date */}
        <div>
          <label className="mb-1 block text-sm font-medium text-[#5D4037]">
            วันที่รับเงิน
          </label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value }))
            }
            className="w-full rounded-xl border border-[#D7CCC8] bg-[#FAFAFA] px-4 py-3 text-[#3E2723] outline-none focus:border-[#8D6E63] focus:bg-white"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium text-[#5D4037]">
            รายละเอียดเพิ่มเติม (Optional)
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="w-full rounded-xl border border-[#D7CCC8] bg-[#FAFAFA] px-4 py-3 text-[#3E2723] outline-none focus:border-[#8D6E63] focus:bg-white"
            placeholder="รายละเอียดเพิ่มเติม..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl border border-[#D7CCC8] py-3 text-sm font-semibold text-[#8D6E63] hover:bg-[#F5F5F5]"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 cursor-pointer rounded-xl bg-[#3E2723] py-3 text-sm font-bold text-white hover:bg-[#2D1B18] disabled:opacity-50"
          >
            {isLoading ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
