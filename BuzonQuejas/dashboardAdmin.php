<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Estilo Cómic</title>
    <link href="https://fonts.googleapis.com/css2?family=Bangers&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/dashboardStyle.css"> <!-- Vincula el CSS externo -->
</head>
<body>

<!-- Sidebar -->
<div class="sidebar">
    <div class="profile">
        <img src="https://via.placeholder.com/80" alt="Profile Picture">
        <h4>Iván Alejandro Medina</h4>
    </div>
    <!-- Botones con IDs -->
    <a href="#" id="btn-datos-personales" class="active">Datos Personales</a>
    <a href="#" id="btn-historial-reportes">Historial de Reportes</a>
    <a href="#" id="btn-reportes-completos">Reportes Completos</a>
</div>

<!-- Contenedor Principal -->
<div class="main-content">
    <!-- Contenedor del logo -->
    <div class="logo-container">
        <img src="imagenes/Grammer_Logo.jpg" alt="Grammer Logo" class="logo-img">
    </div>

    <!-- Sección inicial: Datos Personales -->
    <div id="datos-personales" class="content comic-container">
        <h2 class="comic-title">Datos Personales</h2>

        <!-- Contenedor de los datos -->
        <div class="personal-info">
            <div class="info-item">
                <label for="nombre">Nombre:</label>
                <input type="text" id="nombre" name="nombre" value="Iván Alejandro Medina" readonly>
            </div>
            <div class="info-item">
                <label for="nomina">Número de Nómina:</label>
                <input type="text" id="nomina" name="nomina" value="123456" readonly>
            </div>
        </div>

        <!-- Botón para editar -->
        <button type="button" id="editar-btn" class="submit-btn">Editar Datos</button>
    </div>


    <!-- Historial de Reportes (oculto por defecto) -->
    <div id="historial-reportes" class="content comic-container" style="display: none;">
        <h2 class="comic-title">Historial de Reportes</h2>
        <table>
            <thead>
            <tr>
                <th>Shift Leader</th>
                <th>Área</th>
                <th>Reporte</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>Pedro Pérez</td>
                <td>Producción</td>
                <td>Reporte 1</td>
            </tr>
            <tr>
                <td>María López</td>
                <td>Calidad</td>
                <td>Reporte 2</td>
            </tr>
            </tbody>
        </table>
    </div>

    <!-- Reportes Completos (oculto por defecto) -->
    <div id="reportes-completos" class="content comic-container" style="display: none;">
        <h2 class="comic-title">Reportes Completos</h2>
        <p>Aquí podrás consultar todos los reportes generados.</p>
    </div>
</div>

<!-- Vincular el archivo JavaScript -->
<script src="js/logicaDashboard.js"></script>

</body>
</html>