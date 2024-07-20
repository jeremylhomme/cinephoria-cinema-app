import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { pluginExposeRenderer } from "./vite.base.config.mjs";

export default defineConfig((env) => {
  const forgeEnv = env;
  const { root, mode, forgeConfigSelf } = forgeEnv;
  const name = forgeConfigSelf.name ?? "";

  return {
    root,
    mode,
    css: {
      postcss: "./postcss.config.js",
    },
    base: "./",
    build: {
      outDir: `.vite/renderer/${name}`,
    },
    plugins: [react(), pluginExposeRenderer(name)],
    resolve: {
      preserveSymlinks: true,
    },
    define: {
      "process.env": process.env,
    },
    clearScreen: false,
  };
});
