"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Venta, VentaApi, VentaApiItem } from "@/interfaces/ventas";
import { getSales } from "@/lib/api";

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
    typeof v === "object" && v !== null && "categoria" in v && "total" in v
  );
}

interface Props {
  ventas?: Venta[]; // opcional: si no se pasa, el componente hará fetch
}

export default function ReporteCategoria({ ventas }: Props) {
  const [ventasState, setVentasState] = useState<Array<Venta | VentaApi>>(
    ventas || []
  );
  const [loading, setLoading] = useState<boolean>(
    !ventas || ventas.length === 0
  );
  const [error, setError] = useState<string | null>(null);

  // Si el prop `ventas` cambia, sincronizamos el estado local
  useEffect(() => {
    if (ventas && ventas.length > 0) {
      setVentasState(ventas);
      setLoading(false);
      setError(null);
    }
  }, [ventas]);

  // Si no recibimos `ventas` por props, cargamos desde la API
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

  const categorias = Array.from(
    new Set(
      ventasState
        .map((v) => (isVenta(v) ? v.categoria : undefined))
        .filter((c): c is string => typeof c === "string")
    )
  );

  // Detectamos si la API devuelve ventas con `items` y `date` (nuevo formato)
  const apiStyle = ventasState.some((v) => isVentaApi(v));

  return (
    <Card className="p-4 shadow-md rounded-2xl space-y-2">
      <h2 className="text-xl font-bold mb-2">Ventas</h2>
      {loading && <p>Cargando ventas...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && ventasState.length === 0 && (
        <p>No hay ventas registradas.</p>
      )}

      {/* Si la API devuelve items por venta, mostramos detalle por venta */}
      {!loading && !error && apiStyle && (
        <div className="space-y-4">
          {ventasState.map((sale, idx) => {
            const s = sale as VentaApi;
            const items: VentaApiItem[] = Array.isArray(s.items) ? s.items : [];
            const date = s.date ?? "-";
            const saleTotal =
              s.total ?? items.reduce((a, it) => a + (it.total ?? 0), 0);
            return (
              <div
                key={s.id ?? s.date ?? idx}
                className="p-3 border rounded-md"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-600">Fecha: {date}</div>
                  <div className="font-semibold">Total: ${saleTotal}</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-500">
                        <th className="pr-4">Nombre</th>
                        <th className="pr-4">Cantidad</th>
                        <th className="pr-4">Precio unitario</th>
                        <th className="pr-4">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it, i) => (
                        <tr key={i} className="border-t">
                          <td className="py-2">{it.name}</td>
                          <td className="py-2">{it.quantity}</td>
                          <td className="py-2">{`$${it.unitPrice}`}</td>
                          <td className="py-2">{it.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Si no viene en estilo API, mostramos el resumen por categoría (compatibilidad) */}
      {!loading && !error && !apiStyle && (
        <div className="space-y-2">
          {categorias.map((cat) => {
            const ventasCat = ventasState.filter(
              (v): v is Venta => isVenta(v) && v.categoria === cat
            );
            const totalCat = ventasCat.reduce(
              (acc, v) => acc + (v.total ?? 0),
              0
            );
            return (
              <p key={cat}>
                {cat}: ${totalCat} ({ventasCat.length} ventas)
              </p>
            );
          })}
        </div>
      )}
    </Card>
  );
}
