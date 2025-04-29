<?php
/* --- PHP: obtenerReportesPendientes.php ---
 *
 * @file obtenerReportesPendientes.php
 * @description
 * Recupera los reportes pendientes (sin fecha de finalización o con fecha '0000-00-00 00:00:00').
 * Cada reporte incluye:
 *  - FolioReportes
 *  - FechaRegistro
 *  - NumeroNomina
 *  - Descripcion
 *  - Comentarios
 *  - Area (NombreArea)
 *  - Encargado (HTML con Supervisor y Shift Leader)
 *
 * Flujo:
 *  1. Habilitar errores detallados (solo para desarrollo).
 *  2. Configurar header para JSON.
 *  3. Incluir la clase de conexión LocalConector.
 *  4. Conectar a la base de datos.
 *  5. Ejecutar SELECT con LEFT JOIN a Encargado y Area.
 *  6. Recorrer resultados y almacenarlos en un array.
 *  7. Devolver el array en formato JSON.
 *  8. Capturar excepciones y devolver JSON de error.
 *
 * Requiere:
 *  - conexion.php con clase LocalConector::conectar()
 *  - Tablas: Reporte, Encargado, Area
 *  - Extensión MySQLi habilitada
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

include_once("conexion.php");

try {
    /* ─────────────────────────────────────────
       4. Conectar a la base de datos
    ────────────────────────────────────────── */
    $con = new LocalConector();
    $conn = $con->conectar();

    /* ─────────────────────────────────────────
       5. Ejecutar SELECT de reportes pendientes
    ────────────────────────────────────────── */
    $query = "SELECT 
              r.FolioReportes, 
              r.FechaRegistro, 
              r.NumeroNomina, 
              r.Descripcion, 
              r.Comentarios, 
              a.NombreArea AS Area,
              CONCAT(
                  '<strong>SUPERVISOR:</strong> <span class=\"nombre-encargado\">', IFNULL(enc.NombreEncargado, 'N/A'), '</span><br>',
                  '<strong>SHIFT LEADER:</strong> <span class=\"nombre-encargado\">', IFNULL(sl.NombreEncargado, 'N/A'), '</span>'
              ) AS Encargado
          FROM Reporte r
          LEFT JOIN Encargado enc ON r.IdEncargado = enc.IdEncargado
          LEFT JOIN Encargado sl ON r.IdShiftLeader = sl.IdEncargado
          LEFT JOIN Area a ON r.IdArea = a.IdArea
          WHERE r.FechaFinalizada IS NULL OR r.FechaFinalizada = '0000-00-00 00:00:00'
          ORDER BY r.FechaRegistro DESC";

    $result = $conn->query($query);

    if (!$result) {
        echo json_encode(["status" => "error", "message" => "Error en la consulta: " . $conn->error]);
        exit;
    }
    /* ─────────────────────────────────────────
      6. Procesar resultados
   ────────────────────────────────────────── */

    $reportes = [];
    while ($row = $result->fetch_assoc()) {
        $reportes[] = $row;
    }

    echo json_encode($reportes);
} catch (Exception $e) {
    /* ─────────────────────────────────────────
      8. Manejo de excepciones
   ────────────────────────────────────────── */
    echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
}
