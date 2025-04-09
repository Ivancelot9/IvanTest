fetch('https://grammermx.com/IvanTest/BuzonQuejas/dao/obtenerEncargados.php')
    .then(response => response.json())
    .then(data => {
        console.log("Datos recibidos desde el servidor:", data); // 🔥 Verificar si llegan los datos

        let supervisorSelect = document.getElementById("supervisor");
        let shiftLeaderSelect = document.getElementById("shiftLeader");

        supervisorSelect.innerHTML = '<option value="" disabled selected>Selecciona tu supervisor</option>';
        shiftLeaderSelect.innerHTML = '<option value="" disabled selected>Selecciona tu Shift Leader</option>';

        data.forEach(encargado => {
            let option = document.createElement("option");
            option.value = encargado.IdEncargado;
            option.textContent = encargado.NombreEncargado;

            if (encargado.Tipo === "Supervisor") {
                supervisorSelect.appendChild(option);
            } else if (encargado.Tipo === "Shift Leader") {
                shiftLeaderSelect.appendChild(option);
            }
        });
    })
    .catch(error => console.error('Error al cargar encargados:', error));
