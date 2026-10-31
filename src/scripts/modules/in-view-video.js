// Videos marked data-play-in-view play while on screen and pause off it.
// With reduced motion they stay still and show controls instead.
export function setupInViewVideos() {
    const videos = document.querySelectorAll('video[data-play-in-view]');
    if (!videos.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        videos.forEach((v) => (v.controls = true));
        return;
    }
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => {
            if (isIntersecting) target.play().catch(() => (target.controls = true));
            else target.pause();
        });
    }, { threshold: 0.4 });
    videos.forEach((v) => observer.observe(v));
}
