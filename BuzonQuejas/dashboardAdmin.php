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
    <link rel="stylesheet" href="css/tablaReportes.css">
    <link rel="stylesheet" href="css/modalFechaFinalizacion.css">
    <!-- Flatpickr CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link rel="stylesheet" href="css/datosPersonales.css">

    <!-- SheetJS (xlsx.js) para generar archivos Excel -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>

    <!-- FileSaver.js para permitir descargas en el navegador -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>



</head>
<body>

<!-- Contenedor del botón -->
<div class="toggle-btn-wrapper">
    <button id="toggleSidebar" class="toggle-btn">☰</button>
</div>

<!-- Sidebar -->
<div class="sidebar">

    <img src="imagenes/superhero-sinfondo.png" class="hero-animation">

    <div class="profile">
        <img src="imagenes/user.png" alt="Profile Picture">
        <div class="username-bubble">
            <h4 id="sidebar-nombre">Iván Alejandro Medina Cerritos</h4>
        </div>
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

        <!-- 🎭 Tarjeta de Información Personal -->
        <div class="personal-info">
            <!-- 👤 Nombre -->
            <div class="info-item">
                <label for="nombre">Nombre:</label>
                <input type="text" id="nombre" name="nombre" value="" readonly>
            </div>

            <!-- 🆔 Número de Nómina -->
            <div class="info-item">
                <label for="nomina">Número de Nómina:</label>
                <input type="text" id="nomina" name="nomina" value="" readonly>
            </div>
        </div>

        <!-- 🎛 Botones de acción -->
        <div class="botones-accion">
            <button type="button" id="editar-btn" class="submit-btn">✏ Editar</button>
            <button type="button" id="guardar-btn" class="submit-btn guardar-btn" style="display: none;">💾 Guardar</button>
        </div>
    </div>

    <!-- 🏢 Historial de Reportes -->
    <div id="historial-reportes" class="content comic-container" style="display: none;">
        <h2 class="comic-title">Historial de Reportes</h2>

        <!-- 🔎 Controles superiores (Solo Filtro, SIN Exportar) -->
        <div class="table-controls">
            <div class="filter-container">
                <label for="filter-column">Filtrar por:</label>
                <select id="filter-column">
                    <option value="folio">Folio</option>
                    <option value="nomina">Número de Nómina</option>
                    <option value="encargado">Encargado</option>
                    <option value="fechaRegistro">Fecha Registro</option>
                    <option value="estatus">Estatus</option>
                </select>
                <input type="text" id="filter-input" placeholder="Buscar...">
                <button id="filter-button">🔍 Buscar</button> <!-- 🔹 Justo al lado del input -->
            </div>
        </div>

        <div class="table-container">
            <table id="tabla-reportes" class="styled-table">
                <thead>
                <tr>
                    <th>Folio</th>
                    <th>Fecha Registro</th>
                    <th>Número de Nómina</th>
                    <th>Área</th>  <!-- 🔹 Se agrega la nueva columna -->
                    <th>Encargado</th>
                    <th>Descripción</th>
                    <th>Comentarios</th>
                    <th>Estatus</th>
                    <th>Fecha de Finalización</th>
                </tr>
                </thead>
                <tbody id="tabla-body"></tbody>
            </table>
        </div>

        <!-- 📑 Controles de paginación -->
        <div class="pagination">
            <button id="prevPage" disabled>⬅ Anterior</button>
            <span id="pageIndicator">Página 1</span>
            <button id="nextPage">Siguiente ➡</button>
        </div>
    </div>



    <!-- 📑 Reportes Completos -->
    <div id="reportes-completos" class="content comic-container" style="display: none">
        <h2 class="comic-title">Reportes Completos</h2>

        <!-- 🔎 Controles superiores (Filtro + Rango de Fechas + Exportar Página) -->
        <div class="table-controls">
            <div class="filter-container">
                <label for="filter-column-completo">Filtrar por:</label>
                <select id="filter-column-completo">
                    <option value="folio">Folio</option>
                    <option value="nomina">Número de Nómina</option>
                    <option value="encargado">Encargado</option>
                    <option value="fechaFinalizacion">Fecha Finalización</option>
                </select>
                <input type="text" id="filter-input-completo" placeholder="Buscar...">
                <button id="filter-button-completo">🔍 Buscar</button>
            </div>

            <!-- 📅 Filtro por rango de fechas -->
            <div class="date-range-container">
                <label for="start-date">Rango:</label>
                <input type="date" id="start-date">
                <span> a </span>
                <input type="date" id="end-date">
                <button id="filter-date-button">📆 Filtrar</button>
            </div>

            <!-- 📤 Botón "Exportar Página" con icono de Excel -->
            <button id="exportarPaginaCompletos" class="btn-exportar">
                <i class="fas fa-file-excel"></i> Exportar Página
            </button>
        </div>

        <!-- Tabla de reportes completados -->
        <div class="table-container">
            <table id="tabla-completos" class="styled-table">
                <thead>
                <tr>
                    <th>Folio</th>
                    <th>Número de Nómina</th>
                    <th>Encargado</th>
                    <th>Fecha Finalización</th>
                    <th>Estatus</th>
                    <th>Convertidor</th>
                </tr>
                </thead>
                <tbody id="tabla-completos-body">
                </tbody>
            </table>
        </div>

        <!-- 📑 Controles de paginación -->
        <div class="pagination">
            <button id="prevPage-completo" disabled>⬅ Anterior</button>
            <span id="pageIndicator-completo">Página 1</span>
            <button id="nextPage-completo">Siguiente ➡</button>
        </div>
    </div>


</div>

<!-- 🔥 Pantalla de carga con animación de superhéroe -->
<div id="loading-screen">
    <img src="imagenes/superhero-sinfondo.png" id="hero-loading" alt="Saliendo...">
    <p class="loading-text">Cerrando sesión...</p>
</div>



<!-- Scripts -->
<script src="js/logicaDashboard.js"></script>
<script src="js/cerrarSesion.js"></script>
<script src="js/comentarios.js"></script>
<script src="js/descripcionReporte.js"></script>
<script src="js/tablaReportes.js"></script>
<script src="js/fechaFinalizacion.js"></script>
<script src="js/tablaReportesCompletos.js"></script>
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
<script src="js/estatusEditor.js"></script>
<script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="js/filtrarRangoFechas.js"></script>
<script src="js/expotarTablaCompleta.js"></script>
<script src="js/datosUsuario.js"></script>
<script src="js/modificarDatosPersonales.js"></script>


</body>
</html>






