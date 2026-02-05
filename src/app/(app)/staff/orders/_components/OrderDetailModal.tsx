"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";

import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "@/server/api/root";

export type OrderDetail =
  inferRouterOutputs<AppRouter>["orders"]["getAll"][number];

interface Topping {
  id: string;
  name: string;
  price: number;
}

interface OrderDetailModalProps {
  order: OrderDetail;
  onClose: () => void;
}

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const completeOrder = api.orders.complete.useMutation({
    onSuccess: () => {
      showToast("ออเดอร์เสร็จสิ้นเรียบร้อยแล้ว", "success");
      router.refresh();
      onClose();
    },
    onError: (err) => {
      showToast(err.message, "error");
      setIsProcessing(false);
    },
  });

  const cancelOrder = api.orders.cancel.useMutation({
    onSuccess: () => {
      showToast("ยกเลิกออเดอร์เรียบร้อยแล้ว", "success");
      router.refresh();
      onClose();
    },
    onError: (err) => {
      showToast(err.message, "error");
      setIsProcessing(false);
    },
  });

  const handleComplete = () => {
    setIsProcessing(true);
    completeOrder.mutate({ id: order.id });
  };

  const handleCancel = () => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะยกเลิกออเดอร์นี้?")) return;
    setIsProcessing(true);
    cancelOrder.mutate({ id: order.id });
  };
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-[#3E2723]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E0E0E0] bg-[#FAFAFA] px-6 py-4">
          <div>
            <h3 className="text-xl font-bold text-[#3E2723]">
              รายการ #{order.orderNumber.slice(-4)}
            </h3>
            <p className="mt-0.5 text-xs text-[#8D6E63]">
              {new Date(order.createdAt).toLocaleString("th-TH")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[#8D6E63] transition hover:bg-[#EFEBE9] hover:text-[#5D4037]"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Order Status */}
          <div className="mb-6 flex items-center justify-between rounded-xl border border-[#E0E0E0] bg-[#FAFAFA] p-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#5D4037]">สถานะ:</span>
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-bold tracking-wide uppercase ${
                  order.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : order.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                {order.status}
              </span>
            </div>
            <div className="text-sm font-medium text-[#8D6E63]">
              {order.paymentMethod === "qr"
                ? "ชำระด้วย QR Code"
                : "ชำระด้วยเงินสด"}
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-4">
            <h4 className="border-b border-[#E0E0E0] pb-2 text-sm font-bold tracking-wider text-[#3E2723] uppercase">
              รายการสินค้า
            </h4>
            <ul className="space-y-3">
              {order.items.map((item) => {
                let parsedToppings: Topping[] = [];
                try {
                  if (item.toppings) {
                    parsedToppings = JSON.parse(item.toppings) as Topping[];
                  }
                } catch {
                  // Ignore JSON parse error
                }

                return (
                  <li
                    key={item.id}
                    className="flex items-start justify-between text-sm"
                  >
                    <div className="flex gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#EFEBE9] text-xs font-bold text-[#5D4037]">
                        {item.quantity}
                      </span>
                      <div>
                        <p className="font-bold text-[#3E2723]">
                          {item.product.nameTh ?? item.product.name}
                        </p>
                        <div className="mt-0.5 space-x-1 text-xs text-[#8D6E63]">
                          <span>หวาน {item.sweetness}%</span>
                          {parsedToppings.map((t, idx) => (
                            <span key={idx}>, {t.name}</span>
                          ))}
                        </div>
                        {/* Note */}
                        {item.note && (
                          <p className="mt-0.5 text-[10px] text-orange-600 italic">
                            * {item.note}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="font-medium text-[#5D4037]">
                      ฿{(item.unitPrice * item.quantity).toLocaleString()}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Summary */}
          <div className="mt-8 space-y-2 border-t border-[#D7CCC8] pt-4">
            {order.discount > 0 && (
              <>
                <div className="flex items-center justify-between text-sm text-[#8D6E63]">
                  <span>ยอดรวม</span>
                  <span>฿{order.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-red-500">
                  <span>ส่วนลด</span>
                  <span>-฿{order.discount.toLocaleString()}</span>
                </div>
              </>
            )}
            <div className="flex items-center justify-between text-lg font-bold text-[#3E2723]">
              <span>ยอดรวมสุทธิ</span>
              <span>฿{order.netAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#E0E0E0] bg-[#FAFAFA] p-4">
          {order.status === "pending" ? (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={isProcessing}
                className="flex-1 rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "ยกเลิกออเดอร์"}
              </button>
              <button
                onClick={handleComplete}
                disabled={isProcessing}
                className="flex-1 rounded-xl bg-green-600 py-3 text-sm font-bold text-white transition hover:bg-green-700 active:scale-[0.98] disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "เสร็จสิ้น (Serve)"}
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-[#3E2723] py-3 text-sm font-bold text-white transition hover:bg-[#2D1B18] active:scale-[0.98]"
            >
              ปิดหน้าต่าง
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
