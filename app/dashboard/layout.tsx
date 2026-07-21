import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { NavBar } from "@/components/NavBar";
import { ReactNode } from "react";
// import Providers from "./providers/providers";

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
      <div className="flex flex-col w-full gap-4 bg-white">
          <Header/>
          <div className="flex flex-row items-start justify-between w-full gap-6">
              <NavBar/>
              <div className="flex flex-row justify-center flex-1 p-4 ml-4">
                  {children}
              </div>
          </div>
          <Footer/>
      </div>
  );
}