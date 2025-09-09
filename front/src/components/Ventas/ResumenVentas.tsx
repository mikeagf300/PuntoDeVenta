"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Venta } from "@/interfaces/ventas";
import { Gasto } from "@/interfaces/gastos";
import { getSales } from "@/lib/api";

interface VentaApiItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface VentaApi {
  id?: number | string;
  items: VentaApiItem[];
  total?: number;
  date?: string;
}

function isVentaApi(v: unknown): v is VentaApi {
  return (
    typeof v === "object" &&
    v !== null &&
    "items" in v &&
    Array.isArray((v as Record<string, unknown>).items)
  );
}

function isVenta(v: unknown): v is Venta {
  return (
    typeof v === "object" && v !== null && "total" in v && "categoria" in v
  );
}

interface Props {
  ventas?: Venta[]; // optional: if not provided, component will fetch
  gastos: Gasto[];
}

export default function ResumenVentas({ ventas, gastos }: Props) {
  const [ventasState, setVentasState] = useState<Array<Venta | VentaApi>>(
    ventas || []
  );
  const [loading, setLoading] = useState<boolean>(
    !ventas || ventas.length === 0
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ventas && ventas.length > 0) {
      setVentasState(ventas);
      setLoading(false);
      setError(null);
    }
  }, [ventas]);

  useEffect(() => {
    let mounted = true;
    if ((!ventas || ventas.length === 0) && mounted) {
      setLoading(true);
      getSales()
        .then((data) => {
          if (!mounted) return;
          setVentasState(Array.isArray(data) ? data : []);
          setError(null);
        })
        .catch((err) => {
          if (!mounted) return;
          setError(err?.message || "Error al obtener ventas");
          setVentasState([]);
        })
        .finally(() => {
          if (!mounted) return;
          setLoading(false);
        });
    }
    return () => {
      mounted = false;
    };
  }, [ventas]);

  // calcular totalVentas: si venta en estilo API usa items, si no usa total directo
  const totalVentas = ventasState.reduce((acc, v) => {
    if (isVentaApi(v)) {
      return (
        acc + (v.total ?? v.items.reduce((s, it) => s + (it.total ?? 0), 0))
      );
    }
    if (isVenta(v)) return acc + (v.total ?? 0);
    return acc;
  }, 0);

  const totalGastos = gastos.reduce((acc, g) => acc + g.monto, 0);
  const gananciaNeta = totalVentas - totalGastos;

  const transacciones = ventasState.length;

  return (
    <Card className="p-4 shadow-md rounded-2xl space-y-2">
      <h2 className="text-xl font-bold">Resumen de Resultados</h2>
      {loading && <p>Cargando ventas...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <>
          <p>Total ventas: ${totalVentas}</p>
          <p>Total gastos: ${totalGastos}</p>
          <p>Ganancia neta: ${gananciaNeta}</p>
          <p>Total de transacciones: {transacciones}</p>
        </>
      )}
    </Card>
  );
}
