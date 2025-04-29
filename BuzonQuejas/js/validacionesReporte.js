/* --- JS: js/validacionesReporte.js --- */
/**
 * @file validacionesReporte.js
 * @description
 * Contiene la lógica de validación para cada paso del formulario de reporte:
 *  1. Paso 1 (índice 1): validar selección de área y, si es Producción, validar Supervisor y Shift Leader.
 *  2. Paso 2 (índice 2): validar que el campo de queja no esté vacío.
 *
 * Requiere:
 *  – Selectores con IDs: "area", "supervisor", "shiftLeader"
 *  – Textarea con ID: "reporte"
 *  – SweetAlert2 (`Swal`) para mostrar alertas
 *
 * Uso:
 *  – Llamar desde pestanaReportes.js antes de avanzar de paso.
 *  – Retorna `true` si la validación pasa, `false` en caso contrario.
 */
function validarReporte(pasoActual) {
    console.log("⚠️ Validando paso:", pasoActual);
    console.trace("🔍 Llamada a validarReporte");

    /* ─────────────────────────────────────────
       Referencias a elementos del formulario
    ───────────────────────────────────────── */
    const selectArea        = document.getElementById("area");
    const selectSupervisor  = document.getElementById("supervisor");
    const selectShiftLeader = document.getElementById("shiftLeader");
    const inputQueja        = document.getElementById("reporte");

    const ID_PRODUCCION     = "1"; // Valor fijo de Producción en BD

    /* ─────────────────────────────────────────
       Paso 1 (índice 1): Validar área y encargados
    ───────────────────────────────────────── */
    if (pasoActual === 1) {
        // Validar que se haya seleccionado un área
        if (!selectArea.value) {
            Swal.fire({
                title: "¡Falta seleccionar el área!",
                text:  "Debes seleccionar un área antes de continuar.",
                icon:  "warning",
                confirmButtonText: "Aceptar"
            });
            return false;
        }
        // Si el área es Producción, validar Supervisor y Shift Leader
        if (selectArea.value === ID_PRODUCCION) {
            if (!selectSupervisor.value) {
                Swal.fire({
                    title: "¡Falta el Supervisor!",
                    text:  "Si seleccionaste Producción, debes elegir un Supervisor.",
                    icon:  "warning",
                    confirmButtonText: "Aceptar"
                });
                return false;
            }
            if (!selectShiftLeader.value) {
                Swal.fire({
                    title: "¡Falta el Shift Leader!",
                    text:  "Si seleccionaste Producción, debes elegir un Shift Leader.",
                    icon:  "warning",
                    confirmButtonText: "Aceptar"
                });
                return false;
            }
        }
    }

    /* ─────────────────────────────────────────
       Paso 2 (índice 2): Validar texto de queja
    ───────────────────────────────────────── */
    if (pasoActual === 2) {
        if (!inputQueja.value.trim()) {
            Swal.fire({
                title: "¡Falta escribir la queja!",
                text:  "Escribe tu queja antes de finalizar.",
                icon:  "warning",
                confirmButtonText: "Aceptar"
            });
            return false;
        }
    }

    // Si todas las validaciones pasaron
    return true;
}
