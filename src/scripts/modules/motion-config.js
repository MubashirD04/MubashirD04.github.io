// One easing curve and one duration range for the whole site, so nothing feels
// out of step. The curve matches the fadeInUp already used in index.css.
export const EASE = [0.23, 1, 0.32, 1];

export const DUR = {
    quick: 0.4,
    base: 0.6,
    slow: 0.8,
};

export const REVEAL_Y = 24;

export function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
