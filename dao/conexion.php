<?php

class LocalConector{

    private $host = "127.0.0.1:3306";

    private $usuario = "u909553968_IvanM";

    private $password = "Ivan91482";

    private $database = "u909553968_PruebasIvan";

    private $conexion;

    public function conectar(){
        $this->conexion = mysqli_connect($this->host, $this->usuario, $this->password, $this->database);
        if($this->conexion->connect_error){
            die("Error al conectar con la base de datos");
        }
        return $this->conexion;
    }
}