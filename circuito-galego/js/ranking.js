/* ============================================
   RANKING.JS — LÓGICA DE LA PÁGINA DE RANKING
   Circuito Galego de Futevôlei 2026
   ============================================ */

// Estado actual de filtros
let categoriaActiva = "todas";
let textoBusqueda = "";
let datosRanking = [];

/**
 * Carga y renderiza el ranking desde Google Sheets.
 */
async function cargarRanking() {
  const contenedor = document.getElementById("tablaRankingWrap");
  if (!contenedor) return;

  mostrarCargando(contenedor, "Cargando ranking...");

  try {
    const datos = await fetchCSV(SHEETS.ranking);

    if (!datos || datos.length === 0) {
      mostrarVacio(contenedor, "No hay datos de ranking disponibles todavía.");
      return;
    }

    datosRanking = datos;
    renderizarRanking();
    actualizarHora("horaActualizacion");

  } catch (error) {
    mostrarError(contenedor, "No se pudo cargar el ranking.");
    console.error("Error en cargarRanking:", error);
  }
}

/**
 * Filtra los datos de ranking según categoría y búsqueda activas,
 * y renderiza la tabla.
 */
function renderizarRanking() {
  const contenedor = document.getElementById("tablaRankingWrap");
  if (!contenedor) return;

  // Filtrar por categoría
  let filtrados = datosRanking.filter(jugador => {
    if (categoriaActiva !== "todas") {
      const cat = (jugador.categoria || "").toLowerCase();
      if (cat !== categoriaActiva.toLowerCase()) return false;
    }
    return true;
  });

  // Filtrar por búsqueda
  if (textoBusqueda.trim() !== "") {
    const busq = normalizar(textoBusqueda.trim());
    filtrados = filtrados.filter(jugador => {
      const nombre = normalizar(jugador.jugador || "");
      const club = normalizar(jugador.club || "");
      return nombre.includes(busq) || club.includes(busq);
    });
  }

  // Ordenar por total descendente
  filtrados.sort((a, b) => {
    const totalA = parseInt(a.total) || 0;
    const totalB = parseInt(b.total) || 0;
    return totalB - totalA;
  });

  if (filtrados.length === 0) {
    mostrarVacio(contenedor, "No se encontraron jugadores con ese filtro.");
    return;
  }

  // Renderizar tabla
  const filas = filtrados.map((jugador, indice) => {
    const posicion = indice + 1;
    const posClass = posicion <= 3 ? `pos-${posicion}` : "";

    const e1 = jugador.etapa_1 || "0";
    const e2 = jugador.etapa_2 || "0";
    const e3 = jugador.etapa_3 || "0";
    const total = parseInt(e1) + parseInt(e2) + parseInt(e3) || parseInt(jugador.total) || 0;

    return `
      <tr>
        <td class="pos ${posClass}">${posicion <= 3 ? getMedalla(posicion) : posicion}</td>
        <td>
          <div class="jugador-nombre">${escaparHTML(jugador.jugador || "—")}</div>
          <div class="jugador-club">${escaparHTML(jugador.club || "—")}</div>
        </td>
        <td>${badgeCategoria(jugador.categoria || "—")}</td>
        <td class="puntos-etapa centrado">${e1 !== "0" ? e1 : "—"}</td>
        <td class="puntos-etapa centrado">${e2 !== "0" ? e2 : "—"}</td>
        <td class="puntos-etapa centrado">${e3 !== "0" ? e3 : "—"}</td>
        <td class="puntos-total centrado">${total}</td>
      </tr>
    `;
  }).join("");

  contenedor.innerHTML = `
    <div class="tabla-wrap">
      <div class="tabla-scroll">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Jugador / Club</th>
              <th>Categoría</th>
              <th class="centrado">Etapa 1</th>
              <th class="centrado">Etapa 2</th>
              <th class="centrado">Etapa 3</th>
              <th class="centrado">Total</th>
            </tr>
          </thead>
          <tbody>
            ${filas}
          </tbody>
        </table>
      </div>
    </div>
    <div class="indicador-actualizacion">
      <div class="dot"></div>
      <span id="horaActualizacion">—</span>
      <span>· Actualización automática cada 30s</span>
    </div>
  `;

  // Actualizar contador
  const contador = document.getElementById("contadorJugadores");
  if (contador) {
    contador.textContent = `${filtrados.length} jugador${filtrados.length !== 1 ? "es" : ""}`;
  }

  actualizarHora("horaActualizacion");
}

/** Devuelve emoji medalla para top 3 */
function getMedalla(pos) {
  const medallas = { 1: "🥇", 2: "🥈", 3: "🥉" };
  return medallas[pos] || pos;
}

/** Escapa HTML para evitar XSS */
function escaparHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

/**
 * Inicializa los filtros de categoría.
 */
function initFiltrosCategoría() {
  const botones = document.querySelectorAll("[data-filtro-cat]");

  botones.forEach(btn => {
    btn.addEventListener("click", () => {
      categoriaActiva = btn.dataset.filtroCat;

      // Actualizar estado visual de botones
      botones.forEach(b => b.classList.remove("activo"));
      btn.classList.add("activo");

      renderizarRanking();
    });
  });
}

/**
 * Inicializa el buscador de jugadores.
 */
function initBuscador() {
  const input = document.getElementById("buscadorJugador");
  if (!input) return;

  input.addEventListener("input", () => {
    textoBusqueda = input.value;
    renderizarRanking();
  });
}

/**
 * Punto de entrada: se llama al cargar la página ranking.html
 */
function initRanking() {
  initMenuMovil();
  marcarNavActivo();
  initFiltrosCategoría();
  initBuscador();

  // Carga inicial
  cargarRanking();

  // Actualización automática cada 30 segundos
  setInterval(cargarRanking, CONFIG.intervaloRanking);
}

// Iniciar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", initRanking);
