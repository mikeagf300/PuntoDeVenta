"use client";

import { useEffect, useState } from "react";
import { getProducts, createProduct, updateProduct } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toaster, toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const categoriasMock = ["Bebidas", "Snacks", "Abarrotes", "Lácteos", "Otros"];

interface Producto {
  id: number;
  nombre: string;
  codigo: string;
  cantidad: number;
  precio: number;
  categoria: string;
}

export default function InventarioPage() {
  // Inventario
  const [inventario, setInventario] = useState<Producto[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getProducts();
        if (!mounted) return;
        // Map backend product shape to front Producto
        const mapped = (data || []).map((p: any) => ({
          id: p.id,
          nombre: p.name,
          codigo: p.metadata?.sku || "",
          cantidad: p.stock || 0,
          precio: p.price || 0,
          categoria: p.metadata?.category || "",
        }));
        setInventario(mapped);
      } catch (err) {
        console.error("failed to load products", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Formulario
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [cantidad, setCantidad] = useState<number>(1);
  const [precio, setPrecio] = useState<number>(1);
  const [categoria, setCategoria] = useState("");

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  const handleAñadirProducto = () => {
    if (!nombre.trim()) return toast.error("El nombre es obligatorio.");
    if (!codigo.trim()) return toast.error("El código es obligatorio.");
    if (!cantidad || cantidad < 1) return toast.error("Cantidad inválida.");
    if (!precio || precio < 1) return toast.error("Precio inválido.");
    if (!categoria) return toast.error("Selecciona una categoría.");

    const existingIndex = inventario.findIndex((p) => p.codigo === codigo);

    if (existingIndex >= 0) {
      // Update existing product via API
      (async () => {
        try {
          const existing = inventario[existingIndex];
          await updateProduct(existing.id, {
            name: nombre,
            price: precio,
            stock: cantidad,
            metadata: { sku: codigo, category: categoria },
          });
          const updated = [...inventario];
          updated[existingIndex] = {
            ...updated[existingIndex],
            nombre,
            codigo,
            cantidad,
            precio,
            categoria,
          };
          setInventario(updated);
          toast.success("Producto actualizado en el inventario.");
        } catch (err) {
          console.error(err);
          toast.error("Error actualizando producto.");
        }
      })();
    } else {
      // Create product via API
      (async () => {
        try {
          const res = await createProduct({
            name: nombre,
            price: precio,
            stock: cantidad,
            metadata: { sku: codigo, category: categoria },
          });
          const newProd: Producto = {
            id: res.id,
            nombre,
            codigo,
            cantidad,
            precio,
            categoria,
          };
          setInventario([newProd, ...inventario]);
          toast.success("Producto añadido al inventario.");
        } catch (err) {
          console.error(err);
          toast.error("Error guardando producto.");
        }
      })();
    }

    // limpiar formulario
    setNombre("");
    setCodigo("");
    setCantidad(1);
    setPrecio(1);
    setCategoria("");
  };

  const handleEliminar = (id: number) => {
    setInventario((prev) => prev.filter((p) => p.id !== id));
    toast.success("Producto eliminado del inventario.");
  };

  const handleEditar = (
    id: number,
    field: keyof Producto,
    value: Producto[keyof Producto]
  ) => {
    const updated = inventario.map((p) =>
      p.id === id ? { ...p, [field]: value } : p
    );
    setInventario(updated);
  };

  const inventarioFiltrado = inventario.filter((p) => {
    const coincideBusqueda = p.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideCategoria =
      filtroCategoria === "all" || p.categoria === filtroCategoria;

    return coincideBusqueda && coincideCategoria;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <Toaster position="top-right" richColors />

      <h1 className="text-2xl font-bold">Inventario de Productos</h1>

      {/* Formulario */}
      <Card className="p-4 shadow-md rounded-2xl space-y-4">
        <h2 className="text-xl font-bold">Agregar Producto</h2>
        <div className="grid md:grid-cols-5 gap-4">
          <div className="space-y-1">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="codigo">Código</Label>
            <Input
              id="codigo"
              placeholder="Código"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="cantidad">Cantidad</Label>
            <Input
              id="cantidad"
              type="number"
              min={1}
              placeholder="Cantidad"
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="precio">Precio</Label>
            <Input
              id="precio"
              type="number"
              min={1}
              placeholder="Precio"
              value={precio}
              onChange={(e) => setPrecio(Number(e.target.value))}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="categoria">Categoría</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger id="categoria">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {categoriasMock.map((cat, idx) => (
                  <SelectItem key={idx} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
          onClick={handleAñadirProducto}
        >
          Añadir
        </Button>
      </Card>

      {/* Barra de búsqueda y filtro */}
      <Card className="p-4 shadow-md rounded-2xl">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <Input
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full md:w-1/3"
          />
          <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
            <SelectTrigger className="w-full md:w-1/4">
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categoriasMock.map((cat, idx) => (
                <SelectItem key={idx} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Tabla inventario */}
      <Card className="p-4 shadow-md rounded-2xl">
        <h2 className="text-xl font-bold mb-2">Inventario</h2>
        {inventarioFiltrado.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay productos que coincidan.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left text-sm">
                  <th className="p-2 border">Nombre</th>
                  <th className="p-2 border">Código</th>
                  <th className="p-2 border">Cantidad</th>
                  <th className="p-2 border">Precio</th>
                  <th className="p-2 border">Categoría</th>
                  <th className="p-2 border">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {inventarioFiltrado.map((p) => (
                  <tr key={p.id} className="text-sm">
                    <td className="p-2 border">{p.nombre}</td>
                    <td className="p-2 border">{p.codigo}</td>
                    <td className="p-2 border">
                      <Input
                        type="number"
                        value={p.cantidad}
                        min={1}
                        onChange={(e) =>
                          handleEditar(p.id, "cantidad", Number(e.target.value))
                        }
                        className="w-20"
                      />
                    </td>
                    <td className="p-2 border">
                      <Input
                        type="number"
                        value={p.precio}
                        min={1}
                        onChange={(e) =>
                          handleEditar(p.id, "precio", Number(e.target.value))
                        }
                        className="w-24"
                      />
                    </td>
                    <td className="p-2 border">
                      <Select
                        value={p.categoria}
                        onValueChange={(val) =>
                          handleEditar(p.id, "categoria", val)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriasMock.map((cat, i) => (
                            <SelectItem key={i} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2 border">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleEliminar(p.id)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
