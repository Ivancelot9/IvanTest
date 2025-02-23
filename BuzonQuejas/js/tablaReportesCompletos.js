// finalizarReporte.js

document.addEventListener("DOMContentLoaded", function () {
    // Datos iniciales de reportes (Historial). (En un caso real, estos vendrían del backend)
    let datosReportes = [
        { folio: "001", nomina: "123456", encargado: "Juan Pérez", fechaRegistro: "10/02/2025", fechaFinalizacion: "-", descripcion: "Problema crítico en autenticación", estatus: "Pendiente" },
        { folio: "002", nomina: "654321", encargado: "María López", fechaRegistro: "11/02/2025", fechaFinalizacion: "-", descripcion: "Error en base de datos", estatus: "Pendiente" },
        // ... más reportes iniciales ...
    ];

    // Array para reportes finalizados (inicialmente vacío)
    let datosCompletos = [];

    // -------------------------------
    // Función para renderizar la tabla de Reportes Completos
    const filasPorPagina = 10;
    let paginaCompletos = 1;

    function renderReportesCompletos(pagina = 1) {
        const tablaBody = document.getElementById("tabla-completos-body");
        tablaBody.innerHTML = "";
        const inicio = (pagina - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const datosPagina = datosCompletos.slice(inicio, fin);

        datosPagina.forEach(reporte => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${reporte.folio}</td>
                <td>${reporte.nomina}</td>
                <td>${reporte.encargado}</td>
                <td>${reporte.fechaFinalizacion}</td>
                <td><button class="exportar-individual" data-folio="${reporte.folio}">Excel</button></td>
            `;
            tablaBody.appendChild(fila);

            // Agregar evento al botón "Excel" para exportar los datos de esa fila
            fila.querySelector(".exportar-individual").addEventListener("click", function() {
                const csvContent = "data:text/csv;charset=utf-8," +
                    "Folio,Número de Nómina,Encargado,Fecha Finalización\n" +
                    `${reporte.folio},${reporte.nomina},${reporte.encargado},${reporte.fechaFinalizacion}\n`;
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `reporte_${reporte.folio}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        });

        // Actualiza indicadores de paginación
        document.getElementById("pageIndicator-completo").textContent = `Página ${pagina}`;
        document.getElementById("prevPage-completo").disabled = pagina === 1;
        document.getElementById("nextPage-completo").disabled = fin >= datosCompletos.length;
    }

    document.getElementById("prevPage-completo").addEventListener("click", function () {
        if (paginaCompletos > 1) {
            paginaCompletos--;
            renderReportesCompletos(paginaCompletos);
        }
    });
    document.getElementById("nextPage-completo").addEventListener("click", function () {
        if ((paginaCompletos * filasPorPagina) < datosCompletos.length) {
            paginaCompletos++;
            renderReportesCompletos(paginaCompletos);
        }
    });

    // -------------------------------
    // Función para finalizar un reporte:
    // Recibe el folio y la fecha de finalización asignada
    function finalizarReporte(folio, fechaFinalizacion) {
        // Busca el reporte en datosReportes por folio
        const indice = datosReportes.findIndex(r => r.folio === folio);
        if (indice !== -1) {
            // Actualiza el reporte
            datosReportes[indice].fechaFinalizacion = fechaFinalizacion;
            datosReportes[indice].estatus = "Finalizado";
            // Mueve el reporte a datosCompletos
            datosCompletos.push(datosReportes[indice]);
            // Elimina el reporte del historial
            datosReportes.splice(indice, 1);
            // Se asume que la función mostrarReportes ya existe para renderizar la tabla de Historial
            mostrarReportes(1, datosReportes);
            // Reinicia la paginación de Reportes Completos y renderiza
            paginaCompletos = 1;
            renderReportesCompletos(paginaCompletos);
        }
    }

    // Exponer la función para poder llamarla desde el modal de fecha, por ejemplo:
    window.finalizarReporte = finalizarReporte;

    // Inicialmente se renderiza la tabla de Reportes Completos (estará vacía)
    renderReportesCompletos(paginaCompletos);
});
