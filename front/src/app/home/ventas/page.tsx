"use client";

import { useState } from "react";
import RegistrarVenta from "@/components/Ventas/RegistrarVenta";
import ResumenVentas from "@/components/Ventas/ResumenVentas";
import ReporteCategoria from "@/components/Ventas/ReporteCategoria";
import GraficoMensual from "@/components/Ventas/GraficoMensual";
import RegistrarGasto from "@/components/DashboardViews/RegistrarGasto";
import { Venta } from "@/interfaces/ventas";
import { Gasto } from "@/interfaces/gastos";

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold">Ventas y Estado de Resultados</h1>

      {/* Registrar venta */}
      <RegistrarVenta ventas={ventas} setVentas={setVentas} />

      {/* Resumen de ventas y ganancias */}
      <ResumenVentas ventas={ventas} gastos={gastos} />

      {/* Registrar gastos */}
      <RegistrarGasto gastos={gastos} setGastos={setGastos} />

      {/* Reporte por categoría */}
      <ReporteCategoria ventas={ventas} />

      {/* Gráfico mensual */}
      <GraficoMensual ventas={ventas} gastos={gastos} />
    </div>
  );
}
