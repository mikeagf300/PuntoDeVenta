// HistorialGastos.tsx
"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Gasto } from "@/interfaces/gastos";

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

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card className="p-4 shadow-md rounded-2xl">
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Historial de Gastos</h2>
          {loading ? (
            <div>Cargando...</div>
          ) : gastos.length === 0 ? (
            <div>No hay gastos registrados.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Nombre</th>
                  <th className="text-left">Categoría</th>
                  <th className="text-right">Monto</th>
                  <th className="text-left">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {gastos.map((gasto) => (
                  <tr key={gasto.id || gasto.nombre + gasto.fecha}>
                    <td>{gasto.nombre}</td>
                    <td>{gasto.categoria}</td>
                    <td className="text-right">${gasto.monto.toFixed(2)}</td>
                    <td>{gasto.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
