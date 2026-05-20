# RECOVEN ECA SAS ESP — Landing Page v2

Diseño original adaptado con buenas prácticas de ingeniería frontend.  
NIT: 901427170-6 | recovenecasasesp@gmail.com | 320 935 0289

---

## 🚀 Inicio rápido

```bash
npm install
npm run dev       # servidor local en localhost:3000
npm run build     # build de producción → /dist
```

---

## 📁 Estructura del proyecto

```
recoven-v2/
├── public/
│   ├── favicon.ico
│   └── docs/
│       └── portafolio-recoven.pdf    ← Coloca aquí el PDF
├── src/
│   ├── assets/
│   │   ├── img/                      ← Fotos de hero, equipo, etc.
│   │   └── logos/                    ← Logo oficial RECOVEN
│   ├── js/
│   │   ├── main.js                   ← Orquestador (scroll suave + reveal)
│   │   └── modules/
│   │       ├── menu.js               ← Hamburguesa animada
│   │       ├── tabs.js               ← Pestañas Misión / Visión
│   │       ├── carousel.js           ← Carrusel infinito RAF
│   │       └── form.js               ← Validación + envío async
│   └── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## ✅ Mejoras aplicadas sobre el diseño original

| Problema original              | Solución aplicada                                           |
|-------------------------------|-------------------------------------------------------------|
| Salto brusco al navegar        | `window.scrollTo` con `behavior:'smooth'` + offset navbar  |
| `alert()` en el formulario     | Banners inline de éxito/error animados                      |
| Todo en un solo archivo        | JS modular ES6 en `src/js/modules/`                         |
| Sin validación en tiempo real  | Validación en `blur` + feedback visual por campo            |
| Hamburguesa sin animación      | Animación CSS hamburguesa → X con clases toggle             |
| Menú no se cierra              | Se cierra al clic en enlace o fuera del menú                |
| Carrusel con CSS animation     | Loop con `requestAnimationFrame` (más preciso y pausable)   |
| Sin reveal al hacer scroll     | `IntersectionObserver` con stagger escalonado               |
| Sin estructura de carpetas     | Arquitectura Vite lista para producción                     |

---

## ⚙️ Activar el formulario de contacto

### Formspree (recomendado)
1. Regístrate en [formspree.io](https://formspree.io) y crea un formulario
2. Copia tu Form ID y reemplaza en `src/index.html`:
```html
<form id="leadForm" action="https://formspree.io/f/TU_FORM_ID" ...>
```

### Web3Forms
1. Obtén tu `access_key` en [web3forms.com](https://web3forms.com)
2. Cambia el `action` y agrega:
```html
<form id="leadForm" action="https://api.web3forms.com/submit" ...>
  <input type="hidden" name="access_key" value="TU_ACCESS_KEY">
```

---

## 📄 Colocar el portafolio PDF

Copia el archivo en:
```
public/docs/portafolio-recoven.pdf
```
El botón "Descargar Portafolio" del hero lo descargará automáticamente.

---

## 📸 Reemplazar imágenes

Para producción, descarga las fotos de Unsplash y guárdalas localmente:

| Ruta sugerida                        | Descripción                   |
|--------------------------------------|-------------------------------|
| `src/assets/img/hero-bg.jpg`         | Fondo del hero (industrial)   |
| `src/assets/logos/recoven-logo.png`  | Logo oficial RECOVEN          |

Luego actualiza la URL en el atributo `style` del `<section id="inicio">`.

---

© 2026 RECOVEN ECA SAS ESP. Todos los derechos reservados.
