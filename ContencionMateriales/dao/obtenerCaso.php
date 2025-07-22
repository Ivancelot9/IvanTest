<?php
/**
 * @file obtenerCaso.php
 * @project Contención de Materiales
 * @module Backend API
 * @purpose Obtener los datos completos de un caso en formato JSON
 * @description
 * Este endpoint se encarga de recibir un `folio` por parámetro GET y devolver un objeto
 * JSON con todos los detalles del caso asociado. Incluye:
 * - Información básica del caso (`NumeroParte`, `Cantidad`, `Descripción`, etc.)
 * - Nombres legibles para terciaria, proveedor, commodity, estatus
 * - Lista de defectos con sus respectivas fotos tipo OK y NO OK
 * - Ruta del PDF del método de trabajo si está disponible
 *
 * ✅ Este archivo es consumido por `modalMostrarDescripcion.js` mediante `fetch`.
 * ✅ Se espera un parámetro `folio` numérico. Si es inválido o no se encuentra, se retorna un error 400/404.
 *
 * ⚠️ NOTA: Este archivo asume que la base de datos y las tablas relacionadas ya están correctamente configuradas.
 * ⚠️ Requiere el archivo de conexión `conexionContencion.php` y la clase `LocalConector`.
 *
 * @returns:
 * {
 *   status: 'success',
 *   folio: 123,
 *   fecha: '2025-07-01',
 *   numeroParte: 'PN-567',
 *   cantidad: 5,
 *   descripcion: '...',
 *   terciaria: '...',
 *   proveedor: '...',
 *   commodity: '...',
 *   estatus: '...',
 *   responsable: '...',
 *   defectos: [
 *     {
 *       nombre: 'Nombre del defecto',
 *       fotosOk: ['ok1.jpg', 'ok2.jpg'],
 *       fotosNo: ['no1.jpg']
 *     },
 *     ...
 *   ],
 *   metodoTrabajo: 'ruta.pdf' // o null si no existe
 * }
 *
 * @author Ivan Medina / Hadbet Altamirano
 * @created Junio 2025
 * @updated [¿?]
 */
// 1) Mostrar errores en desarrollo (comentar en producción)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Iniciar sesión y configurar salida como JSON
session_start();
header('Content-Type: application/json; charset=UTF-8');

include_once 'conexionContencion.php';

// 2) Validar parámetro folio desde GET (debe ser numérico y mayor a cero)
$folio = $_GET['folio'] ?? null;
if (!is_numeric($folio) || intval($folio) <= 0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Folio inválido o no especificado.']);
    exit;
}
$folio = intval($folio);

// 3) Establecer conexión a base de datos mediante clase personalizada
$con = (new LocalConector())->conectar();

// 4) Obtener datos generales del caso
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

// Si no existe el folio, retornar error
if (!$stmt->fetch()) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Caso no encontrado.']);
    exit;
}
$stmt->close();

/**
 * 5) Función auxiliar para obtener nombres legibles de IDs
 * @param mysqli $con       Conexión activa
 * @param string $table     Nombre de la tabla
 * @param string $idfield   Campo ID
 * @param string $namefield Campo de nombre
 * @param int    $id        Valor ID a buscar
 * @return string           Nombre legible o vacío
 */
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

// 6) Obtener nombres legibles para terciaria, proveedor, commodity y estatus
$terciaria = lookup($con, 'Terceria',    'IdTerceria',  'NombreTerceria',  $idTerceria);
$proveedor = lookup($con, 'Proveedores', 'IdProveedor', 'NombreProveedor', $idProveedor);
$commodity = lookup($con, 'Commodity',   'IdCommodity', 'NombreCommodity', $idCommodity);
$estatus   = lookup($con, 'Estatus',     'IdEstatus',   'NombreEstatus',   $idEstatus);

// 7) Recolectar defectos del caso y sus respectivas fotos (ok / no ok)
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

// 8) Verificar si existe método de trabajo (PDF) asociado al folio
$stmt3 = $con->prepare("SELECT RutaArchivo FROM MetodoTrabajo WHERE FolioCaso = ?");
$stmt3->bind_param('i', $folio);
$stmt3->execute();
$stmt3->bind_result($rutaPDF);
$tienePDF = $stmt3->fetch();
$stmt3->close();

// 9) Retornar respuesta en formato JSON
echo json_encode([
    'status'         => 'success',
    'folio'          => $folio,
    'fecha'          => $fecha,
    'numeroParte'    => $numeroParte,
    'cantidad'       => $cantidad,
    'descripcion'    => $descripcion,
    'terciaria'      => $terciaria,
    'proveedor'      => $proveedor,
    'commodity'      => $commodity,
    'estatus'        => $estatus,
    'responsable'    => $responsable,
    'defectos'       => $defectos,
    'metodoTrabajo'  => $tienePDF ? $rutaPDF : null
]);
exit;
