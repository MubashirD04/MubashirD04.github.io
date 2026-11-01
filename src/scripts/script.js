import { setupTheme } from './modules/theme.js';
import { setupMobileMenu } from './modules/menu.js';
import { setupScroll } from './modules/scroll.js';
import { setupAccordion } from './modules/accordion.js';
import { setupInViewVideos } from './modules/in-view-video.js';
import { setupWake } from './modules/wake.js';
import { setupTimeline } from './modules/timeline.js';
import { setupCv } from './modules/cv.js';
import { setupProfileStats } from './modules/profile-stats.js';
import { initChatbot } from './modules/chatbot.js';
import { setupAsteroidsGame } from './modules/asteroids-game.js';
import { setupSmoothScroll } from './modules/smooth-scroll.js';
import { setupReveal } from './modules/reveal.js';
import { setupHeroMotion } from './modules/hero-motion.js';
import { setupChatEntrance } from './modules/chat-entrance.js';
import { runCleanups } from './modules/lifecycle.js';

function initPortfolio() {
    setupTheme();
    setupMobileMenu();
    setupScroll();
    setupAccordion();
    setupInViewVideos();
    setupWake();
    setupTimeline();
    setupCv();
    setupProfileStats();
    initChatbot();
    setupAsteroidsGame();

    // Motion layer. Each of these registers its own teardown in lifecycle.js.
    setupSmoothScroll();
    setupReveal();
    setupHeroMotion();
    setupChatEntrance();
}

document.addEventListener('astro:page-load', initPortfolio);
// Tear everything down before a view transition swaps the DOM, so observers,
// animation frames and the WebGL context don't leak across navigations.
document.addEventListener('astro:before-swap', runCleanups);