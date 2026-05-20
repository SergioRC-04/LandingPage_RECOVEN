/**
 * tabs.js — Pestañas Misión / Visión con animación suave
 * RECOVEN ECA SAS ESP · v2
 */

export function initTabs() {
  const btnMision  = document.getElementById('tabMisionBtn');
  const btnVision  = document.getElementById('tabVisionBtn');
  const contMision = document.getElementById('misionContent');
  const contVision = document.getElementById('visionContent');

  if (!btnMision || !btnVision) return;

  function activateTab(activeBtn, inactiveBtn, activeContent, inactiveContent) {
    // Botones
    activeBtn.classList.remove('tab-inactive');
    activeBtn.classList.add('tab-active');
    inactiveBtn.classList.remove('tab-active');
    inactiveBtn.classList.add('tab-inactive');

    // Contenido
    inactiveContent.classList.remove('active-tab');
    activeContent.classList.add('active-tab');
  }

  btnMision.addEventListener('click', () =>
    activateTab(btnMision, btnVision, contMision, contVision)
  );

  btnVision.addEventListener('click', () =>
    activateTab(btnVision, btnMision, contVision, contMision)
  );
}
