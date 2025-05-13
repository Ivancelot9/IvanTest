/**
 * Script para cerrar sesión de forma segura usando el tab_id
 * Requiere un botón con id "btn-cerrar-sesion"
 * y el atributo data-tab-id en el <body>.
 */

document.addEventListener("DOMContentLoaded", () => {
    const cerrarSesionBtn = document.getElementById("btn-cerrar-sesion");
    const tab_id = document.body.getAttribute("data-tab-id");

    if (!cerrarSesionBtn || !tab_id) return;

    cerrarSesionBtn.addEventListener("click", async () => {
        try {
            const response = await fetch(
                `https://grammermx.com/IvanTest/ContencionMateriales/dao/cerrarSesionContencion.php?tab_id=${encodeURIComponent(tab_id)}`
            );

            if (response.ok) {
                window.location.href = "login.php";
            } else {
                throw new Error("No se pudo cerrar sesión");
            }
        } catch (err) {
            console.error("Error al cerrar sesión:", err);
            alert("No se pudo cerrar sesión. Inténtalo de nuevo.");
        }
    });
});
