"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home, Package, CreditCard } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLElement | null>(null);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) setIsOpen(false);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Cerrar sidebar cuando se hace click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!isOpen) return; // sólo si está abierto
      const target = e.target as Node | null;
      if (!sidebarRef.current) return;
      if (target && sidebarRef.current.contains(target)) return; // click dentro
      // click fuera
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const menuItems = [
    { label: "Caja", path: "/home/dashboard", icon: Home },
    { label: "Inventario", path: "/home/inventario", icon: Package },
    { label: "Ventas", path: "/home/ventas", icon: CreditCard },
  ];

  return (
    <>
      {/* Botón flotante transparente cuando el sidebar está cerrado */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-3 bg-blue-600/80 text-white rounded-full hover:bg-blue-700/90 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl"
          style={{ transition: "all 0.3s ease" }}
        >
          <Menu size={24} />
        </button>
      )}

      {/* Overlay para cerrar el sidebar en móviles */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed bg-gradient-to-b from-blue-800 to-blue-900 text-white p-4 pt-16 flex flex-col gap-3 h-full z-40 transition-all duration-300
          ${isOpen ? "w-64 translate-x-0" : "-translate-x-full"}`}
        style={{ transition: "transform 0.3s ease" }}
      >
        {/* Botón de cerrar dentro del sidebar */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-md hover:bg-blue-700/50 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="font-bold text-xl mb-2 flex items-center gap-2">
          <div className="p-2 bg-blue-700 rounded-lg">
            <Menu size={20} />
          </div>
          Menú Principal
        </h2>

        <div className="h-px bg-blue-600/50 my-2"></div>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  pathname === item.path
                    ? "bg-blue-600 shadow-inner"
                    : "hover:bg-blue-700/60 bg-blue-800/30"
                }`}
                onClick={() => isMobile && setIsOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4 text-center text-blue-300 text-sm">
          Sistema v1.0
        </div>
      </aside>

      {/* Contenido principal */}
      <main></main>
    </>
  );
}
