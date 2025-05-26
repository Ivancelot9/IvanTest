/**
 * Paginador + filtro de tabla de casos.
 * Reformatea fecha YYYY-MM-DD → DD-MM-YYYY.
 */
function inicializarTablaCasos(idContenedor) {
    const filasPorPagina = 5;
    let paginaActual = 1;
    const cont = document.querySelector(idContenedor);
    if (!cont) return;

    const tbody    = cont.querySelector('.cases-table tbody');
    const btnPrev  = cont.querySelector('button[id$="-prev"]');
    const btnNext  = cont.querySelector('button[id$="-next"]');
    const indicador= cont.querySelector('span[id$="-page-indicator"]');
    const selFilt  = cont.querySelector('select[id$="-filter-column"]');
    const inpFilt  = cont.querySelector('input[id$="-filter-input"]');

    // ─── 1) Capturamos exactamente UNA vez todas las filas iniciales:
    const filasIniciales = Array.from(tbody.querySelectorAll('tr'));

    // ─── Helpers ────────────────────────────────────────────────────────────────
    function escapeRegExp(s) {
        return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    function resaltar(txt, term) {
        if (!term) return txt;
        return txt.replace(new RegExp(`(${escapeRegExp(term)})`, 'gi'),
            '<mark>$1</mark>');
    }
    function formatearFecha(iso) {
        const [año, mes, día] = iso.split('-');
        return (día && mes && año) ? `${día}-${mes}-${año}` : iso;
    }

    // ─── 2) Filtrado sobre el array fijo
    function filasFiltradas() {
        const term = inpFilt.value.trim().toLowerCase();
        const idx  = selFilt.value === 'folio' ? 0 : 1;

        return filasIniciales.filter(tr => {
            let txt = tr.cells[idx].textContent.trim();
            if (selFilt.value === 'fecha') txt = formatearFecha(txt);
            return txt.toLowerCase().includes(term);
        });
    }

    // ─── 3) Renderizado de la página actual
    function renderizar() {
        const filtr   = filasFiltradas();
        const total   = Math.max(1, Math.ceil(filtr.length / filasPorPagina));
        if (paginaActual > total) paginaActual = total;

        const inicio  = (paginaActual - 1) * filasPorPagina;
        const fin     = inicio + filasPorPagina;

        // Limpio y pinto sólo ese slice
        tbody.innerHTML = '';
        filtr.slice(inicio, fin).forEach(trOrig => {
            const tr = trOrig.cloneNode(true);

            // Formateo / resalto FOLIO
            if (selFilt.value === 'folio') {
                const cell = tr.cells[0];
                cell.innerHTML = resaltar(cell.textContent.trim(), inpFilt.value.trim());
            }

            // Formateo / resalto FECHA
            {
                const cell = tr.cells[1];
                const raw  = cell.textContent.trim();
                const fmt  = formatearFecha(raw);
                if (selFilt.value === 'fecha') {
                    cell.innerHTML = resaltar(fmt, inpFilt.value.trim());
                } else {
                    cell.textContent = fmt;
                }
            }

            tbody.appendChild(tr);
        });

        btnPrev.disabled = paginaActual === 1;
        btnNext.disabled = paginaActual === total;
        indicador.textContent = `Página ${paginaActual} de ${total}`;
    }

    // ─── 4) Eventos
    inpFilt.addEventListener('input', () => { paginaActual = 1; renderizar(); });
    selFilt.addEventListener('change', () => { paginaActual = 1; renderizar(); });
    btnPrev .addEventListener('click', () => { if (paginaActual>1) { paginaActual--; renderizar(); } });
    btnNext .addEventListener('click', () => { paginaActual++; renderizar(); });

    // ─── 5) Primer render
    renderizar();
}

// Inicializa al cargar
document.addEventListener('DOMContentLoaded', () => {
    inicializarTablaCasos('#historial');
    inicializarTablaCasos('#historial-casos');
});
