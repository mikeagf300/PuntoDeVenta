"use client";

import { Card } from "@/components/ui/card";
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
        setVentas(ventasData);
        setGastos(gastosData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Agrupar por mes YYYY-MM, solo si item.fecha existe
  const meses = Array.from(
    new Set(
      [...ventas, ...gastos]
        .filter(
          (item) => typeof item.fecha === "string" && item.fecha.length >= 7
        )
        .map((item) => item.fecha.slice(0, 7))
    )
  ).sort();

  const data = meses.map((mes) => {
    const totalVentasMes = ventas
      .filter((v) => typeof v.fecha === "string" && v.fecha.startsWith(mes))
      .reduce((acc, v) => acc + v.total, 0);
    const totalGastosMes = gastos
      .filter((g) => typeof g.fecha === "string" && g.fecha.startsWith(mes))
      .reduce((acc, g) => acc + g.monto, 0);
    return {
      mes,
      ventas: totalVentasMes,
      gastos: totalGastosMes,
      ganancia: totalVentasMes - totalGastosMes,
    };
  });

  if (loading) return <div>Cargando gráfico...</div>;
  if (data.length === 0)
    return <div>No hay datos para mostrar el gráfico.</div>;

  return (
    <Card className="p-4 shadow-md rounded-2xl">
      <h2 className="text-xl font-bold mb-2">Gráfico Mensual</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="ventas" fill="#3b82f6" name="Ventas" />
          <Bar dataKey="gastos" fill="#ef4444" name="Gastos" />
          <Bar dataKey="ganancia" fill="#10b981" name="Ganancia" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
