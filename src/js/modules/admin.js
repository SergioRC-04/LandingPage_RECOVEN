import { recovenApi } from "../../api/recovenApi.js";

// Variables de Estado Local
let TEMP_USERNAME = "";

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (token) {
    cambiarPantalla("view-dashboard");
    cargarLeads();
    cargarMetricas(); // Carga las métricas al iniciar dashboard
  }

  configurarListenersFormularios();
  configurarNavegacionSidebar();
});

// Manejo de pantallas
function cambiarPantalla(idPantallaActiva) {
  const pantallas = ["view-login", "view-2fa", "view-dashboard"];
  pantallas.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      if (id === idPantallaActiva) el.classList.remove("hidden");
      else el.classList.add("hidden");
    }
  });
}

// Configuración de eventos
function configurarListenersFormularios() {
  // 1. Login
  const loginForm = document.getElementById("loginForm");
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      await recovenApi.post("/auth/login", { username, password }, false);
      TEMP_USERNAME = username;
      cambiarPantalla("view-2fa");
    } catch {
      window.alert("Credenciales incorrectas. Verifique e intente nuevamente.");
    }
  });

  // Mostrar/ocultar contraseña
  const togglePasswordBtn = document.getElementById("togglePasswordBtn");
  const passwordInput = document.getElementById("loginPassword");
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener("click", function () {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      const icon = this.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-eye");
        icon.classList.toggle("fa-eye-slash");
      }
    });
  }

  // 2. Verificación 2FA
  const faForm = document.getElementById("faForm");
  faForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const code = document.getElementById("faCode").value;

    try {
      const response = await recovenApi.post(
        "/auth/verify-2fa",
        { username: TEMP_USERNAME, code },
        false
      );
      const token = response.access_token;
      if (!token) throw new Error("No se recibió token");
      localStorage.setItem("token", token);
      cambiarPantalla("view-dashboard");
      cargarLeads();
      cargarMetricas(); // Cargar métricas después del login
    } catch (error) {
      console.error(error);
      window.alert("Código de verificación incorrecto o expirado.");
    }
  });

  // Botón Cerrar Sesión
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.reload();
  });

  // Botón refrescar métricas
  const refreshBtn = document.getElementById("refreshMetricsBtn");
  refreshBtn?.addEventListener("click", () => {
    cargarMetricas();
  });

  // Selector de año
  const yearSelector = document.getElementById("yearSelector");
  yearSelector?.addEventListener("change", () => {
    cargarMetricas();
  });
}

// ======================== LEADS ========================
async function cargarLeads() {
  const tableBody = document.getElementById("leadsTableBody");
  if (!tableBody) return;

  try {
    const leads = await recovenApi.get("/leads", true);
    tableBody.innerHTML = leads
      .map(
        (lead) => `
      <tr class="hover:bg-gray-50 transition duration-150">
        <td class="p-4">
          <div class="font-bold text-gray-900">${escapeHtml(lead.nombre)}</div>
          <div class="text-xs text-gray-400">${escapeHtml(lead.empresa || "Particular")}</div>
        </td>
        <td class="p-4">
          <div class="text-gray-700 font-medium">${escapeHtml(lead.telefono)}</div>
          <div class="text-xs text-gray-500">${escapeHtml(lead.email)}</div>
        </td>
        <td class="p-4">
          <span class="inline-flex px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">${escapeHtml(lead.servicio)}</span>
        </td>
        <td class="p-4 text-xs text-gray-500 max-w-xs truncate" title="${escapeHtml(lead.mensaje || "")}">
          ${lead.mensaje ? escapeHtml(lead.mensaje) : '<span class="text-gray-300">Sin detalles</span>'}
        </td>
      </tr>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error cargando leads:", error);
    tableBody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-red-500">Error al cargar las solicitudes de red.</td></tr>`;
  }
}

// Exportar Excel
document.getElementById("exportExcelBtn")?.addEventListener("click", async () => {
  try {
    const blob = await recovenApi.getBlob("/leads/export_excel", true);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Leads_RECOVEN_${new Date().toISOString().split("T")[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    window.alert("No se pudo exportar el archivo Excel en este momento.");
  }
});

// ======================== MÉTRICAS ========================
let metricasCache = []; // Guardar todas las métricas para filtrar por año

async function cargarMetricas() {
  try {
    const year = document.getElementById("yearSelector").value;
    const response = await recovenApi.get("/metrics", true); // GET /metrics
    metricasCache = response; // asumimos que es un array de objetos con { year, mes, sede, aprovechamiento, rechazo }

    // Obtener años únicos disponibles y llenar selector
    const years = [...new Set(metricasCache.map((m) => m.year))].sort((a, b) => b - a);
    const yearSelector = document.getElementById("yearSelector");
    const currentSelected = yearSelector.value;
    yearSelector.innerHTML = years
      .map((y) => `<option value="${y}" ${y == currentSelected ? "selected" : ""}>${y}</option>`)
      .join("");
    if (years.length === 0) {
      yearSelector.innerHTML = '<option value="">No hay datos</option>';
    }

    // Filtrar por año seleccionado
    const filtered = metricasCache.filter((m) => m.year == year);
    // Separar por sede
    const barranquilla = filtered
      .filter((m) => m.sede === "BARRANQUILLA")
      .sort((a, b) => ordenMeses(a.mes, b.mes));
    const puerto = filtered
      .filter((m) => m.sede === "PUERTO COLOMBIA")
      .sort((a, b) => ordenMeses(a.mes, b.mes));

    renderTabla("metricsBarranquillaBody", barranquilla, "BARRANQUILLA");
    renderTabla("metricsPuertoBody", puerto, "PUERTO COLOMBIA");
  } catch (error) {
    console.error("Error cargando métricas:", error);
  }
}

// Orden personalizado de meses
function ordenMeses(mesA, mesB) {
  const orden = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return orden.indexOf(mesA) - orden.indexOf(mesB);
}

// Renderizar una tabla y su footer con formulario de nuevo mes
function renderTabla(tbodyId, data, sedeNombre) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-gray-400 py-6">No hay datos para este año</td></tr>`;
  } else {
    tbody.innerHTML = data
      .map(
        (item) => `
      <tr class="hover:bg-gray-50">
        <td class="px-4 py-3 font-medium text-gray-800">${item.mes}</td>
        <td class="px-4 py-3 text-right">${formatearNumero(item.aprovechamiento)}</td>
        <td class="px-4 py-3 text-right">${formatearNumero(item.rechazo)}</td>
        <td class="px-4 py-3 text-center">
          <!-- Aquí podrías añadir botones de edición/eliminación si se desea -->
          <span class="text-gray-300 text-xs">-</span>
        </td>
      </tr>
    `
      )
      .join("");
  }

  // Determinar el siguiente mes
  const ultimoMes = data.length > 0 ? data[data.length - 1].mes : null;
  const siguienteMes = obtenerSiguienteMes(ultimoMes);

  // Crear fila de ingreso en el footer
  const footer = document.getElementById(tbodyId.replace("Body", "Footer"));
  if (footer) {
    footer.innerHTML = `
      <tr class="bg-gray-50">
        <td class="px-4 py-3 font-medium text-gray-700">
          ${siguienteMes ? siguienteMes : "Completado"}
          <input type="hidden" id="siguienteMes_${sedeNombre}" value="${siguienteMes || ""}">
        </td>
        <td class="px-4 py-2">
          <input type="number" step="0.01" id="aprovechamiento_${sedeNombre}" placeholder="Toneladas" class="w-full rounded-lg border border-gray-300 px-2 py-1 text-right text-sm focus:ring-emerald-500" ${!siguienteMes ? "disabled" : ""}>
        </td>
        <td class="px-4 py-2">
          <input type="number" step="0.01" id="rechazo_${sedeNombre}" placeholder="Rechazo" class="w-full rounded-lg border border-gray-300 px-2 py-1 text-right text-sm focus:ring-emerald-500" ${!siguienteMes ? "disabled" : ""}>
        </td>
        <td class="px-4 py-2 text-center">
          <button class="agregarMetricaBtn text-emerald-600 hover:text-emerald-800 transition ${!siguienteMes ? "opacity-50 cursor-not-allowed" : ""}" data-sede="${sedeNombre}" ${!siguienteMes ? "disabled" : ""}>
            <i class="fas fa-plus-circle text-xl"></i>
          </button>
        </td>
      </tr>
    `;

    // Vincular eventos de los botones de agregar
    const btn = footer.querySelector(".agregarMetricaBtn");
    if (btn && !btn.disabled) {
      btn.addEventListener("click", () => agregarMetrica(sedeNombre));
    }
  }
}

function obtenerSiguienteMes(ultimoMes) {
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  if (!ultimoMes) return "Enero";
  const idx = meses.indexOf(ultimoMes);
  if (idx === -1 || idx === 11) return null;
  return meses[idx + 1];
}

function formatearNumero(valor) {
  return valor.toLocaleString("es-ES", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

async function agregarMetrica(sedeNombre) {
  const year = document.getElementById("yearSelector").value;
  if (!year) {
    window.alert("Seleccione un año primero.");
    return;
  }

  // Validar que la sede sea válida
  if (sedeNombre !== "BARRANQUILLA" && sedeNombre !== "PUERTO COLOMBIA") {
    window.alert("Sede no válida.");
    return;
  }

  const siguienteMesInput = document.getElementById(`siguienteMes_${sedeNombre}`);
  const mes = siguienteMesInput ? siguienteMesInput.value : "";
  if (!mes) {
    window.alert("No se puede agregar más meses (ya está diciembre o no hay datos previos).");
    return;
  }

  const aprovechamientoInput = document.getElementById(`aprovechamiento_${sedeNombre}`);
  const rechazoInput = document.getElementById(`rechazo_${sedeNombre}`);
  const aprovechamiento = parseFloat(aprovechamientoInput.value);
  const rechazo = parseFloat(rechazoInput.value);

  if (isNaN(aprovechamiento) || isNaN(rechazo)) {
    window.alert("Complete ambos valores numéricos.");
    return;
  }

  const payload = {
    year: parseInt(year),
    mes: mes,
    sede: sedeNombre, // ← Usamos directamente el parámetro
    aprovechamiento: aprovechamiento,
    rechazo: rechazo,
  };

  try {
    await recovenApi.put("/metrics", payload, true);
    window.alert(`Datos de ${mes} agregados correctamente.`);
    cargarMetricas(); // Recargar tablas
  } catch (error) {
    console.error(error);
    window.alert("Error al guardar los datos. Verifique que el mes no exista ya.");
  }
}

// IMPORTANTE: Agregar método put a recovenApi.js (si no existe)
// Añadir en recovenApi.js:
/*
  async put(endpoint, data, requiresAuth = true) {
    const headers = { "Content-Type": "application/json" };
    if (requiresAuth) {
      const token = localStorage.getItem("token");
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP Error ${response.status}`);
    }
    return await response.json();
  }
*/

// Control de navegación lateral
function configurarNavegacionSidebar() {
  const menuButtons = document.querySelectorAll("#dashboard-menu button");
  menuButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTabId = btn.dataset.tab;
      menuButtons.forEach((b) => {
        b.classList.remove("bg-emerald-600", "text-white");
        b.classList.add("text-gray-400", "hover:bg-gray-800", "hover:text-white");
      });
      btn.classList.add("bg-emerald-600", "text-white");
      btn.classList.remove("text-gray-400", "hover:bg-gray-800");
      const tabs = ["tab-leads", "tab-metrics", "tab-documents"];
      tabs.forEach((id) => {
        const tabEl = document.getElementById(id);
        if (id === targetTabId) tabEl.classList.remove("hidden");
        else tabEl.classList.add("hidden");
      });
      // Si se cambia a la pestaña de métricas, recargar datos
      if (targetTabId === "tab-metrics") {
        cargarMetricas();
      }
    });
  });
}

// Función auxiliar escapeHtml
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
