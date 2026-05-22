/**
 * navigation.js — Generación dinámica de navegación
 * RECOVEN ECA SAS ESP · v2
 *
 * Genera los links de navegación según la página actual
 * y aplica estilos activos dinámicamente.
 */
import { NAV_LINKS, getCurrentPage } from "../config/nav-config.js";

export function initNavigation() {
  const currentPage = getCurrentPage(); // ← Usa función global
  const desktopNav = document.querySelector("#desktop-nav");
  const mobileNav = document.querySelector("#mobile-nav");
  const desktopCta = document.querySelector("#desktop-cta");

  // Desktop Navigation
  if (desktopNav) {
    desktopNav.innerHTML = NAV_LINKS.map((link) => {
      const isActive = currentPage === link.href;
      const activeClass = isActive
        ? "text-primary-green font-bold border-b-2 border-primary-green pb-0.5"
        : "hover:text-primary-green transition";
      return `<a href="${link.href}" class="${activeClass} ${link.class || ""}">${link.label}</a>`;
    }).join("");
  }

  // Mobile Navigation
  if (mobileNav) {
    mobileNav.innerHTML = NAV_LINKS.map((link) => {
      const isActive = currentPage === link.href;
      let classes = "mobile-link font-medium hover:text-primary-green py-2 px-2 rounded-lg";
      if (isActive && link.href !== "#contacto") {
        classes = "mobile-link font-bold text-primary-green py-2 px-2 rounded-lg bg-green-50";
      } else if (!isActive) {
        classes += " hover:bg-gray-50";
      }
      return `<a href="${link.href}" class="${classes}">${link.label}</a>`;
    }).join("");

    // Agregar botón CTA en mobile
    mobileNav.innerHTML += `
      <a href="index.html#contacto" class="mobile-link bg-primary-green text-white text-center rounded-full py-2 font-semibold mt-2">
        <i class="fas fa-truck mr-1"></i> Solicitar Servicio
      </a>
    `;
  }

  // Desktop CTA
  if (desktopCta) {
    desktopCta.innerHTML = `
      <a href="index.html#contacto" class="bg-primary-green text-white px-6 py-2 rounded-full font-bold shadow-md flex items-center gap-2 hover:bg-opacity-90 transition">
        <i class="fas fa-truck"></i> Solicitar Servicio
      </a>
    `;
  }
}
