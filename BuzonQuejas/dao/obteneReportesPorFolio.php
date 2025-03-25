<?php
include_once 'conexion.php'; // Asegúrate que aquí sí se defina $conn

if (!isset($_GET['folio'])) {
    echo json_encode(["error" => "Folio no especificado"]);
    exit;
}

$folio = intval($_GET['folio']); // Asegura que sea un número entero

if (!isset($conn)) {
    echo json_encode(["error" => "No se pudo establecer conexión con la base de datos"]);
    exit;
}

$sql = "SELECT * FROM Reporte WHERE FolioReportes = ?";
$stmt = $conn->prepare($sql);

if ($stmt) {
    $stmt->bind_param("i", $folio);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $result->num_rows > 0) {
        $reporte = $result->fetch_assoc();
        echo json_encode($reporte);
    } else {
        echo json_encode(["error" => "Reporte no encontrado"]);
    }

    $stmt->close();
} else {
    echo json_encode(["error" => "Error al preparar la consulta"]);
}

$conn->close();

