<?php
session_start();

if (!isset($_GET['tab_id'])) {
    session_destroy();
    echo "<META HTTP-EQUIV='REFRESH' CONTENT='1; URL=login.php'>";
    exit;
}
$tab_id = $_GET['tab_id'];

// Ahora comprobamos solo lo que sí guardas:
if (
    !isset($_SESSION['usuariosPorPestana'][$tab_id]) ||
    empty($_SESSION['usuariosPorPestana'][$tab_id]['Username']) ||
    empty($_SESSION['usuariosPorPestana'][$tab_id]['Conectado'])
) {
    session_destroy();
    echo "<META HTTP-EQUIV='REFRESH' CONTENT='1; URL=login.php'>";
    exit;
}

$usuarioActual = $_SESSION['usuariosPorPestana'][$tab_id];
$rol = $usuarioActual['Rol'] ?? 1;
$username = htmlspecialchars($usuarioActual['Username']);
$nombre   = htmlspecialchars($usuarioActual['Nombre']);
?>

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
<body data-tab-id="<?php echo htmlspecialchars($tab_id); ?>">
<div class="sidebar">
    <div class="user-dropdown" id="userDropdownToggle">
        <img src="imagenes/avatar_default.png" alt="Avatar" class="avatar-icon">
        <span id="usernameLabel"><?php echo $nombre; ?></span>
        <i class="fa-solid fa-caret-down"></i>
        <div class="user-dropdown-panel" id="userDropdownPanel">
            <div class="user-info">
                <img src="imagenes/avatar_default.png" alt="Avatar" class="avatar-large">
                <div class="user-text">
                    <strong><?php echo $nombre; ?></strong>
                    <p class="username">@<?php echo $username; ?></p>
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
        <?php if ($rol == 2): ?>
            <button class="sidebar-btn" data-section="historial-casos">
                <i class="fa-solid fa-clock-rotate-left"></i>
                Historial de casos
            </button>
            <button class="sidebar-btn" data-section="admin">
                <i class="fa-solid fa-user-shield"></i>
                Administrador
            </button>
        <?php endif; ?>

        <button class="sidebar-btn" id="btn-cerrar-sesion">
            <i class="fa-solid fa-right-from-bracket"></i>
            Cerrar Sesión
        </button>
    </div>
</div>

<main class="main-content">
    <!-- Sección 1: Formulario -->
    <section id="formulario" class="main-section">
        <h1><strong>DATOS</strong></h1>
        <form class="data-form">
            <!-- Responsable -->
            <div class="form-group">
                <label for="responsable">Responsable</label>
                <input type="text" id="responsable" placeholder="Nombre" />
            </div>

            <!-- No. Parte + Cantidad -->
            <div class="form-row">
                <div class="form-group">
                    <label for="no-parte">No. Parte</label>
                    <input type="text" id="no-parte" placeholder="Número de parte" />
                </div>
                <div class="form-group">
                    <label for="cantidad">Cantidad</label>
                    <input type="number" id="cantidad" placeholder="Cantidad" />
                </div>
            </div>

            <!-- Descripción -->
            <div class="form-group">
                <label for="descripcion">Descripción</label>
                <textarea id="descripcion" placeholder="Descripción del caso"></textarea>
            </div>

            <!-- Terciaria + Proveedor -->
            <div class="form-row">
                <div class="form-group">
                    <label for="terciaria">Terciaria</label>
                    <input type="text" id="terciaria" placeholder="Terciaria" />
                </div>
                <div class="form-group">
                    <label for="proveedor">Proveedor</label>
                    <input type="text" id="proveedor" placeholder="Proveedor" />
                </div>
            </div>

            <!-- Commodity -->
            <div class="form-group">
                <label for="commodity">Commodity</label>
                <input type="text" id="commodity" placeholder="Commodity" />
            </div>

            <!-- Defectos -->
            <div class="form-group">
                <label for="defectos">Defectos</label>
                <button type="button" class="form-button">Seleccionar Defectos</button>
            </div>

            <!-- Fotos/Evidencia -->
            <div class="form-group">
                <label for="evidencia">Fotos/Evidencia</label>
                <button type="button" class="form-button">Agregar Fotos</button>
            </div>

            <!-- Confirmar -->
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

    <!-- Sección 4: Administrador -->
    <section id="admin" class="main-section" style="display: none;">
        <h1><strong>Administrador</strong></h1>
        <p>Aún no hay contenido definido.</p>
    </section>
</main>

<script src="js/perfilUsuario.js" defer></script>
<script src="js/navegacionDashboard.js" defer></script>
<script src="js/cerrarSesionContencion.js" defer></script>
</body>
</html>
