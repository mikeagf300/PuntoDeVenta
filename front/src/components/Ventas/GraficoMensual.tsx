"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Venta } from "@/interfaces/ventas";
import { Gasto } from "@/interfaces/gastos";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useState, useEffect } from "react";

export default function GraficoMensual() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:3001/sales").then((res) => res.json()),
      fetch("http://localhost:3001/gastos").then((res) => res.json()),
    ])
      .then(([ventasData, gastosData]) => {
        // Normalizar fechas de ventas
        const ventasMapeadas = Array.isArray(ventasData)
          ? ventasData.map((v) => {
              let fecha = v.date;
              // Si la fecha es tipo 'D/M/YYYY, ...', conviértela a 'YYYY-MM-DD'
              if (fecha && fecha.includes(",")) {
                const [fechaStr] = fecha.split(",");
                const [dia, mes, anio] = fechaStr.split("/");
                // Pad mes y día
                const mesPad = mes.length === 1 ? "0" + mes : mes;
                const diaPad = dia.length === 1 ? "0" + dia : dia;
                fecha = `${anio}-${mesPad}-${diaPad}`;
              }
              return {
                ...v,
                fecha,
                total: Number(v.total),
              };
            })
          : [];
        const gastosMapeados = Array.isArray(gastosData)
          ? gastosData.map((g) => ({ ...g, fecha: g.fecha || g.date }))
          : [];
        setVentas(ventasMapeadas);
        setGastos(gastosMapeados);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Calcular mes y año actual
  const now = new Date();
  const mesActual = now.toISOString().slice(0, 7); // YYYY-MM

  // Filtrar ventas y gastos solo del mes actual
  const ventasMes = ventas.filter(
    (v) => typeof v.fecha === "string" && v.fecha.slice(0, 7) === mesActual
  );
  const gastosMes = gastos.filter(
    (g) => typeof g.fecha === "string" && g.fecha.slice(0, 7) === mesActual
  );

  const totalVentasMes = ventasMes.reduce((acc, v) => acc + v.total, 0);
  const totalGastosMes = gastosMes.reduce((acc, g) => acc + g.monto, 0);

  const data = [
    {
      mes: mesActual,
      ventas: totalVentasMes,
      gastos: totalGastosMes,
      ganancia: totalVentasMes - totalGastosMes,
    },
  ];

  if (loading)
    return (
      <div className="text-center py-8 text-blue-500 animate-pulse">
        Cargando gráfico...
      </div>
    );
  if (data.length === 0)
    return (
      <div className="text-center py-8 text-gray-500">
        No hay datos para mostrar el gráfico.
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-6 shadow-lg rounded-3xl bg-gradient-to-br from-blue-50 to-white">
        <CardContent>
          <h2 className="text-2xl font-extrabold mb-6 text-blue-700 flex items-center gap-2">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <path
                stroke="#2563eb"
                strokeWidth="2"
                d="M4 7v10a2 2 0 002 2h12a2 2 0 002-2V7"
              />
              <path stroke="#2563eb" strokeWidth="2" d="M9 11v4m3-7v7m3-4v4" />
              <path
                stroke="#2563eb"
                strokeWidth="2"
                d="M4 7V5a2 2 0 012-2h12a2 2 0 012 2v2"
              />
            </svg>
            Gráfico Mensual
          </h2>
          <div className="mb-4 flex gap-4 justify-center">
            <span className="flex items-center gap-1 text-blue-600 font-semibold">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-400"></span>
              Ventas
            </span>
            <span className="flex items-center gap-1 text-red-500 font-semibold">
              <span className="inline-block w-3 h-3 rounded-full bg-red-400"></span>
              Gastos
            </span>
            <span className="flex items-center gap-1 text-green-500 font-semibold">
              <span className="inline-block w-3 h-3 rounded-full bg-green-400"></span>
              Ganancia
            </span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data} barCategoryGap={30} barGap={8}>
                <XAxis
                  dataKey="mes"
                  tick={{ fill: "#2563eb", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#374151" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#f3f4f6",
                    borderRadius: 12,
                    border: "1px solid #dbeafe",
                    color: "#2563eb",
                  }}
                  labelStyle={{ color: "#2563eb", fontWeight: 700 }}
                />
                <Bar
                  dataKey="ventas"
                  fill="#3b82f6"
                  name="Ventas"
                  radius={[8, 8, 0, 0]}
                  isAnimationActive={true}
                />
                <Bar
                  dataKey="gastos"
                  fill="#ef4444"
                  name="Gastos"
                  radius={[8, 8, 0, 0]}
                  isAnimationActive={true}
                />
                <Bar
                  dataKey="ganancia"
                  fill="#10b981"
                  name="Ganancia"
                  radius={[8, 8, 0, 0]}
                  isAnimationActive={true}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
