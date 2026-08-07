/**
 * Hero tennis balls — the 3D layer on the home page.
 *
 * One scene and one camera, drawn onto three stacked canvases split by depth.
 * Each canvas carries a different CSS blur (see .hero-canvas--* in home.css),
 * which is how the far balls read as out of focus: a real depth-of-field pass
 * would mean vendoring three's post-processing stack and paying for a
 * full-screen bokeh shader, and this gets the same read for almost nothing.
 * The blurred layers also render at a lower pixel ratio — nobody can tell,
 * because they are blurred.
 *
 * Balls fly in from the sides rather than using the `.enter-reveal` fade, which
 * keeps them in the same motion language as the title and subtitle.
 * enterAnimation.js fires `tcd:hero-reveal` to start them.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MODEL_URL = '/3d/tennis-ball.glb';

/* Ball layout.
     u, v      centre, as a fraction of the hero box (0,0 = top left)
     size      diameter, as a fraction of the hero height
     z         depth in world units; positive is toward the camera. Position
               and size are compensated for it, so z does NOT move a ball or
               change how big it looks — it selects the blur layer, sets how
               much the ball is darkened, and gives each one its own perspective.
     from      side it flies in from
     big       the focal ball: brighter, sharp, and the only one that follows
               the pointer
     portrait  overrides for a tall hero, where the landscape spread does not
               fit and `size` (being a fraction of height) reads far too big
     hideOnPortrait  dropped entirely on a narrow screen */
const BALLS = [
    // The focal ball. Its `u`/`v` are mirrored by `.hero-buttons` in home.css
    // so the button always sits on top of it.
    {
        u: 0.45, v: 0.58, size: 0.32, z: 1.8, from: 'left', big: true,
        // Bigger proportionally than on desktop so the button sits ON it
        // rather than spanning it like a bar.
        portrait: { u: 0.50, v: 0.62, size: 0.25 },
    },
    {
        u: 0.13, v: 0.33, size: 0.055, z: 0.6, from: 'left',
        portrait: { u: 0.17, v: 0.50, size: 0.038 },
    },
    {
        u: 0.66, v: 0.36, size: 0.038, z: -1.6, from: 'right',
        portrait: { u: 0.08, v: 0.66, size: 0.030 },
    },
    {
        u: 0.88, v: 0.74, size: 0.065, z: 1.0, from: 'right',
        portrait: { u: 0.88, v: 0.88, size: 0.040 },
    },
    {
        u: 0.45, v: 0.88, size: 0.045, z: -0.4, from: 'left',
        portrait: { u: 0.62, v: 0.93, size: 0.030 },
    },
    {
        u: 0.94, v: 0.20, size: 0.032, z: -2.2, from: 'right',
        portrait: { u: 0.90, v: 0.70, size: 0.025 },
    },
    {
        u: 0.07, v: 0.68, size: 0.042, z: -1.0, from: 'left',
        hideOnPortrait: true,
    },
    {
        u: 0.38, v: 0.76, size: 0.028, z: -2.6, from: 'left',
        hideOnPortrait: true,
    },
    {
        u: 0.72, v: 0.62, size: 0.035, z: 1.3, from: 'right',
        hideOnPortrait: true,
    },
    {
        u: 0.20, v: 0.44, size: 0.026, z: -2.9, from: 'left',
        hideOnPortrait: true,
    },
];

/* Depth layers, sharpest first. A ball joins the first layer whose `minZ` it
   clears. `canvas` matches the class suffix in home.php / home.css, where the
   matching blur lives. */
const LAYERS = [
    { suffix: 'near', minZ: 0.0, pixelRatio: 2 },
    { suffix: 'mid', minZ: -1.5, pixelRatio: 1 },
    { suffix: 'far', minZ: -Infinity, pixelRatio: 0.75 },
];

/* Below this width/height ratio the hero counts as portrait. */
const PORTRAIT_ASPECT = 0.9;

const FLY_DURATION = 1.3;    // seconds for a ball to reach its place
/* Peak of the flight arc, as a fraction of the ball's own diameter. Squaring
   the sine narrows it, so this is a little higher than it looks. */
const ARC_HEIGHT = 0.45;
const FLY_STAGGER = 0.12;    // seconds between each ball setting off
const FLY_SPIN = 7;          // extra rad/s while flying, eased out on arrival
const IDLE_SPIN = 0.22;      // rad/s once settled

/* Aimless drift. Two sine terms per axis at unrelated frequencies so the path
   never visibly repeats — the balls wander instead of orbiting. */
const DRIFT_AMPLITUDE = 0.016; // of hero height
const DRIFT_SPEED = 0.35;

const POINTER_SHIFT = 0.05;  // how far the big ball drifts, in hero heights
const POINTER_TILT = 0.18;   // how far it tilts toward the pointer, in radians
const POINTER_EASE = 0.045;  // pointer follow smoothing, per frame
/* Background balls answer the pointer too, but faintly — enough to feel like
   one connected space, not enough to look like the cursor is dragging them.
   Scaled again per ball by depth, so nearer ones move more. */
const BACKGROUND_POINTER = 0.3;

/* The model's own colours are dark — the felt is 0.41,0.44,0.00 linear and the
   seam lines are mid grey rather than white — so every material is lifted on
   load, and the focal ball a little further still. */
const BRIGHTEN = { Ball_Fuzz_Export: 1.75, Ball_Lines_Export: 2.1 };
const BIG_BALL_BRIGHTEN = 1.18;
/* How dark the furthest ball goes; 1 = untouched. */
const DEPTH_DARKEN = 0.55;
const DEPTH_NEAR = 2;
const DEPTH_FAR = -3;

const CAMERA_FOV = 35;
const CAMERA_Z = 10;

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvases = LAYERS.map((layer) => document.querySelector(`.hero-canvas--${layer.suffix}`));

if (canvases.every(Boolean)) {
    init();
}

function init() {
    const renderers = [];
    try {
        LAYERS.forEach((layer, index) => {
            const renderer = new THREE.WebGLRenderer({
                canvas: canvases[index], alpha: true, antialias: true,
            });
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderers.push(renderer);
        });
    } catch (error) {
        // No WebGL. The balls are decoration, so just leave the canvases empty.
        return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100);
    camera.position.z = CAMERA_Z;

    // Soft sky/ground bounce plus one key light: enough shaping for a matte
    // ball, and far cheaper than loading an environment map. enableAll() so
    // they light every depth layer, not just the camera's current one.
    const key = new THREE.DirectionalLight(0xffffff, 2.8);
    key.position.set(-3, 4, 6);
    const rim = new THREE.DirectionalLight(0xffffff, 1.0);
    rim.position.set(4, -2, 3);

    const lights = [new THREE.HemisphereLight(0xffffff, 0xb8d0dd, 2.4), key, rim];
    lights.forEach((light) => {
        light.layers.enableAll();
        scene.add(light);
    });

    const balls = [];
    const view = { width: 1, height: 1 };
    let revealed = false;
    let elapsed = 0;
    let driftClock = 0;

    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

    /* --- Sizing ---------------------------------------------------------- */

    function resize() {
        const width = canvases[0].clientWidth;
        const height = canvases[0].clientHeight;
        if (!width || !height) return;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderers.forEach((renderer, index) => {
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, LAYERS[index].pixelRatio));
            renderer.setSize(width, height, false);
        });

        // World units covered by the viewport at z = 0, so hero fractions can
        // be turned into scene coordinates.
        view.height = 2 * Math.tan((CAMERA_FOV / 2) * (Math.PI / 180)) * CAMERA_Z;
        view.width = view.height * camera.aspect;

        balls.forEach(placeBall);
    }

    function placeBall(ball) {
        const portrait = camera.aspect < PORTRAIT_ASPECT;

        if (portrait && ball.spec.hideOnPortrait) {
            ball.pivot.visible = false;
            return;
        }
        ball.pivot.visible = true;

        const layout = portrait && ball.spec.portrait ? ball.spec.portrait : ball.spec;
        ball.layout = layout;

        // Everything further from the camera covers less screen per world unit.
        // Scaling position and size by this factor cancels that out, so `u`,
        // `v` and `size` stay honest screen fractions whatever `z` is.
        const depth = (CAMERA_Z - ball.z) / CAMERA_Z;

        ball.home.set(
            (layout.u - 0.5) * view.width * depth,
            (0.5 - layout.v) * view.height * depth,
            ball.z,
        );
        // Far enough off screen that the ball is fully hidden before it flies.
        const radius = (layout.size * view.height * depth) / 2;
        ball.startX = ball.spec.from === 'left'
            ? -view.width / 2 * depth - radius * 2
            : view.width / 2 * depth + radius * 2;

        ball.pivot.scale.setScalar(layout.size * view.height * depth);

        // Set the depth once here; the animation loop only writes x and y.
        ball.pivot.position.z = ball.z;

        if (!revealed && !reducedMotion) {
            ball.pivot.position.set(ball.startX, ball.home.y, ball.z);
        } else if (ball.progress >= 1) {
            ball.pivot.position.copy(ball.home);
        }
    }

    /* --- Model ------------------------------------------------------------ */

    new GLTFLoader().load(MODEL_URL, (gltf) => {
        const model = gltf.scene;

        // The export is off-centre and arbitrarily scaled. Normalise it once
        // into a unit-diameter ball centred on the origin, so `pivot.scale` is
        // the ball's diameter and rotating the pivot spins it about its middle.
        const box = new THREE.Box3().setFromObject(model);
        const centre = box.getCenter(new THREE.Vector3());
        const extent = box.getSize(new THREE.Vector3());
        const maxExtent = Math.max(extent.x, extent.y, extent.z);

        BALLS.forEach((spec, index) => {
            const z = spec.z ?? 0;
            const layerIndex = LAYERS.findIndex((layer) => z >= layer.minZ);

            const holder = new THREE.Group();
            holder.add(model.clone(true));
            holder.scale.setScalar(1 / maxExtent);
            holder.position.copy(centre).multiplyScalar(-1 / maxExtent);

            // Distance fades a ball toward the background as well as blurring
            // it. clone() the material first — the model clone above shares
            // materials, so tinting one would tint every ball.
            const near = (z - DEPTH_FAR) / (DEPTH_NEAR - DEPTH_FAR);
            const tint = DEPTH_DARKEN + (1 - DEPTH_DARKEN) * clamp(near, 0, 1);

            holder.traverse((child) => {
                if (!child.isMesh) return;
                child.material = child.material.clone();
                const lift = BRIGHTEN[child.material.name] ?? 1;
                child.material.color.multiplyScalar(
                    lift * tint * (spec.big ? BIG_BALL_BRIGHTEN : 1),
                );
            });

            const pivot = new THREE.Group();
            pivot.add(holder);
            // Layers are per-object, so the whole subtree has to be assigned.
            pivot.traverse((child) => child.layers.set(layerIndex));
            scene.add(pivot);

            balls.push({
                spec,
                pivot,
                z,
                layerIndex,
                home: new THREE.Vector3(),
                startX: 0,
                progress: reducedMotion ? 1 : 0,
                // How strongly this ball answers the pointer. The focal ball
                // gets the full amount; the rest are damped, and further ones
                // move less than near ones.
                pointerFactor: spec.big
                    ? 1
                    : BACKGROUND_POINTER * clamp((z - DEPTH_FAR) / (DEPTH_NEAR - DEPTH_FAR), 0.15, 1),
                // Unrelated frequencies and phases per ball, derived from its
                // own numbers so the wander is stable across reloads.
                drift: {
                    fx1: 0.7 + (index % 3) * 0.23, px1: index * 2.4,
                    fx2: 1.3 + (index % 4) * 0.17, px2: index * 5.1,
                    fy1: 0.6 + (index % 5) * 0.19, py1: index * 3.7,
                    fy2: 1.1 + (index % 2) * 0.31, py2: index * 1.9,
                },
                // A random-ish axis per ball so they do not tumble in unison.
                axis: new THREE.Vector3(
                    Math.sin(spec.u * 12.9898),
                    Math.cos(spec.v * 78.233),
                    Math.sin(spec.size * 43.758),
                ).normalize(),
            });
        });

        resize();

        // enterAnimation.js may have already asked for the reveal while the
        // model was still downloading.
        if (window.__tcdHeroRevealed) {
            revealed = true;
        }
    });

    /* --- Reveal ----------------------------------------------------------- */

    if (window.__tcdHeroRevealed) {
        revealed = true;
    }
    document.addEventListener('tcd:hero-reveal', () => {
        revealed = true;
    }, { once: true });

    /* --- Pointer ---------------------------------------------------------- */

    if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
        window.addEventListener('pointermove', (event) => {
            const rect = canvases[0].getBoundingClientRect();
            // -1 .. 1 across the hero, clamped so the drift stops at the edges.
            pointer.targetX = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
            pointer.targetY = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
        }, { passive: true });
    }

    /* --- Loop -------------------------------------------------------------- */

    const clock = new THREE.Clock();
    let visible = true;

    // Nothing to draw while the hero is scrolled away.
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
        }, { threshold: 0 }).observe(canvases[0]);
    }

    function frame() {
        requestAnimationFrame(frame);

        // Cap the step so a backgrounded tab does not resume with a huge jump.
        const delta = Math.min(clock.getDelta(), 0.05);
        if (!visible || balls.length === 0) return;

        if (revealed) elapsed += delta;
        driftClock += delta * DRIFT_SPEED;

        pointer.x += (pointer.targetX - pointer.x) * POINTER_EASE;
        pointer.y += (pointer.targetY - pointer.y) * POINTER_EASE;

        balls.forEach((ball, index) => {
            if (!ball.pivot.visible) return;

            if (revealed && ball.progress < 1) {
                const started = elapsed - index * FLY_STAGGER;
                ball.progress = clamp(started / FLY_DURATION, 0, 1);

                const eased = easeOutCubic(ball.progress);
                ball.pivot.position.x = ball.startX + (ball.home.x - ball.startX) * eased;

                // A slight arc, highest mid-flight, so it does not read as a
                // flat horizontal slide.
                //
                // Squared on purpose. A plain sin(pi * t) is still falling at
                // full speed the instant t reaches 1 — the ball was dropping
                // and then simply ceased, which is what made the landing snap.
                // Squaring flattens the curve at both ends, so the ball leaves
                // and settles with no vertical speed at all. The horizontal
                // easing already ended at zero, so this was the whole problem.
                const arc = Math.sin(ball.progress * Math.PI);
                ball.pivot.position.y = ball.home.y
                    + arc * arc * ball.layout.size * view.height * ARC_HEIGHT;
            }

            const settled = easeOutCubic(ball.progress);

            // Spinning fast on the way in, easing down to a lazy idle turn.
            const spin = IDLE_SPIN + (FLY_SPIN - IDLE_SPIN) * (1 - settled);
            ball.pivot.rotateOnAxis(ball.axis, spin * delta);

            if (ball.progress >= 1) {
                ball.pivot.position.x = ball.home.x;
                ball.pivot.position.y = ball.home.y;
            }

            // Drift and pointer offsets are faded in with `settled` rather than
            // switched on at the end of the flight. Applying them only once a
            // ball had landed made it jump by however far the pointer happened
            // to be offset at that instant — the big ball looked like it
            // teleported on arrival.
            const d = ball.drift;
            const amplitude = DRIFT_AMPLITUDE * view.height * settled;
            ball.pivot.position.x += (
                Math.sin(driftClock * d.fx1 + d.px1) * 0.6
                + Math.sin(driftClock * d.fx2 + d.px2) * 0.4
            ) * amplitude;
            ball.pivot.position.y += (
                Math.sin(driftClock * d.fy1 + d.py1) * 0.6
                + Math.sin(driftClock * d.fy2 + d.py2) * 0.4
            ) * amplitude;

            const shift = POINTER_SHIFT * view.height * ball.pointerFactor * settled;
            ball.pivot.position.x += pointer.x * shift;
            ball.pivot.position.y += -pointer.y * shift;

            if (ball.spec.big) {
                // A touch of tilt sells the "looking at the cursor" feel more
                // than the movement alone does.
                ball.pivot.rotation.x += pointer.y * POINTER_TILT * 0.02 * settled;
                ball.pivot.rotation.y += pointer.x * POINTER_TILT * 0.02 * settled;
            }
        });

        // One scene, drawn once per depth layer. The camera's layer mask is
        // what decides which balls each canvas receives.
        renderers.forEach((renderer, index) => {
            camera.layers.set(index);
            renderer.render(scene, camera);
        });
    }

    if ('ResizeObserver' in window) {
        new ResizeObserver(resize).observe(canvases[0]);
    } else {
        window.addEventListener('resize', resize);
    }

    resize();
    frame();
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}
