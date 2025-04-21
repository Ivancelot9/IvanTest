document.addEventListener("DOMContentLoaded", function () {
    const tablaCompletosBody = document.getElementById("tabla-completos-body");
    const prevPageBtnCompleto = document.getElementById("prevPage-completo");
    const nextPageBtnCompleto = document.getElementById("nextPage-completo");
    const pageIndicatorCompleto = document.getElementById("pageIndicator-completo");
    const filterColumnCompleto = document.getElementById("filter-column-completo");
    const filterInputCompleto = document.getElementById("filter-input-completo");
    const filterButtonCompleto = document.getElementById("filter-button-completo");
    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");
    const filterDateButton = document.getElementById("filter-date-button");
    const clearDateButton = document.getElementById("clear-date-button");

    let datosReportesCompletos = [];
    let datosFiltradosCompletos = [];
    let paginaActualCompleto = 1;
    const filasPorPagina = 10;
    let resaltarFechas = false;

    const columnasBDCompletos = {
        folio: "folio",
        nomina: "nomina",
        encargado: "encargado",
        fechaFinalizacion: "fechaFinalizacion",
        estatus: "estatus"
    };


    startDateInput.setAttribute("onkeydown", "return false;");
    endDateInput.setAttribute("onkeydown", "return false;");

    function escapeRegex(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function resaltarTexto(texto, filtro) {
        if (!filtro || filtro.trim() === "") return String(texto ?? "");
        const safeText = String(texto ?? "");
        const regex = new RegExp(`(${escapeRegex(filtro)})`, "gi");
        return safeText.replace(regex, `<span class="highlight">$1</span>`);
    }


    function aplicarResaltado(valorCampo, campo, filtro, columnaSeleccionada) {
        return columnaSeleccionada === campo ? resaltarTexto(valorCampo, filtro) : valorCampo;
    }

    function formatearFecha(fechaOriginal) {
        const partes = fechaOriginal.split(" ")[0].split("-");
        if (partes.length === 3) {
            return `${partes[2]}-${partes[1]}-${partes[0]}`; // DD-MM-YYYY
        }
        return fechaOriginal; // fallback si no tiene formato válido
    }

    function extraerTextoPlano(html) {
        const div = document.createElement("div");
        div.innerHTML = html;
        return div.textContent || div.innerText || "";
    }


    window.mostrarReportesCompletos = function (pagina = 1) {
        const inicio = (pagina - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const reportesPagina = datosFiltradosCompletos.slice(inicio, fin);
        const valorFiltro = filterInputCompleto.value.toLowerCase();
        const columnaSeleccionada = filterColumnCompleto.value;

        tablaCompletosBody.innerHTML = "";

        if (reportesPagina.length === 0) {
            const usandoFiltroFecha = startDateInput.value || endDateInput.value;
            const mensaje = usandoFiltroFecha
                ? "❌ No hay reportes en este rango de fechas."
                : "❌ No hay reportes que coincidan con el filtro.";

            tablaCompletosBody.innerHTML = `
        <tr><td colspan="6" style="color: red; font-weight: bold;">${mensaje}</td></tr>`;
            return;
        }

        reportesPagina.forEach(reporte => {
            let fila = document.createElement("tr");


            fila.innerHTML = `
                <td>${aplicarResaltado(reporte.folio, "folio", valorFiltro, columnaSeleccionada)}</td>
                <td>${aplicarResaltado(reporte.nomina, "nomina", valorFiltro, columnaSeleccionada)}</td>
                <td>${formatearEncargadoParaVista(aplicarResaltado(reporte.encargado, "encargado", valorFiltro, columnaSeleccionada))}</td>
                <td>${aplicarResaltado(formatearFecha(reporte.fechaFinalizacion), "fechaFinalizacion", valorFiltro, columnaSeleccionada)}</td>
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

        if (resaltarFechas) {
            const celdasFecha = tablaCompletosBody.querySelectorAll("td:nth-child(4)");
            celdasFecha.forEach(celda => celda.classList.add("highlight"));
        }

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
                window.datosReportesCompletos = data; // ✅ Exponemos globalmente
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

        if (!columnaBD) return;

        datosFiltradosCompletos = datosReportesCompletos.filter(reporte => {
            let valor = reporte[columnaBD] ?? "";

            if (columnaBD === "encargado") {
                valor = extraerTextoPlano(valor);
            }

            if (columnaBD === "fechaFinalizacion") {
                valor = formatearFecha(valor); // ✅ convertir a DD-MM-YYYY
            }

            return valor.toString().toLowerCase().includes(valorFiltro);
        });

        resaltarFechas = false;
        paginaActualCompleto = 1;
        mostrarReportesCompletos(1);
    }

    function parseFechaDMY(fechaStr) {
        const partes = fechaStr.split("/");
        if (partes.length !== 3) return null;
        return new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
    }

    function filtrarPorRangoDeFechas() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        // ✅ Validación: no permitir si ambos están vacíos
        if (!startDate && !endDate) {
            Swal.fire("Advertencia", "Debes seleccionar al menos una fecha para filtrar.", "warning");
            return;
        }

        const start = startDate ? parseFechaDMY(startDate) : null;
        const end = endDate ? parseFechaDMY(endDate) : null;

        datosFiltradosCompletos = datosReportesCompletos.filter(reporte => {
            const fechaStr = reporte.fechaFinalizacion?.split(" ")[0];
            if (!fechaStr) return false;

            const fecha = new Date(fechaStr);

            if (start && end) {
                return fecha >= start && fecha <= end;
            } else if (start) {
                return fecha >= start;
            } else if (end) {
                return fecha <= end;
            }
            return false; // 🔒 nunca debe llegar aquí si validamos antes
        });

        datosFiltradosCompletos.sort((a, b) => new Date(a.fechaFinalizacion) - new Date(b.fechaFinalizacion));
        resaltarFechas = true;
        filterInputCompleto.value = "";
        paginaActualCompleto = 1;
        mostrarReportesCompletos(paginaActualCompleto);

        if (datosFiltradosCompletos.length === 0) {
            tablaCompletosBody.innerHTML = `
        <tr><td colspan="6" style="color: red; font-weight: bold;">❌ No hay reportes en este rango de fechas.</td></tr>`;
        }
    }

    function limpiarRangoFechas() {
        startDateInput.value = "";
        endDateInput.value = "";
        resaltarFechas = false;
        datosFiltradosCompletos = [...datosReportesCompletos];
        paginaActualCompleto = 1;
        mostrarReportesCompletos(paginaActualCompleto);
    }
    function limpiarHTMLParaExcel(html) {
        if (!html) return "N/A";
        const temporal = document.createElement("div");
        html = html.replace(/<br\s*\/?>/gi, '\n'); // Convertir <br> a \n
        temporal.innerHTML = html;
        return temporal.textContent.trim(); // Extraer solo el texto plano
    }
    function formatearEncargadoParaVista(textoPlano) {
        if (!textoPlano) return "N/A";

        // Convertir saltos de línea a <br>
        const conSaltos = textoPlano.replace(/\n/g, "<br>");

        // Convertir las etiquetas "SUPERVISOR:" y "SHIFT LEADER:" a negritas
        return conSaltos
            .replace(/SUPERVISOR:/gi, "<strong>SUPERVISOR:</strong>")
            .replace(/SHIFT LEADER:/gi, "<strong>SHIFT LEADER:</strong>");
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
                limpiarHTMLParaExcel(reporte.encargado),
                formatearFecha(reporte.fechaRegistro),
                formatearFecha(reporte.fechaFinalizacion),
                reporte.descripcion || "-",
                reporte.estatus,
                reporte.comentarios || "Sin comentarios"
            ]
        ];

        const ws = XLSX.utils.aoa_to_sheet(ws_data);

        // 📏 Ancho personalizado para cada columna
        ws["!cols"] = [
            { wch: 15 }, // Folio
            { wch: 20 }, // Nómina
            { wch: 80 }, // Encargado
            { wch: 20 }, // Fecha Registro
            { wch: 20 }, // Fecha Finalización
            { wch: 30 }, // Descripción
            { wch: 15 }, // Estatus
            { wch: 25 }  // Comentarios
        ];

        // 🧼 Forzar wrap text en TODAS las filas de la columna "Encargado" (columna C)
        for (let i = 2; i <= ws_data.length + 1; i++) {
            const celda = `C${i}`;
            if (ws[celda]) {
                ws[celda].s = { alignment: { wrapText: true } };
            }
        }

        wb.Sheets["Reporte"] = ws;

        // 🟢 Exportar con estilos activados
        XLSX.writeFile(wb, `Reporte_${reporte.folio}.xlsx`, { bookType: "xlsx", cellStyles: true });
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
    filterDateButton.addEventListener("click", filtrarPorRangoDeFechas);
    clearDateButton.addEventListener("click", limpiarRangoFechas);

    cargarReportesCompletos();

    window.cargarReportesCompletos = cargarReportesCompletos;

    window.moverReporteACompletados = function (nuevoReporte) {
        const yaExiste = datosReportesCompletos.some(r => String(r.folio) === String(nuevoReporte.folio));
        if (yaExiste) {
            console.log("⚠ Reporte ya existe en completados, se ignora:", nuevoReporte.folio);
            return;
        }

        console.log("📩 Reporte recibido en moverReporteACompletados:", nuevoReporte);
        datosReportesCompletos.unshift(nuevoReporte);
        datosFiltradosCompletos = [...datosReportesCompletos];
        mostrarReportesCompletos(1);
    };

    // 🟢 Flatpickr para inputs de fecha
    flatpickr("#start-date", {
        dateFormat: "d/m/Y",
        locale: "es"
    });
    flatpickr("#end-date", {
        dateFormat: "d/m/Y",
        locale: "es"
    });
});
