<?php
/* --- PHP: insertarReporte.php ---
 *
 * Inserta un nuevo reporte en la base de datos a partir de datos JSON enviados
 * por el frontend. Devuelve un JSON con el estado de la operación y el folio generado.
 *
 * Flujo:
 *  1. Mostrar errores (solo en desarrollo).
 *  2. Configurar encabezado JSON y zona horaria.
 *  3. Incluir conexión.
 *  4. Leer y decodificar JSON de entrada.
 *  5. Validar que NumNomina, IdArea y Descripcion estén presentes.
 *  6. Sanitizar y asignar variables, generar FechaRegistro.
 *  7. Validar formatos de NumNomina e IdArea.
 *  8. Conectar a la BD, forzar charset UTF8MB4, e insertar con consulta preparada.
 *  9. Devolver JSON de éxito o error.
 * 10. Manejar excepciones.
 *
 * Requiere:
 *  - conexion.php con clase LocalConector::conectar()
 *  - Tabla `Reporte` con columnas:
 *      FolioReportes (INT AUTO_INCREMENT),
 *      NumeroNomina (VARCHAR(8)),
 *      IdEncargado (INT NULL),
 *      IdShiftLeader (INT NULL),
 *      FechaRegistro (DATETIME),
 *      FechaFinalizada (DATETIME NULL),
 *      Descripcion (TEXT),
 *      IdArea (INT),
 *      Comentarios (TEXT NULL)
 *  - Extensión MySQLi habilitada
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json; charset=utf-8");
date_default_timezone_set('America/Mexico_City');

include_once("conexion.php");

/* ─────────────────────────────────────────
   4. Leer y decodificar JSON del frontend
───────────────────────────────────────── */
$data = json_decode(file_get_contents("php://input"), true);

/* ─────────────────────────────────────────
   5. Validar datos requeridos
───────────────────────────────────────── */
if (
    !isset($data['NumNomina'], $data['IdArea'], $data['Descripcion']) ||
    empty(trim($data['Descripcion']))
) {
    echo json_encode([
        "status"  => "error",
        "message" => "Faltan datos obligatorios."
    ]);
    exit;
}

/* ─────────────────────────────────────────
   6. Asignar y sanitizar variables
───────────────────────────────────────── */
$NumNomina      = trim($data['NumNomina']);
$IdArea         = intval($data['IdArea']);
$Descripcion    = trim($data['Descripcion']);

$IdEncargado    = isset($data['IdEncargado'])   && trim($data['IdEncargado'])   !== ""
    ? intval($data['IdEncargado'])
    : null;
$IdShiftLeader  = isset($data['IdShiftLeader']) && trim($data['IdShiftLeader']) !== ""
    ? intval($data['IdShiftLeader'])
    : null;

$FechaRegistro  = date("Y-m-d H:i:s");
$Comentarios    = null;

/* ─────────────────────────────────────────
   7. Validar formatos básicos
───────────────────────────────────────── */
if ($NumNomina === "" || $IdArea <= 0) {
    echo json_encode([
        "status"  => "error",
        "message" => "Datos inválidos: Número de nómina o área incorrectos."
    ]);
    exit;
}

try {
    $con  = new LocalConector();
    $conn = $con->conectar();

    // ← LÍNEA AGREGADA: forzar charset UTF8MB4 para no truncar caracteres especiales
    $conn->set_charset('utf8mb4');

    /* ─────────────────────────────────────────
       8. Preparar INSERT con consulta preparada
    ────────────────────────────────────────── */
    $query = $conn->prepare(
        "INSERT INTO Reporte 
         (NumeroNomina, IdEncargado, IdShiftLeader, FechaRegistro, Descripcion, IdArea, Comentarios) 
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    if (!$query) {
        throw new Exception("Error al preparar la consulta: " . $conn->error);
    }

    $query->bind_param(
        "siissis",
        $NumNomina,
        $IdEncargado,
        $IdShiftLeader,
        $FechaRegistro,
        $Descripcion,
        $IdArea,
        $Comentarios
    );

    /* ─────────────────────────────────────────
       9. Ejecutar INSERT y devolver respuesta
    ────────────────────────────────────────── */
    if ($query->execute()) {
        $folioGenerado = $conn->insert_id;
        echo json_encode([
            "status"  => "success",
            "message" => "Reporte enviado correctamente.",
            "folio"   => $folioGenerado
        ]);
    } else {
        throw new Exception("Error al ejecutar INSERT: " . $query->error);
    }

    $query->close();
    $conn->close();

} catch (Exception $e) {
    /* ─────────────────────────────────────────
       10. Manejo de excepciones
    ────────────────────────────────────────── */
    echo json_encode([
        "status"  => "error",
        "message" => "Error en el servidor: " . $e->getMessage()
    ]);
    exit;
}
