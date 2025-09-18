import ResumenVentas from "@/components/Ventas/ResumenVentas";
import ReporteCategoria from "@/components/Ventas/ReporteCategoria";
import GraficoMensual from "@/components/Ventas/GraficoMensual";

export default function VentasPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold">Ventas y Estado de Resultados</h1>

      {/* Resumen de ventas y ganancias */}
      <ResumenVentas gastos={[]} />

      {/* Reporte por categoría */}
      <ReporteCategoria />

      {/* Gráfico mensual */}
      <GraficoMensual />
    </div>
  );
}
