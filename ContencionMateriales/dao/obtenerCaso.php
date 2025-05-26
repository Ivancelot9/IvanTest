<?php
// Mostrar siempre los errores para depurar
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(E_ALL);

session_start();
header('Content-Type: application/json; charset=UTF-8');

include_once 'conexionContencion.php';

// 1) Validar folio
if (!isset($_GET['folio'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Falta el parámetro folio.']);
    exit;
}
$folio = intval($_GET['folio']);

$con = (new LocalConector())->conectar();

// 2) Obtener datos del caso
$stmt = $con->prepare("
    SELECT NumeroParte, Cantidad, Descripcion,
           IdTerceria, IdProveedor, IdCommodity, IdDefectos,
           DATE_FORMAT(FechaRegistro, '%Y-%m-%d') AS FechaRegistro
      FROM Casos
     WHERE IdCaso = ?
");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al preparar SELECT Casos: ' . $con->error]);
    exit;
}
$stmt->bind_param('i', $folio);
$stmt->execute();

// inicializo todas las variables que voy a bindear
$numeroParte = $cantidad = $descripcion = '';
$idTerceria = $idProveedor = $idCommodity = $idDefectos = 0;
$fecha = '';

$stmt->bind_result(
    $numeroParte,
    $cantidad,
    $descripcion,
    $idTerceria,
    $idProveedor,
    $idCommodity,
    $idDefectos,
    $fecha
);
if (! $stmt->fetch()) {
    http_response_code(404);
    echo json_encode(['error' => 'Caso no encontrado.']);
    exit;
}
$stmt->close();

// 3) Función helper lookup
function lookup(mysqli $con, string $table, string $idfield, string $namefield, int $id): string {
    $value = '';
    $s = $con->prepare("SELECT `$namefield` FROM `$table` WHERE `$idfield` = ?");
    if (!$s) {
        throw new Exception("Error preparando lookup en $table: " . $con->error);
    }
    $s->bind_param('i', $id);
    $s->execute();
    $s->bind_result($value);
    $s->fetch(); // si no hay fila, $value queda en ''
    $s->close();
    return $value;
}

try {
    $terciaria = lookup($con, 'Terceria',    'IdTerceria',    'NombreTerceria',  $idTerceria);
    $proveedor = lookup($con, 'Proveedores', 'IdProveedor',   'NombreProveedor', $idProveedor);
    $commodity = lookup($con, 'Commodity',   'IdCommodity',   'NombreCommodity', $idCommodity);
    $defectosN = lookup($con, 'Defectos',    'IdDefectos',    'NombreDefectos',  $idDefectos);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}

// 4) Fotos OK
$fotosOk = [];
$sf = $con->prepare("SELECT Ruta FROM Fotos WHERE FolioCaso = ? AND TipoFoto = 'ok'");
if ($sf) {
    $sf->bind_param('i', $folio);
    $sf->execute();
    $sf->bind_result($ruta);
    while ($sf->fetch()) {
        $fotosOk[] = $ruta;
    }
    $sf->close();
}

// 5) Fotos NO OK
$fotosNo = [];
$sn = $con->prepare("SELECT Ruta FROM Fotos WHERE FolioCaso = ? AND TipoFoto = 'no'");
if ($sn) {
    $sn->bind_param('i', $folio);
    $sn->execute();
    $sn->bind_result($rutaNo);
    while ($sn->fetch()) {
        $fotosNo[] = $rutaNo;
    }
    $sn->close();
}

// 6) Responder JSON
echo json_encode([
    'folio'       => $folio,
    'fecha'       => $fecha,
    'numeroParte' => $numeroParte,
    'cantidad'    => $cantidad,
    'descripcion' => $descripcion,
    'terciaria'   => $terciaria,
    'proveedor'   => $proveedor,
    'commodity'   => $commodity,
    'defectos'    => $defectosN,
    'fotosOk'     => $fotosOk,
    'fotosNo'     => $fotosNo
]);
exit;
