import { auth } from "@/server/auth";
import { db } from "@/server/db";

export default async function DashboardPage() {
  const session = await auth();

  // Get today's summary
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const orders = await db.order.findMany({
    where: {
      createdAt: { gte: today },
      status: "completed",
    },
    include: {
      items: true,
    },
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCups = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
    0,
  );

  // Get low stock items
  const lowStock = await db.ingredient.findMany({
    where: {
      currentStock: {
        lte: db.ingredient.fields.minStock,
      },
    },
    take: 5,
  });

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold text-white">📊 Dashboard</h1>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 p-6">
          <div className="text-sm text-green-300">ยอดขายวันนี้</div>
          <div className="mt-2 text-4xl font-black text-green-400">
            ฿{totalRevenue.toLocaleString()}
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 p-6">
          <div className="text-sm text-amber-300">แก้วที่ขายได้</div>
          <div className="mt-2 text-4xl font-black text-amber-400">
            {totalCups} แก้ว
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 p-6">
          <div className="text-sm text-blue-300">จำนวนออเดอร์</div>
          <div className="mt-2 text-4xl font-black text-blue-400">
            {orders.length} รายการ
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="rounded-2xl bg-gray-800 p-6">
        <h2 className="mb-4 text-xl font-bold text-white">
          ⚠️ วัตถุดิบใกล้หมด
        </h2>
        {lowStock.length === 0 ? (
          <p className="text-gray-400">ไม่มีรายการที่ต้องเติม</p>
        ) : (
          <div className="space-y-3">
            {lowStock.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl bg-red-500/10 p-4"
              >
                <span className="text-white">{item.name}</span>
                <span className="text-red-400">
                  เหลือ {item.currentStock} {item.unit}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
