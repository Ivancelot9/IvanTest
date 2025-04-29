<?php
/* --- PHP: insertarFechaFinalizacion.php ---
 *
 * @file insertarFechaFinalizacion.php
 * @description
 * Actualiza la fecha de finalización de un reporte en la base de datos.
 * Recibe un JSON con los campos:
 *  - folio (int): identificador del reporte
 *  - fechaFinalizada (string): fecha en formato ISO (YYYY-MM-DD)
 *
 * Flujo:
 *  1. Incluir conexión a la BD y configurar header JSON.
 *  2. Conectar a la base de datos.
 *  3. Leer y decodificar JSON de entrada.
 *  4. Validar que ambos parámetros estén presentes.
 *  5. Verificar que el folio exista en la tabla `Reporte`.
 *  6. Actualizar `FechaFinalizada` con consulta preparada.
 *  7. Devolver respuesta JSON con estado y mensaje.
 *  8. Manejar excepciones y errores de consulta.
 *
 * Requiere:
 *  - conexion.php con la clase LocalConector::conectar()
 *  - Tabla `Reporte` con columnas `FolioReportes` y `FechaFinalizada`
 *  - Extensión MySQLi habilitada
 */

include_once("conexion.php"); // 🔥 Conexión a la BD
header("Content-Type: application/json"); // Respuesta en JSON

try {
    /* ─────────────────────────────────────────
       2. Conectar a la base de datos
    ───────────────────────────────────────── */
    $con  = new LocalConector();
    $conn = $con->conectar();

    /* ─────────────────────────────────────────
       3. Leer los datos enviados desde JavaScript
    ───────────────────────────────────────── */
    $data             = json_decode(file_get_contents("php://input"), true);
    $folio            = $data["folio"] ?? null;
    $fechaFinalizada  = $data["fechaFinalizada"] ?? null;

    /* ─────────────────────────────────────────
       4. Validar que los datos no estén vacíos
    ───────────────────────────────────────── */
    if (!$folio || !$fechaFinalizada) {
        echo json_encode([
            "status"  => "error",
            "message" => "Datos inválidos: Faltan parámetros"
        ]);
        exit;
    }

    /* ─────────────────────────────────────────
       5. Verificar si el folio existe en la BD
    ───────────────────────────────────────── */
    $checkQuery = $conn->prepare("SELECT FolioReportes FROM Reporte WHERE FolioReportes = ?");
    $checkQuery->bind_param("i", $folio);
    $checkQuery->execute();
    $checkQuery->store_result();
    if ($checkQuery->num_rows === 0) {
        echo json_encode([
            "status"  => "error",
            "message" => "El reporte con ese folio no existe"
        ]);
        exit;
    }
    $checkQuery->close();

    /* ─────────────────────────────────────────
       6. Actualizar la fecha de finalización
    ───────────────────────────────────────── */
    $query = $conn->prepare("UPDATE Reporte SET FechaFinalizada = ? WHERE FolioReportes = ?");
    $query->bind_param("si", $fechaFinalizada, $folio);

    if ($query->execute()) {
        if ($query->affected_rows > 0) {
            echo json_encode([
                "status"  => "success",
                "message" => "Fecha de finalización guardada correctamente"
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "No se realizaron cambios en la base de datos"
            ]);
        }
    } else {
        echo json_encode([
            "status"  => "error",
            "message" => "Error en la consulta: " . $query->error
        ]);
    }

    /* ─────────────────────────────────────────
       7. Cerrar conexiones
    ───────────────────────────────────────── */
    $query->close();
    $conn->close();

} catch (Exception $e) {
    /* ─────────────────────────────────────────
       8. Manejo de excepciones
    ───────────────────────────────────────── */
    echo json_encode([
        "status"  => "error",
        "message" => "Error en el servidor: " . $e->getMessage()
    ]);
}
