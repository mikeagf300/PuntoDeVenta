// src/interfaces/ventas.ts

export interface Venta {
  id: number; // Identificador único
  producto: string; // Nombre del producto
  categoria: string; // Categoría del producto
  cantidad: number; // Cantidad vendida
  precioUnitario: number; // Precio por unidad
  total: number; // Total de la venta (cantidad * precioUnitario)
  fecha: string; // Fecha de la venta en formato "YYYY-MM-DD"
}
