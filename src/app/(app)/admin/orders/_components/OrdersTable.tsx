interface OrderItem {
  id: string;
  product: {
    name: string;
    nameTh: string | null;
  };
  quantity: number;
  unitPrice: number;
  sweetness: number;
  toppings: string | null;
  note: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  discount: number;
  netAmount: number;
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
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-sm text-[#5D4037]">
        <thead>
          <tr className="border-b border-[#D7CCC8]/30 text-[#8D6E63]">
            <th className="px-6 py-4 font-bold">Order No.</th>
            <th className="px-6 py-4 font-bold">Time</th>
            <th className="px-6 py-4 font-bold">Total</th>
            <th className="px-6 py-4 font-bold">Status</th>
            <th className="px-6 py-4 font-bold">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-[#8D6E63]">
                ไม่มีรายการคำสั่งซื้อ
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-[#F5F5F5] transition hover:bg-[#FAFAFA]"
              >
                <td className="px-6 py-4 font-medium">{order.orderNumber}</td>
                <td className="px-6 py-4">
                  {new Date(order.createdAt).toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-6 py-4 font-bold">
                  <span>฿{order.netAmount.toLocaleString()}</span>
                  {order.discount > 0 && (
                    <span className="ml-2 text-xs font-medium text-red-500">
                      (-฿{order.discount.toLocaleString()})
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      order.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : order.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onViewDetail(order)}
                    className="font-bold text-[#8D6E63] hover:text-[#5D4037] hover:underline"
                  >
                    รายละเอียด
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
