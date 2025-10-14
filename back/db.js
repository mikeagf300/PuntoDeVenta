const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const { promisify } = require("util");
const crypto = require("crypto");

// Allow overriding data directory from environment (used by Electron)
const defaultDataDir = path.join(__dirname, "data");
const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : defaultDataDir;
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
            // Create sales table as well
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
                resolve();
              }
            );
          }
        );
        // Create users table and seed admin if needed
        db.run(
          `
              CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
                metadata TEXT,
                created_at TEXT NOT NULL
              );
            `,
          (err4) => {
            if (err4) return reject(err4);
            // Seed an admin user if none exists
            const defaultUsername = process.env.ADMIN_USERNAME || "admin";
            const defaultPassword = process.env.ADMIN_PASSWORD || "admin123";
            db.get(
              "SELECT id FROM users WHERE username = ? LIMIT 1",
              defaultUsername,
              (e, row) => {
                if (e) return reject(e);
                if (row) return resolve(); // admin already exists, finish init

                try {
                  const salt = crypto.randomBytes(16).toString("hex");
                  const hash = crypto
                    .scryptSync(defaultPassword, salt, 64)
                    .toString("hex");
                  const now = new Date().toISOString();
                  db.run(
                    "INSERT INTO users (username, password_hash, salt, role, metadata, created_at) VALUES (?,?,?,?,?,?)",
                    defaultUsername,
                    hash,
                    salt,
                    "admin",
                    null,
                    now,
                    (insErr) => {
                      if (insErr) return reject(insErr);
                      resolve();
                    }
                  );
                } catch (hashErr) {
                  return reject(hashErr);
                }
              }
            );
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

// --- User helpers (password hashing using Node's crypto.scrypt) ---
function hashPasswordSync(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

function verifyPasswordSync(password, salt, expectedHash) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return hash === expectedHash;
}

module.exports.createUser = async function (payload) {
  await initIfNeeded();
  const { username, password, role = "user", metadata = null } = payload;
  if (!username || !password) throw new Error("username and password required");
  const { salt, hash } = hashPasswordSync(password);
  const result = await runAsync(
    "INSERT INTO users (username, password_hash, salt, role, metadata, created_at) VALUES (?,?,?,?,?,?)",
    username,
    hash,
    salt,
    role,
    metadata ? JSON.stringify(metadata) : null,
    new Date().toISOString()
  );
  return result.lastID;
};

module.exports.getUserByUsername = async function (username) {
  await initIfNeeded();
  return getAsync("SELECT * FROM users WHERE username = ?", username);
};

module.exports.verifyUser = async function (username, password) {
  await initIfNeeded();
  const user = await getAsync(
    "SELECT * FROM users WHERE username = ?",
    username
  );
  if (!user) return null;
  const ok = verifyPasswordSync(password, user.salt, user.password_hash);
  if (!ok) return null;
  // hide sensitive data
  delete user.password_hash;
  delete user.salt;
  return user;
};

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
