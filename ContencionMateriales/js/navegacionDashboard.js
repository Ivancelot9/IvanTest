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
        formulario: document.getElementById("formulario"),
        historial: document.getElementById("historial"),
        admin: document.getElementById("admin")
    };

    /**
     * Muestra solo una sección y oculta las demás.
     * @param {string} id
     */
    function mostrarSolo(id) {
        Object.entries(secciones).forEach(([clave, elemento]) => {
            if (elemento) {
                elemento.style.display = (clave === id) ? "block" : "none";
            }
        });
    }

    // Asignar evento a cada botón con data-section
    btns.forEach(btn => {
        const destino = btn.dataset.section;
        btn.addEventListener("click", () => mostrarSolo(destino));
    });

    // Mostrar por defecto la sección "Levantar nuevo caso"
    mostrarSolo("formulario");
});
