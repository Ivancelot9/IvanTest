<?php
include_once("conexion.php");
header('Content-Type: application/json');

try {
    $con = new LocalConector();
    $conn = $con->conectar();

    // 🔥 Consulta para obtener reportes con el área correspondiente
    $sql = "SELECT 
                r.FolioReportes AS Folio, 
                r.FechaRegistro, 
                r.NumeroNomina, 
                IF(a.IdArea = 1, 
                    CONCAT(
                        COALESCE(sup.NombreEncargado, ''), 
                        IF(sup.NombreEncargado IS NOT NULL AND sl.NombreEncargado IS NOT NULL, ' / ', ''), 
                        COALESCE(sl.NombreEncargado, '')
                    ), 
                    'N/A'
                ) AS Encargado, 
                r.Descripcion, 
                r.Comentarios, 
                es.NombreEstatus AS Estatus, 
                r.FechaFinalizada, 
                a.NombreArea AS Area
            FROM Reporte r
            LEFT JOIN Encargado sup ON r.IdEncargado = sup.IdEncargado AND sup.Tipo = 'Supervisor'
            LEFT JOIN Encargado sl ON r.IdEncargado = sl.IdEncargado AND sl.Tipo = 'Shift Leader'
            LEFT JOIN Estatus es ON r.IdEstatus = es.IdEstatus
            LEFT JOIN Area a ON r.IdArea = a.IdArea
            ORDER BY r.FechaRegistro DESC";

    $result = $conn->query($sql);
    $reportes = [];

    while ($row = $result->fetch_assoc()) {
        $reportes[] = $row;
    }

    echo json_encode($reportes);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
}

