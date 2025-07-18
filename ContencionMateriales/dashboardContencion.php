<?php
/**
===============================================================================
@file       dashboardContencion.php
@project    Programa de Contención de Materiales
@module     Interfaz principal del usuario autenticado
@purpose    Mostrar y gestionar las diferentes secciones funcionales del sistema
@description
Esta página representa la interfaz principal del sistema de Contención de Materiales
después del inicio de sesión exitoso. El usuario puede acceder a los formularios,
historial de casos, método de trabajo, subir evidencia, y otras funcionalidades
integradas mediante un sidebar de navegación interactiva.

➤ Requiere autenticación previa y se asocia a una sesión iniciada.
➤ Precarga catálogos como Tercería, Proveedor, Commodity y Defectos.
➤ Recupera el ID del usuario autenticado desde la base de datos.
➤ Se apoya en múltiples archivos externos (CSS y JS), incluyendo:

➤ CSS:
- dashboardContencion.css
- agregarComponentes.css
- modalMostrarDescripcion.css
- modalFotos.css
- perfilUsuario.css
- tablaCasos.css
- modalEnviarCorreos.css
- modalPDF.css

➤ JS:
- navegacionDashboard.js (gestión de navegación entre secciones)
- perfilUsuario.js (cambio nombre, imagen y perfil)
- cerrarSesionContencion.js
- cambioIdioma.js
- modalFotos.js (gestión de fotos OK/NO OK)
- agregarComponentesFormulario.js (agrega dinámicamente campos)
- tablaMisCasos.js (paginación y carga dinámica de casos)
- validacionesCasos.js (validación de campos y formularios)
- notificacionesCasos.js (alertas en tiempo real)
- modalMostrarDescripcion.js (detalle emergente del caso)
- seleccionadorCasos.js (selector múltiple para acciones)
- modalEnviarCorreos.js (envío de correos con folios)
- metodoTrabajoPDF.js (subida y vista de PDF de método de trabajo)

@author     Ivan Medina/Hadbet Altamirano
@created    Mayo 2025
@updated    [¿?]
===============================================================================
 */

// Mostrar errores en desarrollo
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();

// Validar que se recibió tab_id y que la sesión está correctamente iniciada
if (!isset($_GET['tab_id'])) {
    session_destroy();
    echo "<META HTTP-EQUIV='REFRESH' CONTENT='1; URL=login.php'>";
    exit;
}
$tab_id = $_GET['tab_id'];

// Verifica que exista un usuario autenticado en esa pestaña
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
$rol      = $usuarioActual['Rol'] ?? 1;
$username = htmlspecialchars($usuarioActual['Username']);
$nombre   = htmlspecialchars($usuarioActual['Nombre']);

// Incluir conector a base de datos
$path = __DIR__ . '/dao/conexionContencion.php';
if (!file_exists($path)) {
    die("¡Error! No encontré el conector en: $path");
}
include_once $path;

$con = (new LocalConector())->conectar();

// Precarga de catálogos para usarse en formularios
$terciarias  = $con->query("SELECT IdTerceria, NombreTerceria FROM Terceria ORDER BY NombreTerceria");
$proveedores = $con->query("SELECT IdProveedor, NombreProveedor FROM Proveedores ORDER BY NombreProveedor");
$commodities = $con->query("SELECT IdCommodity, NombreCommodity FROM Commodity ORDER BY NombreCommodity");
$defectos    = $con->query("SELECT IdDefectos, NombreDefectos FROM Defectos ORDER BY NombreDefectos");

// Buscar el ID del usuario autenticado desde su nombre de usuario
$stmtUser = $con->prepare("
    SELECT IdUsuario
    FROM Usuario
    WHERE Username = ?
");
if (!$stmtUser) {
    die("Error preparando SELECT IdUsuario: " . $con->error);
}
$stmtUser->bind_param("s", $username);
$stmtUser->execute();
$stmtUser->bind_result($idUsuario);
if (!$stmtUser->fetch()) {
    die("El usuario “{$username}” no existe en la BD.");
}
$stmtUser->close();
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <!-- Estilos del sistema -->
    <link rel="stylesheet" href="css/dashboardContencion.css" />
    <link rel="stylesheet" href="css/agregarComponentes.css">
    <link rel="stylesheet" href="css/modalMostrarDescripcion.css">
    <link rel="stylesheet" href="css/modalFotos.css"/>
    <link rel="stylesheet" href="css/perfilUsuario.css" />
    <link rel="stylesheet" href="css/tablaCasos.css" />
    <link rel="stylesheet" href="css/modalEnviarCorreos.css">
    <link rel="stylesheet" href="css/modalPDF.css">

    <!-- Íconos -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

    <!-- Librerías externas -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11" defer></script>

    <!-- Navegación -->
    <script src="js/navegacionDashboard.js" defer></script>

    <!-- Perfil / Cerrar sesión / Idioma -->
    <script src="js/perfilUsuario.js" defer></script>
    <script src="js/cerrarSesionContencion.js" defer></script>
    <script src="js/cambioIdioma.js" defer></script>

    <!-- Modal fotos / Agregar inputs -->
    <script src="js/modalFotos.js" defer></script>
    <script src="js/agregarComponentesFormulario.js" defer></script>

    <!-- Paginación / Validaciones -->
    <script src="js/tablaMisCasos.js" defer></script>
    <script src="js/validacionesCasos.js" defer></script>

    <!-- Notificaciones / Descripción / Selección / Correos / PDF -->
    <script src="js/notificacionesCasos.js" defer></script>
    <script src="js/modalMostrarDescripcion.js" defer></script>
    <script src="js/seleccionadorCasos.js" defer></script>
    <script src="js/modalEnviarCorreos.js" defer></script>
    <script src="js/metodoTrabajoPDF.js" defer></script>
</head>
<body
        data-tab-id="<?php echo htmlspecialchars($tab_id); ?>"
        data-username="<?php echo htmlspecialchars($username); ?>">

<!--
===============================================================================
@section    Sidebar del sistema
@purpose    Panel lateral de navegación e información del usuario
@description
Este sidebar representa el panel lateral de navegación del dashboard.
Incluye:
➤ Información del usuario autenticado (nombre, avatar y nombre de usuario).
➤ Selector de avatar personalizado con opción de carga de imagen local.
➤ Botones de navegación para cambiar entre secciones del sistema.
➤ Contadores dinámicos (badges) que se actualizan con notificaciones en tiempo real.
➤ Opciones específicas visibles únicamente para usuarios con rol de administrador (`Rol == 2`).
===============================================================================
-->

<div class="sidebar">

    <!-- Panel del usuario (Avatar, nombre y opciones) -->
    <div class="user-dropdown" id="userDropdownToggle">
        <img src="imagenes/avatar_default.png" alt="Avatar" class="avatar-icon" id="currentAvatarMini">
        <span id="usernameLabel"><?php echo $nombre; ?></span>
        <i class="fa-solid fa-caret-down"></i>

        <!-- Panel desplegable con información del usuario -->
        <div class="user-dropdown-panel" id="userDropdownPanel">
            <div class="user-info">
                <img src="imagenes/avatar_default.png" alt="Avatar" class="avatar-large" id="currentAvatarLarge">
                <div class="user-text">
                    <strong><?php echo $nombre; ?></strong>
                    <p class="username">@<?php echo $username; ?></p>
                </div>
            </div>

            <hr style="margin: 10px 0; border-color: #333;">

            <!-- Selector de avatar -->
            <div>
                <p style="margin-bottom: 8px;">Selecciona tu avatar:</p>
                <div id="avatarSelector" class="avatar-selector">
                    <img src="imagenes/avatar_grammer_latino_1.png" class="avatar-option">
                    <img src="imagenes/avatar_grammer_latino_2.png" class="avatar-option">
                    <img src="imagenes/avatar_grammer_latino_3.png" class="avatar-option">
                    <img src="imagenes/avatar_grammer_latino_4.png" class="avatar-option">

                    <!-- Subida de avatar personalizado -->
                    <label for="customAvatarInput" class="avatar-option custom-avatar-label">
                        <span>📷</span>
                        <p style="font-size: 0.7rem;">Tu foto</p>
                        <input type="file" id="customAvatarInput" accept="image/*" style="display: none;">
                    </label>
                </div>
            </div>
        </div>
    </div>

    <!-- Botón para levantar un nuevo caso -->
    <button class="sidebar-btn" data-section="formulario">
        <i class="fa-solid fa-plus"></i>
        Levantar nuevo caso
    </button>

    <!-- Botón para ver los casos del usuario -->
    <button class="sidebar-btn" data-section="historial" id="btn-mis-casos">
        <i class="fa-solid fa-folder-open"></i>
        Mis casos
        <span class="badge-count" style="display:none"></span>
    </button>

    <!-- Opciones inferiores visibles solo para el rol de administrador -->
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

        <!-- Botón para cerrar sesión -->
        <button class="sidebar-btn" id="btn-cerrar-sesion">
            <i class="fa-solid fa-right-from-bracket"></i>
            Cerrar Sesión
        </button>
    </div>
</div>


<main class="main-content">
    <!--
    ===============================================================================
    @section    main-content → Formulario de captura de casos
    @purpose    Sección principal para el registro de nuevos casos de contención
    @description
    Esta sección permite al usuario registrar un nuevo caso dentro del sistema.
    El formulario incluye campos clave como responsable, número de parte,
    cantidad, descripción, proveedor, terciaria, commodity y defectos encontrados.

    ➤ El formulario se envía vía POST al script guardarCaso.php.
    ➤ Utiliza inputs y selects con tooltips explicativos y validaciones mínimas.
    ➤ Permite cargar un método de trabajo en PDF opcional.
    ➤ Se pueden agregar múltiples defectos dinámicamente mediante JavaScript.
    ➤ Incluye un panel lateral (aside) para agregar nuevos elementos a catálogos.
    ➤ Compatible con navegación por pestañas gracias a `tab_id`.

    @uses       DAO: guardarCaso.php
    @uses       JS: agregarComponentesFormulario.js, modalFotos.js, etc.
    @uses       CSS: dashboardContencion.css
    ===============================================================================
    -->

    <!-- Botón de cambio de idioma -->
    <button id="btn-language-toggle" class="language-toggle">ES/EN</button>

    <!-- ========================= FORMULARIO PRINCIPAL ========================= -->
    <section id="formulario" class="main-section">
        <h1><strong>DATOS</strong></h1>

        <div class="form-panel">

            <!-- Contenedor principal del formulario -->
            <div class="form-main" id="form-main">
                <form class="data-form"
                      method="post"
                      action="https://grammermx.com/IvanTest/ContencionMateriales/dao/guardarCaso.php?tab_id=<?php echo urlencode($tab_id) ?>"
                      enctype="multipart/form-data"
                      novalidate>

                    <!-- Campo: Responsable -->
                    <div class="form-group">
                        <label for="responsable" title="Agrega el Nombre de un Responsable">Responsable</label>
                        <input type="text" name="Responsable" id="responsable" placeholder="Nombre del responsable" />
                    </div>

                    <!-- Campos: No. Parte + Cantidad -->
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

                    <!-- Campo: Descripción -->
                    <div class="form-group">
                        <label for="descripcion" title="Agrega la Descripción del Material">Descripción</label>
                        <textarea name="Descripcion" id="descripcion" placeholder="Descripción del caso"></textarea>
                    </div>

                    <!-- Campos: Terciaria + Proveedor -->
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

                    <!-- Campo: Commodity -->
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

                    <!-- Carga de PDF (opcional) + Agregar defecto -->
                    <div class="form-group buttons-inline">
                        <div class="toggle-block">
                            <!-- Checkbox para mostrar botón de PDF -->
                            <label class="toggle-label">
                                <input type="checkbox" id="toggle-metodo-trabajo">
                                Agregar método de trabajo
                            </label>

                            <!-- Botón que aparece si se activa el checkbox -->
                            <button type="button"
                                    id="btn-cargar-pdf"
                                    class="form-button"
                                    title="Modificar método de trabajo"
                                    style="display: none;
                                           padding: 6px;
                                           font-size: 1.1rem;
                                           width: 34px;">
                                <i class="fa fa-pencil-alt" aria-hidden="true"></i>
                            </button>

                            <!-- Muestra el nombre del archivo PDF -->
                            <span id="pdf-file-name"
                                  style="display: none;
                                         color: #2ea043;
                                         max-width: 200px;
                                         overflow: hidden;
                                         text-overflow: ellipsis;"
                                  title=""></span>
                        </div>

                        <!-- Botón para agregar defecto -->
                        <button type="button" id="btn-agregar-defecto" class="form-button">
                            + Agregar defecto
                        </button>
                    </div>

                    <!-- Contenedor dinámico de bloques de defectos -->
                    <div id="bloques-defectos" class="bloques-defectos-container">
                        <!-- Se llenará dinámicamente con bloques de defectos -->
                    </div>

                    <!-- Input oculto para archivo PDF -->
                    <input type="file" id="archivoPDF" name="archivoPDF" accept="application/pdf" style="display: none;">

                    <!-- Botón de Confirmar envío -->
                    <div class="form-group confirm">
                        <button type="submit" class="confirm-button">Confirmar</button>
                    </div>

                </form> <!-- ✅ Fin del formulario -->

            </div> <!-- ✅ Fin de .form-main -->

            <!-- ===================================== ASIDE ===================================== -->
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
            </aside> <!-- ✅ Fin del aside -->

        </div> <!-- ✅ Fin del form-panel -->

    </section> <!-- ✅ Fin de sección formulario -->




    <!--
    ===============================================================================
    @section    historial → Sección de "Mis Casos"
    @purpose    Mostrar los casos registrados por el usuario autenticado
    @description
    Esta sección permite al usuario visualizar un historial de los casos que ha creado.
    Incluye funciones de búsqueda, filtrado por columna, selección múltiple y envío por correo.

    ➤ La tabla se llena con datos obtenidos dinámicamente desde la base de datos.
    ➤ Los filtros aplican por folio o fecha de registro.
    ➤ Cada fila incluye una opción para mostrar la descripción completa mediante modal.
    ➤ Se incluye paginación básica controlada por JavaScript.

    @uses       PHP: Consulta con filtro por IdUsuario
    @uses       JS: tablaMisCasos.js, modalMostrarDescripcion.js, modalEnviarCorreos.js
    @uses       CSS: tablaCasos.css
    ===============================================================================
    -->

    <!-- ✅ Sección 2: MIS CASOS -->
    <section id="historial" class="main-section" style="display: none;">
        <h1><strong>Mis Casos</strong></h1>

        <!-- 🔎 Controles de búsqueda y envío por correo -->
        <div class="table-controls">
            <div class="filter-container">
                <label for="historial-filter-column">Filtrar por:</label>

                <!-- Selector de columna a filtrar -->
                <select id="historial-filter-column">
                    <option value="folio">Folio</option>
                    <option value="fecha">Fecha Registro</option>
                </select>

                <!-- Input para buscar -->
                <input type="text" id="historial-filter-input" placeholder="Buscar…">

                <!-- Botón para ejecutar búsqueda -->
                <button id="historial-filter-button">🔍 Buscar</button>

                <!-- Botón para activar modo selección y enviar por correo -->
                <button id="btn-toggle-seleccion" class="enviar-btn" style="margin-left: 12px;">
                    📤 Enviar por correo
                </button>
            </div>
        </div>

        <!-- 📋 Tabla de historial de casos -->
        <table class="cases-table" id="tabla-historial">
            <thead>
            <tr>
                <!-- Columna 1: vacía (para diseño) -->
                <th></th>
                <!-- Columna 2: checkbox "seleccionar todos" -->
                <th style="width: 40px; text-align: center;">
                    <input type="checkbox" id="check-all-historial">
                </th>
                <!-- Columnas 3 a 6: datos -->
                <th>Folio</th>
                <th>Fecha Registro</th>
                <th>Descripción</th>
                <th>Estatus</th>
            </tr>
            </thead>

            <tbody>
            <?php
            // ======================= Consulta de casos del usuario =======================
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

            // ======================= Renderizado de filas =======================
            while ($row = $result->fetch_assoc()):
                ?>
                <tr>
                    <!-- Celda vacía -->
                    <td></td>

                    <!-- Checkbox individual -->
                    <td style="text-align: center;">
                        <input type="checkbox" class="check-folio" value="<?= htmlspecialchars($row['folio']) ?>">
                    </td>

                    <!-- Datos de folio -->
                    <td><?= htmlspecialchars($row['folio']) ?></td>

                    <!-- Fecha -->
                    <td><?= htmlspecialchars($row['fecha']) ?></td>

                    <!-- Botón para mostrar la descripción -->
                    <td>
                        <button class="show-desc" data-folio="<?= htmlspecialchars($row['folio']) ?>">
                            Mostrar descripción
                        </button>
                    </td>

                    <!-- Estatus del caso -->
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


    <!--
    ===============================================================================
    @section    historial-casos → Sección de "Historial de Casos"
    @purpose    Mostrar todos los casos registrados en el sistema para el administrador
    @description
    Esta sección permite visualizar un listado completo de casos, con columnas adicionales
    como responsable y nombre de la terciaria. Es útil para roles administrativos o de revisión.

    ➤ Permite búsqueda y filtrado por folio o fecha.
    ➤ Integra botones de paginación.
    ➤ Las descripciones pueden mostrarse dinámicamente con botones tipo modal.

    @uses       PHP: Consulta sin filtro de usuario, obtiene datos generales del caso
    @uses       JS: tablaTodosCasos.js (opcional si desea paginar dinámicamente)
    @uses       CSS: tablaCasos.css
    ===============================================================================
    -->

    <!-- ✅ Sección 3: HISTORIAL GENERAL DE CASOS -->
    <section id="historial-casos" class="main-section" style="display: none;">
        <h1><strong>Historial de Casos</strong></h1>

        <!-- 🔎 Filtro superior por columna -->
        <div class="table-controls">
            <div class="filter-container">
                <label for="todos-filter-column">Filtrar por:</label>

                <!-- Selector de columna -->
                <select id="todos-filter-column">
                    <option value="folio">Folio</option>
                    <option value="fecha">Fecha Registro</option>
                </select>

                <!-- Input para escribir búsqueda -->
                <input type="text" id="todos-filter-input" placeholder="Buscar...">

                <!-- Botón para ejecutar búsqueda -->
                <button id="todos-filter-button">🔍 Buscar</button>
            </div>
        </div>

        <!-- 📋 Tabla con todos los casos registrados -->
        <table class="cases-table" id="tabla-todos-casos">
            <thead>
            <tr>
                <!-- Columnas visiblemente importantes -->
                <th>Folio</th>
                <th>Fecha Registro</th>
                <th>Responsable</th>   <!-- Nuevo campo agregado -->
                <th>Terciaria</th>     <!-- Nueva columna -->
                <th>Descripción</th>   <!-- Botón con acceso dinámico -->
                <th>Estatus</th>       <!-- Estado actual del caso -->
            </tr>
            </thead>

            <tbody>
            <?php
            // ======================= Consulta general sin filtro por usuario =======================
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

            // ======================= Iterar filas =======================
            while ($row = $result->fetch_assoc()):
                ?>
                <tr>
                    <td><?= htmlspecialchars($row['folio']) ?></td>
                    <td><?= htmlspecialchars($row['fecha']) ?></td>
                    <td><?= htmlspecialchars($row['responsable']) ?></td>
                    <td><?= htmlspecialchars($row['terciaria']) ?></td>
                    <td>
                        <button class="show-desc" data-folio="<?= htmlspecialchars($row['folio']) ?>">
                            Mostrar descripción
                        </button>
                    </td>
                    <td><?= htmlspecialchars($row['estatus']) ?></td>
                </tr>
            <?php endwhile;
            $todos->close();
            ?>
            </tbody>
        </table>

        <!-- 📑 Paginación -->
        <div class="pagination" id="todos-pagination">
            <button id="todos-prev" disabled>⬅ Anterior</button>
            <span id="todos-page-indicator">Página 1 de X</span>
            <button id="todos-next">Siguiente ➡</button>
        </div>
    </section>

</main> <!-- ✅ Cierre correcto del contenido principal -->

<!--
===============================================================================
@component   Modal de Descripción de Caso
@id          modal-descripcion
@purpose     Mostrar los datos completos de un caso de forma detallada en un modal
@description
Este modal se despliega cuando el usuario pulsa "Mostrar descripción" desde
la tabla de casos. Su contenido se rellena dinámicamente mediante JavaScript
para mostrar la información completa del caso, incluyendo:

➤ Folio, fecha, número de parte y cantidad.
➤ Tercera parte, proveedor y commodity.
➤ Descripción extendida y método de trabajo en PDF.
➤ Listado de defectos a inspeccionar con fotos tipo OK/NO OK (cargadas por JS).

@interaction
➤ El botón `#modal-cerrar` permite cerrar el modal.
➤ El contenedor `#r-defectos-container` se rellena dinámicamente.
➤ El método de trabajo se muestra como PDF embebido o enlace.

@uses       JS externo: `modalDescripcion.js` (obligatorio)
@styles     verCaso.css (opcional para estilo visual detallado)
===============================================================================
-->

<!-- ✅ CONTENEDOR PRINCIPAL DEL MODAL -->
<div id="modal-descripcion" class="modal-overlay">

    <!-- ✅ CONTENIDO DEL MODAL -->
    <div class="modal-dialog">

        <!-- 🧾 ENCABEZADO DEL MODAL -->
        <header class="modal-header">
            <div class="header-title-with-logo">
                <!-- Logo del sistema -->
                <img src="imagenes/Recurso 6 (2).png" alt="Logo" class="header-logo">
                <h2>Datos del Caso</h2>
            </div>

            <!-- Botón para cerrar modal -->
            <button id="modal-cerrar" class="modal-close">&times;</button>
        </header>

        <!-- 📄 CUERPO DEL MODAL -->
        <div class="modal-body">

            <!-- ✅ DATOS GENERALES DEL CASO -->
            <div class="info-grid">
                <!-- Fila 1 -->
                <div class="info-cell"><label>Folio</label><span id="r-folio"></span></div>
                <div class="info-cell"><label>Fecha</label><span id="r-fecha"></span></div>
                <div class="info-cell"><label>No. Parte</label><span id="r-parte"></span></div>
                <div class="info-cell"><label>Cantidad</label><span id="r-cantidad"></span></div>

                <!-- Fila 2 -->
                <div class="info-cell"><label>Terciaria</label><span id="r-terciaria"></span></div>
                <div class="info-cell"><label>Proveedor</label><span id="r-proveedor"></span></div>
                <div class="info-cell"><label>Commodity</label><span id="r-commodity"></span></div>

                <!-- Fila 3: Descripción larga -->
                <div class="info-cell full-width">
                    <label>Descripción</label>
                    <p class="desc-text" id="r-descripcion"></p>
                </div>

                <!-- Fila 4: PDF del método de trabajo -->
                <div class="info-cell full-width">
                    <label>Método de Trabajo</label>
                    <div id="r-metodo-trabajo-container" class="pdf-container">
                        <!-- Aquí se inyecta el PDF o el enlace desde JS -->
                        <div class="desc-text" id="r-metodo-trabajo">(Cargando...)</div>
                    </div>
                </div>
            </div>

            <!-- ✅ DEFECTOS A INSPECCIONAR (con fotos y comentarios) -->
            <div class="info-cell full-width">
                <label>Defectos a Inspeccionar</label>

                <!-- Se rellena dinámicamente con bloques visuales de defectos -->
                <div id="r-defectos-container" class="defects-container"></div>
            </div>

        </div> <!-- ✅ Fin de modal-body -->
    </div> <!-- ✅ Fin de modal-dialog -->
</div> <!-- ✅ Fin de modal-overlay -->

<!--
===============================================================================
@component   Modal de Subida de PDF (modal-pdf)
@id          modal-pdf
@purpose     Permitir la carga y vista previa de un archivo PDF asociado al caso
@description
Este modal aparece cuando el usuario activa la opción de subir un "Método de Trabajo"
en el formulario principal. Permite seleccionar un archivo PDF y visualizarlo
previamente mediante un `<embed>` antes de confirmar su inclusión.

@interaction
➤ Botón #confirmar-pdf guarda el archivo y lo asocia al input oculto.
➤ El visor #visor-pdf muestra una vista previa del archivo PDF cargado.
➤ El botón #cerrarModalPDF cierra el modal sin guardar.

@scripts     Usa el script `modalMetodoTrabajo.js` para controlar su comportamiento
===============================================================================
-->
<div id="modal-pdf" class="pdf-modal">
    <div class="pdf-modal-content">

        <!-- ❌ Botón cerrar -->
        <button class="pdf-close" id="cerrarModalPDF">
            <i class="fa fa-times"></i>
        </button>

        <!-- 📝 Título -->
        <h3>Subir archivo PDF del caso</h3>

        <!-- 📂 Input de selección de PDF -->
        <input type="file" id="input-pdf-modal" accept="application/pdf">

        <hr>

        <!-- 👁️ Vista previa del PDF -->
        <div class="pdf-preview-container">
            <embed id="visor-pdf" type="application/pdf" />
        </div>

        <!-- ✅ Confirmación -->
        <div style="text-align: right; margin-top: 16px;">
            <button id="confirmar-pdf" class="form-button">Guardar PDF</button>
        </div>
    </div>
</div>

<!--
===============================================================================
@component   Lightbox de Imágenes (modal-image)
@id          modal-image
@purpose     Ampliar una imagen tipo OK/NO OK en pantalla completa
@description
Este modal de tipo "lightbox" se activa al hacer clic en una imagen de defecto
dentro del modal de descripción. Muestra la imagen ampliada centrada en pantalla.

@interaction
➤ La imagen se carga dinámicamente en el `src` del <img>.
➤ El botón .close-img (×) permite cerrar el visor.

@scripts     Usa `modalDescripcion.js` para su activación.
===============================================================================
-->
<div id="modal-image" class="modal-overlay">
    <!-- ❌ Botón cerrar -->
    <button class="modal-close close-img">&times;</button>
    <!-- 🖼️ Imagen ampliada -->
    <img src="" alt="Vista ampliada">
</div>
<!-- Visor ampliado del avatar (lightbox) -->
<div id="avatarLightbox" class="modal-overlay" style="display: none;">
    <span class="close-avatar">❌</span>
    <img id="avatarZoom" alt="Avatar ampliado" />
</div>

<!--
===============================================================================
@script      Carga Dinámica del Catálogo de Defectos
@context     JavaScript embebido en el HTML
@purpose     Permitir que el cliente (JavaScript) acceda al catálogo de defectos
@description
Este script convierte la consulta SQL del catálogo de defectos (`Defectos`) en un
arreglo de objetos JavaScript (`window.defectosCatalogo`). Este arreglo es usado
posteriormente por el frontend para rellenar listas desplegables o selectores
dinámicos en los bloques de defectos del formulario.

@estructura
Ejemplo de estructura resultante:
window.defectosCatalogo = [
    { id: 1, name: "Desalineado" },
    { id: 2, name: "Oxidado" },
    ...
];

@nota
✔️ Usa `json_encode()` para escapar correctamente nombres con acentos o caracteres especiales.
✔️ Usa `window.defectosCatalogo` para que esté disponible globalmente en cualquier script.

@uso
Utilizado por: los scripts JavaScript del dashboard (por ejemplo: el botón
"Agregar defecto") para rellenar dinámicamente los selectores de defectos
dentro del formulario del caso.

@autor
Este bloque fue generado dinámicamente por PHP desde la tabla `Defectos`.

===============================================================================
-->
<script>
    window.defectosCatalogo = [
        <?php
        $res = $con->query("SELECT IdDefectos, NombreDefectos FROM Defectos ORDER BY NombreDefectos");
        $items = [];
        while ($d = $res->fetch_assoc()) {
            $id   = (int)$d['IdDefectos'];
            $name = json_encode($d['NombreDefectos']); // Escapado seguro
            $items[] = "{ id: $id, name: $name }";
        }
        echo implode(",", $items);
        ?>
    ];
</script>
</body>
</html>
