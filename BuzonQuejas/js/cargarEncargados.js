document.addEventListener("DOMContentLoaded", function () {
    fetch('https://grammermx.com/IvanTest/BuzonQuejas/dao/obtenerEncargados.php')
        .then(response => response.json())
        .then(data => {
            let supervisorSelect = document.getElementById("supervisor");
            let shiftLeaderSelect = document.getElementById("shiftLeader");

            // Limpiar los selects antes de llenarlos
            supervisorSelect.innerHTML = '<option value="" disabled selected>Selecciona un supervisor</option>';
            shiftLeaderSelect.innerHTML = '<option value="" disabled selected>Selecciona un líder</option>';

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
});
