const revealTimeouts = new Map();

function groupByRow(elements) {
    // Collect rects
    const items = Array.from(elements).map(element => {
        const rect = element.getBoundingClientRect();
        return { element, top: rect.top, bottom: rect.bottom, left: rect.left };
    });

    // Sort by top position so we process rows top-to-bottom
    items.sort((a, b) => a.top - b.top);

    const rows = [];

    items.forEach(item => {
        // Find an existing row whose vertical range overlaps with this element
        const matchingRow = rows.find(row =>
            item.top < row.maxBottom && item.bottom > row.minTop
        );

        if (matchingRow) {
            matchingRow.items.push(item);
            matchingRow.minTop = Math.min(matchingRow.minTop, item.top);
            matchingRow.maxBottom = Math.max(matchingRow.maxBottom, item.bottom);
        } else {
            rows.push({ items: [item], minTop: item.top, maxBottom: item.bottom });
        }
    });

    return rows;
}

function revealOnScroll() {
    const elements = document.querySelectorAll('.reveal-on-scroll');
    const windowHeight = window.innerHeight;
    const revealPoint = 150;

    const rows = groupByRow(elements);

    rows.forEach(({ items, minTop }) => {
        // Trigger the row when the topmost edge of the row reaches the threshold
        const rowTriggered = minTop < windowHeight - revealPoint;

        // Sort elements left to right so they always reveal in that order
        const sorted = [...items].sort((a, b) => a.left - b.left);

        sorted.forEach(({ element }, index) => {
            if (rowTriggered) {
                // Skip if already revealed or already queued to reveal
                if (element.classList.contains('revealed') || revealTimeouts.has(element)) return;

                const timeoutId = setTimeout(() => {
                    element.classList.add('revealed');
                    revealTimeouts.delete(element);
                }, index * 150);
                revealTimeouts.set(element, timeoutId);
            } else {
                // Scrolled back up: cancel any pending reveal and hide
                if (revealTimeouts.has(element)) {
                    clearTimeout(revealTimeouts.get(element));
                    revealTimeouts.delete(element);
                }
                element.classList.remove('revealed');
            }
        });
    });
}

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);
window.addEventListener('resize', revealOnScroll);
