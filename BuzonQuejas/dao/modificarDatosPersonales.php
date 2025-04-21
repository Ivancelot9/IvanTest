<?php
session_start();
include_once("conexion.php");
header("Content-Type: application/json");

// ✅ Validar que venga el tab_id
if (!isset($_GET['tab_id'])) {
    echo json_encode(["status" => "error", "message" => "Falta el tab_id."]);
    exit;
}

$tab_id = $_GET['tab_id'];

// ✅ Verificar que exista la sesión de esa pestaña
if (!isset($_SESSION['usuariosPorPestana'][$tab_id])) {
    echo json_encode(["status" => "error", "message" => "No has iniciado sesión correctamente."]);
    exit;
}

$NumNomina = $_SESSION['usuariosPorPestana'][$tab_id]['NumNomina'];

// Obtener los datos enviados por POST
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['nombre']) || empty(trim($data['nombre']))) {
    echo json_encode(["status" => "error", "message" => "El nombre no puede estar vacío."]);
    exit;
}

$nuevoNombre = trim($data['nombre']);

if (!is_numeric($NumNomina)) {
    echo json_encode(["status" => "error", "message" => "Número de nómina inválido."]);
    exit;
}

if (!preg_match("/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/", $nuevoNombre)) {
    echo json_encode(["status" => "error", "message" => "El nombre solo puede contener letras y espacios."]);
    exit;
}

$nuevoNombre = htmlspecialchars($nuevoNombre, ENT_QUOTES, 'UTF-8');

try {
    $con = new LocalConector();
    $conex = $con->conectar();

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
