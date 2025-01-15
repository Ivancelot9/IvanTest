<?php
require_once 'usuario.php';
header('Content-Type: application/json');

try{
    //Obtener datos enviados por POST
    $nombre = isset($_POST["Nombre"]) ? $_POST["Nombre"] : '';
    $numNomina = isset($_POST["NumNomina"]) ? $_POST["NumNomina"] : '';
    $contrasena = isset($_POST["Contrasena"]) ? $_POST["Contrasena"] : '';

    if(empty($nombre) || empty($numNomina) || empty($contrasena)){
        echo json_encode(['status' => 'error', 'message' => 'Todos los campos son obligatorios']);
        exit;
    }

    $usuario = new usuario();

    //Verificar si el numero de nomina ya existe
    if ($usuario->existeNumNomina($numNomina)) {
        echo json_encode(['status' => 'error', 'message' => 'El numero de nomina ya se encuentra registrado']);
        exit;
    }

    //Registrar el usuario
    if ($usuario->registrarUsuario($nombre, $numNomina, $contrasena)) {
        echo json_encode(['status' => 'succes', 'message' => 'Usuario registrado correctamente']);
    }else{
        echo json_encode(['status' => 'error', 'message' => 'Error al registrar usuario']);
    }
}catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error en el servidor: ' . $e->getMessage()]);
}
