<?php
session_start();
include_once("conexion.php");
header('Content-Type: application/json');

// ✅ Asegúrate de que venga el tab_id
if (!isset($_GET['tab_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Falta tab_id.']);
    exit;
}

$tab_id = $_GET['tab_id'];

// ✅ Verificar que exista la sesión de esa pestaña
if (!isset($_SESSION['usuariosPorPestana'][$tab_id])) {
    echo json_encode(['status' => 'error', 'message' => 'Sesión no encontrada.']);
    exit;
}

$NumNomina = $_SESSION['usuariosPorPestana'][$tab_id]['NumNomina'];

try {
    $con = new LocalConector();
    $conex = $con->conectar();

    $query = $conex->prepare("SELECT Nombre, NumeroNomina FROM Usuario WHERE NumeroNomina = ?");
    $query->bind_param("s", $NumNomina);
    $query->execute();
    $result = $query->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        echo json_encode(['status' => 'success', 'nombre' => $user['Nombre'], 'nomina' => $user['NumeroNomina']]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Usuario no encontrado.']);
    }

    $query->close();
    $conex->close();
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error en el servidor: ' . $e->getMessage()]);
}
