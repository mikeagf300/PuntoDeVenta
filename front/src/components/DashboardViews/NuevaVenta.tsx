"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Product, Sale, SaleItem } from "@/interfaces/productos";
import { products } from "../mocks/inventory";

export default function NuevaVenta() {
  const [query, setQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [currentItems, setCurrentItems] = useState<SaleItem[]>([]);
  const [payment, setPayment] = useState<number>(0);
  const [salesHistory, setSalesHistory] = useState<Sale[]>([]);

  const suggestions = products.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  const total = currentItems.reduce((sum, item) => sum + item.total, 0);
  const change = payment > total ? payment - total : 0;

  const handleAddItem = () => {
    if (!selectedProduct) return;
    const existingIndex = currentItems.findIndex(
      (item) => item.product.id === selectedProduct.id
    );

    if (existingIndex >= 0) {
      const updated = [...currentItems];
      updated[existingIndex].quantity += quantity;
      updated[existingIndex].total =
        updated[existingIndex].product.price * updated[existingIndex].quantity;
      setCurrentItems(updated);
    } else {
      const newItem: SaleItem = {
        product: selectedProduct,
        quantity,
        total: selectedProduct.price * quantity,
      };
      setCurrentItems([...currentItems, newItem]);
    }

    setSelectedProduct(null);
    setQuery("");
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...currentItems];
    updated.splice(index, 1);
    setCurrentItems(updated);
  };

  const handleFinalizeSale = () => {
    if (currentItems.length === 0) return;

    const newSale: Sale = {
      product: currentItems.map((i) => i.product.name).join(", "),
      quantity: currentItems.reduce((sum, i) => sum + i.quantity, 0),
      total,
      payment,
      change,
      date: new Date().toLocaleString(),
    };

    setSalesHistory([newSale, ...salesHistory]);
    setCurrentItems([]);
    setPayment(0);
  };

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <Card className="p-4 shadow-md rounded-2xl">
        <CardContent>
          <label className="block text-sm font-medium mb-1">Producto</label>
          <Input
            placeholder="Buscar producto..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedProduct(null);
            }}
          />
          {query && !selectedProduct && (
            <div className="mt-2 border rounded-md bg-white shadow max-h-60 overflow-y-auto">
              {suggestions.map((p) => (
                <div
                  key={p.id}
                  className="p-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSelectedProduct(p);
                    setQuery(p.name);
                  }}
                >
                  {p.name} - ${p.price}
                </div>
              ))}
            </div>
          )}

          {/* Cantidad del producto seleccionado */}
          {selectedProduct && (
            <div className="mt-2 space-y-2">
              <div>
                <label className="block text-sm font-medium">Cantidad</label>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onFocus={(e) => e.target.select()}
                  onWheel={(e) => e.currentTarget.blur()}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
              <p className="text-sm">
                Precio Unitario: ${selectedProduct.price}
              </p>
              <p className="text-sm font-bold">
                Total: ${selectedProduct.price * quantity}
              </p>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                onClick={handleAddItem}
              >
                Agregar a la venta
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Layout principal: lista de productos y resumen */}
      {currentItems.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-4 max-w-4xl mx-auto">
          {/* Productos en venta */}
          <Card className="flex-1 p-4 shadow-md rounded-2xl">
            <CardContent className="space-y-2">
              <h3 className="font-medium mb-2">Productos en la venta:</h3>
              {currentItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 border rounded-md"
                >
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    className="w-12 p-1 text-center text-sm"
                    onFocus={(e) => e.target.select()}
                    onWheel={(e) => e.currentTarget.blur()}
                    onChange={(e) => {
                      const updated = [...currentItems];
                      updated[idx].quantity = Number(e.target.value);
                      updated[idx].total =
                        updated[idx].product.price * updated[idx].quantity;
                      setCurrentItems(updated);
                    }}
                  />
                  <span className="flex-1">{item.product.name}</span>
                  <span className="w-20 text-right">${item.total}</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveItem(idx)}
                  >
                    Eliminar
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Resumen de venta */}
          <Card className="w-64 p-4 shadow-md rounded-2xl">
            <CardContent className="space-y-2">
              <p className="text-lg font-bold">Total: ${total}</p>
              <div>
                <label className="block text-sm font-medium">
                  Pago recibido
                </label>
                <Input
                  type="number"
                  min={0}
                  value={payment}
                  onFocus={(e) => e.target.select()}
                  onWheel={(e) => e.currentTarget.blur()}
                  onChange={(e) => setPayment(Number(e.target.value))}
                />
                {payment >= total && (
                  <p className="text-green-600 font-bold">Cambio: ${change}</p>
                )}
              </div>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl"
                onClick={handleFinalizeSale}
              >
                Finalizar Venta
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Historial de ventas */}
      <Card className="p-4 shadow-md rounded-2xl max-w-4xl mx-auto">
        <h2 className="text-lg font-bold mb-2">Historial de Ventas</h2>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {salesHistory.map((sale, index) => (
            <div
              key={index}
              className="p-2 border rounded-md flex justify-between items-center"
            >
              <div>
                <p className="text-sm">
                  {sale.product} x{sale.quantity}
                </p>
                <p className="text-xs text-gray-500">{sale.date}</p>
              </div>
              <div className="text-sm font-bold">${sale.total}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
