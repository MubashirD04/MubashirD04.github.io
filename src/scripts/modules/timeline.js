// Journey: pins the timeline while you scroll past it and turns that vertical scroll
// into a sideways slide. Entries fade in as they reach the left half of the screen, the rail fills
// with progress. With reduced motion it stays a plain row you can swipe through.
let controller;

export function setupTimeline() {
    controller?.abort();
    const section = document.querySelector('[data-journey]');
    const scroller = document.getElementById('page-wrapper');
    if (!section || !scroller) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const viewport = section.querySelector('.journey-viewport');
    const track = section.querySelector('.journey-track');
    const items = [...section.querySelectorAll('.journey-item')];
    section.style.setProperty('--count', items.length);
    section.classList.add('is-pinned');

    let queued = false;
    const update = () => {
        queued = false;
        // The page scrolls inside #page-wrapper, so measure against its content box
        const top = scroller.getBoundingClientRect().top + scroller.clientTop;
        const travel = section.offsetHeight - scroller.clientHeight;
        const progress = Math.min(1, Math.max(0, (top - section.getBoundingClientRect().top) / travel));
        const maxShift = Math.max(0, track.offsetWidth - viewport.clientWidth);
        section.style.setProperty('--progress', progress.toFixed(4));
        section.style.setProperty('--shift', `${(-progress * maxShift).toFixed(1)}px`);
        const revealAt = window.innerWidth * 0.45;
        items.forEach((item) => item.classList.toggle('in-view', item.getBoundingClientRect().left < revealAt));
    };
    const queue = () => {
        if (!queued) requestAnimationFrame(update);
        queued = true;
    };

    controller = new AbortController();
    scroller.addEventListener('scroll', queue, { passive: true, signal: controller.signal });
    window.addEventListener('resize', queue, { signal: controller.signal });
    update();
}
