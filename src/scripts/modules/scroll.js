// Scroll reveals now live in reveal.js, driven by Motion's inView and a
// data-reveal attribute. This module keeps only the hero scroll hint.
export function setupScroll() {
    setupScrollIndicator();
}

function setupScrollIndicator() {
    const scrollInd = document.querySelector('.scroll-indicator');
    const wrapper = document.getElementById('page-wrapper');
    if (!scrollInd || !wrapper) return;

    wrapper.addEventListener('scroll', () => {
        if (wrapper.scrollTop > 50) {
            scrollInd.classList.add('hidden-on-scroll');
        } else {
            scrollInd.classList.remove('hidden-on-scroll');
        }
    });
}
