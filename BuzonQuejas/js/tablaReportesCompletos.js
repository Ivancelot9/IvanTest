document.addEventListener("DOMContentLoaded", function () {
    const tablaCompletosBody = document.getElementById("tabla-completos-body");
    const prevPageBtnCompleto = document.getElementById("prevPage-completo");
    const nextPageBtnCompleto = document.getElementById("nextPage-completo");
    const pageIndicatorCompleto = document.getElementById("pageIndicator-completo");
    const filterColumnCompleto = document.getElementById("filter-column-completo");
    const filterInputCompleto = document.getElementById("filter-input-completo");
    const filterButtonCompleto = document.getElementById("filter-button-completo");

    let datosReportesCompletos = [];
    let datosFiltradosCompletos = [];
    let paginaActualCompleto = 1;
    const filasPorPagina = 10;

    // 🟡 Diccionario para mapear columnas
    const columnasBDCompletos = {
        folio: "folio",
        nomina: "nomina",
        encargado: "encargado",
        fechaFinalizacion: "fechaFinalizacion",
        estatus: "estatus"
    };

    function resaltarTexto(texto, filtro) {
        if (!filtro || filtro.trim() === "") return String(texto ?? ""); // convierte a texto si es null/undefined
        const safeText = String(texto ?? ""); // protección contra undefined/null/number
        const regex = new RegExp(`(${filtro})`, "gi");
        return safeText.replace(regex, `<span class="highlight">$1</span>`);
    }

    function aplicarResaltado(valorCampo, campo, filtro, columnaSeleccionada) {
        return columnaSeleccionada === campo ? resaltarTexto(valorCampo, filtro) : valorCampo;
    }

    window.mostrarReportesCompletos = function (pagina = 1) {
        const inicio = (pagina - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const reportesPagina = datosFiltradosCompletos.slice(inicio, fin);
        const valorFiltro = filterInputCompleto.value.toLowerCase();
        const columnaSeleccionada = filterColumnCompleto.value;

        tablaCompletosBody.innerHTML = "";

        reportesPagina.forEach(reporte => {
            let fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${aplicarResaltado(reporte.folio, "folio", valorFiltro, columnaSeleccionada)}</td>
                <td>${aplicarResaltado(reporte.nomina, "nomina", valorFiltro, columnaSeleccionada)}</td>
                <td>${aplicarResaltado(reporte.encargado, "encargado", valorFiltro, columnaSeleccionada)}</td>
                <td>${aplicarResaltado(reporte.fechaFinalizacion, "fechaFinalizacion", valorFiltro, columnaSeleccionada)}</td>
                <td>${aplicarResaltado(reporte.estatus, "estatus", valorFiltro, columnaSeleccionada)}</td>
            `;

            let boton = document.createElement("button");
            boton.classList.add("convertidor");
            boton.setAttribute("data-folio", reporte.folio);
            boton.innerHTML = `<i class="fas fa-file-excel"></i> Convertir a Excel`;

            let celdaBoton = document.createElement("td");
            celdaBoton.appendChild(boton);
            fila.appendChild(celdaBoton);

            tablaCompletosBody.appendChild(fila);
        });

        pageIndicatorCompleto.textContent = `Página ${pagina}`;
        prevPageBtnCompleto.disabled = pagina === 1;
        nextPageBtnCompleto.disabled = fin >= datosFiltradosCompletos.length;

        paginaActualCompleto = pagina;
    };

    function cargarReportesCompletos() {
        fetch("https://grammermx.com/IvanTest/BuzonQuejas/dao/conseguirReportesCompletos.php")
            .then(res => res.json())
            .then(data => {
                if (!Array.isArray(data)) {
                    console.error("❌ Respuesta inesperada:", data);
                    return;
                }

                datosReportesCompletos = data;
                datosFiltradosCompletos = [...datosReportesCompletos];
                mostrarReportesCompletos(1);
            })
            .catch(err => {
                console.error("❌ Error al cargar reportes completados:", err);
            });
    }

    function filtrarReportesCompletos() {
        const valorFiltro = filterInputCompleto.value.toLowerCase();
        const columnaSeleccionada = filterColumnCompleto.value;
        const columnaBD = columnasBDCompletos[columnaSeleccionada];

        datosFiltradosCompletos = datosReportesCompletos.filter(reporte => {
            const valor = (reporte[columnaBD] || "").toString().toLowerCase();
            return valor.includes(valorFiltro);
        });

        mostrarReportesCompletos(1);
    }

    function exportarExcel(reporte) {
        let wb = XLSX.utils.book_new();
        wb.Props = {
            Title: "Reporte Completado",
            Subject: "Exportación Individual",
            Author: "Sistema",
            CreatedDate: new Date()
        };

        wb.SheetNames.push("Reporte");

        const ws_data = [
            ["Folio", "Número de Nómina", "Encargado", "Fecha Registro", "Fecha Finalización", "Descripción", "Estatus", "Comentarios"],
            [
                reporte.folio,
                reporte.nomina,
                reporte.encargado,
                reporte.fechaRegistro,
                reporte.fechaFinalizacion,
                reporte.descripcion || "-",
                reporte.estatus,
                reporte.comentarios || "Sin comentarios"
            ]
        ];

        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        ws["!cols"] = Array(ws_data[0].length).fill({ wch: 25 });

        wb.Sheets["Reporte"] = ws;
        XLSX.writeFile(wb, `Reporte_${reporte.folio}.xlsx`);
    }

    tablaCompletosBody.addEventListener("click", function (event) {
        if (event.target.closest(".convertidor")) {
            const folio = event.target.closest(".convertidor").getAttribute("data-folio");
            const reporte = datosReportesCompletos.find(rep => String(rep.folio) === String(folio));

            if (reporte) {
                exportarExcel(reporte);
            } else {
                Swal.fire("Error", "No se encontró el reporte para exportar.", "error");
            }
        }
    });

    prevPageBtnCompleto.addEventListener("click", () => {
        if (paginaActualCompleto > 1) {
            paginaActualCompleto--;
            mostrarReportesCompletos(paginaActualCompleto);
        }
    });

    nextPageBtnCompleto.addEventListener("click", () => {
        if (paginaActualCompleto * filasPorPagina < datosFiltradosCompletos.length) {
            paginaActualCompleto++;
            mostrarReportesCompletos(paginaActualCompleto);
        }
    });

    filterInputCompleto.addEventListener("input", filtrarReportesCompletos);
    filterButtonCompleto.addEventListener("click", filtrarReportesCompletos);

    cargarReportesCompletos();

    window.cargarReportesCompletos = cargarReportesCompletos;

    window.moverReporteACompletados = function (nuevoReporte) {
        datosReportesCompletos.unshift(nuevoReporte);
        datosFiltradosCompletos = [...datosReportesCompletos];
        mostrarReportesCompletos(1);
    };
});
