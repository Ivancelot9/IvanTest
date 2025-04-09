<?php
session_start();

if ($_SESSION["nomina"] == "" && $_SESSION["nomina"]== null) {
    echo "<META HTTP-EQUIV='REFRESH' CONTENT='1; URL=loginUsuario.php'>";
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
    <title>Quéjate - Buzón de Reportes</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
    <link rel="stylesheet" href="css/dashboardStyleUsuario.css">
    <link href="https://fonts.googleapis.com/css2?family=Bangers&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/bot.css">

    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>

<div class="comic-container">
    <div class="logo-title-container">
        <img src="imagenes/GrameLogo2.png" alt="Logo" class="logo">
        <div class="comic-title-usuario">
            <span>¡QUEJATE!</span>
        </div>
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
                    <span id="nombreUsuario"><?php echo $_SESSION["nombre"]; ?></span>
                </div>

                <label class="user-label">Número de nómina:</label>
                <div class="user-data-box">
                    <span id="nominaUsuario"><?php echo $_SESSION["nomina"];?></span>
                </div>
            </div>

            <p class="instruction-text">Presiona <strong>"Siguiente"</strong> para continuar con tu queja.</p>
        </div>

        <!-- Paso 2: Selección de Área -->
        <div id="step2" class="content hidden">
            <h2 class="step-title">Selecciona tu Área Donde Trabajas</h2>

            <!-- 🔹 Selección de Área (Se llenará dinámicamente con JavaScript) -->
            <div class="form-group">
                <label for="area" class="step-label">Tu Área:</label>
                <select id="area" class="step-select">
                    <option value="" disabled selected>Área</option>
                    <!-- 🔥 Opciones cargadas desde la BD con JS -->
                </select>
            </div>

            <!-- 🔹 Selección de Supervisor (Cargado dinámicamente) -->
            <div class="form-group hidden" id="supervisor-container">
                <label for="supervisor" class="step-label">Supervisor:</label>
                <select id="supervisor" class="step-select">
                    <option value="" disabled selected>Selecciona tu supervisor</option>
                </select>
            </div>

            <!-- 🔹 Selección de Shift Leader (Cargado dinámicamente) -->
            <div class="form-group hidden" id="shiftLeader-container">
                <label for="shiftLeader" class="step-label">Shift Leader:</label>
                <select id="shiftLeader" class="step-select">
                    <option value="" disabled selected>Selecciona tu Shift Leader</option>
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
        <button id="btnFinalizar" class="btn-next hidden">Finalizar</button>
    </div>
</div>

<!-- 🔹 Contenedor del Bot (Inicialmente Oculto) -->
<div id="bot" class="hidden">
    <img id="botSprite" src="imagenes/gatilloMamon1.png" alt="Bot Caminando">
</div>

<!-- 🔹 Globo de Diálogo (Inicialmente Oculto) -->
<div id="dialogo" class="hidden">
    ¡Puedes retroceder a cualquier pestaña dándole click!
</div>

<!-- 🔹 Botón de ayuda (inicialmente oculto) -->
<button id="btnAyuda" class="hidden">?</button>



<script src = "js/pestanasReporte.js"></script>
<script src = "js/areaProduccion.js"></script>
<script src = "js/validacionesReporte.js"></script>
<script src = "js/bot.js"></script>
<script src = "js/cargarEncargados.js"></script>
<script src = "js/cargarAreas.js"></script>
<script src = "js/enviarReporte.js"></script>
<script>
    document.addEventListener("DOMContentLoaded", () => {
        const container = document.querySelector(".comic-title-usuario");
        const text = container.textContent.trim();
        container.innerHTML = ""; // Limpiar
        text.split("").reverse().forEach((char, index) => {
            const span = document.createElement("span");
            span.setAttribute("data-letter", char);
            span.style.animationDelay = `${index * 0.2}s`; // Delay por letra
            span.textContent = char;
            container.appendChild(span);
        });
    });
</script>






</body>
</html>