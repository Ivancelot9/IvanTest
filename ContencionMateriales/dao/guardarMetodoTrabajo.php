<?php
/**
 * @file guardarMetodoTrabajo.php
 * @project Contención de Materiales
 * @module DAO
 * @purpose Guardar PDF del Método de Trabajo
 * @description Este script recibe un archivo PDF vía POST desde el formulario externo,
 *              lo valida, lo almacena en el servidor en la carpeta `/uploads/pdf`,
 *              y guarda (o actualiza) la ruta y datos asociados en la tabla `MetodoTrabajo`.
 *
 * @dependencies
 *   - conexionContencion.php (Clase LocalConector para conexión a base de datos)
 *   - Directorio relativo: /uploads/pdf (Destino de archivos PDF)
 *   - Llamado por: subirMetodoTrabajoExterno.js
 *
 * @input
 *   - $_FILES['pdf']         → Archivo PDF subido por el usuario
 *   - $_POST['folio']        → Folio del caso al que pertenece el método
 *   - $_POST['subidoPor']    → Nombre del usuario que sube el archivo
 *
 * @output
 *   - JSON con 'status': 'success' o 'error' y mensaje de respuesta
 *
 * @author Ivan Medina/Hadbet Altamirano
 * @created Julio 2025
 * @updated [¿?]
 */

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

ob_start();  // 🔧 Habilita el buffer de salida para limpiar mensajes antes del JSON
header('Content-Type: application/json');
include_once 'conexionContencion.php';

// ✅ Validación de existencia de parámetros esperados
if (!isset($_FILES['pdf'], $_POST['folio'], $_POST['subidoPor'])) {
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => 'Faltan datos']);
    exit;
}

$folio    = intval($_POST['folio']);
$subidoPor= trim($_POST['subidoPor']);
$archivo  = $_FILES['pdf'];

// ⚠️ Validación de errores al subir el archivo
if ($archivo['error'] !== UPLOAD_ERR_OK) {
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => 'Error al subir el archivo']);
    exit;
}
// ⚠️ Validación del tipo MIME (solo PDFs)
if ($archivo['type'] !== 'application/pdf') {
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => 'El archivo debe ser un PDF']);
    exit;
}
// ⚠️ Validación de tamaño máximo (5MB)
if ($archivo['size'] > 5 * 1024 * 1024) {
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => 'El archivo excede los 5MB']);
    exit;
}
// 📂 Preparación del nombre final y ruta de destino
$nombreFinal = uniqid() . '_' . basename($archivo['name']);
$rutaDestino = __DIR__ . '/uploads/pdf/' . $nombreFinal;
// 📤 Mover archivo a carpeta /uploads/pdf
if (!move_uploaded_file($archivo['tmp_name'], $rutaDestino)) {
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => 'No se pudo guardar el archivo']);
    exit;
}
// 🔌 Conexión a la base de datos usando clase LocalConector
$con = (new LocalConector())->conectar();
$stmt = $con->prepare("
    INSERT INTO MetodoTrabajo (FolioCaso, RutaArchivo, SubidoPor)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      RutaArchivo = VALUES(RutaArchivo),
      SubidoPor   = VALUES(SubidoPor)
");
$stmt->bind_param("iss", $folio, $nombreFinal, $subidoPor);
// 📬 Respuesta JSON
if ($stmt->execute()) {
    ob_clean();
    echo json_encode(['status' => 'success', 'filename' => $nombreFinal]);
} else {
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => 'Error al guardar en BD']);
}

$stmt->close();
