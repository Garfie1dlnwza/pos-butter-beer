"use client";

import { Modal } from "./Modal";

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

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export function OrderDetailModal({
  isOpen,
  onClose,
  order,
}: OrderDetailModalProps) {
  if (!order) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
            สำเร็จ
          </span>
        );
      case "cancelled":
        return (
          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
            ยกเลิก
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`รายละเอียดออเดอร์ #${order.orderNumber.split("-").pop()}`}
    >
      <div className="space-y-6">
        {/* Status & Meta */}
        <div className="flex items-center justify-between rounded-xl bg-[#FAFAFA] p-4 text-sm">
          <div>
            <p className="font-medium text-[#8D6E63]">รหัสออเดอร์</p>
            <p className="font-mono font-bold text-[#3E2723]">
              {order.orderNumber}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium text-[#8D6E63]">วันที่สั่งซื้อ</p>
            <p className="font-bold text-[#3E2723]">
              {order.createdAt.toLocaleString("th-TH")}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#8D6E63]">สถานะ:</span>
            {getStatusBadge(order.status)}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#8D6E63]">
              พนักงานขาย:
            </span>
            <span className="font-bold text-[#3E2723]">
              {order.createdBy?.name ?? "-"}
            </span>
          </div>
        </div>

        {/* Items List */}
        <div className="overflow-hidden rounded-xl border border-[#E0E0E0]">
          <table className="w-full text-sm">
            <thead className="bg-[#EFEBE9] text-[#5D4037]">
              <tr>
                <th className="px-4 py-2 text-left">รายการ</th>
                <th className="px-4 py-2 text-center">จำนวน</th>
                <th className="px-4 py-2 text-right">รวม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F5]">
              {order.items.map((item) => {
                const toppings = item.toppings
                  ? (JSON.parse(item.toppings) as Array<{
                      name: string;
                      price: number;
                    }>)
                  : [];
                return (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <p className="font-bold text-[#3E2723]">
                        {item.product.nameTh || item.product.name}
                      </p>
                      <p className="text-xs text-[#8D6E63]">
                        ความหวาน: {item.sweetness}%
                      </p>
                      {toppings.length > 0 && (
                        <p className="text-xs text-[#8D6E63]">
                          + {toppings.map((t) => t.name).join(", ")}
                        </p>
                      )}
                      {item.note && (
                        <p className="mt-1 text-xs text-[#A1887F] italic">
                          * {item.note}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center align-top font-medium text-[#5D4037]">
                      x{item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right align-top font-bold text-[#3E2723]">
                      ฿
                      {(
                        (item.unitPrice +
                          toppings.reduce((acc, t) => acc + t.price, 0)) *
                        item.quantity
                      ).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Total Summary */}
        <div className="space-y-2 border-t border-[#E0E0E0] pt-4">
          <div className="flex justify-between text-sm text-[#5D4037]">
            <span>ยอดรวมสินค้า</span>
            <span>฿{order.totalAmount.toLocaleString()}</span>
          </div>
          {/* Discount details could be here if we tracked default price vs actual */}
          <div className="flex justify-between text-lg font-bold text-[#3E2723]">
            <span>ยอดสุทธิ</span>
            <span>฿{order.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-[#8D6E63]">
            <span>ชำระโดย</span>
            <span className="uppercase">{order.paymentMethod}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-[#D7CCC8] px-4 py-2 text-sm font-bold text-[#5D4037] transition hover:bg-[#F5F5F5]"
          >
            ปิด
          </button>
          <button className="rounded-xl bg-[#3E2723] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#2D1B18]">
            พิมพ์ใบเสร็จ
          </button>
        </div>
      </div>
    </Modal>
  );
}
