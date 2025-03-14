<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

include_once("conexion.php");

try {
    $con = new LocalConector();
    $conn = $con->conectar();

    // 🔹 Obtener reportes pendientes
    $query = "SELECT r.FolioReportes, r.FechaRegistro, r.NumeroNomina, 
                     IFNULL(e.Nombre, 'N/A') AS Encargado, 
                     r.Descripcion, r.Comentarios, 
                     s.NombreEstatus, r.IdArea
              FROM Reporte r
              LEFT JOIN Encargado e ON r.IdEncargado = e.IdEncargado
              LEFT JOIN Estatus s ON r.IdEstatus = s.IdEstatus
              WHERE r.IdEstatus = 1";

    $result = $conn->query($query);

    if (!$result) {
        echo json_encode(["status" => "error", "message" => "Error en la consulta: " . $conn->error]);
        exit;
    }

    $reportes = [];
    while ($row = $result->fetch_assoc()) {
        $reportes[] = $row;
    }

    echo json_encode($reportes);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
}
?>
