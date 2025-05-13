// js/navegacionDashboard.js
/**
 * Script para controlar la navegación entre secciones del dashboard:
 * - Levantar nuevo caso
 * - Mis casos (tabla de historial)
 * - Administrador (sección vacía por ahora)
 */

document.addEventListener("DOMContentLoaded", () => {
    const btnLevantar = document.querySelectorAll(".sidebar-btn")[0];
    const btnMisCasos = document.querySelectorAll(".sidebar-btn")[1];
    const btnAdmin    = document.querySelectorAll(".sidebar-btn")[2];

    const seccionLevantar = document.getElementById("seccion-levantar");
    const seccionMisCasos = document.getElementById("seccion-mis-casos");
    const seccionAdmin    = document.getElementById("seccion-admin");

    /**
     * Muestra solo una sección y oculta las demás.
     * @param {HTMLElement} seccionAMostrar
     */
    function mostrarSolo(seccionAMostrar) {
        [seccionLevantar, seccionMisCasos, seccionAdmin].forEach(seccion => {
            seccion.style.display = (seccion === seccionAMostrar) ? "block" : "none";
        });
    }

    // Eventos de navegación
    btnLevantar.addEventListener("click", () => mostrarSolo(seccionLevantar));
    btnMisCasos.addEventListener("click", () => mostrarSolo(seccionMisCasos));
    btnAdmin.addEventListener("click", () => mostrarSolo(seccionAdmin));

    // Mostrar por defecto la sección "Levantar"
    mostrarSolo(seccionLevantar);
});
