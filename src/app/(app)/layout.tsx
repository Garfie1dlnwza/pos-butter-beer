import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/app/_components/Sidebar";
import { MobileNav } from "@/app/_components/MobileNav";
import { ToastProvider } from "@/components/Toast";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <SessionProvider session={session}>
      <ToastProvider>
        <div className="flex h-dvh flex-col bg-[#FAFAFA] lg:flex-row">
          <MobileNav />
          <Sidebar className="hidden lg:flex" />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </ToastProvider>
    </SessionProvider>
  );
}
