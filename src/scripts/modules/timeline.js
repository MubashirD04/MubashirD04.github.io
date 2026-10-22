// Draws the Journey timeline's line once it's on screen and reveals each entry as it
// scrolls in. With reduced motion everything is shown straight away.
export function setupTimeline() {
    const timeline = document.querySelector('[data-timeline]');
    if (!timeline) return;
    const items = timeline.querySelectorAll('.timeline-item');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        [timeline, ...items].forEach((el) => el.classList.add('in-view'));
        return;
    }
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => {
            if (!isIntersecting) return;
            target.classList.add('in-view');
            observer.unobserve(target);
        });
    }, { threshold: 0.35 });
    [timeline, ...items].forEach((el) => observer.observe(el));
}
