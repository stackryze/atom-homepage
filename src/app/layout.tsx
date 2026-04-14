import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Toaster } from 'sonner';
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#d4a574",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Atom",
  description: "Your Self-Hosted Start Page",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Atom",
  },
};

import { StatusProvider } from '@/context/StatusContext';
import { ConfigProvider } from '@/context/ConfigContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geist.variable} suppressHydrationWarning>
        <ThemeProvider>
          <ConfigProvider>
            <StatusProvider>
              {children}
              <Toaster position="bottom-right" theme="system" />
            </StatusProvider>
          </ConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
