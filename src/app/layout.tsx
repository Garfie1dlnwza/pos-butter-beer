import "@/styles/globals.css";

import { type Metadata } from "next";
import { Nunito, Prompt } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: "German-OneDay POS",
  description: "Point of Sale System - German-OneDay",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

// Nunito - หัวกลม minimal อ่านง่าย
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-nunito",
});

// Prompt - ฟอนต์ไทยหัวกลม minimal
const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`${nunito.variable} ${prompt.variable}`}>
      <body className={`${prompt.className} text-[#3E2723] antialiased`}>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
