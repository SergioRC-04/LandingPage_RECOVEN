/**
 * Analytics Charts Module
 * Inicializa gráficas horizontales dinámicas consumiendo datos reales desde NestJS
 */
import { recovenApi } from "../../api/recovenApi.js";

export async function initAnalyticsCharts() {
  const barranquillaCanvas = document.getElementById("barranquilla-bodegas");
  const colombiaCanvas = document.getElementById("colombia-bodegas");
  const downloadPdfBtn = document.getElementById("downloadPdfBtn");

  // Si no estamos en una página con gráficas, no hacemos la petición innecesariamente
  if (!barranquillaCanvas && !colombiaCanvas) return;

  try {
    // 1. Consumir el endpoint público de métricas usando tu cliente centralizado
    const metrics = await recovenApi.get("/metrics");

    // 2. Filtrar y segmentar los datos por cada sede para el año en curso (2026)
    // Nota: Ajusta 'PUERTO COLOMBIA' o 'PUERTO_COLOMBIA' según cómo se guarde en tu SQLite
    const datosBq = metrics.filter((m) => m.sede === "BARRANQUILLA");
    const datosPuerto = metrics.filter(
      (m) => m.sede === "PUERTO COLOMBIA" || m.sede === "PUERTO_COLOMBIA"
    );

    // 3. Mapear de forma ordenada los meses disponibles en la base de datos
    // Esto garantiza que los meses se alineen perfectamente entre los datasets de ambas sedes
    const mesesUnicos = [...new Set(metrics.map((m) => m.mes))];

    // 4. Construir arreglos paralelos de aprovechamiento y rechazo para Barranquilla
    const bqAprovechamiento = mesesUnicos.map(
      (mes) => datosBq.find((d) => d.mes === mes)?.aprovechamiento || 0
    );
    const bqRechazo = mesesUnicos.map((mes) => datosBq.find((d) => d.mes === mes)?.rechazo || 0);

    // 5. Construir arreglos paralelos de aprovechamiento y rechazo para Puerto Colombia
    const puertoAprovechamiento = mesesUnicos.map(
      (mes) => datosPuerto.find((d) => d.mes === mes)?.aprovechamiento || 0
    );
    const puertoRechazo = mesesUnicos.map(
      (mes) => datosPuerto.find((d) => d.mes === mes)?.rechazo || 0
    );

    // ── Configuración Base Compartida para Chart.js ─────────────────
    const generarOpcionesGrafico = () => ({
      indexAxis: "y", // Mantiene el diseño de barras horizontales solicitado
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            font: { size: 13, weight: "600" },
            padding: 16,
            color: "#374151",
            usePointStyle: true,
            pointStyle: "circle",
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
          titleFont: { size: 12, weight: "bold" },
          bodyFont: { size: 12 },
          borderColor: "#10b981",
          borderWidth: 1,
          displayColors: true,
          callbacks: {
            label: function (context) {
              return context.dataset.label + ": " + context.parsed.x.toLocaleString("es-CO") + " t";
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          // Retiramos el valor estático 'max: 160000' para que sea completamente autoadaptable
          grid: {
            color: "#e5e7eb",
            drawBorder: false,
          },
          ticks: {
            font: { size: 11, weight: "500" },
            color: "#6b7280",
            callback: function (value) {
              // Si el número pasa de 1000, lo simplifica en formato "150K" para no saturar el diseño
              return value >= 1000 ? (value / 1000).toFixed(0) + "K" : value;
            },
          },
        },
        y: {
          grid: {
            display: false,
          },
          ticks: {
            font: { size: 12, weight: "600" },
            color: "#374151",
            padding: 8,
          },
        },
      },
    });

    // ── Renderizar Gráfica de Barranquilla ────────────────────────────
    if (barranquillaCanvas) {
      const ctxBarranquilla = barranquillaCanvas.getContext("2d");
      new window.Chart(ctxBarranquilla, {
        type: "bar",
        data: {
          labels: mesesUnicos,
          datasets: [
            {
              label: "Aprovechamiento (Ton)",
              data: bqAprovechamiento,
              backgroundColor: "#10b981",
              borderColor: "#059669",
              borderWidth: 1,
              borderRadius: 4,
              barThickness: 20,
            },
            {
              label: "Rechazo (Ton)",
              data: bqRechazo,
              backgroundColor: "#cbd5e1",
              borderColor: "#94a3b8",
              borderWidth: 1,
              borderRadius: 4,
              barThickness: 20,
            },
          ],
        },
        options: generarOpcionesGrafico(),
      });
    }

    // ── Renderizar Gráfica de Puerto Colombia ────────────────────────
    if (colombiaCanvas) {
      const ctxColombia = colombiaCanvas.getContext("2d");
      new window.Chart(ctxColombia, {
        type: "bar",
        data: {
          labels: mesesUnicos,
          datasets: [
            {
              label: "Aprovechamiento (Ton)",
              data: puertoAprovechamiento,
              backgroundColor: "#10b981",
              borderColor: "#059669",
              borderWidth: 1,
              borderRadius: 4,
              barThickness: 20,
            },
            {
              label: "Rechazo (Ton)",
              data: puertoRechazo,
              backgroundColor: "#cbd5e1",
              borderColor: "#94a3b8",
              borderWidth: 1,
              borderRadius: 4,
              barThickness: 20,
            },
          ],
        },
        options: generarOpcionesGrafico(),
      });
    }
  } catch (error) {
    console.error("Error al cargar las métricas operacionales de RECOVEN:", error);
    // Degradación aceptable de la UI en caso de caída del servidor
    const contenedores = document.querySelectorAll("#estadisticas-bodegas canvas");
    contenedores.forEach((canvas) => {
      const p = document.createElement("p");
      p.className = "text-sm text-red-500 text-center mt-10";
      p.textContent = "No se pudieron cargar las estadísticas en este momento.";
      canvas.parentElement.appendChild(p);
    });
  }
  // ── 🚀 NUEVO: Escuchador para la descarga del PDF de Métricas ─────────────────────
  if (downloadPdfBtn) {
    const pdfIcon = document.getElementById("pdfIcon");
    const pdfBtnText = document.getElementById("pdfBtnText");
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    downloadPdfBtn.addEventListener("click", async () => {
      // 1. Poner el botón en estado de carga
      downloadPdfBtn.disabled = true;
      downloadPdfBtn.classList.add("opacity-70", "cursor-not-allowed");
      const originalIconClass = pdfIcon.className;

      // Cambiamos el icono de PDF por un spinner animado
      pdfIcon.className = "fas fa-spinner fa-spin text-primary-green text-xl";
      pdfBtnText.textContent = "Generando PDF...";

      try {
        // 2. Realizar la petición asíncrona esperando un arrayBuffer/blob de vuelta
        const response = await fetch(`${BASE_URL}/metrics/export_pdf`, {
          method: "GET",
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        // 3. Convertir la respuesta binaria a un Objeto Blob (Binary Large Object)
        const blob = await response.blob();

        // 4. Crear un enlace temporal invisible en memoria para forzar la descarga nativa
        const urlDescarga = window.URL.createObjectURL(blob);
        const enlaceTemporal = document.createElement("a");
        enlaceTemporal.href = urlDescarga;
        enlaceTemporal.download = "Reporte_Historico_RECOVEN.pdf"; // Nombre con el que se guardará

        // Añadir al documento, disparar click y destruir para liberar memoria
        document.body.appendChild(enlaceTemporal);
        enlaceTemporal.click();
        document.body.removeChild(enlaceTemporal);
        window.URL.revokeObjectURL(urlDescarga);
      } catch (err) {
        console.error("[RECOVEN PDF Export Error]", err);
        window.alert(
          "No se pudo descargar el reporte en este momento. Por favor, intente más tarde."
        );
      } finally {
        // 5. Restablecer el botón a su diseño original
        downloadPdfBtn.disabled = false;
        downloadPdfBtn.classList.remove("opacity-70", "cursor-not-allowed");
        pdfIcon.className = originalIconClass;
        pdfBtnText.textContent = "Descargar Reporte Histórico (PDF)";
      }
    });
  }
}
