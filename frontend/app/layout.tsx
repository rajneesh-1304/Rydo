import type { Metadata } from "next";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { TaxiiProvider } from "@/context/TaxiiContext";
import { StoreProvider } from "@/store/StoreProvider";

export const metadata: Metadata = {
  title: "Taxii - Ride Safe. Ride Easy.",
  description: "Taxii Booking & Driver Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AppRouterCacheProvider>
          <StoreProvider>
            <TaxiiProvider>
              {children}
            </TaxiiProvider>
          </StoreProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
