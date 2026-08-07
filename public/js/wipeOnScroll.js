"use strict";

/**
 * Left-to-right wipe for decorative layers, triggered by scroll position.
 *
 * Put `wipe-on-scroll` on a container and it reveals the same way the hero
 * bands do during the intro — a clip-path edge sweeping across — when it comes
 * into view, and resets when it leaves so the effect replays on the way back.
 *
 * The hidden state lives behind the `wipe-armed` class, which this script adds
 * itself. Without JavaScript nothing is armed and the decoration simply shows,
 * rather than staying invisible forever.
 *
 * Wrapped in an IIFE: the site's scripts are classic <script> tags sharing one
 * global scope, and bare top-level declarations have collided before.
 */
(function () {
    /* How far into the viewport the element's leading edge has to come before
       the wipe starts, as a fraction of viewport height. */
    const TRIGGER_INSET = '-12%';

    const targets = document.querySelectorAll('.wipe-on-scroll');
    if (!targets.length) return;

    // Reduced motion: leave everything visible and unarmed.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    if (!('IntersectionObserver' in window)) return;

    /* What gets observed is NOT what gets wiped.
       IntersectionObserver takes clip-path into account, and the armed state
       clips the target to zero width — so observing it directly means it never
       reports as intersecting and can never un-clip itself. The parent is the
       honest stand-in for "is this decoration on screen". */
    const triggerFor = (target) => target.parentElement || target;
    const wiped = new Map();

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const target = wiped.get(entry.target);
            if (!target) return;
            // Toggle rather than add: dropping the class on the way out is what
            // lets the wipe run again next time the section is scrolled to.
            target.classList.toggle('wipe-in', entry.isIntersecting);
        });
    }, { threshold: 0, rootMargin: `0px 0px ${TRIGGER_INSET} 0px` });

    targets.forEach((target) => {
        target.classList.add('wipe-armed');
        const trigger = triggerFor(target);
        wiped.set(trigger, target);
        observer.observe(trigger);
    });
})();
