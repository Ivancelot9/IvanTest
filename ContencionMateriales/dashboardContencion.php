<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
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


// Incluyo el conector desde la carpeta dao/
$path = __DIR__ . '/dao/conexionContencion.php';
if (! file_exists($path)) {
    die("¡Error! No encontré el conector en: $path");
}
include_once $path;

$con = (new LocalConector())->conectar();

// Precargo los catálogos
$terciarias  = $con->query("SELECT IdTerceria, NombreTerceria   FROM Terceria    ORDER BY NombreTerceria");
$proveedores = $con->query("SELECT IdProveedor, NombreProveedor FROM Proveedores ORDER BY NombreProveedor");
$commodities = $con->query("SELECT IdCommodity, NombreCommodity FROM Commodity   ORDER BY NombreCommodity");
$defectos    = $con->query("SELECT IdDefectos,   NombreDefectos  FROM Defectos     ORDER BY NombreDefectos");



?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dashboard Contención</title>
    <link rel="stylesheet" href="css/dashboardContencion.css" />
    <link rel="stylesheet" href="css/agregarComponentes.css">

    <link rel="stylesheet" href= "css/modalFotos.css"/>
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
    <!-- Botón de idioma en la esquina superior derecha -->
    <button id="btn-language-toggle" class="language-toggle">ES/EN</button>
    <!-- Sección 1: Formulario -->
    <section id="formulario" class="main-section">
        <h1><strong>DATOS</strong></h1>

        <div class="form-panel">
            <!-- ————————————————
                 1) Canvas: tu formulario en blanco
                 ———————————————— -->
            <div class="form-main" id="form-main">
                <form class="data-form"
                      method="post"
                      action="guardarCaso.php?tab_id=<?php echo urlencode($tab_id) ?>">
                    <!-- RESPONSABLE -->
                    <div class="form-group">
                        <label for="responsable">Responsable</label>
                        <input
                                type="text"
                                name="Responsable"
                                id="responsable"
                                placeholder="Nombre del responsable"
                                required
                        />
                    </div>

                    <!-- No. PARTE + CANTIDAD -->
                    <div class="form-row">
                        <div class="form-group">
                            <label for="no-parte">No. Parte</label>
                            <input type="text"
                                   name="NumeroParte"
                                   id="no-parte"
                                   placeholder="Número de parte"
                                   required />
                        </div>
                        <div class="form-group">
                            <label for="cantidad">Cantidad</label>
                            <input
                                    type="number"
                                    name="Cantidad"
                                    id="cantidad"
                                    placeholder="Cantidad"
                                    min="1"
                                    step="1"
                                    required
                            />
                        </div>
                    </div>

                    <!-- DESCRIPCIÓN -->
                    <div class="form-group">
                        <label for="descripcion">Descripción</label>
                        <textarea name="Descripcion"
                                  id="descripcion"
                                  placeholder="Descripción del caso"></textarea>
                    </div>

                    <!-- TERCIARIA + PROVEEDOR -->
                    <div class="form-row">
                        <div class="form-group">
                            <label for="terciaria">Terciaria</label>
                            <select name="IdTerceria" id="terciaria" required>
                                <option value="">Selecciona opción</option>
                                <!-- PHP carga aquí -->
                                <?php while($r = $terciarias->fetch_assoc()): ?>
                                    <option value="<?= $r['IdTerceria'] ?>">
                                        <?= htmlspecialchars($r['NombreTerceria']) ?>
                                    </option>
                                <?php endwhile; ?>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="proveedor">Proveedor</label>
                            <select name="IdProveedor" id="proveedor" required>
                                <option value="">Selecciona proveedor</option>
                                <!-- PHP carga aquí -->
                                <?php while($r = $proveedores->fetch_assoc()): ?>
                                    <option value="<?= $r['IdProveedor'] ?>">
                                        <?= htmlspecialchars($r['NombreProveedor']) ?>
                                    </option>
                                <?php endwhile; ?>
                            </select>
                        </div>
                    </div>

                    <!-- COMMODITY -->
                    <div class="form-group">
                        <label for="commodity">Commodity</label>
                        <select name="IdCommodity" id="commodity" required>
                            <option value="">Selecciona commodity</option>
                            <!-- PHP carga aquí -->
                            <?php while($c = $commodities->fetch_assoc()): ?>
                                <option value="<?= $c['IdCommodity'] ?>">
                                    <?= htmlspecialchars($c['NombreCommodity']) ?>
                                </option>
                            <?php endwhile; ?>
                        </select>
                    </div>

                    <!-- DEFECTOS -->
                    <div class="form-group">
                        <label for="defectos">Defectos</label>
                        <select name="IdDefectos" id="defectos" required>
                            <option value="">Selecciona defecto</option>
                            <!-- PHP carga aquí -->
                            <?php while($d = $defectos->fetch_assoc()): ?>
                                <option value="<?= $d['IdDefectos'] ?>">
                                    <?= htmlspecialchars($d['NombreDefectos']) ?>
                                </option>
                            <?php endwhile; ?>
                        </select>
                    </div>

                    <!-- FOTOS/EVIDENCIA -->
                    <div class="form-group">
                        <label>Fotos/Evidencia</label>
                        <button type="button" class="form-button">Agregar Fotos</button>
                    </div>

                    <!-- BOTÓN CONFIRMAR -->
                    <div class="form-group confirm">
                        <button type="submit" class="confirm-button">Confirmar</button>
                    </div>
                </form>
            </div>

            <!-- —————————————————————————
                 2) Barra lateral derecha
                 ————————————————————————— -->
            <aside class="form-sidebar">
                <ul>
                    <li>
                        <button type="button" data-type="terciaria">
                            <i class="fa-solid fa-building"></i> Agregar Terciaria
                        </button>
                    </li>
                    <li>
                        <button type="button" data-type="proveedor">
                            <i class="fa-solid fa-truck"></i> Agregar Proveedor
                        </button>
                    </li>
                    <li>
                        <button type="button" data-type="commodity">
                            <i class="fa-solid fa-box"></i> Agregar Commodity
                        </button>
                    </li>
                    <li>
                        <button type="button" data-type="defecto">
                            <i class="fa-solid fa-exclamation-triangle"></i> Agregar Defecto
                        </button>
                    </li>
                </ul>
            </aside>

        </div>
    </section>





    <!-- Sección 2: Mis Casos -->
    <section id="historial" class="main-section" style="display: none;">
        <h1><strong>Mis Casos</strong></h1>


        <!-- 🔎 Controles de búsqueda -->
        <div class="table-controls">
            <div class="filter-container">
                <label for="historial-filter-column">Filtrar por:</label>
                <select id="historial-filter-column">
                    <option value="folio">Folio</option>
                    <option value="fecha">Fecha Registro</option>
                </select>
                <input type="text" id="historial-filter-input" placeholder="Buscar...">
                <button id="historial-filter-button">🔍 Buscar</button>
            </div>
        </div>

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
            <tr><td>002</td><td>2025-05-14</td><td><button class="show-desc">Mostrar descripción</button></td></tr>
            <tr><td>003</td><td>2025-05-15</td><td><button class="show-desc">Mostrar descripción</button></td></tr>
            <tr><td>004</td><td>2025-05-16</td><td><button class="show-desc">Mostrar descripción</button></td></tr>
            <tr><td>005</td><td>2025-05-17</td><td><button class="show-desc">Mostrar descripción</button></td></tr>
            <tr><td>006</td><td>2025-05-18</td><td><button class="show-desc">Mostrar descripción</button></td></tr>
            </tbody>
        </table>

        <!-- 📑 Controles de paginación -->
        <div class="pagination" id="historial-pagination">
            <button id="hist-prev" disabled>⬅ Anterior</button>
            <span id="hist-page-indicator">Página 1</span>
            <button id="hist-next">Siguiente ➡</button>
        </div>

    </section>

    <!-- Sección 3: Historial de Casos-->
    <section id="historial-casos" class="main-section" style="display: none;">
        <h1><strong>Historial de Casos</strong></h1>

        <!-- 🔎 Controles de búsqueda -->
        <div class="table-controls">
            <div class="filter-container">
                <label for="todos-filter-column">Filtrar por:</label>
                <select id="todos-filter-column">
                    <option value="folio">Folio</option>
                    <option value="fecha">Fecha Registro</option>
                </select>
                <input type="text" id="todos-filter-input" placeholder="Buscar...">
                <button id="todos-filter-button">🔍 Buscar</button>
            </div>
        </div>

        <table class="cases-table" id="tabla-todos-casos">
            <thead>
            <tr>
                <th>Folio</th>
                <th>Fecha Registro</th>
                <th>Descripción</th>
            </tr>
            </thead>
            <tbody>
            <!-- Se llenará dinámicamente con todos los casos -->
            <tr><td>001</td><td>2025-05-13</td><td><button class="show-desc">Mostrar descripción</button></td></tr>
            <tr><td>002</td><td>2025-05-14</td><td><button class="show-desc">Mostrar descripción</button></td></tr>
            <tr><td>003</td><td>2025-05-15</td><td><button class="show-desc">Mostrar descripción</button></td></tr>
            <tr><td>004</td><td>2025-05-16</td><td><button class="show-desc">Mostrar descripción</button></td></tr>
            <tr><td>005</td><td>2025-05-17</td><td><button class="show-desc">Mostrar descripción</button></td></tr>
            <tr><td>006</td><td>2025-05-18</td><td><button class="show-desc">Mostrar descripción</button></td></tr>
            </tbody>
        </table>

        <!-- 📑 Controles de paginación -->
        <div class="pagination" id="todos-pagination">
            <button id="todos-prev" disabled>⬅ Anterior</button>
            <span id="todos-page-indicator">Página 1</span>
            <button id="todos-next">Siguiente ➡</button>
        </div>
    </section>
</main>

<script src="js/perfilUsuario.js" defer></script>
<script src="js/navegacionDashboard.js" defer></script>
<script src="js/cerrarSesionContencion.js" defer></script>
<script src="js/cambioIdioma.js" defer></script>
<script src="js/modalFotos.js" defer></script>
<script src="js/agregarComponentesFormulario.js" defer></script>
<script src="js/tablaMisCasos.js"></script>
<script src="js/validacionesCasos.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>


</body>
</html>
