import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  // Carga las variables del .env según el modo (development/production)
  const env = loadEnv(mode, process.cwd(), "");

  return {
    root: "src",
    publicDir: "../public",
    plugins: [tailwindcss()],
    define: {
      // Exponemos la variable VITE_API_URL al cliente
      "import.meta.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL),
    },
    build: {
      outDir: "../dist",
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: "src/index.html",
          empresa: "src/empresa.html",
          servicios: "src/servicios.html",
          admin: "src/admin.html",
        },
      },
    },
    server: {
      port: 5173,
      open: true,
    },
  };
});
