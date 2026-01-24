"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface MenuItem {
  label: string;
  href: string;
  roles: ("ADMIN" | "STAFF")[];
}

const menuItems: MenuItem[] = [
  { label: "POS", href: "/pos", roles: ["ADMIN", "STAFF"] },
  { label: "กะ/Shift", href: "/staff/shifts", roles: ["ADMIN", "STAFF"] },
  { label: "สินค้า", href: "/admin/products", roles: ["ADMIN"] },
  { label: "วัตถุดิบ", href: "/admin/ingredients", roles: ["ADMIN"] },
  { label: "สต็อก", href: "/admin/inventory", roles: ["ADMIN"] },
  { label: "ท็อปปิ้ง", href: "/admin/toppings", roles: ["ADMIN"] },
  { label: "รายจ่าย", href: "/admin/expenses", roles: ["ADMIN"] },
  { label: "แดชบอร์ด", href: "/admin/dashboard", roles: ["ADMIN", "STAFF"] },
  { label: "รายงาน", href: "/admin/reports", roles: ["ADMIN"] },
  { label: "ประวัติการขาย", href: "/staff/orders", roles: ["ADMIN", "STAFF"] },
  { label: "จัดการหมวดหมู่", href: "/admin/categories", roles: ["ADMIN"] },
];

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const userRole = (session?.user?.role as "ADMIN" | "STAFF") ?? "STAFF";
  const filteredMenu = menuItems.filter((item) =>
    item.roles.includes(userRole),
  );

  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-[#D7CCC8]/60 bg-[#FFF8E1] md:flex">
      {/* 1. Logo Section - Minimal & Clean */}
      <div className="flex flex-col items-center justify-center pt-10 pb-8">
        <div className="relative mb-3 h-16 w-16">
          <Image
            src="/logo-german.svg"
            alt="German-OneDay"
            fill
            className="object-contain"
            priority
          />
        </div>
        <span className="text-xl font-bold tracking-tight text-[#3E2723]">
          German-OneDay
        </span>
      </div>

      {/* 2. Navigation Menu - Typography Focused */}
      <nav className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-1">
          {filteredMenu.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between rounded-lg px-4 py-3 text-sm transition-all duration-300 ${
                  isActive
                    ? "bg-[#3E2723] font-semibold text-white shadow-md shadow-[#3E2723]/10"
                    : "font-medium text-[#5D4037] hover:bg-[#D7CCC8]/40 hover:text-[#3E2723]"
                }`}
              >
                <span className="tracking-wide">{item.label}</span>
                {/* Minimal Active Indicator Dot */}
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FFF8E1]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 3. Footer / Profile Section */}
      <div className="border-t border-[#D7CCC8]/60 bg-[#FFF8E1] p-6">
        <div className="mb-4 flex items-center gap-3">
          {/* Avatar */}
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#D7CCC8] shadow-sm">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt="User"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#D7CCC8] font-bold text-[#3E2723]">
                {session?.user?.name?.charAt(0) ?? "U"}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[#3E2723]">
              {session?.user?.name}
            </p>
            <p className="text-[11px] font-semibold tracking-wider text-[#8D6E63] uppercase">
              {userRole === "ADMIN" ? "Administrator" : "Staff Member"}
            </p>
          </div>
        </div>

        {/* Minimal Logout Button */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full rounded-lg border border-[#D7CCC8] py-2 text-xs font-semibold text-[#5D4037] transition-colors hover:border-[#3E2723] hover:bg-[#3E2723] hover:text-white"
        >
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}
