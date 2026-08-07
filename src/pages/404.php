<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex">
    <title>Page introuvable - TC Dardagny</title>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <meta name="theme-color" content="#1a3150">
    <link rel="icon" href="/img/favicon.ico" type="image/x-icon">
</head>

<body>
    <?php include __DIR__ . '/../includes/header.php'; ?>
    <main style="opacity: 0;">
        <div class="titre with-margin" style="text-align:center; padding: 80px 20px;">
            <h1>404</h1>
            <h2>Cette page n'existe pas.</h2>
            <p><a href="/">Retour à l'accueil</a></p>
        </div>
    </main>
    <?php $page_scripts = []; include __DIR__ . '/../includes/footer.php'; ?>
</body>

</html>
