<?php
include_once("conexion.php"); // 🔥 Conexión a la BD
header('Content-Type: application/json');

// 🔹 Obtener los datos enviados desde el frontend
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['FolioReportes'], $data['Comentario']) || empty(trim($data['Comentario']))) {
    echo json_encode(["status" => "error", "message" => "Faltan datos obligatorios."]);
    exit;
}

$folio = intval($data['FolioReportes']);
$comentario = trim($data['Comentario']);

try {
    $con = new LocalConector();
    $conn = $con->conectar();

    // 🔹 Agregar comentario a la columna "Comentarios" en la tabla Reporte
    $query = $conn->prepare("UPDATE Reporte SET Comentarios = CONCAT(IFNULL(Comentarios, ''), ?, '\n') WHERE FolioReportes = ?");
    $query->bind_param("si", $comentario, $folio);

    if ($query->execute()) {
        echo json_encode(["status" => "success", "message" => "Comentario agregado correctamente."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error al agregar comentario."]);
    }

    $query->close();
    $conn->close();
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
}
