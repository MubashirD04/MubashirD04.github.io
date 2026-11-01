import { animate } from 'motion/mini';
import { DUR, EASE, prefersReducedMotion } from './motion-config.js';

// The chat button sits over the page from the moment it loads, so it gets a
// short pop rather than appearing fully formed.
export function setupChatEntrance() {
    const btn = document.getElementById('chat-toggle');
    if (!btn) return;

    if (prefersReducedMotion()) {
        btn.style.opacity = '';
        btn.style.transform = '';
        return;
    }

    animate(
        btn,
        { opacity: [0, 1], transform: ['scale(0.8)', 'scale(1)'] },
        { duration: DUR.quick, ease: EASE, delay: 0.5 }
    );
}
