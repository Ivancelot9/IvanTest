<?php
header('Content-Type: application/json');
include_once("conexion.php");

if (!isset($_GET['folio'])) {
    echo json_encode(["status" => "error", "message" => "Folio no especificado."]);
    exit;
}

$folio = intval($_GET['folio']);

try {
    $con = new LocalConector();
    $conn = $con->conectar();

    $query = "SELECT 
                r.FolioReportes AS folio,
                r.FechaRegistro AS fechaRegistro,
                r.NumeroNomina AS nomina,
                r.Descripcion AS descripcion,
                r.Comentarios AS comentarios,
                a.NombreArea AS area,
                GROUP_CONCAT(CONCAT(e.NombreEncargado, ' (', e.Tipo, ')') SEPARATOR ', ') AS encargado
              FROM Reporte r
              LEFT JOIN Encargado e ON r.IdEncargado = e.IdEncargado
              LEFT JOIN Area a ON r.IdArea = a.IdArea
              WHERE r.FolioReportes = ?
              GROUP BY r.FolioReportes";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $folio);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($reporte = $result->fetch_assoc()) {
        echo json_encode(["status" => "success", "data" => $reporte]);
    } else {
        echo json_encode(["status" => "error", "message" => "Reporte no encontrado."]);
    }

    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
}

