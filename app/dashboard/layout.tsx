import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { NavBar } from "@/components/NavBar";
import { ReactNode } from "react";
import Providers from "./providers/providers";

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <Providers>
      <div className="w-full flex flex-col gap-4 bg-white">
          <Header/>
          <div className="flex justify-between flex-row w-full items-start gap-6">
              <NavBar/>
              <div className="flex flex-row justify-center flex-1 ml-4 p-4">
                  {children}
              </div>
          </div>
          <Footer/>
      </div>
    </Providers>
  );
}