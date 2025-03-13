<?php
include_once("conexion.php"); // 🔥 Conexión a la BD
header('Content-Type: application/json');

// 🔹 Obtener los datos enviados desde el frontend
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['NumNomina'], $data['IdArea'], $data['Descripcion']) || empty(trim($data['Descripcion']))) {
    echo json_encode(["status" => "error", "message" => "Faltan datos obligatorios."]);
    exit;
}

// 🔹 Datos del usuario (recibidos desde el frontend)
$NumNomina = trim($data['NumNomina']);
$IdArea = intval($data['IdArea']);
$Descripcion = trim($data['Descripcion']);
$IdEncargado = !empty($data['IdEncargado']) ? intval($data['IdEncargado']) : NULL;

$FechaRegistro = date("Y-m-d H:i:s"); // Hora actual
$IdEstatus = 1; // Estado inicial (Pendiente)
$Comentarios = NULL;

try {
    $con = new LocalConector();
    $conn = $con->conectar();

    // 🔥 Verificar si el Número de Nómina existe en la tabla Usuario
    $stmt = $conn->prepare("SELECT NumeroNomina FROM Usuario WHERE NumeroNomina = ?");
    $stmt->bind_param("s", $NumNomina);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(["status" => "error", "message" => "Número de nómina inválido o inexistente."]);
        exit;
    }

    $stmt->close();

    // 🔹 Insertar el reporte en la base de datos
    $query = $conn->prepare("INSERT INTO Reporte (NumeroNomina, IdEncargado, FechaRegistro, Descripcion, IdEstatus, IdArea, Comentarios) 
                             VALUES (?, ?, ?, ?, ?, ?, ?)");

    // 🔹 Si `IdEncargado` es NULL, se usa `bind_param` diferente
    if ($IdEncargado === NULL) {
        $query->bind_param("isssiss", $NumNomina, $IdEncargado, $FechaRegistro, $Descripcion, $IdEstatus, $IdArea, $Comentarios);
    } else {
        $query->bind_param("iisssis", $NumNomina, $IdEncargado, $FechaRegistro, $Descripcion, $IdEstatus, $IdArea, $Comentarios);
    }

    if ($query->execute()) {
        echo json_encode(["status" => "success", "message" => "Reporte enviado correctamente."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error al enviar el reporte: " . $query->error]);
    }

    $query->close();
    $conn->close();
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
}
