<?php
include_once("conexion.php");
header('Content-Type: application/json');

// Verificar si se enviaron los datos necesarios
$data = json_decode(file_get_contents("php://input"), true);
if (isset($data['nomina'], $data['nombre'])) {
    $nomina = trim($data['nomina']);
    $nombre = trim($data['nombre']);

    if (empty($nombre)) {
        echo json_encode(['status' => 'error', 'message' => 'El nombre no puede estar vacío.']);
        exit;
    }

    try {
        $con = new LocalConector();
        $conex = $con->conectar();

        if (!$conex) {
            echo json_encode(['status' => 'error', 'message' => 'Error al conectar con la base de datos.']);
            exit;
        }

        // Actualizar datos del usuario
        $query = $conex->prepare("UPDATE Usuario SET Nombre = ? WHERE IdUsuario = ?");
        $query->bind_param("ss", $nombre, $nomina);
        $resultado = $query->execute();

        if ($resultado) {
            echo json_encode(['status' => 'success', 'message' => 'Usuario actualizado correctamente.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'No se pudo actualizar el usuario.']);
        }

        $query->close();
        $conex->close();
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Error en el servidor: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Datos incompletos para la actualización.']);
}
?>

