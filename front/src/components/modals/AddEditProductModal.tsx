// src/components/AddEditProductModal.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Product = {
  id?: number;
  name: string;
  sku: string;
  category: string;
  stock: number;
  price: number;
};

interface Props {
  trigger?: React.ReactNode; // botón que abre el modal
  product?: Product; // producto a editar
  onSave: (product: Product) => void; // callback cuando se guarda
}

export default function AddEditProductModal({
  trigger,
  product,
  onSave,
}: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Product>({
    name: "",
    sku: "",
    category: "Abarrotes",
    stock: 0,
    price: 0,
  });

  useEffect(() => {
    if (product) setForm(product);
  }, [product]);

  const handleChange = (key: keyof Product, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onSave(form);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Agregar Producto</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {product ? "Editar Producto" : "Agregar Producto"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Nombre</Label>
            <Input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>
          <div>
            <Label>SKU</Label>
            <Input
              value={form.sku}
              onChange={(e) => handleChange("sku", e.target.value)}
            />
          </div>
          <div>
            <Label>Categoría</Label>
            <Select
              value={form.category}
              onValueChange={(value) => handleChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lácteos">Lácteos</SelectItem>
                <SelectItem value="Panadería">Panadería</SelectItem>
                <SelectItem value="Bebidas">Bebidas</SelectItem>
                <SelectItem value="Abarrotes">Abarrotes</SelectItem>
                <SelectItem value="Higiene">Higiene</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Stock</Label>
            <Input
              type="number"
              value={form.stock}
              onChange={(e) => handleChange("stock", Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Precio</Label>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => handleChange("price", Number(e.target.value))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {product ? "Guardar cambios" : "Agregar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
