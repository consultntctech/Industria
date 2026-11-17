import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import "./globals.css";
import Providers, { SnackProvider } from "./dashboard/providers/providers";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Industra",
    template: "%s · Industra",
  },
  description: "Manage your industrial tasks with ease",
  applicationName: "Industra",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F7FB" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0F17" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Applies the saved light/dark class before first paint (no flash). */}
        <InitColorSchemeScript attribute="class" modeStorageKey="industra-theme" defaultMode="system" />
        {/* Collects MUI/Emotion styles during SSR and emits them in <head>, so
            server and client markup match (no hydration mismatch). */}
        <AppRouterCacheProvider>
          <Providers>
            <SnackProvider>
              <Suspense>
                {children}
              </Suspense>
            </SnackProvider>
          </Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
