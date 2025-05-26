/**
 * Script reutilizable para paginar, filtrar y resaltar una tabla de casos.
 * Reformatea la fecha de YYYY-MM-DD a DD-MM-YYYY al mostrar y al filtrar.
 *
 * Uso:
 *   inicializarTablaCasos('#historial');
 *   inicializarTablaCasos('#historial-casos');
 */
function inicializarTablaCasos(idContenedor) {
    const filasPorPagina = 5;
    let paginaActual = 1;
    const contenedor = document.querySelector(idContenedor);
    if (!contenedor) return;

    const tbody       = contenedor.querySelector('.cases-table tbody');
    const btnPrev     = contenedor.querySelector('button[id$="-prev"]');
    const btnNext     = contenedor.querySelector('button[id$="-next"]');
    const indicador   = contenedor.querySelector('span[id$="-page-indicator"]');
    const selFiltro   = contenedor.querySelector('select[id$="-filter-column"]');
    const inputFiltro = contenedor.querySelector('input[id$="-filter-input"]');

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
        // iso = "2025-05-26"
        const [año, mes, día] = iso.split('-');
        if (!año || !mes || !día) return iso;
        return `${día}-${mes}-${año}`;
    }

    // Toma *siempre* las filas actuales del DOM
    function obtenerFilasRaw() {
        return Array.from(tbody.querySelectorAll('tr'));
    }

    // Filtra (ya sea por folio o por la fecha formateada)
    function filasFiltradas() {
        const term = inputFiltro.value.trim().toLowerCase();
        const idx  = selFiltro.value === 'folio' ? 0 : 1;
        return obtenerFilasRaw().filter(tr => {
            let txt = tr.cells[idx].textContent.trim();
            if (selFiltro.value === 'fecha') {
                txt = formatearFecha(txt);
            }
            return txt.toLowerCase().includes(term);
        });
    }

    // Renderiza la “página” actual
    function renderizar() {
        const filtr = filasFiltradas();
        const total = Math.max(1, Math.ceil(filtr.length / filasPorPagina));
        if (paginaActual > total) paginaActual = total;

        const start = (paginaActual - 1) * filasPorPagina;
        const end   = start + filasPorPagina;

        // Limpia y dibuja sólo el slice correspondiente
        tbody.innerHTML = '';
        filtr.slice(start, end).forEach(tr => {
            const clon = tr.cloneNode(true);

            // Formatea y resalta el folio si toca
            if (selFiltro.value === 'folio') {
                const c = clon.cells[0];
                c.innerHTML = resaltar(c.textContent.trim(), inputFiltro.value.trim());
            }

            // Formatea y resalta la fecha
            {
                const fcell = clon.cells[1];
                const raw   = fcell.textContent.trim();      // "2025-05-26"
                const fmt   = formatearFecha(raw);           // "26-05-2025"
                if (selFiltro.value === 'fecha') {
                    fcell.innerHTML = resaltar(fmt, inputFiltro.value.trim());
                } else {
                    fcell.textContent = fmt;
                }
            }

            tbody.appendChild(clon);
        });

        btnPrev.disabled   = paginaActual === 1;
        btnNext.disabled   = paginaActual === total;
        indicador.textContent = `Página ${paginaActual} de ${total}`;
    }

    // Eventos
    inputFiltro.addEventListener('input', () => { paginaActual = 1; renderizar(); });
    selFiltro.addEventListener('change', () => { paginaActual = 1; renderizar(); });
    btnPrev.addEventListener('click', () => { if (paginaActual > 1) { paginaActual--; renderizar(); } });
    btnNext.addEventListener('click', () => { paginaActual++; renderizar(); });

    // Primer render
    renderizar();
}

// Inicializa ambas tablas cuando cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    inicializarTablaCasos('#historial');
    inicializarTablaCasos('#historial-casos');
});
