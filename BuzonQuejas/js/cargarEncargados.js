/* --- JS: js/cargarEncargados.js --- */

/**
 * @file cargarEncargados.js
 * @description
 * Este script pobla los desplegables de Supervisor y Shift Leader
 * consumiendo el endpoint que devuelve un JSON con la lista de encargados.
 *
 * Requiere:
 *  - Un endpoint en 'dao/obtenerEncargados.php' que retorne un JSON con un array
 *    de objetos con las propiedades:
 *      • IdEncargado     (identificador numérico)
 *      • NombreEncargado (nombre a mostrar)
 *      • Tipo            ('Supervisor' o 'Shift Leader')
 *  - Un <select> con id="supervisor"
 *  - Un <select> con id="shiftLeader"
 */

fetch('https://grammermx.com/IvanTest/BuzonQuejas/dao/obtenerEncargados.php')
    .then(response => response.json()) // Convertir la respuesta a JSON
    .then(data => {
        console.log("Datos recibidos desde el servidor:", data); // 🔥 Log de depuración

        // Referencias a los <select> en el DOM
        const supervisorSelect  = document.getElementById("supervisor");
        const shiftLeaderSelect = document.getElementById("shiftLeader");

        // Opciones iniciales por defecto
        supervisorSelect.innerHTML  = '<option value="" disabled selected>Selecciona tu supervisor</option>';
        shiftLeaderSelect.innerHTML = '<option value="" disabled selected>Selecciona tu Shift Leader</option>';

        // Recorrer cada encargado y asignarlo al <select> correspondiente
        data.forEach(encargado => {
            const option = document.createElement("option");
            option.value       = encargado.IdEncargado;      // Valor enviado en el formulario
            option.textContent = encargado.NombreEncargado;  // Texto visible al usuario

            if (encargado.Tipo === "Supervisor") {
                supervisorSelect.appendChild(option);
            } else if (encargado.Tipo === "Shift Leader") {
                shiftLeaderSelect.appendChild(option);
            }
        });
    })
    .catch(error => {
        // En caso de fallo en la petición, se muestra el error en consola
        console.error('Error al cargar encargados:', error);
    });
