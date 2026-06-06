/**
 * form.js — Validación, envío async y preselección de servicio
 * RECOVEN ECA SAS ESP · v2
 */
import { recovenApi } from "../../api/recovenApi.js";
// ── Reglas de validación ─────────────────────────────────────────
const RULES = {
  nombre: { test: (v) => v.trim().length >= 2, errorId: "errorNombre" },
  email: { test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), errorId: "errorEmail" },
  telefono: { test: (v) => /^[\d\s\-+]{7,}$/.test(v.trim()), errorId: "errorTelefono" },
  servicioTipo: { test: (v) => v !== "", errorId: "errorServicio" },
};

// ── Helpers ──────────────────────────────────────────────────────
const getField = (id) => document.getElementById(id);
const getError = (id) => document.getElementById(id);

function setFieldState(fieldId, isValid) {
  const field = getField(fieldId);
  const rule = RULES[fieldId];
  if (!field || !rule) return;
  const errEl = getError(rule.errorId);
  if (isValid) {
    field.classList.remove("border-red-400");
    field.classList.add("border-gray-300");
    errEl?.classList.add("hidden");
  } else {
    field.classList.remove("border-gray-300");
    field.classList.add("border-red-400");
    errEl?.classList.remove("hidden");
  }
}

function validateField(fieldId) {
  const field = getField(fieldId);
  if (!field) return true;
  const valid = RULES[fieldId].test(field.value);
  setFieldState(fieldId, valid);
  return valid;
}

// ── Preselección del tipo de servicio ────────────────────────────
/**
 * Busca todos los enlaces que tengan data-service y que apunten a #contacto.
 * Al hacer clic, guarda el valor en sessionStorage para que main.js lo
 * aplique después del scroll (el select puede no estar visible aún).
 */
function initServicePreselect() {
  const select = getField("servicioTipo");
  if (!select) return;

  document.querySelectorAll("[data-service]").forEach((link) => {
    link.addEventListener("click", () => {
      const serviceValue = link.dataset.service;
      // Aplicar directamente si el select ya existe
      select.value = serviceValue;
      // También guardar por si el scroll tarda
      sessionStorage.setItem("recoven_preselect", serviceValue);
    });
  });

  // Aplicar valor guardado si venimos de un reload o navegación
  const stored = sessionStorage.getItem("recoven_preselect");
  if (stored) {
    select.value = stored;
    sessionStorage.removeItem("recoven_preselect");
  }
}

// ── Preselección de la especialidad del servicio ──────────────────
/**
 * Lee el parámetro de URL "service" y pre-rellena el campo
 * "especialidadServicio" con ese valor. Esto lo usan los botones
 * en los slides del carrusel de servicios.html
 */
function initSpecialtyPreselect() {
  const select = getField("especialidadServicio");
  if (!select) return;

  const params = new URLSearchParams(window.location.search);
  const serviceValue = params.get("service");

  if (serviceValue) {
    select.value = serviceValue;
    // Limpiar URL para que no se muestre el parámetro
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname + window.location.hash
    );
  }
}

// ── Init principal ────────────────────────────────────────────────
export function initForm() {
  const form = document.getElementById("leadForm");
  const successBox = document.getElementById("form-success");
  const errorBox = document.getElementById("form-error-msg");
  const submitBtn = document.getElementById("submitBtn");

  if (!form) return;

  initServicePreselect();
  initSpecialtyPreselect();

  // Validación al salir de cada campo (Se queda igual)
  Object.keys(RULES).forEach((id) => {
    const field = getField(id);
    if (!field) return;
    field.addEventListener("blur", () => validateField(id));
    field.addEventListener("input", () => {
      if (field.classList.contains("border-red-400")) validateField(id);
    });
  });

  // ── Submit Modificado para NestJS ──────────────────────────────────
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validar todas las reglas antes de enviar
    const results = Object.keys(RULES).map((id) => validateField(id));
    if (results.includes(false)) {
      form
        .querySelector(".border-red-400")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Estado de carga visual en tu botón
    submitBtn.disabled = true;
    // Como tu botón no tiene un ID interno para el texto (btnLabel),
    // modificamos el textContent guardando el icono de FontAwesome
    const originalBtnHtml = submitBtn.innerHTML;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Enviando...`;
    submitBtn.classList.add("opacity-70", "cursor-not-allowed");

    if (successBox) successBox.classList.remove("show");
    if (errorBox) errorBox.classList.remove("show");

    // 📦 Mapear los datos del formulario a un Objeto JSON puro para el DTO
    const formData = new FormData(form);
    const leadData = {
      nombre: formData.get("nombre"),
      telefono: formData.get("telefono"),
      email: formData.get("email"),
      empresa: formData.get("empresa") || undefined, // Si está vacío, NestJS lo toma como opcional
      direccion: formData.get("direccion") || undefined, // Si está vacío, NestJS lo toma como opcional
      servicio: formData.get("servicio"),
      especialidad: formData.get("especialidad") || undefined, // Si está vacío, NestJS lo toma como opcional
      mensaje: formData.get("mensaje") || undefined, // Si está vacío, NestJS lo toma como opcional
    };

    try {
      // 🚀 Consumo directo a tu endpoint RESTful
      // NestJS recibirá esto, lo validará, lo guardará en SQLite y enviará el mail corporativo
      await recovenApi.post("/leads/send-lead", leadData);

      // Si todo sale bien (Status 201 Created / 200 OK)
      form.reset();
      Object.keys(RULES).forEach((id) => {
        getField(id)?.classList.remove("border-red-400");
        getField(id)?.classList.add("border-gray-300");
      });

      if (successBox) {
        successBox.classList.add("show");
        successBox.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        window.alert("¡Solicitud enviada con éxito! Nos pondremos en contacto pronto.");
      }
    } catch (err) {
      console.error("[RECOVEN API Error]", err);
      if (errorBox) {
        errorBox.classList.add("show");
        errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        window.alert("Hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo.");
      }
    } finally {
      // Restaurar el botón a su estado original
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
      submitBtn.classList.remove("opacity-70", "cursor-not-allowed");
    }
  });
}
