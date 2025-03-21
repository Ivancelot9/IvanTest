<?php
include_once("conexion.php"); // 🔥 Conexión a la BD

header("Content-Type: application/json");

try {
    $con = new LocalConector();
    $conn = $con->conectar();

    $query = $conn->prepare("
        SELECT 
            r.FolioReportes AS folio,
            r.NumeroNomina AS nomina,
            IFNULL(CONCAT(e.Nombre, ' ', e.Apellidos), 'N/A') AS encargado,
            r.FechaRegistro AS fechaRegistro,
            r.FechaFinalizada AS fechaFinalizacion,
            r.Descripcion AS descripcion,
            IFNULL(r.Comentarios, 'Sin comentarios') AS comentarios,
            'Completado' AS estatus
        FROM Reporte r
        LEFT JOIN Empleado e ON e.NumeroNomina = r.IdEncargado
        WHERE r.FechaFinalizada IS NOT NULL AND r.FechaFinalizada != '0000-00-00 00:00:00'
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
