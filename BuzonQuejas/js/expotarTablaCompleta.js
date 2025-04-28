/* --- JS: js/exportarTablaCompleta.js --- */
/**
 * @file exportarTablaCompleta.js
 * @description
 * Permite exportar la vista actual de reportes completados a un archivo Excel:
 *  1. Recopila los folios visibles en la tabla HTML.
 *  2. Filtra los datos cargados en memoria (`datosReportesCompletos`).
 *  3. Genera un archivo Excel con las columnas definidas y ajusta anchos.
 *  4. Descarga el archivo nombrado con la fecha actual.
 *
 * Requiere:
 *  - Un botón con id="exportarPaginaCompletos".
 *  - Variable global `datosReportesCompletos`: array de objetos con propiedades:
 *      folio, nomina, encargado, fechaRegistro, fechaFinalizacion,
 *      descripcion, comentarios, estatus.
 *  - SweetAlert2 (Swal) para mostrar errores.
 *  - Library SheetJS (XLSX) para generar archivos Excel.
 */

document.addEventListener("DOMContentLoaded", function () {
    /* ─────────────────────────────────────────
       1. Referencia al botón de exportación
    ───────────────────────────────────────── */
    const exportarPaginaBtn = document.getElementById("exportarPaginaCompletos");

    exportarPaginaBtn.addEventListener("click", function () {
        console.log("🟢 Botón de exportar página fue clickeado");

        /* ─────────────────────────────────────────
           2. Recopilar folios visibles en la tabla
        ───────────────────────────────────────── */
        let foliosVisibles = [];
        document.querySelectorAll("#tabla-completos-body tr").forEach(fila => {
            const celdaFolio = fila.querySelector("td");
            if (celdaFolio) {
                const folio = celdaFolio.textContent.trim();
                foliosVisibles.push(folio);
                console.log("🔍 Fila con folio visible:", folio);
            }
        });

        /* ─────────────────────────────────────────
           3. Validar existencia de datos en memoria
        ───────────────────────────────────────── */
        if (typeof datosReportesCompletos === "undefined") {
            Swal.fire("Error", "No se pudieron encontrar los datos en memoria.", "error");
            return;
        }

        /* ─────────────────────────────────────────
           4. Filtrar reportes para exportar
        ───────────────────────────────────────── */
        const reportesParaExportar = datosReportesCompletos.filter(rep =>
            foliosVisibles.includes(rep.folio.toString())
        );
        console.log("📦 Reportes a exportar:", reportesParaExportar);

        if (reportesParaExportar.length === 0) {
            Swal.fire("Error", "No se encontraron reportes completos para exportar.", "error");
            return;
        }

        /* ─────────────────────────────────────────
           5. Generar y descargar el archivo Excel
        ───────────────────────────────────────── */
        generarExcel(reportesParaExportar);
    });

    /* ─────────────────────────────────────────
       6. Función utilitaria: formatear fechas
    ───────────────────────────────────────── */
    function formatearFecha(fechaOriginal) {
        if (!fechaOriginal) return "-";
        const partes = fechaOriginal.split(" ")[0].split("-");
        if (partes.length === 3) {
            // Convertir de YYYY-MM-DD a DD-MM-YYYY
            return `${partes[2]}-${partes[1]}-${partes[0]}`;
        }
        return fechaOriginal;
    }

    /* ─────────────────────────────────────────
       7. Función principal: generarExcel
    ───────────────────────────────────────── */
    function generarExcel(reportes) {
        // 7.1 Crear nuevo workbook
        let wb = XLSX.utils.book_new();
        wb.Props = {
            Title: "Reportes Exportados",
            Subject: "Reporte Detallado",
            Author: "Sistema",
            CreatedDate: new Date()
        };
        wb.SheetNames.push("Reporte");

        // 7.2 Definir cabeceras y datos
        const ws_data = [
            ["Folio", "Número de Nómina", "Encargado", "Fecha Registro", "Fecha Finalización", "Descripción", "Comentarios", "Estatus"]
        ];
        reportes.forEach(reporte => {
            ws_data.push([
                reporte.folio,
                reporte.nomina,
                reporte.encargado,
                formatearFecha(reporte.fechaRegistro),
                formatearFecha(reporte.fechaFinalizacion),
                reporte.descripcion || "Sin descripción",
                reporte.comentarios || "Sin comentarios",
                reporte.estatus
            ]);
        });

        // 7.3 Crear worksheet y ajustar anchos de columnas
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
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

        // 7.4 Descargar con nombre que incluye fecha actual usando fecha local
        XLSX.writeFile(wb, `Reportes_Completos_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
    }
});
