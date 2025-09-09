"use client";

import { useEffect, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  ProductMetadata,
} from "@/lib/api";
import { Product } from "@/interfaces/productos";
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

export default function InventarioPage() {
  // Inventario
  const [inventario, setInventario] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      // Map backend product shape to shared Product with runtime checks
      const mapped = (data || []).map((p: unknown) => {
        const obj = p as Record<string, unknown>;
        const id = typeof obj.id === "number" ? obj.id : Number(obj.id || 0);
        const name =
          typeof obj.name === "string" ? obj.name : String(obj.name || "");
        const stock =
          typeof obj.stock === "number" ? obj.stock : Number(obj.stock || 0);
        const price =
          typeof obj.price === "number" ? obj.price : Number(obj.price || 0);
        const metadata =
          typeof obj.metadata === "string"
            ? (() => {
                try {
                  return JSON.parse(obj.metadata as string);
                } catch {
                  return {};
                }
              })()
            : (obj.metadata as Record<string, unknown> | undefined) || {};

        return {
          id,
          name,
          sku:
            typeof metadata?.sku === "string"
              ? metadata.sku
              : String(metadata?.sku || ""),
          stock,
          price,
          category:
            typeof metadata?.category === "string"
              ? metadata.category
              : String(metadata?.category || ""),
        } as Product;
      });
      setInventario(mapped);
    } catch (err) {
      console.error("failed to load products", err);
      setError("Error cargando productos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Formulario (campos en español, convertimos a Product al guardar)
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

    const existingIndex = inventario.findIndex((p) => p.sku === codigo);

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
            name: nombre,
            sku: codigo,
            stock: cantidad,
            price: precio,
            category: categoria,
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
          const newProd: Product = {
            id: typeof res?.id === "number" ? res.id : Number(res?.id || 0),
            name: nombre,
            sku: codigo,
            stock: cantidad,
            price: precio,
            category: categoria,
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

  const handleEliminar = async (id: number) => {
    try {
      await deleteProduct(id);
      setInventario((prev) => prev.filter((p) => p.id !== id));
      toast.success("Producto eliminado del inventario.");
    } catch (err) {
      console.error(err);
      toast.error("Error eliminando producto.");
    }
  };

  const handleEditar = async (
    id: number,
    field: keyof Product,
    value: Product[keyof Product]
  ) => {
    const updated = inventario.map((p) =>
      p.id === id ? { ...p, [field]: value } : p
    );
    setInventario(updated);

    // Persist change to backend
    try {
      const prod = updated.find((p) => p.id === id);
      if (!prod) return;
      const payload: Partial<{
        name: string;
        price?: number;
        stock?: number;
        metadata?: ProductMetadata;
      }> = {};
      if (field === "name" || field === "price" || field === "stock") {
        if (field === "name") payload.name = prod.name;
        if (field === "price") payload.price = prod.price;
        if (field === "stock") payload.stock = prod.stock;
      } else {
        // category or sku -> metadata
        payload.metadata = { sku: prod.sku, category: prod.category };
      }

      await updateProduct(id, payload);
      toast.success("Producto sincronizado.");
    } catch (err) {
      console.error(err);
      toast.error("Error sincronizando producto.");
    }
  };

  const inventarioFiltrado = inventario.filter((p) => {
    const coincideBusqueda = p.name
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideCategoria =
      filtroCategoria === "all" || p.category === filtroCategoria;

    return coincideBusqueda && coincideCategoria;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <Toaster position="top-right" richColors />

      <h1 className="text-2xl font-bold">Inventario de Productos</h1>

      {/* Estado de carga / error */}
      {isLoading && (
        <Card className="p-3 bg-yellow-50 text-sm text-gray-700">
          Cargando productos...
        </Card>
      )}
      {error && (
        <Card className="p-3 bg-red-50 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <Button onClick={loadProducts} size="sm">
            Refrescar
          </Button>
        </Card>
      )}

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
                    <td className="p-2 border">{p.name}</td>
                    <td className="p-2 border">{p.sku}</td>
                    <td className="p-2 border">
                      <Input
                        type="number"
                        value={p.stock}
                        min={1}
                        onChange={(e) =>
                          handleEditar(p.id, "stock", Number(e.target.value))
                        }
                        className="w-20"
                      />
                    </td>
                    <td className="p-2 border">
                      <Input
                        type="number"
                        value={p.price}
                        min={1}
                        onChange={(e) =>
                          handleEditar(p.id, "price", Number(e.target.value))
                        }
                        className="w-24"
                      />
                    </td>
                    <td className="p-2 border">
                      <Select
                        value={p.category}
                        onValueChange={(val) =>
                          handleEditar(p.id, "category", val)
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
