document.addEventListener("DOMContentLoaded", function () {
    fetch('https://grammermx.com/IvanTest/BuzonQuejas/dao/obtenerAreas.php')
        .then(response => response.json())
        .then(data => {
            console.log("Áreas recibidas:", data); // 🔥 Depuración

            let areaSelect = document.getElementById("area");

            // Limpiar el select antes de llenarlo
            areaSelect.innerHTML = '<option value="" disabled selected>Selecciona un área</option>';

            data.forEach(area => {
                let option = document.createElement("option");
                option.value = area.IdArea;
                option.textContent = area.NombreArea;
                areaSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error al cargar áreas:', error));
});
