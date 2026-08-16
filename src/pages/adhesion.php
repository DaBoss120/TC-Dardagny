<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Devenir membre du Tennis-Club Dardagny : téléchargez le formulaire d'inscription et rejoignez le club.">
    <title>Adhésion - TC Dardagny</title>
    <link rel="canonical" href="/adhesion">
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/adhesion.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <meta name="theme-color" content="#1a3150">
    <link rel="icon" href="/img/favicon.ico" type="image/x-icon">
</head>

<body>
    <?php include __DIR__ . '/../includes/header.php'; ?>
    <main style="opacity: 0;">
        <div class="devenirMembre big-back-img">
            <div class="titre">
                <h1>Devenir membre</h1>
            </div>
            <div class="devenirMembreContent back-img-presentation">
                <img class="parallax-foreground" src="/img/adhesion/SpinningBallWithWaterForeground.webp" alt="" aria-hidden="true">
                <div class="text-bubble-img-presentation devenirMembre-text">
                    <p>Pour s'inscrire au club, veuillez svp télécharger le formulaire d'inscription,
                        le remplir et l'envoyer par e-mail à <a href="mailto:info@tcdardagny.ch" style="color: white;">info@tcdardagny.ch</a> ou par courrier à :</p>
                    <p><br><b>
                            Silvine Beucler<br>
                            Chemin du Rebiolon 9<br>
                            1283 Dardagny
                        </b>
                    </p>
                </div>
                <a class="button1 pos-abs" href="/pdf/Formulaire_adhesion_TCD_2026-2027.pdf">
                        <p>Formulaire d'adhesion</p>
                </a>
                <!-- <div class="text-bubble-img-presentation">
                    <p>Merci de votre inscription</p>
                </div> -->
            </div>
        </div>
    </main>
    <?php $page_scripts = ['adhesion.js']; include __DIR__ . '/../includes/footer.php'; ?>
</body>

</html>
