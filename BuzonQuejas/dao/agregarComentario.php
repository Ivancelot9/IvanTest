<?php
/* --- PHP: agregarComentario.php ---
 *
 * @file agregarComentario.php
 * @description
 * Añade un nuevo comentario a un reporte existente en la base de datos.
 * Recibe un JSON con las claves:
 *   - FolioReportes (int): identificador del reporte
 *   - Comentario (string): texto del comentario
 *
 * Flujo:
 *  1. Leer y decodificar JSON de entrada
 *  2. Validar existencia y formato de los datos
 *  3. Conectar a la BD usando LocalConector
 *  4. Ejecutar UPDATE preparado para concatenar comentario
 *  5. Devolver respuesta JSON con status
 *
 * Requiere:
 *  - conexion.php que define LocalConector::conectar()
 *  - Tabla `Reporte` con campos `Comentarios` y `FolioReportes`
 *  - Extensión MySQLi habilitada
 */

include_once("conexion.php"); // 🔥 Conexión a la BD
header('Content-Type: application/json');

/* ─────────────────────────────────────────
   1. Leer y decodificar JSON de entrada
───────────────────────────────────────── */
$data = json_decode(file_get_contents("php://input"), true);

/* ─────────────────────────────────────────
   2. Validar datos obligatorios
───────────────────────────────────────── */
if (!isset($data['FolioReportes'], $data['Comentario']) || empty(trim($data['Comentario']))) {
    echo json_encode(["status" => "error", "message" => "Faltan datos obligatorios."]);
    exit;
}

/* ─────────────────────────────────────────
   3. Sanitizar y validar formatos
───────────────────────────────────────── */
$folio      = intval($data['FolioReportes']);        // Asegurar entero
$comentario = trim($data['Comentario']);             // Quitar espacios extra
if ($folio <= 0) {
    echo json_encode(["status" => "error", "message" => "Folio inválido."]);
    exit;
}

try {
    /* ─────────────────────────────────────────
       4. Conectar y preparar consulta
    ────────────────────────────────────────── */
    $con = new LocalConector();
    $conn = $con->conectar();

    $query = $conn->prepare(
        "UPDATE Reporte
         SET Comentarios = CONCAT(IFNULL(Comentarios, ''), ?, '\n')
         WHERE FolioReportes = ?"
    );
    $query->bind_param("si", $comentario, $folio);

    /* ─────────────────────────────────────────
       5. Ejecutar y enviar respuesta
    ────────────────────────────────────────── */
    if ($query->execute()) {
        echo json_encode(["status" => "success", "message" => "Comentario agregado correctamente."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error al agregar comentario."]);
    }

    $query->close();
    $conn->close();
} catch (Exception $e) {
    /* ─────────────────────────────────────────
       6. Manejo de excepciones
    ────────────────────────────────────────── */
    echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
}

