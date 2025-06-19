<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
session_start();
header('Content-Type: application/json; charset=UTF-8');

include_once 'conexionContencion.php';

try {
    // 1) Validar método POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }

    // 2) Obtener usuario por tab_id desde sesión
    $tab_id = $_GET['tab_id'] ?? '';
    if (
        empty($tab_id) ||
        !isset($_SESSION['usuariosPorPestana'][$tab_id]['Username'])
    ) {
        throw new Exception('Sesión inválida: usuario no encontrado.');
    }
    $username = $_SESSION['usuariosPorPestana'][$tab_id]['Username'];

    // 2b) Obtener IdUsuario desde base de datos
    $conUser = (new LocalConector())->conectar();
    $stmtUser = $conUser->prepare("SELECT IdUsuario FROM Usuario WHERE Username = ?");
    if (!$stmtUser) {
        throw new Exception('Error preparando SELECT usuario: ' . $conUser->error);
    }
    $stmtUser->bind_param("s", $username);
    $stmtUser->execute();
    $stmtUser->bind_result($idUsuario);
    if (!$stmtUser->fetch()) {
        throw new Exception("Usuario \"$username\" no existe en BD.");
    }
    $stmtUser->close();
    $conUser->close();

    // 3) Validar campos requeridos generales (excepto defectos)
    $campos = [
        'Responsable', 'NumeroParte', 'Cantidad',
        'IdTerceria', 'IdCommodity', 'IdProveedor'
    ];
    foreach ($campos as $c) {
        if (!isset($_POST[$c]) || trim($_POST[$c]) === '') {
            throw new Exception("Falta el campo $c");
        }
    }

    // 4) Recoger datos del formulario
    $responsable = trim($_POST['Responsable']);
    $numeroParte = trim($_POST['NumeroParte']);
    $cantidad = floatval(str_replace(',', '.', $_POST['Cantidad']));
    $descripcion = trim($_POST['Descripcion'] ?? '');
    $idTerceria = intval($_POST['IdTerceria']);
    $idCommodity = intval($_POST['IdCommodity']);
    $idProveedor = intval($_POST['IdProveedor']);
    $estatus = 1; // Valor fijo por defecto

    // 5) Insertar el nuevo caso
    $con = (new LocalConector())->conectar();
    $sql = "
        INSERT INTO Casos
            (IdUsuario, NumeroParte, Cantidad, Descripcion,
            IdTerceria, IdCommodity, IdProveedor, IdEstatus, Responsable)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ";
    $stmt = $con->prepare($sql);
    if (!$stmt) {
        throw new Exception('Error preparando INSERT Casos: ' . $con->error);
    }
    $stmt->bind_param(
        "isdsiiiis",
        $idUsuario,
        $numeroParte,
        $cantidad,
        $descripcion,
        $idTerceria,
        $idCommodity,
        $idProveedor,
        $estatus,
        $responsable
    );
    if (!$stmt->execute()) {
        throw new Exception('Error ejecutando INSERT Casos: ' . $stmt->error);
    }
    $folioCaso = $stmt->insert_id;
    $stmt->close();

    // 6) Preparar carpetas de subida
    $baseDir = __DIR__ . '/uploads';
    $okDir = "$baseDir/ok";
    $noDir = "$baseDir/no";
    foreach ([$okDir, $noDir] as $dir) {
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
    }

    // 7) Validar y procesar los defectos
    if (!isset($_POST['defectos']) || !is_array($_POST['defectos'])) {
        throw new Exception('No se recibieron defectos.');
    }

    foreach ($_POST['defectos'] as $index => $bloque) {
        $idDefecto = intval($bloque['idDefecto'] ?? 0);
        if ($idDefecto <= 0) {
            throw new Exception("Defecto inválido en el bloque $index.");
        }

        // Insertar el defecto en DefectosCaso
        $stmtDef = $con->prepare("
            INSERT INTO DefectosCaso (FolioCaso, IdDefectos)
            VALUES (?, ?)
        ");
        $stmtDef->bind_param("ii", $folioCaso, $idDefecto);
        if (!$stmtDef->execute()) {
            throw new Exception('Error insertando DefectoCaso: ' . $stmtDef->error);
        }
        $idDefectoCaso = $stmtDef->insert_id;
        $stmtDef->close();

        // Subir la foto OK
        subirFotoDefecto(
            $_FILES['defectos']['name'][$index]['fotoOk'] ?? '',
            $_FILES['defectos']['tmp_name'][$index]['fotoOk'] ?? '',
            'ok',
            $folioCaso,
            $idDefectoCaso,
            $okDir,
            $con
        );

        // Subir la foto NO OK
        subirFotoDefecto(
            $_FILES['defectos']['name'][$index]['fotoNo'] ?? '',
            $_FILES['defectos']['tmp_name'][$index]['fotoNo'] ?? '',
            'no',
            $folioCaso,
            $idDefectoCaso,
            $noDir,
            $con
        );
    }

    // 8) Función para subir cada foto y registrarla
    function subirFotoDefecto($nombre, $tmp, $tipo, $folio, $idDefectoCaso, $destDir, $con)
    {
        if (empty($tmp) || empty($nombre)) return;

        $nombreSeguro = basename($nombre);
        $nombreFinal = uniqid() . "_{$nombreSeguro}";
        $rutaFinal = "$destDir/$nombreFinal";

        if (!move_uploaded_file($tmp, $rutaFinal)) {
            throw new Exception("No se pudo subir la foto $tipo para defecto.");
        }

        $ins = $con->prepare("
            INSERT INTO Fotos (FolioCaso, IdDefectoCaso, TipoFoto, Ruta)
            VALUES (?, ?, ?, ?)
        ");
        $ins->bind_param("iiss", $folio, $idDefectoCaso, $tipo, $nombreFinal);
        if (!$ins->execute()) {
            throw new Exception('Error insertando foto: ' . $ins->error);
        }
        $ins->close();
    }

    // 9) Obtener texto de Estatus y nombre de Terciaria para respuesta
    function lookup(mysqli $c, string $table, string $idField, string $nameField, int $id)
    {
        $sql = "SELECT $nameField FROM $table WHERE $idField = ?";
        $st = $c->prepare($sql);
        $st->bind_param("i", $id);
        $st->execute();
        $st->bind_result($n);
        $st->fetch();
        $st->close();
        return $n;
    }

    $estatusText = lookup($con, 'Estatus', 'IdEstatus', 'NombreEstatus', $estatus);
    $terciariaNombre = lookup($con, 'Terceria', 'IdTerceria', 'NombreTerceria', $idTerceria);

    // 10) Devolver JSON
    echo json_encode([
        'status' => 'success',
        'message' => "Caso #{$folioCaso} guardado correctamente.",
        'folio' => $folioCaso,
        'fecha' => date('Y-m-d'),
        'estatus' => $estatusText,
        'responsable' => $responsable,
        'terciaria' => $terciariaNombre
    ]);
    exit;

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
    exit;
}
