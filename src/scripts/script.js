import { setupTheme } from './modules/theme.js';
import { setupMobileMenu } from './modules/menu.js';
import { setupScroll } from './modules/scroll.js';
import { setupTypewriter } from './modules/typewriter.js';
import { setupAccordion } from './modules/accordion.js';
import { setupProfileStats } from './modules/profile-stats.js';
import { initChatbot } from './modules/chatbot.js';
import { setupAsteroidsGame } from './modules/asteroids-game.js';

function initPortfolio() {
    setupTheme();
    setupMobileMenu();
    setupScroll();
    setupTypewriter();
    setupAccordion();
    setupProfileStats();
    initChatbot();
    setupAsteroidsGame();
    console.log("Portfolio Initialized");
}

document.addEventListener('astro:page-load', initPortfolio);