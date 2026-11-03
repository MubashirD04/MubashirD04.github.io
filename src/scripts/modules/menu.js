import { navigate } from 'astro:transitions/client';

export function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    const links = document.querySelectorAll('.nav-links a');

    if (!hamburger || !navLinks) return;

    const toggleMenu = () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', hamburger.classList.contains('active'));
    };

    const closeMenu = () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    };

    hamburger.addEventListener('click', toggleMenu);

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const wasOpen = navLinks.classList.contains('active');
            closeMenu();
            if (!wasOpen || !isPageLink(link, e)) return;

            // Swapping the page straight away cuts the drawer off mid-slide, so
            // internal links wait for it to close and then navigate.
            e.preventDefault();
            afterDrawerCloses(navLinks, () => {
                const url = new URL(link.href);
                if (url.pathname === location.pathname && url.search === location.search) {
                    // Same page: let a hash link scroll, otherwise there's nowhere to go.
                    if (url.hash) location.hash = url.hash;
                    return;
                }
                navigate(link.href);
            });
        });
    });
}

// Only same-origin page loads in this tab; mailto:, new-tab and modified
// clicks keep the browser's default behaviour.
function isPageLink(link, e) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    if (link.target && link.target !== '_self') return false;
    if (link.hasAttribute('download')) return false;
    const url = new URL(link.href, location.href);
    return url.origin === location.origin;
}

function afterDrawerCloses(drawer, done) {
    const style = getComputedStyle(drawer);
    const props = style.transitionProperty.split(',').map(s => s.trim());
    const durations = style.transitionDuration.split(',').map(s => parseFloat(s) * 1000);
    const i = props.indexOf('left');
    const duration = i === -1 ? 0 : durations[i] ?? durations[0];

    // Reduced motion (or no transition) has nothing to wait for.
    if (!duration) {
        done();
        return;
    }

    let finished = false;
    const finish = () => {
        if (finished) return;
        finished = true;
        drawer.removeEventListener('transitionend', onEnd);
        done();
    };
    const onEnd = (e) => {
        if (e.target === drawer && e.propertyName === 'left') finish();
    };
    drawer.addEventListener('transitionend', onEnd);
    // transitionend can be skipped (hidden tab, interrupted transition).
    setTimeout(finish, duration + 100);
}
