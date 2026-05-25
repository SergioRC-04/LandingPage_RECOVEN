/**
 * tabs.js — Pestañas Misión / Visión con animación suave
 * RECOVEN ECA SAS ESP · v2
 */

export function initTabs() {
  const btnMision = document.getElementById("tabMisionBtn");
  const btnVision = document.getElementById("tabVisionBtn");
  const contMision = document.getElementById("misionContent");
  const contVision = document.getElementById("visionContent");

  if (!btnMision || !btnVision) return;

  function activateTab(activeBtn, inactiveBtn, activeContent, inactiveContent) {
    // Botones activo
    inactiveBtn.classList.remove(
      "bg-primary-green",
      "text-white",
      "border-b-2",
      "border-[#E4B363]"
    );
    inactiveBtn.classList.add("bg-gray-100", "text-gray-900");

    activeBtn.classList.remove("bg-gray-100", "text-gray-900");
    activeBtn.classList.add("bg-primary-green", "text-white", "border-b-2", "border-[#E4B363]");

    // Contenido
    inactiveContent.classList.remove("block", "animate-fadeTab");
    inactiveContent.classList.add("hidden");

    activeContent.classList.remove("hidden");
    activeContent.classList.add("block", "animate-fadeTab");
  }

  btnMision.addEventListener("click", () =>
    activateTab(btnMision, btnVision, contMision, contVision)
  );

  btnVision.addEventListener("click", () =>
    activateTab(btnVision, btnMision, contVision, contMision)
  );
}
