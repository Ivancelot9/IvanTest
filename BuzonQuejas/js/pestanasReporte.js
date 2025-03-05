document.addEventListener("DOMContentLoaded", function () {
    const tabs = document.querySelectorAll(".tab-item");
    const steps = document.querySelectorAll(".content");
    const btnSiguiente = document.getElementById("btnSiguiente");

    let pasoActual = 0; // Inicia en la pestaña "Datos"

    function actualizarVista() {
        // 🔹 Ocultar todas las pestañas y contenidos
        tabs.forEach(tab => tab.classList.remove("active"));
        steps.forEach(step => step.classList.add("hidden"));

        // 🔹 Activar solo la pestaña y contenido actual
        tabs[pasoActual].classList.add("active");
        steps[pasoActual].classList.remove("hidden");

        // 🔹 Cambiar el texto del botón en la última pestaña
        btnSiguiente.textContent = pasoActual === steps.length - 1 ? "Finalizar" : "Siguiente";
    }

    btnSiguiente.addEventListener("click", function () {
        if (pasoActual < steps.length - 1) {
            pasoActual++; // Avanzar al siguiente paso
        } else {
            Swal.fire({
                title: "¡Reporte listo!",
                text: "Has completado tu reporte.",
                icon: "success",
                confirmButtonText: "Aceptar"
            });
            return; // Detener ejecución para evitar avanzar más
        }
        actualizarVista();
    });

    // 🔹 Permitir que las pestañas sean botones para navegar
    tabs.forEach((tab, index) => {
        tab.addEventListener("click", function () {
            pasoActual = index; // Cambia al paso correspondiente según la pestaña clickeada
            actualizarVista();
        });
    });

    // 🔹 Inicializar la vista correctamente
    actualizarVista();
});
