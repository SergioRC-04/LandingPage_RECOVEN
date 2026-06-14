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
let metricasCache = []; // Guardar todas las métricas para filtrar por año

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

      // Pequeño mensaje opcional
      window.alert("Código enviado a tu correo. Revisa tu bandeja (puede tardar unos segundos).");

      cambiarPantalla("view-2fa");
    } catch {
      window.alert("Credenciales incorrectas. Verifique e intente nuevamente.");
    } finally {
      // Restaurar botón (solo si hubo error)
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
    if (error.message === "SESION_EXPIRADA") return;
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
async function cargarMetricas() {
  try {
    const yearSelector = document.getElementById("yearSelector");
    const currentSelected = yearSelector ? yearSelector.value : null;

    const years = [2027, 2026, 2025];
    const currentYear = new Date().getFullYear();
    let defaultYear = years.includes(currentYear) ? currentYear : years[0];

    let response = [];
    let metricasExisten = false;

    try {
      response = await recovenApi.get("/metrics", true);
      metricasCache = response;
      metricasExisten = response && response.length > 0;
    } catch (error) {
      if (error.message === "SESION_EXPIRADA") throw error;
      console.error("Error al obtener métricas, se usarán años fijos:", error);
      metricasCache = [];
      metricasExisten = false;
    }

    let selectedYear =
      currentSelected && years.includes(parseInt(currentSelected))
        ? parseInt(currentSelected)
        : defaultYear;

    if (yearSelector) {
      yearSelector.innerHTML = years
        .map((y) => `<option value="${y}" ${y === selectedYear ? "selected" : ""}>${y}</option>`)
        .join("");
    }

    const filtered = metricasExisten ? metricasCache.filter((m) => m.year === selectedYear) : [];

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
    console.error("Error en cargarMetricas:", error);
    const yearSelector = document.getElementById("yearSelector");
    if (yearSelector) {
      const defaultYears = [2027, 2026, 2025];
      const fallbackYear = defaultYears.includes(new Date().getFullYear())
        ? new Date().getFullYear()
        : defaultYears[0];
      yearSelector.innerHTML = defaultYears
        .map((y) => `<option value="${y}" ${y === fallbackYear ? "selected" : ""}>${y}</option>`)
        .join("");
    }
    renderTabla("metricsBarranquillaBody", [], "BARRANQUILLA");
    renderTabla("metricsPuertoBody", [], "PUERTO COLOMBIA");
  }
}

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

  document.querySelectorAll(`#${tbodyId} .editRowBtn`).forEach((btn) => {
    btn.removeEventListener("click", handleEditClick);
    btn.addEventListener("click", handleEditClick);
  });
  document.querySelectorAll(`#${tbodyId} .deleteRowBtn`).forEach((btn) => {
    btn.removeEventListener("click", handleDeleteClick);
    btn.addEventListener("click", handleDeleteClick);
  });

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
      agregarBtn.addEventListener("click", () => agregarMetrica(sedeNombre));
    }
  }
}

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
    mes,
    sede,
    aprovechamiento: nuevoAprovechamiento,
    rechazo: nuevoRechazo,
  };

  try {
    await recovenApi.put("/metrics", payload, true);
    window.alert(`Datos de ${mes} actualizados correctamente.`);
    cargarMetricas();
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
  )
    return;

  try {
    await recovenApi.delete("/metrics", { sede, mes, year }, true);
    window.alert(`Datos de ${mes} eliminados correctamente.`);
    cargarMetricas();
  } catch (error) {
    if (error.message === "SESION_EXPIRADA") return;
    console.error(error);
    window.alert("Error al eliminar los datos.");
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

  const siguienteMesInput = document.getElementById(`siguienteMes_${sedeNombre}`);
  const mes = siguienteMesInput ? siguienteMesInput.value : "";
  if (!mes) {
    window.alert("No se puede agregar más meses.");
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

  const payload = { year: parseInt(year), mes, sede: sedeNombre, aprovechamiento, rechazo };

  try {
    await recovenApi.put("/metrics", payload, true);
    window.alert(`Datos de ${mes} agregados correctamente.`);
    cargarMetricas();
  } catch (error) {
    if (error.message === "SESION_EXPIRADA") return;
    console.error(error);
    window.alert("Error al guardar los datos.");
  }
}

// =========================================================================
// ================= MÓDULO DE CERTIFICADOS Y EMPRESAS =====================
// =========================================================================

function inicializarModuloDocumentos() {
  cargarEmpresasDropdownYLista();
  cargarHistorialCertificados();
  configurarDropzone();

  const certForm = document.getElementById("uploadCertificateForm");
  certForm?.removeEventListener("submit", handleUploadCertificate);
  certForm?.addEventListener("submit", handleUploadCertificate);

  // 🟢 ACTUALIZADO: El listener de submit ahora llama a handleSaveCustomer inteligente
  const custForm = document.getElementById("quickCustomerForm");
  custForm?.removeEventListener("submit", handleSaveCustomer);
  custForm?.addEventListener("submit", handleSaveCustomer);
}

async function cargarEmpresasDropdownYLista() {
  const dropdown = document.getElementById("certEmpresaSelect");
  const listadoLateral = document.getElementById("quickCustomersList");

  if (!dropdown || !listadoLateral) return;

  try {
    const empresas = await recovenApi.get("/customers", true);

    dropdown.innerHTML = `
      <option value="" disabled selected>Seleccione una empresa...</option>
      ${empresas.map((emp) => `<option value="${emp.id}">${escapeHtml(emp.nombre)}</option>`).join("")}
    `;

    if (empresas.length === 0) {
      listadoLateral.innerHTML = `<p class="text-xs text-center text-gray-400 py-4">No hay empresas registradas.</p>`;
    } else {
      listadoLateral.innerHTML = empresas
        .map(
          (emp) => `
        <div class="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3 transition hover:shadow-sm">
          <div class="truncate max-w-[70%]">
            <p class="text-xs font-bold text-gray-900 truncate">${escapeHtml(emp.nombre)}</p>
            <p class="text-[11px] text-gray-500 truncate">${escapeHtml(emp.correo)}</p>
          </div>
          <div class="flex gap-1">
            <button class="editCustomerBtn text-gray-400 hover:text-blue-600 transition p-1 text-sm" 
                    data-id="${emp.id}" data-nombre="${escapeHtml(emp.nombre)}" data-correo="${escapeHtml(emp.correo)}" title="Editar Empresa">
              <i class="fas fa-edit"></i>
            </button>
            <button class="deleteCustomerBtn text-gray-400 hover:text-red-600 transition p-1 text-sm" data-id="${emp.id}" title="Eliminar Empresa">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      `
        )
        .join("");

      // Enlazar los delete
      listadoLateral.querySelectorAll(".deleteCustomerBtn").forEach((btn) => {
        btn.addEventListener("click", handleDeleteCustomer);
      });

      // 🟢 NUEVO: Enlazar los clicks de edición
      listadoLateral.querySelectorAll(".editCustomerBtn").forEach((btn) => {
        btn.addEventListener("click", handleEditCustomerClick);
      });
    }
  } catch (error) {
    console.error("Error cargando empresas:", error);
  }
}

// 🟢 NUEVO: Toma los datos de la fila y los monta en el formulario lateral
function handleEditCustomerClick(e) {
  const btn = e.currentTarget;
  const id = btn.dataset.id;
  const nombre = btn.dataset.nombre;
  const correo = btn.dataset.correo;

  const form = document.getElementById("quickCustomerForm");
  const nombreInput = document.getElementById("custNombre");
  const correoInput = document.getElementById("custCorreo");
  const submitBtn = form?.querySelector("button[type='submit']");

  if (!form || !nombreInput || !correoInput || !submitBtn) return;

  // Rellenar entradas de texto
  nombreInput.value = nombre;
  correoInput.value = correo;

  // Inyectar estado de ID en el formulario
  form.dataset.editId = id;

  // Transformar el botón a modo edición (Azul corporativo / Sincronizar)
  submitBtn.innerHTML = '<i class="fas fa-sync-alt mr-1"></i> Actualizar Empresa';
  submitBtn.classList.remove("bg-emerald-600", "hover:bg-emerald-700");
  submitBtn.classList.add("bg-blue-600", "hover:bg-blue-700");
}

// 🟢 NUEVO/REEMPLAZADO: Reemplaza a handleCreateCustomer. Decide de forma inteligente si hace POST o PUT
async function handleSaveCustomer(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const nombreInput = document.getElementById("custNombre");
  const correoInput = document.getElementById("custCorreo");
  const submitBtn = form.querySelector("button[type='submit']");

  const nombre = nombreInput.value.trim();
  const correo = correoInput.value.trim();
  const editId = form.dataset.editId; // Detectar si hay un ID colgado

  if (!nombre || !correo) return;

  try {
    if (editId) {
      // 🟢 MODO EDICIÓN -> Consumir tu nuevo controlador PUT en NestJS
      await recovenApi.put(`/customers/${editId}`, { nombre, correo }, true);
      window.alert("Empresa actualizada correctamente.");
    } else {
      // MODO CREACIÓN -> Tradicional POST
      await recovenApi.post("/customers", { nombre, correo }, true);
      window.alert("Empresa registrada con éxito.");
    }

    // Limpiar formulario y restaurar UI del botón a su estado Esmeralda original
    form.reset();
    delete form.dataset.editId;
    submitBtn.innerHTML = '<i class="fas fa-plus mr-1"></i> Registrar Empresa';
    submitBtn.classList.remove("bg-blue-600", "hover:bg-blue-700");
    submitBtn.classList.add("bg-emerald-600", "hover:bg-emerald-700");

    cargarEmpresasDropdownYLista();
  } catch (error) {
    window.alert(error.message || "Error al procesar la solicitud.");
  }
}

async function handleDeleteCustomer(e) {
  const btn = e.currentTarget;
  const id = btn.dataset.id;

  if (
    !window.confirm(
      "¿Está seguro de eliminar esta empresa? Esto restringirá su uso en nuevos certificados."
    )
  )
    return;

  try {
    await recovenApi.delete(`/customers/${id}`);

    window.alert("Empresa eliminada correctamente.");
    cargarEmpresasDropdownYLista();
  } catch (error) {
    console.error("Error original capturado:", error);

    if (
      error.message &&
      (error.message.includes("Unexpected token 't'") ||
        error.message.includes("is not valid JSON"))
    ) {
      window.alert("Empresa eliminada correctamente.");
      cargarEmpresasDropdownYLista();
      return;
    }

    const mensajeError =
      error.message ||
      "No se pudo eliminar la empresa. Si ya posee certificados en el historial, esta acción quedará restringida.";
    window.alert(mensajeError);
  }
}

function configurarDropzone() {
  const dropzone = document.getElementById("dropzoneContainer");
  const fileInput = document.getElementById("certFileInput");
  const dropzoneText = document.getElementById("dropzoneText");

  if (!dropzone || !fileInput) return;

  dropzone.onclick = () => fileInput.click();

  fileInput.onchange = () => {
    if (fileInput.files.length > 0) {
      dropzoneText.innerHTML = `Archivo seleccionado: <span class="text-emerald-600 font-bold">${fileInput.files[0].name}</span>`;
      dropzone.classList.add("border-emerald-500", "bg-emerald-50/30");
    }
  };

  dropzone.ondragover = (e) => {
    e.preventDefault();
    dropzone.classList.add("border-emerald-500", "bg-gray-100");
  };
  dropzone.ondragleave = () => {
    dropzone.classList.remove("border-emerald-500", "bg-gray-100");
  };
  dropzone.ondrop = (e) => {
    e.preventDefault();
    dropzone.classList.remove("border-emerald-500", "bg-gray-100");
    if (e.dataTransfer.files.length > 0) {
      fileInput.files = e.dataTransfer.files;
      dropzoneText.innerHTML = `Archivo seleccionado: <span class="text-emerald-600 font-bold">${fileInput.files[0].name}</span>`;
      dropzone.classList.add("border-emerald-500", "bg-emerald-50/30");
    }
  };
}

async function handleUploadCertificate(e) {
  e.preventDefault();
  const btn = document.getElementById("btnSendCertificate");
  const empresaId = document.getElementById("certEmpresaSelect").value;
  const tipo = document.getElementById("certTipoSelect").value;
  const fileInput = document.getElementById("certFileInput");

  if (!empresaId || !tipo || fileInput.files.length === 0) {
    window.alert("Por favor complete todos los campos y seleccione un archivo.");
    return;
  }

  const mensajeConfirmacion =
    "¿Está seguro de registrar este certificado?\n\n" +
    "⚠️ Esta acción NO es reversible.\n" +
    "📩 Se enviará un correo electrónico de forma inmediata y directa a la empresa cliente con el documento adjunto.";

  if (!window.confirm(mensajeConfirmacion)) {
    return;
  }

  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo y despachando correo...';

  const formData = new FormData();
  formData.append("empresaId", empresaId);
  formData.append("tipo", tipo);
  formData.append("file", fileInput.files[0]);

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${recovenApi.baseUrl}/certificates/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) throw new Error("Error en el procesamiento del servidor.");

    window.alert(
      "¡Éxito! El certificado ha sido archivado y enviado de forma inmediata al correo del cliente."
    );

    document.getElementById("uploadCertificateForm").reset();
    document.getElementById("dropzoneText").innerText =
      "Arrastra el archivo aquí o haz clic para explorar";
    document
      .getElementById("dropzoneContainer")
      .classList.remove("border-emerald-500", "bg-emerald-50/30");

    cargarHistorialCertificados();
  } catch (error) {
    console.error(error);
    window.alert("Ocurrió un error al despachar el documento. Valida la conexión SMTP.");
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

async function cargarHistorialCertificados() {
  const tbody = document.getElementById("certHistoryTableBody");
  if (!tbody) return;

  try {
    const history = await recovenApi.get("/certificates/history", true);

    if (history.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-gray-400 py-6">No se registran certificados emitidos recientemente.</td></tr>`;
      return;
    }

    tbody.innerHTML = history
      .map((log) => {
        const fecha = new Date(log.fechaEnvio).toLocaleDateString("es-CO", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        const esPoda = log.tipo === "PODA";

        return `
        <tr class="hover:bg-gray-50/70 transition">
          <td class="p-4">
            <div class="font-bold text-gray-900">${escapeHtml(log.empresa.nombre)}</div>
            <div class="text-xs text-gray-400">${escapeHtml(log.empresa.correo)}</div>
          </td>
          <td class="p-4">
            <span class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full ${
              esPoda
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-blue-50 text-blue-700 border border-blue-100"
            }">
              ${esPoda ? "🍃 PODA" : "📦 RESIDUOS"}
            </span>
          </td>
          <td class="p-4 text-xs font-mono text-gray-600">
            <i class="far fa-file-alt text-gray-400 mr-1 text-sm"></i> ${escapeHtml(log.nombreArchivo)}
          </td>
          <td class="p-4 text-xs text-gray-500 font-medium">${fecha}</td>
        </tr>
      `;
      })
      .join("");
  } catch (error) {
    console.error("Error cargando historial:", error);
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-red-500 py-4">Error al sincronizar el log de auditoría.</td></tr>`;
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

      // DISPARADORES DE CARGA AL CAMBIAR DE PESTAÑA
      if (targetTabId === "tab-metrics") {
        cargarMetricas();
      } else if (targetTabId === "tab-documents") {
        inicializarModuloDocumentos();
      }
    });
  });
}

// Función auxiliar escapeHtml global
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
