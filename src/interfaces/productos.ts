export interface Product {
  id: number;
  name: string;
  price: number;
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
