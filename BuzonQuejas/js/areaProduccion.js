document.addEventListener("DOMContentLoaded", function () {
    const areaSelect = document.getElementById("area");
    const supervisorContainer = document.getElementById("supervisor-container");
    const shiftLeaderContainer = document.getElementById("shiftLeader-container");

    // 🔹 ID fijo de Producción en la base de datos
    const ID_PRODUCCION = 1;

    // 🔹 Verificar el cambio de área seleccionada
    areaSelect.addEventListener("change", function () {
        console.log("Área seleccionada (ID):", areaSelect.value); // 🔥 Depuración

        if (parseInt(areaSelect.value) === ID_PRODUCCION) {
            supervisorContainer.classList.remove("hidden");
            shiftLeaderContainer.classList.remove("hidden");
        } else {
            supervisorContainer.classList.add("hidden");
            shiftLeaderContainer.classList.add("hidden");
        }
    });
});
