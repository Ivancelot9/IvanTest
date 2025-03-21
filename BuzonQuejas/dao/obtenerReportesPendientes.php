<?php
// 🔥 Mostrar errores detallados en pantalla (solo para depuración)
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

include_once("conexion.php");

try {
    $con = new LocalConector();
    $conn = $con->conectar();

    // 🔍 Consulta mejorada para incluir Supervisor y Shift Leader en la misma celda
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
          WHERE r.FechaFinalizada IS NULL OR r.FechaFinalizada = '0000-00-00 00:00:00'
          GROUP BY r.FolioReportes";

    $result = $conn->query($query);

    // 🚨 **Verificar si la consulta falló**
    if (!$result) {
        echo json_encode(["status" => "error", "message" => "Error en la consulta: " . $conn->error]);
        exit;
    }

    $reportes = [];
    while ($row = $result->fetch_assoc()) {
        $reportes[] = $row;
    }

    // 🚀 **Si todo está bien, devuelve el JSON**
    echo json_encode($reportes);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
}
