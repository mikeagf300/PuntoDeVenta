// src/app/home/layout.tsx
import Navbar from "@/components/Navbar/Navbar";
import Sidebar from "@/components/Sidebar/Sidebar";
import { ReactNode } from "react";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <section className="flex-1 overflow-auto">
        <Navbar />
        {children}
      </section>
    </div>
  );
}
