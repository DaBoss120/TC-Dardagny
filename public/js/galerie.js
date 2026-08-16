"use strict";

/**
 * Gallery lightbox.
 *
 * Open/close animate the frame's real `width`/`height`/`left`/`top`
 * (not `transform`) between the clicked tile's on-screen box and the
 * centered, viewport-fit rest box. `object-fit: cover` on the photo inside
 * recomputes its crop from those actual box dimensions every frame, so as
 * the frame's aspect ratio morphs between the tile's square and the
 * photo's natural shape, the crop reveals/hides more of the photo
 * continuously — same idea as the FLIP technique
 * (https://aerotwist.com/blog/flip-your-animations/), just animating real
 * layout box properties instead of a transform, because `transform: scale`
 * only rescales an already-cropped result (a non-uniform scale visibly
 * squishes it) rather than re-cropping it.
 *
 * Since the crop always matches the tile's own thumbnail, there's no swap
 * to hide: opening can start immediately from the already-loaded
 * thumbnail (no waiting on a network fetch), and the full-resolution photo
 * swaps in once it's finished loading in the background — since it crops
 * identically, that swap only changes sharpness, not shape.
 *
 * Dragging to dismiss is the one place `transform` is still used: it's a
 * per-pointermove, continuously-driven scale (not a one-shot eased
 * transition to a fixed target), so it stays on the compositor-only,
 * reflow-free `transform` for smoothness. It only ever scales uniformly,
 * so it never distorts — the crop-matching only matters for the
 * differently-shaped open/close transitions.
 *
 * Every dismissal path (X, backdrop click, Escape, swipe) works whether
 * the photo is fully open OR still mid-opening: `close()` just retargets
 * whatever CSS transition is already running (browsers handle that
 * gracefully), and a drag that starts before the open animation finishes
 * freezes the frame's current in-flight size as its own starting point
 * (`freezeCurrentBox`) so the same drag math applies either way.
 */
document.addEventListener('DOMContentLoaded', () => {
    const items = Array.from(document.querySelectorAll('.gallery-item'));
    const lightbox = document.getElementById('gallery-lightbox');
    if (!items.length || !lightbox) return;

    const frame = lightbox.querySelector('.gallery-lightbox-frame');
    const img = lightbox.querySelector('.gallery-lightbox-img');
    const backdrop = lightbox.querySelector('.gallery-lightbox-backdrop');
    const closeButton = lightbox.querySelector('.gallery-lightbox-close');

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const OPEN_DURATION = reducedMotion ? 1 : 480;
    const CLOSE_DURATION = reducedMotion ? 1 : 380;
    const EASE_OPEN = 'cubic-bezier(0.34, 1.56, 0.64, 1)'; // slight overshoot: a soft "pop"
    const EASE_CLOSE = 'cubic-bezier(0.22, 1, 0.36, 1)';
    const BOX_PROPERTIES = ['width', 'height', 'left', 'top', 'border-radius'];

    // The frame's own border-radius (its CSS default) once fully open.
    const OPEN_RADIUS = 12;

    // The drop shadow only exists while the frame is at rest (fully open) —
    // off the instant it starts resizing, on a short fade once it settles.
    // A large blurred shadow is expensive to repaint, and doubly so on an
    // element that's *also* changing size every frame (which forces a full
    // layout reflow already); confining it to a brief, separate fade keeps
    // it off the table during the actual (longer) resize animation instead
    // of compounding with it for the full duration. It also looks better:
    // previously the shadow stayed full-strength — comically oversized —
    // right up until the box had already shrunk to tile size, then popped
    // off abruptly; fading it out as the shrink begins reads as one
    // deliberate motion instead of a glitch at the end.
    const OPEN_SHADOW = '0 24px 70px rgba(0, 0, 0, 0.45)';
    const NO_SHADOW = 'none';
    const SHADOW_FADE_DURATION = 150;

    // Drag-to-dismiss: how far down (px) counts as "let go of it".
    const DISMISS_THRESHOLD = 110;
    // How long a spring-back's temporary backdrop opacity override sticks
    // around before handing control back to the CSS class rule — just a
    // safety buffer past the 0.3s opacity transition it's protecting.
    const BACKDROP_RESTORE_BUFFER = 420;

    // closed -> opening -> open -> (dragging -> open/opening, or) closing -> closed
    let state = 'closed';
    let activeButton = null;
    let restBox = null; // {width, height, left, top} in viewport px — the open/rest box
    let dragStart = null;
    let dragBox = null; // the frame's real box at the moment the current drag began
    let backdropCleanupTimer = null;

    const computeRestBox = (naturalWidth, naturalHeight) => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const marginX = vw < 640 ? 20 : 56;
        const marginY = vw < 640 ? 64 : 64;
        const maxW = Math.max(100, vw - marginX * 2);
        const maxH = Math.max(100, vh - marginY * 2);
        const scale = Math.min(maxW / naturalWidth, maxH / naturalHeight);
        const width = naturalWidth * scale;
        const height = naturalHeight * scale;
        return {
            width,
            height,
            left: (vw - width) / 2,
            top: (vh - height) / 2,
        };
    };

    const setFrameBox = (box, radiusPx) => {
        frame.style.width = `${box.width}px`;
        frame.style.height = `${box.height}px`;
        frame.style.left = `${box.left}px`;
        frame.style.top = `${box.top}px`;
        frame.style.borderRadius = `${radiusPx}px`;
    };

    // Bakes wherever the frame currently, visually sits — including any
    // live drag transform or a still-running open/close transition — into
    // real box coordinates with no transition. Used any time one motion is
    // about to be replaced by another (closing mid-open, dragging mid-open,
    // springing back from a drag), so the new motion starts from exactly
    // where things actually are on screen instead of an assumed rest state.
    const freezeCurrentBox = () => {
        const currentRect = frame.getBoundingClientRect();
        const currentRadius = parseFloat(getComputedStyle(frame).borderRadius) || OPEN_RADIUS;
        const currentShadow = getComputedStyle(frame).boxShadow;
        frame.style.transition = 'none';
        frame.style.transform = 'none';
        setFrameBox(currentRect, currentRadius);
        frame.style.boxShadow = currentShadow;
        void frame.offsetWidth;
        return currentRect;
    };

    // Measures the tile BUTTON, never the <img> inside it. The two occupy the
    // same box (the img is width/height 100% of a border-less, padding-less
    // button), but the img carries the hover/focus `scale(1.06)` zoom — and
    // getBoundingClientRect() reports the post-transform box, so measuring
    // the img returns a rect up to 6% larger than the tile really is. That
    // is invisible with a mouse (the pointer has left the tile by the time
    // anything is measured), but on a touch screen `:hover` latches onto the
    // tapped tile and stays, so the close animation shrank to a box ~6% too
    // big and then snapped to the real size on the swap. The button never
    // carries a transform, so its rect is always the true layout box, on any
    // device and whatever state the image inside is in.
    const currentSourceRect = () => activeButton.getBoundingClientRect();
    const tileRadiusOf = (button) => parseFloat(getComputedStyle(button).borderRadius) || OPEN_RADIUS;

    // The full-resolution photo currently being fetched/decoded in the
    // background, if any — tracked so a later photo can cancel it (see
    // `loadPhotoInto`) instead of leaving it to keep running for nothing.
    let pendingPreload = null;

    const abandonPendingPreload = () => {
        if (!pendingPreload) return;
        // Sets the request into a canceled state in every major browser —
        // the standard way to actually stop an in-flight `Image` fetch/
        // decode rather than just ignoring its result.
        pendingPreload.src = '';
        pendingPreload = null;
    };

    // Shows the grid tile's own (already-loaded) thumbnail immediately, then
    // swaps in the full-resolution photo once it's finished loading AND
    // decoding. Both crop identically via `object-fit: cover`, so the swap
    // never shifts position or shape — only sharpness.
    const loadPhotoInto = (button) => {
        const thumbImg = button.querySelector('img');
        img.src = thumbImg ? thumbImg.src : '';
        img.alt = button.dataset.alt || '';

        // A previous photo's preload may still be downloading/decoding in
        // the background — left alone, it just keeps burning CPU and
        // bandwidth competing with this one (worse the heavier that photo
        // was), for a result nobody's going to see.
        abandonPendingPreload();

        const fullSrc = button.dataset.full;
        if (!fullSrc) return;
        const preload = new Image();
        pendingPreload = preload;
        preload.src = fullSrc;
        // decode() resolves once the image is fully decoded and ready to
        // paint with no delay — unlike `onload`, which can fire before
        // decoding (the expensive part for a large photo) is actually
        // done, risking a stutter right as it's swapped in mid-animation.
        preload.decode().catch(() => {}).then(() => {
            if (pendingPreload === preload) pendingPreload = null;
            // The gallery could have been closed and a different photo
            // opened (or this preload canceled) by the time a slow fetch
            // finishes — only apply it if this is still the photo shown.
            if (activeButton === button) img.src = fullSrc;
        });
    };

    // If a transition's start and end box happen to land on exactly the
    // same values — entirely possible when interrupting one animation with
    // another in rapid succession — the browser fires no transition events
    // for it at all (nothing actually changed, so there's nothing to
    // report "ending"). Without a fallback, that permanently strands the
    // state machine mid-open/mid-close: the tile stays hidden forever and
    // nothing responds to clicks again. This timer guarantees forward
    // progress no matter what the browser's transition events do; the
    // `state` check in `markOpened`/`markClosed` makes it a no-op whenever
    // the real `transitionend` (below) already handled it first.
    let boxSettleTimer = null;
    const armBoxSettle = (duration, onSettle) => {
        if (boxSettleTimer) clearTimeout(boxSettleTimer);
        boxSettleTimer = setTimeout(() => {
            boxSettleTimer = null;
            onSettle();
        }, duration + 50);
    };
    const disarmBoxSettle = () => {
        if (boxSettleTimer) {
            clearTimeout(boxSettleTimer);
            boxSettleTimer = null;
        }
    };
    const markOpened = () => {
        disarmBoxSettle();
        if (state !== 'opening') return;
        state = 'open';
        frame.style.transition = `box-shadow ${SHADOW_FADE_DURATION}ms ease`;
        frame.style.boxShadow = OPEN_SHADOW;
    };
    const markClosed = () => {
        disarmBoxSettle();
        if (state !== 'closing') return;
        // A transition landing on its target in CSS-pixel terms doesn't
        // guarantee it agrees, to the device pixel, with how the grid
        // separately laid the tile out — on some (mostly mobile, higher-
        // DPR) browsers that shows up as the photo settling very slightly
        // larger than the tile for one frame before the swap. Snapping to
        // a fresh measurement taken right now, immediately before the
        // handoff, removes any gap between what the frame last rendered
        // and what the revealed tile looks like, whatever caused it.
        if (!activeButton) {
            finishClose();
            return;
        }
        const freshRect = currentSourceRect();
        frame.style.transition = 'none';
        setFrameBox(freshRect, tileRadiusOf(activeButton));
        // Setting the corrected box and hiding the frame in the very same
        // tick risks the browser coalescing both into one paint — the
        // correction would never actually reach the screen before being
        // swapped out, making it pointless. Forcing a frame in between
        // guarantees the corrected box is the last thing actually rendered.
        requestAnimationFrame(() => finishClose());
    };

    // The second half of opening: transition the frame from wherever it
    // currently sits (as a real box, no transition) to the full rest size.
    // Used both for a normal open and for a drag-that-didn't-dismiss —
    // resuming/re-growing to the full open size the same way either way.
    function growToRest() {
        frame.style.transition = BOX_PROPERTIES.map(p => `${p} ${OPEN_DURATION}ms ${EASE_OPEN}`).join(', ');
        setFrameBox(restBox, OPEN_RADIUS);
        armBoxSettle(OPEN_DURATION, markOpened);
    }

    function open(button) {
        if (state !== 'closed') return;
        state = 'opening';
        activeButton = button;

        const sourceRect = currentSourceRect();
        const naturalWidth = parseInt(button.dataset.width, 10) || sourceRect.width;
        const naturalHeight = parseInt(button.dataset.height, 10) || sourceRect.height;

        restBox = computeRestBox(naturalWidth, naturalHeight);
        loadPhotoInto(button);

        // Snap the frame's real box (not a transform) to exactly overlap the
        // clicked tile, so `object-fit: cover` on the photo crops it
        // identically to the tile's own thumbnail — nothing to hide yet.
        // No shadow either, matching the (shadowless) tile; it fades in
        // once the frame settles at its full open size (markOpened).
        frame.style.transition = 'none';
        frame.style.transform = 'none';
        setFrameBox(sourceRect, tileRadiusOf(button));
        frame.style.boxShadow = NO_SHADOW;

        button.classList.add('is-source-active');
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');

        // Force layout so the instant "snapped to the tile" box above
        // actually paints before we transition away from it.
        void frame.offsetWidth;

        requestAnimationFrame(() => {
            lightbox.classList.add('is-visible');
            growToRest();
        });
    }

    function close() {
        if (state === 'closed' || state === 'closing') return;
        state = 'closing';

        const sourceRect = currentSourceRect();

        lightbox.classList.remove('is-visible');
        // A drag may have left an inline opacity/transition on the backdrop
        // (and a spring-back's delayed cleanup still pending); hand control
        // back to the CSS class transition for the fade-out.
        if (backdropCleanupTimer) {
            clearTimeout(backdropCleanupTimer);
            backdropCleanupTimer = null;
        }
        backdrop.style.transition = '';
        backdrop.style.opacity = '';
        // The grid tile stays hidden until finishClose() — it renders the
        // exact same crop as the frame at that point, so revealing it any
        // earlier means seeing both at once for the whole shrink animation.

        // Whatever's currently happening — settled open, still mid-open, or
        // mid-drag — bake it into a real box first, so the shrink always
        // starts from exactly where things visually are right now.
        freezeCurrentBox();

        // The shadow fade runs on its own, much shorter timer than the
        // shrink — it should be long gone well before the frame reaches
        // tile size, not still visibly fading right up to the end.
        frame.style.transition = [
            ...BOX_PROPERTIES.map(p => `${p} ${CLOSE_DURATION}ms ${EASE_CLOSE}`),
            `box-shadow ${SHADOW_FADE_DURATION}ms ease`,
        ].join(', ');
        setFrameBox(sourceRect, tileRadiusOf(activeButton));
        frame.style.boxShadow = NO_SHADOW;
        armBoxSettle(CLOSE_DURATION, markClosed);
    }

    function finishClose() {
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        img.removeAttribute('src');
        abandonPendingPreload();
        frame.style.transition = 'none';
        if (activeButton) activeButton.classList.remove('is-source-active');
        document.body.classList.remove('no-scroll');
        activeButton = null;
        restBox = null;
        dragStart = null;
        dragBox = null;
        state = 'closed';
    }

    // A single, permanent listener rather than one added fresh per open()/
    // close() call: if a transition gets interrupted mid-flight (exactly
    // what happens when you open/close in quick succession), its own
    // `transitionend` never fires, so a per-call listener waiting to
    // remove itself never would either — leaking one closure per
    // interruption and, with it, a growing pile of never-cleaned-up
    // listeners on `frame`. Checking `state` on a listener that's always
    // there sidesteps that entirely.
    frame.addEventListener('transitionend', (event) => {
        if (event.target !== frame || event.propertyName !== 'width') return;
        if (state === 'opening') markOpened();
        else if (state === 'closing') markClosed();
    });

    items.forEach(button => button.addEventListener('click', () => open(button)));
    closeButton.addEventListener('click', close);
    // No extra state check here — close() already only proceeds outside
    // 'closed'/'closing', which is exactly what lets a backdrop click (or
    // Escape, or the X) interrupt a still-opening photo, not just a fully
    // settled one.
    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') close();
    });

    // Reposition the rest box on resize/orientation change, but only while
    // genuinely at rest — mid-animation or mid-drag this would fight the
    // box change already in flight.
    window.addEventListener('resize', () => {
        if (state !== 'open' || !activeButton) return;
        const naturalWidth = parseInt(activeButton.dataset.width, 10);
        const naturalHeight = parseInt(activeButton.dataset.height, 10);
        restBox = computeRestBox(naturalWidth, naturalHeight);
        setFrameBox(restBox, OPEN_RADIUS);
    });

    // --- Drag (mouse + touch, via Pointer Events) to dismiss ---
    // Uses `transform` (not the frame's real box) since this runs on every
    // pointermove rather than as a single eased transition — transform is
    // compositor-only and stays smooth under that. It only ever scales
    // uniformly, so — unlike a mismatched-aspect open/close transform —
    // it never distorts the photo. Allowed to start during 'opening' too
    // (not just once settled 'open'), so the gesture can interrupt an
    // in-progress open exactly like clicking the backdrop can.

    frame.addEventListener('pointerdown', (event) => {
        if (state !== 'open' && state !== 'opening') return;
        // Stops a mouse drag from also kicking off the browser's native
        // text/image selection under the cursor.
        event.preventDefault();

        if (state === 'opening') {
            // Interrupting an in-progress open: freeze the frame at
            // whatever size it's currently grown to, so the drag has a
            // stable real box to work from instead of one still actively
            // being animated out from under it.
            freezeCurrentBox();
        }

        state = 'dragging';
        dragBox = frame.getBoundingClientRect();
        dragStart = { x: event.clientX, y: event.clientY };
        frame.setPointerCapture(event.pointerId);
        frame.classList.add('is-grabbing');
        frame.style.transition = 'none';
        backdrop.style.transition = 'none';
        // A previous spring-back's delayed cleanup could otherwise fire
        // mid-drag and reset the backdrop out from under it.
        if (backdropCleanupTimer) {
            clearTimeout(backdropCleanupTimer);
            backdropCleanupTimer = null;
        }
    });

    frame.addEventListener('pointermove', (event) => {
        if (state !== 'dragging' || !dragStart || !dragBox) return;
        const dx = event.clientX - dragStart.x;
        const dyRaw = event.clientY - dragStart.y;
        // Resist dragging upward — this gesture is specifically "swipe down".
        const dy = dyRaw < 0 ? dyRaw * 0.35 : dyRaw;
        const scale = Math.max(0.72, 1 - Math.abs(dy) / 900);

        // `transform-origin` is top-left, so scale() alone shrinks the
        // frame toward its top-left corner — visibly drifting it away from
        // the cursor as it shrinks. Adding back half of what the scale
        // removes from each axis re-centers that shrink, so the frame
        // tracks the pointer exactly instead. Uses `dragBox` (the frame's
        // real size when this drag began), not `restBox` — if this drag
        // interrupted an in-progress open, those two can differ.
        const compensateX = (dragBox.width / 2) * (1 - scale);
        const compensateY = (dragBox.height / 2) * (1 - scale);

        frame.style.transform = `translate(${dx + compensateX}px, ${dy + compensateY}px) scale(${scale})`;
        backdrop.style.opacity = String(Math.max(0.15, 1 - Math.abs(dy) / 400));
    });

    const endDrag = (event) => {
        if (state !== 'dragging' || !dragStart) return;
        frame.classList.remove('is-grabbing');
        const dy = event.clientY - dragStart.y;
        dragStart = null;
        dragBox = null;

        if (dy > DISMISS_THRESHOLD) {
            close();
            return;
        }

        // Below threshold: ease back into (or, if this drag interrupted an
        // in-progress open, resume growing toward) the fully open rest
        // position — freezing the drag's current transform into a real box
        // first, then reusing the normal open-completion path handles both
        // cases identically.
        state = 'opening';
        freezeCurrentBox();
        growToRest();

        backdrop.style.transition = 'opacity 0.3s ease';
        backdrop.style.opacity = '1';
        // If an earlier spring-back's cleanup is still pending (another
        // drag started before it fired), drop it — its delayed reset
        // would otherwise land on top of whatever this one, or a
        // subsequent open/close, sets up next.
        if (backdropCleanupTimer) clearTimeout(backdropCleanupTimer);
        backdropCleanupTimer = setTimeout(() => {
            // Let the CSS class rule resume ownership once the snap-back settles.
            backdrop.style.transition = '';
            backdrop.style.opacity = '';
            backdropCleanupTimer = null;
        }, BACKDROP_RESTORE_BUFFER);
    };

    frame.addEventListener('pointerup', endDrag);
    frame.addEventListener('pointercancel', endDrag);
});
