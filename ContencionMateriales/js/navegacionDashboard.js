// js/navegacionDashboard.js
/**
 * Script para controlar la navegación entre secciones del dashboard:
 * - Levantar nuevo caso
 * - Mis casos (tabla de historial)
 * - Administrador (sección vacía por ahora)
 */

document.addEventListener("DOMContentLoaded", () => {
    const btns = document.querySelectorAll(".sidebar-btn[data-section]");

    const secciones = {
        formulario:   document.getElementById("formulario"),
        historial:    document.getElementById("historial"),
        "historial-casos": document.getElementById("historial-casos"),
        admin:        document.getElementById("admin")
    };

    /**
     * Muestra solo la sección cuyo id coincida, oculta las demás.
     * @param {string} id
     */
    function mostrarSolo(id) {
        Object.entries(secciones).forEach(([clave, elemento]) => {
            if (!elemento) return;
            elemento.style.display = (clave === id) ? "block" : "none";
        });
    }

    // Asignar evento click a cada botón
    btns.forEach(btn => {
        const destino = btn.dataset.section;
        btn.addEventListener("click", () => mostrarSolo(destino));
    });

    // Sección por defecto al cargar
    mostrarSolo("formulario");
});

