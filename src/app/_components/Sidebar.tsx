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

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

// จัดกลุ่มเมนู
const menuGroups: MenuGroup[] = [
  {
    title: "Operations",
    items: [
      { label: "POS", href: "/pos", roles: ["ADMIN", "STAFF"] },
      {
        label: "ประวัติการขาย",
        href: "/staff/orders",
        roles: ["ADMIN", "STAFF"],
      },
      { label: "กะ/Shift", href: "/staff/shifts", roles: ["ADMIN", "STAFF"] },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "สินค้า", href: "/admin/products", roles: ["ADMIN"] },
      { label: "หมวดหมู่", href: "/admin/categories", roles: ["ADMIN"] },
      { label: "ท็อปปิ้ง", href: "/admin/toppings", roles: ["ADMIN"] },
      {
        label: "สต็อก & วัตถุดิบ",
        href: "/admin/ingredients",
        roles: ["ADMIN"],
      },
    ],
  },
  {
    title: "Business",
    items: [
      { label: "รายงาน", href: "/admin/reports", roles: ["ADMIN"] },
      { label: "รายจ่าย", href: "/admin/expenses", roles: ["ADMIN"] },
      { label: "รายรับอื่นๆ", href: "/admin/incomes", roles: ["ADMIN"] },
      {
        label: "ประวัติการเปิดปิดกะ",
        href: "/admin/shifts",
        roles: ["ADMIN", "STAFF"],
      },
    ],
  },
];

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const userRole = (session?.user?.role as "ADMIN" | "STAFF") ?? "STAFF";

  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-[#D7CCC8]/60 bg-[#FFF8E1] md:flex">
      {/* 1. Logo Section */}
      <div className="flex flex-col items-center justify-center pt-10 pb-6">
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

      {/* 2. Navigation Menu with Sections */}
      <nav className="scrollbar-hide flex-1 overflow-y-auto px-4 py-2">
        {menuGroups.map((group) => {
          // Filter items based on Role inside the group
          const visibleItems = group.items.filter((item) =>
            item.roles.includes(userRole),
          );

          // If no items in this group are visible for this role, don't render the group
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="mb-6">
              {/* Section Header */}
              <h3 className="mb-2 px-4 text-[10px] font-bold tracking-widest text-[#A1887F] uppercase">
                {group.title}
              </h3>

              {/* Group Items */}
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center justify-between rounded-lg px-4 py-2.5 text-sm transition-all duration-300 ${
                        isActive
                          ? "bg-[#3E2723] font-semibold text-white shadow-md shadow-[#3E2723]/10"
                          : "font-medium text-[#5D4037] hover:bg-[#D7CCC8]/40 hover:text-[#3E2723]"
                      }`}
                    >
                      <span className="tracking-wide">{item.label}</span>
                      {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FFF8E1]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* 3. Footer / Profile Section */}
      <div className="border-t border-[#D7CCC8]/60 bg-[#FFF8E1] p-6">
        <div className="mb-4 flex items-center gap-3">
          {/* Avatar */}
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#D7CCC8] shadow-sm">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt="User"
                fill
                className="object-cover"
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
