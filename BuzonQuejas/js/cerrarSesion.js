document.addEventListener("DOMContentLoaded", function () {
    const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", function (e) {
            e.preventDefault(); // Evita que recargue la página

            // 🔥 Ocultar contenido del dashboard y mostrar la pantalla de carga
            document.querySelector(".sidebar").style.display = "none";
            document.querySelector(".main-content").style.display = "none";

            const loadingScreen = document.getElementById("loading-screen");
            const heroLoading = document.getElementById("hero-loading");

            // 🟢 Mostrar la pantalla de carga y reiniciar la animación
            loadingScreen.style.opacity = "1";
            loadingScreen.style.visibility = "visible";

            // 🔄 Reiniciar la animación eliminando clases y aplicándola de nuevo
            heroLoading.style.animation = "none"; // Se elimina la animación anterior
            void heroLoading.offsetWidth; // 🔥 Truco para reiniciar la animación correctamente
            heroLoading.style.animation = "fly-right 2s ease-in-out forwards"; // Activar animación

            // 📌 Hacer la solicitud al servidor para cerrar sesión
            fetch('dao/cerrarSesion.php', { method: 'POST' })
                .then(response => {
                    if (response.ok) {
                        setTimeout(() => {
                            window.location.href = "index.php"; // 🔄 Redirigir al login
                        }, 2500); // Esperar el tiempo de la animación
                    } else {
                        alert("Error al cerrar sesión. Inténtalo nuevamente.");
                    }
                })
                .catch(error => console.error("Error al cerrar sesión:", error));
        });
    }
});