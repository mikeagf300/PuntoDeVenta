//src/app/home/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import NuevaVenta from "@/components/DashboardViews/NuevaVenta";
import AgregarProducto from "@/components/DashboardViews/AgregarProducto";
import RegistrarGasto from "@/components/DashboardViews/RegistrarGasto";
import { Gasto } from "@/interfaces/gastos";
import { getSales } from "@/lib/api";

export default function Dashboard() {
  const [activeView, setActiveView] = useState<"nueva" | "producto" | "gasto">(
    "nueva"
  );
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sales, setSales] = useState<Array<{ total: number; date: Date }>>([]);

  // Helper para parsear fechas que vienen como '8/9/2025, 3:28:41 p.m.' u otros locales
  const parseDateString = (s?: string): Date => {
    if (!s) return new Date(NaN);
    // intento nativo primero
    const native = new Date(s);
    if (!isNaN(native.getTime())) return native;

    // normalizar 'a.m.' / 'p.m.' -> AM/PM y quitar puntos
    const normalized = s
      .replace(/\./g, "")
      .replace(/\s*a\s*m\s*/gi, " AM")
      .replace(/\s*p\s*m\s*/gi, " PM")
      .trim();
    // separar parte de fecha y hora por la coma
    const parts = normalized.split(",");
    if (parts.length >= 2) {
      const datePart = parts[0].trim(); // e.g. '8/9/2025'
      const timePart = parts.slice(1).join(",").trim(); // e.g. '3:28:41 PM'
      const dateSeg = datePart.split("/").map((x) => x.trim());
      if (dateSeg.length === 3) {
        const dnum = Number(dateSeg[0]);
        const mnum = Number(dateSeg[1]);
        const ynum = Number(dateSeg[2]);
        if (!isNaN(dnum) && !isNaN(mnum) && !isNaN(ynum)) {
          const timeMatch = timePart.match(
            /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i
          );
          let hh = 0,
            mm = 0,
            ss = 0;
          if (timeMatch) {
            hh = Number(timeMatch[1]);
            mm = Number(timeMatch[2]);
            ss = Number(timeMatch[3] || "0");
            const ampm = timeMatch[4];
            if (ampm) {
              if (ampm.toUpperCase() === "PM" && hh < 12) hh += 12;
              if (ampm.toUpperCase() === "AM" && hh === 12) hh = 0;
            }
          }
          return new Date(ynum, mnum - 1, dnum, hh, mm, ss);
        }
      }
    }
    // no parsable
    return new Date(NaN);
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getSales();
        if (!mounted) return;
        const mapped = (data || []).map((s: unknown) => {
          const obj = s as Record<string, unknown>;
          // total: prefer numeric total, otherwise sum items totals if present
          let total = 0;
          if (typeof obj.total === "number") {
            total = obj.total;
          } else if (Array.isArray(obj.items)) {
            const items = obj.items as unknown[];
            total = items.reduce<number>((sum, it) => {
              const t = (it as Record<string, unknown>).total;
              return sum + (typeof t === "number" ? t : Number(t || 0));
            }, 0);
          } else {
            total = Number(obj.total) || 0;
          }

          const dateStr = (obj.date as string) || String(obj.date || "");
          const parsed = parseDateString(dateStr);
          const date = isNaN(parsed.getTime()) ? new Date(NaN) : parsed;

          return { total, date };
        });
        setSales(mapped);
      } catch (err) {
        console.error(err);
        setError("Error cargando ventas");
      } finally {
        setIsLoading(false);
      }
    };

    load();

    const onUpdated = () => {
      load();
    };
    window.addEventListener("sales:updated", onUpdated);

    return () => {
      mounted = false;
      window.removeEventListener("sales:updated", onUpdated);
    };
  }, []);

  // Cálculos derivados para mostrar en el dashboard
  const today = new Date();
  const ventasHoyTotal = sales.reduce((sum, s) => {
    const d = s.date;
    if (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    ) {
      return sum + s.total;
    }
    return sum;
  }, 0);

  const ventasMesTotal = sales.reduce((sum, s) => {
    const d = s.date;
    // incluir todas las ventas del mes (incluye hoy)
    if (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth()
    ) {
      return sum + s.total;
    }
    return sum;
  }, 0);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-100">
      {/* Contenido */}
      <div className="flex flex-1 overflow-hidden">
        {/* Panel principal con scroll */}
        <main className="p-6 flex flex-col gap-6 flex-1 overflow-auto">
          {/* Header */}
          <header className="mb-4 flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold">CAJA</h1>
            <p className="text-gray-600">Bienvenido de nuevo</p>
          </header>
          {/* Resumen de ventas */}
          <section className="bg-white p-4 rounded shadow">
            <h2 className="font-bold text-lg mb-2">Resumen de Ventas</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-100 p-4 rounded text-center">
                <div className="text-sm">Ventas Hoy</div>
                <div className="text-xl font-bold">
                  ${ventasHoyTotal.toFixed(2)}
                </div>
              </div>

              <div className="bg-blue-100 p-4 rounded text-center">
                <div className="text-sm">Ventas Mes</div>
                <div className="text-xl font-bold">
                  ${ventasMesTotal.toFixed(2)}
                </div>
              </div>
            </div>
            {isLoading && (
              <p className="text-sm text-gray-500 mt-2">Cargando ventas...</p>
            )}
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </section>

          {/* Botones rápidos */}
          <section className="flex gap-4 justify-center p-4 bg-gray-200">
            <button
              className={`px-4 py-2 rounded border-4 border-green-500 ${
                activeView === "nueva"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-black"
              } hover:bg-blue-500`}
              onClick={() => setActiveView("nueva")}
            >
              Nueva Venta
            </button>
            <button
              className={`px-4 py-2 rounded border-4 border-red-500 ${
                activeView === "gasto"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-black"
              } hover:bg-blue-500`}
              onClick={() => setActiveView("gasto")}
            >
              Registrar Gasto
            </button>
            <button
              className={`px-4 py-2 rounded border-4 border-yellow-500 ${
                activeView === "producto"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-black"
              } hover:bg-blue-500`}
              onClick={() => setActiveView("producto")}
            >
              Agregar Producto
            </button>
          </section>

          {/* Vista dinámica */}
          <div className="flex-1 p-6 overflow-auto">
            {activeView === "nueva" && <NuevaVenta />}
            {activeView === "producto" && <AgregarProducto />}
            {activeView === "gasto" && (
              <RegistrarGasto gastos={gastos} setGastos={setGastos} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
