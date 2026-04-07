<?php
declare(strict_types=1);

$query = $_SERVER['QUERY_STRING'] ?? '';
$target = 'app/public/ficha_tec.php';

if ($query !== '') {
    $target .= '?' . $query;
}

header('Location: ' . $target);
exit;
