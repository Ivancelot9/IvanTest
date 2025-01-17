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
                    // Mostrar los datos del usuario
                    resultadoConsulta.innerHTML = `
                        <p><strong>Nombre:</strong> ${data.nombre}</p>
                        <p><strong>Número de Nómina:</strong> ${data.nomina}</p>
                    `;
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
