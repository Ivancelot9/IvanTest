// Validar campos comunes
export function validarCamposComunes(numeroNomina, contrasena) {
    if (!numeroNomina || !contrasena) {
        return "Completa todos los campos";
    }

    if (numeroNomina.length !== 5) {
        return "El Número de Nómina debe tener 5 dígitos exactos";
    }

    return ""; // Sin errores
}

// Validar el campo "Nombre" (solo en registro)
export function validarNombre(nombre) {
    if (!nombre) {
        return "El campo Nombre es obligatorio";
    }

    const nombreRegex = /^[a-zA-Z\s]+$/;
    if (!nombreRegex.test(nombre)) {
        return "El Nombre solo puede contener letras y espacios";
    }

    return ""; // Sin errores
}