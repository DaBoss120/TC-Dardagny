<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Crédits et licences des ressources tierces utilisées sur le site du Tennis-Club Dardagny.">
    <title>Crédits - TC Dardagny</title>
    <link rel="canonical" href="/credits">
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/credits.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <meta name="theme-color" content="#1a3150">
    <link rel="icon" href="/img/favicon.ico" type="image/x-icon">
</head>

<body>
    <?php include __DIR__ . '/../includes/header.php'; ?>
    <main style="opacity: 0;">
        <div class="titre">
            <h1>Crédits</h1>
            <h2>Ressources tierces utilisées sur ce site</h2>
        </div>

        <!-- Ce contenu doit rester synchronisé avec CREDITS.md à la racine
             du dépôt, qui fait office de source de vérité. -->
        <div class="credits">
            <section class="credits-group">
                <h3>Modèles 3D</h3>
                <ul>
                    <li>
                        <a href="https://skfb.ly/pBOuW" target="_blank" rel="noopener nofollow">« Tennis Ball »</a>
                        par <a href="https://sketchfab.com/amhyde" target="_blank" rel="noopener nofollow">amhyde</a>,
                        sous licence
                        <a href="http://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener nofollow">Creative Commons Attribution 4.0</a>.
                        <p class="credits-note">
                            Modèle modifié : géométrie de la fourrure retirée et textures réduites
                            pour alléger le fichier.
                        </p>
                    </li>
                </ul>
            </section>

            <section class="credits-group">
                <h3>Bibliothèques</h3>
                <ul>
                    <li>
                        <a href="https://threejs.org/" target="_blank" rel="noopener nofollow">three.js</a>
                        — licence MIT.
                    </li>
                    <li>
                        <a href="https://fontawesome.com/v4/" target="_blank" rel="noopener nofollow">Font Awesome 4.7</a>
                        — icônes sous licence SIL OFL 1.1, code sous licence MIT.
                    </li>
                </ul>
            </section>

            <section class="credits-group">
                <h3>Polices</h3>
                <ul>
                    <li>Rammetto One — licence SIL Open Font License 1.1.</li>
                    <li>Open Sans — licence SIL Open Font License 1.1.</li>
                </ul>
            </section>
        </div>
    </main>
    <?php $page_scripts = [];
    include __DIR__ . '/../includes/footer.php'; ?>
</body>

</html>
