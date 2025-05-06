<!-- login.html -->
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Programa de Contención – Iniciar Sesión</title>
    <link rel="stylesheet" href="css/loginAdminContenciones.css">
    <link rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
          integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
          crossorigin="anonymous" referrerpolicy="no-referrer">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11" defer></script>
</head>
<body>
<!-- Líneas azules laterales -->
<div class="accent-line left"></div>
<div class="accent-line right"></div>

<!-- Zona central que muestra la imagen -->
<div class="white-area"></div>

<!-- Tu tarjeta de login, intacta y por encima -->
<div class="login-container">
    <img src="imagenes/Grammer_Logo.png" alt="Logo Programa de Contención" class="logo">
    <h1 class="login-title">Programa de Contención</h1>
    <div class="form-container">
        <div class="form-header">
            <button id="registerBtn" class="toggle-btn">Registrar</button>
            <button id="loginBtn"    class="toggle-btn active">Iniciar Sesión</button>
        </div>
        <form id="mainForm" class="login-form">
            <div id="dynamicFields"></div>
            <button type="submit" class="submit-btn">Entrar</button>
        </form>
        <p class="help-text">
            <a href="#" class="link-secondary">¿Olvidaste tu contraseña?</a>
        </p>
    </div>
</div>

<script src="js/inicioSesionContecion.js" defer></script>
</body>
</html>