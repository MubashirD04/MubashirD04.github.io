// Free-tier demos sleep when idle. Ping them as soon as their card is on screen so they
// are awake (or close to it) by the time a visitor clicks through.
const pinged = new Set();

export function setupWake() {
    const targets = document.querySelectorAll('[data-wake]');
    if (!targets.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);
            const url = entry.target.dataset.wake;
            if (pinged.has(url)) return;
            pinged.add(url);
            fetch(url, { mode: 'no-cors', cache: 'no-store' }).catch(() => {});
        });
    });
    targets.forEach((el) => observer.observe(el));
}
