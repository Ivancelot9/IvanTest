/* --- JS: js/pestanaReportes.js --- */
/**
 * @file pestanaReportes.js
 * @description
 * Gestiona la navegación por pestañas del formulario de reporte:
 *  1. Controla activación de pestañas y contenido asociado.
 *  2. Muestra/oculta botones "Siguiente" y "Finalizar" según el paso.
 *  3. Valida cada paso antes de avanzar usando validarReporte().
 *  4. Permite reiniciar el formulario o cerrar sesión desde cualquier paso.
 *
 * Requiere:
 *  - Elementos en el DOM:
 *      • .tab-item ↔ pestañas de navegación
 *      • .content  ↔ secciones de contenido por paso
 *      • #btnSiguiente, #btnFinalizar
 *      • Inputs con ids "reporte", "area", "supervisor", "shiftLeader"
 *  - Función global validarReporte(paso) que devuelva boolean
 *  - Endpoint GET "dao/cerrarSesionUsuario.php" para cerrar sesión
 *  - Página de login en "loginUsuario.php"
 */

document.addEventListener("DOMContentLoaded", function () {

    /* ─────────────────────────────────────────
       1. Referencias al DOM y estado inicial
    ───────────────────────────────────────── */
    const tabs         = document.querySelectorAll(".tab-item");    // Elementos de pestañas
    const steps        = document.querySelectorAll(".content");     // Contenidos de cada paso
    const btnSiguiente = document.getElementById("btnSiguiente");   // Botón "Siguiente"
    const btnFinalizar = document.getElementById("btnFinalizar");   // Botón "Finalizar"

    let pasoActual = 0; // Índice del paso activo (comienza en 0)

    /* ─────────────────────────────────────────
       2. Función cerrarSesión
    ───────────────────────────────────────── */
    function cerrarSesion() {
        fetch("https://grammermx.com/IvanTest/BuzonQuejas/dao/cerrarSesionUsuario.php")
            .then(() => {
                window.location.href = "https://grammermx.com/IvanTest/BuzonQuejas/loginUsuario.php";
            })
            .catch(error => console.error("Error al cerrar sesión:", error));
    }

    /* ─────────────────────────────────────────
       3. Función actualizarVista
    ───────────────────────────────────────── */
    function actualizarVista() {
        // Desactivar todas las pestañas y ocultar contenidos
        tabs.forEach(tab => tab.classList.remove("active"));
        steps.forEach(step => step.classList.add("hidden"));

        // Activar pestaña y contenido del paso actual
        tabs[pasoActual].classList.add("active");
        steps[pasoActual].classList.remove("hidden");

        // Mostrar/ocultar botones según si es último paso
        if (pasoActual === steps.length - 1) {
            btnSiguiente.classList.add("hidden");
            btnFinalizar.classList.remove("hidden");
        } else {
            btnSiguiente.classList.remove("hidden");
            btnFinalizar.classList.add("hidden");
        }
    }

    /* ─────────────────────────────────────────
       4. Manejador de "Siguiente"
    ───────────────────────────────────────── */
    btnSiguiente.addEventListener("click", function () {
        console.log("👉 Click en Siguiente. Paso actual:", pasoActual);
        // Validar el paso antes de avanzar
        if (!validarReporte(pasoActual)) return;
        pasoActual++;
        actualizarVista();
    });

    /* ─────────────────────────────────────────
       5. Navegación al hacer clic en pestaña
    ───────────────────────────────────────── */
    tabs.forEach((tab, index) => {
        tab.addEventListener("click", function () {
            pasoActual = index;
            actualizarVista();
        });
    });

    /* ─────────────────────────────────────────
       6. Función reiniciarFormulario
    ───────────────────────────────────────── */
    function reiniciarFormulario() {
        // Reset de inputs del formulario
        document.getElementById("reporte").value       = "";
        document.getElementById("area").value         = "";
        document.getElementById("supervisor").value   = "";
        document.getElementById("shiftLeader").value  = "";
        pasoActual = 0;
        actualizarVista();
    }

    /* ─────────────────────────────────────────
       7. Exponer funciones globales
    ───────────────────────────────────────── */
    window.reiniciarFormulario = reiniciarFormulario;
    window.cerrarSesion        = cerrarSesion;

    /* ─────────────────────────────────────────
       8. Iniciar vista
    ───────────────────────────────────────── */
    actualizarVista();

});
