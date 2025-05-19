<?php
session_start();
include_once "conexionContencion.php";
header('Content-Type: application/json; charset=UTF-8');

// 1) Solo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status'=>'error','message'=>'Método no permitido.']);
    exit;
}

// 2) Campos requeridos
$type = trim($_POST['type'] ?? '');
$name = trim($_POST['name'] ?? '');
if ($type === '' || $name === '') {
    echo json_encode(['status'=>'error','message'=>'Faltan campos requeridos.']);
    exit;
}

// 3) Lista blanca SIN responsable
$catalogs = [
    'terciaria' => ['table'=>'Terceria',    'col'=>'NombreTerceria',   'id'=>'IdTerceria'],
    'proveedor' => ['table'=>'Proveedores', 'col'=>'NombreProveedor',  'id'=>'IdProveedor'],
    'commodity' => ['table'=>'Commodity',   'col'=>'NombreCommodity',  'id'=>'IdCommodity'],
    'defecto'   => ['table'=>'Defectos',    'col'=>'NombreDefectos',   'id'=>'IdDefectos'],
];

if (!isset($catalogs[$type])) {
    echo json_encode(['status'=>'error','message'=>'Tipo inválido.']);
    exit;
}

try {
    $con = (new LocalConector())->conectar();

    // 4) Insert
    $cfg = $catalogs[$type];
    $sql = "INSERT INTO {$cfg['table']} ({$cfg['col']}) VALUES (?)";
    $stmt = $con->prepare($sql);
    $stmt->bind_param("s", $name);
    $stmt->execute();
    $newId = $stmt->insert_id;
    $stmt->close();

    // 5) Respuesta JSON
    echo json_encode([
        'status'=>'success',
        'id'    =>$newId,
        'name'  =>$name,
        'type'  =>$type
    ]);

} catch (Exception $e) {
    echo json_encode(['status'=>'error','message'=>'Error de servidor.']);
}
