/**
 * utils.js — Utilidades globales reutilizables
 * RECOVEN ECA SAS ESP · v2
 *
 * Funciones de propósito general que aplican a todas las páginas:
 * - Scroll suave con offset navbar
 * - Reveal on scroll (IntersectionObserver)
 */

/**
 * Scroll suave con offset navbar
 * Solo intercepta anchors internos (#...).
 * Los links cross-página (index.html#contacto) navegan normalmente.
 */
export function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const navbar = document.getElementById("navbar");
      const navHeight = navbar ? navbar.offsetHeight : 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top: targetTop, behavior: "smooth" });

      // Preselección del select SOLO cuando destino es #contacto (index.html)
      const serviceValue = anchor.dataset.service;
      if (serviceValue && href === "#contacto") {
        setTimeout(() => {
          const select = document.getElementById("servicioTipo");
          if (select) {
            select.value = serviceValue;
            select.classList.add("ring-2", "ring-green-500");
            setTimeout(() => select.classList.remove("ring-2", "ring-green-500"), 1200);
          }
        }, 600);
      }
    });
  });
}

/**
 * Reveal on scroll - Animación de aparición con IntersectionObserver
 * Detecta elementos .reveal y los anima al entrar al viewport
 */
export function initReveal() {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const section = entry.target.closest("section") ?? document.body;
        const siblings = Array.from(section.querySelectorAll(".reveal"));
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => entry.target.classList.add("visible"), idx * 100);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
  );

  elements.forEach((el) => observer.observe(el));
}
