(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))s(t);new MutationObserver(t=>{for(const a of t)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function o(t){const a={};return t.integrity&&(a.integrity=t.integrity),t.referrerPolicy&&(a.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?a.credentials="include":t.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(t){if(t.ep)return;t.ep=!0;const a=o(t);fetch(t.href,a)}})();function y(){const e=document.getElementById("tabMisionBtn"),n=document.getElementById("tabVisionBtn"),o=document.getElementById("misionContent"),s=document.getElementById("visionContent");if(!e||!n)return;function t(a,r,c,i){a.classList.remove("tab-inactive"),a.classList.add("tab-active"),r.classList.remove("tab-active"),r.classList.add("tab-inactive"),i.classList.remove("active-tab"),c.classList.add("active-tab")}e.addEventListener("click",()=>t(e,n,o,s)),n.addEventListener("click",()=>t(n,e,s,o))}const v=[{icon:"fas fa-ship",label:"Sociedad Portuaria Riverport"},{icon:"fas fa-industry",label:"Italcol"},{icon:"fas fa-heart",label:"Fundación Éxito"},{icon:"fas fa-hospital",label:"Clínica General del Norte"},{icon:"fas fa-bolt",label:"Air-E"},{icon:"fas fa-balance-scale",label:"Consejo Sup. Judicatura"},{icon:"fas fa-shield-alt",label:"Esc. Antonio Nariño — Policía Nal."},{icon:"fas fa-briefcase",label:"INSERMAS S.A.S"},{icon:"fas fa-hard-hat",label:"FSCR Ingeniería SAS"},{icon:"fas fa-globe",label:"Comercio Exterior Nuvias Miles"},{icon:"fas fa-building",label:"Edificio Toledo"},{icon:"fas fa-city",label:"Edificio Miramar"},{icon:"fas fa-flask",label:"Cosmético Pineda"},{icon:"fas fa-utensils",label:"Prodisabor"},{icon:"fas fa-user-shield",label:"Holding de Seguridad"}];function x(){const e=document.getElementById("carouselTrack");if(!e)return;const n=[...v,...v];e.innerHTML=n.map(o=>`
    <div class="carousel-slide">
      <i class="${o.icon}"></i>
      <span>${o.label}</span>
    </div>
  `).join(""),requestAnimationFrame(()=>{const s=e.scrollWidth/2;let t=0,a=!1;const r=window.innerWidth<768?.5:.7;function c(){a||(t+=r,t>=s&&(t=0),e.style.transform=`translateX(-${t}px)`),requestAnimationFrame(c)}e.addEventListener("mouseenter",()=>{a=!0}),e.addEventListener("mouseleave",()=>{a=!1}),e.addEventListener("touchstart",()=>{a=!0},{passive:!0}),e.addEventListener("touchend",()=>{a=!1},{passive:!0}),window.addEventListener("resize",()=>{},{passive:!0}),requestAnimationFrame(c)})}const d={nombre:{test:e=>e.trim().length>=2,errorId:"errorNombre"},email:{test:e=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()),errorId:"errorEmail"},telefono:{test:e=>/^[\d\s\-+]{7,}$/.test(e.trim()),errorId:"errorTelefono"},servicioTipo:{test:e=>e!=="",errorId:"errorServicio"}},l=e=>document.getElementById(e),E=e=>document.getElementById(e);function L(e,n){const o=l(e),s=d[e];if(!o||!s)return;const t=E(s.errorId);n?(o.classList.remove("border-red-400"),o.classList.add("border-gray-300"),t==null||t.classList.add("hidden")):(o.classList.remove("border-gray-300"),o.classList.add("border-red-400"),t==null||t.classList.remove("hidden"))}function m(e){const n=l(e);if(!n)return!0;const o=d[e].test(n.value);return L(e,o),o}function w(){const e=l("servicioTipo");if(!e)return;document.querySelectorAll("[data-service]").forEach(o=>{o.addEventListener("click",()=>{const s=o.dataset.service;e.value=s,sessionStorage.setItem("recoven_preselect",s)})});const n=sessionStorage.getItem("recoven_preselect");n&&(e.value=n,sessionStorage.removeItem("recoven_preselect"))}function S(){const e=document.getElementById("leadForm"),n=document.getElementById("form-success"),o=document.getElementById("form-error-msg"),s=document.getElementById("submitBtn"),t=document.getElementById("btnLabel");e&&(w(),Object.keys(d).forEach(a=>{const r=l(a);r&&(r.addEventListener("blur",()=>m(a)),r.addEventListener("input",()=>{r.classList.contains("border-red-400")&&m(a)}))}),e.addEventListener("submit",async a=>{var c;if(a.preventDefault(),Object.keys(d).map(i=>m(i)).includes(!1)){(c=e.querySelector(".border-red-400"))==null||c.scrollIntoView({behavior:"smooth",block:"center"});return}s.disabled=!0,t.textContent="Enviando...",s.classList.add("opacity-70","cursor-not-allowed"),n.classList.remove("show"),o.classList.remove("show");try{const i=await fetch(e.action,{method:"POST",body:new FormData(e),headers:{Accept:"application/json"}});if(i.ok)e.reset(),Object.keys(d).forEach(u=>{var p,b;(p=l(u))==null||p.classList.remove("border-red-400"),(b=l(u))==null||b.classList.add("border-gray-300")}),n.classList.add("show"),n.scrollIntoView({behavior:"smooth",block:"center"});else throw new Error(`HTTP ${i.status}`)}catch(i){console.error("[RECOVEN Form]",i),o.classList.add("show"),o.scrollIntoView({behavior:"smooth",block:"center"})}finally{s.disabled=!1,t.textContent="Enviar solicitud",s.classList.remove("opacity-70","cursor-not-allowed")}}))}function C(){if(typeof Swiper>"u"){console.warn("⚠️ Swiper no cargado. Verifica que la librería esté en el <head>");return}const e=document.querySelector(".hero-carousel-swiper");if(!e)return;const n=new Swiper(".hero-carousel-swiper",{loop:!0,effect:"fade",speed:800,allowTouchMove:!0,autoplay:{delay:4e3,disableOnInteraction:!1,pauseOnMouseEnter:!0},navigation:{nextEl:".carousel-nav-next",prevEl:".carousel-nav-prev"},pagination:{el:".carousel-pagination",type:"bullets",clickable:!0,dynamicBullets:!1},touchEventsTarget:"container",simulateTouch:!0,grabCursor:!0,breakpoints:{320:{effect:"fade",speed:600,autoplay:{delay:3500}},768:{effect:"fade",speed:700,autoplay:{delay:3800}},1024:{effect:"fade",speed:800,autoplay:{delay:4e3}}},on:{init:()=>{console.log("✓ Hero carousel inicializado")}}});e.addEventListener("mouseenter",()=>{n.autoplay.stop()}),e.addEventListener("mouseleave",()=>{n.autoplay.start()}),console.log("✓ Hero carousel: autoplay, navegación y paginación activos")}function A(){document.querySelectorAll('a[href^="#"]').forEach(e=>{e.addEventListener("click",n=>{const o=e.getAttribute("href");if(!o||o==="#")return;const s=document.querySelector(o);if(!s)return;n.preventDefault();const t=document.getElementById("navbar"),a=t?t.offsetHeight:0,r=s.getBoundingClientRect().top+window.scrollY-a;window.scrollTo({top:r,behavior:"smooth"});const c=e.dataset.service;c&&o==="#contacto"&&setTimeout(()=>{const i=document.getElementById("servicioTipo");i&&(i.value=c,i.classList.add("ring-2","ring-green-500"),setTimeout(()=>i.classList.remove("ring-2","ring-green-500"),1200))},600)})})}function I(){const e=document.querySelectorAll(".reveal");if(!e.length)return;const n=new IntersectionObserver(o=>{o.forEach(s=>{if(!s.isIntersecting)return;const t=s.target.closest("section")??document.body,r=Array.from(t.querySelectorAll(".reveal")).indexOf(s.target);setTimeout(()=>s.target.classList.add("visible"),r*100),n.unobserve(s.target)})},{threshold:.1,rootMargin:"0px 0px -30px 0px"});e.forEach(o=>n.observe(o))}document.addEventListener("DOMContentLoaded",()=>{I(),A(),document.getElementById("carouselTrack")&&x(),document.getElementById("leadForm")&&S(),document.getElementById("tabMisionBtn")&&y(),document.querySelector(".hero-carousel-swiper")&&C()});function T(){const e=document.getElementById("menu-btn"),n=document.getElementById("mobile-menu"),o=document.querySelectorAll(".mobile-link");if(!e||!n)return;let s=!1;e.addEventListener("click",()=>{s=!s,e.classList.toggle("open",s),n.classList.toggle("open",s),e.setAttribute("aria-expanded",String(s))}),o.forEach(t=>{t.addEventListener("click",()=>{s=!1,e.classList.remove("open"),n.classList.remove("open"),e.setAttribute("aria-expanded","false")})}),document.addEventListener("click",t=>{s&&!e.contains(t.target)&&!n.contains(t.target)&&(s=!1,e.classList.remove("open"),n.classList.remove("open"),e.setAttribute("aria-expanded","false"))})}const h=[{label:"Inicio",href:"index.html",id:"index"},{label:"Nosotros",href:"empresa.html",id:"empresa"},{label:"Servicios",href:"servicios.html",id:"servicios"},{label:"Contacto",href:"index.html#contacto",id:"contacto",class:"nav-link"}];function k(){return window.location.pathname.split("/").pop()||"index.html"}function B(){const e=k(),n=document.querySelector("#desktop-nav"),o=document.querySelector("#mobile-nav"),s=document.querySelector("#desktop-cta");n&&(n.innerHTML=h.map(t=>{const r=e===t.href?"text-primary-green font-bold border-b-2 border-primary-green pb-0.5":"hover:text-primary-green transition";return`<a href="${t.href}" class="${r} ${t.class||""}">${t.label}</a>`}).join("")),o&&(o.innerHTML=h.map(t=>{const a=e===t.href;let r="mobile-link font-medium hover:text-primary-green py-2 px-2 rounded-lg";return a&&t.href!=="#contacto"?r="mobile-link font-bold text-primary-green py-2 px-2 rounded-lg bg-green-50":a||(r+=" hover:bg-gray-50"),`<a href="${t.href}" class="${r}">${t.label}</a>`}).join(""),o.innerHTML+=`
      <a href="index.html#contacto" class="mobile-link bg-primary-green text-white text-center rounded-full py-2 font-semibold mt-2">
        <i class="fas fa-truck mr-1"></i> Solicitar Servicio
      </a>
    `),s&&(s.innerHTML=`
      <a href="index.html#contacto" class="bg-primary-green text-white px-6 py-2 rounded-full font-bold shadow-md flex items-center gap-2 hover:bg-opacity-90 transition">
        <i class="fas fa-truck"></i> Solicitar Servicio
      </a>
    `)}const O=`<!-- WHATSAPP FLOATING ACTION BUTTON -->
<a
  id="whatsapp-fab"
  href="https://wa.me/573209350289?text=Hola%2C%20me%20interesa%20solicitar%20un%20servicio%20de%20RECOVEN%20ECA."
  target="_blank"
  rel="noopener"
  aria-label="WhatsApp"
>
  <i class="fab fa-whatsapp text-2xl"></i><span class="wa-label">Escríbenos</span>
</a>
`,N=`<!-- HEADER/NAVBAR -->
<header id="navbar" class="sticky top-0 z-50 bg-white shadow-md py-3 px-4 md:px-8 lg:px-16">
  <div class="container mx-auto flex justify-between items-center">
    <a href="index.html" class="flex items-center space-x-2">
      <img src="/assets/img/logo.png" alt="RECOVEN ECA Logo" class="h-12 md:h-14 object-contain" />
    </a>
    <nav class="hidden md:flex space-x-8 text-gray-700 font-semibold" id="desktop-nav"></nav>
    <div class="hidden md:block" id="desktop-cta"></div>
    <button
      id="menu-btn"
      class="block md:hidden flex flex-col gap-1.5 p-1"
      aria-label="Menú"
      aria-expanded="false"
    >
      <span class="ham-line"></span><span class="ham-line"></span><span class="ham-line"></span>
    </button>
  </div>
  <div id="mobile-menu" class="md:hidden bg-white px-4 border-t border-gray-100 mt-2">
    <div id="mobile-nav" class="flex flex-col space-y-1 pb-4 pt-3"></div>
  </div>
</header>
`,M=`<!-- FOOTER -->
<footer class="bg-gray-900 text-gray-300 py-12">
  <div class="container mx-auto px-6 grid md:grid-cols-4 gap-8">
    <div>
      <i class="fas fa-recycle text-2xl text-primary-green"></i>
      <h4 class="font-bold text-white text-lg mt-2">RECOVEN ECA E.S.P</h4>
      <p class="text-sm mt-1">Soluciones ambientales con certificación y responsabilidad social.</p>
    </div>
    <div>
      <h5 class="font-semibold text-white">Páginas</h5>
      <ul class="mt-2 space-y-1 text-sm">
        <li><a href="index.html" class="hover:text-primary-green transition">Inicio</a></li>
        <li><a href="empresa.html" class="hover:text-primary-green transition">Nosotros</a></li>
        <li>
          <a href="servicios.html" class="hover:text-primary-green transition">Servicios</a>
        </li>
        <li>
          <a href="index.html#contacto" class="hover:text-primary-green transition">Contacto</a>
        </li>
      </ul>
    </div>
    <div>
      <h5 class="font-semibold text-white">Contacto directo</h5>
      <p class="text-sm mt-2">
        <i class="fas fa-phone-alt mr-2"></i>320 935 0289<br /><i class="fas fa-envelope mr-2"></i
        >recovenecasasesp@gmail.com<br /><i class="fas fa-map-pin mr-2"></i>Barranquilla / Puerto
        Colombia
      </p>
      <a
        href="https://wa.me/573209350289"
        target="_blank"
        rel="noopener"
        class="flex items-center gap-2 mt-3 text-sm font-semibold"
        style="color: #25d366"
        ><i class="fab fa-whatsapp text-lg"></i> WhatsApp directo</a
      >
      <a
        href="https://www.instagram.com/recoveneca"
        target="_blank"
        rel="noopener"
        class="flex items-center gap-2 mt-2 text-sm font-semibold"
        style="color: #e1306c"
        ><i class="fab fa-instagram text-lg"></i> @recoveneca</a
      >
      <a
        href="https://www.facebook.com/recoveneca"
        target="_blank"
        rel="noopener"
        class="flex items-center gap-2 mt-2 text-sm font-semibold"
        style="color: #1877f2"
        ><i class="fab fa-facebook text-lg"></i> @recoveneca</a
      >
    </div>
    <div>
      <h5 class="font-semibold text-white">Certificaciones</h5>
      <p class="text-sm mt-2">
        ✔️ Registro como ECA<br />✔️ Cumplimiento Res. 2184/2019<br />✔️ Alianza sector zonas
        francas
      </p>
    </div>
  </div>
  <div class="text-center text-sm text-gray-500 border-t border-gray-800 pt-6 mt-8">
    © 2026 RECOVEN ECA SAS ESP — Economía Circular y Desarrollo Sostenible.
  </div>
</footer>
`;function f(e,n,o={}){const{position:s="beforeend",callback:t=null,strict:a=!0}=o;try{const r=document.querySelector(e);if(!r){if(a)throw new Error(`Element not found: ${e}`);return}r.insertAdjacentHTML(s,n),t&&typeof t=="function"&&t()}catch(r){console.error(`Error injecting component into ${e}:`,r)}}function q(){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",g):g()}function g(){try{f("body",O,{strict:!1}),f("body",N,{position:"afterbegin",callback:()=>{T(),B()}});const e=document.querySelector("footer");e&&e.remove(),f("body",M,{position:"beforeend"})}catch(e){console.error("Error during component injection:",e)}}q();
