/**
 * menu.js — Menú hamburguesa animado, navbar scroll y dropdown de administrador
 * RECOVEN ECA SAS ESP · v2
 */

export function initMenu() {
  // Elementos del Menú Hamburguesa Móvil
  const btn = document.getElementById("menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  // Elementos del Engranaje de Escritorio
  const settingsBtn = document.getElementById("settings-btn");
  const settingsMenu = document.getElementById("settings-menu");

  let isMobileMenuOpen = false;
  let isSettingsOpen = false;

  // ── 📱 SECCIÓN RESPONSIVE / MÓVIL ─────────────────────────────────
  if (btn && mobileMenu) {
    btn.addEventListener("click", () => {
      isMobileMenuOpen = !isMobileMenuOpen;

      // 🚀 SOLUCIÓN: Buscamos e inyectamos el botón justo al abrir el menú
      const mobileNav = document.getElementById("mobile-nav");
      if (mobileNav && !document.getElementById("mobile-admin-link")) {
        const adminLink = document.createElement("a");
        adminLink.id = "mobile-admin-link";
        adminLink.href = "admin.html";
        adminLink.className =
          "mobile-link flex items-center gap-2 px-4 py-3 font-bold rounded-xl text-gray-500 bg-gray-50 border border-gray-100 active:bg-emerald-50 active:text-emerald-700 transition";
        adminLink.innerHTML = `<i class="fas fa-user-shield text-emerald-600"></i> Administrador`;
        mobileNav.appendChild(adminLink);
      }

      btn.classList.toggle("open", isMobileMenuOpen);
      mobileMenu.classList.toggle("open", isMobileMenuOpen);
      btn.setAttribute("aria-expanded", String(isMobileMenuOpen));
    });

    // Delegación de eventos para cerrar el menú móvil al tocar cualquier link
    mobileMenu.addEventListener("click", (e) => {
      if (e.target.closest(".mobile-link")) {
        isMobileMenuOpen = false;
        btn.classList.remove("open");
        mobileMenu.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ── 💻 SECCIÓN ESCRITORIO (Dropdown Engranaje) ─────────────────────
  if (settingsBtn && settingsMenu) {
    settingsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      isSettingsOpen = !isSettingsOpen;
      settingsMenu.classList.toggle("hidden", !isSettingsOpen);
      settingsBtn.setAttribute("aria-expanded", String(isSettingsOpen));
    });
  }

  // ── 📑 MANEJO DE CLICS GLOBALES (Cerrar todo al hacer clic fuera) ──
  document.addEventListener("click", (e) => {
    if (isMobileMenuOpen && !btn.contains(e.target) && !mobileMenu.contains(e.target)) {
      isMobileMenuOpen = false;
      btn.classList.remove("open");
      mobileMenu.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }

    if (
      isSettingsOpen &&
      settingsBtn &&
      !settingsBtn.contains(e.target) &&
      !settingsMenu.contains(e.target)
    ) {
      isSettingsOpen = false;
      settingsMenu.classList.add("hidden");
      settingsBtn.setAttribute("aria-expanded", "false");
    }
  });
}
