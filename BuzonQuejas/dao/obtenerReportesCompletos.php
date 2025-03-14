<?php
include_once("conexion.php");


try {
    $con = new LocalConector();
    $conn = $con->conectar();

    $sql = "SELECT r.FolioReportes, r.NumeroNomina, r.FechaRegistro, r.FechaFinalizada, r.Descripcion, r.Comentarios, e.NombreEstatus, 
                   a.NombreArea, IFNULL(enc.NombreEncargado, 'N/A') AS Encargado
            FROM Reporte r
            LEFT JOIN Estatus e ON r.IdEstatus = e.IdEstatus
            LEFT JOIN Area a ON r.IdArea = a.IdArea
            LEFT JOIN Encargado enc ON r.IdEncargado = enc.IdEncargado
            WHERE r.FechaFinalizada != '0000-00-00 00:00:00'";

    $result = $conn->query($sql);
    $reportes = $result->fetch_all(MYSQLI_ASSOC);

    echo json_encode($reportes);
    $conn->close();
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
}

