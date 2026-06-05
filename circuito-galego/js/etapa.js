/* ============================================
   ETAPA.JS — LÓGICA DE LAS PÁGINAS DE ETAPA
   Circuito Galego de Futevôlei 2026
   ============================================ */

// El nombre de la etapa se define en cada página HTML
// Ejemplo: const ETAPA_ACTUAL = "Etapa 1";

let categoriaActivaEtapa = "todas";
let faseActiva = "todas";
let datosPartidos = [];
let datosCuadros = [];

/* ============================================
   PARTIDOS - FASE DE GRUPOS
   ============================================ */

async function cargarPartidos() {
  const contenedor = document.getElementById("tablaPartidosWrap");
  if (!contenedor) return;

  mostrarCargando(contenedor, "Cargando partidos...");

  try {
    const datos = await fetchCSV(SHEETS.partidos);

    // Filtrar solo los de esta etapa
    datosPartidos = datos.filter(p =>
      (p.etapa || "").trim() === ETAPA_ACTUAL
    );

    renderizarPartidos();
    actualizarHora("horaPartidos");

  } catch (error) {
    mostrarError(contenedor, "No se pudieron cargar los partidos.");
  }
}

function renderizarPartidos() {
  const contenedor = document.getElementById("tablaPartidosWrap");
  if (!contenedor) return;

  let filtrados = datosPartidos;

  if (categoriaActivaEtapa !== "todas") {
    filtrados = filtrados.filter(p =>
      (p.categoria || "").toLowerCase() === categoriaActivaEtapa.toLowerCase()
    );
  }

  if (faseActiva !== "todas") {
    filtrados = filtrados.filter(p =>
      (p.fase || "").toLowerCase() === faseActiva.toLowerCase()
    );
  }

  if (filtrados.length === 0) {
    mostrarVacio(contenedor, "No hay partidos con ese filtro.");
    return;
  }

  const filas = filtrados.map(p => {
    const ganador = p.ganador || "";
    const esA = ganador && ganador === p.equipo_a;
    const esB = ganador && ganador === p.equipo_b;
    const grupo = p.grupo ? `Grupo ${p.grupo}` : "—";

    return `
      <tr>
        <td>${badgeCategoria(p.categoria || "—")}</td>
        <td style="color:var(--gris-medio);font-size:0.82rem">${p.fase || "—"}</td>
        <td style="color:var(--gris-medio);font-size:0.82rem">${grupo}</td>
        <td class="${esA ? 'equipo-ganador' : ''}">${p.equipo_a || "—"}</td>
        <td class="marcador">${p.puntos_a || "—"} : ${p.puntos_b || "—"}</td>
        <td class="${esB ? 'equipo-ganador' : ''}">${p.equipo_b || "—"}</td>
        <td style="color:var(--verde-claro);font-size:0.85rem;font-weight:600">${ganador || "—"}</td>
        <td>${badgeEstadoPartido(p.estado || "pendiente")}</td>
      </tr>
    `;
  }).join("");

  contenedor.innerHTML = `
    <div class="tabla-wrap">
      <div class="tabla-scroll">
        <table>
          <thead>
            <tr>
              <th>Cat.</th>
              <th>Fase</th>
              <th>Grupo</th>
              <th>Equipo A</th>
              <th class="centrado">Marcador</th>
              <th>Equipo B</th>
              <th>Ganador</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>${filas}</tbody>
        </table>
      </div>
    </div>
    <div class="indicador-actualizacion">
      <div class="dot"></div>
      <span id="horaPartidos">—</span>
      <span>· Actualización cada 15s</span>
    </div>
  `;
  actualizarHora("horaPartidos");
}

/* ============================================
   CUADROS - ELIMINATORIAS
   ============================================ */

async function cargarCuadros() {
  const contenedor = document.getElementById("tablaCuadrosWrap");
  if (!contenedor) return;

  mostrarCargando(contenedor, "Cargando cuadro final...");

  try {
    const datos = await fetchCSV(SHEETS.cuadros);

    datosCuadros = datos.filter(c =>
      (c.etapa || "").trim() === ETAPA_ACTUAL
    );

    renderizarCuadros();

  } catch (error) {
    mostrarError(contenedor, "No se pudo cargar el cuadro final.");
  }
}

function renderizarCuadros() {
  const contenedor = document.getElementById("tablaCuadrosWrap");
  if (!contenedor) return;

  let filtrados = datosCuadros;

  if (categoriaActivaEtapa !== "todas") {
    filtrados = filtrados.filter(c =>
      (c.categoria || "").toLowerCase() === categoriaActivaEtapa.toLowerCase()
    );
  }

  if (filtrados.length === 0) {
    mostrarVacio(contenedor, "El cuadro final no está disponible todavía.");
    return;
  }

  const filas = filtrados.map(c => {
    const ganador = c.ganador || "";
    const esA = ganador && ganador === c.equipo_a;
    const esB = ganador && ganador === c.equipo_b;
    const pA = c.puntos_a || "";
    const pB = c.puntos_b || "";
    const marcador = (pA || pB) ? `${pA} — ${pB}` : "Pendiente";

    return `
      <tr>
        <td>${badgeCategoria(c.categoria || "—")}</td>
        <td style="font-weight:600;color:var(--amarelo)">${c.ronda || "—"}</td>
        <td style="color:var(--gris-medio);font-size:0.82rem">${c.partido || "—"}</td>
        <td class="${esA ? 'equipo-ganador' : ''}">${c.equipo_a || "—"}</td>
        <td class="marcador">${marcador}</td>
        <td class="${esB ? 'equipo-ganador' : ''}">${c.equipo_b || "—"}</td>
        <td style="color:var(--verde-claro);font-weight:600">${ganador || "—"}</td>
      </tr>
    `;
  }).join("");

  contenedor.innerHTML = `
    <div class="tabla-wrap">
      <div class="tabla-scroll">
        <table>
          <thead>
            <tr>
              <th>Cat.</th>
              <th>Ronda</th>
              <th>Partido</th>
              <th>Equipo A</th>
              <th class="centrado">Resultado</th>
              <th>Equipo B</th>
              <th>Ganador</th>
            </tr>
          </thead>
          <tbody>${filas}</tbody>
        </table>
      </div>
    </div>
  `;
}

/* ============================================
   FILTROS
   ============================================ */

function initFiltrosEtapa() {
  // Filtros de categoría
  document.querySelectorAll("[data-filtro-cat-etapa]").forEach(btn => {
    btn.addEventListener("click", () => {
      categoriaActivaEtapa = btn.dataset.filtroCatEtapa;
      document.querySelectorAll("[data-filtro-cat-etapa]").forEach(b => b.classList.remove("activo"));
      btn.classList.add("activo");
      renderizarPartidos();
      renderizarCuadros();
    });
  });

  // Filtros de fase
  document.querySelectorAll("[data-filtro-fase]").forEach(btn => {
    btn.addEventListener("click", () => {
      faseActiva = btn.dataset.filtroFase;
      document.querySelectorAll("[data-filtro-fase]").forEach(b => b.classList.remove("activo"));
      btn.classList.add("activo");
      renderizarPartidos();
    });
  });
}

/* ============================================
   INFO ETAPA DESDE SHEETS
   ============================================ */

async function cargarInfoEtapa() {
  try {
    const datos = await fetchCSV(SHEETS.etapas);
    const etapa = datos.find(e => (e.etapa || "").trim() === ETAPA_ACTUAL);
    if (!etapa) return;

    const estadoEl = document.getElementById("etapaEstado");
    const ciudadEl = document.getElementById("etapaCiudad");
    const fechaEl = document.getElementById("etapaFecha");
    const playaEl = document.getElementById("etapaPlaya");

    if (estadoEl) estadoEl.innerHTML = badgeEstadoEtapa(etapa.estado || "proxima");
    if (ciudadEl) ciudadEl.textContent = etapa.ciudad || "—";
    if (fechaEl) fechaEl.textContent = formatearFecha(etapa.fecha);
    if (playaEl) playaEl.textContent = etapa.playa || "—";

  } catch (e) {
    console.error("Error cargando info etapa:", e);
  }
}

/* ============================================
   INIT
   ============================================ */

async function initEtapa() {
  initMenuMovil();
  marcarNavActivo();
  initFiltrosEtapa();

  await Promise.all([
    cargarInfoEtapa(),
    cargarPartidos(),
    cargarCuadros()
  ]);

  // Actualización automática cada 15 segundos
  setInterval(async () => {
    await cargarPartidos();
    await cargarCuadros();
  }, CONFIG.intervaloPartidos);
}

document.addEventListener("DOMContentLoaded", initEtapa);
