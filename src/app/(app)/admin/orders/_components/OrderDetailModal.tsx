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
  toppings: string | null;
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order ${order.orderNumber}`}
    >
      <div className="space-y-4">
        <div className="flex justify-between border-b pb-2">
          <span className="font-bold">Status</span>
          <span>{order.status}</span>
        </div>
        <div className="space-y-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.product.name}
              </span>
              <span>฿{item.unitPrice * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t pt-2 font-bold">
          <span>Total</span>
          <span>฿{order.totalAmount}</span>
        </div>
      </div>
    </Modal>
  );
}
