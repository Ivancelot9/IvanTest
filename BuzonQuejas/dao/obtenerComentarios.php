<?php
/* --- PHP: obtenerComentarios.php ---
 *
 * @file obtenerComentarios.php
 * @description
 * Recupera los comentarios de un reporte específico almacenados en un solo campo,
 * los separa por saltos de línea y devuelve un JSON con:
 *  - status: "success" o "error"
 *  - comentarios: array de cadenas (si success)
 *  - message: texto de error (si error)
 *
 * Flujo:
 *  1. Incluir conexión a la BD y configurar el header JSON.
 *  2. Validar que se reciba GET "FolioReportes".
 *  3. Sanitizar el folio convirtiéndolo a entero.
 *  4. Conectar a la base de datos usando LocalConector.
 *  5. Preparar y ejecutar SELECT para obtener el campo Comentarios.
 *  6. Si existe, dividir el texto en un array por "\n" y devolverlo.
 *  7. Si no existe fila, devolver error.
 *  8. Capturar excepciones y devolver JSON de error.
 *
 * Requiere:
 *  - conexion.php con clase LocalConector::conectar()
 *  - Tabla `Reporte` con columnas `FolioReportes` y `Comentarios`
 *  - Extensión MySQLi habilitada
 */

include_once("conexion.php"); // 🔥 Conexión a la BD
header('Content-Type: application/json');

// 2. Validar que se envíe GET 'FolioReportes'
if (!isset($_GET['FolioReportes'])) {
    echo json_encode(["status" => "error", "message" => "Folio no proporcionado."]);
    exit;
}
// 3. Sanitizar folio
$folio = intval($_GET['FolioReportes']);

try {
    // 4. Conectar a la BD
    $con = new LocalConector();
    $conn = $con->conectar();

    // 5. Preparar y ejecutar SELECT de Comentarios
    $query = $conn->prepare("SELECT Comentarios FROM Reporte WHERE FolioReportes = ?");
    $query->bind_param("i", $folio);
    $query->execute();
    $result = $query->get_result();

    // 6. Procesar resultado
    if ($row = $result->fetch_assoc()){
        // Dividir el texto en líneas y devolver array

        $comentarios = explode("\n", trim($row['Comentarios'])); // 📌 Convertir texto en array
        echo json_encode(["status" => "success", "comentarios" => $comentarios]);
    } else {
        // 7. No se encontró el reporte
        echo json_encode(["status" => "error", "message" => "No se encontraron comentarios."]);
    }

    $query->close();
    $conn->close();
} catch (Exception $e) {
    // 8. Manejar excepciones
    echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
}
