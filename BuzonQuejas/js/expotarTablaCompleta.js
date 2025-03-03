document.addEventListener("DOMContentLoaded", function () {
    const exportarPaginaBtn = document.getElementById("exportarPaginaCompletos");

    exportarPaginaBtn.addEventListener("click", function () {
        let datosReportesPendientes = JSON.parse(localStorage.getItem("reportesPendientes")) || [];
        let reportesVisibles = [];

        // 🔍 Obtener los folios visibles en la tabla 2
        document.querySelectorAll("#tabla-completos-body tr").forEach(fila => {
            let celdas = fila.getElementsByTagName("td");
            if (celdas.length > 0) {
                let folio = celdas[0].textContent.trim();
                reportesVisibles.push(folio);
            }
        });

        // 🔎 Verificar qué se está obteniendo
        console.log("Folios visibles en la tabla 2:", reportesVisibles);
        console.log("Reportes en localStorage (Pendientes):", datosReportesPendientes);

        // 🔎 Buscar reportes completos en la tabla 1
        let reportesParaExportar = datosReportesPendientes.filter(reporte => {
            let coincide = reportesVisibles.includes(reporte.folio.trim());
            console.log(`Comparando: ${reporte.folio} - Coincide: ${coincide}`);
            return coincide;
        });

        console.log("Reportes encontrados para exportar:", reportesParaExportar);

        if (reportesParaExportar.length === 0) {
            Swal.fire("Error", "No se encontraron datos completos para exportar.", "error");
            return;
        }

        // 📥 Generar y descargar el archivo Excel
        generarExcel(reportesParaExportar);
    });

    function generarExcel(reportes) {
        let wb = XLSX.utils.book_new();
        wb.Props = {
            Title: "Reportes Exportados",
            Subject: "Reporte Detallado",
            Author: "Sistema",
            CreatedDate: new Date()
        };

        wb.SheetNames.push("Reporte");

        let ws_data = [
            ["Folio", "Número de Nómina", "Encargado", "Fecha Registro", "Fecha Finalización", "Descripción", "Comentarios", "Estatus"]
        ];

        reportes.forEach(reporte => {
            let comentarios = reporte.comentarios ? reporte.comentarios.join(" | ") : "Sin comentarios";
            ws_data.push([
                reporte.folio,
                reporte.nomina,
                reporte.encargado,
                reporte.fechaRegistro,
                reporte.fechaFinalizacion || "-",
                reporte.descripcion,
                comentarios,
                reporte.estatus
            ]);
        });

        let ws = XLSX.utils.aoa_to_sheet(ws_data);
        ws["!cols"] = [
            { wch: 12 },
            { wch: 18 },
            { wch: 22 },
            { wch: 15 },
            { wch: 15 },
            { wch: 50 },
            { wch: 50 },
            { wch: 15 }
        ];

        wb.Sheets["Reporte"] = ws;
        XLSX.writeFile(wb, `Reporte_Pagina_${document.getElementById("pageIndicator-completo").textContent}.xlsx`);
    }
});
