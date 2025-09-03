import { Product } from "@/interfaces/productos";

// Datos simulados de inventario
export const products: Product[] = [
  {
    id: 1,
    name: "Coca Cola 600ml",
    price: 15,
    category: "Bebidas",
    stock: 50,
    sku: "CC600",
  },
  {
    id: 2,
    name: "Coca Cola 1L",
    price: 20,
    category: "Bebidas",
    stock: 40,
    sku: "CC1L",
  },
  {
    id: 3,
    name: "Coca Cola 1.5L",
    price: 25,
    category: "Bebidas",
    stock: 30,
    sku: "CC15L",
  },
  {
    id: 4,
    name: "Pepsi 600ml",
    price: 14,
    category: "Bebidas",
    stock: 60,
    sku: "PEP600",
  },
];
