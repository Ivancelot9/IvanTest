<?php

include_once("conexion.php"); // 🔥 Conexión a la BD
header('Content-Type: application/json');

// 🔹 Validar que se envió un folio válido
if (!isset($_GET['FolioReportes'])) {
    echo json_encode(["status" => "error", "message" => "Folio no proporcionado."]);
    exit;
}

$folio = intval($_GET['FolioReportes']);

try {
    $con = new LocalConector();
    $conn = $con->conectar();

    // 🔹 Obtener comentarios de la BD
    $query = $conn->prepare("SELECT Comentarios FROM Reporte WHERE FolioReportes = ?");
    $query->bind_param("i", $folio);
    $query->execute();
    $result = $query->get_result();

    if ($row = $result->fetch_assoc()) {
        $comentarios = explode("\n", trim($row['Comentarios'])); // 📌 Convertir texto en array
        echo json_encode(["status" => "success", "comentarios" => $comentarios]);
    } else {
        echo json_encode(["status" => "error", "message" => "No se encontraron comentarios."]);
    }

    $query->close();
    $conn->close();
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
}
