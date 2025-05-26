/**
 * Script reutilizable para paginar y filtrar una tabla de casos.
 * Captura al inicio todas las filas en un array y luego renderiza
 * solo el slice correspondiente cada vez.
 */
function inicializarTablaCasos(idContenedor) {
    const filasPorPagina = 5;
    let paginaActual = 1;
    const contenedor = document.querySelector(idContenedor);
    if (!contenedor) return;

    const cuerpoTabla     = contenedor.querySelector('.cases-table tbody');
    const btnPrev         = contenedor.querySelector('button[id$="-prev"]');
    const btnNext         = contenedor.querySelector('button[id$="-next"]');
    const indicador       = contenedor.querySelector('span[id$="-page-indicator"]');
    const selFiltro       = contenedor.querySelector('select[id$="-filter-column"]');
    const inputFiltro     = contenedor.querySelector('input[id$="-filter-input"]');

    // 1) Capturamos TODAS las filas originales en un array
    let todasFilasOriginales = Array.from(cuerpoTabla.querySelectorAll('tr'));

    // 2) Función para filtrar ese array
    function filasFiltradas() {
        const term = inputFiltro.value.trim().toLowerCase();
        const idx  = selFiltro.value === 'folio' ? 0 : 1;
        return todasFilasOriginales.filter(tr =>
            tr.cells[idx].textContent.trim().toLowerCase().includes(term)
        );
    }

    // 3) Renderizado de página
    function renderizar() {
        const filtr = filasFiltradas();
        const total = Math.ceil(filtr.length / filasPorPagina) || 1;
        if (paginaActual > total) paginaActual = total;

        const start = (paginaActual - 1) * filasPorPagina;
        const end   = start + filasPorPagina;

        // Vaciar y volver a poblar tbody
        cuerpoTabla.innerHTML = '';
        filtr.slice(start, end).forEach(tr => {
            // clonar para no mover el original
            cuerpoTabla.appendChild(tr.cloneNode(true));
        });

        // Actualizar botones e indicador
        btnPrev.disabled   = paginaActual === 1;
        btnNext.disabled   = paginaActual === total;
        indicador.textContent = `Página ${paginaActual} de ${total}`;
    }

    // 4) Eventos
    inputFiltro.addEventListener('input', () => { paginaActual = 1; renderizar(); });
    selFiltro.addEventListener('change', () => { paginaActual = 1; renderizar(); });
    btnPrev.addEventListener('click', () => {
        if (paginaActual > 1) { paginaActual--; renderizar(); }
    });
    btnNext.addEventListener('click', () => {
        paginaActual++; renderizar();
    });

    // 5) Primer render
    renderizar();
}

// ——— Inicialización ———
document.addEventListener('DOMContentLoaded', () => {
    inicializarTablaCasos('#historial');
    inicializarTablaCasos('#historial-casos');
});
