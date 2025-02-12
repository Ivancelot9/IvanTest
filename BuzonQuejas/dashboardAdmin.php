<?php
session_start();

if ($_SESSION["NumNomina"] == "" && $_SESSION["NumNomina"]== null && $_SESSION["Contrasena"]== "" && $_SESSION["Contrasena"]== null) {
    echo "<META HTTP-EQUIV='REFRESH' CONTENT='1; URL=index.php'>";
    session_destroy();
}else{
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
    <link rel="stylesheet" href="css/dashboardStyle.css"> <!-- Vincula el CSS externo -->
    <link rel="stylesheet" href="css/modalComentarios.css">
    <link rel="stylesheet" href="css/modalDescripcion.css">


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
    <!-- 🔹 Nuevo contenedor para los botones de navegación -->
    <div class="sidebar-links">
        <a href="#" id="btn-datos-personales" class="active">Datos Personales</a>
        <a href="#" id="btn-historial-reportes">Historial de Reportes</a>
        <a href="#" id="btn-reportes-completos">Reportes Completos</a>
    </div>

    <!-- 🔴 Este botón queda fuera del contenedor de navegación -->
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
        <div class="table-container">
            <table id="tabla-reportes" class="styled-table">
                <thead>
                <tr>
                    <th>Folio</th>
                    <th>Número de Nómina</th>
                    <th>Encargado</th>
                    <th>Fecha Registro</th>
                    <th>Fecha Finalización</th>
                    <th>Descripción</th>
                    <th>Estatus</th>
                    <th>Comentarios</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>001</td>
                    <td>123456</td>
                    <td>Juan Pérez</td>
                    <td>10/02/2025</td>
                    <td>-</td> <!-- Sin fecha hasta que el admin la establezca -->
                    <td>
                        <button class="mostrar-descripcion" data-descripcion="Problema con el sistema de autenticación">Mostrar Descripción</button>
                    </td>
                    <td>En proceso</td>
                    <td>
                        <button class="agregar-comentario" data-folio="001">Agregar Comentario</button>
                    </td>
                </tr>
                <tr>
                    <td>002</td>
                    <td>654321</td>
                    <td>María López</td>
                    <td>11/02/2025</td>
                    <td>-</td>
                    <td>
                        <button class="mostrar-descripcion" data-descripcion="Error en la base de datos">Mostrar Descripción</button>
                    </td>
                    <td>Pendiente</td>
                    <td>
                        <button class="agregar-comentario" data-folio="002">Agregar Comentario</button>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
    <!-- Reportes Completos -->
    <div id="reportes-completos" class="content comic-container" style="display: none;">
        <h2 class="comic-title">Reportes Completos</h2>
        <p>Aquí podrás consultar todos los reportes generados.</p>
    </div>
</div>



<!-- Scripts -->
<script src="js/logicaDashboard.js"></script>
<script src="js/cerrarSesion.js"></script>
<script src="js/comentarios.js"></script>
<script src="js/descripcionReporte.js"></script>

</body>
</html>
