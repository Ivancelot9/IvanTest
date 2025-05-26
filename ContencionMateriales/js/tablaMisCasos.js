/**
 * Paginador + filtro de tabla de casos.
 * Reformatea fecha YYYY-MM-DD → DD-MM-YYYY.
 * Y delega el click de "Mostrar descripción" para que siga funcionando
 * incluso después de repintar la tabla al paginar.
 */
function inicializarTablaCasos(idContenedor) {
    const filasPorPagina = 5;
    let paginaActual = 1;
    const cont = document.querySelector(idContenedor);
    if (!cont) return;

    const tbody     = cont.querySelector('.cases-table tbody');
    const btnPrev   = cont.querySelector('button[id$="-prev"]');
    const btnNext   = cont.querySelector('button[id$="-next"]');
    const indicador = cont.querySelector('span[id$="-page-indicator"]');
    const selFilt   = cont.querySelector('select[id$="-filter-column"]');
    const inpFilt   = cont.querySelector('input[id$="-filter-input"]');

    // ─── Capturamos UNA VEZ todas las filas originales ────────────────────────
    const filasIniciales = Array.from(tbody.querySelectorAll('tr'));

    // ─── Helpers ───────────────────────────────────────────────────────────────
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

    // ─── Devuelve el array de filas que pasan el filtro ────────────────────────
    function filasFiltradas() {
        const term = inpFilt.value.trim().toLowerCase();
        const idx  = selFilt.value === 'folio' ? 0 : 1;
        return filasIniciales.filter(tr => {
            let txt = tr.cells[idx].textContent.trim();
            if (selFilt.value === 'fecha') {
                txt = formatearFecha(txt);
            }
            return txt.toLowerCase().includes(term);
        });
    }

    // ─── Repinta la página actual ─────────────────────────────────────────────
    function renderizar() {
        const filtr   = filasFiltradas();
        const total   = Math.max(1, Math.ceil(filtr.length / filasPorPagina));
        if (paginaActual > total) paginaActual = total;

        const inicio  = (paginaActual - 1) * filasPorPagina;
        const fin     = inicio + filasPorPagina;

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

    // ─── Eventos de paginación + filtro ──────────────────────────────────────
    inpFilt.addEventListener('input', () => { paginaActual = 1; renderizar(); });
    selFilt.addEventListener('change', () => { paginaActual = 1; renderizar(); });
    btnPrev .addEventListener('click', () => { if (paginaActual > 1) { paginaActual--; renderizar(); } });
    btnNext .addEventListener('click', () => { paginaActual++; renderizar(); });

    // ─── Delegación del click en ".show-desc" ────────────────────────────────
    cont.addEventListener('click', e => {
        const btn = e.target.closest('button.show-desc');
        if (!btn) return;
        const folio = btn.closest('tr').querySelector('td').textContent.trim();
        // lanzamos la función que abre el modal
        window.mostrarModalDescripcion(parseInt(folio, 10));
    });

    // ─── Primer render ───────────────────────────────────────────────────────
    renderizar();
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarTablaCasos('#historial');
    inicializarTablaCasos('#historial-casos');
});
