document.addEventListener("DOMContentLoaded", function () {
    const exportarPaginaBtn = document.getElementById("exportarPaginaCompletos");

    exportarPaginaBtn.addEventListener("click", function () {
        console.log("🟢 Botón de exportar página fue clickeado");

        let foliosVisibles = [];

        document.querySelectorAll("#tabla-completos-body tr").forEach(fila => {
            const celdaFolio = fila.querySelector("td");
            if (celdaFolio) {
                const folio = celdaFolio.textContent.trim();
                foliosVisibles.push(folio);
                console.log("🔍 Fila con folio visible:", folio);
            }
        });

        if (typeof datosReportesCompletos === "undefined") {
            Swal.fire("Error", "No se pudieron encontrar los datos en memoria.", "error");
            return;
        }

        const reportesParaExportar = datosReportesCompletos.filter(rep =>
            foliosVisibles.includes(rep.folio.toString())
        );

        console.log("📦 Reportes a exportar:", reportesParaExportar);

        if (reportesParaExportar.length === 0) {
            Swal.fire("Error", "No se encontraron reportes completos para exportar.", "error");
            return;
        }

        generarExcel(reportesParaExportar);
    });

    function formatearFecha(fechaOriginal) {
        if (!fechaOriginal) return "-";
        const partes = fechaOriginal.split(" ")[0].split("-");
        if (partes.length === 3) {
            return `${partes[2]}-${partes[1]}-${partes[0]}`; // DD-MM-YYYY
        }
        return fechaOriginal;
    }

    function generarExcel(reportes) {
        let wb = XLSX.utils.book_new();
        wb.Props = {
            Title: "Reportes Exportados",
            Subject: "Reporte Detallado",
            Author: "Sistema",
            CreatedDate: new Date()
        };

        wb.SheetNames.push("Reporte");

        const ws_data = [
            ["Folio", "Número de Nómina", "Encargado", "Fecha Registro", "Fecha Finalización", "Descripción", "Comentarios", "Estatus"]
        ];

        reportes.forEach(reporte => {
            ws_data.push([
                reporte.folio,
                reporte.nomina,
                reporte.encargado,
                formatearFecha(reporte.fechaRegistro),
                formatearFecha(reporte.fechaFinalizacion) || "-",
                reporte.descripcion || "Sin descripción",
                reporte.comentarios || "Sin comentarios",
                reporte.estatus
            ]);
        });

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

        XLSX.writeFile(wb, `Reportes_Completos_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
    }
});
