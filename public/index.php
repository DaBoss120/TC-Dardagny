<?php
// public/index.php — Central router

$url = trim($_GET['url'] ?? '', '/');
$path = $url === '' ? 'home' : $url;

$routes = [
    'home'                  => __DIR__ . '/../src/pages/home.php',
    'comite'                => __DIR__ . '/../src/pages/comite.php',
    'cours-de-tennis'       => __DIR__ . '/../src/pages/cours-de-tennis.php',
    'adhesion'              => __DIR__ . '/../src/pages/adhesion.php',
    'paiement'              => __DIR__ . '/../src/pages/paiement.php',
    'reglement-et-statuts'  => __DIR__ . '/../src/pages/reglement-et-statuts.php',
    'agenda'                => __DIR__ . '/../src/pages/agenda.php',
    'reservation'           => __DIR__ . '/../src/pages/reservation.php',
    'contact'               => __DIR__ . '/../src/pages/contact.php',
    'credits'               => __DIR__ . '/../src/pages/credits.php',
];

if (array_key_exists($path, $routes)) {
    require $routes[$path];
} else {
    header('HTTP/1.0 404 Not Found');
    require __DIR__ . '/../src/pages/404.php';
}
