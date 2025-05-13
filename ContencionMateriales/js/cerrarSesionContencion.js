document.addEventListener("DOMContentLoaded", () => {
    const btnCerrarSesion = document.querySelectorAll(".sidebar-btn")
        .find(btn => btn.textContent.trim() === "Cerrar Sesión");

    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", () => {
            const tab_id = sessionStorage.getItem("tab_id");
            if (!tab_id) return window.location.href = "login.php";

            fetch(`https://grammermx.com/IvanTest/ContencionMateriales/cerrarSesionContencion.php?tab_id=${tab_id}`)
                .then(() => {
                    sessionStorage.removeItem("tab_id");
                    window.location.href = "login.php";
                })
                .catch(() => {
                    Swal.fire("Error", "No se pudo cerrar sesión correctamente.", "error");
                });
        });
    }
});
