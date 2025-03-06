function validarReporte() {
    const selectArea = document.getElementById("area");
    const selectSupervisor = document.getElementById("supervisor");
    const selectShiftLeader = document.getElementById("shiftLeader");
    const inputQueja = document.getElementById("reporte");

    // 🔹 Validación del Paso 2 (Área)
    if (!selectArea.value) {
        Swal.fire({
            title: "¡Falta seleccionar el área!",
            text: "Debes seleccionar un área antes de enviar el reporte.",
            icon: "warning",
            confirmButtonText: "Aceptar"
        });
        return false;
    }

    // 🔹 Si eligió Producción, verificar Supervisor y Shift Leader
    if (selectArea.value === "Producción") {
        if (!selectSupervisor.value) {
            Swal.fire({
                title: "¡Falta el Supervisor!",
                text: "Si seleccionaste Producción, debes elegir un Supervisor.",
                icon: "warning",
                confirmButtonText: "Aceptar"
            });
            return false;
        }
        if (!selectShiftLeader.value) {
            Swal.fire({
                title: "¡Falta el Shift Leader!",
                text: "Si seleccionaste Producción, debes elegir un Shift Leader.",
                icon: "warning",
                confirmButtonText: "Aceptar"
            });
            return false;
        }
    }

    // 🔹 Validación del Paso 3 (Queja)
    if (!inputQueja.value.trim()) {
        Swal.fire({
            title: "¡Falta escribir la queja!",
            text: "No puedes enviar un reporte vacío, escribe tu queja antes de finalizar.",
            icon: "warning",
            confirmButtonText: "Aceptar"
        });
        return false;
    }

    // ✅ Si todo está completo, permitir el envío
    return true;
}
