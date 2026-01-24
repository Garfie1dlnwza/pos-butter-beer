import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/app/_components/Sidebar";
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
        <div className="flex h-screen bg-gray-950">
          <Sidebar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </ToastProvider>
    </SessionProvider>
  );
}
