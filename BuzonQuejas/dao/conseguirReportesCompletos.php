<?php
include_once("conexion.php");
header("Content-Type: application/json");

try {
    $con = new LocalConector();
    $conn = $con->conectar();

    $query = $conn->prepare("
        SELECT 
            r.FolioReportes AS folio,
            r.NumeroNomina AS nomina,
            IFNULL(r.IdEncargado, 'N/A') AS encargado,
            r.FechaRegistro AS fechaRegistro,
            r.Descripcion AS descripcion,
            IFNULL(r.Comentarios, 'Sin comentarios') AS comentarios,
            r.IdArea AS idArea,
            r.IdEstatus AS estatus
        FROM Reporte r
        WHERE r.FechaFinalizada IS NULL OR r.FechaFinalizada = '0000-00-00 00:00:00'
        ORDER BY r.FechaRegistro DESC
    ");

    $query->execute();
    $result = $query->get_result();

    $reportes = [];

    while ($row = $result->fetch_assoc()) {
        $reportes[] = $row;
    }

    echo json_encode($reportes);

    $query->close();
    $conn->close();
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Error en el servidor: " . $e->getMessage()
    ]);
}

