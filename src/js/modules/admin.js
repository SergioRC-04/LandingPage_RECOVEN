import { recovenApi } from "../../api/recovenApi.js";

window.addEventListener("session-expired", (event) => {
  const mensaje =
    event.detail?.message || "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
  window.alert(mensaje);
  cambiarPantalla("view-login");
  // Limpia campos del login por si acaso
  const emailInput = document.getElementById("loginEmail");
  const passInput = document.getElementById("loginPassword");
  if (emailInput) emailInput.value = "";
  if (passInput) passInput.value = "";
});

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
  // Restaurar botón de login si se vuelve a la pantalla de login
  if (idPantallaActiva === "view-login") {
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
      loginBtn.disabled = false;
      loginBtn.innerHTML = 'Iniciar Sesión <i class="fas fa-arrow-right"></i>';
    }
    // Limpiar campos por si acaso
    const emailInput = document.getElementById("loginEmail");
    const passInput = document.getElementById("loginPassword");
    if (emailInput) emailInput.value = "";
    if (passInput) passInput.value = "";
  }
}

// Configuración de eventos
function configurarListenersFormularios() {
  // 1. Login
  const loginForm = document.getElementById("loginForm");
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const loginBtn = document.getElementById("loginBtn");
    const originalText = loginBtn.innerHTML;

    // Mostrar estado de carga
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando código...';

    const username = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      await recovenApi.post("/auth/login", { username, password }, false);
      TEMP_USERNAME = username;

      // Pequeño mensaje opcional (puedes usar un toast)
      window.alert("Código enviado a tu correo. Revisa tu bandeja (puede tardar unos segundos).");

      cambiarPantalla("view-2fa");
    } catch {
      window.alert("Credenciales incorrectas. Verifique e intente nuevamente.");
    } finally {
      // Restaurar botón (solo si hubo error, porque si cambia de pantalla el botón ya no es visible)
      if (document.getElementById("view-login")?.classList.contains("hidden") === false) {
        loginBtn.disabled = false;
        loginBtn.innerHTML = originalText;
      }
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
    const faBtn = document.getElementById("faBtn");
    const originalText = faBtn.innerHTML;

    faBtn.disabled = true;
    faBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';

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
      cargarMetricas();
    } catch (error) {
      console.error(error);
      window.alert("Código de verificación incorrecto o expirado.");
    } finally {
      // Restaurar botón si seguimos en la misma pantalla (solo si hubo error)
      if (document.getElementById("view-2fa")?.classList.contains("hidden") === false) {
        faBtn.disabled = false;
        faBtn.innerHTML = originalText;
      }
    }
  });

  // 3. Reenviar código 2FA
  const resendBtn = document.getElementById("resendCodeBtn");
  resendBtn?.addEventListener("click", async () => {
    if (!TEMP_USERNAME) {
      window.alert("No hay usuario para reenviar código. Por favor, inicie sesión nuevamente.");
      cambiarPantalla("view-login");
      return;
    }

    // Deshabilitar botón temporalmente para evitar spam
    resendBtn.disabled = true;
    const originalText = resendBtn.innerHTML;
    resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    try {
      // Asumiendo que existe el endpoint /auth/resend-2fa
      await recovenApi.post("/auth/resend-2fa", { username: TEMP_USERNAME }, false);
      window.alert("Se ha enviado un nuevo código a su correo electrónico.");
    } catch (error) {
      console.error(error);
      window.alert("No se pudo reenviar el código. Intente nuevamente más tarde.");
    } finally {
      resendBtn.disabled = false;
      resendBtn.innerHTML = originalText;
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
    if (error.message === "SESION_EXPIRADA") return; // ya se manejó globalmente
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
    if (error.message === "SESION_EXPIRADA") return;
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
    if (error.message === "SESION_EXPIRADA") return;
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
        (item, index) => `
      <tr class="hover:bg-gray-50" data-mes="${item.mes}" data-year="${item.year}" data-sede="${item.sede}" data-idx="${index}">
        <td class="px-4 py-3 font-medium text-gray-800">${item.mes}</td>
        <td class="px-4 py-3 text-right aprovechamiento-cell">${formatearNumero(item.aprovechamiento)}</td>
        <td class="px-4 py-3 text-right rechazo-cell">${formatearNumero(item.rechazo)}</td>
        <td class="px-4 py-3 text-center actions-cell">
          <button class="editRowBtn text-blue-600 hover:text-blue-800 transition mr-2" data-mes="${item.mes}">
            <i class="fas fa-edit"></i>
          </button>
          <span class="text-gray-300 text-xs">|</span>
          <button class="deleteRowBtn text-red-600 hover:text-red-800 transition ml-2" data-mes="${item.mes}">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>
    `
      )
      .join("");
  }

  // Agregar eventos a los botones de editar y eliminar
  document.querySelectorAll(`#${tbodyId} .editRowBtn`).forEach((btn) => {
    btn.removeEventListener("click", handleEditClick);
    btn.addEventListener("click", handleEditClick);
  });
  document.querySelectorAll(`#${tbodyId} .deleteRowBtn`).forEach((btn) => {
    btn.removeEventListener("click", handleDeleteClick);
    btn.addEventListener("click", handleDeleteClick);
  });

  // Determinar el siguiente mes para la fila de agregar
  const ultimoMes = data.length > 0 ? data[data.length - 1].mes : null;
  const siguienteMes = obtenerSiguienteMes(ultimoMes);

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
    const agregarBtn = footer.querySelector(".agregarMetricaBtn");
    if (agregarBtn && !agregarBtn.disabled) {
      agregarBtn.removeEventListener("click", () => agregarMetrica(sedeNombre));
      agregarBtn.addEventListener("click", () => agregarMetrica(sedeNombre));
    }
  }
}

// Manejador para editar fila
function handleEditClick(event) {
  const btn = event.currentTarget;
  const row = btn.closest("tr");
  if (row.classList.contains("editing")) return;

  const mes = row.querySelector("td:first-child").innerText;
  const year = row.dataset.year;
  const sede = row.dataset.sede;
  const aprovechamientoCelda = row.querySelector(".aprovechamiento-cell");
  const rechazoCelda = row.querySelector(".rechazo-cell");
  const actionsCelda = row.querySelector(".actions-cell");

  const valorAprovechamiento = parseFloat(
    aprovechamientoCelda.innerText.replace(/\./g, "").replace(",", ".")
  );
  const valorRechazo = parseFloat(rechazoCelda.innerText.replace(/\./g, "").replace(",", "."));

  // Reemplazar contenido con inputs
  aprovechamientoCelda.innerHTML = `<input type="number" step="0.01" value="${valorAprovechamiento}" class="edit-aprovechamiento w-24 rounded border border-gray-300 px-2 py-1 text-right">`;
  rechazoCelda.innerHTML = `<input type="number" step="0.01" value="${valorRechazo}" class="edit-rechazo w-24 rounded border border-gray-300 px-2 py-1 text-right">`;
  actionsCelda.innerHTML = `
    <button class="saveEditBtn text-green-600 hover:text-green-800 transition mr-2"><i class="fas fa-save"></i></button>
    <button class="cancelEditBtn text-gray-500 hover:text-gray-700 transition"><i class="fas fa-times"></i></button>
  `;

  row.classList.add("editing");

  const saveBtn = actionsCelda.querySelector(".saveEditBtn");
  const cancelBtn = actionsCelda.querySelector(".cancelEditBtn");
  saveBtn.addEventListener("click", () => guardarEdicion(row, mes, year, sede));
  cancelBtn.addEventListener("click", () =>
    cancelarEdicion(row, valorAprovechamiento, valorRechazo)
  );
}

function cancelarEdicion(row, oldAprovechamiento, oldRechazo) {
  const aprovechamientoCelda = row.querySelector(".aprovechamiento-cell");
  const rechazoCelda = row.querySelector(".rechazo-cell");
  const actionsCelda = row.querySelector(".actions-cell");

  aprovechamientoCelda.innerHTML = formatearNumero(oldAprovechamiento);
  rechazoCelda.innerHTML = formatearNumero(oldRechazo);
  actionsCelda.innerHTML = `
    <button class="editRowBtn text-blue-600 hover:text-blue-800 transition mr-2"><i class="fas fa-edit"></i></button>
    <span class="text-gray-300 text-xs">|</span>
    <button class="deleteRowBtn text-red-600 hover:text-red-800 transition ml-2"><i class="fas fa-trash-alt"></i></button>
  `;

  row.classList.remove("editing");

  // Reasignar eventos
  const newEditBtn = actionsCelda.querySelector(".editRowBtn");
  const newDeleteBtn = actionsCelda.querySelector(".deleteRowBtn");
  newEditBtn.addEventListener("click", handleEditClick);
  newDeleteBtn.addEventListener("click", handleDeleteClick);
}

async function guardarEdicion(row, mes, year, sede) {
  const aprovechamientoInput = row.querySelector(".edit-aprovechamiento");
  const rechazoInput = row.querySelector(".edit-rechazo");
  const nuevoAprovechamiento = parseFloat(aprovechamientoInput.value);
  const nuevoRechazo = parseFloat(rechazoInput.value);

  if (isNaN(nuevoAprovechamiento) || isNaN(nuevoRechazo)) {
    window.alert("Ingrese valores numéricos válidos.");
    return;
  }

  const payload = {
    year: parseInt(year),
    mes: mes,
    sede: sede,
    aprovechamiento: nuevoAprovechamiento,
    rechazo: nuevoRechazo,
  };

  try {
    await recovenApi.put("/metrics", payload, true);
    window.alert(`Datos de ${mes} actualizados correctamente.`);
    cargarMetricas(); // Recargar toda la tabla (refresca)
  } catch (error) {
    if (error.message === "SESION_EXPIRADA") return;
    console.error(error);
    window.alert("Error al actualizar los datos.");
  }
}

async function handleDeleteClick(event) {
  const btn = event.currentTarget;
  const row = btn.closest("tr");
  const mes = row.querySelector("td:first-child").innerText;
  const year = parseInt(row.dataset.year);
  const sede = row.dataset.sede;

  if (
    !window.confirm(
      `¿Eliminar los datos de ${mes} (${sede === "BARRANQUILLA" ? "Barranquilla" : "Puerto Colombia"})?`
    )
  ) {
    return;
  }

  try {
    await recovenApi.delete("/metrics", { sede, mes, year }, true);
    window.alert(`Datos de ${mes} eliminados correctamente.`);
    cargarMetricas(); // refresca las tablas
  } catch (error) {
    if (error.message === "SESION_EXPIRADA") return;
    console.error(error);
    window.alert("Error al eliminar los datos. Puede que el registro no exista.");
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
  return valor.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
    if (error.message === "SESION_EXPIRADA") return;
    console.error(error);
    window.alert("Error al guardar los datos. Verifique que el mes no exista ya.");
  }
}

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
