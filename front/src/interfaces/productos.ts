export interface Product {
  id: number;
  name: string;
  category: string;
  stock: number;
  price: number;
  sku: string;
}

export interface Sale {
  product: string;
  quantity: number;
  total: number;
  payment: number;
  change: number;
  date: string;
}

export interface SaleItem {
  product: Product;
  quantity: number;
  total: number;
}
