document.addEventListener("DOMContentLoaded", function () {
    const tabs = document.querySelectorAll(".tab-item");
    const steps = document.querySelectorAll(".content");
    const btnSiguiente = document.getElementById("btnSiguiente");

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

        // 🔹 Cambiar el texto del botón en la última pestaña
        btnSiguiente.textContent = pasoActual === steps.length - 1 ? "Finalizar" : "Siguiente";
    }

    btnSiguiente.addEventListener("click", function () {
        if (pasoActual < steps.length - 1) {
            pasoActual++; // Avanzar al siguiente paso
        } else {
            // 🔹 Antes de enviar, validar los datos obligatorios
            if (!validarReporte()) {
                return; // ⛔ Si falta un dato, no avanza ni envía
            }

            // 🔹 Mostrar opciones después de enviar el reporte (botones intercambiados)
            Swal.fire({
                title: "¡Reporte enviado!",
                text: "¿Qué deseas hacer ahora?",
                icon: "success",
                showCancelButton: true,
                cancelButtonText: "Cerrar sesión",
                confirmButtonText: "Escribir otro reporte",
                timer: 120000, // ⏳ 2 minutos
                timerProgressBar: true,
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false
            }).then((result) => {
                if (result.isConfirmed) {
                    reiniciarFormulario();
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    cerrarSesion(); // ← función para cerrar sesión correctamente
                } else if (result.dismiss === Swal.DismissReason.timer) {
                    // ⏱ Tiempo agotado, cerrar sesión automáticamente
                    Swal.fire({
                        icon: 'info',
                        title: 'Sesión cerrada por inactividad',
                        text: 'Fuiste redirigido al login por inactividad.',
                        showConfirmButton: false,
                        timer: 2500
                    }).then(() => {
                        cerrarSesion();
                    });
                }
            });

            return;
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

    // 🔹 Función para reiniciar el formulario y volver al primer paso
    function reiniciarFormulario() {
        document.getElementById("reporte").value = ""; // Limpiar la queja
        document.getElementById("area").value = ""; // Limpiar selección de área
        document.getElementById("supervisor").value = ""; // Limpiar supervisor
        document.getElementById("shiftLeader").value = ""; // Limpiar shift leader

        pasoActual = 0; // Volver al primer paso
        actualizarVista();
    }

    // 🔹 Inicializar la vista correctamente
    actualizarVista();
});
