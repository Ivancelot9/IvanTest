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
            COALESCE(e.NombreEncargado, 'N/A') AS encargado,
            r.FechaRegistro AS fechaRegistro,
            r.FechaFinalizada AS fechaFinalizacion,
            r.Descripcion AS descripcion,
            COALESCE(r.Comentarios, 'Sin comentarios') AS comentarios,
            'Completado' AS estatus
        FROM Reporte r
        LEFT JOIN Encargado e ON r.IdEncargado = e.IdEncargado
        WHERE r.FechaFinalizada IS NOT NULL
        ORDER BY r.FechaFinalizada DESC
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
    echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
}
