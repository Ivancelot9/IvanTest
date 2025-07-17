/**
 * @file navegacionDashboard.js
 * @project Contención de Materiales
 * @module navegación
 * @purpose Controlar la navegación entre secciones del dashboard
 * @description Este script permite alternar entre las distintas vistas del sistema:
 * formulario de registro, historial de casos propios, historial global y administración.
 * Se oculta el resto de secciones al mostrar una nueva, permitiendo una navegación fluida
 * tipo SPA (Single Page Application) basada en botones del sidebar.
 * @author Ivan Medina / Hadbet Altamirano
 * @created Junio 2025
 * @updated [¿?]
 *
 * @uso
 * Utilizado en `dashboardContencion.php`. Requiere que cada botón tenga `data-section`
 * y que cada sección tenga un `id` coincidente (formulario, historial, historial-casos, admin).
 */

// Esperar a que el DOM esté cargado antes de iniciar
document.addEventListener("DOMContentLoaded", () => {
    // 🔘 Botones del sidebar con atributo data-section
    const btns = document.querySelectorAll(".sidebar-btn[data-section]");

    // 📦 Referencias a las secciones que se alternan
    const secciones = {
        formulario:         document.getElementById("formulario"),
        historial:          document.getElementById("historial"),
        "historial-casos":  document.getElementById("historial-casos"),
        admin:              document.getElementById("admin")
    };

    /**
     * Muestra solo la sección cuyo id coincida con el parámetro.
     * Oculta el resto.
     *
     * @param {string} id - ID de la sección a mostrar
     */
    function mostrarSolo(id) {
        Object.entries(secciones).forEach(([clave, elemento]) => {
            if (!elemento) return; // Previene errores si alguna sección no existe
            elemento.style.display = (clave === id) ? "block" : "none";
        });
    }

    // 🎯 Asociar clic en botón con la función de navegación
    btns.forEach(btn => {
        const destino = btn.dataset.section; // destino = ID de la sección
        btn.addEventListener("click", () => mostrarSolo(destino));
    });

    // 🚀 Sección predeterminada al cargar el sistema
    mostrarSolo("formulario");
});
