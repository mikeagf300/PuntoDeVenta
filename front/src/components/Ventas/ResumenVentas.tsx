"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Venta } from "@/interfaces/ventas";
import { Gasto } from "@/interfaces/gastos";
import { getSales } from "@/lib/api";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  addMonths,
  format,
  startOfMonth,
  endOfMonth,
  subDays,
  isWithinInterval,
  parseISO,
} from "date-fns";

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

function parseCustomDate(fecha: string) {
  // Ejemplo: "23/9/2025, 3:44:24 p.m."
  const [datePart, timePart] = fecha.split(",");
  if (!datePart || !timePart) return null;
  const [day, month, year] = datePart.trim().split("/").map(Number);
  // Elimina puntos y espacios del am/pm
  const timeClean = timePart.replace(/\./g, "").trim();
  const dateString = `${year}-${String(month).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")} ${timeClean}`;
  // Usa Date.parse para formato "YYYY-MM-DD h:mm:ss a.m./p.m."
  return new Date(dateString);
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
  const [dateFilter, setDateFilter] = useState<string>("last30");

  // Obtener año actual
  const now = new Date();
  const currentYear = now.getFullYear();

  // Generar lista de meses disponibles a partir de ventas y gastos SOLO del año actual
  const allDates = [
    ...ventasState.map((v) => {
      const fecha = isVentaApi(v)
        ? v.date
        : isVenta(v)
        ? (v.fecha as string | undefined)
        : undefined;
      return fecha;
    }),
    ...gastosState.map((g) => g.fecha),
  ].filter(Boolean) as string[];

  const uniqueMonths = Array.from(
    new Set(
      allDates
        .map((d) => {
          const date = parseCustomDate(d);
          if (!date || isNaN(date.getTime())) return null;
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
        })
        .filter(Boolean)
    )
  ).sort((a, b) => {
    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;
    return b.localeCompare(a);
  });

  // Calcular rango de fechas según filtro
  let rangeStart: Date, rangeEnd: Date;
  if (dateFilter === "last30") {
    rangeEnd = new Date();
    rangeStart = subDays(rangeEnd, 29);
  } else {
    // formato: YYYY-MM
    const [year, month] = dateFilter.split("-");
    rangeStart = startOfMonth(new Date(Number(year), Number(month) - 1));
    rangeEnd = endOfMonth(rangeStart);
  }

  // Filtrar ventas y gastos por rango
  const ventasFiltradas = ventasState.filter((v) => {
    const fecha = isVentaApi(v)
      ? v.date
      : isVenta(v)
      ? (v.fecha as string | undefined)
      : undefined;
    if (!fecha) return false;
    const d = parseCustomDate(fecha);
    if (!d || isNaN(d.getTime())) return false;
    return isWithinInterval(d, { start: rangeStart, end: rangeEnd });
  });

  const gastosFiltrados = gastosState.filter((g) => {
    if (!g.fecha) return false;
    const d = parseCustomDate(g.fecha);
    if (!d || isNaN(d.getTime())) return false;
    return isWithinInterval(d, { start: rangeStart, end: rangeEnd });
  });
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

  const totalVentas = ventasFiltradas.reduce((acc, v) => {
    if (isVentaApi(v)) {
      return (
        acc + (v.total ?? v.items.reduce((s, it) => s + (it.total ?? 0), 0))
      );
    }
    if (isVenta(v)) return acc + (v.total ?? 0);
    return acc;
  }, 0);

  const totalGastos = gastosFiltrados.reduce((acc, g) => acc + g.monto, 0);
  const gananciaNeta = totalVentas - totalGastos;
  const transacciones = ventasFiltradas.length;

  return (
    <Card className="p-4 shadow-md rounded-2xl space-y-4">
      <div className="flex flex-col md:flex-row gap-2 md:items-center">
        <span className="font-semibold">Ver datos de:</span>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Selecciona periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last30">Últimos 30 días</SelectItem>
            {uniqueMonths
              .filter((m): m is string => m !== null)
              .map((m) => (
                <SelectItem key={m} value={m}>
                  {format(new Date(m + "-01"), "MMMM yyyy")}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      {(loading || loadingGastos) && <p>Cargando datos...</p>}
      {(error || errorGastos) && (
        <p className="text-red-600">{error || errorGastos}</p>
      )}
      {!loading && !loadingGastos && !error && !errorGastos && (
        <>
          {ventasFiltradas.length === 0 && gastosFiltrados.length === 0 ? (
            <p className="text-gray-500">
              No hay datos para el periodo seleccionado.
            </p>
          ) : (
            <>
              <p>Total ventas: ${totalVentas}</p>
              <p>Total gastos: ${totalGastos}</p>
              <p>Ganancia neta: ${gananciaNeta}</p>
              <p>Total de transacciones: {transacciones}</p>
            </>
          )}
        </>
      )}
    </Card>
  );
}
