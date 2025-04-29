<?php

/* --- PHP: obtenerReportesPorFolio.php ---
 *
 * @file obtenerReportesPorFolio.php
 * @description
 * Obtiene los datos completos de un reporte específico identificado por su folio.
 * Devuelve un JSON con los campos:
 *  - FolioReportes
 *  - FechaRegistro
 *  - NumeroNomina
 *  - Descripcion
 *  - Comentarios
 *  - Area
 *  - Encargado
 *
 * Flujo:
 *  1. Habilitar errores detallados para desarrollo.
 *  2. Configurar header de respuesta JSON.
 *  3. Incluir la clase de conexión LocalConector.
 *  4. Validar que exista GET[\'folio\']; si no, devolver error JSON.
 *  5. Sanitizar folio a entero.
 *  6. Conectar a la base de datos.
 *  7. Preparar consulta SQL con LEFT JOINs para Area y Encargados.
 *  8. Vincular parámetro folio, ejecutar y obtener resultados.
 *  9. Si se encuentra el reporte, devolverlo en JSON; si no, error JSON.
 * 10. Capturar excepciones y devolver error JSON.
 *
 * Requiere:
 *  - conexion.php con clase LocalConector::conectar()
 *  - Extensión MySQLi habilitada
 */


/* ─────────────────────────────────────────
   1. Mostrar todos los errores (solo dev)
───────────────────────────────────────── */
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

include_once("conexion.php");

/* ─────────────────────────────────────────
   4. Validar parámetro GET 'folio'
───────────────────────────────────────── */

if (!isset($_GET['folio'])) {
    echo json_encode(["error" => "Folio no especificado"]);
    exit;
}

/* ─────────────────────────────────────────
   5. Sanitizar folio a entero
───────────────────────────────────────── */

$folio = intval($_GET['folio']);

try {
    /* ─────────────────────────────────────────
       6. Conectar a la base de datos
    ────────────────────────────────────────── */
    $con = new LocalConector();
    $conn = $con->conectar();

    /* ─────────────────────────────────────────
      7. Preparar consulta SQL con JOINs
   ────────────────────────────────────────── */

    $query = "SELECT 
                r.FolioReportes, 
                r.FechaRegistro, 
                r.NumeroNomina, 
                r.Descripcion, 
                r.Comentarios, 
                a.NombreArea AS Area,
                CONCAT(
                    'SUPERVISOR: ', IFNULL(sup.NombreEncargado, 'N/A'), ' ',
                    'SHIFT LEADER: ', IFNULL(shift.NombreEncargado, 'N/A')
                ) AS Encargado
              FROM Reporte r
              LEFT JOIN Area a ON r.IdArea = a.IdArea
              LEFT JOIN Encargado sup ON r.IdEncargado = sup.IdEncargado
              LEFT JOIN Encargado shift ON r.IdShiftLeader = shift.IdEncargado
              WHERE r.FolioReportes = ?";

    $stmt = $conn->prepare($query);

    /* ─────────────────────────────────────────
      8. Verificar y vincular parámetro
   ────────────────────────────────────────── */

    if (!$stmt) {
        echo json_encode(["error" => "Error al preparar la consulta: " . $conn->error]);
        exit;
    }

    $stmt->bind_param("i", $folio);

    /* ─────────────────────────────────────────
     9. Ejecutar y obtener resultado
  ────────────────────────────────────────── */
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $result->num_rows > 0) {
        $reporte = $result->fetch_assoc();
        echo json_encode($reporte);
    } else {
        echo json_encode(["error" => "Reporte no encontrado"]);
    }
    /* ─────────────────────────────────────────
      10. Cerrar recursos
   ────────────────────────────────────────── */

    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    /* ─────────────────────────────────────────
      11. Manejo de excepciones
   ────────────────────────────────────────── */
    echo json_encode(["error" => "Error del servidor: " . $e->getMessage()]);
}
