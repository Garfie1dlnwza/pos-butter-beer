"use client";

import { X, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Sidebar } from "./Sidebar";
import { usePathname } from "next/navigation";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scrolling when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="flex h-16 items-center justify-between border-b border-[#D7CCC8]/60 bg-[#FFF8E1] px-4 shadow-sm lg:hidden">
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8">
            <Image
              src="/logo-german.svg"
              alt="German-OneDay"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-lg font-bold text-[#3E2723]">
            German-OneDay
          </span>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="rounded-lg p-2 text-[#5D4037] hover:bg-[#D7CCC8]/30 active:scale-95"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Sidebar Drawer */}
          <div className="absolute inset-y-0 left-0 w-64 shadow-2xl transition-transform duration-300">
            <Sidebar
              onClose={() => setIsOpen(false)}
              className="h-full w-full border-r-0"
            />

            {/* Close Button Inside Drawer */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-[-40px] rounded-full bg-white p-2 text-[#3E2723] shadow-md hover:bg-[#FFF8E1] md:hidden"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
