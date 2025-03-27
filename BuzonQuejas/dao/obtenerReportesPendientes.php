<?php
// 🔥 Mostrar errores detallados en pantalla (solo para depuración)
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

include_once("conexion.php");

try {
    $con = new LocalConector();
    $conn = $con->conectar();

    // ✅ CONSULTA ACTUALIZADA
    $query = "SELECT 
              r.FolioReportes, 
              r.FechaRegistro, 
              r.NumeroNomina, 
              r.Descripcion, 
              r.Comentarios, 
              a.NombreArea AS Area,
              CONCAT(
                  '<strong>SUPERVISOR:</strong> <span class=\"nombre-encargado\">', IFNULL(enc.NombreEncargado, 'N/A'), '</span><br>',
                  '<strong>SHIFT LEADER:</strong> <span class=\"nombre-encargado\">', IFNULL(sl.NombreEncargado, 'N/A'), '</span>'
              ) AS Encargado
          FROM Reporte r
          LEFT JOIN Encargado enc ON r.IdEncargado = enc.IdEncargado
          LEFT JOIN Encargado sl ON r.IdShiftLeader = sl.IdEncargado
          LEFT JOIN Area a ON r.IdArea = a.IdArea
          WHERE r.FechaFinalizada IS NULL OR r.FechaFinalizada = '0000-00-00 00:00:00'
          ORDER BY r.FechaRegistro DESC";

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
