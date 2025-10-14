const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let backProc = null;
let frontProc = null;

function startBack(dataDir) {
  const env = {
    ...process.env,
    DATA_DIR: dataDir,
    PORT: process.env.BACK_PORT || "3001",
  };
  const backEntry = path.join(__dirname, "..", "back", "index.js");
  // Use same Node executable as Electron to run the back script
  backProc = spawn(process.execPath, [backEntry], {
    env,
    cwd: path.join(__dirname, "..", "back"),
    stdio: "inherit",
  });
  backProc.on("exit", (code) => {
    console.log("Backend exited with", code);
  });
}

function startFront() {
  // Assumes front is built and next start is available in node_modules
  const env = { ...process.env, PORT: process.env.FRONT_PORT || "3000" };
  const frontBin = path.join(
    __dirname,
    "..",
    "front",
    "node_modules",
    ".bin",
    "next"
  );
  frontProc = spawn(process.execPath, [frontBin, "start", "-p", env.PORT], {
    env,
    cwd: path.join(__dirname, "..", "front"),
    stdio: "inherit",
  });
  frontProc.on("exit", (code) => {
    console.log("Frontend exited with", code);
  });
}

function createWindow(url) {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  mainWindow.loadURL(url);
}

app.whenReady().then(() => {
  // Choose data directory: default app userData, or portable next to the exe if PORTABLE env is set
  const userData = app.getPath("userData");
  let dataDir = userData;
  if (process.env.PORTABLE === "1") {
    const execDir = path.dirname(process.execPath);
    dataDir = path.join(execDir, "data");
  }
  // Ensure dir exists
  const fs = require("fs");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  startBack(dataDir);
  // Wait a bit for backend to be ready - in production you might probe /health
  setTimeout(() => {
    startFront();
    // load the front URL
    createWindow("http://localhost:3000");
  }, 1500);
});

app.on("before-quit", () => {
  if (backProc) backProc.kill();
  if (frontProc) frontProc.kill();
});
