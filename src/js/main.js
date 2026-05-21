/**
 * main.js — Orquestador multi-página
 * RECOVEN ECA SAS ESP · v2
 *
 * Detecta qué elementos existen en el DOM para inicializar
 * solo los módulos que aplican a cada página.
 */

import { initMenu }     from './modules/menu.js';
import { initTabs }     from './modules/tabs.js';
import { initCarousel } from './modules/carousel.js';
import { initForm }     from './modules/form.js';

document.addEventListener('DOMContentLoaded', () => {
  // ── Siempre activos (todas las páginas) ──
  initMenu();
  initReveal();
  initSmoothScroll();

  // ── Solo en index.html ──
  if (document.getElementById('carouselTrack')) initCarousel();
  if (document.getElementById('leadForm'))      initForm();

  // ── Solo en empresa.html ──
  if (document.getElementById('tabMisionBtn'))  initTabs();
});

// ── Scroll suave con offset navbar ───────────────────────────────
// Solo intercepta anchors internos (#...).
// Los links cross-página (index.html#contacto) navegan normalmente.
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
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });

      // Preselección del select SOLO cuando destino es #contacto (index.html)
      const serviceValue = anchor.dataset.service;
      if (serviceValue && href === '#contacto') {
        setTimeout(() => {
          const select = document.getElementById('servicioTipo');
          if (select) {
            select.value = serviceValue;
            select.classList.add('ring-2', 'ring-green-500');
            setTimeout(() => select.classList.remove('ring-2', 'ring-green-500'), 1200);
          }
        }, 600);
      }
    });
  });
}

// ── Reveal on scroll (IntersectionObserver) ──────────────────────
function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const section  = entry.target.closest('section') ?? document.body;
        const siblings = Array.from(section.querySelectorAll('.reveal'));
        const idx      = siblings.indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('visible'), idx * 100);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}