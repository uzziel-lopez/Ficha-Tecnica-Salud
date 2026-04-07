<?php
declare(strict_types=1);

header('X-Content-Type-Options: nosniff');

function fail(int $status, string $message): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

function readFloatParam(string $name, float $default, float $min, float $max): float
{
    $raw = $_GET[$name] ?? null;
    if ($raw === null || $raw === '') {
        return $default;
    }

    if (!is_numeric((string)$raw)) {
        fail(400, 'Parametro ' . $name . ' invalido.');
    }

    $value = (float)$raw;
    if ($value < $min || $value > $max) {
        fail(400, 'Parametro ' . $name . ' fuera de rango.');
    }

    return $value;
}

try {
    $unidadRaw = $_GET['unidad'] ?? '0';
    if (!preg_match('/^-?\d+$/', (string)$unidadRaw)) {
        fail(400, 'Parametro unidad invalido.');
    }

    $unidad = (int)$unidadRaw;
    if ($unidad < 0 || $unidad > 1000) {
        fail(400, 'Parametro unidad fuera de rango.');
    }

    $scale = readFloatParam('scale', 0.60, 0.10, 2.00);
    $marginTopMm = readFloatParam('marginTopMm', 8.0, 0.0, 40.0);
    $marginRightMm = readFloatParam('marginRightMm', 7.0, 0.0, 40.0);
    $marginBottomMm = readFloatParam('marginBottomMm', 10.0, 0.0, 40.0);
    $marginLeftMm = readFloatParam('marginLeftMm', 7.0, 0.0, 40.0);
    $media = strtolower((string)($_GET['media'] ?? 'print'));
    if ($media !== 'print' && $media !== 'screen') {
        fail(400, 'Parametro media invalido.');
    }

    $page2ScaleRaw = $_GET['page2Scale'] ?? null;
    $page2Scale = null;
    if ($page2ScaleRaw !== null && $page2ScaleRaw !== '') {
        if (!is_numeric((string)$page2ScaleRaw)) {
            fail(400, 'Parametro page2Scale invalido.');
        }
        $page2Scale = (float)$page2ScaleRaw;
        if ($page2Scale < 0.10 || $page2Scale > 2.00) {
            fail(400, 'Parametro page2Scale fuera de rango.');
        }
    }

    $basePath = rtrim(dirname($_SERVER['SCRIPT_NAME'], 2), '/');

    $publicScheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $publicHost = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $publicPrintUrl = sprintf(
        '%s://%s%s/ficha_tec.php?unidad=%d&pdf_mode=1',
        $publicScheme,
        $publicHost,
        $basePath,
        $unidad
    );

    $internalBaseUrl = trim((string)getenv('FT_PDF_INTERNAL_BASE_URL'));
    if ($internalBaseUrl === '') {
        $serverPort = (int)($_SERVER['SERVER_PORT'] ?? 80);
        $portSuffix = ($serverPort > 0 && $serverPort !== 80) ? ':' . $serverPort : '';
        $internalBaseUrl = 'http://127.0.0.1' . $portSuffix;
    }
    $internalBaseUrl = rtrim($internalBaseUrl, '/');
    $internalPrintUrl = sprintf(
        '%s%s/ficha_tec.php?unidad=%d&pdf_mode=1',
        $internalBaseUrl,
        $basePath,
        $unidad
    );

    $projectRoot = realpath(__DIR__ . '/../../..');
    if ($projectRoot === false) {
        fail(500, 'No se pudo resolver el directorio del proyecto.');
    }

    $scriptPath = $projectRoot . '/scripts/generate_ficha_pdf.mjs';
    if (!is_file($scriptPath)) {
        fail(500, 'Script de exportacion no encontrado.');
    }

    $candidateNodes = [
        '/opt/homebrew/bin/node',
        '/usr/local/bin/node',
        'node'
    ];
    $nodeBinary = null;
    foreach ($candidateNodes as $candidate) {
        if ($candidate === 'node') {
            $nodeBinary = $candidate;
            continue;
        }
        if (is_file($candidate) && is_executable($candidate)) {
            $nodeBinary = $candidate;
            break;
        }
    }
    if ($nodeBinary === null) {
        fail(500, 'No se encontro binario de Node.js para generar PDF.');
    }

    $tmpCandidates = [
        ini_get('upload_tmp_dir') ?: '',
        sys_get_temp_dir(),
    ];
    $runtimeTmp = '';
    foreach ($tmpCandidates as $tmpPath) {
        $tmpPath = trim((string)$tmpPath);
        if ($tmpPath === '') {
            continue;
        }
        if (is_dir($tmpPath) && is_writable($tmpPath)) {
            $runtimeTmp = $tmpPath;
            break;
        }
    }
    if ($runtimeTmp === '') {
        fail(500, 'No se pudo preparar el directorio temporal de ejecucion.');
    }

    $descriptors = [
        0 => ['pipe', 'r'],
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
    ];

    $candidateUrls = array_values(array_unique([$internalPrintUrl, $publicPrintUrl]));
    $stdout = '';
    $lastDetail = 'Error desconocido al generar PDF.';

    foreach ($candidateUrls as $candidateUrl) {
        $command = sprintf(
            '%s %s --url %s --timeout 240000 --scale %s --marginTopMm %s --marginRightMm %s --marginBottomMm %s --marginLeftMm %s --media %s',
            escapeshellcmd($nodeBinary),
            escapeshellarg($scriptPath),
            escapeshellarg($candidateUrl),
            escapeshellarg((string)$scale),
            escapeshellarg((string)$marginTopMm),
            escapeshellarg((string)$marginRightMm),
            escapeshellarg((string)$marginBottomMm),
            escapeshellarg((string)$marginLeftMm),
            escapeshellarg($media)
        );

        if ($page2Scale !== null) {
            $command .= ' --page2Scale ' . escapeshellarg((string)$page2Scale);
        }

        $process = proc_open(
            $command,
            $descriptors,
            $pipes,
            $projectRoot,
            [
                'TMPDIR' => $runtimeTmp,
                'TMP' => $runtimeTmp,
                'TEMP' => $runtimeTmp,
                'PLAYWRIGHT_BROWSERS_PATH' => $projectRoot . '/.playwright',
            ]
        );
        if (!is_resource($process)) {
            $lastDetail = 'No se pudo iniciar el proceso de PDF.';
            continue;
        }

        fclose($pipes[0]);
        $procStdout = stream_get_contents($pipes[1]);
        $procStderr = stream_get_contents($pipes[2]);
        fclose($pipes[1]);
        fclose($pipes[2]);
        $exitCode = proc_close($process);

        if ($exitCode === 0 && strlen((string)$procStdout) > 0) {
            $stdout = (string)$procStdout;
            break;
        }

        $lastDetail = trim((string)$procStderr);
        if ($lastDetail === '') {
            $lastDetail = trim((string)$procStdout);
        }
        if ($lastDetail === '') {
            $lastDetail = 'Playwright no genero salida valida.';
        }
    }

    if ($stdout === '') {
        fail(500, 'Error al generar PDF con Playwright. ' . $lastDetail);
    }

    $safeName = preg_replace('/[^a-zA-Z0-9_\-]+/', '_', 'ficha_tecnica_unidad_' . $unidad);
    if ($safeName === null || $safeName === '') {
        $safeName = 'ficha_tecnica';
    }

    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="' . $safeName . '.pdf"');
    header('Content-Length: ' . (string)strlen($stdout));
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

    echo $stdout;
    exit;
} catch (Throwable $e) {
    fail(500, 'Error inesperado: ' . $e->getMessage());
}
