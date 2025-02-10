document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 Script del modal cargado correctamente");

    const modal = document.getElementById("modal-detalle-reporte");
    const closeModal = document.querySelector(".close-modal");
    const botonesMostrar = document.querySelectorAll(".mostrar-reporte");

    if (!modal || !closeModal || botonesMostrar.length === 0) {
        console.error("❌ ERROR: No se encontró el modal, el botón de cerrar o los botones de reporte.");
        return;
    }

    // ✅ EVENTO PARA ABRIR EL MODAL
    botonesMostrar.forEach(boton => {
        boton.addEventListener("click", () => {  // 🔥 Se elimina (event) porque no se usa
            console.log("✅ Intentando abrir el modal...");
            modal.style.display = "flex"; // SOLO SE ACTIVA AQUÍ
        });
    });

    // ✅ EVENTO PARA CERRAR EL MODAL (BOTÓN "X")
    closeModal.addEventListener("click", () => {  // 🔥 Aquí tampoco se usa (event), así que se elimina
        console.log("❌ Cerrar modal");
        modal.style.display = "none";
    });

    // ✅ CERRAR EL MODAL AL HACER CLIC FUERA DE ÉL
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            console.log("❌ Cerrar modal al hacer clic fuera");
            modal.style.display = "none";
        }
    });
});
