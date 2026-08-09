<?php
// src/includes/header.php
// Static, server-rendered navigation (crawlable, no client-side DOM injection).
$current_path = '/' . trim(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH), '/');
if ($current_path === '/') {
    $current_path = '/';
}

function nav_active($path) {
    global $current_path;
    return $current_path === $path ? ' class="active"' : '';
}
?>
<header>
    <div class="top_header">
        <a href="/"><img src="/img/TCD_Logo_Square.png" alt="TCD_Logo_Square" class="TCD_Logo_Square"></a>
        <label class="bar" for="check">
            <input type="checkbox" id="check">
            <span class="top"></span>
            <span class="middle"></span>
            <span class="bottom"></span>
        </label>
    </div>
    <div class="bottom_header">
        <a href="/"><img src="/img/TCD_Logo.png" alt="TCD_Logo" class="TCD_Logo" srcset=""></a>
        <nav>
            <ul>
                <li>
                    <a href="/"<?php echo nav_active('/'); ?>>HOME</a>
                </li>
                <li class="LeClub">
                    <a href="#">LE CLUB <i class="fa fa-caret-down"></i></a>
                    <div class="subnav-content">
                        <a href="/comite"<?php echo nav_active('/comite'); ?>>COMITE</a>
                        <a href="/cours-de-tennis"<?php echo nav_active('/cours-de-tennis'); ?>>COURS DE TENNIS</a>
                        <a href="/adhesion"<?php echo nav_active('/adhesion'); ?>>ADHESION</a>
                        <a href="/paiement"<?php echo nav_active('/paiement'); ?>>PAIEMENT</a>
                        <a href="/reglement-et-statuts"<?php echo nav_active('/reglement-et-statuts'); ?>>REGLEMENT ET STATUTS</a>
                    </div>
                </li>
                <!-- <li>
                    <a href="/agenda"<?php echo nav_active('/agenda'); ?>>AGENDA</a>
                </li> -->
                <li>
                    <a href="/reservation"<?php echo nav_active('/reservation'); ?>>RÉSERVATION</a>
                </li>
                <li>
                    <a href="/contact"<?php echo nav_active('/contact'); ?>>CONTACT</a>
                </li>
            </ul>
        </nav>
    </div>
</header>
