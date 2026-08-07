<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Tennis-Club Dardagny : deux courts extérieurs, cours pour enfants et adultes, réservations en ligne et événements du club près de Genève.">
    <title>TC Dardagny - Tennis club de Dardagny - Suisse</title>
    <link rel="canonical" href="/">
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/home.css">
    <link rel="stylesheet" href="/css/carousel.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <meta name="theme-color" content="#1a3150">
    <link rel="icon" href="/img/favicon.ico" type="image/x-icon">
    <script>
        // Decide before the first paint whether the enter animation runs, so the
        // closed fences never flash on a load where they are not wanted.
        // Runs inline (not from a file) because it has to beat the first paint.
        (function() {
            // When the intro plays:
            //   'always'   every load
            //   'reload'   only when the page was reloaded
            //   'session'  once per browser session
            //   'never'    off
            //
            // NOTE: no browser tells a page whether a reload was a normal one
            // (F5) or a forced one (Ctrl/Cmd+Shift+R) — the Navigation Timing
            // API reports both as "reload". 'reload' below is as close as it
            // gets: it fires on any refresh, but not when a visitor arrives
            // from a link, a bookmark, or the site's own nav.
            var INTRO_MODE = 'session';

            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

            var play = INTRO_MODE === 'always';

            if (INTRO_MODE === 'reload') {
                try {
                    var entry = performance.getEntriesByType('navigation')[0];
                    // performance.navigation is the deprecated fallback for
                    // browsers without the newer entry; 1 means TYPE_RELOAD.
                    play = entry
                        ? entry.type === 'reload'
                        : performance.navigation.type === 1;
                } catch (error) {
                    play = false;
                }
            } else if (INTRO_MODE === 'session') {
                try {
                    play = sessionStorage.getItem('tcd-intro-played') !== '1';
                } catch (error) {
                    // Storage blocked (private browsing) — just play the intro.
                    play = true;
                }
            }

            if (play) {
                document.documentElement.classList.add('enter-anim');
            }
        })();
    </script>
</head>

<body>
    <?php include __DIR__ . '/../includes/header.php'; ?>
    <div class="left-fence" aria-hidden="true"></div>
    <div class="right-fence" aria-hidden="true"></div>
    <!-- Sits on the closed fences and blows out as they part. Only rendered
         while the intro runs — see .fence-logo in home.css. -->
    <div class="fence-logo" aria-hidden="true">
        <img src="/img/TCD_Logo_Square.webp" alt="" width="200" height="200" fetchpriority="high" decoding="async">
    </div>

    <main style="opacity: 0;">
        <!-- The hero is its own box: .hero-decor and .hero-buttons are placed
             against its edges, so it must not grow with the content below. -->
        <section class="hero">
            <!-- Everything inside .hero-inner so js/heroScroll.js can shift the
             whole hero as one for the parallax. -->
            <div class="hero-inner">
                <!-- Colour bands, cut at the same angle as the opening fences. -->
                <div class="hero-bands" aria-hidden="true">
                    <div class="hero-band hero-band--accent"></div>
                    <div class="hero-band hero-band--main"></div>
                    <div class="hero-band hero-band--spark"></div>
                </div>
                <!-- Decorative only: the racket sets the sport, the grapes nod to
             Dardagny's vineyards. Empty alt + aria-hidden keeps them out of
             the accessibility tree. Positions live in css/home.css. -->
                <div class="hero-decor" aria-hidden="true">
                    <img class="decor decor--racket enter-reveal" src="/img/Tennis-racket-with-ball.webp" alt="" loading="eager" decoding="async">
                    <img class="decor decor--grapes enter-reveal" src="/img/Grape.webp" alt="" loading="eager" decoding="async">
                    <img class="decor decor--grape-a enter-reveal" src="/img/Unique-grape.webp" alt="" loading="eager" decoding="async">
                    <img class="decor decor--grape-b enter-reveal" src="/img/Unique-grape.webp" alt="" loading="eager" decoding="async">
                    <img class="decor decor--grape-c enter-reveal" src="/img/Unique-grape.webp" alt="" loading="eager" decoding="async">
                    <!-- The 3D tennis balls, split across three stacked canvases by
                 depth so each can carry its own blur. No `enter-reveal` here on
                 purpose: they fly in from the sides, driven by heroBalls.js. -->
                    <canvas class="hero-canvas hero-canvas--far"></canvas>
                    <canvas class="hero-canvas hero-canvas--mid"></canvas>
                    <canvas class="hero-canvas hero-canvas--near"></canvas>
                </div>

                <!-- Title and subtitle share one box so the subtitle is placed
                     relative to the title rather than to the viewport. -->
                <div class="hero-text">
                    <h1 class="main-title">Tennis-Club Dardagny</h1>
                    <h2 class="sub-title">Tennis, vignes et bonne humeur</h2>
                </div>
                <!-- <div class="hero-buttons">
                    <button class="button1 enter-reveal">
                        <p>Inscription</p>
                    </button>
                </div> -->
            </div>
        </section>

        <!-- The chevron sweep. .courses-wrap is pulled up over the hero; the
             white panel's top edge is a '^' and .chevron-sweep draws the blue
             band along it. As the hero content lags behind on scroll, the
             chevron rises across it. -->
        <div class="courses-wrap">
            <div class="chevron-sweep" aria-hidden="true"></div>

            <!-- Both sections share one panel: it carries the white background
                 that hides the hero behind the chevron, the chevron clip, and
                 the diagonal bands — so the decoration runs unbroken across
                 "Cours collectifs" and "Au club" as one stretch of page. -->
            <div class="page-panel">
            <div class="page-bands wipe-on-scroll" aria-hidden="true">
                <div class="page-band page-band--1"></div>
                <div class="page-band page-band--2"></div>
                <div class="page-band page-band--vertical"></div>
                <div class="page-band page-band--3"></div>
                <div class="page-band page-band--cross"></div>
                <div class="page-band page-band--vertical-right"></div>
                <div class="page-band page-band--4"></div>
            </div>

            <section class="courses">
                <div class="titre reveal-on-scroll">
                    <h2>Cours collectifs</h2>
                </div>

                <div class="course-cards">
                    <article class="course-card reveal-on-scroll">
                        <img class="course-illustration" src="/img/CoursJuniorsBalle.webp" alt="" loading="lazy" decoding="async">
                        <div class="course-body">
                            <h3>Cours juniors</h3>
                            <p class="course-season">Saison 2026 &ndash; 2027</p>
                            <ul class="course-details">
                                <li>Pour les enfants et les jeunes d&egrave;s 4 ans</li>
                                <li>Lundi, mercredi et vendredi apr&egrave;s-midi, durant les saisons d'automne et de printemps</li>
                                <li>Mercredi matin, tout au long de l'ann&eacute;e</li>
                            </ul>
                            <p class="course-deadline">Inscription jusqu'au 18 ao&ucirc;t</p>
                            <!-- class on the <a> rather than a <button> inside it: a
                             button nested in a link is invalid and breaks
                             keyboard activation. -->
                            <a class="button1 btn-bg-blue course-link"
                                href="/pdf/Annonce%20cours%20Juniors_Saison%202026-2027.pdf"
                                target="_blank" rel="noopener">
                                <p>Voir l'annonce (PDF)</p>
                            </a>
                            <a class="button1 course-link"
                                href="/pdf/Conditions%20g%C3%A9n%C3%A9rales%20cours%20juniors%20Saison%202026-2027.pdf"
                                target="_blank" rel="noopener">
                                <p>Conditions générales</p>
                            </a>
                        </div>
                    </article>

                    <article class="course-card reveal-on-scroll">
                        <img class="course-illustration" src="/img/CoursAdultes.webp" alt="" loading="lazy" decoding="async">
                        <div class="course-body">
                            <h3>Cours adultes</h3>
                            <p class="course-season">Automne 2026</p>
                            <ul class="course-details">
                                <li>Du 24 ao&ucirc;t au 5 novembre</li>
                                <li>Lundi, mercredi et jeudi &mdash; 60 minutes entre 18h30 et 21h</li>
                                <li>3 &agrave; 4 participants par groupe</li>
                                <li>250 CHF (300 CHF pour les non-membres)</li>
                            </ul>
                            <p class="course-deadline">Inscription jusqu'au 18 ao&ucirc;t</p>
                            <a class="button1 btn-bg-blue course-link"
                                href="/pdf/Annonce%20cours%20Adultes_Automne%202026.pdf"
                                target="_blank" rel="noopener">
                                <p>Voir l'annonce (PDF)</p>
                            </a>
                            <a class="button1 course-link"
                                href="/pdf/Conditions%20g%C3%A9n%C3%A9rales%20cours%20adultes%20Automne%202026%20TCD.pdf"
                                target="_blank" rel="noopener">
                                <p>Conditions générales</p>
                            </a>
                        </div>
                    </article>
                </div>
            </section>

            <!-- Permanent club info, carried over from the agenda page: these
                 two entries never go out of date, unlike the rest of that page.
                 --image-url feeds the blurred copies behind each photo; the
                 same trick the agenda page uses. -->
            <section class="info">
                <div class="titre reveal-on-scroll">
                    <h2>Au club</h2>
                </div>

                <div class="info-grid">
                    <article class="info-card reveal-on-scroll">
                        <div class="info-media" style="--image-url: url('/img/WomanServing.webp')" aria-hidden="true">
                            <img src="/img/WomanServing.webp" alt="" width="200" height="200" loading="lazy" decoding="async">
                        </div>
                        <div class="info-body">
                            <h3>Venez jouer</h3>
                            <p>Venez jouer dans un magnifique d&eacute;cor de campagne&nbsp;!</p>
                            <a class="button1 btn-bg-blue info-link" href="/reservation">
                                <p>R&eacute;server un court</p>
                            </a>
                        </div>
                    </article>

                    <article class="info-card reveal-on-scroll">
                        <div class="info-media" style="--image-url: url('/img/ServiceDeCordage.webp')" aria-hidden="true">
                            <img src="/img/ServiceDeCordage.webp" alt="" width="200" height="200" loading="lazy" decoding="async">
                        </div>
                        <div class="info-body">
                            <h3>Service de cordage</h3>
                            <p><b>Vous avez un probl&egrave;me de cordage&nbsp;?</b></p>
                            <p>Beno&icirc;t propose de corder votre raquette.</p>
                            <a class="button1 info-link" href="/contact">
                                <p>Nous contacter</p>
                            </a>
                        </div>
                    </article>
                </div>
            </section>
            </div>
        </div>
        <!-- <div class="events">
            <div class="event1">
                <div class="textEvent">
                    <h1>
                        CAMP DE PAQUES 2024
                    </h1>
                    <p>TENNIS & MULTISPORTS</p>
                    <p>du 8 au 12 avril 2024 de 9h à 17h.</p>
                    <p>Possibilité d'arriver dès 8h30 et de rester jusqu'à 17h30.</p>
                    <p>Pour les enfants scolarisés de 1P à 8P.
                    </p>
                    <p>Incription et renseignements ci-dessous ou à info@tcdardagny.ch
                    </p>
                </div>
                <img src="/img/CampPaques2024.webp" alt="Affiche Camp de paques 2024">
            </div>

            <div class="event2">
                <div class="textEvent">
                    <h1>
                        TENNIS APERO <br> 18 AVRIL
                    </h1>
                    <p>Jeudi 18 avril 2024 de 17h à 20h
                    </p>
                    <p>Enfants, Jeunes et Adultes,
                    </p>
                    <p>Membres et non-membres
                    </p>
                    <p>venez partager un moment de convivialité autour du terrain et
                        fêter le début de la saison
                    </p>
                    <p>En cas de pluie, l'événement sera reporté au jeudi 25 avril de 17h à 20h
                    </p>
                </div>
                <img src="/img/TennisApero18Avril.webp" alt="Affiche tennis apreo 18 Avril">
            </div>
        </div> -->
    </main>

    <?php $page_scripts = ['revealOnScroll.js', 'heroScroll.js', 'wipeOnScroll.js'];
    include __DIR__ . '/../includes/footer.php'; ?>
    <script>
        let slideIndex = 1;
        let slideAuto = setInterval(() => {
            plusSlides(1)
        }, 5000)
        showSlides(slideIndex)

        function plusSlides(nb) {
            showSlides(slideIndex += nb);
        }

        function currentSlide(nb) {
            showSlides(slideIndex = nb);
        }

        function showSlides(nb) {

            let i;
            let slides = document.getElementsByClassName("carouselSlides");
            let dots = document.getElementsByClassName("dot");
            // The hero currently has no carousel; without this the timer threw
            // a TypeError on slides[-1] every five seconds.
            if (slides.length === 0) {
                clearInterval(slideAuto);
                return;
            }
            if (nb > slides.length) {
                slideIndex = 1
            };
            if (nb < 1) {
                slideIndex = slides.length
            }
            // Hide all slides
            for (i = 0; i < slides.length; i++) {
                slides[i].style.display = "none";
            }
            // Deactivate all dots
            for (i = 0; i < dots.length; i++) {
                dots[i].className = dots[i].className.replace(" active", "");
            }
            // Show correct slide and dot
            slides[slideIndex - 1].style.display = "block";
            dots[slideIndex - 1].className += " active";
            // Clear interval so when a dot or arrow is clicked the five seconds reset to prevent slide skip just after manual skip
            clearInterval(slideAuto);
            slideAuto = setInterval(() => {
                plusSlides(1)
            }, 5000)
        }
    </script>
    <script src="/js/enterAnimation.js"></script>

    <!-- three.js is vendored under /js/vendor rather than pulled from a CDN, so
         the hero does not depend on a third party to render. The import map
         lets its own `import ... from 'three'` statements resolve. -->
    <script type="importmap">
        {
            "imports": {
                "three": "/js/vendor/three.module.min.js",
                "three/addons/": "/js/vendor/"
            }
        }
    </script>
    <script type="module" src="/js/heroBalls.js"></script>
</body>

</html>