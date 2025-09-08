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
        db.run(
          `
          CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL DEFAULT 0,
            stock INTEGER NOT NULL DEFAULT 0,
            metadata TEXT
          );
        `,
          (err2) => {
            if (err2) return reject(err2);
            resolve();
          }
        );
      });
    });
  });
}

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

module.exports.createProduct = async function (payload) {
  await initIfNeeded();
  const { name, price = 0, stock = 0, metadata = null } = payload;
  const result = await runAsync(
    "INSERT INTO products (name, price, stock, metadata) VALUES (?,?,?,?)",
    name,
    price,
    stock,
    metadata ? JSON.stringify(metadata) : null
  );
  return result.lastID;
};

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
  if (payload.metadata !== undefined) {
    fields.push("metadata = ?");
    values.push(JSON.stringify(payload.metadata));
  }
  if (fields.length === 0) return false;
  values.push(id);
  const sql = `UPDATE products SET ${fields.join(", ")} WHERE id = ?`;
  const result = await runAsync(sql, ...values);
  return result.changes > 0;
};

module.exports.deleteProduct = async function (id) {
  await initIfNeeded();
  const result = await runAsync("DELETE FROM products WHERE id = ?", id);
  return result.changes > 0;
};

let initPromise = null;
function initIfNeeded() {
  if (initPromise) return initPromise;
  initPromise = init();
  return initPromise;
}
