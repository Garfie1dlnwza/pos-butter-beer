"use client";

import { useState } from "react";
import { OrderDetailModal, type OrderDetail } from "./OrderDetailModal";

interface OrdersClientProps {
  orders: OrderDetail[];
  totalSales: number;
  totalCount: number;
}

export default function OrdersClient({
  orders,
  totalSales,
  totalCount,
}: OrdersClientProps) {
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <main className="max-w-8xl mx-auto p-6 lg:p-10">
        {/* Mobile Stats (Visible only on small screens) */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:hidden">
          <div className="rounded-xl border border-[#D7CCC8]/40 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold tracking-wider text-[#8D6E63] uppercase">
              ยอดขายวันนี้
            </p>
            <p className="text-2xl font-bold text-[#3E2723]">
              ฿{totalSales.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-[#D7CCC8]/40 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold tracking-wider text-[#8D6E63] uppercase">
              ออเดอร์
            </p>
            <p className="text-2xl font-bold text-[#3E2723]">{totalCount}</p>
          </div>
        </div>

        {/* Orders Grid */}
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EFEBE9] text-4xl">
              🧾
            </div>
            <h3 className="mt-4 text-lg font-bold text-[#5D4037]">
              ยังไม่มีรายการขาย
            </h3>
            <p className="text-sm text-[#8D6E63]">
              รายการขายวันนี้จะปรากฏที่นี่
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#E0E0E0] bg-white transition-all hover:-translate-y-1 hover:border-[#D7CCC8] hover:shadow-xl hover:shadow-[#3E2723]/5"
              >
                {/* Status Strip */}
                <div
                  className={`absolute top-0 left-0 h-full w-1 ${
                    order.status === "completed"
                      ? "bg-green-500"
                      : order.status === "cancelled"
                        ? "bg-red-500"
                        : "bg-gray-300"
                  }`}
                />

                {/* Header */}
                <div className="flex items-start justify-between border-b border-[#F5F5F5] bg-[#FAFAFA]/50 p-4 pl-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-bold text-[#3E2723]">
                        #{order.orderNumber.toString().slice(-4)}
                      </span>
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
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
                    <div className="mt-1 flex items-center gap-2 text-xs font-medium text-[#8D6E63]">
                      <span>{formatTime(order.createdAt)}</span>
                      <span>•</span>
                      <span>{order.createdBy?.name ?? "Staff"}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#3E2723]">
                      ฿{order.netAmount.toLocaleString()}
                    </p>
                    {order.discount > 0 && (
                      <p className="text-xs font-medium text-red-500">
                        (-฿{order.discount.toLocaleString()})
                      </p>
                    )}
                    <p className="text-[10px] font-bold text-[#A1887F] uppercase">
                      {order.paymentMethod === "qr" ? "QR Code" : " เงินสด"}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="flex-1 p-4 pl-5">
                  <div className="space-y-2">
                    {order.items.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded bg-[#EFEBE9] text-xs font-bold text-[#5D4037]">
                            {item.quantity}
                          </span>
                          <span className="line-clamp-1 font-medium text-[#5D4037]">
                            {item.product.nameTh ?? item.product.name}
                          </span>
                        </div>
                        <span className="text-[#8D6E63]">
                          ฿{(item.unitPrice * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <p className="pt-1 text-center text-xs font-medium text-[#BDBDBD] italic">
                        + อีก {order.items.length - 4} รายการ
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-[#F5F5F5] bg-[#FAFAFA] px-4 py-3 pl-5 text-xs">
                  <span className="text-[#8D6E63]">
                    {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
                  </span>
                  <button className="font-bold text-[#3E2723] transition hover:text-[#5D4037] hover:underline">
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </>
  );
}
