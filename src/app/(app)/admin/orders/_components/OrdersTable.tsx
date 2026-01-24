"use client";

import { useState } from "react";

interface OrderItem {
  id: string;
  product: {
    name: string;
    nameTh: string | null;
  };
  quantity: number;
  unitPrice: number;
  sweetness: number;
  toppings: string | null; // JSON string
  note: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: Date;
  createdBy: {
    name: string | null;
  } | null;
  items: OrderItem[];
}

interface OrdersTableProps {
  orders: Order[];
  onViewDetail: (order: Order) => void;
}

export function OrdersTable({ orders, onViewDetail }: OrdersTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
            สำเร็จ
          </span>
        );
      case "cancelled":
        return (
          <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
            ยกเลิก
          </span>
        );
      case "pending":
        return (
          <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
            รอดำเนินการ
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
            {status}
          </span>
        );
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cash":
        return "เงินสด";
      case "qr":
        return "QR Code";
      case "card":
        return "บัตรเครดิต";
      case "grab":
        return "Grab";
      case "lineman":
        return "LINE MAN";
      default:
        return method;
    }
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF8E1]">
          <svg
            className="h-8 w-8 text-[#D7CCC8]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-[#3E2723]">ยังไม่มีรายการสั่งซื้อ</p>
          <p className="mt-1 text-sm text-[#8D6E63]">
            รายการขายจะปรากฏที่นี่เมื่อมีการสั่งซื้อจาก POS
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setStatusFilter("all")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            statusFilter === "all"
              ? "bg-[#3E2723] text-white"
              : "bg-white text-[#5D4037] hover:bg-[#F5F5F5]"
          }`}
        >
          ทั้งหมด
        </button>
        <button
          onClick={() => setStatusFilter("completed")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            statusFilter === "completed"
              ? "bg-emerald-600 text-white"
              : "bg-white text-[#5D4037] hover:bg-[#F5F5F5]"
          }`}
        >
          สำเร็จ
        </button>
        <button
          onClick={() => setStatusFilter("cancelled")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            statusFilter === "cancelled"
              ? "bg-red-600 text-white"
              : "bg-white text-[#5D4037] hover:bg-[#F5F5F5]"
          }`}
        >
          ยกเลิก
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#D7CCC8]/30 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E0E0E0] bg-[#FAFAFA]">
                <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-[#8D6E63] uppercase">
                  Order No.
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-[#8D6E63] uppercase">
                  วันที่
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-[#8D6E63] uppercase">
                  รายการ
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold tracking-wider text-[#8D6E63] uppercase">
                  ยอดรวม
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold tracking-wider text-[#8D6E63] uppercase">
                  ชำระเงิน
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold tracking-wider text-[#8D6E63] uppercase">
                  สถานะ
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold tracking-wider text-[#8D6E63] uppercase">
                  พนักงาน
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold tracking-wider text-[#8D6E63] uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F5]">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="transition-colors hover:bg-[#FFF8E1]/30"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono font-medium text-[#3E2723]">
                      #{order.orderNumber.split("-").pop()}
                    </span>
                    <div className="text-[10px] text-[#BDBDBD]">
                      {order.orderNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#5D4037]">
                    {order.createdAt.toLocaleString("th-TH", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[#3E2723]">
                      {order.items.length} รายการ
                    </div>
                    <div className="line-clamp-1 text-xs text-[#8D6E63]">
                      {order.items
                        .map((item) => item.product.nameTh || item.product.name)
                        .join(", ")}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-[#3E2723]">
                      ฿{order.totalAmount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-[#5D4037]">
                    {getPaymentMethodLabel(order.paymentMethod)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-[#5D4037]">
                    {order.createdBy?.name ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onViewDetail(order)}
                      className="cursor-pointer rounded-lg bg-[#3E2723] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#2D1B18]"
                    >
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
