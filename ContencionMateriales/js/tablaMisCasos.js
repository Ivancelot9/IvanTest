/**
 * Script reutilizable para paginar, filtrar y resaltar una tabla de casos.
 * Además reformatea la fecha de YYYY-MM-DD a DD-MM-YYYY.
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

    // 1) Capturamos TODAS las filas originales en un array
    const todasFilasOriginales = Array.from(cuerpoTabla.querySelectorAll('tr'));

    // 2) Helpers para _escape_ y resaltar
    function escapeRegExp(s) {
        return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    function resaltarTexto(texto, termino) {
        if (!termino) return texto;
        const re = new RegExp(`(${escapeRegExp(termino)})`, 'gi');
        return texto.replace(re, '<mark>$1</mark>');
    }

    // 3) Reformatea "YYYY-MM-DD" → "DD-MM-YYYY"
    function formatearFecha(iso) {
        const partes = iso.split('-');
        if (partes.length !== 3) return iso;
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }

    // 4) Devuelve el array filtrado según el término y la columna
    function filasFiltradas() {
        const term = inputFiltro.value.trim().toLowerCase();
        const idx  = selFiltro.value === 'folio' ? 0 : 1;
        return todasFilasOriginales.filter(tr =>
            tr.cells[idx].textContent.trim().toLowerCase().includes(term)
        );
    }

    // 5) Renderiza la página actual (slice + highlight + fecha formateada)
    function renderizar() {
        const filtr = filasFiltradas();
        const total = Math.ceil(filtr.length / filasPorPagina) || 1;
        if (paginaActual > total) paginaActual = total;

        const start = (paginaActual - 1) * filasPorPagina;
        const end   = start + filasPorPagina;

        cuerpoTabla.innerHTML = '';
        filtr.slice(start, end).forEach(tr => {
            const clon = tr.cloneNode(true);

            // Folio
            const folioCel = clon.cells[0];
            if (selFiltro.value === 'folio') {
                folioCel.innerHTML = resaltarTexto(folioCel.textContent.trim(), inputFiltro.value.trim());
            }

            // Fecha
            const fechaCel = clon.cells[1];
            const raw = fechaCel.textContent.trim();
            const formatted = formatearFecha(raw);
            if (selFiltro.value === 'fecha') {
                fechaCel.innerHTML = resaltarTexto(formatted, inputFiltro.value.trim());
            } else {
                fechaCel.textContent = formatted;
            }

            cuerpoTabla.appendChild(clon);
        });

        // Actualiza controles
        btnPrev.disabled   = paginaActual === 1;
        btnNext.disabled   = paginaActual === total;
        indicador.textContent = `Página ${paginaActual} de ${total}`;
    }

    // 6) Eventos
    inputFiltro.addEventListener('input', () => { paginaActual = 1; renderizar(); });
    selFiltro.addEventListener('change', () => { paginaActual = 1; renderizar(); });
    btnPrev.addEventListener('click', () => {
        if (paginaActual > 1) { paginaActual--; renderizar(); }
    });
    btnNext.addEventListener('click', () => {
        paginaActual++; renderizar();
    });

    // 7) Primer render
    renderizar();
}

// ——— Inicialización ———
document.addEventListener('DOMContentLoaded', () => {
    inicializarTablaCasos('#historial');
    inicializarTablaCasos('#historial-casos');
});
