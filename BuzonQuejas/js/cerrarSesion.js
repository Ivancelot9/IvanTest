document.addEventListener("DOMContentLoaded", function () {
    const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", function (e) {
            e.preventDefault();

            document.querySelector(".sidebar").style.display = "none";
            document.querySelector(".main-content").style.display = "none";

            const loadingScreen = document.getElementById("loading-screen");
            const heroLoading = document.getElementById("hero-loading");

            loadingScreen.style.opacity = "1";
            loadingScreen.style.visibility = "visible";

            heroLoading.style.animation = "none";
            void heroLoading.offsetWidth;
            heroLoading.style.animation = "fly-right 2s ease-in-out forwards";

            // ✅ Obtener tab_id de esta pestaña
            const tab_id = sessionStorage.getItem("tab_id");

            // 📌 Cerrar solo esta pestaña (via GET)
            fetch(`https://grammermx.com/IvanTest/BuzonQuejas/dao/cerrarSesion.php?tab_id=${tab_id}`, {
                method: 'GET'
            })
                .then(response => {
                    if (response.ok) {
                        setTimeout(() => {
                            window.location.href = "https://grammermx.com/IvanTest/BuzonQuejas/index.php";
                        }, 2500);
                    } else {
                        alert("Error al cerrar sesión. Inténtalo nuevamente.");
                    }
                })
                .catch(error => console.error("Error al cerrar sesión:", error));
        });
    }
});
