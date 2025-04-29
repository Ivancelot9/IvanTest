<?php
/* --- PHP: conseguirReportesCompletos.php ---
 *
 * @file conseguirReportesCompletos.php
 * @description
 * Recupera los reportes marcados como completados desde la base de datos,
 * con opción de filtrar por folio mediante parámetro GET `?folio=`.
 *
 * Flujo:
 *  1. Incluir conexión a BD y configurar header JSON.
 *  2. Conectar con LocalConector.
 *  3. Leer y sanitizar parámetro GET `folio` (opcional).
 *  4. Preparar consulta SQL con LEFT JOIN para supervisor y shift leader,
 *     aplicando filtro dinámico por folio.
 *  5. Ejecutar consulta y obtener resultados.
 *  6. Recorrer resultados, almacenarlos en array.
 *  7. Devolver array en formato JSON.
 *  8. Capturar excepciones y devolver error en JSON.
 *
 * Requiere:
 *  - conexion.php que define LocalConector::conectar()
 *  - Extensión MySQLi habilitada
 */

include_once("conexion.php");
header("Content-Type: application/json");

try {
    // 1. Conectar a la base de datos
    $con  = new LocalConector();
    $conn = $con->conectar();

    // 2. Leer parámetro GET 'folio' y asegurarse de que sea entero o null
    $folio = isset($_GET['folio']) ? intval($_GET['folio']) : null;

    // 3. Preparar consulta con filtro dinámico para evitar inyección SQL
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
        LEFT JOIN Encargado sup   ON r.IdEncargado   = sup.IdEncargado
        LEFT JOIN Encargado shift ON r.IdShiftLeader = shift.IdEncargado
        WHERE r.FechaFinalizada IS NOT NULL
          AND r.FechaFinalizada <> '0000-00-00 00:00:00'
          AND (? IS NULL OR r.FolioReportes = ?)
        ORDER BY r.FechaFinalizada DESC
    ");

    // 4. Asociar parámetro 'folio' (dos veces para el NULL check)
    $query->bind_param("ii", $folio, $folio);

    // 5. Ejecutar consulta y obtener resultados
    $query->execute();
    $result = $query->get_result();

    // 6. Recorrer resultados y almacenarlos en array
    $reportes = [];
    while ($row = $result->fetch_assoc()) {
        $reportes[] = $row;
    }

    // 7. Devolver el array como JSON
    echo json_encode($reportes);

    $query->close();
    $conn->close();

} catch (Exception $e) {
    // 8. Manejo de excepciones: devolver error en JSON
    echo json_encode([
        "status"  => "error",
        "message" => "Error en el servidor: " . $e->getMessage()
    ]);
}
