import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/wallet/WalletProvider";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PermiPay Analytics - Permission-Metered Web3 Analytics",
  description: "Stop subscriptions. Start granting usage. Pay only when you actually use advanced analytics features.",
  keywords: ["Web3", "Analytics", "MetaMask", "Advanced Permissions", "ERC-7715", "Base", "Envio"],
  openGraph: {
    title: "PermiPay Analytics",
    description: "Permission-Metered Web3 Analytics Platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased font-sans`}
      >
        <Web3Provider>
          {children}
          <Toaster position="top-right" />
        </Web3Provider>
      </body>
    </html>
  );
}
