<?php
include_once("conexion.php");
header("Content-Type: application/json");

try {
    $con = new LocalConector();
    $conn = $con->conectar();

    // Parámetro dinámico (ejemplo: Filtrar por FolioReportes)
    $folio = isset($_GET['folio']) ? intval($_GET['folio']) : null; // Usar $_GET, $_POST o cualquier otro medio de entrada

    // Consulta con un parámetro dinámico, usando consulta preparada para evitar inyecciones SQL
    $query = $conn->prepare("
        SELECT 
          r.FolioReportes AS folio,
          r.NumeroNomina AS nomina,
          CONCAT(
              'SUPERVISOR: ', IFNULL(sup.NombreEncargado, 'N/A'), '\\n',
              'SHIFT LEADER: ', IFNULL(shift.NombreEncargado, 'N/A')
          ) AS encargado,
          r.FechaRegistro AS fechaRegistro,
          r.FechaFinalizada AS fechaFinalizacion,
          r.Descripcion AS descripcion,
          IFNULL(r.Comentarios, 'Sin comentarios') AS comentarios,
          'Completado' AS estatus
        FROM Reporte r
        LEFT JOIN Encargado sup ON r.IdEncargado = sup.IdEncargado
        LEFT JOIN Encargado shift ON r.IdShiftLeader = shift.IdEncargado
        WHERE r.FechaFinalizada IS NOT NULL 
          AND r.FechaFinalizada <> '0000-00-00 00:00:00'
          AND (? IS NULL OR r.FolioReportes = ?)  -- Filtrando por FolioReportes si se pasa el parámetro
        ORDER BY r.FechaFinalizada DESC
    ");

    // Si el parámetro 'folio' es pasado, lo usamos, de lo contrario no filtramos
    $query->bind_param("ii", $folio, $folio); // Usamos el tipo de dato correcto (entero 'i')

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

