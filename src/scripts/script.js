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
    console.log("Portfolio Initialized");
}

document.addEventListener('astro:page-load', initPortfolio);