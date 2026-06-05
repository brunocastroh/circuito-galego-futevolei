/* ============================================
   CONFIG.JS — CIRCUITO GALEGO DE FUTEVÔLEI
   ============================================
   INSTRUCCIONES:
   1. Abre tu Google Sheets
   2. Para cada pestaña: Archivo → Compartir → Publicar en la web
   3. Elige la pestaña, elige formato CSV, copia la URL
   4. Pega la URL en el campo correspondiente abajo
   ============================================ */

const SHEETS = {
  // Pestaña RANKING — lista de jugadores y puntos
  ranking: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-1HjO_G5D1kizpG38nRfd7EvFyAyzlzUIQnPJG2_WAJZe-3wd4fjnd-0siHQztHo1xfUbiGvcKsga/pub?gid=1143178851&single=true&output=csv",

  // Pestaña PARTIDOS — resultados de grupos
  partidos: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-1HjO_G5D1kizpG38nRfd7EvFyAyzlzUIQnPJG2_WAJZe-3wd4fjnd-0siHQztHo1xfUbiGvcKsga/pub?gid=1696637490&single=true&output=csv",

  // Pestaña ETAPAS — información de cada etapa
  etapas: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-1HjO_G5D1kizpG38nRfd7EvFyAyzlzUIQnPJG2_WAJZe-3wd4fjnd-0siHQztHo1xfUbiGvcKsga/pub?gid=0&single=true&output=csv",

  // Pestaña CUADROS — cuadro final / eliminatorias
  cuadros: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-1HjO_G5D1kizpG38nRfd7EvFyAyzlzUIQnPJG2_WAJZe-3wd4fjnd-0siHQztHo1xfUbiGvcKsga/pub?gid=1578379329&single=true&output=csv",

  // Pestaña JUGADORES — lista de jugadores inscritos
  jugadores: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-1HjO_G5D1kizpG38nRfd7EvFyAyzlzUIQnPJG2_WAJZe-3wd4fjnd-0siHQztHo1xfUbiGvcKsga/pub?gid=1337948286&single=true&output=csv"
};

// Intervalo de actualización (milisegundos)
const CONFIG = {
  intervaloRanking: 30000,    // 30 segundos
  intervaloPartidos: 15000,   // 15 segundos
  temporada: "2026",
  nombreCircuito: "Circuito Galego de Futevôlei"
};
