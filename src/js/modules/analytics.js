/**
 * Analytics Charts Module
 * Inicializa gráficas horizontales interactivas de Chart.js para estadísticas de bodegas
 */

export function initAnalyticsCharts() {
  // Datos para BARRANQUILLA RECOVEN
  const barranquillaBodegas = document.getElementById("barranquilla-bodegas");
  if (barranquillaBodegas) {
    const ctxBarranquilla = barranquillaBodegas.getContext("2d");
    new window.Chart(ctxBarranquilla, {
      type: "bar",
      data: {
        labels: ["Enero", "Febrero", "Marzo", "Abril"],
        datasets: [
          {
            label: "Aprovechamiento (Ton)",
            data: [149093, 153098, 154155, 150051],
            backgroundColor: "#10b981", // emerald-600 (verde RECOVEN)
            borderColor: "#059669",
            borderWidth: 1,
            borderRadius: 4,
            barThickness: 20,
          },
          {
            label: "Rechazo (Ton)",
            data: [6417, 6557, 6587, 6511],
            backgroundColor: "#cbd5e1", // slate-400 (gris neutro)
            borderColor: "#94a3b8",
            borderWidth: 1,
            borderRadius: 4,
            barThickness: 20,
          },
        ],
      },
      options: {
        indexAxis: "y", // Barras horizontales
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
                return context.dataset.label + ": " + context.parsed.x.toLocaleString("es-CO");
              },
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 160000,
            grid: {
              color: "#e5e7eb",
              drawBorder: false,
            },
            ticks: {
              font: { size: 11, weight: "500" },
              color: "#6b7280",
              callback: function (value) {
                return (value / 1000).toFixed(0) + "K";
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
      },
    });
  }

  // Datos para PUERTO COLOMBIA RECOVEN
  const colombiaBodegas = document.getElementById("colombia-bodegas");
  if (colombiaBodegas) {
    const ctxColombia = colombiaBodegas.getContext("2d");
    new window.Chart(ctxColombia, {
      type: "bar",
      data: {
        labels: ["Enero", "Febrero", "Marzo", "Abril"],
        datasets: [
          {
            label: "Aprovechamiento (Ton)",
            data: [145319, 149284, 146478, 150771],
            backgroundColor: "#10b981", // emerald-600 (verde RECOVEN)
            borderColor: "#059669",
            borderWidth: 1,
            borderRadius: 4,
            barThickness: 20,
          },
          {
            label: "Rechazo (Ton)",
            data: [5951, 6094, 5083, 6371],
            backgroundColor: "#cbd5e1", // slate-400 (gris neutro)
            borderColor: "#94a3b8",
            borderWidth: 1,
            borderRadius: 4,
            barThickness: 20,
          },
        ],
      },
      options: {
        indexAxis: "y", // Barras horizontales
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
                return context.dataset.label + ": " + context.parsed.x.toLocaleString("es-CO");
              },
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 160000,
            grid: {
              color: "#e5e7eb",
              drawBorder: false,
            },
            ticks: {
              font: { size: 11, weight: "500" },
              color: "#6b7280",
              callback: function (value) {
                return (value / 1000).toFixed(0) + "K";
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
      },
    });
  }
}
