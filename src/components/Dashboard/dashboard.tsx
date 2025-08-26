"use client";

import { useState } from "react";

export default function Dashboard() {
  const [ventasHoy, setVentasHoy] = useState(0);
  const [ventasMes, setVentasMes] = useState(0);
  const [ventasTotales, setVentasTotales] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Punto de Venta</h1>
        <div>Usuario: Admin</div>
      </header>

      {/* Contenido */}
      <main className="p-6 flex flex-col gap-6">
        {/* Resumen de ventas */}
        <section className="bg-white p-4 rounded shadow">
          <h2 className="font-bold text-lg mb-2">Resumen de Ventas</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-100 p-4 rounded text-center">
              Ventas Hoy: ${ventasHoy}
            </div>
            <div className="bg-blue-100 p-4 rounded text-center">
              Ventas Mes: ${ventasMes}
            </div>
            <div className="bg-blue-100 p-4 rounded text-center">
              Ventas Totales: ${ventasTotales}
            </div>
          </div>
        </section>

        {/* Botones rápidos */}
        <section className="flex gap-4">
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Nueva Venta
          </button>
          <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
            Agregar Producto
          </button>
          <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Registrar Gasto
          </button>
        </section>
      </main>
    </div>
  );
}
