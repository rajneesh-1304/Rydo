import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { TaxiiProvider } from "@/context/TaxiiContext";

export const metadata: Metadata = {
  title: "Taxii - Ride Safe. Ride Easy.",
  description: "Taxii Booking & Driver Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AppRouterCacheProvider>
          <TaxiiProvider>
            {children}
          </TaxiiProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
