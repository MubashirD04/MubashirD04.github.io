const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Rows with a recording play it while open and pause it when closed.
// With reduced motion the video stays still until the visitor presses play.
function setVideo(row, playing) {
    const video = row.querySelector('video');
    if (!video) return;
    if (!playing) {
        video.pause();
        return;
    }
    if (reduceMotion()) {
        video.controls = true;
        return;
    }
    video.currentTime = 0;
    video.play().catch(() => {
        video.controls = true;
    });
}

export function setupAccordion() {
    const rows = document.querySelectorAll('.project-row');
    rows.forEach((row) => {
        const toggle = row.querySelector('.project-row-toggle');
        if (!toggle) return;
        toggle.addEventListener('click', () => {
            const opening = !row.classList.contains('open');
            // Only one row open at a time
            rows.forEach((r) => {
                if (r.classList.contains('open')) setVideo(r, false);
                r.classList.remove('open');
                r.querySelector('.project-row-toggle')?.setAttribute('aria-expanded', 'false');
            });
            if (opening) {
                row.classList.add('open');
                toggle.setAttribute('aria-expanded', 'true');
                setVideo(row, true);
            }
        });

        // Clicking the recording pauses or resumes it
        const video = row.querySelector('video');
        video?.addEventListener('click', () => {
            if (video.controls) return;
            video.paused ? video.play() : video.pause();
        });
    });
}
