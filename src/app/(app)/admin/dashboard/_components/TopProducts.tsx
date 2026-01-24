"use client";

import { api } from "@/trpc/react";
import Image from "next/image";

export function TopProducts() {
  const { data: topProducts, isLoading } =
    api.dashboard.getBestSellers.useQuery({
      limit: 5,
    });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#D7CCC8]/30 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-[#3E2723]">สินค้าขายดี</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="h-12 w-12 animate-pulse rounded-lg bg-gray-200"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!topProducts || topProducts.length === 0) {
    return (
      <div className="rounded-2xl border border-[#D7CCC8]/30 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-[#3E2723]">สินค้าขายดี</h3>
        <p className="text-sm text-[#8D6E63]">ยังไม่มีข้อมูลการขาย</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#D7CCC8]/30 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-[#3E2723]">สินค้าขายดี</h3>
      <div className="space-y-4">
        {topProducts.map((item, index) => (
          <div
            key={item.product.id}
            className="flex items-center justify-between border-b border-[#F5F5F5] pb-4 last:border-0 last:pb-0"
          >
            <div className="flex items-center gap-4">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-[#3E2723] text-xs font-bold text-white">
                {index + 1}
              </div>
              <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-[#F5F5F5]">
                {item.product.image ? (
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-xs font-bold text-[#D7CCC8]">
                    IMG
                  </div>
                )}
              </div>
              <div>
                <p className="line-clamp-1 font-bold text-[#3E2723]">
                  {item.product.nameTh || item.product.name}
                </p>
                <p className="text-xs text-[#8D6E63]">{item.quantity} แก้ว</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-[#3E2723]">
                ฿{item.revenue.toLocaleString()}
              </p>
              <p className="text-xs text-green-600">
                กำไร ฿{item.profit.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
