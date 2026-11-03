// animate comes from motion/mini (WAAPI-backed, a fraction of the size); inView
// is not in that build, so it comes from the full package and tree-shakes fine.
import { animate } from 'motion/mini';
import { inView } from 'motion';
import { DUR, EASE, REVEAL_Y, prefersReducedMotion } from './motion-config.js';
import { onCleanup } from './lifecycle.js';

// Add data-reveal to any element to fade and lift it in as it enters view.
// Add data-reveal-stagger as well and its direct children come in one by one.
const STAGGER_STEP = 0.08;

export function setupReveal() {
    // Either attribute works on its own: data-reveal-stagger implies a reveal,
    // so a container can't end up hidden by CSS with nothing to animate it.
    const els = Array.from(document.querySelectorAll('[data-reveal], [data-reveal-stagger]'));

    // Reduced motion: drop the CSS hidden state and show everything at once.
    if (prefersReducedMotion()) {
        document.documentElement.classList.remove('motion-ready');
        return;
    }

    // Matches the inline head script; re-applied here because a view-transition
    // swap can replace the attributes on <html>.
    document.documentElement.classList.add('motion-ready');

    els.forEach((el) => {
        const staggered = el.hasAttribute('data-reveal-stagger');
        const targets = staggered ? Array.from(el.children) : [el];
        if (!targets.length) return;

        const stop = inView(
            el,
            () => {
                targets.forEach((target, i) => {
                    // When the animation ends, Motion writes the final values
                    // inline and cancels it. A target with its own CSS transition
                    // on opacity or transform (the cards' hover lift) then
                    // transitions from the stylesheet's hidden state, so it
                    // blinks out and fades in a second time. Transitions stay
                    // off until those inline values have landed.
                    target.style.transition = 'none';
                    animate(
                        target,
                        {
                            opacity: [0, 1],
                            transform: [`translateY(${REVEAL_Y}px)`, 'translateY(0px)'],
                        },
                        { duration: DUR.base, ease: EASE, delay: staggered ? i * STAGGER_STEP : 0 }
                    ).then(() => {
                        // Flush the committed values before transitions return.
                        getComputedStyle(target).opacity;
                        target.style.transition = '';
                    });
                });
                // One-shot: inView's return value stops it re-firing.
                return undefined;
            },
            { amount: 0.15 }
        );

        onCleanup(stop);
    });
}
