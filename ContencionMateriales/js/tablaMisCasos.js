/**
 * Paginador + filtro de tabla de casos.
 * Reformatea fecha YYYY-MM-DD → DD-MM-YYYY.
 * Devuelve un objeto con renderizar() y addRow(trElement).
 */
function inicializarTablaCasos(idContenedor) {
    const filasPorPagina = 5;
    let paginaActual = 1;
    const cont = document.querySelector(idContenedor);
    if (!cont) return null;

    const tbody     = cont.querySelector('.cases-table tbody');
    const btnPrev   = cont.querySelector('button[id$="-prev"]');
    const btnNext   = cont.querySelector('button[id$="-next"]');
    const indicador = cont.querySelector('span[id$="-page-indicator"]');
    const selFilt   = cont.querySelector('select[id$="-filter-column"]');
    const inpFilt   = cont.querySelector('input[id$="-filter-input"]');

    // 1) Capturamos todas las filas iniciales UNA sola vez:
    const filasIniciales = Array.from(tbody.querySelectorAll('tr'));

    // ── Helpers ────────────────────────────────────────────────────────
    function escapeRegExp(s) {
        return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    function resaltar(txt, term) {
        if (!term) return txt;
        return txt.replace(
            new RegExp(`(${escapeRegExp(term)})`, 'gi'),
            '<mark>$1</mark>'
        );
    }
    function formatearFecha(iso) {
        const [año, mes, día] = iso.split('-');
        return (día && mes && año) ? `${día}-${mes}-${año}` : iso;
    }

    // 2) Filtrar sobre el array fijo
    function filasFiltradas() {
        const term = inpFilt.value.trim().toLowerCase();
        const idx  = selFilt.value === 'folio' ? 0 : 1;
        return filasIniciales.filter(tr => {
            let txt = tr.cells[idx].textContent.trim();
            if (selFilt.value === 'fecha') txt = formatearFecha(txt);
            return txt.toLowerCase().includes(term);
        });
    }

    // 3) Renderizar la página actual
    function renderizar() {
        const filtr  = filasFiltradas();
        const total  = Math.max(1, Math.ceil(filtr.length / filasPorPagina));
        if (paginaActual > total) paginaActual = total;

        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin    = inicio + filasPorPagina;

        tbody.innerHTML = '';
        filtr.slice(inicio, fin).forEach(trOrig => {
            const tr = trOrig.cloneNode(true);

            // Formatear/resaltar FOLIO
            if (selFilt.value === 'folio') {
                const c = tr.cells[0];
                c.innerHTML = resaltar(c.textContent.trim(), inpFilt.value.trim());
            }

            // Formatear/resaltar FECHA
            {
                const c   = tr.cells[1];
                const raw = c.textContent.trim();
                const fmt = formatearFecha(raw);
                if (selFilt.value === 'fecha') {
                    c.innerHTML = resaltar(fmt, inpFilt.value.trim());
                } else {
                    c.textContent = fmt;
                }
            }

            tbody.appendChild(tr);
        });

        btnPrev.disabled   = paginaActual === 1;
        btnNext.disabled   = paginaActual === total;
        indicador.textContent = `Página ${paginaActual} de ${total}`;
    }

    // 4) Listeners
    inpFilt.addEventListener('input', () => { paginaActual = 1; renderizar(); });
    selFilt.addEventListener('change', () => { paginaActual = 1; renderizar(); });
    btnPrev.addEventListener('click', () => {
        if (paginaActual > 1) { paginaActual--; renderizar(); }
    });
    btnNext.addEventListener('click', () => {
        paginaActual++; renderizar();
    });

    // 5) API pública para añadir UNA fila al array y re-renderizar:
    function addRow(trElement) {
        filasIniciales.unshift(trElement);
        paginaActual = 1;
        renderizar();
    }

    // 6) Primer render
    renderizar();

    // 7) Devolver la API
    return { renderizar, addRow };
}

// ——— Inicialización ———
document.addEventListener('DOMContentLoaded', () => {
    // guardamos la instancia para usar después en validacionesCasos.js
    window.historialPaginador      = inicializarTablaCasos('#historial');
    window.historialCasosPaginador = inicializarTablaCasos('#historial-casos');
});
