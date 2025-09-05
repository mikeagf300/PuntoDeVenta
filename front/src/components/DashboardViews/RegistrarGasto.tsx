// RegistrarGasto.tsx
"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Toaster, toast } from "sonner";
import { Gasto } from "@/interfaces/gastos";
import { gastoCategorias } from "../mocks/gastos";

interface RegistrarGastoProps {
  gastos: Gasto[];
  setGastos: Dispatch<SetStateAction<Gasto[]>>;
}

export default function RegistrarGasto({
  gastos,
  setGastos,
}: RegistrarGastoProps) {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [monto, setMonto] = useState<number | "">("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));

  const handleGuardarGasto = () => {
    if (!nombre.trim())
      return toast.error("El nombre del gasto es obligatorio.");
    if (!categoria) return toast.error("Selecciona una categoría.");
    if (!monto || monto <= 0) return toast.error("Ingresa un monto válido.");
    if (!fecha) return toast.error("Selecciona una fecha.");

    const nuevoGasto: Gasto = {
      nombre,
      categoria,
      monto: Number(monto),
      fecha,
    };
    setGastos([nuevoGasto, ...gastos]);

    setNombre("");
    setCategoria("");
    setMonto("");
    setFecha(new Date().toISOString().slice(0, 10));

    toast.success("Gasto registrado correctamente.");
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto p-4">
      <Toaster position="top-center" />
      <Card className="p-4 shadow-md rounded-2xl">
        <CardContent className="space-y-4">
          <h2 className="text-xl font-bold">Registrar Gasto</h2>

          <div>
            <label className="block text-sm font-medium mb-1">
              Nombre del gasto
            </label>
            <Input
              placeholder="Ej. Luz, Agua, Internet"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Categoría</label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona categoría" />
              </SelectTrigger>
              <SelectContent>
                {gastoCategorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Monto</label>
            <Input
              type="number"
              min={0}
              value={monto}
              onChange={(e) => setMonto(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fecha</label>
            <Input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <Button
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl w-full"
            onClick={handleGuardarGasto}
          >
            Guardar Gasto
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
