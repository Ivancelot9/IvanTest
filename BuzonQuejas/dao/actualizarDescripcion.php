<?php
/* --- PHP: actualizarDescripcion.php ---
 *
 * Actualiza la Descripción de un reporte existente.
 * Recibe JSON con:
 *  - FolioReportes (int)
 *  - Descripcion   (string)
 */
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json");

include_once("conexion.php");

$data = json_decode(file_get_contents("php://input"), true);
if (
    !isset($data['FolioReportes'], $data['Descripcion']) ||
    empty(trim($data['Descripcion']))
) {
    echo json_encode([
        "status"  => "error",
        "message" => "Faltan datos obligatorios."
    ]);
    exit;
}

$folio      = intval($data['FolioReportes']);
$descripcion = trim($data['Descripcion']);
if ($folio <= 0) {
    echo json_encode([
        "status"  => "error",
        "message" => "Folio inválido."
    ]);
    exit;
}

try {
    $con  = new LocalConector();
    $conn = $con->conectar();

    $stmt = $conn->prepare("
        UPDATE Reporte
           SET Descripcion = ?
         WHERE FolioReportes = ?
    ");
    $stmt->bind_param("si", $descripcion, $folio);

    if ($stmt->execute()) {
        echo json_encode([
            "status"  => "success",
            "message" => "Descripción actualizada."
        ]);
    } else {
        echo json_encode([
            "status"  => "error",
            "message" => "Error en BD: " . $stmt->error
        ]);
    }

    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    echo json_encode([
        "status"  => "error",
        "message" => "Error de servidor: " . $e->getMessage()
    ]);
}
