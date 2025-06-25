// tablaMisCasos.js

// Mantiene los folios actualmente seleccionados (global)
window.selectedFolios = new Set();

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

    const config = { tieneEstatus:false, tieneResponsable:false, tieneTerciaria:false };
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

    const filasIniciales = Array.from(tbody.querySelectorAll('tr'));

    function escapeRegExp(s) {
        return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    }
    function resaltar(txt, term) {
        if (!term) return txt;
        return txt.replace(
            new RegExp(`(${escapeRegExp(term)})`,'gi'),
            '<mark>$1</mark>'
        );
    }
    function formatearFecha(iso) {
        const [a,m,d] = iso.split('-');
        return (d&&m&&a)? `${d}-${m}-${a}` : iso;
    }

    function filasFiltradas() {
        const term = inpFilt.value.trim().toLowerCase();
        let idx = selFilt.value === 'folio' ? 2 : 3;
        return filasIniciales.filter(tr => {
            let txt = tr.cells[idx].textContent.trim();
            if (selFilt.value === 'fecha') txt = formatearFecha(txt);
            return txt.toLowerCase().includes(term);
        });
    }

    function renderizar() {
        const filtr = filasFiltradas();
        const total = Math.max(1, Math.ceil(filtr.length/filasPorPagina));
        if (paginaActual > total) paginaActual = total;

        tbody.innerHTML = '';
        filtr.slice((paginaActual-1)*filasPorPagina, paginaActual*filasPorPagina)
            .forEach(trOrig => {
                const tr = trOrig.cloneNode(true);

                const cb = tr.querySelector('.check-folio');
                if (cb) {
                    const seleccionActiva = document.getElementById('btn-toggle-seleccion')?.dataset.selectionActive === 'true';
                    cb.style.display = seleccionActiva ? '' : 'none';
                    cb.checked       = window.selectedFolios.has(cb.value);
                    if (seleccionActiva) cb.classList.add('pulse-check');
                    else                 cb.classList.remove('pulse-check');
                }

                if (selFilt.value==='folio') {
                    tr.cells[2].innerHTML = resaltar(
                        tr.cells[2].textContent.trim(), inpFilt.value.trim()
                    );
                }

                {
                    const raw = tr.cells[3].textContent.trim();
                    const fmt = formatearFecha(raw);
                    tr.cells[3].textContent = fmt;
                    if (selFilt.value==='fecha') {
                        tr.cells[3].innerHTML = resaltar(fmt, inpFilt.value.trim());
                    }
                }

                if (config.tieneEstatus && tr.cells[config.idxEstatus]) {
                    tr.cells[config.idxEstatus].textContent =
                        tr.cells[config.idxEstatus].textContent.trim();
                }

                if (config.tieneResponsable && tr.cells[2]) {
                    tr.cells[2].textContent = tr.cells[2].textContent.trim();
                }
                if (config.tieneTerciaria && tr.cells[3]) {
                    tr.cells[3].textContent = tr.cells[3].textContent.trim();
                }

                tbody.appendChild(tr);
            });

        btnPrev.disabled = paginaActual===1;
        btnNext.disabled = paginaActual===total;
        indicador.textContent = `Página ${paginaActual} de ${total}`;
    }

    cont.addEventListener('change', e => {
        const cb = e.target;
        if (!cb.classList.contains('check-folio')) return;
        if (cb.checked) window.selectedFolios.add(cb.value);
        else            window.selectedFolios.delete(cb.value);
    });

    inpFilt.addEventListener('input', ()=>{ paginaActual=1; renderizar(); });
    selFilt.addEventListener('change',()=>{ paginaActual=1; renderizar(); });
    btnPrev.addEventListener('click', ()=>{
        if(paginaActual>1){paginaActual--;renderizar();}
    });
    btnNext.addEventListener('click', ()=>{
        paginaActual++;renderizar();
    });

    cont.addEventListener('click', e=>{
        const btn = e.target.closest('button.show-desc');
        if(!btn) return;
        const folio = btn.closest('tr').cells[2].textContent.trim();
        if(window.mostrarModalDescripcion)
            window.mostrarModalDescripcion(parseInt(folio,10));
    });

    renderizar();
}

document.addEventListener('DOMContentLoaded',()=>{
    inicializarTablaCasos('#historial');
    inicializarTablaCasos('#historial-casos');
});
