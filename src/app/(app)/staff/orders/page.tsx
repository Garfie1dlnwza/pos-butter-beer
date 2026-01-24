import { db } from "@/server/db";

export default async function OrdersPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const orders = await db.order.findMany({
    where: {
      createdAt: { gte: today },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      createdBy: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold text-white">
        📋 ประวัติการขายวันนี้
      </h1>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <p className="text-gray-400">ยังไม่มีรายการขายวันนี้</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="rounded-2xl bg-gray-800 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">
                    #{order.orderNumber}
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(order.createdAt).toLocaleTimeString("th-TH")} •{" "}
                    {order.paymentMethod.toUpperCase()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-amber-400">
                    ฿{order.totalAmount.toLocaleString()}
                  </div>
                  <div
                    className={`text-sm ${
                      order.status === "completed"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {order.status === "completed" ? "✅ สำเร็จ" : "❌ ยกเลิก"}
                  </div>
                </div>
              </div>

              <div className="mt-3 border-t border-gray-700 pt-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-300">
                      {item.product.nameTh ?? item.product.name} x
                      {item.quantity}
                    </span>
                    <span className="text-gray-400">
                      ฿{(item.unitPrice * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
