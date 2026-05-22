/**
 * nav-config.js — Configuración de navegación
 * RECOVEN ECA SAS ESP · v2
 *
 * Define los links de navegación en UN SOLO LUGAR
 * Se puede importar desde cualquier módulo que lo necesite
 */

export const NAV_LINKS = [
  { label: "Inicio", href: "index.html", id: "index" },
  { label: "Nosotros", href: "empresa.html", id: "empresa" },
  { label: "Servicios", href: "servicios.html", id: "servicios" },
  { label: "Contacto", href: "index.html#contacto", id: "contacto", class: "nav-link" },
];

/**
 * Obtiene la página actual normalizada
 * Ejemplo: "/servicios.html" → "servicios.html"
 */
export function getCurrentPage() {
  return window.location.pathname.split("/").pop() || "index.html";
}
