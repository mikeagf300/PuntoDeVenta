const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const { promisify } = require("util");

const dataDir = path.join(__dirname, "data");
const dbPath = path.join(dataDir, "db.sqlite");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

let db;
function init() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
      // Enable WAL
      db.run("PRAGMA journal_mode = WAL;", (e) => {
        if (e) return reject(e);
        // Crear tabla de productos
        // Crear tabla de productos
        db.run(
          `
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    sku TEXT UNIQUE,
    stock INTEGER NOT NULL DEFAULT 0,
    price REAL NOT NULL DEFAULT 0
  );
  `,
          (err2) => {
            if (err2) return reject(err2);
            // Crear tabla de ventas
            db.run(
              `
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        items TEXT NOT NULL,
        total REAL NOT NULL DEFAULT 0,
        payment REAL NOT NULL DEFAULT 0,
        change REAL NOT NULL DEFAULT 0,
        date TEXT NOT NULL
      );
    `,
              (err3) => {
                if (err3) return reject(err3);
                // Crear tabla de gastos
                db.run(
                  `
            CREATE TABLE IF NOT EXISTS gastos (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              nombre TEXT NOT NULL,
              categoria TEXT NOT NULL,
              monto REAL NOT NULL,
              fecha TEXT NOT NULL
            );
          `,
                  (err4) => {
                    if (err4) return reject(err4);
                    // Crear tabla de usuarios
                    db.run(
                      `
                CREATE TABLE IF NOT EXISTS usuarios (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  username TEXT NOT NULL UNIQUE,
                  password TEXT NOT NULL,
                  role TEXT NOT NULL DEFAULT 'user',
                  nombre TEXT
                );
              `,
                      (err5) => {
                        if (err5) return reject(err5);
                        resolve();
                      }
                    );
                  }
                );
              }
            );
          }
        );
      });
    });
  });
}

// Usuarios helpers
const bcrypt = require("bcryptjs");

module.exports.createUsuario = async function (payload) {
  await initIfNeeded();
  const { username, password, role = "user", nombre = null } = payload;
  const hash = await bcrypt.hash(password, 10);
  const result = await runAsync(
    "INSERT INTO usuarios (username, password, role, nombre) VALUES (?,?,?,?)",
    username,
    hash,
    role,
    nombre
  );
  return result.lastID;
};

module.exports.getUsuarioByUsername = async function (username) {
  await initIfNeeded();
  return getAsync("SELECT * FROM usuarios WHERE username = ?", username);
};

module.exports.getAllUsuarios = async function () {
  await initIfNeeded();
  return allAsync(
    "SELECT id, username, role, nombre FROM usuarios ORDER BY id DESC"
  );
};

module.exports.updateUsuario = async function (id, payload) {
  await initIfNeeded();
  const fields = [];
  const values = [];
  if (payload.username !== undefined) {
    fields.push("username = ?");
    values.push(payload.username);
  }
  if (payload.password !== undefined) {
    const hash = await bcrypt.hash(payload.password, 10);
    fields.push("password = ?");
    values.push(hash);
  }
  if (payload.role !== undefined) {
    fields.push("role = ?");
    values.push(payload.role);
  }
  if (payload.nombre !== undefined) {
    fields.push("nombre = ?");
    values.push(payload.nombre);
  }
  if (fields.length === 0) return false;
  values.push(id);
  const sql = `UPDATE usuarios SET ${fields.join(", ")} WHERE id = ?`;
  const result = await runAsync(sql, ...values);
  return result.changes > 0;
};

module.exports.deleteUsuario = async function (id) {
  await initIfNeeded();
  const result = await runAsync("DELETE FROM usuarios WHERE id = ?", id);
  return result.changes > 0;
};

module.exports.verifyUsuario = async function (username, password) {
  await initIfNeeded();
  const user = await getAsync(
    "SELECT * FROM usuarios WHERE username = ?",
    username
  );
  if (!user) return false;
  const match = await bcrypt.compare(password, user.password);
  if (!match) return false;
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    nombre: user.nombre,
  };
};

const allAsync = (...args) =>
  new Promise((res, rej) =>
    db.all(...args, (e, rows) => (e ? rej(e) : res(rows)))
  );
const getAsync = (...args) =>
  new Promise((res, rej) =>
    db.get(...args, (e, row) => (e ? rej(e) : res(row)))
  );
const runAsync = (...args) =>
  new Promise((res, rej) =>
    db.run(...args, function (e) {
      if (e) return rej(e);
      res(this);
    })
  );

module.exports._init = init;

module.exports.getAllProducts = async function () {
  await initIfNeeded();
  return allAsync("SELECT * FROM products ORDER BY id DESC");
};

module.exports.getProductById = async function (id) {
  await initIfNeeded();
  return getAsync("SELECT * FROM products WHERE id = ?", id);
};

// Crear producto
module.exports.createProduct = async function (payload) {
  await initIfNeeded();
  const { name, price = 0, stock = 0, sku = null, category = null } = payload;
  const result = await runAsync(
    "INSERT INTO products (name, category, sku, stock, price) VALUES (?,?,?,?,?)",
    name,
    category,
    sku,
    stock,
    price
  );
  return result.lastID;
};

// Actualizar producto
module.exports.updateProduct = async function (id, payload) {
  await initIfNeeded();
  const fields = [];
  const values = [];

  if (payload.name !== undefined) {
    fields.push("name = ?");
    values.push(payload.name);
  }
  if (payload.price !== undefined) {
    fields.push("price = ?");
    values.push(payload.price);
  }
  if (payload.stock !== undefined) {
    fields.push("stock = ?");
    values.push(payload.stock);
  }
  if (payload.sku !== undefined) {
    fields.push("sku = ?");
    values.push(payload.sku);
  }
  if (payload.category !== undefined) {
    fields.push("category = ?");
    values.push(payload.category);
  }

  if (fields.length === 0) return false;

  values.push(id);
  const sql = `UPDATE products SET ${fields.join(", ")} WHERE id = ?`;
  console.log("Ejecutando updateProduct:", sql, values);
  const result = await runAsync(sql, ...values);
  return result.changes > 0;
};

module.exports.deleteProduct = async function (id) {
  await initIfNeeded();
  const result = await runAsync("DELETE FROM products WHERE id = ?", id);
  return result.changes > 0;
};

// Sales helpers
module.exports.createSale = async function (payload) {
  await initIfNeeded();
  const { items, total = 0, payment = 0, change = 0, date } = payload;
  const itemsStr = JSON.stringify(items || []);
  const result = await runAsync(
    "INSERT INTO sales (items, total, payment, change, date) VALUES (?,?,?,?,?)",
    itemsStr,
    total,
    payment,
    change,
    date
  );
  return { id: result.lastID };
};

// Gastos helpers
module.exports.createGasto = async function (payload) {
  await initIfNeeded();
  const { nombre, categoria, monto, fecha } = payload;
  const result = await runAsync(
    "INSERT INTO gastos (nombre, categoria, monto, fecha) VALUES (?,?,?,?)",
    nombre,
    categoria,
    monto,
    fecha
  );
  return result.lastID;
};

module.exports.getAllGastos = async function () {
  await initIfNeeded();
  return allAsync("SELECT * FROM gastos ORDER BY id DESC");
};

module.exports.getGastoById = async function (id) {
  await initIfNeeded();
  return getAsync("SELECT * FROM gastos WHERE id = ?", id);
};

module.exports.updateGasto = async function (id, payload) {
  await initIfNeeded();
  const fields = [];
  const values = [];
  if (payload.nombre !== undefined) {
    fields.push("nombre = ?");
    values.push(payload.nombre);
  }
  if (payload.categoria !== undefined) {
    fields.push("categoria = ?");
    values.push(payload.categoria);
  }
  if (payload.monto !== undefined) {
    fields.push("monto = ?");
    values.push(payload.monto);
  }
  if (payload.fecha !== undefined) {
    fields.push("fecha = ?");
    values.push(payload.fecha);
  }
  if (fields.length === 0) return false;
  values.push(id);
  const sql = `UPDATE gastos SET ${fields.join(", ")} WHERE id = ?`;
  const result = await runAsync(sql, ...values);
  return result.changes > 0;
};

module.exports.deleteGasto = async function (id) {
  await initIfNeeded();
  const result = await runAsync("DELETE FROM gastos WHERE id = ?", id);
  return result.changes > 0;
};

module.exports.getAllSales = async function () {
  await initIfNeeded();
  const rows = await allAsync("SELECT * FROM sales ORDER BY id DESC");
  // parse items JSON
  return rows.map((r) => ({ ...r, items: JSON.parse(r.items || "[]") }));
};

let initPromise = null;
function initIfNeeded() {
  if (initPromise) return initPromise;
  initPromise = init();
  return initPromise;
}
