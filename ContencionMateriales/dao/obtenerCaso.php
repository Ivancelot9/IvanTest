<?php
// 1) para que PHP vuelque todos los errores:
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
header('Content-Type: application/json; charset=UTF-8');

include_once 'conexionContencion.php';

// 2) Parámetro folio obligatorio
if (!isset($_GET['folio'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Falta el parámetro folio.']);
    exit;
}
$folio = intval($_GET['folio']);

$con = (new LocalConector())->conectar();

// 3) Traer datos del caso usando FolioCaso
$stmt = $con->prepare("
    SELECT 
      NumeroParte,
      Cantidad,
      Descripcion,
      IdTerceria,
      IdProveedor,
      IdCommodity,
      IdDefectos,
      DATE_FORMAT(FechaRegistro, '%Y-%m-%d') AS FechaRegistro
    FROM Casos
    WHERE FolioCaso = ?
");
if (! $stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Error preparando SELECT Casos: '.$con->error]);
    exit;
}
$stmt->bind_param('i', $folio);
$stmt->execute();
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
    echo json_encode(['error' => 'Caso no encontrado.']);
    exit;
}
$stmt->close();

// 4) Helper de lookup para los nombres de catálogos
function lookup(mysqli $con, string $table, string $idfield, string $namefield, int $id): string {
    $n = '';
    $sql = "SELECT $namefield FROM $table WHERE $idfield = ?";
    $s = $con->prepare($sql);
    if (! $s) {
        http_response_code(500);
        echo json_encode(['error' => "Error preparando lookup ($table): ".$con->error]);
        exit;
    }
    $s->bind_param('i', $id);
    $s->execute();
    $s->bind_result($n);
    $s->fetch();
    $s->close();
    return $n;
}

$terciaria = lookup($con, 'Terceria',    'IdTerceria',   'NombreTerceria',  $idTerceria);
$proveedor = lookup($con, 'Proveedores', 'IdProveedor',  'NombreProveedor', $idProveedor);
$commodity = lookup($con, 'Commodity',   'IdCommodity',  'NombreCommodity', $idCommodity);
$defectosN = lookup($con, 'Defectos',    'IdDefectos',   'NombreDefectos',  $idDefectos);

// 5) Fotos OK
$fotosOk = [];
$sf = $con->prepare("SELECT Ruta FROM Fotos WHERE FolioCaso = ? AND TipoFoto = 'ok'");
$sf->bind_param('i', $folio);
$sf->execute();
$sf->bind_result($ruta);
while ($sf->fetch()) {
    $fotosOk[] = $ruta;
}
$sf->close();

// 6) Fotos NO OK
$fotosNo = [];
$sn = $con->prepare("SELECT Ruta FROM Fotos WHERE FolioCaso = ? AND TipoFoto = 'no'");
$sn->bind_param('i', $folio);
$sn->execute();
$sn->bind_result($ruta);
while ($sn->fetch()) {
    $fotosNo[] = $ruta;
}
$sn->close();

// 7) Devolvemos todo
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
