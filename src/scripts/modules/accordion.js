export function setupAccordion() {
    const rows = document.querySelectorAll('.project-row');
    rows.forEach((row) => {
        const toggle = row.querySelector('.project-row-toggle');
        if (!toggle) return;
        toggle.addEventListener('click', () => {
            const opening = !row.classList.contains('open');
            // Only one row open at a time
            rows.forEach((r) => {
                r.classList.remove('open');
                r.querySelector('.project-row-toggle')?.setAttribute('aria-expanded', 'false');
            });
            if (opening) {
                row.classList.add('open');
                toggle.setAttribute('aria-expanded', 'true');
            }
        });
    });
}
