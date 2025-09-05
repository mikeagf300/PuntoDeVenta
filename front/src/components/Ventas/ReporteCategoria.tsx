"use client";

import { Card } from "@/components/ui/card";
import { Venta } from "@/interfaces/ventas";

interface Props {
  ventas: Venta[];
}

export default function ReporteCategoria({ ventas }: Props) {
  const categorias = Array.from(new Set(ventas.map((v) => v.categoria)));

  return (
    <Card className="p-4 shadow-md rounded-2xl space-y-2">
      <h2 className="text-xl font-bold mb-2">Ventas por categoría</h2>
      {categorias.length === 0 && <p>No hay ventas registradas.</p>}
      {categorias.map((cat) => {
        const ventasCat = ventas.filter((v) => v.categoria === cat);
        const totalCat = ventasCat.reduce((acc, v) => acc + v.total, 0);
        return (
          <p key={cat}>
            {cat}: ${totalCat} ({ventasCat.length} ventas)
          </p>
        );
      })}
    </Card>
  );
}
