// Validar campos comunes
export function validarCamposComunes(numeroNomina, contrasena) {
    if (!numeroNomina || !contrasena) {
        return "Completa todos los campos.";
    }

    // Verificar que el número de nómina contenga solo números
    if (!/^\d+$/.test(numeroNomina)) {
        return "El Número de Nómina solo puede contener números. Ejemplo: 30318";
    }

    // Verificar longitud exacta
    if (numeroNomina.length !== 5) {
        return "El Número de Nómina debe tener exactamente 5 dígitos, como aparece en tu gafete. Ejemplo: 30318";
    }

    return ""; // Sin errores
}

// Validar el campo "Nombre" (solo en registro)
export function validarNombre(nombre) {
    if (!nombre) {
        return "El campo Nombre es obligatorio.";
    }

    const nombreRegex = /^[a-zA-Z\s]+$/;
    if (!nombreRegex.test(nombre)) {
        return "El Nombre solo puede contener letras y espacios.";
    }

    return ""; // Sin errores
}

// Validar el formulario completo
export function validarFormulario({ numeroNomina, contrasena, nombre = "", isLoginMode }) {
    // Validar campos comunes
    const errorCamposComunes = validarCamposComunes(numeroNomina, contrasena);
    if (errorCamposComunes) {
        return errorCamposComunes;
    }

    // Validar nombre solo si no es modo login
    if (!isLoginMode) {
        const errorNombre = validarNombre(nombre);
        if (errorNombre) {
            return errorNombre;
        }
    }

    return ""; // Sin errores
}
