/**
 * carousel.js — Carrusel infinito y continuo con soporte de arrastre por mouse y touch
 * RECOVEN ECA SAS ESP · v3 (Pure Drag Edition)
 *
 * Características:
 * - Loop infinito por duplicación de array
 * - Arrastre suave (mouse + touch) sin botones estorbosos
 * - Aceleración por GPU (will-change: transform)
 * - Manejo de eventos globales para evitar "stuck" en drag
 */

const CLIENTS = [
  { icon: "fas fa-briefcase", label: "INSERMAS S.A.S" },
  { icon: "fas fa-hard-hat", label: "FSCR INGENIERÍA SAS NIT: 900160091-0" },
  { icon: "fas fa-ship", label: "SOCIEDAD PORTUARIA RIVERPOR NIT:830147612" },
  { icon: "fas fa-industry", label: "ITALCOL" },
  { icon: "fas fa-shield-alt", label: "ESCUELA ANTONIO NARIÑO POLICÍA NACIONAL" },
  { icon: "fas fa-globe", label: "COMERCIO EXTERIOR NUVIAS MILES" },
  { icon: "fas fa-bolt", label: "AIR-E" },
  { icon: "fas fa-building", label: "EDIFICIO TOLEDO" },
  { icon: "fas fa-city", label: "EDIFICIO MIRAMAR" },
  { icon: "fas fa-flask", label: "COSMETICO PINEDA" },
  { icon: "fas fa-utensils", label: "PRODISABOR" },
  { icon: "fas fa-user-shield", label: "HOLDING DE SEGURIDAD" },
  { icon: "fas fa-balance-scale", label: "CONSEJO SUPERIOR DE LA JUDICATURA" },
  { icon: "fas fa-home", label: "VILLAS DE SAN MARINO" },
  { icon: "fas fa-water", label: "VISTA DEL MAR" },
  { icon: "fas fa-building", label: "CONINSA" },
  { icon: "fas fa-warehouse", label: "MADRIGAL IV" },
];

export function initCarousel() {
  const track = document.getElementById("carouselTrack");
  if (!track) return;

  // Construir slides × 2 para loop infinito
  const allClients = [...CLIENTS, ...CLIENTS];
  track.innerHTML = allClients
    .map(
      (c) => `
    <div class="carousel-slide flex shrink-0 w-40 md:w-44 flex-col items-center justify-center bg-white py-4 px-2 rounded-lg shadow-sm border border-gray-200">
      <i class="${c.icon} text-[2.5rem] text-primary-green mb-2"></i>
      <span class="font-semibold text-xs text-center text-gray-900">${c.label}</span>
    </div>
  `
    )
    .join("");

  // Agregar clases de UX para drag
  track.classList.add("select-none", "cursor-grab");

  // Calcular ancho de un set (la mitad del track total)
  requestAnimationFrame(() => {
    const totalWidth = track.scrollWidth;
    const halfWidth = totalWidth / 2; // ancho de un set original

    let currentX = 0;
    let paused = false;
    const SPEED = window.innerWidth < 768 ? 0.5 : 0.7; // px por frame

    // ===== VARIABLES DE DRAG =====
    let isDragging = false;
    let dragStartX = 0;
    let dragCurrentX = 0;
    let positionBeforeDrag = 0;

    // ===== EVENTOS DE DRAG EN EL TRACK =====
    track.addEventListener("mousedown", (e) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragCurrentX = e.clientX;
      positionBeforeDrag = currentX;
      track.classList.remove("cursor-grab");
      track.classList.add("cursor-grabbing");
      paused = true;
    });

    track.addEventListener(
      "touchstart",
      (e) => {
        isDragging = true;
        dragStartX = e.touches[0].clientX;
        dragCurrentX = e.touches[0].clientX;
        positionBeforeDrag = currentX;
        paused = true;
      },
      { passive: true }
    );

    // ===== EVENTOS GLOBALES DE DRAG (window) =====
    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      dragCurrentX = e.clientX;
      const dragDelta = dragCurrentX - dragStartX;
      // Arrastrar a la derecha (dragDelta > 0) = retroceder en carrusel
      currentX = (positionBeforeDrag - dragDelta + halfWidth * 100) % halfWidth;
      track.style.transform = `translateX(-${currentX}px)`;
    });

    window.addEventListener(
      "touchmove",
      (e) => {
        if (!isDragging) return;
        dragCurrentX = e.touches[0].clientX;
        const dragDelta = dragCurrentX - dragStartX;
        currentX = (positionBeforeDrag - dragDelta + halfWidth * 100) % halfWidth;
        track.style.transform = `translateX(-${currentX}px)`;
      },
      { passive: true }
    );

    window.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        dragStartX = 0;
        dragCurrentX = 0;
        paused = false;
        track.classList.remove("cursor-grabbing");
        track.classList.add("cursor-grab");
      }
    });

    window.addEventListener(
      "touchend",
      () => {
        if (isDragging) {
          isDragging = false;
          dragStartX = 0;
          dragCurrentX = 0;
          paused = false;
        }
      },
      { passive: true }
    );

    // ===== ANIMATION LOOP =====
    function step() {
      if (!paused && !isDragging) {
        currentX += SPEED;
        // Reset automático cuando llega al segundo set
        if (currentX >= halfWidth) {
          currentX = 0;
        }
        track.style.transform = `translateX(-${currentX}px)`;
      }
      requestAnimationFrame(step);
    }

    // ===== PAUSA EN HOVER (Desktop) =====
    track.addEventListener("mouseenter", () => {
      if (!isDragging) paused = true;
    });
    track.addEventListener("mouseleave", () => {
      if (!isDragging) paused = false;
    });

    // ===== PAUSA EN TOUCH (Móvil) =====
    track.addEventListener(
      "touchstart",
      () => {
        paused = true;
      },
      { passive: true }
    );
    track.addEventListener(
      "touchend",
      () => {
        paused = false;
      },
      { passive: true }
    );

    // Ajustar velocidad en resize si fuera necesario
    window.addEventListener("resize", () => {}, { passive: true });

    requestAnimationFrame(step);
  });
}
