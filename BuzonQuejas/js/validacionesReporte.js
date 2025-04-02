function validarReporte(pasoActual) {
    const selectArea = document.getElementById("area");
    const selectSupervisor = document.getElementById("supervisor");
    const selectShiftLeader = document.getElementById("shiftLeader");
    const inputQueja = document.getElementById("reporte");

    const ID_PRODUCCION = "1"; // 👈 ID real de Producción (ajusta si cambia)

    // 🔹 Validación del Paso 2 (Área y encargados)
    if (pasoActual >= 1) {
        if (!selectArea.value) {
            Swal.fire({
                title: "¡Falta seleccionar el área!",
                text: "Debes seleccionar un área antes de enviar el reporte.",
                icon: "warning",
                confirmButtonText: "Aceptar"
            });
            return false;
        }

        if (selectArea.value === ID_PRODUCCION) {
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
    }

    // 🔹 Validación del Paso 3 (Queja)
    if (pasoActual >= 2) {
        if (!inputQueja.value.trim()) {
            Swal.fire({
                title: "¡Falta escribir la queja!",
                text: "No puedes enviar un reporte vacío, escribe tu queja antes de finalizar.",
                icon: "warning",
                confirmButtonText: "Aceptar"
            });
            return false;
        }
    }

    // ✅ Todo bien, permitir envío
    return true;
}
