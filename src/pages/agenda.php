<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Agenda du Tennis-Club Dardagny : événements, cours, tournois et actualités du club.">
    <title>Agenda - TC Dardagny</title>
    <link rel="canonical" href="/agenda">
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/agenda.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <meta name="theme-color" content="#1a3150">
    <link rel="icon" href="/img/favicon.ico" type="image/x-icon">
</head>

<body>
    <?php include __DIR__ . '/../includes/header.php'; ?>
    <main style="opacity: 0;">
        <div class="big-back-img">
            <div class="titre">
                <h1>Agenda</h1>
            </div>
            <div class="agenda">
                <div class="agendaElement reveal-on-scroll" style="--image-url: url('/img/WomanServing.webp')">
                    <img src="/img/WomanServing.webp" alt="Woman Serving">
                    <div class="agendaContent">
                        <div class="agendaText">
                            <h1>Venez jouer</h1>
                            <p>Venez jouer dans un magnigique décors de campagne!</p>
                        </div>
                        <button class="button2">
                            <p>Réservez un court</p>
                        </button>
                    </div>
                </div>
                <div class="agendaElement reveal-on-scroll" style="--image-url: url('/img/TCD_Logo_Square.webp')">
                    <img src="/img/TCD_Logo_Square.webp" alt="TCD logo Square">
                    <div class="agendaContent">
                        <div class="agendaText">
                            <h1>7ème Assemblée générale</h1>
                            <p><b>Notre 7ème Assemblée générale a eu lieu le jeudi 21 mars 2024 à 20h.</b></p>
                            <p>A cette occasion, les membres présents ont reçu des t-shirts du club.</p>
                        </div>
                        <button class="button2">
                            <p>Ordre du jour</p>
                        </button>
                    </div>
                </div>
                <div class="agendaElement reveal-on-scroll" style="--image-url: url('/img/TwoKidsPlayingTennis.webp')">
                    <img src="/img/TwoKidsPlayingTennis.webp" alt="Woman Serving">
                    <div class="agendaContent">
                        <div class="agendaText">
                            <h1>Cours juniors automne 2024</h1>
                            <p>Le Tennis-Club Dardagny propose des cours pour les enfants dès 4 ans (1P) les mercredi du 28
                                août au 16 octobre. Inscriptions ouvertes jusqu'au lundi 19 août.</p>
                        </div>
                        <button class="button2">
                            <p>Inscription</p>
                        </button>
                        <button class="button2">
                            <p>Conditions générales</p>
                        </button>
                    </div>
                </div>
                <div class="agendaElement reveal-on-scroll" style="--image-url: url('/img/TennisApero.webp')">
                    <img src="/img/TennisApero.webp" alt="Woman Serving">
                    <div class="agendaContent">
                        <div class="agendaText">
                            <h1>Tennis Apéro</h1>
                            <p>Le « Tennis Apéro » est un rendez-vous pour tous les joueurs, membres et non-membres, jeunes
                                et moins jeunes, qui désirent passer un moment de jeu sur les courts suivi d'un apéro.
                            </p>
                        </div>
                        <button class="button2">
                            <p>Information</p>
                        </button>
                    </div>
                </div>
                <div class="agendaElement reveal-on-scroll" style="--image-url: url('/img/RacketWithHole.webp')">
                    <img src="/img/RacketWithHole.webp" alt="Woman Serving">
                    <div class="agendaContent">
                        <div class="agendaText">
                            <h1>Service de cordage</h1>
                            <p><b>Vous avez un problème de cordage?</b></p>
                            <p>Benoît propose de corder votre raquette.
                            </p>
                        </div>
                        <button class="button2">
                            <p>Information</p>
                        </button>
                    </div>
                </div>
                <div class="agendaElement reveal-on-scroll" style="--image-url: url('/img/TCDLogoOnTenisBall.webp')">
                    <img src="/img/TCDLogoOnTenisBall.webp" alt="Woman Serving">
                    <div class="agendaContent">
                        <div class="agendaText">
                            <h1>Tournoi de Printemps 2024</h1>
                            <p>Du <b>1er avril au 9 juin</b> a lieu le <b>Tournoi à la Ronde du Printemps</b> pour les <b>
                                    adultes</b> et les
                                <b>jeunes</b> dès <b>14 ans</b>, en collaboration avec le Tennis-Club de Aire-la-Ville.
                            </p>
                        </div>
                        <button class="button2">
                            <p>Inscription</p>
                        </button>
                    </div>
                </div>
                <div class="agendaElement reveal-on-scroll" style="--image-url: url('/img/KidsMultisport.webp')">
                    <img src="/img/KidsMultisport.webp" alt="Woman Serving">
                    <div class="agendaContent">
                        <div class="agendaText">
                            <h1>Camp Tennis et Multisports</h1>
                            <p>Du<b> 1er avril au 9 juin</b> a lieu le <b>Tournoi à la Ronde du Printemps</b> pour les <b>
                                    adultes</b> et les
                                <b>jeunes</b> dès <b>14 ans</b>, en collaboration avec le Tennis-Club de Aire-la-Ville.
                            </p>
                        </div>
                        <button class="button2">
                            <p>Inscription</p>
                        </button>
                        <button class="button2">
                            <p>Conditions générales</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>

    </main>
    <?php $page_scripts = ['agenda.js', 'revealOnScroll.js']; include __DIR__ . '/../includes/footer.php'; ?>
</body>

</html>
