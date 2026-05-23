import { defineConfig } from "vite";

export default defineConfig({
  // 1. Establecemos la raíz en la carpeta del proyecto
  root: "src",

  // 2. Activamos de forma nativa la carpeta public (ya no necesitas false)
  publicDir: "../public",

  build: {
    // 3. Como root es "./", el outDir debe ser simplemente "dist"
    // (Ya no necesitas salir con "../dist")
    outDir: "../dist",
    emptyOutDir: true,

    rollupOptions: {
      input: {
        main: "src/index.html",
        empresa: "src/empresa.html",
        servicios: "src/servicios.html",
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
