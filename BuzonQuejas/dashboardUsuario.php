<?php
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quéjate - Buzón de Reportes</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
    <link rel="stylesheet" href="css/dashboardStyleUsuario.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>

    <div class="comic-container">
        <img src="imagenes/GrameLogo2.png" alt="Logo" class="logo">
        <div class="comic-title">Quéjate</div>

        <div class="tabs">
            <div class="tab active"></div>
            <div class="tab"></div>
            <div class="tab"></div>
        </div>

        <div id="step1" class="content active">
            <p><strong>Nombre:</strong> <span id="nombreUsuario">Juan Pérez</span></p>
            <p><strong>Nómina:</strong> <span id="nominaUsuario">123456</span></p>
        </div>

        <div id="step2" class="content">
            <label for="area">Área de Queja:</label>
            <select id="area">
                <option value="Producción">Producción</option>
                <option value="Calidad">Calidad</option>
                <option value="Mantenimiento">Mantenimiento</option>
            </select>

            <label for="shiftLeader">Shift Leader:</label>
            <select id="shiftLeader">
                <option value="Lider 1">Líder 1</option>
                <option value="Lider 2">Líder 2</option>
            </select>
        </div>

        <div id="step3" class="content">
            <label for="reporte">Escribe tu queja:</label>
            <textarea id="reporte" rows="4" placeholder="Escribe aquí..."></textarea>
        </div>

        <button id="btnSiguiente" class="btn-next">Siguiente</button>
    </div>

</body>
</html>