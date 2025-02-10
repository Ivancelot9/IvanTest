document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal-detalle-reporte");
    const closeModal = document.querySelector(".close-modal");

    // 📌 Delegar eventos a los botones de "Mostrar Reporte"
    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("mostrar-reporte")) {
            const folio = event.target.getAttribute("data-folio");

            // 📌 Simulación de datos del reporte
            const reportes = {
                "001": { folio: "001", nomina: "123456", area: "Sistemas" },
                "002": { folio: "002", nomina: "654321", area: "Recursos Humanos" }
            };

            if (reportes[folio]) {
                document.getElementById("detalle-folio").textContent = reportes[folio].folio;
                document.getElementById("detalle-nomina").textContent = reportes[folio].nomina;
                document.getElementById("detalle-area").textContent = reportes[folio].area;
            }

            modal.style.display = "flex";
        }
    });

    // 📌 Cerrar modal al hacer clic en "✖"
    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // 📌 Cerrar modal al hacer clic fuera de él
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});