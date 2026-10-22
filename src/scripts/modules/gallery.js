export function setupGallery() {
    document.querySelectorAll('[data-gallery]').forEach((gallery) => {
        const imgs = gallery.querySelectorAll('[data-gallery-img]');
        const tabs = gallery.querySelectorAll('[data-gallery-tab]');
        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                const i = tab.dataset.galleryTab;
                imgs.forEach((img) => img.classList.toggle('active', img.dataset.galleryImg === i));
                tabs.forEach((t) => {
                    const on = t === tab;
                    t.classList.toggle('active', on);
                    t.setAttribute('aria-pressed', String(on));
                });
            });
        });
    });
}
