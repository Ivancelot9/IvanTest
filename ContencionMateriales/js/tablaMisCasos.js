/**
 * Script para paginar, filtrar y resaltar las tablas de casos.
 * Soporta dos tablas distintas con estructura variable:
 * - #historial: muestra Folio, Fecha, Estatus
 * - #historial-casos: muestra Folio, Fecha, Estatus, Responsable, Terciaria
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

    // ─── Configuración personalizada por tabla ─────────────────────────────
    const config = {
        tieneEstatus: false,
        tieneResponsable: false,
        tieneTerciaria: false
    };

    if (idContenedor === '#historial') {
        config.tieneEstatus = true;
    } else if (idContenedor === '#historial-casos') {
        config.tieneEstatus = true;
        config.tieneResponsable = true;
        config.tieneTerciaria = true;
    }

    // ─── Capturar las filas originales UNA SOLA VEZ ───────────────────────
    const filasIniciales = Array.from(tbody.querySelectorAll('tr'));

    // ─── Helpers ───────────────────────────────────────────────────────────
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

    // ─── Filtro activo según columna seleccionada ──────────────────────────
    function filasFiltradas() {
        const term = inpFilt.value.trim().toLowerCase();
        let idx = 0;
        if (selFilt.value === 'folio') idx = 0;
        else if (selFilt.value === 'fecha') idx = 1;

        return filasIniciales.filter(tr => {
            let txt = tr.cells[idx].textContent.trim();
            if (selFilt.value === 'fecha') {
                txt = formatearFecha(txt);
            }
            return txt.toLowerCase().includes(term);
        });
    }

    // ─── Repinta la página actual con filas visibles ───────────────────────
    function renderizar() {
        const filtr   = filasFiltradas();
        const total   = Math.max(1, Math.ceil(filtr.length / filasPorPagina));
        if (paginaActual > total) paginaActual = total;

        const inicio  = (paginaActual - 1) * filasPorPagina;
        const fin     = inicio + filasPorPagina;

        tbody.innerHTML = '';
        filtr.slice(inicio, fin).forEach(trOrig => {
            const tr = trOrig.cloneNode(true);
            const cells = tr.cells;

            // FOLIO (columna 0)
            if (selFilt.value === 'folio') {
                cells[0].innerHTML = resaltar(cells[0].textContent.trim(), inpFilt.value.trim());
            }

            // FECHA (columna 1)
            {
                const raw = cells[1].textContent.trim();
                const fmt = formatearFecha(raw);
                if (selFilt.value === 'fecha') {
                    cells[1].innerHTML = resaltar(fmt, inpFilt.value.trim());
                } else {
                    cells[1].textContent = fmt;
                }
            }

            // ESTATUS (columna 2 si existe)
            if (config.tieneEstatus && cells[2]) {
                cells[2].textContent = cells[2].textContent.trim();
            }

            // RESPONSABLE (columna 3 si existe)
            if (config.tieneResponsable && cells[3]) {
                cells[3].textContent = cells[3].textContent.trim();
            }

            // TERCIARIA (columna 4 si existe)
            if (config.tieneTerciaria && cells[4]) {
                cells[4].textContent = cells[4].textContent.trim();
            }

            tbody.appendChild(tr);
        });

        btnPrev.disabled = paginaActual === 1;
        btnNext.disabled = paginaActual === total;
        indicador.textContent = `Página ${paginaActual} de ${total}`;
    }

    // ─── Filtro y paginación interactiva ───────────────────────────────────
    inpFilt.addEventListener('input', () => { paginaActual = 1; renderizar(); });
    selFilt.addEventListener('change', () => { paginaActual = 1; renderizar(); });
    btnPrev .addEventListener('click', () => { if (paginaActual > 1) { paginaActual--; renderizar(); } });
    btnNext .addEventListener('click', () => { paginaActual++; renderizar(); });

    // ─── Delegación de evento para mostrar descripción ─────────────────────
    cont.addEventListener('click', e => {
        const btn = e.target.closest('button.show-desc');
        if (!btn) return;
        const folio = btn.closest('tr').querySelector('td').textContent.trim();
        if (window.mostrarModalDescripcion) {
            window.mostrarModalDescripcion(parseInt(folio, 10));
        }
    });

    // ─── Render inicial ────────────────────────────────────────────────────
    renderizar();
}

// Inicia ambas tablas al cargar
document.addEventListener('DOMContentLoaded', () => {
    inicializarTablaCasos('#historial');
    inicializarTablaCasos('#historial-casos');
});
