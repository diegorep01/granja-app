/* ── Configuración ── */
// Pega aquí la URL de tu Google Apps Script después de desplegarlo
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyvafoDPdBW4ytuw_UC8XJ5pXJb_CFwbknmeqg8XM6JoAgHi2fKKBNvdROEJbVGF9eK/exec';

/* ── Utilidades generales ── */

function fechaHoy() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function horaAhora() {
  return new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

// Envía datos al Apps Script (Google Sheets)
async function enviarDatos(tipo, datos) {
  const payload = { tipo, fecha: fechaHoy(), hora: horaAhora(), ...datos };
  const resp = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' }, // evita preflight CORS
    body: JSON.stringify(payload),
  });
  if (!resp.ok) throw new Error('Error de red: ' + resp.status);
  const json = await resp.json();
  if (json.error) throw new Error(json.error);
  return json;
}

// Muestra pantalla de éxito y oculta el formulario
function mostrarExito(contenedorId, exitoId) {
  document.getElementById(contenedorId).style.display = 'none';
  document.getElementById(exitoId).style.display = 'block';
}

// Muestra pantalla de error
function mostrarError(errorId, mensaje) {
  const el = document.getElementById(errorId);
  el.querySelector('p').textContent = mensaje || 'No se pudo enviar. Intenta de nuevo.';
  el.style.display = 'block';
}

/* ── Navegación multipaso ── */

function initPasos(totalPasos) {
  let pasoActual = 1;

  function mostrar(n) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('paso-' + n);
    if (el) el.classList.add('active');
    const fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = (n / totalPasos * 100) + '%';
    const lbl = document.getElementById('step-label');
    if (lbl) lbl.textContent = `Paso ${n} de ${totalPasos}`;
    pasoActual = n;
  }

  function siguiente() {
    if (pasoActual < totalPasos) mostrar(pasoActual + 1);
  }

  function anterior() {
    if (pasoActual > 1) mostrar(pasoActual - 1);
  }

  mostrar(1);
  return { siguiente, anterior, paso: () => pasoActual };
}

/* ── Lógica de venta: cálculo de merma ── */

function calcularVenta() {
  const kg       = parseFloat(document.getElementById('v-peso')?.value)   || 0;
  const merma    = parseFloat(document.getElementById('v-merma')?.value)  || 0;
  const precio   = parseFloat(document.getElementById('v-precio')?.value) || 0;
  const pesoNeto = kg * (1 - merma / 100);
  const total    = pesoNeto * precio;

  const elNeto  = document.getElementById('v-peso-neto');
  const elTotal = document.getElementById('v-total');
  const elDet   = document.getElementById('v-detalle');
  const elRes   = document.getElementById('resultado-venta');

  if (elNeto)  elNeto.textContent  = pesoNeto.toFixed(1) + ' kg';
  if (elTotal) elTotal.textContent = 'S/ ' + total.toFixed(2);
  if (elDet)   elDet.textContent   = `${kg} kg × (1 − ${merma}%) × S/${precio}/kg`;
  if (elRes && kg > 0 && precio > 0) elRes.style.display = 'block';
}
