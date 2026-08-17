<?php
// src/includes/footer.php
// Site footer plus the common script includes, appended before </body> on
// every page. Individual pages can set $page_scripts = ['agenda.js', ...]
// before including this file to load additional, page-specific scripts.
?>
<footer class="site-footer">
    <div class="site-footer-inner">
        <div class="footer-brand">
            <img src="/img/shared/TCD_Logo_Square.png" alt="Tennis-Club Dardagny" class="footer-logo" width="64" height="64">
            <p>Deux courts ext&eacute;rieurs &agrave; Dardagny, pr&egrave;s de Gen&egrave;ve.</p>
        </div>

        <nav class="footer-nav" aria-label="Plan du site">
            <div class="footer-column">
                <h2>Le club</h2>
                <ul>
                    <li><a href="/comite">Comit&eacute;</a></li>
                    <li><a href="/cours-de-tennis">Cours de tennis</a></li>
                    <li><a href="/adhesion">Adh&eacute;sion</a></li>
                    <li><a href="/paiement">Paiement</a></li>
                    <li><a href="/reglement-et-statuts">R&egrave;glement et statuts</a></li>
                </ul>
            </div>

            <div class="footer-column">
                <h2>Le site</h2>
                <ul>
                    <li><a href="/">Accueil</a></li>
                    <!-- <li><a href="/agenda">Agenda</a></li> -->
                    <li><a href="/reservation">R&eacute;servation</a></li>
                    <li><a href="/galerie">Galerie</a></li>
                    <li><a href="/contact">Contact</a></li>
                </ul>
            </div>

            <div class="footer-column">
                <h2>Informations</h2>
                <ul>
                    <li><a href="mailto:info@tcdardagny.ch">info@tcdardagny.ch</a></li>
                    <li><a href="/credits">Cr&eacute;dits</a></li>
                </ul>
            </div>
        </nav>
    </div>

    <p class="footer-legal">&copy; <?php echo date('Y'); ?> Tennis-Club Dardagny</p>
</footer>
<script src="/js/script.js"></script>
<?php if (!empty($page_scripts) && is_array($page_scripts)): ?>
<?php foreach ($page_scripts as $script): ?>
<script src="/js/<?php echo htmlspecialchars($script, ENT_QUOTES, 'UTF-8'); ?>"></script>
<?php endforeach; ?>
<?php endif; ?>
