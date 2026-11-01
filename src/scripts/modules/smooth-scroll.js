import Lenis from 'lenis';
import { prefersReducedMotion } from './motion-config.js';
import { onCleanup } from './lifecycle.js';

// The site scrolls inside #page-wrapper, not the window, so Lenis gets that
// element as both wrapper and content rather than the document defaults.
let lenis = null;

export function getLenis() {
    return lenis;
}

// Clears the fixed nav so an anchored heading doesn't land underneath it.
const NAV_CLEARANCE = 100;

// Lenis's own `offset` is measured from offsetTop, which is wrong here because
// #page-wrapper isn't the offsetParent. Measuring against the wrapper's own box
// gives the right landing spot whatever the layout does.
function targetTop(wrapper, target) {
    const wrapperTop = wrapper.getBoundingClientRect().top;
    const targetTop = target.getBoundingClientRect().top;
    return Math.max(0, wrapper.scrollTop + (targetTop - wrapperTop) - NAV_CLEARANCE);
}

export function setupSmoothScroll() {
    const wrapper = document.getElementById('page-wrapper');
    if (!wrapper) return;

    // Reduced motion keeps the browser's own instant jumps.
    if (prefersReducedMotion()) {
        setupPlainAnchors(wrapper);
        return;
    }

    lenis = new Lenis({
        wrapper,
        content: wrapper,
        lerp: 0.1,
        smoothWheel: true,
        // Touch devices keep native momentum, which feels better than emulating it.
        smoothTouch: false,
    });

    let frame = requestAnimationFrame(function raf(time) {
        lenis.raf(time);
        frame = requestAnimationFrame(raf);
    });

    // Lenis watches its content element for resizes, but here that element is
    // the wrapper itself, whose own box never changes however much it holds.
    // Opening a project row grew the scroll height without Lenis noticing, so
    // the wheel stayed clamped to the collapsed page's limit. Watching what the
    // wrapper actually scrolls past keeps that limit honest.
    const growth = new ResizeObserver(() => lenis.resize());
    Array.from(wrapper.children).forEach((child) => growth.observe(child));

    const onClick = (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        const hash = link.getAttribute('href');
        if (!hash || hash === '#') return;
        const target = document.querySelector(hash);
        if (!target) return;

        e.preventDefault();
        lenis.scrollTo(targetTop(wrapper, target), { duration: 1 });
        moveFocus(target);
    };

    document.addEventListener('click', onClick);

    onCleanup(() => {
        cancelAnimationFrame(frame);
        growth.disconnect();
        document.removeEventListener('click', onClick);
        lenis.destroy();
        lenis = null;
    });
}

// Without Lenis the browser still jumps, but focus has to be handled either way.
function setupPlainAnchors(wrapper) {
    const onClick = (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        const target = document.querySelector(link.getAttribute('href') || '');
        if (!target) return;
        moveFocus(target);
    };
    document.addEventListener('click', onClick);
    onCleanup(() => document.removeEventListener('click', onClick));
}

// Scrolling alone leaves the keyboard behind, which breaks the skip link.
function moveFocus(target) {
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
}
