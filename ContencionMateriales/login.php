<!--
===============================================================================
@file       login.html
@project    Programa de Contención de Materiales
@module     Autenticación de Usuarios
@purpose    Página de acceso al sistema con funciones de inicio de sesión y registro.
@description
    Esta interfaz permite al usuario iniciar sesión o registrarse. El contenido del
    formulario es dinámico, generado por el script externo `inicioSesionContecion.js`,
    el cual controla la lógica de alternancia entre login y registro, validación de
    campos, y envíos al servidor. El diseño es responsivo y utiliza SweetAlert2 para
    mostrar mensajes emergentes atractivos y funcionales.

    ➤ Usa: js/inicioSesionContecion.js (para interacción, validación y envío)
    ➤ Usa: SweetAlert2 (alertas)
    ➤ Usa: FontAwesome (íconos)

@author     Ivan Medina/Hadbet Altamirano
@created    Mayo 2025
@updated    [¿?]
===============================================================================
-->

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Programa de Contención – Iniciar Sesión</title>

    <!-- Estilos principales -->
    <link rel="stylesheet" href="css/loginAdminContenciones.css">

    <!-- Librería de íconos -->
    <link rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
          integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
          crossorigin="anonymous" referrerpolicy="no-referrer">

    <!-- Librería para alertas personalizadas -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11" defer></script>
</head>
<body>

<!-- Líneas decorativas azules a los costados -->
<div class="accent-line left"></div>
<div class="accent-line right"></div>

<!-- Área blanca central -->
<div class="white-area"></div>

<!-- Contenedor principal del login -->
<div class="login-container">

    <!-- Logotipo del programa -->
    <img src="imagenes/Grammer_Logo.png" alt="Logo Programa de Contención" class="logo">

    <!-- Título de la interfaz -->
    <h1 class="login-title">Programa de Contención</h1>

    <!-- Contenedor del formulario -->
    <div class="form-container">

        <!-- Botones para cambiar entre login y registro -->
        <div class="form-header">
            <button id="registerBtn" class="toggle-btn">Registrar</button>
            <button id="loginBtn"    class="toggle-btn active">Iniciar Sesión</button>
        </div>

        <!-- Formulario que se llena dinámicamente con JS -->
        <form id="mainForm" class="login-form" novalidate>
            <div id="dynamicFields"></div>
            <button type="submit" class="submit-btn">Entrar</button>
        </form>

        <!-- Enlace de ayuda para recuperar contraseña -->
        <p class="help-text">
            <a href="#" class="link-secondary">¿Olvidaste tu contraseña?</a>
        </p>

    </div>
</div>

<!-- Script que controla todo el comportamiento del formulario -->
<script src="js/inicioSesionContecion.js" defer></script>

</body>
</html>
