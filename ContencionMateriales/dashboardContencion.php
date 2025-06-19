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

// ————————————————
// 1) Recupera el IdUsuario de tu sesión
// ————————————————
$stmtUser = $con->prepare("
    SELECT IdUsuario 
      FROM Usuario 
     WHERE Username = ?
");
if (! $stmtUser) {
    die("Error preparando SELECT IdUsuario: " . $con->error);
}
$stmtUser->bind_param("s", $username);
$stmtUser->execute();
$stmtUser->bind_result($idUsuario);
if (! $stmtUser->fetch()) {
    die("El usuario “{$username}” no existe en la BD.");
}
$stmtUser->close();

?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dashboard Contención</title>
    <link rel="stylesheet" href="css/dashboardContencion.css" />
    <link rel="stylesheet" href="css/agregarComponentes.css">
    <link rel="stylesheet" href="css/modalMostrarDescripcion.css">
    <link rel="stylesheet" href= "css/modalFotos.css"/>
    <link rel="stylesheet" href="css/perfilUsuario.css" />
    <link rel="stylesheet" href="css/tablaCasos.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11" defer></script>

    <!-- navegación -->
    <script src="js/navegacionDashboard.js" defer></script>

    <!-- perfil / cerrar sesión / idioma -->
    <script src="js/perfilUsuario.js" defer></script>
    <script src="js/cerrarSesionContencion.js" defer></script>
    <script src="js/cambioIdioma.js" defer></script>

    <!-- modal fotos / formularios -->
    <script src="js/modalFotos.js" defer></script>
    <script src="js/agregarComponentesFormulario.js" defer></script>

    <!-- paginación y validaciones -->
    <script src="js/tablaMisCasos.js" defer></script>
    <script src="js/validacionesCasos.js" defer></script>

    <!-- notificaciones en tiempo real -->
    <script src="js/notificacionesCasos.js" defer></script>
    <script src="js/modalMostrarDescripcion.js" defer></script>
</head>
<body
        data-tab-id="<?php echo htmlspecialchars($tab_id); ?>"
        data-username="<?php echo htmlspecialchars($username); ?>">
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

    <button class="sidebar-btn" data-section="historial" id="btn-mis-casos">
        <i class="fa-solid fa-folder-open"></i>
        Mis casos
        <span class="badge-count" style="display:none"></span>
    </button>

    <div class="bottom-actions">
        <?php if ($rol == 2): ?>
            <button class="sidebar-btn" data-section="historial-casos" id="btn-historial-casos">
                <i class="fa-solid fa-clock-rotate-left"></i>
                Historial de casos
                <span class="badge-count" style="display:none"></span>
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
            <div class="form-main" id="form-main">
                <form class="data-form"
                      method="post"
                      action="https://grammermx.com/IvanTest/ContencionMateriales/dao/guardarCaso.php?tab_id=<?php echo urlencode($tab_id)?>"
                      enctype="multipart/form-data" novalidate>

                    <!-- RESPONSABLE -->
                    <div class="form-group">
                        <label for="responsable" title="Agrega el nombre de un responsable">Responsable</label>
                        <input type="text" name="Responsable" id="responsable" placeholder="Nombre del responsable" />
                    </div>

                    <!-- No. PARTE + CANTIDAD -->
                    <div class="form-row">
                        <div class="form-group">
                            <label for="no-parte" title="Agrega el Número de Parte">No. Parte</label>
                            <input type="text" name="NumeroParte" id="no-parte" placeholder="Número de parte" />
                        </div>
                        <div class="form-group">
                            <label for="cantidad" title="Agrega la cantidad deseada">Cantidad</label>
                            <input type="number" name="Cantidad" id="cantidad" placeholder="Cantidad" min="0.001" step="0.001" />
                        </div>
                    </div>

                    <!-- DESCRIPCIÓN -->
                    <div class="form-group">
                        <label for="descripcion" title="Agrega la descripción del material">Descripción</label>
                        <textarea name="Descripcion" id="descripcion" placeholder="Descripción del caso"></textarea>
                    </div>

                    <!-- TERCIARIA + PROVEEDOR -->
                    <div class="form-row">
                        <div class="form-group">
                            <label for="terciaria" title="Agrega el proveedor tercero">Terciaria</label>
                            <select name="IdTerceria" id="terciaria">
                                <option value="">Selecciona opción</option>
                                <?php while($r = $terciarias->fetch_assoc()): ?>
                                    <option value="<?= $r['IdTerceria'] ?>">
                                        <?= htmlspecialchars($r['NombreTerceria']) ?>
                                    </option>
                                <?php endwhile; ?>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="proveedor" title="Agrega el nombre del proveedor de la pieza">Proveedor de la Pieza</label>
                            <select name="IdProveedor" id="proveedor">
                                <option value="">Selecciona al proveedor de pieza</option>
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
                        <label for="commodity" title="Agrega el Commodity">Commodity</label>
                        <select name="IdCommodity" id="commodity">
                            <option value="">Selecciona commodity</option>
                            <?php while($c = $commodities->fetch_assoc()): ?>
                                <option value="<?= $c['IdCommodity'] ?>">
                                    <?= htmlspecialchars($c['NombreCommodity']) ?>
                                </option>
                            <?php endwhile; ?>
                        </select>
                    </div>

                    <!-- DEFECTOS Y FOTOS - NUEVO FLUJO -->
                    <div class="form-group">
                        <label>Defectos encontrados</label>
                        <button type="button" id="btn-agregar-defecto" class="form-button">
                            + Agregar defecto
                        </button>
                    </div>

                    <div id="bloques-defectos" class="bloques-defectos-container">
                        <!-- Aquí se insertarán dinámicamente los bloques -->
                    </div>

                    <!-- BOTÓN CONFIRMAR -->
                    <div class="form-group confirm">
                        <button type="submit" class="confirm-button">Confirmar</button>
                    </div>
                </form>
            </div>
        </div>
    </section>

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
                <th>Descripción</th>    <!-- movido -->
                <th>Estatus</th>        <!-- al final -->
            </tr>
            </thead>
            <tbody>
            <?php
            $rs = $con->prepare("
            SELECT 
                c.FolioCaso                     AS folio,
                DATE_FORMAT(c.FechaRegistro, '%Y-%m-%d') AS fecha,
                e.NombreEstatus                 AS estatus,
                c.Descripcion                   AS descripcion
            FROM Casos c
            JOIN Estatus e ON e.IdEstatus = c.IdEstatus
            WHERE c.IdUsuario = ?
            ORDER BY c.FolioCaso DESC
        ");
            $rs->bind_param("i", $idUsuario);
            $rs->execute();
            $result = $rs->get_result();
            while ($row = $result->fetch_assoc()):
                ?>
                <tr>
                    <td><?= htmlspecialchars($row['folio']) ?></td>
                    <td><?= htmlspecialchars($row['fecha']) ?></td>
                    <td>
                        <button class="show-desc"
                                data-folio="<?= htmlspecialchars($row['folio']) ?>">
                            Mostrar descripción
                        </button>
                    </td>
                    <td><?= htmlspecialchars($row['estatus']) ?></td>
                </tr>
            <?php
            endwhile;
            $rs->close();
            ?>
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
    <!-- Sección 3: Historial de Casos-->
    <section id="historial-casos" class="main-section" style="display: none;">
        <h1><strong>Historial de Casos</strong></h1>

        <!-- Controles de búsqueda -->
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
                <th>Responsable</th>   <!-- movido -->
                <th>Terciaria</th>     <!-- movido -->
                <th>Descripción</th>   <!-- movido -->
                <th>Estatus</th>       <!-- al final -->
            </tr>
            </thead>
            <tbody>
            <?php
            $todos = $con->prepare("
            SELECT 
                c.FolioCaso        AS folio,
                DATE_FORMAT(c.FechaRegistro, '%Y-%m-%d') AS fecha,
                c.Responsable      AS responsable,
                t.NombreTerceria   AS terciaria,
                c.Descripcion      AS descripcion,
                e.NombreEstatus    AS estatus
            FROM Casos c
            JOIN Terceria t  ON t.IdTerceria  = c.IdTerceria
            JOIN Estatus e   ON e.IdEstatus   = c.IdEstatus
            ORDER BY c.FolioCaso DESC
        ");
            $todos->execute();
            $result = $todos->get_result();
            while ($row = $result->fetch_assoc()):
                ?>
                <tr>
                    <td><?= htmlspecialchars($row['folio'])      ?></td>
                    <td><?= htmlspecialchars($row['fecha'])      ?></td>
                    <td><?= htmlspecialchars($row['responsable'])?></td>
                    <td><?= htmlspecialchars($row['terciaria'])  ?></td>
                    <td>
                        <button class="show-desc"
                                data-folio="<?= htmlspecialchars($row['folio']) ?>">
                            Mostrar descripción
                        </button>
                    </td>
                    <td><?= htmlspecialchars($row['estatus'])    ?></td>
                </tr>
            <?php endwhile;
            $todos->close();
            ?>
            </tbody>
        </table>

        <!-- Controles de paginación -->
        <div class="pagination" id="todos-pagination">
            <button id="todos-prev" disabled>⬅ Anterior</button>
            <span id="todos-page-indicator">Página 1 de X</span>
            <button id="todos-next">Siguiente ➡</button>
        </div>
    </section>
</main>

<!-- Modal de reporte -->
<div id="modal-descripcion" class="modal-overlay">
    <div class="modal-content reporte">
        <div class="reporte-inner">
            <header class="reporte-header">
                <h2 class="modal-heading">
                    Datos del Caso
                    <img src="imagenes/Recurso 6 (2).png" alt="Logo" class="modal-logo-inline">
                </h2>
                <button id="modal-cerrar" class="modal-close">&times;</button>
            </header>

            <section class="reporte-grid">
                <div class="field-label">Folio:</div>      <div class="field-value"   id="r-folio"></div>
                <div class="field-label">Fecha:</div>      <div class="field-value"   id="r-fecha"></div>
                <div class="field-label">No. Parte:</div>  <div class="field-value"   id="r-parte"></div>
                <div class="field-label">Cantidad:</div>   <div class="field-value"   id="r-cantidad"></div>
                <div class="field-label">Terciaria:</div>  <div class="field-value"   id="r-terciaria"></div>
                <div class="field-label">Proveedor:</div>  <div class="field-value"   id="r-proveedor"></div>
                <div class="field-label">Commodity:</div>  <div class="field-value"   id="r-commodity"></div>
                <div class="field-label">Defectos:</div>   <div class="field-value"   id="r-defectos"></div>

                <div class="field-label description-label">Descripción:</div>
                <div class="description-box"           id="r-descripcion"></div>
            </section>

            <section class="reporte-photos">
                <div class="photo-section ok-section">
                    <h3><i class="fa fa-check-circle"></i> Fotos OK</h3>
                    <div class="photos-grid ok" id="r-photos-ok"></div>
                </div>
                <div class="photo-section no-section">
                    <h3><i class="fa fa-times-circle"></i> Fotos NO OK</h3>
                    <div class="photos-grid no" id="r-photos-no"></div>
                </div>
            </section>
        </div>
    </div>
</div>

<!-- Lightbox para imágenes -->
<div id="modal-image" class="modal-overlay">
    <button class="close-img">&times;</button>
    <img src="" alt="Vista ampliada">
</div>



<script>
    window.defectosCatalogo = [
        <?php
        $res = $con->query("SELECT IdDefectos, NombreDefectos FROM Defectos ORDER BY NombreDefectos");
        $items = [];
        while ($d = $res->fetch_assoc()) {
            $id   = (int)$d['IdDefectos'];
            $name = json_encode($d['NombreDefectos']); // para escapar bien caracteres
            $items[] = "{ id: $id, name: $name }";
        }
        echo implode(",", $items);
        ?>
    ];
</script>
</body>
</html>
