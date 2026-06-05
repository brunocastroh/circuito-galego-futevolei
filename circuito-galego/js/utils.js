/* ============================================
   UTILS.JS — FUNCIONES COMPARTIDAS
   Circuito Galego de Futevôlei 2026
   ============================================ */

/**
 * Descarga un CSV desde una URL pública de Google Sheets
 * y lo convierte en un array de objetos.
 * @param {string} url - URL CSV de Google Sheets
 * @returns {Promise<Array>} - Array de objetos con los datos
 */
async function fetchCSV(url) {
  if (!url || url.startsWith("PEGA_AQUI")) {
    console.warn("URL no configurada:", url);
    return [];
  }

  try {
    // Añadimos timestamp para evitar caché
    const urlConTimestamp = url + "&t=" + Date.now();
    const response = await fetch(urlConTimestamp);

    if (!response.ok) {
      throw new Error("Error HTTP: " + response.status);
    }

    const texto = await response.text();
    return parsearCSV(texto);
  } catch (error) {
    console.error("Error cargando CSV:", error);
    return [];
  }
}

/**
 * Convierte texto CSV en array de objetos.
 * La primera fila se usa como cabecera (nombres de columnas).
 * @param {string} texto - Contenido CSV en texto
 * @returns {Array} - Array de objetos
 */
function parsearCSV(texto) {
  if (!texto || texto.trim() === "") return [];

  const lineas = texto.trim().split("\n");
  if (lineas.length < 2) return [];

  // Primera línea = cabeceras
  const cabeceras = parsearFilaCSV(lineas[0]);

  const datos = [];
  for (let i = 1; i < lineas.length; i++) {
    const linea = lineas[i].trim();
    if (!linea) continue;

    const valores = parsearFilaCSV(linea);
    const objeto = {};

    cabeceras.forEach((cabecera, indice) => {
      // Limpiamos espacios y comillas de los nombres de cabecera
      const clave = cabecera.trim().replace(/^"|"$/g, "").trim();
      const valor = valores[indice] !== undefined
        ? valores[indice].trim().replace(/^"|"$/g, "").trim()
        : "";
      objeto[clave] = valor;
    });

    // Solo añadimos filas que tengan al menos un campo con contenido
    if (Object.values(objeto).some(v => v !== "")) {
      datos.push(objeto);
    }
  }

  return datos;
}

/**
 * Parsea una fila CSV teniendo en cuenta campos entre comillas.
 * @param {string} linea - Una línea del CSV
 * @returns {Array<string>}
 */
function parsearFilaCSV(linea) {
  const resultado = [];
  let actual = "";
  let dentroComillas = false;

  for (let i = 0; i < linea.length; i++) {
    const char = linea[i];

    if (char === '"') {
      if (dentroComillas && linea[i + 1] === '"') {
        actual += '"';
        i++;
      } else {
        dentroComillas = !dentroComillas;
      }
    } else if (char === "," && !dentroComillas) {
      resultado.push(actual);
      actual = "";
    } else {
      actual += char;
    }
  }

  resultado.push(actual);
  return resultado;
}

/**
 * Formatea una fecha desde formato YYYY-MM-DD a dd/mm/YYYY
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {string}
 */
function formatearFecha(fecha) {
  if (!fecha) return "—";
  const partes = fecha.split("-");
  if (partes.length !== 3) return fecha;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

/**
 * Devuelve el HTML del badge de estado de un partido.
 * @param {string} estado - "pendiente", "en_directo" o "finalizado"
 * @returns {string} HTML string
 */
function badgeEstadoPartido(estado) {
  const mapa = {
    pendiente: { clase: "pendiente", texto: "Pendiente" },
    en_directo: { clase: "en_directo", texto: "EN DIRECTO" },
    finalizado: { clase: "finalizado", texto: "Finalizado" }
  };

  const info = mapa[estado] || mapa.pendiente;
  return `<span class="badge-partido ${info.clase}">${info.texto}</span>`;
}

/**
 * Devuelve HTML del badge de estado de etapa.
 * @param {string} estado
 * @returns {string}
 */
function badgeEstadoEtapa(estado) {
  const mapa = {
    proxima: { clase: "proxima", texto: "Próxima" },
    en_directo: { clase: "en_directo", texto: "En directo" },
    finalizada: { clase: "finalizada", texto: "Finalizada" }
  };

  const info = mapa[estado] || mapa.proxima;
  return `<span class="badge-estado ${info.clase}">${info.texto}</span>`;
}

/**
 * Devuelve HTML del badge de categoría.
 * @param {string} cat - "Pro" o "Iniciante"
 * @returns {string}
 */
function badgeCategoria(cat) {
  const clase = cat.toLowerCase() === "pro" ? "pro" : "iniciante";
  return `<span class="badge-cat ${clase}">${cat}</span>`;
}

/**
 * Muestra un mensaje de carga en un contenedor.
 * @param {HTMLElement} contenedor
 * @param {string} texto
 */
function mostrarCargando(contenedor, texto = "Cargando datos...") {
  contenedor.innerHTML = `
    <div class="estado-carga">
      <div class="spinner"></div>
      <span>${texto}</span>
    </div>
  `;
}

/**
 * Muestra un mensaje de error en un contenedor.
 * @param {HTMLElement} contenedor
 * @param {string} mensaje
 */
function mostrarError(contenedor, mensaje) {
  contenedor.innerHTML = `
    <div class="estado-error">
      ⚠️ ${mensaje}<br>
      <small>Comprueba que las URLs CSV están configuradas correctamente en config.js</small>
    </div>
  `;
}

/**
 * Muestra un mensaje de tabla vacía.
 * @param {HTMLElement} contenedor
 * @param {string} texto
 */
function mostrarVacio(contenedor, texto = "No hay datos disponibles.") {
  contenedor.innerHTML = `<div class="estado-vacio">📋 ${texto}</div>`;
}

/**
 * Actualiza el indicador de "última actualización".
 * @param {string} idElemento - ID del elemento a actualizar
 */
function actualizarHora(idElemento) {
  const el = document.getElementById(idElemento);
  if (!el) return;

  const ahora = new Date();
  const hora = ahora.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  el.textContent = "Actualizado: " + hora;
}

/**
 * Normaliza un texto para búsqueda (elimina tildes, pasa a minúsculas).
 * @param {string} texto
 * @returns {string}
 */
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Inicializa el menú móvil (hamburguesa).
 * Debe llamarse en cada página.
 */
function initMenuMovil() {
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("navPrincipal");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    nav.classList.toggle("abierto");
    const abierto = nav.classList.contains("abierto");
    toggle.setAttribute("aria-expanded", abierto);
  });

  // Cerrar al hacer click en un enlace
  nav.querySelectorAll("a").forEach(enlace => {
    enlace.addEventListener("click", () => {
      nav.classList.remove("abierto");
    });
  });
}

/**
 * Marca como activo el enlace de navegación correspondiente
 * a la página actual.
 */
function marcarNavActivo() {
  const pagina = window.location.pathname.split("/").pop() || "index.html";
  const enlaces = document.querySelectorAll(".nav a");

  enlaces.forEach(enlace => {
    const href = enlace.getAttribute("href");
    if (href === pagina) {
      enlace.classList.add("activo");
    }
  });
}
