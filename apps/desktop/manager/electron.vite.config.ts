import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({
        exclude: ["@mfc/manager-sync-model", "@mfc/manager-ui", "@mfc/manager-workflows"],
      }),
    ],
  },
  preload: {
    plugins: [
      externalizeDepsPlugin({
        exclude: ["@mfc/manager-sync-model", "@mfc/manager-ui", "@mfc/manager-workflows"],
      }),
    ],
  },
  renderer: {
    plugins: [react()],
  },
});
