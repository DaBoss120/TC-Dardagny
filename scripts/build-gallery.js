#!/usr/bin/env node
// scripts/build-gallery.js
//
// Turns whatever full-resolution photos are dropped in assets/gallery-originals/
// into a set of compressed, web-sized derivatives the gallery page actually
// serves, plus a manifest the page reads to build the grid. Re-run this
// after adding/removing photos from that folder:
//
//   npm run build:gallery
//
// The originals deliberately live OUTSIDE public/: they are build input, not
// something the site should serve. Keeping them out of the web root means the
// multi-megabyte source files are never deployed or publicly downloadable —
// visitors only ever get the compressed thumbs/ and full/ versions.
//
// Originals are never modified. Everything this script writes lives in
// public/img/gallery/{thumbs,full,manifest.json} and is fully regenerated
// (stale output removed) on every run, so the output is always a clean
// reflection of the current originals.

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ORIGINALS_DIR = path.join(__dirname, '..', 'assets', 'gallery-originals');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'img', 'gallery');
const THUMBS_DIR = path.join(OUTPUT_DIR, 'thumbs');
const FULL_DIR = path.join(OUTPUT_DIR, 'full');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');

const SOURCE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

// Grid vignette: small and heavily compressed, this is what loads for every
// photo up front.
const THUMB_MAX_DIMENSION = 640;
const THUMB_QUALITY = 68;

// Lightbox view: still web-sized (nobody needs a 4032px original in a
// browser tab), but sharp enough to fill a large screen.
const FULL_MAX_DIMENSION = 1920;
const FULL_QUALITY = 80;

const DEFAULT_ALT = 'Photo de la galerie du Tennis-Club Dardagny';

function slugify(baseName) {
    return baseName
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '') // strip accents (combining marks left by NFKD)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'photo';
}

function uniqueSlug(baseSlug, used) {
    if (!used.has(baseSlug)) {
        used.add(baseSlug);
        return baseSlug;
    }
    let n = 2;
    while (used.has(`${baseSlug}-${n}`)) n++;
    const slug = `${baseSlug}-${n}`;
    used.add(slug);
    return slug;
}

function resetDir(dir) {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
}

async function buildOne(filePath, slug) {
    const image = sharp(filePath).rotate(); // auto-orient from EXIF, then bake it in
    const metadata = await image.metadata();
    // metadata.width/height are the RAW pixel dimensions before EXIF
    // orientation is applied — for a photo shot in portrait with a 90°
    // orientation tag (very common straight off a phone), those come back
    // swapped (landscape numbers for a portrait photo). `.rotate()` above
    // bakes the correction into the actual output files, so the manifest
    // needs the POST-orientation size (metadata.autoOrient) to match, or
    // the lightbox sizes the image to the wrong aspect ratio.
    const width = metadata.autoOrient ? metadata.autoOrient.width : metadata.width;
    const height = metadata.autoOrient ? metadata.autoOrient.height : metadata.height;

    await image
        .clone()
        .resize({ width: THUMB_MAX_DIMENSION, height: THUMB_MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: THUMB_QUALITY })
        .toFile(path.join(THUMBS_DIR, `${slug}.webp`));

    await image
        .clone()
        .resize({ width: FULL_MAX_DIMENSION, height: FULL_MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: FULL_QUALITY })
        .toFile(path.join(FULL_DIR, `${slug}.webp`));

    return { width, height };
}

async function main() {
    if (!fs.existsSync(ORIGINALS_DIR)) {
        console.error(`Gallery source folder not found: ${ORIGINALS_DIR}`);
        process.exit(1);
    }

    const entries = fs.readdirSync(ORIGINALS_DIR, { withFileTypes: true })
        .filter(entry => entry.isFile())
        .map(entry => entry.name)
        .filter(name => SOURCE_EXTENSIONS.has(path.extname(name).toLowerCase()))
        // Newest photos first, so adding one surfaces it at the top of the grid.
        .sort((a, b) => {
            const statA = fs.statSync(path.join(ORIGINALS_DIR, a)).mtimeMs;
            const statB = fs.statSync(path.join(ORIGINALS_DIR, b)).mtimeMs;
            return statB - statA;
        });

    resetDir(THUMBS_DIR);
    resetDir(FULL_DIR);

    const usedSlugs = new Set();
    const manifest = [];
    let skipped = 0;

    for (const name of entries) {
        const filePath = path.join(ORIGINALS_DIR, name);
        const stat = fs.statSync(filePath);
        if (stat.size === 0) {
            console.warn(`Skipping empty file: ${name}`);
            skipped++;
            continue;
        }

        const slug = uniqueSlug(slugify(path.parse(name).name), usedSlugs);

        try {
            const { width, height } = await buildOne(filePath, slug);
            manifest.push({
                slug,
                thumb: `/img/gallery/thumbs/${slug}.webp`,
                full: `/img/gallery/full/${slug}.webp`,
                width,
                height,
                alt: DEFAULT_ALT,
            });
            console.log(`OK   ${name} -> ${slug}.webp (${width}x${height})`);
        } catch (error) {
            console.warn(`Skipping unreadable image: ${name} (${error.message})`);
            skipped++;
        }
    }

    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');

    console.log(`\nBuilt ${manifest.length} photo(s), skipped ${skipped}.`);
    console.log(`Manifest written to ${path.relative(process.cwd(), MANIFEST_PATH)}`);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
