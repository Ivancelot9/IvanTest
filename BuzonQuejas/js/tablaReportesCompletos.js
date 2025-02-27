document.addEventListener("DOMContentLoaded", function () {
    const tablaCompletosBody = document.getElementById("tabla-completos-body");
    const prevPageBtnCompleto = document.getElementById("prevPage-completo");
    const nextPageBtnCompleto = document.getElementById("nextPage-completo");
    const pageIndicatorCompleto = document.getElementById("pageIndicator-completo");
    const filterColumnCompleto = document.getElementById("filter-column-completo");
    const filterInputCompleto = document.getElementById("filter-input-completo");
    const filterButtonCompleto = document.getElementById("filter-button-completo");

    let datosReportesCompletos = JSON.parse(localStorage.getItem("reportesCompletos")) || [];
    let comentariosPorReporte = JSON.parse(localStorage.getItem("comentariosPorReporte")) || {}; // ✅ Cargar comentarios guardados
    let paginaActualCompleto = 1;
    const filasPorPagina = 10;
    let datosFiltradosCompletos = [...datosReportesCompletos];

    // 🔄 Guardar reportes en localStorage
    function guardarReportesCompletos() {
        localStorage.setItem("reportesCompletos", JSON.stringify(datosReportesCompletos));
        localStorage.setItem("comentariosPorReporte", JSON.stringify(comentariosPorReporte)); // ✅ Guardar comentarios también
    }

    // 🔄 Función global para mover el reporte a la tabla de completados
    window.moverReporteACompletados = function (reporte) {
        datosReportesCompletos.push(reporte);
        guardarReportesCompletos();
        filtrarReportesCompletos();
    };

    // 🔎 Función para resaltar texto filtrado
    function resaltarTexto(texto, filtro) {
        if (!filtro || filtro.trim() === "") return texto;
        const regex = new RegExp(`(${filtro})`, "gi");
        return texto.replace(regex, `<span class="highlight">$1</span>`);
    }

    // 📌 Función para mostrar reportes en la tabla de completados
    function mostrarReportesCompletos(pagina, reportes = datosFiltradosCompletos) {
        tablaCompletosBody.innerHTML = "";
        const inicio = (pagina - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const reportesPagina = reportes.slice(inicio, fin);
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
                <td><button class="convertidor"><i class="fas fa-file-excel"></i> Convertir a Excel</button></td>
            `;

            let btnConvertir = fila.querySelector(".convertidor");
            btnConvertir.addEventListener("click", function () {
                exportarExcel(reporte);
            });

            tablaCompletosBody.appendChild(fila);
        });

        // 📌 Actualizar paginación
        pageIndicatorCompleto.textContent = `Página ${pagina}`;
        prevPageBtnCompleto.disabled = pagina === 1;
        nextPageBtnCompleto.disabled = fin >= reportes.length;
    }

    // 📌 Función para exportar reporte a Excel incluyendo comentarios
    function exportarExcel(reporte) {
        if (!reporte) {
            Swal.fire("Error", "No se encontró el reporte en la tabla completados.", "error");
            return;
        }

        let comentariosPorReporte = JSON.parse(localStorage.getItem("comentariosPorReporte")) || {};
        let comentarios = reporte.comentarios && reporte.comentarios.length > 0
            ? reporte.comentarios.join(" | ")
            : (comentariosPorReporte[reporte.folio] ? comentariosPorReporte[reporte.folio].join(" | ") : "");

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
                comentarios  // ✅ Se asegura de que los comentarios se incluyan en el Excel
            ]
        ];

        let ws = XLSX.utils.aoa_to_sheet(ws_data);

        // 📌 Ajustar ancho de columnas automáticamente
        ws["!cols"] = [
            { wch: 12 },  // Folio
            { wch: 18 },  // Número de Nómina
            { wch: 22 },  // Encargado
            { wch: 15 },  // Fecha Registro
            { wch: 15 },  // Fecha Finalización
            { wch: 50 },  // Descripción
            { wch: 15 },  // Estatus
            { wch: 50 }   // Comentarios (✅ Ahora los comentarios tienen su propia columna)
        ];

        wb.Sheets["Reporte"] = ws;

        // 📌 Descargar el archivo Excel
        XLSX.writeFile(wb, `Reporte_${reporte.folio}.xlsx`);
    }

    // 📌 Función para filtrar reportes completados
    function filtrarReportesCompletos() {
        const valorFiltro = filterInputCompleto.value.toLowerCase();
        const columna = filterColumnCompleto.value;

        datosFiltradosCompletos = datosReportesCompletos.filter(reporte => {
            return reporte[columna].toLowerCase().includes(valorFiltro);
        });

        paginaActualCompleto = 1;
        mostrarReportesCompletos(paginaActualCompleto);
    }

    // 📌 Eventos de paginación
    prevPageBtnCompleto.addEventListener("click", () => {
        paginaActualCompleto--;
        mostrarReportesCompletos(paginaActualCompleto);
    });

    nextPageBtnCompleto.addEventListener("click", () => {
        paginaActualCompleto++;
        mostrarReportesCompletos(paginaActualCompleto);
    });

    // 📌 Evento de filtrado
    filterInputCompleto.addEventListener("input", filtrarReportesCompletos);
    filterButtonCompleto.addEventListener("click", filtrarReportesCompletos);

    // 📌 Cargar reportes al inicio
    mostrarReportesCompletos(paginaActualCompleto);
});
