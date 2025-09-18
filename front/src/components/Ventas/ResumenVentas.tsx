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
  ventas?: Venta[];
  gastos?: Gasto[];
}

export default function ResumenVentas(props: Props) {
  const ventas = props.ventas;
  const gastos = props.gastos;

  const [ventasState, setVentasState] = useState<Array<Venta | VentaApi>>(
    ventas || []
  );
  const [gastosState, setGastosState] = useState<Gasto[]>(gastos || []);
  const [loading, setLoading] = useState<boolean>(
    !ventas || ventas.length === 0
  );
  const [loadingGastos, setLoadingGastos] = useState<boolean>(
    !gastos || gastos.length === 0
  );
  const [error, setError] = useState<string | null>(null);
  const [errorGastos, setErrorGastos] = useState<string | null>(null);

  useEffect(() => {
    if (ventas && ventas.length > 0) {
      setVentasState(ventas);
      setLoading(false);
      setError(null);
    }
  }, [ventas]);

  useEffect(() => {
    if (gastos && gastos.length > 0) {
      setGastosState(gastos);
      setLoadingGastos(false);
      setErrorGastos(null);
    }
  }, [gastos]);

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
    // Cargar gastos si no se pasan por props
    if ((!gastos || gastos.length === 0) && mounted) {
      setLoadingGastos(true);
      fetch("http://localhost:3001/gastos")
        .then((res) => res.json())
        .then((data) => {
          if (!mounted) return;
          setGastosState(Array.isArray(data) ? data : []);
          setErrorGastos(null);
        })
        .catch((err) => {
          if (!mounted) return;
          setErrorGastos(err?.message || "Error al obtener gastos");
          setGastosState([]);
        })
        .finally(() => {
          if (!mounted) return;
          setLoadingGastos(false);
        });
    }
    return () => {
      mounted = false;
    };
  }, [ventas, gastos]);

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

  const totalGastos = gastosState.reduce((acc, g) => acc + g.monto, 0);
  const gananciaNeta = totalVentas - totalGastos;

  const transacciones = ventasState.length;

  return (
    <Card className="p-4 shadow-md rounded-2xl space-y-2">
      {(loading || loadingGastos) && <p>Cargando datos...</p>}
      {(error || errorGastos) && (
        <p className="text-red-600">{error || errorGastos}</p>
      )}
      {!loading && !loadingGastos && !error && !errorGastos && (
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
