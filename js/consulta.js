document.addEventListener("DOMContentLoaded", function () {
    const consultaNomina = document.getElementById("consultaNomina");
    const consultarButton = document.getElementById("consultar");
    const resultadoConsulta = document.getElementById("resultadoConsulta");

    consultarButton.addEventListener("click", function () {
        let nomina = consultaNomina.value.trim();

        // Validar que el número de nómina tenga 5 dígitos
        if (!nomina || nomina.length !== 5) {
            resultadoConsulta.textContent = "Por favor, ingresa un número de nómina válido de 5 dígitos.";
            return;
        }

        // Rellenar con ceros a la izquierda hasta completar 8 dígitos
        nomina = nomina.padStart(8, "0");

        // Realiza una petición al servidor para obtener datos
        fetch(`https://grammermx.com/IvanTest/dao/consultaUsuario.php?NumNomina=${nomina}`)
            .then((response) => {
                if (!response.ok) throw new Error("Error en la consulta al servidor");
                return response.json();
            })
            .then((data) => {
                if (data.status === "success") {
                    // Mostrar los datos del usuario con un formulario editable
                    resultadoConsulta.innerHTML = `
                        <form id="updateUsuario">
                            <p><strong>Nombre:</strong></p>
                            <input type="text" id="nuevoNombre" value="${data.nombre}">
                            <p><strong>Número de Nómina:</strong></p>
                            <input type="text" id="nuevoNomina" value="${data.nomina}" readonly>
                            <button id="modificar" type="button">Modificar</button>
                        </form>
                    `;

                    // Agregar evento al botón Modificar
                    const modificarButton = document.getElementById("modificar");
                    modificarButton.addEventListener("click", function () {
                        const nuevoNombre = document.getElementById("nuevoNombre").value.trim();
                        const nuevoNomina = document.getElementById("nuevoNomina").value.trim();

                        if (!nuevoNombre) {
                            resultadoConsulta.textContent = "El nombre no puede estar vacío.";
                            return;
                        }

                        // Enviar los datos actualizados al servidor
                        fetch('https://grammermx.com/IvanTest/dao/modificarUsuario.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ nomina: nuevoNomina, nombre: nuevoNombre })
                        })
                            .then((response) => {
                                if (!response.ok) throw new Error("Error en la actualización");
                                return response.json();
                            })
                            .then((data) => {
                                if (data.status === "success") {
                                    resultadoConsulta.innerHTML = `<p>${data.message}</p>`;
                                } else {
                                    resultadoConsulta.textContent = data.message || "No se pudo actualizar el usuario.";
                                }
                            })
                            .catch((error) => {
                                console.error("Error:", error);
                                resultadoConsulta.textContent = "Error al realizar la actualización.";
                            });
                    });
                } else {
                    resultadoConsulta.textContent = data.message || "No se encontraron datos.";
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                resultadoConsulta.textContent = "Error al realizar la consulta.";
            });
    });
});
