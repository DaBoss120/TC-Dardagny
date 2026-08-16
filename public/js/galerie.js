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
 * Dragging is the one place `transform` is still used: it's a
 * per-pointermove, continuously-driven motion (not a one-shot eased
 * transition to a fixed target), so it stays on the compositor-only,
 * reflow-free `transform` for smoothness. A vertical drag only ever scales
 * uniformly, so it never distorts — the crop-matching only matters for the
 * differently-shaped open/close transitions.
 *
 * --- Swiping between photos -----------------------------------------------
 * There are THREE frame elements, not one: previous, current and next.
 * Every photo has its own aspect ratio and therefore its own rest box, so a
 * swipe track can't be one strip of equal-width pages — instead each frame
 * sits at its own centered rest box, and the neighbours are pushed a whole
 * "page" (viewport width + a gutter) to either side. A horizontal drag
 * translates all three by the same live delta, so the outgoing photo leaves
 * and the incoming one arrives at its own correct size, tracking the finger
 * the entire way (no waiting for release).
 *
 * Committing a swipe ROTATES THE ROLES rather than moving content between
 * elements: the frame that just slid into view literally becomes the
 * current frame, and the one that left is recycled into the far neighbour
 * slot with a new photo. Copying `src` from one element to another at the
 * end of the gesture would risk a decode flash on exactly the frame the eye
 * is fixed on; rotating a pointer costs nothing and can't flash.
 *
 * Because `activeButton` follows the current index, every close path
 * automatically shrinks back into the tile of whatever photo is on screen
 * *now*, not the one that was originally clicked.
 *
 * Every dismissal path (X, backdrop click, Escape, swipe down) works
 * whether the photo is fully open OR still mid-opening: `close()` just
 * retargets whatever CSS transition is already running (browsers handle
 * that gracefully), and a drag that starts before the open animation
 * finishes freezes the frame's current in-flight size as its own starting
 * point (`freezeCurrentBox`) so the same drag math applies either way.
 */
document.addEventListener('DOMContentLoaded', () => {
    const items = Array.from(document.querySelectorAll('.gallery-item'));
    const lightbox = document.getElementById('gallery-lightbox');
    if (!items.length || !lightbox) return;

    const backdrop = lightbox.querySelector('.gallery-lightbox-backdrop');
    const closeButton = lightbox.querySelector('.gallery-lightbox-close');
    const prevArrow = lightbox.querySelector('.gallery-lightbox-arrow.is-prev');
    const nextArrow = lightbox.querySelector('.gallery-lightbox-arrow.is-next');

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
    // How long a spring-back's temporary backdrop override sticks around
    // before handing control back to the CSS class rule — just a safety
    // buffer past the 0.3s transition it's protecting.
    const BACKDROP_RESTORE_BUFFER = 420;

    // Drag feedback dials the backdrop's blur radius and tint strength down
    // together as the photo is dragged away, instead of fading its opacity.
    // Opacity would fade the *whole* backdrop (tint and blur alike) as one
    // flat layer, which reads as fake because a real pane of frosted glass
    // doesn't become transparent as you pull something out from behind it —
    // it just stops being frosted. Driving `backdrop-filter` and the tint's
    // own alpha channel instead keeps the backdrop element itself always
    // fully opaque, so what's actually changing is how much it blurs and
    // tints what's behind it — a real-time blur easing off, not a
    // transparency trick. Must match the base values in galerie.css's
    // `.gallery-lightbox-backdrop` rule.
    const BACKDROP_BLUR_MAX = 16;
    const BACKDROP_TINT_RGB = '8, 15, 26';
    const BACKDROP_TINT_ALPHA_MAX = 0.92;

    // --- Swipe tuning ---
    // Gap between two photos while a swipe is in flight, so they read as
    // separate pages rather than one seam-less strip.
    const SWIPE_GAP = 40;
    const SWIPE_SETTLE_DURATION = reducedMotion ? 1 : 320;
    const EASE_SWIPE = 'cubic-bezier(0.22, 1, 0.36, 1)';
    // A gesture is committed either by distance OR by a flick — a fast,
    // short swipe should advance just like a slow, long one.
    const SWIPE_VELOCITY = 0.45; // px per ms
    // How far a pointer has to travel before the gesture is locked to one
    // axis. Below this, it's still ambiguous and nothing should move: a
    // slightly diagonal swipe must not both slide sideways AND start
    // shrinking to dismiss.
    const AXIS_LOCK_THRESHOLD = 8;
    // Pull against a swipe that has nowhere to go (first/last photo).
    const EDGE_RESISTANCE = 0.28;

    const swipeThreshold = () => Math.min(120, window.innerWidth * 0.25);

    // closed -> opening -> open -> (dragging -> settling/open/opening, or) closing -> closed
    let state = 'closed';
    let activeButton = null;
    let currentIndex = 0;
    let dragStart = null;
    let dragBox = null; // the frame's real box at the moment the current drag began
    let dragAxis = null; // null (undecided) | 'x' (swipe) | 'y' (dismiss)
    let backdropCleanupTimer = null;
    // Last two horizontal samples, enough for a flick-velocity estimate.
    let swipeLast = null;
    let swipePrev = null;

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

    // --- The three recycled frames ------------------------------------------
    // The markup ships one frame; the other two are clones of it, so the
    // count lives here rather than being duplicated in the template.
    const SLIDE_COUNT = 3;
    const templateFrame = lightbox.querySelector('.gallery-lightbox-frame');
    const slides = [];
    for (let i = 0; i < SLIDE_COUNT; i++) {
        const frameEl = i === 0 ? templateFrame : templateFrame.cloneNode(true);
        if (i !== 0) templateFrame.parentNode.insertBefore(frameEl, templateFrame);
        slides.push({
            frame: frameEl,
            img: frameEl.querySelector('.gallery-lightbox-img'),
            button: null,   // the grid tile this slide is currently showing
            restBox: null,
            preload: null,
            offset: 0,      // -1 / 0 / +1 — which page slot it occupies
        });
    }

    // Which array position currently holds the on-screen photo. Swiping
    // advances this pointer instead of moving photos between elements.
    let currentSlot = 0;
    // How far the whole three-frame track is displaced from its resting
    // arrangement, in px. Non-zero only mid-swipe.
    let trackDelta = 0;
    let pageWidth = window.innerWidth + SWIPE_GAP;

    // `frame` always aliases the current slide's element. It's reassigned
    // (not rebuilt) when a swipe commits, which is why every listener below
    // is bound to each frame individually and guards on being the current
    // one, rather than being bound to `frame` once.
    let frame = slides[0].frame;

    const slotForOffset = (offset) => slides[(currentSlot + offset + SLIDE_COUNT) % SLIDE_COUNT];
    const setRoles = () => {
        for (let offset = -1; offset <= 1; offset++) slotForOffset(offset).offset = offset;
    };

    const setSlideBox = (slide, box, radiusPx) => {
        slide.frame.style.width = `${box.width}px`;
        slide.frame.style.height = `${box.height}px`;
        slide.frame.style.left = `${box.left}px`;
        slide.frame.style.top = `${box.top}px`;
        slide.frame.style.borderRadius = `${radiusPx}px`;
    };
    const setFrameBox = (box, radiusPx) => setSlideBox(slides[currentSlot], box, radiusPx);

    const applyTrack = () => {
        slides.forEach(slide => {
            slide.frame.style.transform = `translateX(${slide.offset * pageWidth + trackDelta}px)`;
        });
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

    // Exactly one grid tile is hidden at a time: the one whose photo is
    // currently on screen, so the close animation never lands next to a
    // duplicate of itself. Swiping moves that hidden marker along with the
    // current index, which is what makes closing land on the right tile.
    const setActiveButton = (button) => {
        if (activeButton === button) return;
        if (activeButton) activeButton.classList.remove('is-source-active');
        activeButton = button;
        if (activeButton) activeButton.classList.add('is-source-active');
    };

    // Swiping can walk a long way from the tile that was originally
    // clicked, and every close shrinks back into whichever tile is current
    // — so if that tile has scrolled out of view, the photo would fly off
    // the edge of the screen to reach it. Pulling it into view the moment
    // the swipe commits fixes that, and is never seen: the lightbox is
    // covering the whole viewport at the time. The scroll lock comes off
    // for the call because `overflow: hidden` on the viewport can block
    // programmatic scrolling too, and goes straight back on within the same
    // tick, so nothing renders in between.
    const revealCurrentTile = () => {
        if (!activeButton) return;
        const wasLocked = document.body.classList.contains('no-scroll');
        if (wasLocked) document.body.classList.remove('no-scroll');
        try {
            activeButton.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
        } catch (error) {
            // Older engines reject `behavior: 'instant'` on the options form.
            activeButton.scrollIntoView(true);
        }
        if (wasLocked) document.body.classList.add('no-scroll');
    };

    const abandonPreload = (slide) => {
        if (!slide.preload) return;
        // Sets the request into a canceled state in every major browser —
        // the standard way to actually stop an in-flight `Image` fetch/
        // decode rather than just ignoring its result.
        slide.preload.src = '';
        slide.preload = null;
    };

    const abandonAllPreloads = () => slides.forEach(abandonPreload);

    // Shows the grid tile's own (already-loaded) thumbnail immediately, then
    // swaps in the full-resolution photo once it's finished loading AND
    // decoding. Both crop identically via `object-fit: cover`, so the swap
    // never shifts position or shape — only sharpness.
    const loadPhotoInto = (slide, button) => {
        const thumbImg = button.querySelector('img');
        slide.img.src = thumbImg ? thumbImg.src : '';
        slide.img.alt = button.dataset.alt || '';

        // A previous photo's preload may still be downloading/decoding in
        // the background — left alone, it just keeps burning CPU and
        // bandwidth competing with this one (worse the heavier that photo
        // was), for a result nobody's going to see.
        abandonPreload(slide);

        const fullSrc = button.dataset.full;
        if (!fullSrc) return;
        const preload = new Image();
        slide.preload = preload;
        preload.src = fullSrc;
        // decode() resolves once the image is fully decoded and ready to
        // paint with no delay — unlike `onload`, which can fire before
        // decoding (the expensive part for a large photo) is actually
        // done, risking a stutter right as it's swapped in mid-animation.
        preload.decode().catch(() => {}).then(() => {
            if (slide.preload === preload) slide.preload = null;
            // Swiping may have recycled this slide onto a different photo
            // (or closed the gallery) by the time a slow fetch finishes —
            // only apply it if this is still what the slide is showing.
            if (slide.button === button) slide.img.src = fullSrc;
        });
    };

    const refreshRestBox = (slide) => {
        if (!slide.button) {
            slide.restBox = null;
            return;
        }
        const naturalWidth = parseInt(slide.button.dataset.width, 10) || 1;
        const naturalHeight = parseInt(slide.button.dataset.height, 10) || 1;
        slide.restBox = computeRestBox(naturalWidth, naturalHeight);
    };

    // Points a slide at a photo. The early return matters: when a swipe
    // commits, the outgoing photo stays loaded in its recycled slide, and
    // re-assigning it would throw away the full-resolution image it already
    // has and visibly drop back to the thumbnail.
    const assignPhoto = (slide, button) => {
        if (slide.button === button) return;
        slide.button = button;
        abandonPreload(slide);
        if (!button) {
            // Past the first/last photo there is nothing to slide in.
            slide.frame.style.display = 'none';
            slide.restBox = null;
            slide.img.removeAttribute('src');
            return;
        }
        slide.frame.style.display = '';
        loadPhotoInto(slide, button);
    };

    // Parks both neighbours off-screen at their own rest boxes, ready to be
    // dragged in. Never touches the current slide — its box belongs to the
    // open/close animation.
    const layoutNeighbours = () => {
        [-1, 1].forEach(offset => {
            const slide = slotForOffset(offset);
            assignPhoto(slide, items[currentIndex + offset] || null);
            if (!slide.button) return;
            refreshRestBox(slide);
            slide.frame.style.transition = 'none';
            setSlideBox(slide, slide.restBox, OPEN_RADIUS);
            slide.frame.style.boxShadow = OPEN_SHADOW;
        });
    };

    const updateArrows = () => {
        if (prevArrow) prevArrow.classList.toggle('is-disabled', !items[currentIndex - 1]);
        if (nextArrow) nextArrow.classList.toggle('is-disabled', !items[currentIndex + 1]);
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
    // Fades the drop shadow in on a frame that has just come to rest at
    // full open size — shared by the open animation and by every swipe
    // settle, which both end in exactly that state.
    const fadeShadowIn = () => {
        frame.style.transition = `box-shadow ${SHADOW_FADE_DURATION}ms ease`;
        frame.style.boxShadow = OPEN_SHADOW;
    };
    const markOpened = () => {
        disarmBoxSettle();
        if (state !== 'opening') return;
        state = 'open';
        fadeShadowIn();
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
        const restBox = slides[currentSlot].restBox;
        frame.style.transition = BOX_PROPERTIES.map(p => `${p} ${OPEN_DURATION}ms ${EASE_OPEN}`).join(', ');
        setFrameBox(restBox, OPEN_RADIUS);
        armBoxSettle(OPEN_DURATION, markOpened);
    }

    function open(index) {
        if (state !== 'closed') return;
        state = 'opening';

        const button = items[index];
        // Measured before setActiveButton() hides the tile — a hidden tile
        // still reports a correct box, but there is no reason to rely on
        // that here the way markClosed() has to.
        const sourceRect = button.getBoundingClientRect();

        currentIndex = index;
        currentSlot = 0;
        setRoles();
        frame = slides[currentSlot].frame;

        pageWidth = window.innerWidth + SWIPE_GAP;
        setActiveButton(button);
        assignPhoto(slides[currentSlot], button);
        refreshRestBox(slides[currentSlot]);

        // Snap the frame's real box (not a transform) to exactly overlap the
        // clicked tile, so `object-fit: cover` on the photo crops it
        // identically to the tile's own thumbnail — nothing to hide yet.
        // No shadow either, matching the (shadowless) tile; it fades in
        // once the frame settles at its full open size (markOpened).
        trackDelta = 0;
        slides.forEach(slide => { slide.frame.style.transition = 'none'; });
        layoutNeighbours();
        setFrameBox(sourceRect, tileRadiusOf(button));
        applyTrack();
        frame.style.boxShadow = NO_SHADOW;

        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
        updateArrows();

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
        // Mid-swipe-settle: resolve the swipe first so `activeButton` is
        // the photo actually arriving, and the shrink therefore lands on
        // its tile rather than on the one being left behind.
        if (state === 'settling') finishSwipe();
        state = 'closing';

        const sourceRect = currentSourceRect();

        lightbox.classList.remove('is-visible');
        // A drag may have left an inline transition (and a spring-back's
        // delayed cleanup still pending) on the backdrop; hand control back
        // to the CSS class transition for the opacity fade-out. The blur/
        // tint values themselves are deliberately left as whatever the drag
        // last set them to (or their CSS defaults, if there was no drag) —
        // resetting them here would snap the backdrop to full strength for
        // one frame right as the fade-out starts, flashing it back to full
        // blur/tint before it fades. finishClose() clears them once the
        // fade is actually done and nothing is visible to jump.
        if (backdropCleanupTimer) {
            clearTimeout(backdropCleanupTimer);
            backdropCleanupTimer = null;
        }
        backdrop.style.transition = '';
        // The grid tile stays hidden until finishClose() — it renders the
        // exact same crop as the frame at that point, so revealing it any
        // earlier means seeing both at once for the whole shrink animation.

        // Whatever's currently happening — settled open, still mid-open, or
        // mid-drag — bake it into a real box first, so the shrink always
        // starts from exactly where things visually are right now.
        freezeCurrentBox();

        // Closing part-way through a horizontal swipe: the current frame's
        // on-screen position is now baked into its box, so drop the track
        // offset and park the neighbours back off-screen. Otherwise a
        // half-swiped-in neighbour would just sit there, frozen, for the
        // whole shrink.
        trackDelta = 0;
        slides.forEach(slide => {
            if (slide === slides[currentSlot]) return;
            slide.frame.style.transition = 'none';
            slide.frame.style.transform = `translateX(${slide.offset * pageWidth}px)`;
        });

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
        abandonAllPreloads();
        frame.style.transition = 'none';
        // Now that the fade-out is done and the lightbox is invisible, it's
        // safe to drop any drag-time blur/tint override so the next open()
        // starts clean at the CSS defaults.
        backdrop.style.backdropFilter = '';
        backdrop.style.webkitBackdropFilter = '';
        backdrop.style.backgroundColor = '';
        setActiveButton(null);
        document.body.classList.remove('no-scroll');
        slides.forEach(slide => {
            slide.img.removeAttribute('src');
            slide.button = null;
            slide.restBox = null;
        });
        dragStart = null;
        dragBox = null;
        dragAxis = null;
        trackDelta = 0;
        state = 'closed';
    }

    // --- Swipe settle / commit ---------------------------------------------
    // `pendingSwipeDir` is the direction the in-flight settle is heading:
    // +1 next, -1 previous, 0 snapping back to where it started. It's the
    // single source of truth for what `finishSwipe()` should do, so an
    // interruption (a new drag, a close) can cancel it by clearing it.
    let pendingSwipeDir = null;
    let swipeSettleTimer = null;

    function settleTrack(dir) {
        pendingSwipeDir = dir;
        state = 'settling';

        // Make sure the drag's last transform has actually been committed
        // as a style before we attach a transition to the next one —
        // otherwise the browser can coalesce both into a single change and
        // there is nothing left to animate between.
        void frame.offsetWidth;

        const snappingBack = dir === 0;
        const restBox = slides[currentSlot].restBox;
        slides.forEach(slide => {
            const parts = [`transform ${SWIPE_SETTLE_DURATION}ms ${EASE_SWIPE}`];
            // A swipe can begin before the open animation has finished, in
            // which case the current frame is frozen part-grown. When it
            // springs back it has to finish growing at the same time as it
            // slides home, so its box rides along in the same transition.
            if (snappingBack && slide === slides[currentSlot] && restBox) {
                parts.push(...BOX_PROPERTIES.map(p => `${p} ${OPEN_DURATION}ms ${EASE_OPEN}`));
            }
            slide.frame.style.transition = parts.join(', ');
        });
        if (snappingBack && restBox) setFrameBox(restBox, OPEN_RADIUS);

        trackDelta = -dir * pageWidth;
        applyTrack();

        if (swipeSettleTimer) clearTimeout(swipeSettleTimer);
        const wait = (snappingBack ? Math.max(SWIPE_SETTLE_DURATION, OPEN_DURATION) : SWIPE_SETTLE_DURATION) + 50;
        swipeSettleTimer = setTimeout(finishSwipe, wait);
    }

    // Turns the finished slide motion into a new resting arrangement: the
    // frame that arrived becomes the current one, the frame that left is
    // recycled into the far slot with a new photo, and the track offset
    // goes back to zero.
    function finishSwipe() {
        if (swipeSettleTimer) {
            clearTimeout(swipeSettleTimer);
            swipeSettleTimer = null;
        }
        const dir = pendingSwipeDir;
        pendingSwipeDir = null;
        if (dir === null) return;

        if (dir !== 0) {
            currentIndex += dir;
            currentSlot = (currentSlot + dir + SLIDE_COUNT) % SLIDE_COUNT;
            setRoles();
            frame = slides[currentSlot].frame;
            setActiveButton(items[currentIndex]);
            revealCurrentTile();
        }

        trackDelta = 0;
        slides.forEach(slide => { slide.frame.style.transition = 'none'; });
        layoutNeighbours();
        applyTrack();
        updateArrows();

        // Whichever photo we landed on is now fully open and at rest. The
        // box/transform changes just above were made under `transition:
        // none`; swapping the declaration to box-shadow only (before the
        // next style recalc) means the shadow fades while everything else
        // stays instant.
        state = 'open';
        fadeShadowIn();
    }

    // Freezes an in-flight settle exactly where it is, so a new gesture can
    // pick the track up mid-motion instead of fighting a transition that's
    // still running — what makes rapid, repeated swiping feel continuous.
    const freezeTrack = () => {
        if (swipeSettleTimer) {
            clearTimeout(swipeSettleTimer);
            swipeSettleTimer = null;
        }
        pendingSwipeDir = null;
        const raw = getComputedStyle(frame).transform;
        if (raw && raw !== 'none') {
            try {
                // The current slide's own page offset is 0, so its live
                // translateX IS the track offset.
                trackDelta = new DOMMatrixReadOnly(raw).m41;
            } catch (error) {
                /* keep the last known trackDelta */
            }
        }
        slides.forEach(slide => { slide.frame.style.transition = 'none'; });
        applyTrack();
        void frame.offsetWidth;
    };

    // Arrow buttons and keyboard both drive the exact same motion a swipe
    // does, just starting from a standstill.
    function navigate(dir) {
        if (state === 'settling') finishSwipe();
        if (state !== 'open') return;
        if (!items[currentIndex + dir]) return;
        settleTrack(dir);
    }

    // A single, permanent listener per frame rather than one added fresh
    // per open()/close() call: if a transition gets interrupted mid-flight
    // (exactly what happens when you open/close in quick succession), its
    // own `transitionend` never fires, so a per-call listener waiting to
    // remove itself never would either — leaking one closure per
    // interruption and, with it, a growing pile of never-cleaned-up
    // listeners. Checking `state` on a listener that's always there
    // sidesteps that entirely.
    slides.forEach(slide => {
        slide.frame.addEventListener('transitionend', (event) => {
            if (event.target !== slide.frame || slide.frame !== frame) return;
            if (event.propertyName !== 'width') return;
            if (state === 'opening') markOpened();
            else if (state === 'closing') markClosed();
        });
    });

    items.forEach((button, index) => button.addEventListener('click', () => open(index)));
    closeButton.addEventListener('click', close);
    // No extra state check here — close() already only proceeds outside
    // 'closed'/'closing', which is exactly what lets a backdrop click (or
    // Escape, or the X) interrupt a still-opening photo, not just a fully
    // settled one.
    backdrop.addEventListener('click', close);
    if (prevArrow) prevArrow.addEventListener('click', () => navigate(-1));
    if (nextArrow) nextArrow.addEventListener('click', () => navigate(1));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            close();
            return;
        }
        if (state === 'closed' || state === 'closing') return;
        if (event.key === 'ArrowRight') navigate(1);
        else if (event.key === 'ArrowLeft') navigate(-1);
    });

    // Reposition the rest boxes on resize/orientation change, but only while
    // genuinely at rest — mid-animation or mid-drag this would fight the
    // box change already in flight.
    window.addEventListener('resize', () => {
        pageWidth = window.innerWidth + SWIPE_GAP;
        if (state !== 'open' || !activeButton) return;
        slides.forEach(slide => {
            if (!slide.button) return;
            refreshRestBox(slide);
            slide.frame.style.transition = 'none';
            setSlideBox(slide, slide.restBox, OPEN_RADIUS);
        });
        trackDelta = 0;
        applyTrack();
    });

    // --- Drag (mouse + touch, via Pointer Events) ---------------------------
    // Uses `transform` (not real box properties) since this runs on every
    // pointermove rather than as a single eased transition — transform is
    // compositor-only and stays smooth under that. The vertical branch only
    // ever scales uniformly, so — unlike a mismatched-aspect open/close
    // transform — it never distorts the photo. Allowed to start during
    // 'opening' too (not just once settled 'open'), so the gesture can
    // interrupt an in-progress open exactly like clicking the backdrop can.

    slides.forEach(slide => {
        slide.frame.addEventListener('pointerdown', (event) => {
            if (slide.frame !== frame) return;
            if (state !== 'open' && state !== 'opening' && state !== 'settling') return;
            // Stops a mouse drag from also kicking off the browser's native
            // text/image selection under the cursor.
            event.preventDefault();

            if (state === 'settling') {
                // Grabbing a swipe that is still gliding: take over from
                // wherever it has got to rather than from a rest position.
                freezeTrack();
            } else if (state === 'opening') {
                // Interrupting an in-progress open: freeze the frame at
                // whatever size it's currently grown to, so the drag has a
                // stable real box to work from instead of one still actively
                // being animated out from under it.
                freezeCurrentBox();
            }

            state = 'dragging';
            dragAxis = null;
            dragBox = frame.getBoundingClientRect();
            dragStart = { x: event.clientX, y: event.clientY, track: trackDelta };
            swipeLast = { x: event.clientX, t: event.timeStamp };
            swipePrev = swipeLast;
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

        slide.frame.addEventListener('pointermove', (event) => {
            if (slide.frame !== frame) return;
            if (state !== 'dragging' || !dragStart || !dragBox) return;
            const dx = event.clientX - dragStart.x;
            const dyRaw = event.clientY - dragStart.y;

            // Until the pointer has moved far enough to say which gesture
            // this is, do nothing at all — committing early would let a
            // near-vertical swipe visibly nudge sideways first, or vice
            // versa. Once decided, the axis is locked for the whole drag.
            if (!dragAxis) {
                if (Math.abs(dx) < AXIS_LOCK_THRESHOLD && Math.abs(dyRaw) < AXIS_LOCK_THRESHOLD) return;
                dragAxis = Math.abs(dx) > Math.abs(dyRaw) ? 'x' : 'y';
            }

            if (dragAxis === 'x') {
                swipePrev = swipeLast;
                swipeLast = { x: event.clientX, t: event.timeStamp };
                // Dragging right-to-left (negative dx) pulls the NEXT photo
                // in from the right; left-to-right pulls in the previous.
                let travel = dx;
                const wanted = travel < 0 ? 1 : -1;
                if (!items[currentIndex + wanted]) travel *= EDGE_RESISTANCE;
                trackDelta = dragStart.track + travel;
                applyTrack();
                return;
            }

            // Resist dragging upward — this gesture is specifically "swipe down".
            const dy = dyRaw < 0 ? dyRaw * 0.35 : dyRaw;
            const scale = Math.max(0.72, 1 - Math.abs(dy) / 900);

            // `transform-origin` is top-left, so scale() alone shrinks the
            // frame toward its top-left corner — visibly drifting it away from
            // the cursor as it shrinks. Adding back half of what the scale
            // removes from each axis re-centers that shrink, so the frame
            // tracks the pointer exactly instead. Uses `dragBox` (the frame's
            // real size when this drag began), not the rest box — if this drag
            // interrupted an in-progress open, those two can differ.
            const compensateX = (dragBox.width / 2) * (1 - scale);
            const compensateY = (dragBox.height / 2) * (1 - scale);

            // The leading translateX keeps any track offset this drag
            // inherited (from grabbing a settle mid-glide) instead of
            // snapping the photo back to centre before it starts shrinking.
            frame.style.transform = `translateX(${trackDelta}px) translate(${dx + compensateX}px, ${dy + compensateY}px) scale(${scale})`;

            const backdropStrength = Math.max(0.15, 1 - Math.abs(dy) / 400);
            backdrop.style.backdropFilter = `blur(${BACKDROP_BLUR_MAX * backdropStrength}px)`;
            backdrop.style.webkitBackdropFilter = backdrop.style.backdropFilter;
            backdrop.style.backgroundColor = `rgba(${BACKDROP_TINT_RGB}, ${BACKDROP_TINT_ALPHA_MAX * backdropStrength})`;
        });

        slide.frame.addEventListener('pointerup', endDrag);
        slide.frame.addEventListener('pointercancel', endDrag);
    });

    function endDrag(event) {
        if (state !== 'dragging' || !dragStart) return;
        frame.classList.remove('is-grabbing');
        const dy = event.clientY - dragStart.y;
        const axis = dragAxis;
        dragStart = null;
        dragBox = null;
        dragAxis = null;

        if (axis === 'x') {
            // Commit on a flick even if it barely moved, or on distance even
            // if it ended slow. `trackDelta` (not this drag's dx) is what
            // counts, so a swipe that picked up a still-gliding previous one
            // is judged on total travel rather than starting from scratch.
            let velocity = 0;
            if (swipeLast && swipePrev && swipeLast.t > swipePrev.t) {
                velocity = (swipeLast.x - swipePrev.x) / (swipeLast.t - swipePrev.t);
            }
            let dir = 0;
            if (Math.abs(velocity) > SWIPE_VELOCITY) dir = velocity < 0 ? 1 : -1;
            else if (Math.abs(trackDelta) > swipeThreshold()) dir = trackDelta < 0 ? 1 : -1;
            if (dir && !items[currentIndex + dir]) dir = 0;
            settleTrack(dir);
            return;
        }

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
        // freezeCurrentBox() baked this frame's on-screen position into its
        // box, so the track offset has served its purpose — clear it and
        // push the neighbours back to their parked positions, or they would
        // keep an offset nothing is tracking any more.
        trackDelta = 0;
        applyTrack();
        growToRest();

        backdrop.style.transition = 'backdrop-filter 0.3s ease, background-color 0.3s ease';
        backdrop.style.backdropFilter = `blur(${BACKDROP_BLUR_MAX}px)`;
        backdrop.style.webkitBackdropFilter = backdrop.style.backdropFilter;
        backdrop.style.backgroundColor = `rgba(${BACKDROP_TINT_RGB}, ${BACKDROP_TINT_ALPHA_MAX})`;
        // If an earlier spring-back's cleanup is still pending (another
        // drag started before it fired), drop it — its delayed reset
        // would otherwise land on top of whatever this one, or a
        // subsequent open/close, sets up next.
        if (backdropCleanupTimer) clearTimeout(backdropCleanupTimer);
        backdropCleanupTimer = setTimeout(() => {
            // Let the CSS class rule resume ownership once the snap-back settles.
            backdrop.style.transition = '';
            backdrop.style.backdropFilter = '';
            backdrop.style.webkitBackdropFilter = '';
            backdrop.style.backgroundColor = '';
            backdropCleanupTimer = null;
        }, BACKDROP_RESTORE_BUFFER);
    }
});
