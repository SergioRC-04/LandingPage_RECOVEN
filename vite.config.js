import { defineConfig } from "vite";
import fs from "fs";
import path from "path";

// Plugin para copiar src/components y src/assets/img/logo.png a dist/
const copyFilesPlugin = () => ({
  name: "copy-files",
  writeBundle() {
    // Copiar components
    const srcComponentsDir = "src/components";
    const destComponentsDir = "dist/components";

    if (!fs.existsSync(destComponentsDir)) {
      fs.mkdirSync(destComponentsDir, { recursive: true });
    }

    const componentFiles = fs.readdirSync(srcComponentsDir);
    componentFiles.forEach((file) => {
      const src = path.join(srcComponentsDir, file);
      const dest = path.join(destComponentsDir, file);
      fs.copyFileSync(src, dest);
    });

    // Copiar solo logo.png
    const srcLogo = "src/assets/img/logo.png";
    const destDir = "dist/assets/img";
    const destLogo = path.join(destDir, "logo.png");

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(srcLogo, destLogo);
  },
});

export default defineConfig({
  root: "src",
  publicDir: false,
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
  plugins: [copyFilesPlugin()],
  server: {
    port: 3000,
    open: true,
  },
});
