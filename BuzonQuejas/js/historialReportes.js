document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal-detalle-reporte");
    const closeModal = document.querySelector(".close-modal");

    // Delegación de eventos para manejar clics en "Mostrar Reporte"
    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("mostrar-reporte")) {
            const folio = event.target.getAttribute("data-folio");

            // Simulación de datos del reporte
            const reportes = {
                "001": {
                    folio: "001",
                    nomina: "123456",
                    area: "Sistemas",
                    descripcion: "Reporte de prueba 1",
                    estatus: "Completado"
                },
                "002": {
                    folio: "002",
                    nomina: "654321",
                    area: "Recursos Humanos",
                    descripcion: "Reporte de prueba 2",
                    estatus: "Pendiente"
                }
            };

            if (reportes[folio]) {
                document.getElementById("detalle-folio").textContent = reportes[folio].folio;
                document.getElementById("detalle-nomina").textContent = reportes[folio].nomina;
                document.getElementById("detalle-area").textContent = reportes[folio].area;
                document.getElementById("detalle-descripcion").textContent = reportes[folio].descripcion;
                document.getElementById("detalle-estatus").textContent = reportes[folio].estatus;
            }

            modal.classList.add("show");
        }
    });

    // Cerrar modal al hacer clic en "✖"
    closeModal.addEventListener("click", () => {
        modal.classList.remove("show");
    });

    // Cerrar modal al hacer clic fuera de él
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.classList.remove("show");
        }
    });
});