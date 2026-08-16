"use strict";

/**
 * Adhesion page parallax ball.
 *
 * The background plate and the cut-out ball are two separate images layered
 * with CSS. On load the ball drifts/fades into place; from then on:
 *  - position follows the cursor (a standard parallax offset), and
 *  - rotation follows the cursor's MOVEMENT, not its position — each
 *    mousemove nudges the lean by how far/fast the pointer just traveled,
 *    it gets harder to push the lean further as it nears the max (so it
 *    never slams into the limit), and it's always relaxing back toward
 *    level in the background. Stop moving (or slow down) and that passive
 *    relax quickly wins, easing the ball back to 0deg — instead of a
 *    position-based lean, which would flip back and forth just from
 *    orbiting the cursor around the ball at a constant distance.
 */
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.devenirMembreContent');
    const foreground = document.querySelector('.parallax-foreground');
    if (!container || !foreground) return;

    requestAnimationFrame(() => foreground.classList.add('is-visible'));

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (reducedMotion || !canHover) return;

    // Max travel of the ball in each direction, in pixels.
    const RANGE_X = 26;
    const RANGE_Y = 18;
    // How quickly the ball's on-screen position eases toward the cursor
    // each frame (0-1: higher follows more closely, lower feels floatier).
    const EASING = 0.07;
    const BASE_SCALE = 1.08;

    // Max lean, in degrees each way — the threshold that keeps the rotation
    // from ever looking like it's spinning rather than tilting.
    const MAX_ROTATE = 2;
    // Degrees of lean added per pixel of cursor travel between two
    // mousemove events. Horizontal travel dominates so it reads as
    // "leaning into" the direction of the drag; vertical only adds a
    // small diagonal touch.
    const ROTATE_FROM_DX = 0.16 / 10;
    const ROTATE_FROM_DY = 0.05 / 10;
    // A single mousemove can report a big jump (fast flick, or the pointer
    // re-entering after leaving the container) — cap how much lean one
    // event can add before the resistance curve below even applies.
    const ROTATE_IMPULSE_CAP = 3;
    // Passive pull back toward level, applied every frame regardless of
    // mouse activity. Multiplicative, so it's gentle while the lean is
    // small and has more to grab as the lean is bigger — reads as "slowly
    // settling" rather than a hard reset the moment the cursor stops.
    const ROTATE_DECAY = 0.985; //0.955
    // How closely the rendered rotation follows the (already-smoothed)
    // rotation target each frame.
    const ROTATE_EASING = 0.15;

    let targetX = 0;
    let targetY = 0;
    let targetRotate = 0;
    let currentX = 0;
    let currentY = 0;
    let currentRotate = 0;
    let raf = null;
    let lastPointerX = null;
    let lastPointerY = null;

    const clamp = (value, limit) => Math.max(-limit, Math.min(limit, value));

    // Adds `impulse` to `current`, but the closer `current` already is to
    // the limit in the same direction, the less of the impulse lands — an
    // asymptotic approach instead of a hard wall. Impulses that pull back
    // toward zero are never resisted, so unwinding the lean stays quick.
    const applyImpulseWithResistance = (current, impulse, limit) => {
        const pushingFurther = current !== 0 && Math.sign(impulse) === Math.sign(current);
        const room = pushingFurther ? 1 - Math.min(Math.abs(current) / limit, 1) : 1;
        return clamp(current + impulse * room, limit);
    };

    const onMove = (event) => {
        const rect = container.getBoundingClientRect();
        const relX = (event.clientX - rect.left) / rect.width - 0.5;
        const relY = (event.clientY - rect.top) / rect.height - 0.5;
        targetX = relX * 2 * RANGE_X;
        targetY = relY * 2 * RANGE_Y;

        if (lastPointerX !== null) {
            const dx = event.clientX - lastPointerX;
            const dy = event.clientY - lastPointerY;
            const impulse = clamp(dx * ROTATE_FROM_DX + dy * ROTATE_FROM_DY, ROTATE_IMPULSE_CAP);
            targetRotate = applyImpulseWithResistance(targetRotate, impulse, MAX_ROTATE);
        }
        lastPointerX = event.clientX;
        lastPointerY = event.clientY;
    };

    const onLeave = () => {
        targetX = 0;
        targetY = 0;
        lastPointerX = null;
        lastPointerY = null;
        // targetRotate is left alone — the per-frame decay below relaxes it
        // back to 0 smoothly instead of snapping it level.
    };

    const tick = () => {
        // Always-on relaxation toward level, so stopping (or just slowing
        // down enough that impulses stop outrunning it) settles the lean.
        targetRotate *= ROTATE_DECAY;

        currentX += (targetX - currentX) * EASING;
        currentY += (targetY - currentY) * EASING;
        currentRotate += (targetRotate - currentRotate) * ROTATE_EASING;
        foreground.style.transform =
            `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0) rotate(${currentRotate.toFixed(2)}deg) scale(${BASE_SCALE})`;
        raf = requestAnimationFrame(tick);
    };

    // Let the entrance transition finish before handing transform control
    // over to the per-frame loop, so the two don't fight each other.
    foreground.addEventListener('transitionend', function start(event) {
        if (event.propertyName !== 'transform') return;
        foreground.removeEventListener('transitionend', start);
        foreground.style.transition = 'none';
        container.addEventListener('mousemove', onMove);
        container.addEventListener('mouseleave', onLeave);
        tick();
    });
});
