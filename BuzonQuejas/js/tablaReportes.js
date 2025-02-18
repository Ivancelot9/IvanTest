document.addEventListener("DOMContentLoaded", function () {
    const datosReportes = [
        { folio: "001", nomina: "123456", encargado: "Juan Pérez", fechaRegistro: "10/02/2025", fechaFinalizacion: "-", descripcion: "El sistema de autenticación presenta un problema crítico.", estatus: "En proceso" },
        { folio: "002", nomina: "654321", encargado: "María López", fechaRegistro: "11/02/2025", fechaFinalizacion: "-", descripcion: "Error en la base de datos", estatus: "Pendiente" },
        { folio: "003", nomina: "789654", encargado: "Carlos García", fechaRegistro: "12/02/2025", fechaFinalizacion: "-", descripcion: "Actualización del sistema completada", estatus: "Completado" }
    ];

    const filasPorPagina = 10;
    let paginaActual = 1;
    let datosFiltrados = [...datosReportes];

    const tablaBody = document.getElementById("tabla-body");
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");
    const pageIndicator = document.getElementById("pageIndicator");
    const filterColumn = document.getElementById("filter-column");
    const filterInput = document.getElementById("filter-input");
    const filterButton = document.getElementById("filter-button");

    // 🔥 Resaltar solo en la columna seleccionada
    function resaltarTexto(texto, filtro) {
        if (!filtro || filtro.trim() === "") return texto; // Evita resaltar si el filtro está vacío
        const regex = new RegExp(`(${filtro})`, "gi"); // Expresión regular para buscar coincidencias
        return texto.replace(regex, `<span class="highlight">$1</span>`); // Aplica resaltado
    }

    function mostrarReportes(pagina, reportes = datosFiltrados) {
        tablaBody.innerHTML = "";
        const inicio = (pagina - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const reportesPagina = reportes.slice(inicio, fin);
        const valorFiltro = filterInput.value.toLowerCase();
        const columnaSeleccionada = filterColumn.value; // Obtiene la columna seleccionada

        reportesPagina.forEach(reporte => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${columnaSeleccionada === "folio" ? resaltarTexto(reporte.folio, valorFiltro) : reporte.folio}</td>
                <td>${columnaSeleccionada === "nomina" ? resaltarTexto(reporte.nomina, valorFiltro) : reporte.nomina}</td>
                <td>${columnaSeleccionada === "encargado" ? resaltarTexto(reporte.encargado, valorFiltro) : reporte.encargado}</td>
                <td>${columnaSeleccionada === "fechaRegistro" ? resaltarTexto(reporte.fechaRegistro, valorFiltro) : reporte.fechaRegistro}</td>
                <td>${columnaSeleccionada === "fechaFinalizacion" ? resaltarTexto(reporte.fechaFinalizacion, valorFiltro) : reporte.fechaFinalizacion}</td>
                <td><button class="mostrar-descripcion" data-descripcion="${reporte.descripcion}">Mostrar Descripción</button></td>
                <td><strong>${columnaSeleccionada === "estatus" ? resaltarTexto(reporte.estatus, valorFiltro) : reporte.estatus}</strong></td>
                <td><button class="agregar-comentario" data-folio="${reporte.folio}">Agregar Comentario</button></td>
            `;
            tablaBody.appendChild(fila);
        });

        pageIndicator.textContent = `Página ${pagina}`;
        prevPageBtn.disabled = pagina === 1;
        nextPageBtn.disabled = fin >= reportes.length;
    }

    function cambiarPagina(delta) {
        paginaActual += delta;
        mostrarReportes(paginaActual);
    }

    // ✅ Filtrar datos y aplicar resaltado solo en la columna seleccionada
    function filtrarReportes() {
        const valorFiltro = filterInput.value.toLowerCase();
        const columna = filterColumn.value;

        datosFiltrados = datosReportes.filter(reporte => {
            return reporte[columna].toLowerCase().includes(valorFiltro);
        });

        paginaActual = 1;
        mostrarReportes(paginaActual);
    }

    prevPageBtn.addEventListener("click", () => cambiarPagina(-1));
    nextPageBtn.addEventListener("click", () => cambiarPagina(1));

    // 🔹 Filtrar en tiempo real
    filterInput.addEventListener("input", filtrarReportes);

    // 🔍 Botón de búsqueda manual
    filterButton.addEventListener("click", filtrarReportes);

    mostrarReportes(paginaActual);
});
