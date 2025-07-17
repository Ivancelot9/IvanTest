<?php
/**
 * @file agregarComponenteFormulario.php
 * @project Contención de Materiales
 * @module formularios
 * @purpose Insertar nuevo componente a catálogo desde el frontend
 * @description Este script recibe peticiones POST con datos para agregar un nuevo
 * elemento a un catálogo permitido (terciaria, proveedor, commodity, defecto).
 * Verifica la validez del tipo, conecta a la base de datos y devuelve el nuevo ID
 * generado junto al nombre insertado en formato JSON.
 * @author Ivan Medina / Hadbet Altamirano
 * @created Junio 2025
 * @updated Junio 2025
 *
 * @uso
 * Utilizado por: `agregarComponentesFormulario.js` mediante fetch() al dar clic en “Guardar”.
 * Se espera una petición POST con los campos:
 *  - type: tipo de catálogo (terciaria, proveedor, commodity, defecto)
 *  - name: nombre a insertar
 */

// 🟦 Iniciar sesión y conexión
session_start();
include_once "conexionContencion.php";
header('Content-Type: application/json; charset=UTF-8');

// 1️⃣ Solo aceptar método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'status' => 'error',
        'message' => 'Método no permitido.'
    ]);
    exit;
}

// 2️⃣ Verificar campos requeridos
$type = trim($_POST['type'] ?? '');
$name = trim($_POST['name'] ?? '');

if ($type === '' || $name === '') {
    echo json_encode([
        'status' => 'error',
        'message' => 'Faltan campos requeridos.'
    ]);
    exit;
}

// 3️⃣ Lista blanca de catálogos válidos (sin permitir responsable)
$catalogs = [
    'terciaria' => [
        'table' => 'Terceria',
        'col'   => 'NombreTerceria',
        'id'    => 'IdTerceria'
    ],
    'proveedor' => [
        'table' => 'Proveedores',
        'col'   => 'NombreProveedor',
        'id'    => 'IdProveedor'
    ],
    'commodity' => [
        'table' => 'Commodity',
        'col'   => 'NombreCommodity',
        'id'    => 'IdCommodity'
    ],
    'defecto' => [
        'table' => 'Defectos',
        'col'   => 'NombreDefectos',
        'id'    => 'IdDefectos'
    ]
];

// Validar tipo solicitado
if (!isset($catalogs[$type])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Tipo inválido.'
    ]);
    exit;
}

try {
    // 4️⃣ Conexión a la BD e inserción segura del nuevo valor
    $con = (new LocalConector())->conectar();

    $cfg = $catalogs[$type];
    $sql = "INSERT INTO {$cfg['table']} ({$cfg['col']}) VALUES (?)";
    $stmt = $con->prepare($sql);
    $stmt->bind_param("s", $name);
    $stmt->execute();
    $newId = $stmt->insert_id;
    $stmt->close();

    // 5️⃣ Enviar respuesta exitosa con ID nuevo
    echo json_encode([
        'status' => 'success',
        'id'     => $newId,
        'name'   => $name,
        'type'   => $type
    ]);

} catch (Exception $e) {
    // 🔴 Error de servidor
    echo json_encode([
        'status' => 'error',
        'message' => 'Error de servidor.'
    ]);
}
