//src/app/home/dashboard/page.tsx
"use client";

import { useState } from "react";
import NuevaVenta from "@/components/DashboardViews/NuevaVenta";
import AgregarProducto from "@/components/DashboardViews/AgregarProducto";
import RegistrarGasto from "@/components/DashboardViews/RegistrarGasto";

export default function Dashboard() {
  const [activeView, setActiveView] = useState<"nueva" | "producto" | "gasto">(
    "nueva"
  );

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
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-100 p-4 rounded text-center">
                Ventas Hoy:
              </div>
              <div className="bg-blue-100 p-4 rounded text-center">
                Ventas Mes:
              </div>
              <div className="bg-blue-100 p-4 rounded text-center">
                Ventas Totales:
              </div>
            </div>
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
            {activeView === "gasto" && <RegistrarGasto />}
          </div>
        </main>
      </div>
    </div>
  );
}
