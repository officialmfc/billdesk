import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";

const require = createRequire(import.meta.url);
const electronPackagePath = require.resolve("electron/package.json");
const electronDir = path.dirname(electronPackagePath);
const pathFile = path.join(electronDir, "path.txt");

if (fs.existsSync(pathFile)) {
  process.exit(0);
}

console.log("[desktop-manager] Electron runtime is missing. Restoring local Electron binary...");

const installScript = path.join(electronDir, "install.js");
const result = spawnSync(process.execPath, [installScript], {
  stdio: "inherit",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
