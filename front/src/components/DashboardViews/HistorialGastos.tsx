// HistorialGastos.tsx
"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Gasto } from "@/interfaces/gastos";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function HistorialGastos() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/gastos")
      .then((res) => res.json())
      .then((data) => {
        setGastos(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Agrupar gastos por categoría para el gráfico
  const gastosPorCategoria: Record<string, number> = {};
  gastos.forEach((g) => {
    gastosPorCategoria[g.categoria] =
      (gastosPorCategoria[g.categoria] || 0) + g.monto;
  });

  const chartData = {
    labels: Object.keys(gastosPorCategoria),
    datasets: [
      {
        label: "Monto por Categoría",
        data: Object.values(gastosPorCategoria),
        backgroundColor: [
          "#60a5fa",
          "#f87171",
          "#34d399",
          "#fbbf24",
          "#a78bfa",
          "#f472b6",
        ],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Gastos por Categoría",
        font: { size: 18 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#374151" },
        grid: { color: "#e5e7eb" },
      },
      x: {
        ticks: { color: "#374151" },
        grid: { color: "#e5e7eb" },
      },
    },
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
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
            Historial de Gastos
          </h2>
          {loading ? (
            <div className="text-center py-8 text-blue-500 animate-pulse">
              Cargando...
            </div>
          ) : gastos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay gastos registrados.
            </div>
          ) : (
            <>
              <div className="mb-8">
                <Bar data={chartData} options={chartOptions} />
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="w-full text-sm text-gray-700">
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="py-2 px-3 text-left">Nombre</th>
                      <th className="py-2 px-3 text-left">Categoría</th>
                      <th className="py-2 px-3 text-right">Monto</th>
                      <th className="py-2 px-3 text-left">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gastos.map((gasto) => (
                      <tr
                        key={gasto.id || gasto.nombre + gasto.fecha}
                        className="hover:bg-blue-50 transition"
                      >
                        <td className="py-2 px-3 font-medium">
                          {gasto.nombre}
                        </td>
                        <td className="py-2 px-3">{gasto.categoria}</td>
                        <td className="py-2 px-3 text-right text-blue-600 font-semibold">
                          ${gasto.monto.toFixed(2)}
                        </td>
                        <td className="py-2 px-3">{gasto.fecha}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
