import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist, Playfair_Display, IBM_Plex_Sans_Thai } from "next/font/google"; // นำเข้าฟอนต์ไทย

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: "Butter Beer POS",
  description: "Point of Sale System - Butter Beer",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const ibmPlexThai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-thai",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`${geist.variable} ${playfair.variable} ${ibmPlexThai.variable}`}>
      <body className="font-sans antialiased text-[#3E2723]">
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}