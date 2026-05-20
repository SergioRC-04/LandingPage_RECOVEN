/**
 * main.js — Orquestador principal
 * RECOVEN ECA SAS ESP · v2
 *
 * Responsabilidades:
 *  1. Importar e inicializar todos los módulos
 *  2. Scroll suave con compensación exacta del navbar fijo  ← FIX del salto brusco
 *  3. Animaciones reveal con IntersectionObserver
 */

import { initMenu }     from './modules/menu.js';
import { initTabs }     from './modules/tabs.js';
import { initCarousel } from './modules/carousel.js';
import { initForm }     from './modules/form.js';

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initTabs();
  initCarousel();
  initForm();
  initSmoothScroll();
  initReveal();
});

// ── 1. SCROLL SUAVE CON OFFSET DEL NAVBAR ────────────────────────
/**
 * El problema del "salto brusco" ocurre porque el scroll nativo
 * no descuenta la altura del header fijo. Esta función lo resuelve:
 * intercepta TODOS los <a href="#seccion">, calcula la posición real
 * de la sección menos la altura del navbar, y hace window.scrollTo
 * con behavior: 'smooth'.
 *
 * Funciona tanto para los links del header como para los CTAs del
 * hero y el footer.
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href   = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const navbar    = document.getElementById('navbar');
      const navHeight = navbar ? navbar.offsetHeight : 0;

      // Posición absoluta del elemento menos la altura del navbar
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({
        top:      targetTop,
        behavior: 'smooth',
      });
    });
  });
}

// ── 2. REVEAL ON SCROLL ──────────────────────────────────────────
/**
 * IntersectionObserver que añade la clase .visible a cada elemento
 * con clase .reveal en cuanto entra en el viewport.
 * Los elementos hijos dentro de la misma sección se revelan
 * con un pequeño delay escalonado.
 */
function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        // Calcular delay escalonado entre hermanos .reveal de la misma sección
        const section  = entry.target.closest('section') ?? document.body;
        const siblings = Array.from(section.querySelectorAll('.reveal'));
        const idx      = siblings.indexOf(entry.target);
        const delay    = idx * 100; // 100ms entre cada elemento

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        observer.unobserve(entry.target);
      });
    },
    {
      threshold:  0.1,
      rootMargin: '0px 0px -30px 0px',
    }
  );

  elements.forEach(el => observer.observe(el));
}
