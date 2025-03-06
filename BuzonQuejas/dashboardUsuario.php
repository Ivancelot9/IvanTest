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
    <link href="https://fonts.googleapis.com/css2?family=Bangers&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>

<div class="comic-container">
    <div class="logo-title-container">
        <img src="imagenes/GrameLogo2.png" alt="Logo" class="logo">
        <div class="comic-title-usuario" data-text="¡QUÉJATE!">¡QUÉJATE!</div>
    </div>

    <!-- 🔹 Pestañas Rectangulares Simuladas -->
    <div class="tabs-container">
        <div class="tab-item active" data-step="0">Datos</div>
        <div class="tab-item" data-step="1">Área</div>
        <div class="tab-item" data-step="2">Queja</div>
    </div>

    <!-- 🔹 Cuadro con Contenido -->
    <div class="content-box">
        <!-- Paso 1: Datos del Usuario (Bienvenida personalizada) -->
        <div id="step1" class="content active">
            <h2 class="welcome-title">¡Bienvenido!</h2>

            <div class="user-info-container">
                <label class="user-label">Nombre:</label>
                <div class="user-data-box">
                    <span id="nombreUsuario">Ivan Alejandro Cerritos</span>
                </div>

                <label class="user-label">Número de nómina:</label>
                <div class="user-data-box">
                    <span id="nominaUsuario">00030318</span>
                </div>
            </div>

            <p class="instruction-text">Presiona <strong>"Siguiente"</strong> para continuar con tu queja.</p>
        </div>

        <!-- Paso 2: Selección de Área -->
        <div id="step2" class="content hidden">
            <h2 class="step-title">Selecciona tu Área</h2>

            <!-- 🔹 Selección de Área -->
            <div class="form-group">
                <label for="area" class="step-label">Área:</label>
                <select id="area" class="step-select">
                    <option value="" disabled selected>Selecciona un área</option>
                    <option value="Producción">Producción</option>
                    <option value="Calidad">Calidad</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="IT">IT</option>
                    <option value="Logística">Logística</option>
                    <option value="Finanzas">Finanzas</option>
                    <option value="Compras">Compras</option>
                    <option value="Almacén">Almacén</option>
                    <option value="Seguridad">Seguridad</option>
                    <option value="Ingeniería">Ingeniería</option>
                    <option value="Ventas">Ventas</option>
                </select>
            </div>

            <!-- 🔹 Selección de Supervisor (Solo para Producción) -->
            <div class="form-group hidden" id="supervisor-container">
                <label for="supervisor" class="step-label">Supervisor:</label>
                <select id="supervisor" class="step-select">
                    <option value="" disabled selected>Selecciona un supervisor</option>
                    <option value="Supervisor 1">Supervisor 1</option>
                    <option value="Supervisor 2">Supervisor 2</option>
                    <option value="Supervisor 3">Supervisor 3</option>
                    <option value="Supervisor 4">Supervisor 4</option>
                    <option value="Supervisor 5">Supervisor 5</option>
                </select>
            </div>

            <!-- 🔹 Selección de Shift Leader (Solo para Producción) -->
            <div class="form-group hidden" id="shiftLeader-container">
                <label for="shiftLeader" class="step-label">Shift Leader:</label>
                <select id="shiftLeader" class="step-select">
                    <option value="" disabled selected>Selecciona un líder</option>
                    <option value="Lider 1">Líder 1</option>
                    <option value="Lider 2">Líder 2</option>
                    <option value="Lider 3">Líder 3</option>
                    <option value="Lider 4">Líder 4</option>
                    <option value="Lider 5">Líder 5</option>
                    <option value="Lider 6">Líder 6</option>
                    <option value="Lider 7">Líder 7</option>
                    <option value="Lider 8">Líder 8</option>
                    <option value="Lider 9">Líder 9</option>
                    <option value="Lider 10">Líder 10</option>
                </select>
            </div>
        </div>


        <!-- Paso 3: Reporte de Queja (Debe estar oculto al inicio) -->
        <div id="step3" class="content hidden">
            <label for="reporte">Escribe tu queja:</label>
            <textarea id="reporte" rows="6" placeholder="Escribe aquí..."></textarea>
        </div>

        <!-- 🔹 Botón "Siguiente" en la esquina inferior derecha -->
        <button id="btnSiguiente" class="btn-next">Siguiente</button>
    </div>
</div>

<script src = "js/pestanasReporte.js"></script>
<script src = "js/areaProduccion.js"></script>
<script src = "js/validacionesReporte.js"></script>


</body>
</html>