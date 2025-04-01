document.addEventListener("DOMContentLoaded", function () {
    const exportarPaginaBtn = document.getElementById("exportarPaginaCompletos");

    exportarPaginaBtn.addEventListener("click", function () {
        console.log("🟢 Botón de exportar página fue clickeado");
        let reportesParaExportar = [];

        // 🔍 Recorremos las filas visibles de la tabla completados
        document.querySelectorAll("#tabla-completos-body tr").forEach(fila => {
            console.log("🔍 Fila HTML encontrada:", fila);
            let celdas = fila.getElementsByTagName("td");

            if (celdas.length >= 7) {
                let folio = celdas[0].textContent.trim();
                let nomina = celdas[1].textContent.trim();
                let encargado = celdas[2].textContent.trim();
                let fechaRegistro = celdas[3].textContent.trim();
                let fechaFinalizacion = celdas[4].textContent.trim();
                let estatus = celdas[5].textContent.trim();

                // ✅ Obtenemos descripción y comentarios desde atributos del botón
                let botonConvertidor = fila.querySelector(".convertidor");
                let descripcion = botonConvertidor?.getAttribute("data-descripcion") || "Sin descripción";
                let comentarios = botonConvertidor?.getAttribute("data-comentarios") || "Sin comentarios";

                reportesParaExportar.push({
                    folio,
                    nomina,
                    encargado,
                    fechaRegistro,
                    fechaFinalizacion,
                    descripcion,
                    comentarios,
                    estatus
                });
            }
        });

        if (reportesParaExportar.length === 0) {
            Swal.fire("Error", "No se encontraron reportes completos para exportar.", "error");
            return;
        }

        generarExcel(reportesParaExportar);
    });

    // 📦 Función para generar el archivo Excel
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
            ws_data.push([
                reporte.folio,
                reporte.nomina,
                reporte.encargado,
                reporte.fechaRegistro,
                reporte.fechaFinalizacion || "-",
                reporte.descripcion,
                reporte.comentarios,
                reporte.estatus
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(ws_data);

        // 📏 Ajuste del ancho de columnas
        ws["!cols"] = [
            { wch: 12 },  // Folio
            { wch: 18 },  // Nómina
            { wch: 30 },  // Encargado
            { wch: 18 },  // Fecha Registro
            { wch: 18 },  // Fecha Finalización
            { wch: 60 },  // Descripción
            { wch: 60 },  // Comentarios
            { wch: 15 }   // Estatus
        ];

        wb.Sheets["Reporte"] = ws;

        // 📤 Descargar archivo con nombre dinámico
        XLSX.writeFile(wb, `Reportes_Completos_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
    }
});
