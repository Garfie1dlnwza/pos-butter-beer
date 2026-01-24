"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import type { CartItem } from "../page";

interface PaymentPanelProps {
  items: CartItem[];
  total: number;
  onComplete: () => void;
  onClose: () => void;
}

const PAYMENT_METHODS = [
  {
    id: "cash",
    label: "เงินสด",
    emoji: "💵",
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "qr",
    label: "QR Code",
    emoji: "📱",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "card",
    label: "บัตรเครดิต",
    emoji: "💳",
    color: "from-purple-500 to-violet-600",
  },
  {
    id: "grab",
    label: "Grab",
    emoji: "🟢",
    color: "from-green-400 to-green-600",
  },
  {
    id: "lineman",
    label: "LINE MAN",
    emoji: "🟡",
    color: "from-yellow-400 to-amber-500",
  },
] as const;

export function PaymentPanel({
  items,
  total,
  onComplete,
  onClose,
}: PaymentPanelProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const createOrder = api.orders.create.useMutation({
    onSuccess: () => {
      onComplete();
    },
    onError: (error) => {
      alert("เกิดข้อผิดพลาด: " + error.message);
      setIsProcessing(false);
    },
  });

  const change = cashReceived - total;

  const handlePayment = async () => {
    if (paymentMethod === "cash" && cashReceived < total) {
      alert("จำนวนเงินไม่เพียงพอ");
      return;
    }

    setIsProcessing(true);

    createOrder.mutate({
      items: items.map((item) => ({
        id: item.productId,
        quantity: item.quantity,
        price: item.price,
        sweetness: item.sweetness,
        toppings: item.toppings,
        note: "",
      })),
      totalAmount: total,
      discount: 0,
      netAmount: total,
      receivedAmount: paymentMethod === "cash" ? cashReceived : total,
      change: paymentMethod === "cash" ? change : 0,
      paymentMethod,
    });
  };

  const quickCashButtons = [20, 50, 100, 500, 1000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-[#D7CCC8]/30 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D7CCC8]/30 p-5">
          <h3 className="text-xl font-bold text-[#3E2723]">💰 ชำระเงิน</h3>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="cursor-pointer rounded-lg p-2 text-[#8D6E63] transition hover:bg-[#F5F5F5] hover:text-[#3E2723] disabled:opacity-50"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {/* Total Display */}
          <div className="mb-6 rounded-2xl border border-[#D7CCC8] bg-[#FFF8E1] p-6 text-center shadow-inner">
            <div className="text-sm font-bold tracking-wider text-[#8D6E63] uppercase">
              ยอดสุทธิ
            </div>
            <div className="text-4xl font-black text-[#3E2723]">
              ฿{total.toLocaleString()}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="mb-3 font-bold text-[#3E2723]">เลือกวิธีชำระเงิน</h4>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`rounded-xl border-2 p-3 text-center transition ${
                    paymentMethod === method.id
                      ? "scale-[1.02] transform border-[#3E2723] bg-[#3E2723] text-white shadow-md"
                      : "border-[#EFEBE9] bg-[#FAFAFA] text-[#8D6E63] hover:border-[#D7CCC8] hover:bg-white"
                  }`}
                >
                  <div className="text-2xl">{method.emoji}</div>
                  <div className="mt-1 text-xs font-bold">{method.label}</div>
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === "cash" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <h4 className="mb-3 font-bold text-[#3E2723]">💵 รับเงินสด</h4>

              {/* Quick Amount Buttons */}
              <div className="mb-3 flex flex-wrap gap-2">
                {quickCashButtons.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setCashReceived((prev) => prev + amount)}
                    className="cursor-pointer rounded-lg border border-[#D7CCC8] bg-white px-3 py-2 font-bold text-[#5D4037] shadow-sm transition hover:bg-[#EFEBE9] hover:shadow"
                  >
                    +{amount}
                  </button>
                ))}
                <button
                  onClick={() => setCashReceived(total)}
                  className="cursor-pointer rounded-lg bg-[#3E2723] px-3 py-2 font-bold text-white shadow-sm transition hover:bg-[#2D1B18] hover:shadow"
                >
                  พอดี
                </button>
                <button
                  onClick={() => setCashReceived(0)}
                  className="cursor-pointer rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-bold text-red-600 shadow-sm transition hover:bg-red-100 hover:shadow"
                >
                  ล้าง
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-[#D7CCC8] bg-[#FAFAFA] p-4">
                <div>
                  <div className="text-xs font-bold text-[#8D6E63] uppercase">
                    รับเงิน
                  </div>
                  <div className="text-2xl font-bold text-[#3E2723]">
                    ฿{cashReceived.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-[#8D6E63] uppercase">
                    เงินทอน
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      change >= 0 ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    ฿{change.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Button */}
        <div className="border-t border-[#D7CCC8]/30 p-5">
          <button
            onClick={handlePayment}
            disabled={
              isProcessing || (paymentMethod === "cash" && cashReceived < total)
            }
            className="w-full cursor-pointer rounded-xl bg-[#3E2723] py-4 text-xl font-bold text-white shadow-lg transition hover:bg-[#2D1B18] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? "กำลังบันทึก..." : <>ยืนยันการชำระเงิน</>}
          </button>
        </div>
      </div>
    </div>
  );
}
