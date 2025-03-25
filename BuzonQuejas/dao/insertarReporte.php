<?php
// ✅ Encabezado para indicar que la respuesta será JSON
header("Content-Type: application/json");

// 🔹 Conexión a la base de datos y zona horaria
include_once("conexion.php");
date_default_timezone_set('America/Mexico_City');

// 🔹 Obtener los datos del cuerpo de la petición
$data = json_decode(file_get_contents("php://input"), true);

// 🔹 Validar datos obligatorios
if (
    !isset($data['NumNomina'], $data['IdArea'], $data['Descripcion']) ||
    empty(trim($data['Descripcion']))
) {
    echo json_encode([
        "status" => "error",
        "message" => "Faltan datos obligatorios."
    ]);
    exit;
}

// 🔹 Sanitizar datos
$NumNomina     = trim($data['NumNomina']);
$IdArea        = intval($data['IdArea']);
$Descripcion   = trim($data['Descripcion']);
$IdEncargado   = isset($data['IdEncargado']) && $data['IdEncargado'] !== "" ? intval($data['IdEncargado']) : null;
$FechaRegistro = date("Y-m-d H:i:s");
$Comentarios   = null;

try {
    $con = new LocalConector();
    $conn = $con->conectar();

    // 🔹 Preparar consulta SQL
    $query = $conn->prepare("
        INSERT INTO Reporte (NumeroNomina, IdEncargado, FechaRegistro, Descripcion, IdArea, Comentarios)
        VALUES (?, ?, ?, ?, ?, ?)
    ");

    // 🔹 Enlazar parámetros (NULL funciona con 'i' si se maneja correctamente)
    $query->bind_param("sissis", $NumNomina, $IdEncargado, $FechaRegistro, $Descripcion, $IdArea, $Comentarios);

    // 🔹 Ejecutar y responder
    if ($query->execute()) {
        $folioGenerado = $conn->insert_id;

        echo json_encode([
            "status" => "success",
            "message" => "Reporte enviado correctamente.",
            "folio"   => $folioGenerado,
            "fechaRegistro" => $FechaRegistro // ✅ Para que no aparezca "undefined" del lado del JS
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
