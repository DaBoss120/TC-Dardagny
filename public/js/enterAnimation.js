"use strict";

/**
 * Home page enter animation.
 *
 * Two angled fences start shut over the viewport, slide apart, and the hero
 * content is revealed behind them.
 *
 * The closed state is applied by the inline script in home.php before the first
 * paint (it adds `enter-anim` to <html>); this file only drives the timeline.
 * Everything visual lives in css/home.css.
 */

/* Must match --fence-open-duration in css/home.css */
const OPEN_DURATION = 1400;
/* How long the fences stay shut once the page is ready */
const HOLD_CLOSED = 400;
/* Start revealing the content this many ms before the fences finish moving,
   so the two motions overlap instead of feeling like separate steps */
const REVEAL_OVERLAP = 500;
/* Delay between each `.enter-reveal` element */
const REVEAL_STAGGER = 150;
/* Longest reveal transition in css/home.css, after which the reveal classes
   are removed so they stop overriding the element's own styles */
const REVEAL_SETTLE = 700;
/* Open anyway after this long, in case an image never finishes loading */
const MAX_WAIT_FOR_LOAD = 2500;

const root = document.documentElement;

/**
 * The hero sizes itself as `100svh - var(--header-height)`. That value depends
 * on the logo, the font and the breakpoint, so it is measured rather than
 * hard-coded.
 *
 * It measures the hero's own offset from the top of the document, not the
 * header's height: the header's inner bar carries a 3rem margin that collapses
 * out of `header.offsetHeight`, so the header reads 160px while actually
 * occupying 208px. The hero's top edge is the number that matters.
 */
function measureHeaderHeight() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    // Zero it first so the reading is not taken against the value it produced.
    root.style.setProperty('--header-height', '0px');
    const offset = hero.getBoundingClientRect().top + window.scrollY;
    root.style.setProperty('--header-height', `${Math.round(offset)}px`);
}

measureHeaderHeight();
window.addEventListener('resize', measureHeaderHeight);
window.addEventListener('load', measureHeaderHeight);

function revealHeroContent() {
    // heroBalls.js runs as a module, so it may not have executed yet when the
    // intro is skipped and this is called straight away. The flag lets it pick
    // up a reveal that already happened.
    window.__tcdHeroRevealed = true;
    document.dispatchEvent(new CustomEvent('tcd:hero-reveal'));

    const title = document.querySelector('.main-title');
    if (title) {
        title.classList.add('end-pos');
    }
    const subtitle = document.querySelector('.sub-title');
    if (subtitle) {
        subtitle.classList.add('end-pos');
    }
    document.querySelectorAll('main .enter-reveal').forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('enter-revealed');
            // Once the element has arrived, drop the reveal classes entirely.
            // They carry their own `transition` and `translate`, which would
            // otherwise keep overriding whatever the element's normal styles
            // do on hover (this is what stopped the buttons scaling up).
            setTimeout(() => {
                element.classList.remove('enter-reveal', 'enter-revealed');
            }, REVEAL_SETTLE);
        }, index * REVEAL_STAGGER);
    });
}

function openFences() {
    root.classList.add('enter-anim-open');

    setTimeout(revealHeroContent, Math.max(0, OPEN_DURATION - REVEAL_OVERLAP));

    setTimeout(() => {
        // Take the fences out of the render tree; they have nothing left to do.
        root.classList.add('enter-anim-done');
        try {
            sessionStorage.setItem('tcd-intro-played', '1');
        } catch (error) {
            // Storage can be unavailable in private browsing — not worth caring about.
        }
    }, OPEN_DURATION);
}

// The inline script decides whether the intro runs at all (reduced motion,
// already seen this session). If it opted out there is nothing to animate.
if (root.classList.contains('enter-anim')) {
    let started = false;

    const start = () => {
        if (started) return;
        started = true;
        setTimeout(openFences, HOLD_CLOSED);
    };

    // Wait for the hero images so the reveal shows a finished page, but never
    // hold the visitor hostage to a slow asset.
    if (document.readyState === 'complete') {
        start();
    } else {
        window.addEventListener('load', start, { once: true });
        setTimeout(start, MAX_WAIT_FOR_LOAD);
    }
} else {
    // No intro: make sure nothing is left in its hidden starting state.
    revealHeroContent();
}
