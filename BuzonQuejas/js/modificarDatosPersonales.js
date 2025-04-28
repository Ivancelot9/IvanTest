/* --- JS: js/modificarDatosPersonales.js --- */
/**
 * @file modificarDatosPersonales.js
 * @description
 * Permite editar y guardar el nombre del usuario en su perfil:
 *  1. Habilita el campo de nombre para edición.
 *  2. Valida que el nuevo nombre contenga solo letras y espacios.
 *  3. Envía la actualización al backend con el tab_id de la pestaña.
 *  4. Muestra mensajes de éxito o error con SweetAlert2.
 *  5. Actualiza el nombre en la interfaz (campo y sidebar) al guardar.
 *
 * Requiere:
 *  - Botones con IDs "editar-btn" y "guardar-btn".
 *  - <input> de texto con id="nombre" y atributo readonly inicial.
 *  - sessionStorage con "tab_id" generado en login.
 *  - Endpoint POST "dao/modificarDatosPersonales.php?tab_id=..." que reciba JSON { nombre }.
 *  - SweetAlert2 (Swal) disponible globalmente.
 */

document.addEventListener("DOMContentLoaded", function () {
    /* ─────────────────────────────────────────
       1. Referencias a elementos del DOM
    ───────────────────────────────────────── */
    const editarBtn   = document.getElementById("editar-btn");   // Botón para habilitar edición
    const guardarBtn  = document.getElementById("guardar-btn");  // Botón para guardar cambios
    const nombreInput = document.getElementById("nombre");      // Input readonly con el nombre actual

    /* ─────────────────────────────────────────
       2. Habilitar edición de nombre
    ───────────────────────────────────────── */
    editarBtn.addEventListener("click", function () {
        // Quitar readonly y mostrar botón guardar
        nombreInput.removeAttribute("readonly");
        editarBtn.style.display  = "none";
        guardarBtn.style.display = "inline-block";
    });

    /* ─────────────────────────────────────────
       3. Validar y guardar cambios
    ───────────────────────────────────────── */
    guardarBtn.addEventListener("click", function () {
        const nuevoNombre = nombreInput.value.trim();
        // Regex para permitir solo letras (incluye acentos) y espacios
        const soloLetrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

        if (!soloLetrasRegex.test(nuevoNombre)) {
            Swal.fire({
                icon: 'error',
                title: 'Nombre inválido',
                html: `
                    El nombre solo puede contener <strong>letras</strong> y <strong>espacios</strong>.<br><br>
                    <u>Ejemplos válidos:</u><br>
                    - Jonathan Canizo<br>
                    - Ivan Alejandro Medina Cerritos<br><br>
                    No se permiten <strong>números</strong> ni <strong>símbolos</strong>.
                `
            });
            return;
        }

        /* ─────────────────────────────────────────
           4. Construir y enviar petición al servidor
        ───────────────────────────────────────── */
        const tab_id = sessionStorage.getItem("tab_id");
        fetch(`dao/modificarDatosPersonales.php?tab_id=${tab_id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: nuevoNombre })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    // 4.1 Mostrar alerta de éxito breve
                    Swal.fire({
                        icon: 'success',
                        title: 'Actualizado',
                        text: 'Nombre actualizado correctamente.',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    // 4.2 Restaurar estado readonly y botones
                    nombreInput.setAttribute("readonly", "true");
                    editarBtn.style.display  = "inline-block";
                    guardarBtn.style.display = "none";
                    // 4.3 Actualizar nombre en el sidebar
                    document.getElementById("sidebar-nombre").textContent = nuevoNombre;
                } else {
                    // Mostrar error devuelto por el backend
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.message
                    });
                }
            })
            .catch(error => {
                console.error("Error en la petición:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un problema al intentar actualizar.'
                });
            });
    });
});
