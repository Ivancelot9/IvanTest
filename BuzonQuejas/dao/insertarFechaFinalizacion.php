<?php
/* --- PHP: insertarFechaFinalizacion.php ---
 *
 * @file insertarFechaFinalizacion.php
 * @description
 * Actualiza la fecha de finalización de un reporte en la base de datos.
 * Recibe JSON con los campos:
 *  - folio (int): identificador del reporte
 *  - fechaFinalizada (string): fecha en formato ISO (YYYY-MM-DD)
 *
 * Flujo:
 *  1. Incluir conexión a la BD y configurar header JSON.
 *  2. Leer y decodificar JSON de entrada.
 *  3. Validar que ambos parámetros estén presentes.
 *  4. Verificar que el folio exista en la tabla `Reporte`.
 *  5. Ejecutar UPDATE preparado para setear `FechaFinalizada`.
 *  6. Enviar respuesta JSON con status y mensaje.
 *  7. Manejar excepciones y errores de consulta.
 *
 * Requiere:
 *  - conexion.php con clase LocalConector::conectar()
 *  - Tabla `Reporte` con columnas `FolioReportes` y `FechaFinalizada`
 *  - Extensión MySQLi habilitada
 */
include_once("conexion.php"); // 🔥 Conexión a la BD

header("Content-Type: application/json");

try {
    // **Conectar a la base de datos**
    $con = new LocalConector();
    $conn = $con->conectar();

    // **Leer los datos enviados desde JavaScript**
    $data = json_decode(file_get_contents("php://input"), true);
    $folio = $data["folio"] ?? null;
    $fechaFinalizada = $data["fechaFinalizada"] ?? null;

    // **Validar que los datos no estén vacíos**
    if (!$folio || !$fechaFinalizada) {
        echo json_encode(["status" => "error", "message" => "Datos inválidos: Faltan parámetros"]);
        exit;
    }

    // **Verificar si el folio existe en la BD**
    $checkQuery = $conn->prepare("SELECT FolioReportes FROM Reporte WHERE FolioReportes = ?");
    $checkQuery->bind_param("i", $folio);
    $checkQuery->execute();
    $checkQuery->store_result();

    if ($checkQuery->num_rows === 0) {
        echo json_encode(["status" => "error", "message" => "El reporte con ese folio no existe"]);
        exit;
    }
    $checkQuery->close();

    // **Actualizar la fecha de finalización en la BD**
    $query = $conn->prepare("UPDATE Reporte SET FechaFinalizada = ? WHERE FolioReportes = ?");
    $query->bind_param("si", $fechaFinalizada, $folio);

    if ($query->execute()) {
        if ($query->affected_rows > 0) {
            echo json_encode(["status" => "success", "message" => "Fecha de finalización guardada correctamente"]);
        } else {
            echo json_encode(["status" => "error", "message" => "No se realizaron cambios en la base de datos"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Error en la consulta: " . $query->error]);
    }

    // **Cerrar conexiones**
    $query->close();
    $conn->close();
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
}