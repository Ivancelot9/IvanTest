<?php
include_once("conexion.php");

try {
    $con = new LocalConector();
    $conn = $con->conectar();

    // Usamos una consulta preparada para mejorar la seguridad
    $query = "SELECT 
        r.FolioReportes, 
        r.NumeroNomina, 
        r.FechaRegistro, 
        r.FechaFinalizada, 
        r.Descripcion, 
        r.Comentarios, 
        e.NombreEstatus, 
        a.NombreArea,
        CONCAT(
            'Supervisor: ', IFNULL(enc.NombreEncargado, 'N/A'), 
            '<br>Shift Leader: ', IFNULL(shift.NombreEncargado, 'N/A')
        ) AS Encargado
    FROM Reporte r
    LEFT JOIN Estatus e ON r.IdEstatus = e.IdEstatus
    LEFT JOIN Area a ON r.IdArea = a.IdArea
    LEFT JOIN Encargado enc ON r.IdEncargado = enc.IdEncargado
    LEFT JOIN Encargado shift ON r.IdShiftLeader = shift.IdEncargado
    WHERE r.FechaFinalizada != '0000-00-00 00:00:00'";

    // Usamos prepare y bind_param para mayor seguridad
    $stmt = $conn->prepare($query);

    if (!$stmt) {
        echo json_encode(["status" => "error", "message" => "Error al preparar la consulta: " . $conn->error]);
        exit;
    }

    // Ejecutamos la consulta
    $stmt->execute();
    $result = $stmt->get_result();

    // Recuperar los resultados en formato de array asociativo
    $reportes = [];
    while ($row = $result->fetch_assoc()) {
        // Sanitizamos las salidas para evitar XSS (si los datos se muestran en el frontend)
        $row['Comentarios'] = htmlspecialchars($row['Comentarios']);
        $row['Descripcion'] = htmlspecialchars($row['Descripcion']);
        $row['NombreEstatus'] = htmlspecialchars($row['NombreEstatus']);
        $row['NombreArea'] = htmlspecialchars($row['NombreArea']);
        $row['Encargado'] = htmlspecialchars($row['Encargado']);

        $reportes[] = $row;
    }

    // Devolver los datos en formato JSON
    echo json_encode($reportes);

    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
}
?>
