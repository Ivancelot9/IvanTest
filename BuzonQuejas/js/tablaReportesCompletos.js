document.addEventListener("DOMContentLoaded", function () {
    const tablaCompletosBody = document.getElementById("tabla-completos-body");
    const prevPageBtnCompleto = document.getElementById("prevPage-completo");
    const nextPageBtnCompleto = document.getElementById("nextPage-completo");
    const pageIndicatorCompleto = document.getElementById("pageIndicator-completo");
    const filterColumnCompleto = document.getElementById("filter-column-completo");
    const filterInputCompleto = document.getElementById("filter-input-completo");
    const filterButtonCompleto = document.getElementById("filter-button-completo");

    window.datosReportesCompletos = JSON.parse(localStorage.getItem("reportesCompletos")) || [];
    let comentariosPorReporte = JSON.parse(localStorage.getItem("comentariosPorReporte")) || {};
    let paginaActualCompleto = 1;
    const filasPorPagina = 10;
    let datosFiltradosCompletos = [...datosReportesCompletos]; // 🔹 Inicialización correcta

    function guardarReportesCompletos() {
        localStorage.setItem("reportesCompletos", JSON.stringify(datosReportesCompletos));
        localStorage.setItem("comentariosPorReporte", JSON.stringify(comentariosPorReporte));
    }

    window.moverReporteACompletados = function (reporte) {
        datosReportesCompletos.push(reporte);
        guardarReportesCompletos();
        filtrarReportesCompletos();
    };

    function resaltarTexto(texto, filtro) {
        if (!filtro || filtro.trim() === "") return texto;
        const regex = new RegExp(`(${filtro})`, "gi");
        return texto.replace(regex, `<span class="highlight">$1</span>`);
    }

    function mostrarReportesCompletos(pagina) {
        datosFiltradosCompletos = [...datosReportesCompletos]; // 🔹 Sincronizar datos siempre
        tablaCompletosBody.innerHTML = "";
        const inicio = (pagina - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const reportesPagina = datosFiltradosCompletos.slice(inicio, fin);
        const valorFiltro = filterInputCompleto.value.toLowerCase();
        const columnaSeleccionada = filterColumnCompleto.value;

        reportesPagina.forEach(reporte => {
            let fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${columnaSeleccionada === "folio" ? resaltarTexto(reporte.folio, valorFiltro) : reporte.folio}</td>
            <td>${columnaSeleccionada === "nomina" ? resaltarTexto(reporte.nomina, valorFiltro) : reporte.nomina}</td>
            <td>${columnaSeleccionada === "encargado" ? resaltarTexto(reporte.encargado, valorFiltro) : reporte.encargado}</td>
            <td>${columnaSeleccionada === "fechaFinalizacion" ? resaltarTexto(reporte.fechaFinalizacion, valorFiltro) : reporte.fechaFinalizacion}</td>
            <td>${columnaSeleccionada === "estatus" ? resaltarTexto(reporte.estatus, valorFiltro) : reporte.estatus}</td>
            <td>
                <button class="convertidor" data-folio="${reporte.folio ? reporte.folio : 'ERROR_FOLIO'}">
                    <i class="fas fa-file-excel"></i> Convertir a Excel
                </button>
            </td>
            `;

            tablaCompletosBody.appendChild(fila);
        });

        pageIndicatorCompleto.textContent = `Página ${pagina}`;
        prevPageBtnCompleto.disabled = pagina === 1;
        nextPageBtnCompleto.disabled = fin >= datosFiltradosCompletos.length;
    }

    // 📌 Delegación de eventos para el botón "Convertir a Excel"
    tablaCompletosBody.addEventListener("click", function (event) {
        if (event.target.closest(".convertidor")) {
            const folio = event.target.closest(".convertidor").getAttribute("data-folio");
            const reporte = datosReportesCompletos.find(rep => rep.folio === folio);

            if (!reporte) {
                console.error("No se encontró el reporte con folio:", folio);
                Swal.fire("Error", "No se encontró el reporte en la tabla completados.", "error");
                return;
            }

            exportarExcel(reporte);
        }
    });

    function exportarExcel(reporte) {
        if (!reporte || Object.keys(reporte).length === 0) {
            Swal.fire("Error", "No se encontró el reporte en la tabla completados.", "error");
            return;
        }

        let comentarios = reporte.comentarios && reporte.comentarios.length > 0
            ? reporte.comentarios.join(" | ")
            : (comentariosPorReporte[reporte.folio] ? comentariosPorReporte[reporte.folio].join(" | ") : "Sin comentarios");

        let wb = XLSX.utils.book_new();
        wb.Props = {
            Title: "Reportes Completados",
            Subject: "Reporte Exportado",
            Author: "Sistema",
            CreatedDate: new Date()
        };

        wb.SheetNames.push("Reporte");
        let ws_data = [
            ["Folio", "Número de Nómina", "Encargado", "Fecha Registro", "Fecha Finalización", "Descripción", "Estatus", "Comentarios"],
            [
                reporte.folio,
                reporte.nomina,
                reporte.encargado,
                reporte.fechaRegistro,
                reporte.fechaFinalizacion,
                reporte.descripcion,
                "Completado",
                comentarios
            ]
        ];

        let ws = XLSX.utils.aoa_to_sheet(ws_data);

        ws["!cols"] = [
            { wch: 12 },
            { wch: 18 },
            { wch: 22 },
            { wch: 15 },
            { wch: 15 },
            { wch: 50 },
            { wch: 15 },
            { wch: 50 }
        ];

        wb.Sheets["Reporte"] = ws;
        XLSX.writeFile(wb, `Reporte_${reporte.folio}.xlsx`);
    }

    function filtrarReportesCompletos() {
        const valorFiltro = filterInputCompleto.value.toLowerCase();
        const columna = filterColumnCompleto.value;

        datosFiltradosCompletos = datosReportesCompletos.filter(reporte => {
            return reporte[columna].toLowerCase().includes(valorFiltro);
        });

        paginaActualCompleto = 1;
        mostrarReportesCompletos(paginaActualCompleto);
    }

    prevPageBtnCompleto.addEventListener("click", () => {
        paginaActualCompleto--;
        mostrarReportesCompletos(paginaActualCompleto);
    });

    nextPageBtnCompleto.addEventListener("click", () => {
        paginaActualCompleto++;
        mostrarReportesCompletos(paginaActualCompleto);
    });

    filterInputCompleto.addEventListener("input", filtrarReportesCompletos);
    filterButtonCompleto.addEventListener("click", filtrarReportesCompletos);

    // 🔹 Forzar que la tabla se sincronice y cargue los datos correctamente desde el inicio
    mostrarReportesCompletos(paginaActualCompleto);
});
