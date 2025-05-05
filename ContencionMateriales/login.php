<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Programa de Contención – Iniciar sesión</title>
    <!-- Tus estilos, adáptalos o renómbralos según tu proyecto -->
    <link rel="stylesheet" href="css/loginContencion.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==" crossorigin="anonymous" referrerpolicy="no-referrer">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bangers&display=swap" rel="stylesheet">
    <!-- SweetAlert2 para notificaciones elegantes -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>
<div class="hud-line left"></div>
<div class="hud-line right"></div>
<div class="comic-container">
    <!-- Logo (cambia la ruta a tu logo de Contención) -->
    <img src="imagenes/logo_contencion.png" alt="Logo Programa de Contención" class="logo">

    <div class="comic-panel">
        <h1 class="comic-title">Programa de Contención</h1>

        <div class="form-container">
            <div class="form-header">
                <button id="registerBtn" class="toggle-btn">Registrar</button>
                <button id="loginBtn" class="toggle-btn active">Iniciar Sesión</button>
            </div>

            <form id="mainForm" class="form">
                <div id="dynamicFields">
                    <!-- Campos para "Iniciar Sesión" -->
                    <div class="input-group">
                        <i class="fa-solid fa-user"></i>
                        <input type="text" id="usuario" placeholder="Usuario" required>
                    </div>
                    <div class="input-group">
                        <i class="fa-solid fa-lock"></i>
                        <input type="password" id="contrasena" placeholder="Contraseña" autocomplete="new-password" required>
                    </div>
                </div>
                <button type="submit" class="submit-btn">Entrar</button>
            </form>

            <!-- Botón de acceso especial Superusuario -->
            <button id="btnSuperusuario" class="special-btn">🔐 Acceso Superusuario</button>

            <!-- Modal de contraseña Superusuario, oculto inicialmente -->
            <div id="modalSuperusuario" class="modal" style="display: none;">
                <div class="modal-content">
                    <span id="closeModal" class="close-btn">&times;</span>
                    <h2>Acceso Superusuario</h2>
                    <div class="input-group">
                        <i class="fa-solid fa-key"></i>
                        <input type="password" id="claveSuper" placeholder="Contraseña Superusuario" required>
                    </div>
                    <button id="ingresarSuper" class="submit-btn">Ingresar</button>
                </div>
            </div>
        </div>
    </div>
</div>


</body>
</html>

