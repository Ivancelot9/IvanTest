document.addEventListener("DOMContentLoaded", function () {
    const tabs = document.querySelectorAll(".tab-item");
    const steps = document.querySelectorAll(".content");
    const btnSiguiente = document.getElementById("btnSiguiente");
    const btnFinalizar = document.getElementById("btnFinalizar");

    let pasoActual = 0; // Inicia en la pestaña "Datos"

    function cerrarSesion() {
        fetch("https://grammermx.com/IvanTest/BuzonQuejas/dao/cerrarSesionUsuario.php")
            .then(() => {
                window.location.href = "https://grammermx.com/IvanTest/BuzonQuejas/loginUsuario.php";
            })
            .catch((error) => {
                console.error("Error al cerrar sesión:", error);
            });
    }

    function actualizarVista() {
        // 🔹 Ocultar todas las pestañas y contenidos
        tabs.forEach(tab => tab.classList.remove("active"));
        steps.forEach(step => step.classList.add("hidden"));

        // 🔹 Activar solo la pestaña y contenido actual
        tabs[pasoActual].classList.add("active");
        steps[pasoActual].classList.remove("hidden");

        // 🔹 Mostrar el botón adecuado (Finalizar solo en último paso)
        if (pasoActual === steps.length - 1) {
            btnSiguiente.classList.add("hidden");
            btnFinalizar.classList.remove("hidden");
        } else {
            btnSiguiente.classList.remove("hidden");
            btnFinalizar.classList.add("hidden");
        }
    }

    btnSiguiente.addEventListener("click", function () {
        console.log("👉 Click en botón. Paso actual:", pasoActual);

        // Validar el paso actual antes de avanzar
        if (!validarReporte(pasoActual)) return;

        // Avanzar al siguiente paso
        pasoActual++;
        actualizarVista();
    });

    // 🔹 Permitir que las pestañas sean botones para navegar
    tabs.forEach((tab, index) => {
        tab.addEventListener("click", function () {
            pasoActual = index;
            actualizarVista();
        });
    });

    // 🔹 Función para reiniciar el formulario y volver al primer paso
    function reiniciarFormulario() {
        document.getElementById("reporte").value = "";
        document.getElementById("area").value = "";
        document.getElementById("supervisor").value = "";
        document.getElementById("shiftLeader").value = "";

        pasoActual = 0;
        actualizarVista();
    }

    // 🔹 Exponer reinicio globalmente si lo usas en otro archivo
    window.reiniciarFormulario = reiniciarFormulario;
    window.cerrarSesion = cerrarSesion;

    // 🔹 Inicializar la vista correctamente
    actualizarVista();
});
