import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  root: "src",

  publicDir: "../public",

  plugins: [tailwindcss()],

  build: {
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
    port: 5173,
    open: true,
  },
});
