// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    site: 'https://mubashird04.github.io',
    // GitHub Pages 301s /about to /about/; link straight to the slash form
    trailingSlash: 'always',
    integrations: [sitemap()],
});
