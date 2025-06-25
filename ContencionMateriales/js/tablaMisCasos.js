// tablaMisCasos.js

// Mantiene los folios actualmente seleccionados
const selectedFolios = new Set();

/**
 * Script para paginar, filtrar y resaltar las tablas de casos.
 * Soporta dos tablas distintas con estructura variable:
 * - #historial: muestra Folio, Fecha, Descripción, Estatus
 * - #historial-casos: muestra Folio, Fecha, Descripción, Estatus, Responsable, Terciaria
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
        config.tieneEstatus   = true;
        config.idxDescripcion = 4;
        config.idxEstatus     = 5;
    } else if (idContenedor === '#historial-casos') {
        config.tieneEstatus     = true;
        config.tieneResponsable = true;
        config.tieneTerciaria   = true;
        config.idxDescripcion   = 6;
        config.idxEstatus       = 7;
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
        let idx = selFilt.value === 'folio' ? 2 : 3;
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
        const filtr = filasFiltradas();
        const total = Math.max(1, Math.ceil(filtr.length / filasPorPagina));
        if (paginaActual > total) paginaActual = total;

        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin    = inicio + filasPorPagina;

        tbody.innerHTML = '';
        filtr.slice(inicio, fin).forEach(trOrig => {
            const tr = trOrig.cloneNode(true);
            const cells = tr.cells;

            // Mantener estado real de selección
            const cb = tr.querySelector('.check-folio');
            if (cb) {
                cb.style.display = 'none';
                cb.checked       = selectedFolios.has(cb.value);
                cb.classList.remove('pulse-check');
            }

            // Folio
            if (selFilt.value === 'folio') {
                cells[2].innerHTML = resaltar(
                    cells[2].textContent.trim(),
                    inpFilt.value.trim()
                );
            }

            // Fecha
            {
                const raw = cells[3].textContent.trim();
                const fmt = formatearFecha(raw);
                cells[3].textContent = fmt;
                if (selFilt.value === 'fecha') {
                    cells[3].innerHTML = resaltar(fmt, inpFilt.value.trim());
                }
            }

            // Estatus
            if (config.tieneEstatus && cells[config.idxEstatus]) {
                cells[config.idxEstatus].textContent =
                    cells[config.idxEstatus].textContent.trim();
            }

            // Responsable y terciaria
            if (config.tieneResponsable && cells[2]) {
                cells[2].textContent = cells[2].textContent.trim();
            }
            if (config.tieneTerciaria && cells[3]) {
                cells[3].textContent = cells[3].textContent.trim();
            }

            tbody.appendChild(tr);
        });

        btnPrev.disabled = paginaActual === 1;
        btnNext.disabled = paginaActual === total;
        indicador.textContent = `Página ${paginaActual} de ${total}`;
    }

    // ─── Sincronizar Set con cambios de checkbox ──────────────────────────
    cont.addEventListener('change', e => {
        const cb = e.target;
        if (!cb.classList.contains('check-folio')) return;
        if (cb.checked) selectedFolios.add(cb.value);
        else           selectedFolios.delete(cb.value);
    });

    // ─── Interactividad ───────────────────────────────────────────────────
    inpFilt.addEventListener('input', () => { paginaActual = 1; renderizar(); });
    selFilt.addEventListener('change', () => { paginaActual = 1; renderizar(); });
    btnPrev.addEventListener('click', () => {
        if (paginaActual > 1) { paginaActual--; renderizar(); }
    });
    btnNext.addEventListener('click', () => {
        paginaActual++; renderizar();
    });

    cont.addEventListener('click', e => {
        const btn = e.target.closest('button.show-desc');
        if (!btn) return;
        const folio = btn.closest('tr').querySelectorAll('td')[2].textContent.trim();
        if (window.mostrarModalDescripcion) {
            window.mostrarModalDescripcion(parseInt(folio, 10));
        }
    });

    // Render inicial
    renderizar();
}

// Inicia ambas tablas al cargar
document.addEventListener('DOMContentLoaded', () => {
    inicializarTablaCasos('#historial');
    inicializarTablaCasos('#historial-casos');
});
