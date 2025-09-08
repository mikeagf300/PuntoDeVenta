export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type ProductPayload = {
  name: string;
  price?: number;
  stock?: number;
  metadata?: any;
};

export async function getProducts() {
  const res = await fetch(`${BASE_URL}/products`);
  if (!res.ok) throw new Error(`failed to fetch products: ${res.status}`);
  return res.json();
}

export async function getProductById(id: number | string) {
  const res = await fetch(`${BASE_URL}/products/${id}`);
  if (!res.ok) throw new Error(`failed to fetch product: ${res.status}`);
  return res.json();
}

export async function createProduct(payload: ProductPayload) {
  const res = await fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`failed to create product: ${res.status}`);
  return res.json();
}

export async function updateProduct(
  id: number | string,
  payload: Partial<ProductPayload>
) {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`failed to update product: ${res.status}`);
  return res.json();
}

export async function deleteProduct(id: number | string) {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`failed to delete product: ${res.status}`);
  return res.json();
}
