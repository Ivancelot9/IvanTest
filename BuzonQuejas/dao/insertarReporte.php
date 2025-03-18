<?php
include_once("conexion.php"); // 🔥 Conexión a la BD
date_default_timezone_set('America/Mexico_City');

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
$Comentarios = NULL;

try {
    $con = new LocalConector();
    $conn = $con->conectar();

    // 🔹 Insertar el reporte en la base de datos (sin `IdEstatus`)
    $query = $conn->prepare("INSERT INTO Reporte (NumeroNomina, IdEncargado, FechaRegistro, Descripcion, IdArea, Comentarios) 
                             VALUES (?, ?, ?, ?, ?, ?)");

    // 🔥 `bind_param` se maneja igual en ambos casos, ya que NULL es aceptable en `i`
    $query->bind_param("sissis", $NumNomina, $IdEncargado, $FechaRegistro, $Descripcion, $IdArea, $Comentarios);

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

