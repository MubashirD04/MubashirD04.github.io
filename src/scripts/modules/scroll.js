export function setupScroll() {
    setupScrollReveal();
    setupScrollIndicator();
}

function setupScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section:not([data-journey]), .card').forEach(el => {
        el.classList.add('reveal-hidden');
        observer.observe(el);
    });
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
