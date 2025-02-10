document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 Script del modal cargado correctamente");

    const modal = document.getElementById("modal-detalle-reporte");
    const closeModal = document.querySelector(".close-modal");
    const botonesMostrar = document.querySelectorAll(".mostrar-reporte");

    if (!modal || !closeModal || botonesMostrar.length === 0) {
        console.error("❌ ERROR: No se encontró el modal, el botón de cerrar o los botones de reporte.");
        return;
    }

    const reportes = {
        "001": { folio: "001", nomina: "123456", area: "Sistemas", descripcion: "Soporte técnico realizado", estatus: "Completado" },
        "002": { folio: "002", nomina: "654321", area: "Recursos Humanos", descripcion: "Evaluación de personal", estatus: "Pendiente" }
    };

    botonesMostrar.forEach(boton => {
        boton.addEventListener("click", (event) => {
            console.log("✅ Botón de Mostrar Reporte clickeado");

            const folio = event.target.getAttribute("data-folio");

            if (reportes[folio]) {
                document.getElementById("detalle-folio").textContent = reportes[folio].folio;
                document.getElementById("detalle-nomina").textContent = reportes[folio].nomina;
                document.getElementById("detalle-area").textContent = reportes[folio].area;
                document.getElementById("detalle-descripcion").textContent = reportes[folio].descripcion;
                document.getElementById("detalle-estatus").textContent = reportes[folio].estatus;

                // 📌 Mostrar el modal correctamente
                modal.style.display = "flex"; // Se activa con flexbox
                modal.style.alignItems = "center";
                modal.style.justifyContent = "center";
            } else {
                console.warn("⚠️ No hay datos para este folio.");
            }
        });
    });

    closeModal.addEventListener("click", () => {
        console.log("❌ Cerrar modal");
        modal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            console.log("❌ Cerrar modal al hacer clic fuera");
            modal.style.display = "none";
        }
    });
});
