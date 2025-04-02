function validarReporte(pasoActual) {
    console.log("⚠️ Validando paso:", pasoActual);
    console.trace("🔍 Llamada a validarReporte");

    const selectArea = document.getElementById("area");
    const selectSupervisor = document.getElementById("supervisor");
    const selectShiftLeader = document.getElementById("shiftLeader");
    const inputQueja = document.getElementById("reporte");

    const ID_PRODUCCION = "1";

    // Paso 2: Validar área (y encargados si es Producción)
    if (pasoActual === 1) {
        if (!selectArea.value) {
            Swal.fire({
                title: "¡Falta seleccionar el área!",
                text: "Debes seleccionar un área antes de continuar.",
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

    // Paso 3: Validar queja
    if (pasoActual === 2) {
        if (!inputQueja.value.trim()) {
            Swal.fire({
                title: "¡Falta escribir la queja!",
                text: "Escribe tu queja antes de finalizar.",
                icon: "warning",
                confirmButtonText: "Aceptar"
            });
            return false;
        }
    }

    return true;
}
