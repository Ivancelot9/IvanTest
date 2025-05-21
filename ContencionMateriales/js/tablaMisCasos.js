/**
 * Script reutilizable para paginar y filtrar una tabla de casos.
 * Se puede aplicar a múltiples secciones como "Mis Casos" o "Todos los Casos",
 * siempre que la estructura HTML sea consistente (contenedor con clase `.cases-table`,
 * filtros con ids estándar y paginación con botones e indicador).
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

    const cuerpoTabla = contenedor.querySelector('.cases-table tbody');
    const todasFilas = Array.from(cuerpoTabla.querySelectorAll('tr'));

    const botonAnterior = contenedor.querySelector('button[id$="-prev"]');
    const botonSiguiente = contenedor.querySelector('button[id$="-next"]');
    const indicadorPagina = contenedor.querySelector('span[id$="-page-indicator"]');

    const selectorFiltro = contenedor.querySelector('select[id$="-filter-column"]');
    const entradaFiltro = contenedor.querySelector('input[id$="-filter-input"]');

    // Escapa caracteres especiales para evitar errores en expresiones regulares
    function escapeRegExp(texto) {
        return texto.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
    }

    // Resalta el término buscado dentro de la celda usando <mark>
    function resaltarTexto(texto, termino) {
        if (!termino) return texto;
        const regex = new RegExp(`(${escapeRegExp(termino)})`, 'gi');
        return texto.replace(regex, '<mark>$1</mark>');
    }

    // Filtra las filas según el texto ingresado y la columna seleccionada
    function obtenerFilasFiltradas() {
        const termino = entradaFiltro.value.trim().toLowerCase();
        const indice = selectorFiltro.value === 'folio' ? 0 : 1; // 0 = Folio, 1 = Fecha Registro
        return todasFilas.filter(fila => {
            const contenido = fila.cells[indice].textContent.trim().toLowerCase();
            return contenido.includes(termino);
        });
    }

    // Muestra las filas de la página actual y actualiza el texto resaltado
    function renderizarPagina() {
        const filasFiltradas = obtenerFilasFiltradas();
        const totalPaginas = Math.max(1, Math.ceil(filasFiltradas.length / filasPorPagina));
        if (paginaActual > totalPaginas) paginaActual = totalPaginas;

        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const indice = selectorFiltro.value === 'folio' ? 0 : 1;
        const termino = entradaFiltro.value.trim();

        cuerpoTabla.innerHTML = '';
        filasFiltradas.slice(inicio, fin).forEach(fila => {
            const nuevaFila = fila.cloneNode(true);
            const celda = nuevaFila.cells[indice];
            celda.innerHTML = resaltarTexto(celda.textContent, termino);
            cuerpoTabla.appendChild(nuevaFila);
        });

        botonAnterior.disabled = paginaActual === 1;
        botonSiguiente.disabled = paginaActual === totalPaginas;
        indicadorPagina.textContent = `Página ${paginaActual} de ${totalPaginas}`;
    }

    // Eventos para el filtrado y navegación por páginas
    entradaFiltro.addEventListener('input', () => {
        paginaActual = 1;
        renderizarPagina();
    });
    selectorFiltro.addEventListener('change', () => {
        paginaActual = 1;
        renderizarPagina();
    });
    botonAnterior.addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            renderizarPagina();
        }
    });
    botonSiguiente.addEventListener('click', () => {
        paginaActual++;
        renderizarPagina();
    });

    // Carga inicial
    renderizarPagina();
}