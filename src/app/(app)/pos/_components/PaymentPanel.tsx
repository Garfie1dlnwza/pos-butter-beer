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
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        sweetness: item.sweetness,
        toppings: item.toppings.map((t) => t.id),
        toppingCost: item.toppingCost,
      })),
      paymentMethod: paymentMethod as
        | "cash"
        | "qr"
        | "card"
        | "grab"
        | "lineman",
      totalAmount: total,
    });
  };

  const quickCashButtons = [20, 50, 100, 500, 1000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-gray-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 p-4">
          <h3 className="text-xl font-bold text-white">💰 ชำระเงิน</h3>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          {/* Total Display */}
          <div className="mb-6 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-4 text-center">
            <div className="text-sm text-gray-400">ยอดรวม</div>
            <div className="text-4xl font-black text-amber-400">
              ฿{total.toLocaleString()}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <h4 className="mb-3 font-medium text-gray-300">วิธีชำระเงิน</h4>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`rounded-xl p-3 text-center transition ${
                    paymentMethod === method.id
                      ? `bg-gradient-to-r ${method.color} text-white`
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <div className="text-2xl">{method.emoji}</div>
                  <div className="mt-1 text-xs">{method.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Cash Calculator */}
          {paymentMethod === "cash" && (
            <div className="mb-6">
              <h4 className="mb-3 font-medium text-gray-300">💵 รับเงินสด</h4>

              {/* Quick Amount Buttons */}
              <div className="mb-3 flex flex-wrap gap-2">
                {quickCashButtons.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setCashReceived((prev) => prev + amount)}
                    className="rounded-lg bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
                  >
                    +฿{amount}
                  </button>
                ))}
                <button
                  onClick={() => setCashReceived(total)}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-white hover:bg-amber-500"
                >
                  พอดี
                </button>
                <button
                  onClick={() => setCashReceived(0)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-500"
                >
                  ล้าง
                </button>
              </div>

              {/* Cash Display */}
              <div className="flex items-center justify-between rounded-xl bg-gray-700 p-4">
                <div>
                  <div className="text-sm text-gray-400">รับเงิน</div>
                  <div className="text-2xl font-bold text-white">
                    ฿{cashReceived.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">เงินทอน</div>
                  <div
                    className={`text-2xl font-bold ${
                      change >= 0 ? "text-green-400" : "text-red-400"
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
        <div className="border-t border-gray-700 p-4">
          <button
            onClick={handlePayment}
            disabled={
              isProcessing || (paymentMethod === "cash" && cashReceived < total)
            }
            className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 py-4 text-xl font-bold text-white shadow-lg transition hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
          >
            {isProcessing ? "กำลังบันทึก..." : <>✅ ยืนยันการชำระเงิน</>}
          </button>
        </div>
      </div>
    </div>
  );
}
