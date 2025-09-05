"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { Venta } from "@/interfaces/ventas";

interface Props {
  ventas: Venta[];
  setVentas: React.Dispatch<React.SetStateAction<Venta[]>>;
}

export default function RegistrarVenta({ ventas, setVentas }: Props) {
  const [producto, setProducto] = useState("");
  const [categoria, setCategoria] = useState("");
  const [cantidad, setCantidad] = useState<number>(1);
  const [precio, setPrecio] = useState<number>(1);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));

  const handleAñadirVenta = () => {
    if (!producto.trim()) return toast.error("Producto obligatorio");
    if (!categoria.trim()) return toast.error("Categoría obligatoria");
    if (!cantidad || cantidad < 1) return toast.error("Cantidad inválida");
    if (!precio || precio < 1) return toast.error("Precio inválido");

    const nuevaVenta: Venta = {
      id: Date.now(),
      producto,
      categoria,
      cantidad,
      precioUnitario: precio,
      total: cantidad * precio,
      fecha,
    };

    setVentas([nuevaVenta, ...ventas]);

    setProducto("");
    setCategoria("");
    setCantidad(1);
    setPrecio(1);
    setFecha(new Date().toISOString().slice(0, 10));

    toast.success("Venta registrada");
  };

  return (
    <Card className="p-4 shadow-md rounded-2xl space-y-4">
      <Toaster position="top-right" richColors />
      <h2 className="text-xl font-bold">Registrar Venta</h2>
      <div className="grid md:grid-cols-5 gap-4">
        <Input
          placeholder="Producto"
          value={producto}
          onChange={(e) => setProducto(e.target.value)}
        />
        <Input
          placeholder="Categoría"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        />
        <Input
          type="number"
          min={1}
          placeholder="Cantidad"
          value={cantidad}
          onChange={(e) => setCantidad(Number(e.target.value))}
        />
        <Input
          type="number"
          min={1}
          placeholder="Precio Unitario"
          value={precio}
          onChange={(e) => setPrecio(Number(e.target.value))}
        />
        <Input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
      </div>
      <Button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
        onClick={handleAñadirVenta}
      >
        Añadir Venta
      </Button>
    </Card>
  );
}
