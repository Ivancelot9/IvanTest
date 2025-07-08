<?php
// 1) Mostrar errores en desarrollo (comentar en producción)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
header('Content-Type: application/json; charset=UTF-8');

include_once 'conexionContencion.php';

// 2) Validar parámetro folio
$folio = $_GET['folio'] ?? null;
if (!is_numeric($folio) || intval($folio) <= 0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Folio inválido o no especificado.']);
    exit;
}
$folio = intval($folio);

// 3) Conexión
$con = (new LocalConector())->conectar();

// 4) Datos básicos del caso
$stmt = $con->prepare("
    SELECT 
      NumeroParte,
      Cantidad,
      Descripcion,
      IdTerceria,
      IdProveedor,
      IdCommodity,
      IdEstatus,
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
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Caso no encontrado.']);
    exit;
}
$stmt->close();

// 5) Función helper para nombres legibles
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

// 6) Campos legibles
$terciaria = lookup($con, 'Terceria',    'IdTerceria',  'NombreTerceria',  $idTerceria);
$proveedor = lookup($con, 'Proveedores', 'IdProveedor', 'NombreProveedor', $idProveedor);
$commodity = lookup($con, 'Commodity',   'IdCommodity', 'NombreCommodity', $idCommodity);
$estatus   = lookup($con, 'Estatus',     'IdEstatus',   'NombreEstatus',   $idEstatus);

// 7) Recoger defectos y sus fotos
$map = [];
$stmt2 = $con->prepare("
    SELECT
      dc.IdDefectoCaso,
      d.NombreDefectos AS nombreDefecto,
      f.TipoFoto,
      f.Ruta
    FROM DefectosCaso dc
    JOIN Defectos d ON d.IdDefectos = dc.IdDefectos
    LEFT JOIN Fotos f ON f.IdDefectoCaso = dc.IdDefectoCaso
    WHERE dc.FolioCaso = ?
    ORDER BY dc.IdDefectoCaso, FIELD(f.TipoFoto, 'ok', 'no')
");
$stmt2->bind_param('i', $folio);
$stmt2->execute();
$res2 = $stmt2->get_result();
while ($row = $res2->fetch_assoc()) {
    $idCasoDef = $row['IdDefectoCaso'];
    if (!isset($map[$idCasoDef])) {
        $map[$idCasoDef] = [
            'nombre'  => $row['nombreDefecto'],
            'fotosOk' => [],
            'fotosNo' => []
        ];
    }
    if (!empty($row['Ruta'])) {
        $key = strtolower($row['TipoFoto']) === 'ok' ? 'fotosOk' : 'fotosNo';
        $map[$idCasoDef][$key][] = $row['Ruta'];
    }
}
$stmt2->close();
$defectos = array_values($map);

// 8) Enviar JSON final
echo json_encode([
    'status'       => 'success',
    'folio'        => $folio,
    'fecha'        => $fecha,
    'numeroParte'  => $numeroParte,
    'cantidad'     => $cantidad,
    'descripcion'  => $descripcion,
    'terciaria'    => $terciaria,
    'proveedor'    => $proveedor,
    'commodity'    => $commodity,
    'estatus'      => $estatus,
    'responsable'  => $responsable,
    'defectos'     => $defectos
]);
exit;
