"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

interface MenuItem {
  label: string;
  href: string;
  roles: ("ADMIN" | "STAFF")[];
}

const menuItems: MenuItem[] = [
  { label: "POS ขายของ", href: "/pos", roles: ["ADMIN", "STAFF"] },
  { label: "Dashboard", href: "/admin/dashboard", roles: ["ADMIN"] },
  { label: "สินค้า", href: "/admin/products", roles: ["ADMIN"] },
  { label: "วัตถุดิบ", href: "/admin/ingredients", roles: ["ADMIN"] },
  { label: "ท็อปปิ้ง", href: "/admin/toppings", roles: ["ADMIN"] },
  { label: "รายงาน", href: "/admin/reports", roles: ["ADMIN"] },
  { label: "ประวัติการขาย", href: "/staff/orders", roles: ["ADMIN", "STAFF"] },
];

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const userRole = (session?.user?.role as "ADMIN" | "STAFF") ?? "STAFF";
  const filteredMenu = menuItems.filter((item) =>
    item.roles.includes(userRole),
  );

  return (
    <aside
      className={`flex h-screen flex-col border-r border-[#D7CCC8]/50 bg-[#FFF8E1] transition-all duration-300 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Header / Logo Section */}
      <div className="flex items-center justify-between p-6">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image
                src="/logo-german.svg"
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-playfair text-xl font-bold text-[#3E2723]">
              German-OneDay
            </span>
          </div>
        ) : (
          <div className="relative mx-auto h-8 w-8">
            <Image
              src="/logo-german.svg"
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-20 -right-3 flex h-6 w-6 items-center justify-center rounded-full border border-[#D7CCC8] bg-white text-[#3E2723] shadow-sm transition-colors hover:bg-[#3E2723] hover:text-white"
      >
        {collapsed ? ">" : "<"}
      </button>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <ul className="space-y-2">
          {filteredMenu.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex items-center rounded-2xl px-4 py-3.5 transition-all duration-200 ${
                    isActive
                      ? "bg-[#3E2723] text-white shadow-lg shadow-[#3E2723]/20"
                      : "text-[#5D4037] hover:bg-[#D7CCC8]/30 hover:text-[#3E2723]"
                  }`}
                >
                  <span className="font-medium tracking-wide">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Profile & Logout Section */}
      <div className="m-4 rounded-3xl border border-[#D7CCC8]/30 bg-white/50 p-4">
        <div
          className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}
        >
          {/* Avatar */}
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border-2 border-[#D7CCC8] bg-white">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt="User"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#3E2723] text-sm font-bold text-white">
                {session?.user?.name?.charAt(0) ?? "U"}
              </div>
            )}
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[#3E2723]">
                {session?.user?.name}
              </p>
              <p className="text-[10px] font-bold tracking-wider text-[#8D6E63] uppercase">
                {userRole === "ADMIN" ? "Administrator" : "Staff Member"}
              </p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={`group mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
            collapsed
              ? "text-red-400 hover:bg-red-50"
              : "bg-[#FBE9E7] text-[#D84315] hover:bg-[#FFCCBC] hover:shadow-sm"
          }`}
        >
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
}
