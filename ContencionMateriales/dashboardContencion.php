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
    <link rel="stylesheet" href="css/modalEnviarCorreos.css">
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
    <script src="js/seleccionadorCasos.js" defer></script>
    <script src="js/modalEnviarCorreos.js" defer></script>
</head>
<body
        data-tab-id="<?php echo htmlspecialchars($tab_id); ?>"
        data-username="<?php echo htmlspecialchars($username); ?>">
<div class="sidebar">
    <!-- Panel del usuario -->
    <div class="user-dropdown" id="userDropdownToggle">
        <img src="imagenes/avatar_default.png" alt="Avatar" class="avatar-icon" id="currentAvatarMini">
        <span id="usernameLabel"><?php echo $nombre; ?></span>
        <i class="fa-solid fa-caret-down"></i>

        <div class="user-dropdown-panel" id="userDropdownPanel">
            <div class="user-info">
                <img src="imagenes/avatar_default.png" alt="Avatar" class="avatar-large" id="currentAvatarLarge">
                <div class="user-text">
                    <strong><?php echo $nombre; ?></strong>
                    <p class="username">@<?php echo $username; ?></p>
                </div>
            </div>

            <hr style="margin: 10px 0; border-color: #333;">

            <div>
                <p style="margin-bottom: 8px;">Selecciona tu avatar:</p>
                <div id="avatarSelector" class="avatar-selector">
                    <img src="imagenes/avatar_grammer_latino_1.png" class="avatar-option">
                    <img src="imagenes/avatar_grammer_latino_2.png" class="avatar-option">
                    <img src="imagenes/avatar_grammer_latino_3.png" class="avatar-option">
                    <img src="imagenes/avatar_grammer_latino_4.png" class="avatar-option">

                    <!-- Botón para subir foto -->
                    <label for="customAvatarInput" class="avatar-option custom-avatar-label">
                        <span>📷</span>
                        <p style="font-size: 0.7rem;">Tu foto</p>
                        <input type="file" id="customAvatarInput" accept="image/*" style="display: none;">
                    </label>
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
            <!-- Contenedor del formulario principal -->
            <div class="form-main" id="form-main">
                <form class="data-form"
                      method="post"
                      action="https://grammermx.com/IvanTest/ContencionMateriales/dao/guardarCaso.php?tab_id=<?php echo urlencode($tab_id)?>"
                      enctype="multipart/form-data" novalidate>

                    <!-- RESPONSABLE -->
                    <div class="form-group">
                        <label for="responsable" title="Agrega el Nombre de un Responsable">Responsable</label>
                        <input type="text" name="Responsable" id="responsable" placeholder="Nombre del responsable" />
                    </div>

                    <!-- No. PARTE + CANTIDAD -->
                    <div class="form-row">
                        <div class="form-group">
                            <label for="no-parte" title="Agrega el Número de Parte">No. Parte</label>
                            <input type="text" name="NumeroParte" id="no-parte" placeholder="Número de parte" />
                        </div>
                        <div class="form-group">
                            <label for="cantidad" title="Agrega la Cantidad a Inspeccionar">Cantidad</label>
                            <input type="number" name="Cantidad" id="cantidad" placeholder="Cantidad" min="0.001" step="0.001" />
                        </div>
                    </div>

                    <!-- DESCRIPCIÓN -->
                    <div class="form-group">
                        <label for="descripcion" title="Agrega la Descripción del Material">Descripción</label>
                        <textarea name="Descripcion" id="descripcion" placeholder="Descripción del caso"></textarea>
                    </div>

                    <!-- TERCIARIA + PROVEEDOR -->
                    <div class="form-row">
                        <div class="form-group">
                            <label for="terciaria" title="Agrega el Proveedor Tercero">Terciaria</label>
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
                            <label for="proveedor" title="Agrega el Nombre del Proveedor del Material">Proveedor del Material</label>
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
                        <label for="commodity" title="Selecciona el Commodity">Commodity</label>
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
                        <label for="Defectos" title="Agrega los Defectos a Inspeccionar">Defectos a Inspeccionar</label>
                        <button type="button" id="btn-agregar-defecto" class="form-button">
                            + Agregar defecto
                        </button>
                    </div>

                    <div id="bloques-defectos" class="bloques-defectos-container">
                        <!-- Aquí se insertarán dinámicamente los bloques -->
                    </div>

                    <!-- PDF opcional -->
                    <div class="form-group">
                        <label for="archivoPDF" title="Sube un archivo PDF si lo tienes">Archivo PDF del caso (opcional)</label>
                        <input type="file" id="archivoPDF" name="archivoPDF" accept="application/pdf">
                        <button type="button" id="verPDF" class="form-button" disabled>🔍 Ver PDF</button>
                    </div>

                    <!-- BOTÓN CONFIRMAR -->
                    <div class="form-group confirm">
                        <button type="submit" class="confirm-button">Confirmar</button>
                    </div>

                </form> <!-- ✅ Cierre del <form> -->
            </div> <!-- ✅ Cierre de .form-main -->

            <!-- ✅ BARRA LATERAL - dentro del mismo .form-panel -->
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
            </aside> <!-- ✅ Fin de aside -->

        </div> <!-- ✅ Cierre de .form-panel -->

    </section> <!-- ✅ Cierre correcto de section#formulario -->




    <!-- Sección 2: Mis Casos -->
    <section id="historial" class="main-section" style="display: none;">
        <h1><strong>Mis Casos</strong></h1>

        <!-- 🔎 Controles de búsqueda y botón de envío -->
        <div class="table-controls">
            <div class="filter-container">
                <label for="historial-filter-column">Filtrar por:</label>
                <select id="historial-filter-column">
                    <option value="folio">Folio</option>
                    <option value="fecha">Fecha Registro</option>
                </select>
                <input type="text" id="historial-filter-input" placeholder="Buscar…">
                <button id="historial-filter-button">🔍 Buscar</button>

                <!-- Botón para alternar modo selección -->
                <button id="btn-toggle-seleccion" class="enviar-btn" style="margin-left: 12px;">
                    📤 Enviar por correo
                </button>
            </div>
        </div>

        <!-- 📋 Tabla de casos con columna vacía + selección -->
        <table class="cases-table" id="tabla-historial">
            <thead>
            <tr>
                <!-- 1) Columna vacía para alinear -->
                <th></th>
                <!-- 2) Columna de "Seleccionar todos" -->
                <th style="width: 40px; text-align: center;">
                    <input type="checkbox" id="check-all-historial">
                </th>
                <!-- 3,4,5,6) Columnas de datos -->
                <th>Folio</th>
                <th>Fecha Registro</th>
                <th>Descripción</th>
                <th>Estatus</th>
            </tr>
            </thead>
            <tbody>
            <?php
            $rs = $con->prepare("
            SELECT 
              c.FolioCaso AS folio,
              DATE_FORMAT(c.FechaRegistro, '%Y-%m-%d') AS fecha,
              e.NombreEstatus AS estatus,
              c.Descripcion AS descripcion
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
                    <!-- 1) Celda vacía -->
                    <td></td>
                    <!-- 2) Checkbox individual -->
                    <td style="text-align: center;">
                        <input
                                type="checkbox"
                                class="check-folio"
                                value="<?= htmlspecialchars($row['folio']) ?>"
                        >
                    </td>
                    <!-- 3,4,5,6) Datos originales -->
                    <td><?= htmlspecialchars($row['folio']) ?></td>
                    <td><?= htmlspecialchars($row['fecha']) ?></td>
                    <td>
                        <button class="show-desc" data-folio="<?= htmlspecialchars($row['folio']) ?>">
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

<!-- HTML COMPLETO -->
<!-- MODAL DE DESCRIPCIÓN -->
<div id="modal-descripcion" class="modal-overlay">
    <div class="modal-dialog">
        <header class="modal-header">
            <div class="header-title-with-logo">
                <img src="imagenes/Recurso 6 (2).png" alt="Logo" class="header-logo">
                <h2>Datos del Caso</h2>
            </div>
            <button id="modal-cerrar" class="modal-close">&times;</button>
        </header>
        <div class="modal-body">
            <!-- Datos generales -->
            <div class="info-grid">
                <div class="info-cell"><label>Folio</label><span id="r-folio"></span></div>
                <div class="info-cell"><label>Fecha</label><span id="r-fecha"></span></div>
                <div class="info-cell"><label>No. Parte</label><span id="r-parte"></span></div>
                <div class="info-cell"><label>Cantidad</label><span id="r-cantidad"></span></div>
                <div class="info-cell"><label>Terciaria</label><span id="r-terciaria"></span></div>
                <div class="info-cell"><label>Proveedor</label><span id="r-proveedor"></span></div>
                <div class="info-cell"><label>Commodity</label><span id="r-commodity"></span></div>
                <div class="info-cell full-width"><label>Descripción</label><p class="desc-text" id="r-descripcion"></p></div>
            </div>

            <!-- Defectos -->
            <div class="info-cell full-width">
                <label>Defectos a Inspeccionar</label>
                <div id="r-defectos-container" class="defects-container"></div>
            </div>
        </div>
    </div>
</div>

<!-- Modal para vista previa del PDF -->
<div id="modal-pdf" class="modal" style="display: none;">
    <div class="modal-content">
        <span class="close-modal" id="cerrarModalPDF">❌</span>
        <embed id="visor-pdf" type="application/pdf" width="100%" height="600px"/>
    </div>
</div>

<!-- LIGHTBOX PARA IMÁGENES -->
<div id="modal-image" class="modal-overlay">
    <button class="modal-close close-img">&times;</button>
    <img src="" alt="Vista ampliada">
</div>
<!-- Lightbox para ampliar imagen -->
<div id="avatarLightbox" class="avatar-lightbox">
    <span class="close-avatar">&times;</span>
    <img id="avatarZoom" src="" alt="Avatar ampliado">
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
