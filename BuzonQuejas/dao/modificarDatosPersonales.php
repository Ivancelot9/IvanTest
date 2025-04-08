<?php
session_start();
include_once("conexion.php");
header("Content-Type: application/json");

// Verificar si el usuario ha iniciado sesión
if (!isset($_SESSION['NumNomina'])) {
    echo json_encode(["status" => "error", "message" => "No has iniciado sesión."]);
    exit;
}

// Obtener los datos enviados por POST
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['nombre']) || empty(trim($data['nombre']))) {
    echo json_encode(["status" => "error", "message" => "El nombre no puede estar vacío."]);
    exit;
}

$NumNomina = $_SESSION['NumNomina'];
$nuevoNombre = trim($data['nombre']);

// Validación adicional para $NumNomina (asegurarnos de que sea numérico)
if (!is_numeric($NumNomina)) {
    echo json_encode(["status" => "error", "message" => "Número de nómina inválido."]);
    exit;
}

// Sanitizar el nombre para evitar posibles problemas con caracteres especiales
$nuevoNombre = htmlspecialchars($nuevoNombre, ENT_QUOTES, 'UTF-8');

try {
    $con = new LocalConector();
    $conex = $con->conectar();

    // Actualizar el nombre en la BD
    $query = $conex->prepare("UPDATE Usuario SET Nombre = ? WHERE NumeroNomina = ?");
    $query->bind_param("ss", $nuevoNombre, $NumNomina);
    if ($query->execute()) {
        echo json_encode(["status" => "success", "message" => "Nombre actualizado correctamente."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error al actualizar el nombre."]);
    }

    $query->close();
    $conex->close();
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
}

