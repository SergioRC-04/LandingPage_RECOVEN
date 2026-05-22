/**
 * main.js — Orquestador multi-página
 * RECOVEN ECA SAS ESP · v2
 *
 * Detecta qué elementos existen en el DOM para inicializar
 * solo los módulos que aplican a cada página.
 */

import { initTabs } from "./modules/tabs.js";
import { initCarousel } from "./modules/carousel.js";
import { initForm } from "./modules/form.js";
import { initHeroCarousel } from "./modules/hero-carousel.js";
import { initReveal, initSmoothScroll } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  // ── Siempre activos (todas las páginas) ──
  initReveal();
  initSmoothScroll();

  // ── Solo en index.html ──
  if (document.getElementById("carouselTrack")) initCarousel();
  if (document.getElementById("leadForm")) initForm();

  // ── Solo en empresa.html ──
  if (document.getElementById("tabMisionBtn")) initTabs();

  // ── Solo en servicios.html ──
  if (document.querySelector(".hero-carousel-swiper")) initHeroCarousel();
});
