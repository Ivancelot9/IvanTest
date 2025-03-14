<?php
include_once("conexion.php");
header('Content-Type: application/json');

try {
    $con = new LocalConector();
    $conn = $con->conectar();

    $sql = "SELECT 
                r.FolioReportes, 
                r.NumeroNomina, 
                COALESCE(e.NombreEncargado, 'N/A') AS Encargado,
                r.FechaRegistro, 
                r.FechaFinalizada, 
                r.Descripcion, 
                COALESCE(r.Comentarios, 'Sin comentarios') AS Comentarios,
                estatus.NombreEstatus,
                a.NombreArea
            FROM Reporte r
            LEFT JOIN Encargado e ON r.IdEncargado = e.IdEncargado
            LEFT JOIN Estatus estatus ON r.IdEstatus = estatus.IdEstatus
            LEFT JOIN Area a ON r.IdArea = a.IdArea
            ORDER BY r.FolioReportes DESC";

    $result = $conn->query($sql);
    $reportes = [];

    while ($row = $result->fetch_assoc()) {
        $reportes[] = $row;
    }

    echo json_encode($reportes);
    $conn->close();
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
}
?>
