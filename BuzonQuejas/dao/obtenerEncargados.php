<?php
session_start();
include_once("conexion.php"); // 🔥 Incluir la conexión correctamente

header('Content-Type: application/json');

// Crear instancia de la conexión
$conector = new LocalConector();
$conn = $conector->conectar();

if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Error en la conexión a la base de datos"]);
    exit;
}

$sql = "SELECT IdEncargado, NombreEncargado, Tipo FROM Encargado ORDER BY Tipo, NombreEncargado";
$result = $conn->query($sql);

$encargados = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $encargados[] = $row;
    }
}

// Devolver los datos en formato JSON
echo json_encode($encargados);

$conn->close();
?>
