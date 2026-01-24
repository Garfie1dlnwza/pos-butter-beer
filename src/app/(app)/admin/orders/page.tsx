"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { OrdersTable } from "./_components/OrdersTable";
import { OrderDetailModal } from "./_components/OrderDetailModal";

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

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Poll every 10 seconds for new orders
  const { data: orders, isLoading } = api.orders.getAll.useQuery(undefined, {
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#FAFAFA]">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#D7CCC8] border-t-[#3E2723]"></div>
        <span className="mt-4 text-xs font-bold tracking-widest text-[#3E2723] uppercase">
          Loading Orders
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
            ประวัติการขาย
          </h1>
          <p className="mt-2 text-sm font-medium tracking-wide text-[#8D6E63]">
            รายการออเดอร์ทั้งหมด
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <OrdersTable
          orders={orders ?? []}
          onViewDetail={(order) => setSelectedOrder(order)}
        />
      </main>

      {/* Detail Modal */}
      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  );
}
