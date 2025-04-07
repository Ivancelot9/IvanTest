<?php
include_once("conexion.php"); // 🔥 Conexión a la BD
header('Content-Type: application/json');

// 🔹 Obtener los datos enviados desde el frontend
$data = json_decode(file_get_contents("php://input"), true);

// Verificar si se han recibido los datos necesarios
if (!isset($data['FolioReportes'], $data['Comentario']) || empty(trim($data['Comentario']))) {
    echo json_encode(["status" => "error", "message" => "Faltan datos obligatorios."]);
    exit;
}

// Sanitizar los datos para evitar posibles problemas con entradas maliciosas
$folio = intval($data['FolioReportes']); // Aseguramos que FolioReportes sea un número entero
$comentario = trim($data['Comentario']); // Eliminar espacios extra al principio y al final del comentario

// Verificar que el FolioReportes sea un número válido
if ($folio <= 0) {
    echo json_encode(["status" => "error", "message" => "Folio inválido."]);
    exit;
}

try {
    $con = new LocalConector();
    $conn = $con->conectar();

    // 🔹 Usar una consulta preparada para evitar inyecciones SQL
    $query = $conn->prepare("UPDATE Reporte SET Comentarios = CONCAT(IFNULL(Comentarios, ''), ?, '\n') WHERE FolioReportes = ?");

    // 🔹 Asociar los parámetros correctamente
    $query->bind_param("si", $comentario, $folio);

    // Ejecutar la consulta
    if ($query->execute()) {
        echo json_encode(["status" => "success", "message" => "Comentario agregado correctamente."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error al agregar comentario."]);
    }

    // Cerrar la consulta y la conexión
    $query->close();
    $conn->close();
} catch (Exception $e) {
    // Manejo de excepciones para errores en el servidor
    echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
}
