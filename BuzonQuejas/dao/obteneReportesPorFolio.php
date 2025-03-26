<?php
// 🔥 Mostrar errores detallados
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

include_once("conexion.php");

if (!isset($_GET['folio'])) {
    echo json_encode(["error" => "Folio no especificado"]);
    exit;
}

$folio = intval($_GET['folio']);

try {
    $con = new LocalConector();
    $conn = $con->conectar();

    $query = "SELECT 
                r.FolioReportes, 
                r.FechaRegistro, 
                r.NumeroNomina, 
                r.Descripcion, 
                r.Comentarios, 
                a.NombreArea AS Area,
                GROUP_CONCAT(CONCAT(e.NombreEncargado, ' (', e.Tipo, ')') SEPARATOR ', ') AS Encargado
              FROM Reporte r
              LEFT JOIN Encargado e ON r.IdEncargado = e.IdEncargado
              LEFT JOIN Area a ON r.IdArea = a.IdArea
              WHERE r.FolioReportes = ?
              GROUP BY r.FolioReportes";

    $stmt = $conn->prepare($query);

    if (!$stmt) {
        echo json_encode(["error" => "Error al preparar la consulta: " . $conn->error]);
        exit;
    }

    $stmt->bind_param("i", $folio);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $result->num_rows > 0) {
        $reporte = $result->fetch_assoc();
        echo json_encode($reporte);
    } else {
        echo json_encode(["error" => "Reporte no encontrado"]);
    }

    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    echo json_encode(["error" => "Error del servidor: " . $e->getMessage()]);
}
