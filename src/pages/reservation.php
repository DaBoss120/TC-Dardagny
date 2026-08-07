<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Réservez un court au Tennis-Club Dardagny en ligne via Balle Jaune.">
    <title>Réservation - TC Dardagny</title>
    <link rel="canonical" href="/reservation">
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/reservation.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <meta name="theme-color" content="#1a3150">
    <link rel="icon" href="/img/favicon.ico" type="image/x-icon">
</head>

<body>
    <?php include __DIR__ . '/../includes/header.php'; ?>
    <main style="opacity: 0;">
        <div class="titre with-margin">
            <h1>Réservation</h1>
        </div>
        <div class="background-container">
            <div class="img-with-gadient"></div>
        </div>
        <div class="img-with-gadient-content">
            <div>
                <div class="court-img">
                    <img src="/img/court2.webp" alt="court image">
                    <div>
                        <p>Court No 1</p>
                    </div>
                    <div>
                        <p>Court No 2</p>
                    </div>
                </div>
                <div class="map-container">
                    <iframe
                        src="https://www.google.com/maps/embed/v1/place?key=AIzaSyAKS5FD1Ce1crnKu0BYIhOB-1oq1aWVvEM&q=Tennis,Dardagny&maptype=satellite"
                        width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"
                        referrerpolicy="no-referrer-when-downgrade">
                    </iframe>
                </div>
            </div>
            <a href="https://ballejaune.com/club/tcdardagny">
                <button class="button1">
                    <p>Réserver</p>
                </button>
            </a>
        </div>


    </main>
    <?php $page_scripts = []; include __DIR__ . '/../includes/footer.php'; ?>
</body>

</html>
