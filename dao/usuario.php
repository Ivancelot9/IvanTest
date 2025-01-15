<?php
require_once 'LocalConector.php';

class Usuario{

    private $conexion;

    public function __construct(){
        $localConector = new LocalConector();
        $this->conexion = $localConector->conectar();
    }

    //Aqui se usa para registrar el usuario
    public function registrarUsuario($usuario, $numNomina, $contrasena){

        $hashedPassword = password_hash($contrasena, PASSWORD_DEFAULT);
        $query = "INSERT INTO usuarios (nombre, num_nomina, contrasena) VALUES (?, ?, ?)";
        $stmt = this->conexion->prepare($query);
        $stmt->bind_param('s', $numNomina);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        return $result['total']>0;
    }
}