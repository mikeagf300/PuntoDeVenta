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

interface Props {
  ventas: Venta[];
  gastos: Gasto[];
}

export default function GraficoMensual({ ventas, gastos }: Props) {
  // Agrupar por mes YYYY-MM
  const meses = Array.from(
    new Set([...ventas, ...gastos].map((item) => item.fecha.slice(0, 7)))
  ).sort();

  const data = meses.map((mes) => {
    const totalVentasMes = ventas
      .filter((v) => v.fecha.startsWith(mes))
      .reduce((acc, v) => acc + v.total, 0);
    const totalGastosMes = gastos
      .filter((g) => g.fecha.startsWith(mes))
      .reduce((acc, g) => acc + g.monto, 0);
    return {
      mes,
      ventas: totalVentasMes,
      gastos: totalGastosMes,
      ganancia: totalVentasMes - totalGastosMes,
    };
  });

  if (data.length === 0) return null;

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
