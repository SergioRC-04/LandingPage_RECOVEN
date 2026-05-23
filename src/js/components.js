/* ==================== COMPONENT INJECTION SYSTEM (VITE OPTIMIZED) ==================== */

import { initMenu } from "./modules/menu.js";
import { initNavigation } from "./modules/navigation.js";

// 1. Importamos los HTMLs en crudo usando la magia de Vite
import whatsappHTML from "../components/whatsapp-fab.html?raw";
import headerHTML from "../components/header.html?raw";
import footerHTML from "../components/footer.html?raw";

/**
 * Inyecta un componente HTML pre-cargado como string
 * @param {string} selector - Selector CSS del contenedor donde insertar
 * @param {string} htmlContent - El contenido HTML en crudo (string)
 * @param {object} options - Opciones configurables (opcional)
 */
function injectComponent(selector, htmlContent, options = {}) {
  const { position = "beforeend", callback = null, strict = true } = options;

  try {
    // Buscar elemento
    const element = document.querySelector(selector);
    if (!element) {
      if (strict) {
        throw new Error(`Element not found: ${selector}`);
      }
      return; // Fail silently si no es strict
    }

    // Insertar HTML de forma directa e instantánea
    element.insertAdjacentHTML(position, htmlContent);

    // Ejecutar callback si existe
    if (callback && typeof callback === "function") {
      callback();
    }
  } catch (error) {
    console.error(`Error injecting component into ${selector}:`, error);
  }
}

/**
 * Inyecta los componentes globales (header, footer, whatsapp-fab)
 */
function initializeComponents() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectComponents);
  } else {
    injectComponents();
  }
}

function injectComponents() {
  try {
    // Inyectar WhatsApp FAB - Le pasamos directamente el string importado
    injectComponent("body", whatsappHTML, {
      strict: false,
    });

    // Inyectar Header al inicio del body con su callback
    injectComponent("body", headerHTML, {
      position: "afterbegin",
      callback: () => {
        // Inicializar menú inmediatamente después
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
    injectComponent("body", footerHTML, {
      position: "beforeend",
    });
  } catch (error) {
    console.error("Error during component injection:", error);
  }
}

// Inicializar cuando el DOM esté listo
initializeComponents();
