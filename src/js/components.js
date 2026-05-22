/* ==================== COMPONENT INJECTION SYSTEM ==================== */

import { initMenu } from "./modules/menu.js";
import { initNavigation } from "./modules/navigation.js";

/**
 * Inyecta un componente HTML desde una URL
 * @param {string} selector - Selector CSS del contenedor donde insertar
 * @param {string} path - Ruta del archivo HTML a cargar
 * @param {object} options - Opciones configurables (opcional)
 *   - position: "beforeend" | "afterbegin" (default: "beforeend")
 *   - callback: function a ejecutar después de inyectar (default: null)
 *   - strict: boolean - lanzar error si elemento no existe (default: true)
 */
async function injectComponent(selector, path, options = {}) {
  const { position = "beforeend", callback = null, strict = true } = options;

  try {
    // 1. Descargar archivo
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}: ${response.status}`);
    }

    // 2. Convertir a HTML
    const html = await response.text();

    // 3. Buscar elemento
    const element = document.querySelector(selector);
    if (!element) {
      if (strict) {
        throw new Error(`Element not found: ${selector}`);
      }
      return; // Fail silently si no strict
    }

    // 4. Insertar HTML
    element.insertAdjacentHTML(position, html);

    // 5. Ejecutar callback si existe
    if (callback && typeof callback === "function") {
      callback();
    }
  } catch (error) {
    console.error(`Error injecting component from ${path}:`, error);
  }
}

/**
 * Inyecta los componentes globales (header, footer, whatsapp-fab)
 */
async function initializeComponents() {
  // Esperar a que DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectComponents);
  } else {
    injectComponents();
  }
}

async function injectComponents() {
  try {
    // Inyectar WhatsApp FAB - uso simple (strict: false)
    await injectComponent("body", "components/whatsapp-fab.html", {
      strict: false,
    });

    // Inyectar Header al inicio del body con callback
    await injectComponent("body", "components/header.html", {
      position: "afterbegin",
      callback: () => {
        // Inicializar menú DESPUÉS de que el header está inyectado
        initMenu();
        initNavigation();
      },
    });

    // Remover footer estático si existe
    const staticFooter = document.querySelector("footer");
    if (staticFooter) {
      staticFooter.remove();
    }

    // Inyectar Footer dinámico al final del body
    await injectComponent("body", "components/footer.html", {
      position: "beforeend",
    });
  } catch (error) {
    console.error("Error during component injection:", error);
  }
}

// Inicializar cuando el DOM esté listo
initializeComponents();
