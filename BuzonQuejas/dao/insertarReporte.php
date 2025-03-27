<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json");
include_once("conexion.php");
date_default_timezone_set('America/Mexico_City');

// Leer JSON del frontend
$data = json_decode(file_get_contents("php://input"), true);

// Validar datos requeridos
if (!isset($data['NumNomina'], $data['IdArea'], $data['Descripcion']) || empty(trim($data['Descripcion']))) {
    echo json_encode(["status" => "error", "message" => "Faltan datos obligatorios."]);
    exit;
}

// Asignar y sanitizar variables
$NumNomina = trim($data['NumNomina']);
$IdArea = intval($data['IdArea']);
$Descripcion = trim($data['Descripcion']);
$IdEncargado = !empty($data['IdEncargado']) ? intval($data['IdEncargado']) : null;
$IdShiftLeader = !empty($data['IdShiftLeader']) ? intval($data['IdShiftLeader']) : null;
$FechaRegistro = date("Y-m-d H:i:s");
$Comentarios = null;

try {
    $con = new LocalConector();
    $conn = $con->conectar();

    // ✅ Insertar el nuevo reporte con 7 campos
    $query = $conn->prepare("INSERT INTO Reporte 
        (NumeroNomina, IdEncargado, IdShiftLeader, FechaRegistro, Descripcion, IdArea, Comentarios) 
        VALUES (?, ?, ?, ?, ?, ?, ?)");

    $query->bind_param("siissis", $NumNomina, $IdEncargado, $IdShiftLeader, $FechaRegistro, $Descripcion, $IdArea, $Comentarios);

    if ($query->execute()) {
        $folioGenerado = $conn->insert_id;
        echo json_encode([
            "status" => "success",
            "message" => "Reporte enviado correctamente.",
            "folio" => $folioGenerado
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Error al enviar el reporte: " . $query->error
        ]);
    }

    $query->close();
    $conn->close();

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Error en el servidor: " . $e->getMessage()
    ]);
}
