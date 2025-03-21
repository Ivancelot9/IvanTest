<?php
include_once("conexion.php");
header("Content-Type: application/json");

try {
    $con = new LocalConector();
    $conn = $con->conectar();

    // Solo reportes con FechaFinalizada válida
    $query = $conn->prepare("
        SELECT 
            FolioReportes AS folio,
            NumeroNomina AS nomina,
            IFNULL(IdEncargado, 'N/A') AS encargado,
            FechaRegistro AS fechaRegistro,
            FechaFinalizada AS fechaFinalizacion,
            Descripcion AS descripcion,
            IFNULL(Comentarios, 'Sin comentarios') AS comentarios,
            'Completado' AS estatus
        FROM Reporte
        WHERE FechaFinalizada IS NOT NULL AND FechaFinalizada <> '0000-00-00 00:00:00'
        ORDER BY FechaFinalizada DESC
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
