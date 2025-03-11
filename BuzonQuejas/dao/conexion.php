<?php

//Clase para manejar la conexion a la Base de Datos
class LocalConector{

    //Propiedades de conexión
    private $host = "127.0.0.1:3306"; //Dirección del servidor (Se encuentra en la pagina de phpMyAdmin)
    private $usuario = "u909553968_IvanM"; //Usuario de la BD
    private $password = "Ivan91482";// Contra del Usuario
    private $database = "u909553968_PruebasIvan";
    private $conexion;


    //Metodo para establecer la conexion
    public function conectar(){
        date_default_timezone_set('America/Mexico_City'); // 🔥 Forzar la zona horaria en PHP
        $this->conexion = mysqli_connect($this->host, $this->usuario, $this->password, $this->database);
        if($this->conexion->connect_error){
            die("Error al conectar con la base de datos"); //Detiene si hay error
        }
        // 🔥 Ajustar la zona horaria SOLO en esta conexión
        $this->conexion->query("SET time_zone = '-06:00'");
        return $this->conexion;//Retorna el objeto de conexión
    }
}
