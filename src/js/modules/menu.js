/**
 * menu.js — Menú hamburguesa animado y navbar scroll
 * RECOVEN ECA SAS ESP · v2
 */

export function initMenu() {
  const btn = document.getElementById("menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileLinks = document.querySelectorAll(".mobile-link");

  if (!btn || !mobileMenu) return;

  let isOpen = false;

  btn.addEventListener("click", () => {
    isOpen = !isOpen;
    btn.classList.toggle("open", isOpen);
    mobileMenu.classList.toggle("open", isOpen);
    btn.setAttribute("aria-expanded", String(isOpen));
  });

  // Cerrar al pulsar cualquier enlace del menú móvil
  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      isOpen = false;
      btn.classList.remove("open");
      mobileMenu.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    });
  });

  // Cerrar al hacer clic fuera del menú
  document.addEventListener("click", (e) => {
    if (isOpen && !btn.contains(e.target) && !mobileMenu.contains(e.target)) {
      isOpen = false;
      btn.classList.remove("open");
      mobileMenu.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });
}
