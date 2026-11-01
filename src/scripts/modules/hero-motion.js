import { animate } from 'motion/mini';
import { scroll } from 'motion';
import { DUR, EASE, REVEAL_Y, prefersReducedMotion } from './motion-config.js';
import { onCleanup } from './lifecycle.js';

// The hero is above the fold, so its entrance runs on load rather than waiting
// for an observer. Parallax rides the wrapper, leaving the image's own CSS
// fade-in untouched.
const INTRO_STEP = 0.09;
const PARALLAX_Y = -48;

export function setupHeroMotion() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    const items = Array.from(hero.querySelectorAll('[data-hero-item]'));

    if (prefersReducedMotion()) {
        document.documentElement.classList.remove('motion-ready');
        return;
    }

    items.forEach((el, i) => {
        animate(
            el,
            {
                opacity: [0, 1],
                transform: [`translateY(${REVEAL_Y}px)`, 'translateY(0px)'],
            },
            { duration: DUR.base, ease: EASE, delay: 0.08 + i * INTRO_STEP }
        );
    });

    setupParallax(hero);
}

function setupParallax(hero) {
    const tiger = hero.querySelector('.hero-tiger-wrapper');
    const wrapper = document.getElementById('page-wrapper');
    if (!tiger || !wrapper) return;

    // A progress callback rather than an animation, which keeps the full
    // animate() out of the bundle; mini animate covers everything else.
    const stop = scroll(
        (progress) => {
            tiger.style.transform = `translateY(${(progress * PARALLAX_Y).toFixed(2)}px)`;
        },
        {
            container: wrapper,
            target: hero,
            offset: ['start start', 'end start'],
        }
    );

    onCleanup(() => {
        if (typeof stop === 'function') stop();
        tiger.style.transform = '';
    });
}
