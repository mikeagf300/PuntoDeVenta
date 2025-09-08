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
  try {
    const payload = req.body; // { items, total, payment, change, date }
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

app.listen(PORT, () => {
  console.log(`PDV backend listening on http://localhost:${PORT}`);
});
