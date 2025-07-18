<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

ob_start();
header('Content-Type: application/json');
include_once 'conexionContencion.php';

if (!isset($_FILES['pdf'], $_POST['folio'], $_POST['subidoPor'])) {
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => 'Faltan datos']);
    exit;
}

$folio    = intval($_POST['folio']);
$subidoPor= trim($_POST['subidoPor']);
$archivo  = $_FILES['pdf'];

if ($archivo['error'] !== UPLOAD_ERR_OK) {
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => 'Error al subir el archivo']);
    exit;
}

if ($archivo['type'] !== 'application/pdf') {
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => 'El archivo debe ser un PDF']);
    exit;
}

if ($archivo['size'] > 5 * 1024 * 1024) {
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => 'El archivo excede los 5MB']);
    exit;
}

$nombreFinal = uniqid() . '_' . basename($archivo['name']);
$rutaDestino = __DIR__ . '/uploads/pdf/' . $nombreFinal;

if (!move_uploaded_file($archivo['tmp_name'], $rutaDestino)) {
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => 'No se pudo guardar el archivo']);
    exit;
}

$con = (new LocalConector())->conectar();
$stmt = $con->prepare("
    INSERT INTO MetodoTrabajo (FolioCaso, RutaArchivo, SubidoPor)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      RutaArchivo = VALUES(RutaArchivo),
      SubidoPor   = VALUES(SubidoPor)
");
$stmt->bind_param("iss", $folio, $nombreFinal, $subidoPor);

if ($stmt->execute()) {
    ob_clean();
    echo json_encode(['status' => 'success', 'filename' => $nombreFinal]);
} else {
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => 'Error al guardar en BD']);
}

$stmt->close();
