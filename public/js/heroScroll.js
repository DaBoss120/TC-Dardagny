"use strict";

/**
 * Holds the hero back as the page scrolls, so the chevron sweeps across it,
 * and folds the chevron from a flat edge into its shape as you go.
 *
 * The hero is NOT pinned. Pinning it (position: sticky) would mean deciding
 * what happens to the header above it — either it sticks too and eats a chunk
 * of every screen below, or it scrolls off and leaves a gap where the hero
 * stops short of the viewport. Moving the hero's contents down at a fraction
 * of the scroll distance sidesteps that: the hero drifts up slowly while the
 * chevron and the courses panel rise at full speed over it, which reads as the
 * hero being wiped away rather than scrolled past. `overflow: clip` on .hero
 * trims the contents as its box climbs, finishing the wipe.
 *
 * Everything here is written to CSS custom properties, so no layout is touched:
 * .hero-inner only ever gets a transform and an opacity.
 *
 * Wrapped in an IIFE because the site's scripts are classic <script> tags that
 * all share one global scope — a bare `const root` here collided with the one
 * in enterAnimation.js and stopped that whole file from running.
 */
(function () {
    /* Fraction of the scroll distance the hero content is held back by.
       0 = scrolls normally, 1 = fully pinned. */
    const PARALLAX = 0.55;
    /* How far into the hero's height the fade completes. */
    const FADE_OVER = 0.95;
    /* How faint the hero gets by the end of the sweep. Not near zero: the hero
       is still on screen while this runs, and washing it out early looks like a
       bug rather than a transition. */
    const FADE_TO = 0.42;
    /* --- Chevron fold, in pixels of scroll ------------------------------
       Pixels rather than a fraction of the hero, so these mean the same thing
       on any screen and can be dialled by eye.

       CHEVRON_START  dead zone before the fold begins. 0 = starts on the very
                      first pixel of scroll.
       CHEVRON_OVER   distance the fold takes to complete. A mouse wheel notch
                      is roughly 100px, so this finishes inside one or two. */
    const CHEVRON_START = 0;
    const CHEVRON_OVER = 540; //Original : 130

    const docEl = document.documentElement;
    const hero = document.querySelector('.hero');
    const inner = document.querySelector('.hero-inner');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hero || !inner || reducedMotion) return;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    let queued = false;

    const update = () => {
        queued = false;

        const heroHeight = hero.offsetHeight;
        // Distance scrolled from the top of the page. Deliberately NOT measured
        // from the hero's own offsetTop: the hero sits ~208px down the document
        // (the header is above it), so subtracting that gave a dead zone of two
        // whole mouse-wheel notches where nothing moved at all before the
        // effect began. The hero is the first section, so scrollY is the honest
        // measure of how far into the transition the reader is.
        const scrolled = Math.max(0, window.scrollY);
        // Stop holding once the hero is gone, or the content would be dragged
        // down into the section below it.
        const shift = Math.min(scrolled * PARALLAX, heroHeight);
        const fade = 1 - Math.min(scrolled / (heroHeight * FADE_OVER), 1) * (1 - FADE_TO);

        hero.style.setProperty('--hero-shift', `${shift.toFixed(1)}px`);
        hero.style.setProperty('--hero-fade', fade.toFixed(3));

        // 1 = flat, so nothing shows and the hero reads as a clean full screen;
        // 0 = folded to full depth. Eased so the chevron starts to appear
        // gently rather than snapping into an angle on the first pixel.
        const formed = Math.min(Math.max(scrolled - CHEVRON_START, 0) / CHEVRON_OVER, 1);
        docEl.style.setProperty('--chevron-flatness', (1 - easeOutCubic(formed)).toFixed(3));
    };

    const onScroll = () => {
        // One update per frame at most; scroll fires far more often than that.
        if (queued) return;
        queued = true;
        requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
})();
