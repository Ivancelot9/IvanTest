<?php
include_once("conexion.php");

// 📌 Leer el JSON enviado por la solicitud
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['nomina'], $data['nombre'])) {
    echo json_encode(['status' => 'error', 'message' => 'Faltan datos para la actualización.']);
    exit;
}

$nomina = trim($data['nomina']);
$nombre = trim($data['nombre']);

if (empty($nombre)) {
    echo json_encode(['status' => 'error', 'message' => 'El nombre no puede estar vacío.']);
    exit;
}

try {
    // 📌 Conectar con la BD
    $con = new LocalConector();
    $conex = $con->conectar();

    if (!$conex) {
        throw new Exception("Error al conectar con la base de datos.");
    }

    // 📌 Actualizar el nombre en la tabla `Usuario`
    $query = $conex->prepare("UPDATE Usuario SET Nombre = ? WHERE NumeroNomina = ?");
    $query->bind_param("ss", $nombre, $nomina);
    $resultado = $query->execute();

    if ($resultado) {
        echo json_encode(['status' => 'success', 'message' => 'Nombre actualizado correctamente.']);
    } else {
        throw new Exception("No se pudo actualizar el nombre.");
    }

    $query->close();
    $conex->close();
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error en el servidor: ' . $e->getMessage()]);
}
?>
