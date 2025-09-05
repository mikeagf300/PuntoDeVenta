"use client";

import { Card } from "@/components/ui/card";
import { Venta } from "@/interfaces/ventas";
import { Gasto } from "@/interfaces/gastos";

interface Props {
  ventas: Venta[];
  gastos: Gasto[];
}

export default function ResumenVentas({ ventas, gastos }: Props) {
  const totalVentas = ventas.reduce((acc, v) => acc + v.total, 0);
  const totalGastos = gastos.reduce((acc, g) => acc + g.monto, 0);
  const gananciaNeta = totalVentas - totalGastos;

  return (
    <Card className="p-4 shadow-md rounded-2xl space-y-2">
      <h2 className="text-xl font-bold">Resumen de Resultados</h2>
      <p>Total ventas: ${totalVentas}</p>
      <p>Total gastos: ${totalGastos}</p>
      <p>Ganancia neta: ${gananciaNeta}</p>
      <p>Total de transacciones: {ventas.length}</p>
    </Card>
  );
}
