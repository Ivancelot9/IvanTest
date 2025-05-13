// js/cerrarSesionContencion.js
/**
 * Script para cerrar sesión de forma segura usando el tab_id
 * Requiere un botón en el HTML con texto o contenido "Cerrar Sesión"
 */

document.addEventListener("DOMContentLoaded", () => {
    // Buscar el botón de cerrar sesión dentro de los botones del sidebar
    const cerrarSesionBtn = [...document.querySelectorAll(".sidebar-btn")]
        .find(btn => btn.textContent.trim().toLowerCase().includes("cerrar sesión"));

    if (!cerrarSesionBtn) return;

    cerrarSesionBtn.addEventListener("click", async () => {
        const tab_id = sessionStorage.getItem("tab_id");
        if (!tab_id) return;

        try {
            await fetch(`dao/cerrarSesionContencion.php?tab_id=${tab_id}`);
            // Redirigir a login.php
            window.location.href = "login.php";
        } catch (err) {
            console.error("Error al cerrar sesión:", err);
            alert("No se pudo cerrar sesión. Inténtalo de nuevo.");
        }
    });
});
