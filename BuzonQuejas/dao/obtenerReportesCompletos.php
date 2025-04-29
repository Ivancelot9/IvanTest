<?php
/* --- PHP: obtenerReportesCompletos.php ---
 *
 * @file obtenerReportesCompletos.php
 * @description
 * Recupera todos los reportes que ya tienen fecha de finalización distinta de '0000-00-00 00:00:00'.
 * Cada reporte incluye:
 *  – FolioReportes, NumeroNomina, FechaRegistro, FechaFinalizada
 *  – Descripcion, Comentarios
 *  – NombreEstatus (desde tabla Estatus)
 *  – NombreArea (desde tabla Area)
 *  – Encargado (concatenado SUPERVISOR y SHIFT LEADER)
 *
 * Flujo:
 *  1. Incluir conexion.php y conectar a la base de datos.
 *  2. Definir consulta SQL con LEFT JOIN a Estatus, Area y Encargados.
 *  3. Preparar y ejecutar la consulta mediante prepare() y execute().
 *  4. Obtener el resultado con get_result().
 *  5. Recorrer cada fila, sanitizar campos de texto con htmlspecialchars para prevenir XSS.
 *  6. Acumular filas en array $reportes.
 *  7. Devolver el array en formato JSON.
 *  8. Capturar excepciones y devolver JSON con estado error.
 *
 * Requiere:
 *  – conexion.php con clase LocalConector::conectar()
 *  – Extensión MySQLi habilitada
 *  – Tablas: Reporte, Estatus, Area, Encargado
 */
include_once("conexion.php");

try {
    // 1. Conectar a la BD
    $con = new LocalConector();
    $conn = $con->conectar();

    // 2. Consulta para reportes completados
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

    // 3. Preparar y ejecutar la consulta preparada
    $stmt = $conn->prepare($query);

    if (!$stmt) {
        echo json_encode(["status" => "error", "message" => "Error al preparar la consulta: " . $conn->error]);
        exit;
    }

    // Ejecutamos la consulta
    $stmt->execute();
    $result = $stmt->get_result();

    // 4. Recorrer resultados y sanitizar
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

    // 5. Devolver JSON con el array de reportes
    echo json_encode($reportes);
// 6. Cerrar statement y conexión
    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    // 7. Manejo de excepciones y respuesta de error
    echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
}
?>
