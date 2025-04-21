<?php
include_once("conexion.php"); // 🔥 Conexión a la BD
header("Content-Type: application/json");

try {
    $con = new LocalConector();
    $conn = $con->conectar();

    $data = json_decode(file_get_contents("php://input"), true);
    $folio = $data["folio"] ?? null;
    $fechaFinalizada = $data["fechaFinalizada"] ?? null;

    if (!$folio || !$fechaFinalizada) {
        echo json_encode(["status" => "error", "message" => "Datos inválidos: Faltan parámetros"]);
        exit;
    }

    // ✅ Verificar si ya está finalizado
    $check = $conn->prepare("SELECT FechaFinalizada FROM Reporte WHERE FolioReportes = ?");
    $check->bind_param("i", $folio);
    $check->execute();
    $result = $check->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(["status" => "error", "message" => "El reporte con ese folio no existe"]);
        exit;
    }

    $row = $result->fetch_assoc();
    if (!empty($row['FechaFinalizada'])) {
        echo json_encode(["status" => "error", "message" => "Este reporte ya fue finalizado el " . $row['FechaFinalizada']]);
        exit;
    }
    $check->close();

    // ✅ Actualizar si no ha sido finalizado aún
    $query = $conn->prepare("UPDATE Reporte SET FechaFinalizada = ? WHERE FolioReportes = ?");
    $query->bind_param("si", $fechaFinalizada, $folio);

    if ($query->execute()) {
        echo json_encode(["status" => "success", "message" => "Fecha de finalización guardada correctamente"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error en la consulta: " . $query->error]);
    }

    $query->close();
    $conn->close();
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
}
