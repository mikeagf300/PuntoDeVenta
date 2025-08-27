"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Product, Sale } from "@/interfaces/productos";

// Datos simulados de inventario
const products: Product[] = [
  { id: 1, name: "Coca Cola 600ml", price: 15 },
  { id: 2, name: "Coca Cola 1L", price: 20 },
  { id: 3, name: "Coca Cola 1.5L", price: 25 },
  { id: 4, name: "Pepsi 600ml", price: 14 },
  { id: 5, name: "Pepsi 1L", price: 19 },
];

interface SaleItem {
  product: Product;
  quantity: number;
  total: number;
}

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
    const newItem: SaleItem = {
      product: selectedProduct,
      quantity,
      total: selectedProduct.price * quantity,
    };
    setCurrentItems([...currentItems, newItem]);
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
      <Card className="p-4 shadow-md rounded-2xl">
        <CardContent className="space-y-4">
          {/* Buscar producto */}
          <div>
            <label className="block text-sm font-medium">Producto</label>
            <Input
              placeholder="Buscar producto..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedProduct(null);
              }}
            />
            {query && !selectedProduct && (
              <div className="mt-2 border rounded-md bg-white shadow">
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
          </div>

          {/* Configurar cantidad y agregar a la venta */}
          {selectedProduct && (
            <div className="space-y-2">
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

          {/* Lista de productos agregados */}
          {currentItems.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Productos en la venta:</h3>
              {currentItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-2 border rounded-md"
                >
                  <span>
                    {item.product.name} x{item.quantity}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>${item.total}</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveItem(idx)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
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
                  <p className="text-green-600">Cambio: ${change}</p>
                )}
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl"
                onClick={handleFinalizeSale}
              >
                Finalizar Venta
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historial de ventas */}
      <Card className="p-4 shadow-md rounded-2xl">
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
