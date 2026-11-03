// Scroll reveals now live in reveal.js, driven by Motion's inView and a
// data-reveal attribute. This module keeps the hero scroll hint and the nav backdrop.
export function setupScroll() {
    setupScrollIndicator();
    setupNavBackdrop();
}

// The nav is transparent over the hero; past that, text would run into the
// logo and buttons, so it picks up a backdrop as soon as the page moves.
function setupNavBackdrop() {
    const nav = document.querySelector('nav');
    const wrapper = document.getElementById('page-wrapper');
    if (!nav || !wrapper) return;

    const update = () => nav.classList.toggle('nav-scrolled', wrapper.scrollTop > 10);
    wrapper.addEventListener('scroll', update, { passive: true });
    update();
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
