document.addEventListener("DOMContentLoaded", () => {
    const tab_id = sessionStorage.getItem("tab_id");
    if (!tab_id) return;

    // Buscar el botón que diga "Cerrar Sesión"
    const botones = document.querySelectorAll(".sidebar-btn");
    let cerrarSesionBtn = null;

    botones.forEach(btn => {
        if (btn.textContent.trim().toLowerCase().includes("cerrar sesión")) {
            cerrarSesionBtn = btn;
        }
    });

    if (!cerrarSesionBtn) return;

    cerrarSesionBtn.addEventListener("click", async () => {
        try {
            const response = await fetch(
                `https://grammermx.com/IvanTest/ContencionMateriales/dao/cerrarSesionContencion.php?tab_id=${tab_id}`
            );

            if (!response.ok) throw new Error("Error en la solicitud");

            window.location.href = "login.php";
        } catch (err) {
            console.error("Error al cerrar sesión:", err);
            alert("Hubo un problema al cerrar sesión. Intenta de nuevo.");
        }
    });
});
