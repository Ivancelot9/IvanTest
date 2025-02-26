document.addEventListener("DOMContentLoaded", function () {
    const tablaCompletosBody = document.getElementById("tabla-completos-body");
    const prevPageBtnCompleto = document.getElementById("prevPage-completo");
    const nextPageBtnCompleto = document.getElementById("nextPage-completo");
    const pageIndicatorCompleto = document.getElementById("pageIndicator-completo");
    const filterColumnCompleto = document.getElementById("filter-column-completo");
    const filterInputCompleto = document.getElementById("filter-input-completo");
    const filterButtonCompleto = document.getElementById("filter-button-completo");

    let datosReportesCompletos = JSON.parse(localStorage.getItem("reportesCompletos")) || [];
    let paginaActualCompleto = 1;
    const filasPorPagina = 10;
    let datosFiltradosCompletos = [...datosReportesCompletos];

    // 🔄 Función global para mover el reporte a la tabla de completados
    window.moverReporteACompletados = function (reporte) {
        datosReportesCompletos.push(reporte);
        localStorage.setItem("reportesCompletos", JSON.stringify(datosReportesCompletos));
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
                exportarExcel(reporte.folio);
            });

            tablaCompletosBody.appendChild(fila);
        });

        // 📌 Actualizar paginación
        pageIndicatorCompleto.textContent = `Página ${pagina}`;
        prevPageBtnCompleto.disabled = pagina === 1;
        nextPageBtnCompleto.disabled = fin >= reportes.length;
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

    // 📌 Función para exportar reporte a Excel
    function exportarExcel(folio) {
        let reporte = datosReportesCompletos.find(r => r.folio === folio);
        if (!reporte) return;

        let reporteOriginal = JSON.parse(localStorage.getItem("reportesPendientes")).find(r => r.folio === folio);
        if (!reporteOriginal) return;

        let wb = XLSX.utils.book_new();
        wb.Props = {
            Title: "Reportes Completados",
            Subject: "Reporte Exportado",
            Author: "Sistema",
            CreatedDate: new Date()
        };

        wb.SheetNames.push("Reporte");
        let ws_data = [
            ["Folio", "Número de Nómina", "Encargado", "Fecha Registro", "Fecha Finalización", "Descripción", "Estatus"],
            [
                reporteOriginal.folio,
                reporteOriginal.nomina,
                reporteOriginal.encargado,
                reporteOriginal.fechaRegistro,
                reporte.fechaFinalizacion,
                reporteOriginal.descripcion,
                reporte.estatus
            ]
        ];

        let ws = XLSX.utils.aoa_to_sheet(ws_data);
        wb.Sheets["Reporte"] = ws;
        let wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

        function s2ab(s) {
            let buf = new ArrayBuffer(s.length);
            let view = new Uint8Array(buf);
            for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }

        saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), `Reporte_${folio}.xlsx`);
    }

    // 📌 Cargar reportes al inicio
    mostrarReportesCompletos(paginaActualCompleto);
});
