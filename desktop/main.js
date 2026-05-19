const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

const DEV_URL = process.env.NEBULA_URL || "http://localhost:5173";
const isDev = !app.isPackaged || process.argv.includes("--dev");

let win;
let botProcess = null;

function startBot() {
  const botPath = path.join(__dirname, "..", "bot");
  try {
    // use `node` executable (reliable inside Electron environment)
    botProcess = spawn(process.env.NODE_EXE || "node", ["index.js"], {
      cwd: botPath,
      stdio: "inherit",
      env: { ...process.env },
    });

    botProcess.on("close", (code) => {
      console.log(`Nebula bot exited with code ${code}`);
    });
    botProcess.on("error", (err) => {
      console.error("Nebula bot error:", err);
    });
  } catch (err) {
    console.error("Failed to start Nebula bot:", err);
  }
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 640,
    backgroundColor: "#07060d",
    title: "Nebula Casino",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL(DEV_URL);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    const indexPath = path.join(__dirname, "..", "web", "dist", "index.html");
    win.loadFile(indexPath).catch((err) => {
      console.error("Failed to load index file:", err);
      win.loadURL(DEV_URL);
    });
  }

  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
}

ipcMain.on("win:minimize", () => win?.minimize());
ipcMain.on("win:close", () => win?.close());

app.whenReady().then(() => {
  startBot();
  createWindow();
});

app.on("before-quit", () => {
  if (botProcess) {
    try {
      botProcess.kill();
    } catch (e) {}
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
