<?php
session_start();
include_once("conexion.php"); // 🔥 Asegura que solo se incluya una vez

header('Content-Type: application/json');

$conector = new LocalConector();
$conn = $conector->conectar();

$sql = "SELECT IdEncargado, NombreEncargado, Tipo FROM Encargado ORDER BY Tipo, NombreEncargado";
$result = $conn->query($sql);

$encargados = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $encargados[] = $row;
    }
}

echo json_encode($encargados);

$conn->close();
?>
