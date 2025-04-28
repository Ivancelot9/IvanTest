/* --- JS: js/cerrarSesion.js --- */

/**
 * @file cerrarSesion.js
 * @description
 * Controla el proceso de cierre de sesión de la pestaña actual, realizando los siguientes pasos:
 *  1. Evita el comportamiento por defecto del botón.
 *  2. Oculta la interfaz principal (sidebar y contenido).
 *  3. Muestra la pantalla de carga y dispara la animación.
 *  4. Envía una petición GET al servidor para cerrar la sesión de esta pestaña.
 *  5. Tras confirmación, redirige al usuario a la página de inicio.
 *
 * Requiere:
 *  - Un botón con id="btn-cerrar-sesion"
 *  - Elementos con clases ".sidebar" y ".main-content"
 *  - Un contenedor de carga con id="loading-screen"
 *  - Un elemento animado con id="hero-loading"
 *  - Un endpoint en 'dao/cerrarSesion.php' que acepte GET con parámetro `tab_id`
 */

document.addEventListener("DOMContentLoaded", function () {
    // Referencia al botón que dispara el cierre de sesión
    const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

    if (!btnCerrarSesion) return; // Si no existe el botón, abortar

    btnCerrarSesion.addEventListener("click", function (e) {
        e.preventDefault(); // Evita recarga o navegación por defecto

        // 1. Ocultar la interfaz principal
        document.querySelector(".sidebar").style.display = "none";
        document.querySelector(".main-content").style.display = "none";

        // 2. Mostrar pantalla de carga
        const loadingScreen = document.getElementById("loading-screen");
        loadingScreen.style.opacity     = "1";
        loadingScreen.style.visibility  = "visible";

        // 3. Reiniciar y reproducir animación de 'hero-loading'
        const heroLoading = document.getElementById("hero-loading");
        heroLoading.style.animation = "none";
        // Forzar reflow para reiniciar la animación
        void heroLoading.offsetWidth;
        heroLoading.style.animation = "fly-right 2s ease-in-out forwards";

        // 4. Obtener el identificador de pestaña y enviar la petición de cierre
        const tab_id = sessionStorage.getItem("tab_id");
        fetch(`https://grammermx.com/IvanTest/BuzonQuejas/dao/cerrarSesion.php?tab_id=${encodeURIComponent(tab_id)}`, {
            method: 'GET'
        })
            .then(response => {
                if (response.ok) {
                    // 5. Redirigir tras esperar 2.5 segundos para ver la animación
                    setTimeout(() => {
                        window.location.href = "https://grammermx.com/IvanTest/BuzonQuejas/index.php";
                    }, 2500);
                } else {
                    // Manejo de error: avisar al usuario
                    alert("Error al cerrar sesión. Inténtalo nuevamente.");
                }
            })
            .catch(error => {
                console.error("Error al cerrar sesión:", error);
            });
    });
});
