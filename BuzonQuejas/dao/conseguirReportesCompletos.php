<?php
include_once("conexion.php");
header("Content-Type: application/json");

try {
    $con = new LocalConector();
    $conn = $con->conectar();

    // Solo reportes con FechaFinalizada válida
    $query = $conn->prepare("
        SELECT 
          r.FolioReportes AS folio,
    r.NumeroNomina AS nomina,
    CONCAT(
        '<strong>SUPERVISOR:</strong> <span class=\"nombre-encargado\">', IFNULL(sup.NombreEncargado, 'N/A'), '</span><br>',
        '<strong>SHIFT LEADER:</strong> <span class=\"nombre-encargado\">', IFNULL(shift.NombreEncargado, 'N/A'), '</span>'
    ) AS encargado,
    r.FechaRegistro AS fechaRegistro,
    r.FechaFinalizada AS fechaFinalizacion,
    r.Descripcion AS descripcion,
    IFNULL(r.Comentarios, 'Sin comentarios') AS comentarios,
    'Completado' AS estatus
FROM Reporte r
LEFT JOIN Encargado sup ON r.IdEncargado = sup.IdEncargado
LEFT JOIN Encargado shift ON r.IdShiftLeader = shift.IdEncargado
WHERE r.FechaFinalizada IS NOT NULL AND r.FechaFinalizada <> '0000-00-00 00:00:00'
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
    echo json_encode([
        "status" => "error",
        "message" => "Error en el servidor: " . $e->getMessage()
    ]);
}
