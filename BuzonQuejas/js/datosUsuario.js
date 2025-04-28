/* --- JS: js/datosUsuario.js --- */
/**
 * @file datosUsuario.js
 * @description
 * Recupera del servidor la información del usuario asociado a la pestaña actual
 * y la muestra en el formulario y en la barra lateral (Sidebar).
 *
 * Requiere:
 *  - Un `tab_id` almacenado en sessionStorage bajo la clave "tab_id".
 *  - Inputs/elementos con los siguientes IDs:
 *      • "nombre"          → <input> para el nombre del usuario.
 *      • "nomina"          → <input> para el número de nómina.
 *      • "sidebar-nombre"  → elemento donde se muestra el nombre en la barra lateral.
 *  - Endpoint GET en 'dao/obtenerUsuario.php?tab_id=…' que retorne JSON con:
 *      {
 *        status: "success" | "error",
 *        nombre?: string,
 *        nomina?: string,
 *        message?: string
 *      }
 */

document.addEventListener("DOMContentLoaded", function () {

    /* ─────────────────────────────────────────
       1. Lectura del identificador de pestaña
    ───────────────────────────────────────── */
    // `tab_id` es un UUID único que identifica esta pestaña/usuario
    const tab_id = sessionStorage.getItem("tab_id");

    /* ─────────────────────────────────────────
       2. Petición al servidor para obtener datos
    ───────────────────────────────────────── */
    fetch(`dao/obtenerUsuario.php?tab_id=${tab_id}`)
        // Parseamos la respuesta como JSON
        .then(response => response.json())
        .then(data => {

            /* ─────────────────────────────────────────
               3. Procesamiento de la respuesta JSON
            ───────────────────────────────────────── */
            if (data.status === "success") {
                // 3.1. Rellenar el campo de nombre en el formulario
                document.getElementById("nombre").value = data.nombre;

                // 3.2. Rellenar el campo de nómina en el formulario
                document.getElementById("nomina").value = data.nomina;

                // 3.3. Actualizar el texto del nombre en la barra lateral
                document.getElementById("sidebar-nombre").textContent = data.nombre;
            } else {
                // Si el servidor devuelve un estado de error, lo reportamos
                console.error("Error al obtener datos de usuario:", data.message);
            }
        })
        .catch(error => {
            /* ─────────────────────────────────────────
               4. Manejo de errores de red o parseo
            ───────────────────────────────────────── */
            console.error("Error en la petición de datos de usuario:", error);
        });

});
