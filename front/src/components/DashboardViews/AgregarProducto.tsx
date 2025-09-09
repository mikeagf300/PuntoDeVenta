"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { createProduct } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Product } from "@/interfaces/productos";

const categoriasMock = ["Bebidas", "Snacks", "Abarrotes", "Lácteos", "Otros"];

export default function AgregarProducto() {
  const router = useRouter();

  // Formulario
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [cantidad, setCantidad] = useState<number>(1);
  const [precio, setPrecio] = useState<number>(1);
  const [categoria, setCategoria] = useState("");

  // Lista temporal antes de guardar
  const [listaAgregar, setListaAgregar] = useState<Product[]>([]);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);

  const handleAñadirProducto = () => {
    if (!nombre.trim()) return toast.error("El nombre es obligatorio.");
    if (!codigo.trim()) return toast.error("El código es obligatorio.");
    if (!cantidad || cantidad < 1) return toast.error("Cantidad inválida.");
    if (!precio || precio < 1) return toast.error("Precio inválido.");
    if (!categoria) return toast.error("Selecciona una categoría.");

    const existingIndex = listaAgregar.findIndex((p) => p.sku === codigo);

    if (existingIndex >= 0) {
      const updated = [...listaAgregar];
      updated[existingIndex].stock += cantidad;
      updated[existingIndex].price = precio;
      updated[existingIndex].category = categoria;
      updated[existingIndex].name = nombre;
      setListaAgregar(updated);
      toast.success("Producto actualizado en la lista.");
    } else {
      const nuevoProducto: Product = {
        name: nombre,
        sku: codigo,
        stock: cantidad,
        price: precio,
        category: categoria,
        id: 0,
      };
      setListaAgregar([nuevoProducto, ...listaAgregar]);
      toast.success("Producto añadido a la lista.");
    }

    // Limpiar formulario
    setNombre("");
    setCodigo("");
    setCantidad(1);
    setPrecio(1);
    setCategoria("");
  };

  const handleEliminarDeLista = (index: number) => {
    const updated = [...listaAgregar];
    updated.splice(index, 1);
    setListaAgregar(updated);
    toast.success("Producto eliminado de la lista.");
  };

  // Editar producto en lista
  const handleEditarProducto = (
    index: number,
    field: keyof Product,
    value: Product[keyof Product]
  ) => {
    const updated = [...listaAgregar];
    updated[index][field] = value as never;
    setListaAgregar(updated);
  };

  const handleGuardarProductos = () => {
    if (listaAgregar.length === 0)
      return toast.error("No hay productos en la lista.");
    (async () => {
      try {
        for (const p of listaAgregar) {
          await createProduct({
            name: p.name,
            price: p.price,
            stock: p.stock,
            metadata: { sku: p.sku, category: p.category },
          });
        }
        toast.success("Productos guardados en el servidor.");
        // Limpiar lista y formulario después
        setListaAgregar([]);
        setNombre("");
        setCodigo("");
        setCantidad(1);
        setPrecio(1);
        setCategoria("");

        setModalOpen(true);
      } catch (err) {
        console.error(err);
        toast.error("Error guardando productos. Revisa la consola.");
      }
    })();
  };

  const irAlInventario = () => {
    setModalOpen(false);
    router.push("/inventario"); // Ajusta según tu ruta
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto p-4">
      <Toaster position="top-right" richColors />

      <div className="flex flex-col md:flex-row gap-4">
        {/* Formulario */}
        <Card className="flex-1 p-4 shadow-md rounded-2xl space-y-4">
          <h2 className="text-xl font-bold mb-2">Agregar Producto</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <Input
              placeholder="Nombre del producto"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Código</label>
            <Input
              placeholder="Código del producto"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cantidad</label>
            <Input
              type="number"
              min={1}
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Precio</label>
            <Input
              type="number"
              min={1}
              value={precio}
              onChange={(e) => setPrecio(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Categoría</label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona categoría" />
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

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            onClick={handleAñadirProducto}
          >
            Añadir a la lista
          </Button>
        </Card>

        {/* Lista de productos a añadir */}
        <Card className="flex-1 p-4 shadow-md rounded-2xl space-y-2 max-h-[500px] overflow-y-auto">
          <h2 className="text-xl font-bold mb-2">
            Lista de productos a añadir
          </h2>

          {listaAgregar.length === 0 ? (
            <p className="text-sm text-gray-500">
              No hay productos en la lista.
            </p>
          ) : (
            listaAgregar.map((p, idx) => (
              <div
                key={idx}
                className="flex flex-wrap md:flex-nowrap justify-between items-center p-2 border rounded-md gap-2"
              >
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm">Código: {p.sku}</p>

                  <div className="flex gap-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <label className="text-sm">Cant:</label>
                      <Input
                        type="number"
                        min={1}
                        value={p.stock}
                        className="w-16 p-1 text-center text-sm"
                        onChange={(e) =>
                          handleEditarProducto(
                            idx,
                            "stock",
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <label className="text-sm">Precio:</label>
                      <Input
                        type="number"
                        min={1}
                        value={p.price}
                        className="w-20 p-1 text-center text-sm"
                        onChange={(e) =>
                          handleEditarProducto(
                            idx,
                            "price",
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <label className="text-sm">Cat:</label>
                      <Select
                        value={p.category}
                        onValueChange={(value) =>
                          handleEditarProducto(idx, "category", value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriasMock.map((cat, i) => (
                            <SelectItem key={i} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleEliminarDeLista(idx)}
                >
                  Eliminar
                </Button>
              </div>
            ))
          )}
        </Card>
      </div>

      {/* Botón final guardar */}
      <Button
        className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl"
        onClick={handleGuardarProductos}
      >
        Guardar productos
      </Button>

      {/* Modal de confirmación */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Productos guardados</DialogTitle>
          </DialogHeader>
          <p className="mt-2">¿Quieres ir al inventario?</p>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              No
            </Button>
            <Button onClick={irAlInventario}>Sí</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
