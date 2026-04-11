import path from "node:path";
import { app, BrowserWindow } from "electron";

import { desktopEnv } from "./env";
import { registerIpcHandlers } from "./ipc";
import { resolvePendingOAuthCallback } from "./supabase";

let mainWindow: BrowserWindow | null = null;

function getOAuthProtocol(): string | null {
  try {
    const protocol = new URL(desktopEnv.oauthRedirectUrl).protocol.replace(":", "");
    return protocol || null;
  } catch {
    return null;
  }
}

function focusMainWindow(): void {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.focus();
}

function handleOAuthUrl(url: string): boolean {
  const handled = resolvePendingOAuthCallback(url);

  if (handled) {
    focusMainWindow();
  }

  return handled;
}

const oauthProtocol = getOAuthProtocol();
const isCustomOauthProtocol =
  oauthProtocol !== null && oauthProtocol !== "http" && oauthProtocol !== "https";

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

app.on("second-instance", (_event, argv) => {
  if (isCustomOauthProtocol && oauthProtocol) {
    const callbackUrl = argv.find((arg) => arg.startsWith(`${oauthProtocol}://`));
    if (callbackUrl) {
      handleOAuthUrl(callbackUrl);
    }
  }

  focusMainWindow();
});

app.on("open-url", (event, url) => {
  if (!isCustomOauthProtocol) {
    return;
  }

  event.preventDefault();
  handleOAuthUrl(url);
});

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1480,
    height: 980,
    minWidth: 1280,
    minHeight: 820,
    backgroundColor: "#ffffff",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void window.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  mainWindow = window;
  window.on("closed", () => {
    if (mainWindow === window) {
      mainWindow = null;
    }
  });
}

app.whenReady().then(() => {
  if (isCustomOauthProtocol && oauthProtocol) {
    if (process.defaultApp) {
      app.setAsDefaultProtocolClient(oauthProtocol, process.execPath, [path.resolve(process.argv[1] ?? "")]);
    } else {
      app.setAsDefaultProtocolClient(oauthProtocol);
    }
  }

  registerIpcHandlers();
  createWindow();

  if (isCustomOauthProtocol && oauthProtocol) {
    const callbackUrl = process.argv.find((arg) => arg.startsWith(`${oauthProtocol}://`));
    if (callbackUrl) {
      handleOAuthUrl(callbackUrl);
    }
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
