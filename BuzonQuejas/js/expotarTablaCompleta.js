document.addEventListener("DOMContentLoaded", function () {
    const exportarPaginaBtn = document.getElementById("exportarPaginaCompletos");

    exportarPaginaBtn.addEventListener("click", function () {
        let datosReportesCompletos = JSON.parse(localStorage.getItem("reportesCompletos")) || []; // 🔹 Usar la tabla correcta

        let reportesVisibles = [];

        // 🔍 Obtener los folios visibles en la tabla de reportes completados (página actual)
        document.querySelectorAll("#tabla-completos-body tr").forEach(fila => {
            let celdas = fila.getElementsByTagName("td");
            if (celdas.length > 0) {
                let folio = celdas[0].textContent.trim();
                reportesVisibles.push(folio);
            }
        });

        console.log("Folios visibles en la tabla 2:", reportesVisibles);
        console.log("Reportes en localStorage (Completos):", datosReportesCompletos);

        // 🔎 Buscar los reportes completos según los folios de la tabla 2
        let reportesParaExportar = datosReportesCompletos.filter(reporte =>
            reportesVisibles.includes(reporte.folio.toString().trim())
        );

        console.log("Reportes encontrados para exportar:", reportesParaExportar);

        if (reportesParaExportar.length === 0) {
            Swal.fire("Error", "No se encontraron reportes completos para exportar.", "error");
            return;
        }

        // 📥 Generar y descargar el archivo Excel
        generarExcel(reportesParaExportar);
    });

    // 📌 Función para generar el archivo Excel
    function generarExcel(reportes) {
        let wb = XLSX.utils.book_new();
        wb.Props = {
            Title: "Reportes Exportados",
            Subject: "Reporte Detallado",
            Author: "Sistema",
            CreatedDate: new Date()
        };

        wb.SheetNames.push("Reporte");

        // 📄 Cabeceras del archivo Excel
        let ws_data = [
            ["Folio", "Número de Nómina", "Encargado", "Fecha Registro", "Fecha Finalización", "Descripción", "Comentarios", "Estatus"]
        ];

        // 📌 Agregar datos de los reportes completos
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

        // 📌 Ajustar ancho de columnas automáticamente
        ws["!cols"] = [
            { wch: 12 },  // Folio
            { wch: 18 },  // Número de Nómina
            { wch: 22 },  // Encargado
            { wch: 15 },  // Fecha Registro
            { wch: 15 },  // Fecha Finalización
            { wch: 50 },  // Descripción
            { wch: 50 },  // Comentarios
            { wch: 15 }   // Estatus
        ];

        wb.Sheets["Reporte"] = ws;

        // 📥 Descargar el archivo Excel
        XLSX.writeFile(wb, `Reportes_Completos_Pagina_${document.getElementById("pageIndicator-completo").textContent}.xlsx`);
    }
});
