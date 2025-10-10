const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.get("/health", async (req, res) => {
  res.json({ status: "ok" });
});

// Usuarios endpoints
app.get("/usuarios", async (req, res) => {
  try {
    const usuarios = await db.getAllUsuarios();
    res.json(usuarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch usuarios" });
  }
});

app.post("/usuarios", async (req, res) => {
  try {
    const payload = req.body;
    const id = await db.createUsuario(payload);
    res.status(201).json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to create usuario" });
  }
});

app.put("/usuarios/:id", async (req, res) => {
  try {
    const updated = await db.updateUsuario(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to update usuario" });
  }
});

app.delete("/usuarios/:id", async (req, res) => {
  try {
    const removed = await db.deleteUsuario(req.params.id);
    if (!removed) return res.status(404).json({ error: "not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to delete usuario" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.verifyUsuario(username, password);
    if (!user) return res.status(401).json({ error: "invalid credentials" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to login" });
  }
});

// Products CRUD
app.get("/products", async (req, res) => {
  try {
    const products = await db.getAllProducts();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch products" });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: "not found" });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch product" });
  }
});

app.post("/products", async (req, res) => {
  try {
    const payload = req.body;
    const id = await db.createProduct(payload);
    res.status(201).json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to create product" });
  }
});

app.put("/products/:id", async (req, res) => {
  try {
    const updated = await db.updateProduct(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to update product" });
  }
});

app.delete("/products/:id", async (req, res) => {
  try {
    const removed = await db.deleteProduct(req.params.id);
    if (!removed) return res.status(404).json({ error: "not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to delete product" });
  }
});

// Sales endpoints
app.post("/sales", async (req, res) => {
  console.log("¡Llamada recibida!");
  try {
    const payload = req.body;
    console.log("Venta recibida:", JSON.stringify(payload));
    // 1. Descontar inventario por cada producto vendido
    for (const item of payload.items) {
      // Busca el producto por ID
      const product = await db.getProductById(item.productId);
      if (!product) {
        return res
          .status(404)
          .json({ error: `Producto no encontrado: ${item.name}` });
      }
      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ error: `Stock insuficiente para ${product.name}` });
      }
      // LOG aquí, ya tienes product y item
      console.log("Actualizando producto:", {
        id: product.id,
        nombre: product.name,
        stock_anterior: product.stock,
        cantidad_vendida: item.quantity,
        stock_nuevo: Number(product.stock) - Number(item.quantity),
      });
      // Actualiza el stock
      await db.updateProduct(product.id, {
        stock: Number(product.stock) - Number(item.quantity),
      });
    }
    // 2. Registrar la venta
    const result = await db.createSale(payload);
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to create sale" });
  }
});

app.get("/sales", async (req, res) => {
  try {
    const sales = await db.getAllSales();
    res.json(sales);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch sales" });
  }
});
// Gastos endpoints
app.get("/gastos", async (req, res) => {
  try {
    const gastos = await db.getAllGastos();
    res.json(gastos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch gastos" });
  }
});

app.get("/gastos/:id", async (req, res) => {
  try {
    const gasto = await db.getGastoById(req.params.id);
    if (!gasto) return res.status(404).json({ error: "not found" });
    res.json(gasto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch gasto" });
  }
});

app.post("/gastos", async (req, res) => {
  try {
    const payload = req.body;
    const id = await db.createGasto(payload);
    res.status(201).json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to create gasto" });
  }
});

app.put("/gastos/:id", async (req, res) => {
  try {
    const updated = await db.updateGasto(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to update gasto" });
  }
});

app.delete("/gastos/:id", async (req, res) => {
  try {
    const removed = await db.deleteGasto(req.params.id);
    if (!removed) return res.status(404).json({ error: "not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to delete gasto" });
  }
});

app.listen(PORT, () => {
  console.log(`PDV backend listening on http://localhost:${PORT}`);
});
