document.addEventListener("DOMContentLoaded", function () {
    // 🔹 Cargar reportes pendientes desde localStorage o usar los predefinidos
    let datosReportes = JSON.parse(localStorage.getItem("reportesPendientes")) || [
        { folio: "001", nomina: "123456", encargado: "Juan Pérez", fechaRegistro: "10/02/2025", fechaFinalizacion: "-", descripcion: "El sistema de autenticación presenta un problema crítico.", estatus: "Pendiente" },
        { folio: "002", nomina: "654321", encargado: "María López", fechaRegistro: "11/02/2025", fechaFinalizacion: "-", descripcion: "Error en la base de datos", estatus: "Pendiente" },
        { folio: "003", nomina: "789654", encargado: "Carlos García", fechaRegistro: "12/02/2025", fechaFinalizacion: "-", descripcion: "Actualización del sistema completada", estatus: "Pendiente" }
    ];

    const filasPorPagina = 10;
    let paginaActual = 1;
    let datosFiltrados = [...datosReportes];

    // ✅ Elementos del DOM
    const tablaBody = document.getElementById("tabla-body");
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");
    const pageIndicator = document.getElementById("pageIndicator");
    const filterColumn = document.getElementById("filter-column");
    const filterInput = document.getElementById("filter-input");
    const filterButton = document.getElementById("filter-button");

    function guardarReportesPendientes() {
        localStorage.setItem("reportesPendientes", JSON.stringify(datosReportes));
    }

    function resaltarTexto(texto, filtro) {
        if (!filtro || filtro.trim() === "") return texto;
        const regex = new RegExp(`(${filtro})`, "gi");
        return texto.replace(regex, `<span class="highlight">$1</span>`);
    }

    function mostrarReportes(pagina, reportes = datosFiltrados) {
        tablaBody.innerHTML = "";
        const inicio = (pagina - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const reportesPagina = reportes.slice(inicio, fin);
        const valorFiltro = filterInput.value.toLowerCase();
        const columnaSeleccionada = filterColumn.value;

        reportesPagina.forEach(reporte => {
            let fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${columnaSeleccionada === "folio" ? resaltarTexto(reporte.folio, valorFiltro) : reporte.folio}</td>
                <td>${columnaSeleccionada === "fechaRegistro" ? resaltarTexto(reporte.fechaRegistro, valorFiltro) : reporte.fechaRegistro}</td>
                <td>${columnaSeleccionada === "nomina" ? resaltarTexto(reporte.nomina, valorFiltro) : reporte.nomina}</td>
                <td>${columnaSeleccionada === "encargado" ? resaltarTexto(reporte.encargado, valorFiltro) : reporte.encargado}</td>
                <td><button class="mostrar-descripcion" data-descripcion="${reporte.descripcion}">Mostrar Descripción</button></td>
                <td><button class="agregar-comentario" data-folio="${reporte.folio}">Agregar Comentario</button></td>
                <td class="estatus-cell"><strong>${columnaSeleccionada === "estatus" ? resaltarTexto(reporte.estatus, valorFiltro) : reporte.estatus}</strong></td>
                <td><button class="seleccionar-fecha" data-folio="${reporte.folio}">Finalizar Reporte</button></td>
            `;
            tablaBody.appendChild(fila);
        });

        pageIndicator.textContent = `Página ${pagina}`;
        prevPageBtn.disabled = pagina === 1;
        nextPageBtn.disabled = fin >= reportes.length;

        guardarReportesPendientes();
        initEstatusEditor();
    }

    function filtrarReportes() {
        const valorFiltro = filterInput.value.toLowerCase();
        const columna = filterColumn.value;

        datosFiltrados = datosReportes.filter(reporte => {
            return reporte[columna].toLowerCase().includes(valorFiltro);
        });

        paginaActual = 1;
        mostrarReportes(paginaActual);
    }

    window.getReportePorFolio = function (folio) {
        return datosReportes.find(r => r.folio === folio);
    };

    window.eliminarReportePorFolio = function (folio) {
        const index = datosReportes.findIndex(r => r.folio === folio);
        if (index !== -1) {
            datosReportes.splice(index, 1);
            guardarReportesPendientes();
            filtrarReportes();
        }
    };

    // ✅ **Corrección: Mover reporte a completados con comentarios**
    window.moverReporteACompletados = function (folio, fechaFinalizacion) {
        let datosReportes = JSON.parse(localStorage.getItem("reportesPendientes")) || [];
        let comentariosPorReporte = JSON.parse(localStorage.getItem("comentariosPorReporte")) || {};
        let datosReportesCompletos = JSON.parse(localStorage.getItem("reportesCompletos")) || [];

        let reporteIndex = datosReportes.findIndex(r => r.folio === folio);
        if (reporteIndex === -1) return;

        let reporte = datosReportes[reporteIndex];
        reporte.fechaFinalizacion = fechaFinalizacion;
        reporte.estatus = "Completado";

        // ✅ **Asegurar que los comentarios se agregan correctamente**
        reporte.comentarios = comentariosPorReporte[folio] ? [...comentariosPorReporte[folio]] : [];

        // **Depuración: Verificar que los comentarios se están copiando**
        console.log("Reporte antes de mover a completados:", reporte);

        // ✅ Guardar reporte en reportesCompletos
        datosReportesCompletos.push(reporte);
        localStorage.setItem("reportesCompletos", JSON.stringify(datosReportesCompletos));

        // ✅ Eliminar reporte de la tabla de pendientes
        datosReportes.splice(reporteIndex, 1);
        localStorage.setItem("reportesPendientes", JSON.stringify(datosReportes));

        filtrarReportes();
    };

    prevPageBtn.addEventListener("click", () => {
        paginaActual--;
        mostrarReportes(paginaActual);
    });

    nextPageBtn.addEventListener("click", () => {
        paginaActual++;
        mostrarReportes(paginaActual);
    });

    filterInput.addEventListener("input", filtrarReportes);
    filterButton.addEventListener("click", filtrarReportes);

    mostrarReportes(paginaActual);
});
