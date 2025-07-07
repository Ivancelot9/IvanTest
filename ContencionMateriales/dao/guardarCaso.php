<?php
// Buffer para evitar salidas accidentales
ob_start();

// Sesión y cabecera JSON
session_start();
header('Content-Type: application/json; charset=UTF-8');

include_once 'conexionContencion.php';

try {
    // 1) Método
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }

    // 2) Sesión / tab_id
    $tab_id = $_GET['tab_id'] ?? '';
    if (empty($tab_id) || !isset($_SESSION['usuariosPorPestana'][$tab_id]['Username'])) {
        throw new Exception('Sesión inválida');
    }
    $username = $_SESSION['usuariosPorPestana'][$tab_id]['Username'];

    // 3) Usuario actual
    $conUser = (new LocalConector())->conectar();
    $stmtUser = $conUser->prepare("SELECT IdUsuario FROM Usuario WHERE Username = ?");
    $stmtUser->bind_param("s", $username);
    $stmtUser->execute();
    $stmtUser->bind_result($idUsuario);
    if (!$stmtUser->fetch()) {
        throw new Exception("Usuario no encontrado");
    }
    $stmtUser->close();
    $conUser->close();

    // 4) Validar campos obligatorios
    $required = ['Responsable', 'NumeroParte', 'Cantidad', 'IdTerceria', 'IdCommodity', 'IdProveedor'];
    foreach ($required as $campo) {
        if (empty($_POST[$campo])) {
            throw new Exception("Falta el campo: $campo");
        }
    }

    // 5) Datos del formulario
    $responsable = trim($_POST['Responsable']);
    $numeroParte = trim($_POST['NumeroParte']);
    $cantidad = floatval(str_replace(',', '.', $_POST['Cantidad']));
    $descripcion = $_POST['Descripcion'] ?? '';
    $idTerceria = intval($_POST['IdTerceria']);
    $idCommodity = intval($_POST['IdCommodity']);
    $idProveedor = intval($_POST['IdProveedor']);
    $estatus = 1;

    // 6) Insertar caso
    $con = (new LocalConector())->conectar();
    $stmt = $con->prepare("
        INSERT INTO Casos (IdUsuario, NumeroParte, Cantidad, Descripcion, IdTerceria, IdCommodity, IdProveedor, IdEstatus, Responsable)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->bind_param("isdsiiiis", $idUsuario, $numeroParte, $cantidad, $descripcion, $idTerceria, $idCommodity, $idProveedor, $estatus, $responsable);
    $stmt->execute();
    $folioCaso = $stmt->insert_id;
    $stmt->close();

    // 7) Crear carpetas si no existen (para Hostinger)
    $uploadBase = realpath(__DIR__) . '/uploads';
    $okDir = $uploadBase . '/ok';
    $noDir = $uploadBase . '/no';
    foreach ([$okDir, $noDir] as $carpeta) {
        if (!is_dir($carpeta)) {
            if (!mkdir($carpeta, 0755, true)) {
                throw new Exception("No se pudo crear la carpeta: $carpeta");
            }
        }
    }

    // 8) Procesar defectos
    if (!isset($_POST['defectos']) || !is_array($_POST['defectos'])) {
        throw new Exception('No se recibieron defectos');
    }

    foreach ($_POST['defectos'] as $i => $bloque) {
        $idDef = intval($bloque['idDefecto'] ?? 0);
        if ($idDef <= 0) {
            throw new Exception("Defecto inválido en bloque " . ($i + 1));
        }

        $stmtDef = $con->prepare("INSERT INTO DefectosCaso (FolioCaso, IdDefectos) VALUES (?, ?)");
        $stmtDef->bind_param("ii", $folioCaso, $idDef);
        $stmtDef->execute();
        $idDefCaso = $stmtDef->insert_id;
        $stmtDef->close();

        // Subir fotos
        subirFoto($i, 'fotoOk', 'ok', $folioCaso, $idDefCaso, $okDir, $con);
        subirFoto($i, 'fotoNo', 'no', $folioCaso, $idDefCaso, $noDir, $con);
    }

    // 9) Devolver JSON
    ob_clean();
    echo json_encode([
        'status' => 'success',
        'folio' => $folioCaso,
        'message' => "Caso guardado correctamente",
        'fecha' => date('Y-m-d'),
        'estatus' => lookup($con, 'Estatus', 'IdEstatus', 'NombreEstatus', $estatus),
        'responsable' => $responsable,
        'terciaria' => lookup($con, 'Terceria', 'IdTerceria', 'NombreTerceria', $idTerceria)
    ]);
    exit;

} catch (Exception $e) {
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    exit;
}

// 🔧 Subir archivo
function subirFoto($idx, $campo, $tipo, $folio, $idDefCaso, $dir, $con) {
    if (
        !isset($_FILES['defectos']['tmp_name'][$idx][$campo]) ||
        $_FILES['defectos']['error'][$idx][$campo] !== UPLOAD_ERR_OK
    ) {
        return;
    }

    $original = basename($_FILES['defectos']['name'][$idx][$campo]);
    $nombreFinal = uniqid() . "_" . preg_replace('/[^A-Za-z0-9_.-]/', '_', $original);
    $rutaFinal = $dir . '/' . $nombreFinal;

    if (!move_uploaded_file($_FILES['defectos']['tmp_name'][$idx][$campo], $rutaFinal)) {
        throw new Exception("No se pudo guardar la foto ($tipo)");
    }

    $stmt = $con->prepare("INSERT INTO Fotos (FolioCaso, IdDefectoCaso, TipoFoto, Ruta) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("iiss", $folio, $idDefCaso, $tipo, $nombreFinal);
    $stmt->execute();
    $stmt->close();
}

// 🔧 Traduce ID a nombre (para mostrarlo legible)
function lookup($con, $tabla, $idFld, $nameFld, $val) {
    $salida = '';
    $st = $con->prepare("SELECT `$nameFld` FROM `$tabla` WHERE `$idFld` = ?");
    $st->bind_param("i", $val);
    $st->execute();
    $st->bind_result($salida);
    $st->fetch();
    $st->close();
    return $salida;
}
