// validacionesAdmin.js

// Validar campos comunes
export function validarCamposComunes(numeroNomina, contrasena) {
    if (!numeroNomina || !contrasena) {
        return "Completa todos los campos.";
    }

    // Solo números
    if (!/^\d+$/.test(numeroNomina)) {
        return "El Número de Nómina solo puede contener números.<br><br>🔹 <strong>Ejemplo:</strong> 30318";
    }

    // Aceptar 4 o 5 dígitos
    if (numeroNomina.length < 4 || numeroNomina.length > 5) {
        return "El Número de Nómina debe tener 4 o 5 dígitos, como aparece en tu tarjeta.<br><br>🔹 <strong>Ejemplo:</strong> 30318";
    }

    return ""; // Sin errores
}

// Validar el campo "Nombre" (solo en registro)
export function validarNombre(nombre) {
    if (!nombre) {
        return "El campo Nombre es obligatorio.";
    }
    if (!/^[a-zA-Z\s]+$/.test(nombre)) {
        return "El Nombre solo puede contener letras y espacios.";
    }
    return "";
}

// Validar el formulario completo
export function validarFormulario({ numeroNomina, contrasena, nombre = "", isLoginMode }) {
    const errorComun = validarCamposComunes(numeroNomina, contrasena);
    if (errorComun) return errorComun;

    if (!isLoginMode) {
        const errorNom = validarNombre(nombre);
        if (errorNom) return errorNom;
    }

    return "";
}
