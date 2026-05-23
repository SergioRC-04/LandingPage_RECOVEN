import { defineConfig } from "vite";
import fs from "fs";
import path from "path";

// Plugin para copiar src/components a dist/components
const copyComponentsPlugin = () => ({
  name: "copy-components",
  writeBundle() {
    const srcDir = "src/components";
    const destDir = "dist/components";

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const files = fs.readdirSync(srcDir);
    files.forEach((file) => {
      const src = path.join(srcDir, file);
      const dest = path.join(destDir, file);
      fs.copyFileSync(src, dest);
    });
  },
});

export default defineConfig({
  root: "src",
  publicDir: false, // Desactiva publicDir
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
  plugins: [copyComponentsPlugin()],
  server: {
    port: 3000,
    open: true,
  },
});
