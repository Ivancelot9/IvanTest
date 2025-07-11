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
    $tab_id = isset($_GET['tab_id']) ? $_GET['tab_id'] : '';
    if (empty($tab_id) || ! isset($_SESSION['usuariosPorPestana'][$tab_id]['Username'])) {
        throw new Exception('Sesión inválida: usuario no encontrado.');
    }
    $username = $_SESSION['usuariosPorPestana'][$tab_id]['Username'];

    // 2b) Obtener IdUsuario
    $conUser  = (new LocalConector())->conectar();
    $stmtUser = $conUser->prepare("SELECT IdUsuario FROM Usuario WHERE Username = ?");
    if (! $stmtUser) {
        throw new Exception('Error preparando SELECT usuario: ' . $conUser->error);
    }
    $stmtUser->bind_param("s", $username);
    $stmtUser->execute();
    $stmtUser->bind_result($idUsuario);
    if (! $stmtUser->fetch()) {
        throw new Exception("Usuario \"$username\" no existe en BD.");
    }
    $stmtUser->close();
    $conUser->close();

    // 3) Validar campos generales
    $required = ['Responsable','NumeroParte','Cantidad','IdTerceria','IdCommodity','IdProveedor'];
    foreach ($required as $f) {
        if (! isset($_POST[$f]) || trim($_POST[$f]) === '') {
            throw new Exception("Falta el campo $f");
        }
    }

    // 4) Recoger datos
    $responsable = trim($_POST['Responsable']);
    $numeroParte = trim($_POST['NumeroParte']);
    $cantidad    = floatval(str_replace(',', '.', $_POST['Cantidad']));
    $descripcion = isset($_POST['Descripcion']) ? trim($_POST['Descripcion']) : '';
    $idTerceria  = intval($_POST['IdTerceria']);
    $idCommodity = intval($_POST['IdCommodity']);
    $idProveedor = intval($_POST['IdProveedor']);
    $estatus     = 1;

    // 5) Insertar Caso
    $con = (new LocalConector())->conectar();
    $sql = "
      INSERT INTO Casos
        (IdUsuario, NumeroParte, Cantidad, Descripcion,
         IdTerceria, IdCommodity, IdProveedor, IdEstatus, Responsable)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ";
    $stmt = $con->prepare($sql);
    if (! $stmt) {
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
    if (! $stmt->execute()) {
        throw new Exception('Error ejecutando INSERT Casos: ' . $stmt->error);
    }
    $folioCaso = $stmt->insert_id;
    $stmt->close();

    // 6) Crear carpetas de imágenes
    $baseDir = __DIR__ . '/uploads';
    $okDir   = "$baseDir/ok";
    $noDir   = "$baseDir/no";
    foreach ([$okDir, $noDir] as $d) {
        if (! is_dir($d)) mkdir($d, 0755, true);
    }

    // 7) Procesar defectos
    if (! isset($_POST['defectos']) || ! is_array($_POST['defectos'])) {
        throw new Exception('No se recibieron defectos.');
    }
    foreach ($_POST['defectos'] as $idx => $bloque) {
        $idDef = intval(isset($bloque['idDefecto']) ? $bloque['idDefecto'] : 0);
        if ($idDef <= 0) {
            throw new Exception("Defecto inválido en bloque " . ($idx + 1));
        }
        $sd = $con->prepare("INSERT INTO DefectosCaso (FolioCaso, IdDefectos) VALUES (?,?)");
        $sd->bind_param("ii", $folioCaso, $idDef);
        if (! $sd->execute()) {
            throw new Exception('Error insertando DefectosCaso: ' . $sd->error);
        }
        $idDefCaso = $sd->insert_id;
        $sd->close();

        subirFoto($idx, 'fotoOk', 'ok',  $folioCaso, $idDefCaso, $okDir, $con);
        subirFoto($idx, 'fotoNo',  'no', $folioCaso, $idDefCaso, $noDir, $con);
    }

    // 8) Procesar archivo PDF (método de trabajo)
    if (isset($_FILES['metodo_pdf']) && $_FILES['metodo_pdf']['error'] === UPLOAD_ERR_OK) {
        $archivoTmp = $_FILES['metodo_pdf']['tmp_name'];
        $nombreOriginal = $_FILES['metodo_pdf']['name'];
        $ext = strtolower(pathinfo($nombreOriginal, PATHINFO_EXTENSION));

        if ($ext !== 'pdf') {
            throw new Exception('El archivo del método de trabajo debe ser un PDF.');
        }

        $dirPDF = __DIR__ . '/dao/uploads/';
        if (!file_exists($dirPDF)) {
            mkdir($dirPDF, 0777, true);
        }

        $nombreFinal = 'metodo_' . $folioCaso . '_' . time() . '.pdf';
        $rutaFinal = $dirPDF . $nombreFinal;

        if (!move_uploaded_file($archivoTmp, $rutaFinal)) {
            throw new Exception('Error al guardar el archivo PDF.');
        }

        $subidoPor = $username ?? ($_POST['correoInspector'] ?? 'desconocido');
        $rutaBD = 'dao/uploads/' . $nombreFinal;

        $stmtMetodo = $con->prepare("INSERT INTO MetodoTrabajo (FolioCaso, RutaPDF, SubidoPor) VALUES (?, ?, ?)");
        $stmtMetodo->bind_param("iss", $folioCaso, $rutaBD, $subidoPor);
        if (! $stmtMetodo->execute()) {
            throw new Exception('Error insertando MetodoTrabajo: ' . $stmtMetodo->error);
        }
        $stmtMetodo->close();
    }

    // 9) Respuesta JSON
    ob_clean();
    echo json_encode([
        'status'      => 'success',
        'message'     => "Caso #{$folioCaso} guardado correctamente.",
        'folio'       => $folioCaso,
        'fecha'       => date('Y-m-d'),
        'estatus'     => lookup($con, 'Estatus',  'IdEstatus',   'NombreEstatus',   $estatus),
        'responsable' => $responsable,
        'terciaria'   => lookup($con, 'Terceria', 'IdTerceria',  'NombreTerceria',  $idTerceria)
    ]);
    exit;

} catch (Exception $e) {
    ob_clean();
    echo json_encode([
        'status'  => 'error',
        'message' => $e->getMessage()
    ]);
    exit;
}

function subirFoto($idx, $campo, $tipo, $folio, $idDefCaso, $dir, $con) {
    if (
        ! isset($_FILES['defectos']['tmp_name'][$idx][$campo]) ||
        $_FILES['defectos']['error'][$idx][$campo] !== UPLOAD_ERR_OK
    ) {
        return;
    }
    $orig = basename($_FILES['defectos']['name'][$idx][$campo]);
    $new  = uniqid() . "_{$orig}";
    if (! move_uploaded_file($_FILES['defectos']['tmp_name'][$idx][$campo], "$dir/$new")) {
        throw new Exception("No se pudo subir la foto $tipo.");
    }
    $i = $con->prepare(
        "INSERT INTO Fotos (FolioCaso, IdDefectoCaso, TipoFoto, Ruta)
       VALUES (?,?,?,?)"
    );
    $i->bind_param("iiss", $folio, $idDefCaso, $tipo, $new);
    if (! $i->execute()) {
        throw new Exception('Error insertando Foto: ' . $i->error);
    }
    $i->close();
}

function lookup($con, $tabla, $idFld, $nameFld, $val) {
    $output = '';
    $st = $con->prepare("SELECT `$nameFld` FROM `$tabla` WHERE `$idFld` = ?");
    if ($st) {
        $st->bind_param("i", $val);
        $st->execute();
        $st->bind_result($output);
        $st->fetch();
        $st->close();
    }
    return $output;
}
