document.addEventListener("DOMContentLoaded", function () {
    const historialReportes = document.getElementById("historial-reportes");

    // 🔹 Crear el contenedor del reporte una sola vez
    let reporteDetalle = document.createElement("div");
    reporteDetalle.id = "reporte-detalle";
    reporteDetalle.style.display = "none"; // Inicialmente oculto
    reporteDetalle.innerHTML = `
        <div class="reporte-contenedor">
            <h2>Detalles del Reporte</h2>
            <p><strong>Folio:</strong> <span id="detalle-folio"></span></p>
            <p><strong>Área:</strong> <span id="detalle-area"></span></p>
            <p><strong>Fecha:</strong> <span id="detalle-fecha"></span></p>
            <p><strong>Estado:</strong> <span id="detalle-estado"></span></p>
            <p><strong>Descripción:</strong> <span id="detalle-descripcion"></span></p>
            <button id="cerrar-reporte">Cerrar</button>
        </div>
    `;

    // Agregar el contenedor al DOM antes de la tabla
    historialReportes.insertBefore(reporteDetalle, historialReportes.firstChild);

    // Seleccionar todos los botones "Mostrar Reporte"
    document.querySelectorAll(".mostrar-reporte").forEach((boton) => {
        boton.addEventListener("click", function () {
            const folio = this.getAttribute("data-folio");

            // Simulación de carga de datos del reporte
            const reportes = {
                "001": { area: "Sistemas", fecha: "10/02/2025", estado: "En revisión", descripcion: "Reporte detallado del folio 001." },
                "002": { area: "Recursos Humanos", fecha: "11/02/2025", estado: "Pendiente", descripcion: "Reporte detallado del folio 002." }
            };

            // Obtener datos del reporte
            const datos = reportes[folio] || { area: "Desconocido", fecha: "N/A", estado: "N/A", descripcion: "No hay información." };

            // Llenar el reporte con los datos
            document.getElementById("detalle-folio").textContent = folio;
            document.getElementById("detalle-area").textContent = datos.area;
            document.getElementById("detalle-fecha").textContent = datos.fecha;
            document.getElementById("detalle-estado").textContent = datos.estado;
            document.getElementById("detalle-descripcion").textContent = datos.descripcion;

            // Mostrar el reporte
            reporteDetalle.style.display = "block";
        });
    });

    // Evento para cerrar el reporte
    document.getElementById("cerrar-reporte").addEventListener("click", function () {
        reporteDetalle.style.display = "none";
    });
});
