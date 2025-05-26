<?php
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

// 3) Función helper para lookup de nombres
function lookup(mysqli $con, string $table, string $idfield, string $namefield, int $id): string {
    $n = '';  // <-- inicializamos
    $s = $con->prepare("SELECT $namefield FROM $table WHERE $idfield = ?");
    $s->bind_param('i', $id);
    $s->execute();
    $s->bind_result($n);
    $s->fetch();  // si no existe fila, $n queda como ''
    $s->close();
    return $n;
}

$terciaria = lookup($con, 'Terceria',    'IdTerceria', 'NombreTerceria',  $idTerceria);
$proveedor = lookup($con, 'Proveedores', 'IdProveedor','NombreProveedor', $idProveedor);
$commodity = lookup($con, 'Commodity',   'IdCommodity','NombreCommodity', $idCommodity);
$defectosN = lookup($con, 'Defectos',    'IdDefectos', 'NombreDefectos',  $idDefectos);

// 4) Fotos OK
$fotosOk = [];
$sf = $con->prepare("SELECT Ruta FROM Fotos WHERE FolioCaso = ? AND TipoFoto = 'ok'");
$sf->bind_param('i', $folio);
$sf->execute();
$sf->bind_result($ruta);
while ($sf->fetch()) {
    $fotosOk[] = $ruta;
}
$sf->close();

// 5) Fotos NO OK
$fotosNo = [];
$sn = $con->prepare("SELECT Ruta FROM Fotos WHERE FolioCaso = ? AND TipoFoto = 'no'");
$sn->bind_param('i', $folio);
$sn->execute();
$sn->bind_result($ruta);
while ($sn->fetch()) {
    $fotosNo[] = $ruta;
}
$sn->close();

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
