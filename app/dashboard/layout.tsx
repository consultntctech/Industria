import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { NavBar } from "@/components/NavBar";
import { CurrencyProvider } from "@/components/currency/CurrencyProvider";
import SessionGuard from "@/components/auth/SessionGuard";
import { ReactNode } from "react";

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
      <CurrencyProvider>
        <SessionGuard/>
        <div className="flex min-h-screen w-full flex-col gap-4">
            <Header/>
            <div className="flex flex-1 flex-row items-stretch justify-between w-full gap-6">
                <NavBar/>
                <main className="flex flex-row justify-center flex-1 min-w-0 p-4 ml-4">
                    {children}
                </main>
            </div>
            <Footer/>
        </div>
      </CurrencyProvider>
  );
}
