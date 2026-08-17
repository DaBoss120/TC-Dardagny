<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Contactez le Tennis-Club Dardagny par e-mail à info@tcdardagny.ch.">
    <title>Contact - TC Dardagny</title>
    <link rel="canonical" href="/contact">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Tennis-Club Dardagny">
    <meta property="og:title" content="Contact - TC Dardagny">
    <meta property="og:description" content="Contactez le Tennis-Club Dardagny par e-mail à info@tcdardagny.ch.">
    <meta property="og:url" content="https://tcdardagny.ch/contact">
    <meta property="og:image" content="https://tcdardagny.ch/img/shared/TCD_Logo_Square.png">
    <meta property="og:locale" content="fr_CH">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Contact - TC Dardagny">
    <meta name="twitter:description" content="Contactez le Tennis-Club Dardagny par e-mail à info@tcdardagny.ch.">
    <meta name="twitter:image" content="https://tcdardagny.ch/img/shared/TCD_Logo_Square.png">
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/contact.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <meta name="theme-color" content="#1a3150">
    <link rel="icon" href="/img/favicon.ico" type="image/x-icon">
</head>

<body>
    <?php include __DIR__ . '/../includes/header.php'; ?>
    <main style="opacity: 0;">
        <div class="big-back-img">
            <div class="titre">
                <h1>Contact</h1>
            </div>
            <div class="contactContent back-img-presentation">
                <div class="text-bubble-img-presentation contact-text">
                    <p>Pour toute information n'hésitez pas a nous contacter en cliquant sur la lettre ou en copiant l'e-mail
                    </p>
                </div>
                <div class="text-bubble-img-presentation bubble-hover">
                    <h1>Contactez-nous</h1>

                    <a href="mailto:%20info@tcdardagny.ch"><img class="bubble-hover round-img-in-bubble"
                            src="/img/contact/Email.webp" alt="Email image" style="border-radius: 100%;"></a>
                    <div class="text-bubble-img-presentation2 bubble-hover text-in-bubble" id="copyableText"
                        onclick="CopyEmail()">
                        <p>info@tcdardagny.ch</p>
                    </div>
                </div>
            </div>
        </div>
    </main>
    <?php $page_scripts = []; include __DIR__ . '/../includes/footer.php'; ?>
    <script>
        function CopyEmail() {
            navigator.clipboard.writeText("info@tcdardagny.ch");

            let text = document.querySelector("#copyableText p");
            text.innerHTML = "Copié !"

            text.classList.add('textBlurButton');
            text.classList.remove('textBlurButtonUnhover');

            setTimeout(() => {
                text.innerHTML = "info@tcdardagny.ch"
                text.classList.remove('textBlurButton');
                text.classList.add('textBlurButtonUnhover');
            }, 3000)
        }
    </script>
</body>

</html>
