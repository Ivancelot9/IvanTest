document.addEventListener("DOMContentLoaded", function () {
    const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", function (e) {
            e.preventDefault(); // Evita el comportamiento predeterminado

            // 🔥 Ocultar contenido del dashboard y mostrar la pantalla de carga
            document.querySelector(".sidebar").style.display = "none";
            document.querySelector(".main-content").style.display = "none";

            const loadingScreen = document.getElementById("loading-screen");
            loadingScreen.style.display = "flex"; // 🔹 Mostrar pantalla de salida

            // 🔄 Animar al superhéroe volando de izquierda a derecha
            const heroLoading = document.getElementById("hero-loading");
            heroLoading.style.animation = "fly-right 2s ease-in-out forwards";

            // 📌 Hacer la solicitud al servidor para cerrar sesión
            fetch("https://grammermx.com/IvanTest/BuzonQuejas/dao/cerrarSesion.php", { method: 'POST' })
                .then(response => {
                    if (response.ok) {
                        setTimeout(() => {
                            window.location.href = "login.php"; // 🔄 Redirigir al login
                        }, 2500); // Esperar el tiempo de la animación
                    } else {
                        alert("Error al cerrar sesión. Inténtalo nuevamente.");
                    }
                })
                .catch(error => console.error("Error al cerrar sesión:", error));
        });
    }
});