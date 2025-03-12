<?php
session_start();
include_once("conexion.php"); // 🔥 Conexión a la BD

header('Content-Type: application/json');

// 🔹 Verificar si el usuario está autenticado
if (!isset($_SESSION['NumNomina'])) {
    echo json_encode(["status" => "error", "message" => "No has iniciado sesión."]);
    exit;
}

// 🔹 Obtener los datos enviados desde el frontend
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['IdArea'], $data['Descripcion']) || empty(trim($data['Descripcion']))) {
    echo json_encode(["status" => "error", "message" => "Faltan datos obligatorios."]);
    exit;
}

// 🔹 Datos del usuario
$NumNomina = $_SESSION['NumNomina'];
$IdArea = intval($data['IdArea']);
$Descripcion = trim($data['Descripcion']);
$IdEncargado = isset($data['IdEncargado']) ? intval($data['IdEncargado']) : NULL;
$FechaRegistro = date("Y-m-d H:i:s"); // Hora actual
$IdEstatus = 1; // Estado inicial (ejemplo: 1 = "Pendiente")
$Comentarios = NULL;

// 🔹 Insertar el reporte en la base de datos
try {
    $con = new LocalConector();
    $conn = $con->conectar();

    $query = $conn->prepare("INSERT INTO Reporte (NumeroNomina, IdEncargado, FechaRegistro, Descripcion, IdEstatus, IdArea, Comentarios) 
                             VALUES (?, ?, ?, ?, ?, ?, ?)");

    $query->bind_param("iisssis", $NumNomina, $IdEncargado, $FechaRegistro, $Descripcion, $IdEstatus, $IdArea, $Comentarios);

    if ($query->execute()) {
        echo json_encode(["status" => "success", "message" => "Reporte enviado correctamente."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error al enviar el reporte."]);
    }

    $query->close();
    $conn->close();
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
}

