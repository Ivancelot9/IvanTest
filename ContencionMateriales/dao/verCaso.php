<?php
/**
 * @file        verCaso.php
 * @project     Programa de Contención de Materiales
 * @module      Visualización de Casos
 * @purpose     Mostrar los datos detallados de un caso registrado en el sistema.
 * @description Este archivo PHP obtiene y renderiza la información de un caso según su folio. Muestra los datos generales,
 *              los defectos registrados con sus fotos correspondientes, y el método de trabajo si ha sido subido. Permite
 *              también subir el PDF del método si no existe. Incluye un visor de imágenes tipo lightbox y conexión a la
 *              base de datos usando `LocalConector`. Se apoya en el JS externo `subirMetodoTrabajoExterno.js` y el CSS
 *              `verCaso.css`.
 *
 *              Dependencias:
 *              - conexionContencion.php (DAO para conexión a BD)
 *              - verCaso.css (hoja de estilos)
 *              - subirMetodoTrabajoExterno.js (JS para subir PDF del método)
 *              - SweetAlert2 (CDN)
 *              - Base de datos MySQL con tablas: Casos, Terceria, Proveedores, Commodity, Estatus, DefectosCaso, Defectos,
 *                Fotos, MetodoTrabajo.
 *
 * @author      Ivan Medina/Hadbet Altamirano
 * @created     Julio 2025
 * @updated     [¿?]
 */

// Mostrar errores (modo desarrollo)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


// Conexión a base de datos
include_once 'conexionContencion.php';

// Ruta base para mostrar los PDFs en el navegador
$pdfWebBase = 'https://grammermx.com/IvanTest/ContencionMateriales/dao/uploads/pdf';

// Obtener folio desde la URL
$folio = isset($_GET['folio'])
    ? intval($_GET['folio'])
    : (isset($_GET['Caso']) ? intval($_GET['Caso']) : 0);


// Validación de folio
if ($folio <= 0) {
    echo "<h2>Folio inválido.</h2>";
    exit;
}
// Conexión
$con = (new LocalConector())->conectar();

// Obtener datos generales del caso
$stmt = $con->prepare("
    SELECT 
      NumeroParte, Cantidad, Descripcion,
      IdTerceria, IdProveedor, IdCommodity, IdEstatus,
      Responsable,
      DATE_FORMAT(FechaRegistro, '%Y-%m-%d') AS FechaRegistro
    FROM Casos
    WHERE FolioCaso = ?
");
$stmt->bind_param('i', $folio);
$stmt->execute();
$stmt->bind_result(
    $numeroParte,
    $cantidad,
    $descripcion,
    $idTerceria,
    $idProveedor,
    $idCommodity,
    $idEstatus,
    $responsable,
    $fecha
);
if (!$stmt->fetch()) {
    echo "<h2>⚠️ Caso no encontrado.</h2>";
    exit;
}
$stmt->close();
// Función para obtener nombre de entidades externas (lookup)
function lookup($con, $table, $idfield, $namefield, $id) {
    $n = '';
    $s = $con->prepare("SELECT `$namefield` FROM `$table` WHERE `$idfield` = ?");
    $s->bind_param('i', $id);
    $s->execute();
    $s->bind_result($n);
    $s->fetch();
    $s->close();
    return $n;
}
// Obtener nombres de terceria, proveedor, commodity y estatus
$terciaria = lookup($con, 'Terceria',    'IdTerceria',  'NombreTerceria',  $idTerceria);
$proveedor = lookup($con, 'Proveedores', 'IdProveedor', 'NombreProveedor', $idProveedor);
$commodity = lookup($con, 'Commodity',   'IdCommodity', 'NombreCommodity', $idCommodity);
$estatus   = lookup($con, 'Estatus',     'IdEstatus',   'NombreEstatus',   $idEstatus);

// Obtener defectos y fotos asociadas
$map = [];
$stmt2 = $con->prepare("
    SELECT dc.IdDefectoCaso, d.NombreDefectos, f.TipoFoto, f.Ruta
    FROM DefectosCaso dc
    JOIN Defectos d ON d.IdDefectos = dc.IdDefectos
    LEFT JOIN Fotos f ON f.IdDefectoCaso = dc.IdDefectoCaso
    WHERE dc.FolioCaso = ?
    ORDER BY dc.IdDefectoCaso, FIELD(f.TipoFoto,'ok','no')
");
$stmt2->bind_param('i', $folio);
$stmt2->execute();
$res2 = $stmt2->get_result();
while ($row = $res2->fetch_assoc()) {
    $idDef = $row['IdDefectoCaso'];
    if (!isset($map[$idDef])) {
        $map[$idDef] = [
            'nombre'  => $row['NombreDefectos'],
            'fotosOk' => [],
            'fotosNo' => []
        ];
    }
    if (!empty($row['Ruta'])) {
        $key = ($row['TipoFoto'] === 'ok') ? 'fotosOk' : 'fotosNo';
        $map[$idDef][$key][] = $row['Ruta'];
    }
}
$stmt2->close();
$defectos = array_values($map);

// PDF Método de Trabajo
$stmt3 = $con->prepare("
    SELECT RutaArchivo
    FROM MetodoTrabajo
    WHERE FolioCaso = ?
");
// ==============================
// VERIFICACIÓN DEL PDF DEL MÉTODO DE TRABAJO
// ==============================
$stmt3->bind_param('i', $folio);
$stmt3->execute();
$stmt3->bind_result($rutaPDF);
$tienePDF = $stmt3->fetch();
$stmt3->close();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Caso <?= htmlspecialchars($folio) ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../css/verCaso.css">
</head>
<body>
<div class="ver-caso-page">
    <div class="modal-dialog">
        <div class="modal-header">
            <div class="header-title-with-logo">
                <img src="https://grammermx.com/IvanTest/ContencionMateriales/imagenes/Grammer_Logo_Original_White_sRGB_screen_transparent.png"
                     class="header-logo" alt="Logo">
                <h2>Caso <?= htmlspecialchars($folio) ?></h2>
            </div>
        </div>
        <div class="modal-body">
            <!-- Datos generales -->
            <div class="info-grid">
                <div class="info-cell"><label>Fecha</label><span><?= $fecha ?></span></div>
                <div class="info-cell"><label>No. Parte</label><span><?= $numeroParte ?></span></div>
                <div class="info-cell"><label>Cantidad</label><span><?= $cantidad ?></span></div>
                <div class="info-cell"><label>Responsable</label><span><?= $responsable ?></span></div>
                <div class="info-cell"><label>Terciaria</label><span><?= $terciaria ?></span></div>
                <div class="info-cell"><label>Proveedor</label><span><?= $proveedor ?></span></div>
                <div class="info-cell"><label>Commodity</label><span><?= $commodity ?></span></div>
                <div class="info-cell full-width">
                    <label>Descripción</label>
                    <div class="desc-text"><?= nl2br(htmlspecialchars($descripcion ?: '(Sin descripción)')) ?></div>
                </div>
            </div>

            <!-- Defectos -->
            <div class="info-grid">
                <div class="info-cell full-width"><label>Defectos a Inspeccionar</label></div>
            </div>
            <div class="defects-container">
                <?php foreach ($defectos as $def): ?>
                    <div class="defect-block">
                        <h3 class="defect-title"><?= htmlspecialchars($def['nombre']) ?></h3>
                        <div class="photos-row">
                            <div class="photos-group ok">
                                <div class="group-title">OK</div>
                                <div class="thumbs">
                                    <?php foreach ($def['fotosOk'] as $f): ?>
                                        <img src="../dao/uploads/ok/<?= rawurlencode($f) ?>" alt="OK">
                                    <?php endforeach; ?>
                                </div>
                            </div>
                            <div class="photos-group no">
                                <div class="group-title">NO OK</div>
                                <div class="thumbs">
                                    <?php foreach ($def['fotosNo'] as $f): ?>
                                        <img src="../dao/uploads/no/<?= rawurlencode($f) ?>" alt="NO OK">
                                    <?php endforeach; ?>
                                </div>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>

            <!-- Método de Trabajoo -->
            <div class="info-grid" style="margin-top:30px;">
                <div class="info-cell full-width">
                    <label>Método de Trabajo</label>

                    <?php if ($tienePDF && !empty($rutaPDF)): ?>
                        <div id="preview-metodo-trabajo">
                            <iframe
                                    src="<?= $pdfWebBase . '/' . rawurlencode($rutaPDF) ?>"
                                    width="100%" height="500px"
                                    style="border:1px solid #ccc; border-radius:6px;"
                            ></iframe>
                        </div>
                    <?php else: ?>
                        <div id="preview-metodo-trabajo"></div>

                        <form id="formMetodo" enctype="multipart/form-data" class="upload-form">
                            <input type="hidden" name="folio" value="<?= $folio ?>">

                            <!-- Botón visible para seleccionar archivo -->
                            <button type="button" id="botonSeleccionarArchivo" class="btn-file">Seleccionar PDF</button>
                            <input id="input-file" type="file" name="pdf" accept="application/pdf" style="display: none;">

                            <!-- Nombre del archivo seleccionado -->
                            <div id="file-name" class="file-name"></div>

                            <!-- Campo para nombre/correo -->
                            <input type="text" name="subidoPor" placeholder="Tu nombre o correo">

                            <!-- Botón para enviar -->
                            <button type="submit" class="btn-submit">Enviar PDF</button>
                        </form>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Lightbox para imágenes -->
<div id="modal-image" class="modal-overlay">
    <div class="lightbox-content">
        <button class="close-img">&times;</button>
        <img src="" alt="Ampliada">
    </div>
</div>
<!--
      @script Expansión de bloques de defectos
      @description Script ligero que permite expandir o colapsar visualmente los bloques de cada defecto.
                   El evento click sobre el título del defecto activa el toggling de clase `.expanded`.
  -->
<script>
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.defect-title').forEach(title => {
            title.addEventListener('click', () => {
                const block = title.closest('.defect-block');
                block.classList.toggle('expanded');
            });
        });
    });
</script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<!--
        @script subirMetodoTrabajoExterno.js
        @description Script externo que controla el formulario de carga del PDF del Método de Trabajo.
                     Maneja selección de archivo, previsualización, validación y envío.
        @ubicacion ../js/subirMetodoTrabajoExterno.js
    -->
<script src="../js/subirMetodoTrabajoExterno.js"></script>
</body>
</html>
