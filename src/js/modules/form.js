/**
 * form.js — Validación en tiempo real y envío async del formulario
 * RECOVEN ECA SAS ESP · v2
 *
 * Sin alert() ni confirm(). Los estados de éxito y error se muestran
 * como banners inline ya definidos en el HTML.
 *
 * Para activar el envío real:
 *   Formspree  → cambia el action del <form> a https://formspree.io/f/TU_ID
 *   Web3Forms  → cambia el action y añade <input type="hidden" name="access_key" value="TU_KEY">
 */

// ── Reglas de validación ─────────────────────────────────────────
const RULES = {
  nombre:       { test: v => v.trim().length >= 2,                       errorId: 'errorNombre'   },
  empresa:      { test: v => v.trim().length >= 2,                       errorId: 'errorEmpresa'  },
  email:        { test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), errorId: 'errorEmail'   },
  telefono:     { test: v => /^[\d\s\-\+]{7,}$/.test(v.trim()),         errorId: 'errorTelefono' },
  servicioTipo: { test: v => v !== '',                                   errorId: 'errorServicio' },
};

// ── Helpers ──────────────────────────────────────────────────────
function getField(id)  { return document.getElementById(id); }
function getError(id)  { return document.getElementById(id); }

function setFieldState(fieldId, isValid) {
  const field = getField(fieldId);
  const rule  = RULES[fieldId];
  if (!field || !rule) return;

  const errEl = getError(rule.errorId);
  if (isValid) {
    field.classList.remove('border-red-400');
    field.classList.add('border-gray-300');
    errEl?.classList.add('hidden');
  } else {
    field.classList.remove('border-gray-300');
    field.classList.add('border-red-400');
    errEl?.classList.remove('hidden');
  }
}

function validateField(fieldId) {
  const field = getField(fieldId);
  if (!field) return true;
  const valid = RULES[fieldId].test(field.value);
  setFieldState(fieldId, valid);
  return valid;
}

// ── Init ─────────────────────────────────────────────────────────
export function initForm() {
  const form       = document.getElementById('leadForm');
  const successBox = document.getElementById('form-success');
  const errorBox   = document.getElementById('form-error-msg');
  const submitBtn  = document.getElementById('submitBtn');
  const btnLabel   = document.getElementById('btnLabel');

  if (!form) return;

  // Validación en blur (salida de campo)
  Object.keys(RULES).forEach(id => {
    const field = getField(id);
    if (!field) return;
    field.addEventListener('blur',  () => validateField(id));
    // Re-validar en input sólo si ya estaba marcado como inválido
    field.addEventListener('input', () => {
      if (field.classList.contains('border-red-400')) validateField(id);
    });
  });

  // Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validar todos los campos
    const results = Object.keys(RULES).map(id => validateField(id));
    if (results.includes(false)) {
      // Hacer scroll hasta el primer campo inválido
      const firstInvalid = form.querySelector('.border-red-400');
      firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Estado de carga
    submitBtn.disabled   = true;
    btnLabel.textContent = 'Enviando...';
    submitBtn.classList.add('opacity-70', 'cursor-not-allowed');
    successBox.classList.remove('show');
    errorBox.classList.remove('show');

    try {
      const res = await fetch(form.action, {
        method:  'POST',
        body:    new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        form.reset();
        // Limpiar estados de error visuales
        Object.keys(RULES).forEach(id => {
          const field = getField(id);
          field?.classList.remove('border-red-400');
          field?.classList.add('border-gray-300');
        });
        successBox.classList.add('show');
        successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      console.error('[RECOVEN Form]', err);
      errorBox.classList.add('show');
      errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
      submitBtn.disabled   = false;
      btnLabel.textContent = 'Enviar solicitud';
      submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
    }
  });
}
