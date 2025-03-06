document.addEventListener("DOMContentLoaded", function () {
    const areaSelect = document.getElementById("area");
    const supervisorContainer = document.getElementById("supervisor-container");
    const shiftLeaderContainer = document.getElementById("shiftLeader-container");

    areaSelect.addEventListener("change", function () {
        if (areaSelect.value === "Producción") {
            supervisorContainer.classList.remove("hidden");
            shiftLeaderContainer.classList.remove("hidden");
        } else {
            supervisorContainer.classList.add("hidden");
            shiftLeaderContainer.classList.add("hidden");
        }
    });
});
