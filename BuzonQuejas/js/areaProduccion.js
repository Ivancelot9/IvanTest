/**
 * @file areaProduccion.js
 * @description
 * Este script controla la visibilidad de los campos de “Supervisor” y “Shift Leader”
 * en función del área seleccionada por el usuario. Solo se muestran cuando
 * el área seleccionada coincide con el ID fijo de Producción (1).
 *
 * Requiere:
 *  - Un elemento <select> con id="area"
 *  - Un contenedor con id="supervisor-container"
 *  - Un contenedor con id="shiftLeader-container"
 */
document.addEventListener("DOMContentLoaded", function () {
    const areaSelect             = document.getElementById("area");
    const supervisorContainer    = document.getElementById("supervisor-container");
    const shiftLeaderContainer   = document.getElementById("shiftLeader-container");

    // Constante que representa el ID de "Producción" en la BD
    const ID_PRODUCCION = 1;

    areaSelect.addEventListener("change", function () {
        console.log("Área seleccionada (ID):", areaSelect.value);

        if (parseInt(areaSelect.value, 10) === ID_PRODUCCION) {
            supervisorContainer.classList.remove("hidden");
            shiftLeaderContainer.classList.remove("hidden");
        } else {
            supervisorContainer.classList.add("hidden");
            shiftLeaderContainer.classList.add("hidden");
        }
    });
});
