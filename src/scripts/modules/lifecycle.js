// View-transition navigations swap the DOM without reloading, so every observer,
// animation frame and WebGL context from the old page has to be torn down by hand.
// Modules register their teardown here; script.js drains it on astro:before-swap.
const cleanups = [];

export function onCleanup(fn) {
    if (typeof fn === 'function') cleanups.push(fn);
}

export function runCleanups() {
    while (cleanups.length) {
        const fn = cleanups.pop();
        try {
            fn();
        } catch (err) {
            console.error('Cleanup failed', err);
        }
    }
}
