<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include_once 'conexionContencion.php';

// Capturar parámetro
$folio = isset($_GET['folio']) ? intval($_GET['folio']) : (isset($_GET['Caso']) ? intval($_GET['Caso']) : 0);
if ($folio <= 0) {
    echo "<h2>Folio inválido.</h2>";
    exit;
}

$con = (new LocalConector())->conectar();

// Consulta principal
$stmt = $con->prepare("
    SELECT 
      NumeroParte, Cantidad, Descripcion,
      IdTerceria, IdProveedor, IdCommodity, IdEstatus,
      Responsable, DATE_FORMAT(FechaRegistro, '%Y-%m-%d') AS FechaRegistro
    FROM Casos
    WHERE FolioCaso = ?
");
$stmt->bind_param('i', $folio);
$stmt->execute();
$stmt->bind_result(
    $numeroParte, $cantidad, $descripcion,
    $idTerceria, $idProveedor, $idCommodity, $idEstatus,
    $responsable, $fecha
);
if (! $stmt->fetch()) {
    echo "<h2>⚠️ Caso no encontrado.</h2>";
    exit;
}
$stmt->close();

// Lookup helper
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

$terciaria = lookup($con, 'Terceria', 'IdTerceria', 'NombreTerceria', $idTerceria);
$proveedor = lookup($con, 'Proveedores', 'IdProveedor', 'NombreProveedor', $idProveedor);
$commodity = lookup($con, 'Commodity', 'IdCommodity', 'NombreCommodity', $idCommodity);
$estatus   = lookup($con, 'Estatus', 'IdEstatus', 'NombreEstatus', $idEstatus);

// Defectos y fotos
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
    $id = $row['IdDefectoCaso'];
    if (!isset($map[$id])) {
        $map[$id] = [
            'nombre'  => $row['NombreDefectos'],
            'fotosOk' => [],
            'fotosNo' => []
        ];
    }
    if (!empty($row['Ruta'])) {
        $key = $row['TipoFoto'] === 'ok' ? 'fotosOk' : 'fotosNo';
        $map[$id][$key][] = $row['Ruta'];
    }
}
$stmt2->close();
$defectos = array_values($map);

// Consulta PDF
$stmt3 = $con->prepare("SELECT RutaArchivo FROM MetodoTrabajo WHERE FolioCaso = ?");
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
                                        <img src="uploads/ok/<?= urlencode($f) ?>" alt="OK">
                                    <?php endforeach; ?>
                                </div>
                            </div>
                            <div class="photos-group no">
                                <div class="group-title">NO OK</div>
                                <div class="thumbs">
                                    <?php foreach ($def['fotosNo'] as $f): ?>
                                        <img src="uploads/no/<?= urlencode($f) ?>" alt="NO OK">
                                    <?php endforeach; ?>
                                </div>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>

            <!-- PDF Método de Trabajo -->
            <div class="info-grid" style="margin-top:30px;">
                <div class="info-cell full-width">
                    <label>Método de Trabajo</label>
                    <?php if ($tienePDF): ?>
                        <iframe src="uploads/pdf/<?= urlencode($rutaPDF) ?>" width="100%" height="500px" style="border:1px solid #ccc;"></iframe>
                    <?php else: ?>
                        <form method="POST" enctype="multipart/form-data" id="form-subir-metodo" style="margin-top:10px;">
                            <input type="hidden" name="folio" value="<?= $folio ?>">
                            <input type="file" name="pdf" accept="application/pdf" required>
                            <input type="text" name="subidoPor" placeholder="Tu nombre o correo" required>
                            <button type="submit">Subir PDF</button>
                        </form>
                        <script>
                            document.getElementById('form-subir-metodo')?.addEventListener('submit', async e => {
                                e.preventDefault();
                                const form = e.target;
                                const data = new FormData(form);
                                const res = await fetch('guardarMetodoTrabajo.php', {
                                    method: 'POST',
                                    body: data
                                });
                                const json = await res.json();
                                if (json.status === 'success') {
                                    alert("PDF subido. Recargando...");
                                    location.reload();
                                } else {
                                    alert("Error: " + json.message);
                                }
                            });
                        </script>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Lightbox para fotos -->
<div id="modal-image" class="modal-overlay">
    <div class="lightbox-content">
        <button class="close-img">&times;</button>
        <img src="" alt="Ampliada">
    </div>
</div>

<script>
    document.querySelectorAll('.thumbs img').forEach(img => {
        img.addEventListener('click', () => {
            const lb = document.getElementById('modal-image');
            lb.querySelector('img').src = img.src;
            lb.style.display = 'flex';
        });
    });
    document.querySelector('.close-img').addEventListener('click', () => {
        document.getElementById('modal-image').style.display = 'none';
    });
    document.getElementById('modal-image').addEventListener('click', e => {
        if (e.target.id === 'modal-image') e.currentTarget.style.display = 'none';
    });

    document.querySelectorAll('.defect-title').forEach(title => {
        const block = title.closest('.defect-block');
        title.addEventListener('click', () => {
            block.classList.toggle('expanded');
        });
    });
</script>
</body>
</html>
