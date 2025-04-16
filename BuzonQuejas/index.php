<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Buzón de Reportes - Cómic</title>
    <link rel="stylesheet" href="css/loginAdmin.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==" crossorigin="anonymous" referrerpolicy="no-referrer">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bangers&display=swap" rel="stylesheet">
    <!-- Incluye SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>
<div class="hud-line left"></div>
<div class="hud-line right"></div>
<div class="comic-container">
    <!-- Imagen del logo -->
    <img src="imagenes/Grammer_Logo_Original_White_sRGB_screen_transparent.png" alt="Logo Grammer" class="logo">

    <!-- Contenido principal -->
    <div class="comic-panel">
        <h1 class="comic-title">Buzón de Reportes</h1>
        <div class="form-container">
            <div class="form-header">
                <button id="registerBtn" class="toggle-btn">Registrar</button>
                <button id="loginBtn" class="toggle-btn active">Iniciar Sesión</button>
            </div>

            <form id="mainForm" class="form">
                <div id="dynamicFields">
                    <!-- Campos iniciales para "Iniciar Sesión" -->
                    <div class="input-group">
                        <i class="fa-solid fa-envelope"></i>
                        <input type="text" id="NumNomina" placeholder="Número de Nómina">
                    </div>
                    <div class="input-group">
                        <i class="fa-solid fa-lock"></i>
                        <input type="password" id="Contrasena" placeholder="Contraseña" autocomplete="new-password">
                    </div>
                </div>
                <button type="submit" class="submit-btn">Entrar</button>
            </form>
        </div>
    </div>
</div>

<script src="js/inicioSesion.js" type="module" defer></script>
</body>
</html>
