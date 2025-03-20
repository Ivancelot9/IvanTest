<?php
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
        echo json_encode(["status" => "error", "message" => "Datos inválidos"]);
        exit;
    }

    // **Actualizar la fecha de finalización en la BD**
    $query = $conn->prepare("UPDATE Reporte SET FechaFinalizada = ? WHERE FolioReporte = ?");
    $query->bind_param("si", $fechaFinalizada, $folio);
    $query->execute();

    // **Verificar si se actualizó correctamente**
    if ($query->affected_rows > 0) {
        echo json_encode(["status" => "success", "message" => "Fecha de finalización guardada correctamente"]);
    } else {
        echo json_encode(["status" => "error", "message" => "No se encontró el reporte o ya estaba actualizado"]);
    }

    // **Cerrar conexiones**
    $query->close();
    $conn->close();
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
}


