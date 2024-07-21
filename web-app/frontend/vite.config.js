import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    build: {
      outDir: "../dist", // Output to the parent directory
      assetsDir: "assets",
      emptyOutDir: true,
      sourcemap: true,
    },
    publicDir: "public",
    base: "/", // This ensures assets are loaded correctly from the root
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    define: {
      "process.env": env,
    },
    server: {
      port: 5173,
      strictPort: true,
      host: true, // This allows the server to be accessible externally
    },
    preview: {
      port: 5173,
      strictPort: true,
      host: true,
    },
    optimizeDeps: {
      include: ["react-router-dom"],
    },
    esbuild: {
      loader: "jsx",
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
  };
});
