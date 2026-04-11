import fs from "node:fs/promises";
import path from "node:path";
import { app } from "electron";

type StoredAuth = Record<string, string>;

function getStoragePath(): string {
  return path.join(app.getPath("userData"), "supabase-auth.json");
}

async function readAuthFile(): Promise<StoredAuth> {
  try {
    const content = await fs.readFile(getStoragePath(), "utf8");
    return JSON.parse(content) as StoredAuth;
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      return {};
    }

    throw error;
  }
}

async function writeAuthFile(data: StoredAuth): Promise<void> {
  const filePath = getStoragePath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export const desktopAuthStorage = {
  async getItem(key: string): Promise<string | null> {
    const state = await readAuthFile();
    return state[key] ?? null;
  },
  async setItem(key: string, value: string): Promise<void> {
    const state = await readAuthFile();
    state[key] = value;
    await writeAuthFile(state);
  },
  async removeItem(key: string): Promise<void> {
    const state = await readAuthFile();
    delete state[key];
    await writeAuthFile(state);
  },
};
