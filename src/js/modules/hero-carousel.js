/**
 * hero-carousel.js — Carrusel Swiper para hero dividido
 * RECOVEN ECA SAS ESP · v3
 *
 * Pantalla dividida 40/60 con autoplay, navegación y paginación.
 * Solo se inicializa si existe .hero-carousel-swiper en el DOM.
 */

export function initHeroCarousel() {
  // Verificar si Swiper está disponible globalmente
  if (typeof Swiper === 'undefined') {
    console.warn('⚠️ Swiper no cargado. Verifica que la librería esté en el <head>');
    return;
  }

  // Verificar si existe el contenedor del carrusel
  const carouselContainer = document.querySelector('.hero-carousel-swiper');
  if (!carouselContainer) return;

  // Inicializar Swiper
  const heroCarousel = new Swiper('.hero-carousel-swiper', {
    
    // Configuración básica
    loop: true,                              // Carrusel infinito
    effect: 'fade',                          // Efecto fade suave
    speed: 800,                              // Velocidad transición (ms)
    allowTouchMove: true,                    // Permitir toques/arrastres
    
    // Autoplay
    autoplay: {
      delay: 4000,                           // 4 segundos entre slides
      disableOnInteraction: false,           // No detener al interactuar
      pauseOnMouseEnter: true,               // Pausar al pasar mouse
    },
    
    // Navegación (flechas)
    navigation: {
      nextEl: '.carousel-nav-next',
      prevEl: '.carousel-nav-prev',
    },
    
    // Paginación (puntos) — DEJAR QUE SWIPER MANEJE AUTOMÁTICAMENTE
    pagination: {
      el: '.carousel-pagination',
      type: 'bullets',
      clickable: true,
      dynamicBullets: false,
    },
    
    // Interactividad táctil
    touchEventsTarget: 'container',
    simulateTouch: true,
    grabCursor: true,
    
    // Breakpoints responsivos
    breakpoints: {
      320: {
        effect: 'fade',
        speed: 600,
        autoplay: { delay: 3500 },
      },
      768: {
        effect: 'fade',
        speed: 700,
        autoplay: { delay: 3800 },
      },
      1024: {
        effect: 'fade',
        speed: 800,
        autoplay: { delay: 4000 },
      }
    },
    
    // Callbacks
    on: {
      init: () => {
        console.log('✓ Hero carousel inicializado');
      },
    }
  });
  
  // Pausa en hover (control adicional)
  carouselContainer.addEventListener('mouseenter', () => {
    heroCarousel.autoplay.stop();
  });
  
  carouselContainer.addEventListener('mouseleave', () => {
    heroCarousel.autoplay.start();
  });

  console.log('✓ Hero carousel: autoplay, navegación y paginación activos');
}