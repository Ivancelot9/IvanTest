<?php
session_start();

if ($_SESSION["NumNomina"] == "" && $_SESSION["NumNomina"] == null && $_SESSION["Contrasena"] == "" && $_SESSION["Contrasena"] == null) {
    echo "<META HTTP-EQUIV='REFRESH' CONTENT='1; URL=index.php'>";
    session_destroy();
} else {
    session_start();
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Estilo Cómic</title>
    <link href="https://fonts.googleapis.com/css2?family=Bangers&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/dashboardStyle.css">
</head>
<body>

<!-- Sidebar -->
<div class="sidebar">
    <button id="toggleSidebar" class="toggle-btn">☰</button>
    <img src="imagenes/superhero-sinfondo.png" class="hero-animation">

    <div class="profile">
        <img src="imagenes/user.png" alt="Profile Picture">
        <h4>Iván Alejandro Medina</h4>
    </div>
    <div class="sidebar-links">
        <a href="#" id="btn-datos-personales" class="active">Datos Personales</a>
        <a href="#" id="btn-historial-reportes">Historial de Reportes</a>
        <a href="#" id="btn-reportes-completos">Reportes Completos</a>
    </div>
    <a href="#" id="btn-cerrar-sesion" class="logout-btn">Cerrar Sesión</a>
</div>

<!-- Contenedor Principal -->
<div class="main-content">
    <div class="logo-container">
        <img src="imagenes/Grammer_Logo.jpg" alt="Grammer Logo" class="logo-img">
    </div>

    <!-- Datos Personales -->
    <div id="datos-personales" class="content comic-container">
        <h2 class="comic-title">Datos Personales</h2>
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
        <button type="button" id="editar-btn" class="submit-btn">Editar Datos</button>
    </div>

    <!-- Historial de Reportes -->
    <div id="historial-reportes" class="content comic-container" style="display: none;">
        <h2 class="comic-title">Historial de Reportes</h2>
        <table id="tabla-reportes" class="styled-table">
            <thead>
            <tr>
                <th>Folio</th>
                <th>Número de Nómina</th>
                <th>Área</th>
                <th>Acción</th>
            </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    </div>

    <!-- Reportes Completos -->
    <div id="reportes-completos" class="content comic-container" style="display: none;">
        <h2 class="comic-title">Reportes Completos</h2>
        <p>Aquí podrás consultar todos los reportes generados.</p>
    </div>
</div>

<!-- Ventana Emergente para el Detalle del Reporte -->
<div id="detalle-reporte" class="reporte-detalle" style="display: none;">
    <button id="cerrar-detalle" class="close-btn">✖</button>
    <h2 class="comic-title">Detalle del Reporte</h2>
    <div class="reporte-info">
        <p><strong>Folio:</strong> <span id="reporte-folio"></span></p>
        <p><strong>Número de Nómina:</strong> <span id="reporte-nomina"></span></p>
        <p><strong>Fecha de Registro:</strong> <span id="reporte-fecha-registro"></span></p>
        <p><strong>Fecha de Inicio:</strong> <span id="reporte-fecha-inicio"></span></p>
        <p><strong>Fecha Finalizada:</strong> <span id="reporte-fecha-finalizada"></span></p>
        <p><strong>Descripción:</strong> <span id="reporte-descripcion"></span></p>
        <p><strong>Comentarios:</strong> <span id="reporte-comentarios"></span></p>
        <p><strong>Estatus:</strong> <span id="reporte-estatus"></span></p>
    </div>
</div>

<!-- Scripts -->
<script src="js/logicaDashboard.js"></script>
<script src="js/cerrarSesion.js"></script>
<script src="js/historialReportes.js"></script>
</body>
</html>
