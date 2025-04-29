/* --- JS: js/validacionesAdmin.js --- */
/**
 * @file validacionesAdmin.js
 * @description
 * Contiene funciones de validación para el formulario de inicio de sesión y registro de administradores:
 *  – validarCamposComunes: verifica número de nómina y contraseña
 *  – validarNombre: comprueba el formato del nombre (solo letras y espacios)
 *  – validarFormulario: ejecuta validaciones completas según el modo (login o registro)
 *
 * Requiere:
 *  – Módulo ES importable (export functions)
 *  – Uso en inicioSesion.js
 */

/**
 * Valida campos comunes para login y registro:
 *  • numeroNomina: obligatorio, solo dígitos, 4-5 caracteres
 *  • contrasena: obligatorio
 *
 * @param {string} numeroNomina - El número de nómina ingresado
 * @param {string} contrasena - La contraseña ingresada
 * @returns {string} Mensaje de error o cadena vacía si válido
 */
export function validarCamposComunes(numeroNomina, contrasena) {
    // 1. Campos obligatorios
    if (!numeroNomina || !contrasena) {
        return "Completa todos los campos.";
    }

    // 2. Solo números
    if (!/^\d+$/.test(numeroNomina)) {
        return "El Número de Nómina solo puede contener números.<br><br>🔹 <strong>Ejemplo:</strong> 30318 o 1606";
    }

    // 3. Longitud de 4 o 5 dígitos
    if (numeroNomina.length < 4 || numeroNomina.length > 5) {
        return "El Número de Nómina debe tener 4 o 5 dígitos, como aparece en tu tarjeta.<br><br>🔹 <strong>Ejemplo:</strong> 30318 o 1606";
    }

    // Sin errores
    return "";
}

/**
 * Valida el campo nombre para registro:
 *  • obligatorio
 *  • solo letras y espacios
 *
 * @param {string} nombre - El nombre ingresado
 * @returns {string} Mensaje de error o cadena vacía si válido
 */
export function validarNombre(nombre) {
    // 1. Campo obligatorio
    if (!nombre) {
        return "El campo Nombre es obligatorio.";
    }

    // 2. Solo letras y espacios
    if (!/^[a-zA-Z\s]+$/.test(nombre)) {
        return "El Nombre solo puede contener letras y espacios.";
    }

    // Sin errores
    return "";
}

/**
 * Valida todo el formulario según el modo de uso:
 *  • modo login: solo validaciones comunes
 *  • modo registro: validaciones comunes + nombre
 *
 * @param {Object} params
 * @param {string} params.numeroNomina
 * @param {string} params.contrasena
 * @param {string} [params.nombre]
 * @param {boolean} params.isLoginMode - true=login, false=registro
 * @returns {string} Mensaje de error o cadena vacía si todo válido
 */
export function validarFormulario({ numeroNomina, contrasena, nombre = "", isLoginMode }) {
    // 1. Validar campos comunes
    const errorComun = validarCamposComunes(numeroNomina, contrasena);
    if (errorComun) return errorComun;

    // 2. Si es modo registro, validar nombre
    if (!isLoginMode) {
        const errorNom = validarNombre(nombre);
        if (errorNom) return errorNom;
    }

    // 3. Sin errores generales
    return "";
}
