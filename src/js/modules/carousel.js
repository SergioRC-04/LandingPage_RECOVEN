/**
 * carousel.js — Carrusel infinito de logos de clientes
 * RECOVEN ECA SAS ESP · v2
 *
 * Estrategia: se construye el track con JS, se duplica el contenido
 * y se anima con requestAnimationFrame para un loop perfecto y suave.
 * Se pausa en hover (desktop) y en touch (móvil).
 */

const CLIENTS = [
  { icon: "fas fa-ship", label: "Sociedad Portuaria Riverport" },
  { icon: "fas fa-industry", label: "Italcol" },
  { icon: "fas fa-heart", label: "Fundación Éxito" },
  { icon: "fas fa-hospital", label: "Clínica General del Norte" },
  { icon: "fas fa-bolt", label: "Air-E" },
  { icon: "fas fa-balance-scale", label: "Consejo Sup. Judicatura" },
  { icon: "fas fa-shield-alt", label: "Esc. Antonio Nariño — Policía Nal." },
  { icon: "fas fa-briefcase", label: "INSERMAS S.A.S" },
  { icon: "fas fa-hard-hat", label: "FSCR Ingeniería SAS" },
  { icon: "fas fa-globe", label: "Comercio Exterior Nuvias Miles" },
  { icon: "fas fa-building", label: "Edificio Toledo" },
  { icon: "fas fa-city", label: "Edificio Miramar" },
  { icon: "fas fa-flask", label: "Cosmético Pineda" },
  { icon: "fas fa-utensils", label: "Prodisabor" },
  { icon: "fas fa-user-shield", label: "Holding de Seguridad" },
];

export function initCarousel() {
  const track = document.getElementById("carouselTrack");
  if (!track) return;

  // Construir slides × 2 para loop infinito
  const allClients = [...CLIENTS, ...CLIENTS];
  track.innerHTML = allClients
    .map(
      (c) => `
    <div class="carousel-slide flex-shrink-0 w-40 md:w-44 flex flex-col items-center justify-center bg-white py-4 px-2 rounded-lg shadow-sm border border-gray-200">
      <i class="${c.icon} text-[2.5rem] text-primary-green mb-2"></i>
      <span class="font-semibold text-xs text-center text-gray-900">${c.label}</span>
    </div>
  `
    )
    .join("");

  // Calcular ancho de un set (la mitad del track total)
  // Se hace después del primer paint
  requestAnimationFrame(() => {
    const totalWidth = track.scrollWidth;
    const halfWidth = totalWidth / 2; // ancho de un set original

    let currentX = 0;
    let paused = false;
    const SPEED = window.innerWidth < 768 ? 0.5 : 0.7; // px por frame

    function step() {
      if (!paused) {
        currentX += SPEED;
        // Reset cuando llega al segundo set (loop)
        if (currentX >= halfWidth) {
          currentX = 0;
        }
        track.style.transform = `translateX(-${currentX}px)`;
      }
      requestAnimationFrame(step);
    }

    // Pausa en hover (desktop)
    track.addEventListener("mouseenter", () => {
      paused = true;
    });
    track.addEventListener("mouseleave", () => {
      paused = false;
    });

    // Pausa en touch (móvil)
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

    // Ajustar velocidad en resize
    window.addEventListener(
      "resize",
      () => {
        // No hace falta recalcular halfWidth porque los slides son fijos
      },
      { passive: true }
    );

    requestAnimationFrame(step);
  });
}
