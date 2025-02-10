document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 Script cargado correctamente");

    // 📌 Referencias al modal y al botón de cerrar
    const modal = document.getElementById("modal-detalle-reporte");
    const closeModal = document.querySelector(".close-modal");

    // 📌 Verificación de existencia del modal
    if (!modal || !closeModal) {
        console.error("❌ ERROR: No se encontró el modal o el botón de cerrar.");
        return;
    }

    // 📌 Delegación de eventos para manejar clics en "Mostrar Reporte"
    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("mostrar-reporte")) {
            console.log("✅ Botón de Mostrar Reporte clickeado");

            const folio = event.target.getAttribute("data-folio");

            // 📌 Simulación de datos del reporte
            const reportes = {
                "001": { folio: "001", nomina: "123456", area: "Sistemas", descripcion: "Soporte técnico realizado" },
                "002": { folio: "002", nomina: "654321", area: "Recursos Humanos", descripcion: "Evaluación de personal" }
            };

            if (reportes[folio]) {
                // 📌 Verifica que los elementos existen antes de modificar su contenido
                const detalleFolio = document.getElementById("detalle-folio");
                const detalleNomina = document.getElementById("detalle-nomina");
                const detalleArea = document.getElementById("detalle-area");
                const detalleDescripcion = document.getElementById("detalle-descripcion"); // 🆕 Asegura que este ID exista en el HTML

                if (!detalleFolio || !detalleNomina || !detalleArea || !detalleDescripcion) {
                    console.error("❌ ERROR: Faltan elementos en el modal.");
                    return;
                }

                // 📌 Asignar datos al modal
                detalleFolio.textContent = reportes[folio].folio;
                detalleNomina.textContent = reportes[folio].nomina;
                detalleArea.textContent = reportes[folio].area;
                detalleDescripcion.textContent = reportes[folio].descripcion; // 🆕 Nueva asignación

                // 📌 Mostrar el modal correctamente
                modal.style.display = "flex";
                modal.style.alignItems = "center";
                modal.style.justifyContent = "center";
            } else {
                console.warn("⚠️ No hay datos para este folio.");
            }
        }
    });

    // 📌 Cerrar modal al hacer clic en "✖"
    closeModal.addEventListener("click", () => {
        console.log("❌ Cerrar modal");
        modal.style.display = "none";
    });

    // 📌 Cerrar modal al hacer clic fuera de él
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            console.log("❌ Cerrar modal al hacer clic fuera");
            modal.style.display = "none";
        }
    });
});
