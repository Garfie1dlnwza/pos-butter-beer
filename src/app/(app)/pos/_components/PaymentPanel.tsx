"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import type { CartItem } from "../page";
import generatePayload from "promptpay-qr";
import QRCode from "qrcode";
import { useToast } from "@/components/Toast";

interface PaymentPanelProps {
  items: CartItem[];
  total: number;
  onComplete: () => void;
  onClose: () => void;
}

// Minimal Payment Options
const PAYMENT_METHODS = [
  { id: "cash", label: "Cash", labelTh: "เงินสด" },
  { id: "qr", label: "QR Payment", labelTh: "สแกนจ่าย" },
] as const;

// TODO: Move to settings
const MERCHANT_PROMPTPAY_ID = "0933244055"; // Replace with actual PromptPay ID

export function PaymentPanel({
  items,
  total,
  onComplete,
  onClose,
}: PaymentPanelProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const { showToast } = useToast();

  useEffect(() => {
    if (paymentMethod === "qr" && total > 0) {
      try {
        const payload = generatePayload(MERCHANT_PROMPTPAY_ID, {
          amount: total,
        });
        QRCode.toDataURL(payload, { margin: 1 })
          .then((url) => setQrCodeUrl(url))
          .catch((err) => console.error("QR Gen Error", err));
      } catch (e) {
        console.error("Payload Gen Error", e);
      }
    }
  }, [paymentMethod, total]);

  const createOrder = api.orders.create.useMutation({
    onSuccess: () => {
      onComplete();
    },
    onError: (error) => {
      showToast("Error: " + error.message, "error");
      setIsProcessing(false);
    },
  });

  const change = cashReceived - total;

  const handlePayment = async () => {
    if (paymentMethod === "cash" && cashReceived < total) {
      showToast("จำนวนเงินไม่เพียงพอ (Insufficient Amount)", "error");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300">
      <div className="animate-in fade-in zoom-in-95 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F5F5F5] px-6 py-5">
          <h3 className="font-playfair text-xl font-bold text-[#3E2723]">
            Payment
          </h3>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-full p-2 text-[#D7CCC8] transition-colors hover:bg-[#FAFAFA] hover:text-[#3E2723]"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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
        <div className="p-6">
          {/* Total Display */}
          <div className="mb-8 flex flex-col items-center justify-center py-4">
            <span className="text-sm font-bold tracking-[0.2em] text-[#8D6E63] uppercase">
              Total Amount
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-semibold text-[#3E2723]">฿</span>
              <span className="font-playfair text-5xl font-black text-[#3E2723]">
                {total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Method Selection (2 Columns) */}
          <div className="mb-8 grid grid-cols-2 gap-4">
            {PAYMENT_METHODS.map((method) => {
              const isActive = paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`group relative flex h-20 flex-col items-center justify-center rounded-xl border-2 transition-all duration-200 ${
                    isActive
                      ? "border-[#3E2723] bg-[#3E2723] text-white shadow-lg shadow-[#3E2723]/20"
                      : "border-[#EEEEEE] bg-white text-[#8D6E63] hover:border-[#D7CCC8] hover:bg-[#FAFAFA]"
                  }`}
                >
                  <span
                    className={`text-sm font-bold ${isActive ? "text-white" : "text-[#3E2723]"}`}
                  >
                    {method.label}
                  </span>
                  <span
                    className={`text-xs ${isActive ? "text-[#D7CCC8]" : "text-[#A1887F]"}`}
                  >
                    {method.labelTh}
                  </span>

                  {/* Active Indicator Check */}
                  {isActive && (
                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#FFF8E1]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Cash Input Section */}
          {paymentMethod === "cash" && (
            <div className="animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="mb-4 flex items-center justify-between rounded-xl border border-[#F0F0F0] bg-[#FAFAFA] p-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold tracking-wide text-[#8D6E63] uppercase">
                    Received
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-[#3E2723]">฿</span>
                    <input
                      type="number"
                      min="0"
                      value={cashReceived === 0 ? "" : cashReceived}
                      onChange={(e) => setCashReceived(Number(e.target.value))}
                      className="w-32 bg-transparent text-2xl font-bold text-[#3E2723] outline-none placeholder:text-[#D7CCC8]"
                      placeholder="0"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="mx-4 h-8 w-[1px] bg-[#D7CCC8]/40"></div>

                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold tracking-wide text-[#8D6E63] uppercase">
                    Change
                  </span>
                  <span
                    className={`text-2xl font-bold ${change < 0 ? "text-red-400" : "text-emerald-600"}`}
                  >
                    ฿{Math.max(0, change).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Quick Money Buttons */}
              <div className="mb-2 grid grid-cols-4 gap-2">
                {quickCashButtons.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setCashReceived((prev) => prev + amount)}
                    className="rounded-lg border border-[#D7CCC8]/50 bg-white py-2 text-sm font-bold text-[#5D4037] transition-all hover:border-[#D7CCC8] hover:bg-[#EFEBE9] active:scale-95"
                  >
                    +{amount}
                  </button>
                ))}
                <button
                  onClick={() => setCashReceived(0)}
                  className="col-span-1 rounded-lg border border-red-100 bg-red-50/50 py-2 text-sm font-bold text-red-500 transition-colors hover:bg-red-100"
                >
                  Clear
                </button>
              </div>

              <button
                onClick={() => setCashReceived(total)}
                className="mt-2 w-full rounded-lg bg-[#EFEBE9] py-2 text-sm font-bold text-[#5D4037] transition-colors hover:bg-[#D7CCC8]"
              >
                Pay Exact (พอดี)
              </button>
            </div>
          )}

          {/* QR Code Placeholder Section */}
          {paymentMethod === "qr" && (
            <div className="animate-in zoom-in-95 fade-in flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-[#F0F0F0] bg-[#FAFAFA] p-6 text-center duration-300">
              <div className="mb-4 rounded-xl bg-white p-3 shadow-md">
                {qrCodeUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={qrCodeUrl}
                    alt="PromptPay QR"
                    className="h-48 w-48 object-contain"
                  />
                ) : (
                  <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-gray-50">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3E2723]/20 border-t-[#3E2723]" />
                  </div>
                )}
              </div>
              <p className="text-lg font-bold text-[#3E2723]"> Scan to Pay</p>
              <p className="text-sm font-medium text-[#8D6E63]">
                PromptPay (พร้อมเพย์)
              </p>
              <p className="mt-1 text-xs text-[#BDBDBD]">
                ยอดชำระ: ฿{total.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#F5F5F5] bg-[#FAFAFA]/50 p-6">
          <button
            onClick={handlePayment}
            disabled={
              isProcessing || (paymentMethod === "cash" && cashReceived < total)
            }
            className="group w-full rounded-xl bg-[#3E2723] py-4 text-white shadow-lg shadow-[#3E2723]/20 transition-all hover:bg-[#2D1B18] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#D7CCC8] disabled:shadow-none"
          >
            <div className="flex items-center justify-center gap-2">
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  <span className="font-bold">Processing...</span>
                </>
              ) : (
                <span className="text-lg font-bold tracking-wide">
                  Confirm Payment
                </span>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
