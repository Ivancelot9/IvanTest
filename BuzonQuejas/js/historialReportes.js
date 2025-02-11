document.addEventListener("DOMContentLoaded", function () {
    // 🔹 Crear el modal de reporte una sola vez
    let reporteModal = document.createElement("div");
    reporteModal.id = "reporte-modal";
    reporteModal.style.display = "none"; // Inicialmente oculto
    reporteModal.innerHTML = `
    <div class="modal-content">
        <span class="close-modal">&times;</span>
        <div class="reporte-container">
            <h2>Detalles del Reporte</h2>
            <p><strong>Folio:</strong> <span id="detalle-folio"></span></p>
            <p><strong>Área:</strong> <span id="detalle-area"></span></p>
            <p><strong>Fecha:</strong> <span id="detalle-fecha"></span></p>
            <p><strong>Estado:</strong> <span id="detalle-estado"></span></p>
            <p><strong>Descripción:</strong> <span id="detalle-descripcion"></span></p>
        </div>
        <div class="comentarios-container">
            <!-- La sección de comentarios la hacemos después -->
        </div>
    </div>
`;

    // Agregar el modal al body para que esté por encima de todo
    document.body.appendChild(reporteModal);

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

            // Llenar el modal con los datos
            document.getElementById("detalle-folio").textContent = folio;
            document.getElementById("detalle-area").textContent = datos.area;
            document.getElementById("detalle-fecha").textContent = datos.fecha;
            document.getElementById("detalle-estado").textContent = datos.estado;
            document.getElementById("detalle-descripcion").textContent = datos.descripcion;

            // Mostrar el modal
            reporteModal.style.display = "flex";
        });
    });

    // Evento para cerrar el modal
    reporteModal.querySelector(".close-modal").addEventListener("click", function () {
        reporteModal.style.display = "none";
    });

    // Cerrar modal al hacer clic fuera de él
    window.addEventListener("click", function (e) {
        if (e.target === reporteModal) {
            reporteModal.style.display = "none";
        }
    });
});
