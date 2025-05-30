<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login de Usuario - Buzón de Reportes</title>
    <link rel="stylesheet" href="css/comic-style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==" crossorigin="anonymous" referrerpolicy="no-referrer">
    <link href="https://fonts.googleapis.com/css2?family=Bangers&display=swap" rel="stylesheet">
    <!-- Incluye SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>
<div class="comic-container">
    <!-- Imagen del logo -->
    <img src="imagenes/GrameLogo2.png" alt="Logo Grammer" class="logo">
    <!-- Contenido principal -->
    <div class="comic-panel">
        <h1 class="comic-title">Buzón de Reportes</h1>
        <div class="form-container">
            <!-- Botón o cuadro de bienvenida -->
            <div class="welcome-box">
                <button class="toggle-btn">¡Bienvenido!</button>
            </div>
            <form id="userLoginForm" action="dao/login.php" method="post"  class="form">
                <div id="dynamicFields">
                    <!-- Campo para el Número de Nómina -->
                    <div class="input-group">
                        <i class="fa-solid fa-id-badge"></i>
                        <input type="text" id="userNomina" name="nomina"  placeholder="Número de Nómina" required>
                    </div>
                </div>
                <button type="submit" class="submit-btn" name="btnEntrar">Entrar</button>
            </form>
        </div>
    </div>
</div>
<script src="js/inicioSesion.js" defer></script>
</body>
</html>

