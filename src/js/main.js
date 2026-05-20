/**
 * main.js — Orquestador principal
 * RECOVEN ECA SAS ESP · v2
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

// ── 1. SCROLL SUAVE CON OFFSET Y PRESELECCIÓN CONDICIONAL ────────
//
// Regla:
//  • Botones del hero → apuntan a #tipos-servicio → scroll suave, sin preselección
//  • Botones de tarjetas y nav → apuntan a #contacto con data-service → scroll + preselección
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const navbar    = document.getElementById('navbar');
      const navHeight = navbar ? navbar.offsetHeight : 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });

      // Preseleccionar el select SOLO cuando el destino es #contacto
      const serviceValue = anchor.dataset.service;
      const destino      = href;

      if (serviceValue && destino === '#contacto') {
        setTimeout(() => {
          const select = document.getElementById('servicioTipo');
          if (select) {
            select.value = serviceValue;
            // Flash verde para que el usuario note la selección
            select.classList.add('ring-2', 'ring-green-500');
            setTimeout(() => select.classList.remove('ring-2', 'ring-green-500'), 1200);
          }
        }, 600); // esperar a que el scroll termine
      }
    });
  });
}

// ── 2. REVEAL ON SCROLL ──────────────────────────────────────────
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

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, idx * 100);

        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}