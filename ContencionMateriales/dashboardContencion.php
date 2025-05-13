<!-- dashboardContencion.html -->
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dashboard Contención</title>
    <link rel="stylesheet" href="css/dashboardContencion.css" />
    <link rel="stylesheet" href="css/perfilUsuario.css" />
    <link rel="stylesheet" href="css/tablaCasos.css" />

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
</head>
<body>
<div class="sidebar">
    <div class="user-dropdown" id="userDropdownToggle">
        <img src="imagenes/avatar_default.png" alt="Avatar" class="avatar-icon">
        <span id="usernameLabel">Óscar</span>
        <i class="fa-solid fa-caret-down"></i>
        <div class="user-dropdown-panel" id="userDropdownPanel">
            <div class="user-info">
                <img src="imagenes/avatar_default.png" alt="Avatar" class="avatar-large">
                <div class="user-text">
                    <strong>Óscar</strong>
                    <p class="username">@ivancelot9</p>
                </div>
            </div>
        </div>
    </div>

    <button class="sidebar-btn" data-section="formulario">
        <i class="fa-solid fa-plus"></i>
        Levantar nuevo caso
    </button>

    <button class="sidebar-btn" data-section="historial">
        <i class="fa-solid fa-folder-open"></i>
        Mis casos
    </button>

    <div class="bottom-actions">
        <button class="sidebar-btn" data-section="admin">Administrador</button>
        <button class="sidebar-btn">Cerrar Sesión</button>
    </div>
</div>

<main class="main-content">
    <!-- Sección 1: Formulario -->
    <section id="formulario" class="main-section">
        <h1><strong>DATOS</strong></h1>
        <form class="data-form">
            <div class="form-group">
                <label for="responsable">Responsable</label>
                <input type="text" id="responsable" placeholder="Nombre" />
            </div>
            <div class="form-group">
                <label for="proveedor">Proveedor</label>
                <input type="text" id="proveedor" placeholder="Proveedor" />
            </div>
            <div class="form-group">
                <label for="defectos">Defectos</label>
                <button type="button" class="form-button">Seleccionar Defectos</button>
            </div>
            <div class="form-group">
                <label for="evidencia">Fotos/Evidencia</label>
                <button type="button" class="form-button">Agregar Fotos</button>
            </div>
            <div class="form-group confirm">
                <button type="submit" class="confirm-button">Confirmar</button>
            </div>
        </form>
    </section>

    <!-- Sección 2: Historial -->
    <section id="historial" class="main-section" style="display: none;">
        <h1><strong>Mis Casos</strong></h1>
        <table class="cases-table">
            <thead>
            <tr>
                <th>Folio</th>
                <th>Fecha Registro</th>
                <th>Descripción</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>001</td>
                <td>2025-05-13</td>
                <td><button class="show-desc">Mostrar descripción</button></td>
            </tr>
            </tbody>
        </table>
    </section>

    <!-- Sección 3: Administrador -->
    <section id="admin" class="main-section" style="display: none;">
        <h1><strong>Administrador</strong></h1>
        <p>Aún no hay contenido definido.</p>
    </section>
</main>

<script src="js/perfilUsuario.js" defer></script>
<script src="js/navegacionDashboard.js" defer></script>
</body>
</html>
