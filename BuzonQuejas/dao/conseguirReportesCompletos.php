<?php
include_once("conexion.php"); // 🔥 Conexión a la BD

header("Content-Type: application/json");

try {
    $con = new LocalConector();
    $conn = $con->conectar();

    // 🔹 Consulta para obtener solo reportes con FechaFinalizada (completados)
    $query = $conn->prepare("
        SELECT 
            R.FolioReportes AS folio,
            R.NumeroNomina AS nomina,
            CONCAT(E.Nombre, ' ', E.Apellidos) AS encargado,
            R.FechaRegistro AS fechaRegistro,
            R.FechaFinalizada AS fechaFinalizacion,
            R.Descripcion AS descripcion,
            COALESCE(R.Comentarios, 'Sin comentarios') AS comentarios,
            'Completado' AS estatus
        FROM Reporte R
        LEFT JOIN Empleado E ON R.IdEncargado = E.IdEmpleado
        WHERE R.FechaFinalizada IS NOT NULL
        ORDER BY R.FechaFinalizada DESC
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
