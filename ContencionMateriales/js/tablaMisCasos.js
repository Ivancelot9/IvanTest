/**
 * Script reutilizable para paginar, filtrar y resaltar una tabla de casos.
 * Además reformatea la fecha de YYYY-MM-DD a DD-MM-YYYY al mostrar y al filtrar.
 */
function inicializarTablaCasos(idContenedor) {
    const filasPorPagina = 5;
    let paginaActual = 1;
    const contenedor = document.querySelector(idContenedor);
    if (!contenedor) return;

    const cuerpoTabla  = contenedor.querySelector('.cases-table tbody');
    const btnPrev      = contenedor.querySelector('button[id$="-prev"]');
    const btnNext      = contenedor.querySelector('button[id$="-next"]');
    const indicador    = contenedor.querySelector('span[id$="-page-indicator"]');
    const selFiltro    = contenedor.querySelector('select[id$="-filter-column"]');
    const inputFiltro  = contenedor.querySelector('input[id$="-filter-input"]');

    // Capturamos todas las filas originales
    const todasFilasOriginales = Array.from(cuerpoTabla.querySelectorAll('tr'));

    // Helpers
    function escapeRegExp(s) {
        return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    function resaltar(texto, term) {
        if (!term) return texto;
        const re = new RegExp(`(${escapeRegExp(term)})`, 'gi');
        return texto.replace(re, '<mark>$1</mark>');
    }
    function formatearFecha(iso) {
        const p = iso.split('-');
        if (p.length !== 3) return iso;
        return `${p[2]}-${p[1]}-${p[0]}`;
    }

    // Filtra usando el texto formateado cuando es fecha
    function filasFiltradas() {
        const term = inputFiltro.value.trim().toLowerCase();
        const idx  = selFiltro.value === 'folio' ? 0 : 1;
        return todasFilasOriginales.filter(tr => {
            let txt = tr.cells[idx].textContent.trim();
            if (selFiltro.value === 'fecha') {
                txt = formatearFecha(txt);
            }
            return txt.toLowerCase().includes(term);
        });
    }

    // Renderiza la página actual
    function renderizar() {
        const filtr = filasFiltradas();
        const total = Math.ceil(filtr.length / filasPorPagina) || 1;
        if (paginaActual > total) paginaActual = total;

        const start = (paginaActual - 1) * filasPorPagina;
        const end   = start + filasPorPagina;

        cuerpoTabla.innerHTML = '';
        filtr.slice(start, end).forEach(tr => {
            const clon = tr.cloneNode(true);

            // Formatear y resaltar FOLIO si es el caso
            if (selFiltro.value === 'folio') {
                const c = clon.cells[0];
                c.innerHTML = resaltar(c.textContent.trim(), inputFiltro.value.trim());
            }

            // Formatear y resaltar FECHA
            const fcell = clon.cells[1];
            const raw   = fcell.textContent.trim();
            const fmt   = formatearFecha(raw);
            if (selFiltro.value === 'fecha') {
                fcell.innerHTML = resaltar(fmt, inputFiltro.value.trim());
            } else {
                fcell.textContent = fmt;
            }

            cuerpoTabla.appendChild(clon);
        });

        btnPrev.disabled = paginaActual === 1;
        btnNext.disabled = paginaActual === total;
        indicador.textContent = `Página ${paginaActual} de ${total}`;
    }

    // Eventos
    inputFiltro.addEventListener('input', () => { paginaActual = 1; renderizar(); });
    selFiltro.addEventListener('change', () => { paginaActual = 1; renderizar(); });
    btnPrev .addEventListener('click', () => { if (paginaActual>1) { paginaActual--; renderizar(); } });
    btnNext .addEventListener('click', () => { paginaActual++; renderizar(); });

    // Inicio
    renderizar();
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarTablaCasos('#historial');
    inicializarTablaCasos('#historial-casos');
});
