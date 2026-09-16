const STORAGE_KEY = 'astro-blaster-scores';
const MAX_SCORES = 5;
const NAME_LENGTH = 3;

const W = 384;
const H = 240;

const STEP_MS = 1000 / 60;
const MAX_CATCHUP_MS = 250;

export function setupAsteroidsGame() {
    const trigger = document.getElementById('astroTrigger');
    const exitBtn = document.getElementById('gameExitBtn');
    const canvas = document.getElementById('gameCanvas');
    if (!trigger || !exitBtn || !canvas) return;

    const frontFace = document.querySelector('.card-face-front');
    const backFace = document.querySelector('.card-face-back');
    backFace.inert = true;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const scoreEl = document.getElementById('gameScore');
    const livesEl = document.getElementById('gameLives');

    let active = false;
    let rafId = null;
    let keys = {};
    let ship, bullets, asteroids, particles;
    let score = 0;
    let lives = 3;
    let invulnerable = 0;
    let gameOver = false;
    let fireCooldown = 0;
    let enteringName = false;
    let initials = '';
    let lastFrame = 0;
    let stepDebt = 0;

    function startGame() {
        if (active) return;
        active = true;
        trigger.blur();
        frontFace.inert = true;
        backFace.inert = false;
        document.body.classList.add('game-active');
        document.getElementById('gameArena').setAttribute('aria-hidden', 'false');
        resetState();
        renderLeaderboard();
        document.getElementById('arcadeStage').scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('blur', releaseKeys);
        lastFrame = 0;
        stepDebt = 0;
        rafId = requestAnimationFrame(loop);
    }

    function teardown() {
        active = false;
        document.body.classList.remove('game-active');
        document.getElementById('gameArena').setAttribute('aria-hidden', 'true');
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        window.removeEventListener('blur', releaseKeys);
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        releaseKeys();
        backFace.inert = true;
        frontFace.inert = false;
    }

    function exitGame() {
        teardown();
        trigger.focus();
    }

    function resetState() {
        score = 0;
        lives = 3;
        gameOver = false;
        enteringName = false;
        initials = '';
        invulnerable = 120;
        bullets = [];
        particles = [];
        ship = { x: W / 2, y: H / 2, angle: -Math.PI / 2, vx: 0, vy: 0, radius: 6 };
        asteroids = [];
        spawnWave(4);
        updateHud();
    }

    function spawnWave(count) {
        for (let i = 0; i < count; i++) {
            let x, y;
            do {
                x = Math.random() * W;
                y = Math.random() * H;
            } while (Math.hypot(x - ship.x, y - ship.y) < 70);
            asteroids.push(makeAsteroid(x, y, 'big'));
        }
    }

    function makeAsteroid(x, y, size) {
        const radius = size === 'big' ? 22 : size === 'med' ? 13 : 7;
        const speed = size === 'big' ? 0.5 : size === 'med' ? 0.9 : 1.4;
        const angle = Math.random() * Math.PI * 2;
        const verts = 8 + Math.floor(Math.random() * 4);
        const jitter = Array.from({ length: verts }, () => 0.7 + Math.random() * 0.5);
        return {
            x, y, size, radius,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            rot: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.03,
            jitter,
        };
    }

    function isTypingTarget(el) {
        return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    }

    function onKeyDown(e) {
        // the chatbot shares the page, so never steal keys aimed at a text field
        if (isTypingTarget(e.target)) return;
        if (e.key === ' ' || e.key === 'Backspace' || e.key.startsWith('Arrow')) e.preventDefault();
        if (e.key === 'Escape') { exitGame(); return; }

        if (enteringName) {
            if (/^[a-zA-Z]$/.test(e.key)) {
                if (initials.length < NAME_LENGTH) initials += e.key.toUpperCase();
            } else if (e.key === 'Backspace') {
                initials = initials.slice(0, -1);
            } else if (e.key === 'Enter' && initials.length === NAME_LENGTH) {
                enteringName = false;
                saveScore(score, initials);
                renderLeaderboard();
            }
            return;
        }

        if (gameOver && (e.key === 'r' || e.key === 'R')) { resetState(); return; }
        keys[normalizeKey(e.key)] = true;
    }
    function onKeyUp(e) {
        if (isTypingTarget(e.target)) return;
        keys[normalizeKey(e.key)] = false;
    }
    function releaseKeys() {
        keys = {};
    }
    function normalizeKey(key) {
        const map = {
            ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
            w: 'up', s: 'down', a: 'left', d: 'right',
            W: 'up', S: 'down', A: 'left', D: 'right',
            ' ': 'fire',
        };
        return map[key] || key;
    }

    function wrap(obj) {
        if (obj.x < 0) obj.x += W; else if (obj.x > W) obj.x -= W;
        if (obj.y < 0) obj.y += H; else if (obj.y > H) obj.y -= H;
    }

    function update() {
        // a key held while focus moves into a text field never delivers its keyup here,
        // so drop the held keys rather than letting the ship fly on by itself
        if (isTypingTarget(document.activeElement)) releaseKeys();

        if (fireCooldown > 0) fireCooldown--;
        if (invulnerable > 0) invulnerable--;

        if (!gameOver) {
            if (keys.left) ship.angle -= 0.06;
            if (keys.right) ship.angle += 0.06;
            if (keys.up) {
                ship.vx += Math.cos(ship.angle) * 0.08;
                ship.vy += Math.sin(ship.angle) * 0.08;
            }
            ship.vx *= 0.99;
            ship.vy *= 0.99;
            const speed = Math.hypot(ship.vx, ship.vy);
            const maxSpeed = 2.6;
            if (speed > maxSpeed) {
                ship.vx = (ship.vx / speed) * maxSpeed;
                ship.vy = (ship.vy / speed) * maxSpeed;
            }
            ship.x += ship.vx;
            ship.y += ship.vy;
            wrap(ship);

            if (keys.fire && fireCooldown <= 0) {
                bullets.push({
                    x: ship.x + Math.cos(ship.angle) * 8,
                    y: ship.y + Math.sin(ship.angle) * 8,
                    vx: Math.cos(ship.angle) * 4 + ship.vx * 0.5,
                    vy: Math.sin(ship.angle) * 4 + ship.vy * 0.5,
                    life: 55,
                });
                fireCooldown = 10;
            }
        }

        bullets.forEach((b) => { b.x += b.vx; b.y += b.vy; b.life--; wrap(b); });
        bullets = bullets.filter((b) => b.life > 0);

        asteroids.forEach((a) => {
            a.x += a.vx; a.y += a.vy; a.rot += a.rotSpeed; wrap(a);
        });

        particles.forEach((p) => { p.x += p.vx; p.y += p.vy; p.life--; });
        particles = particles.filter((p) => p.life > 0);

        // bullet vs asteroid — skipped once dead, so in-flight shots can't inflate the
        // final score after qualifies() has already judged it
        outer: for (let ai = asteroids.length - 1; !gameOver && ai >= 0; ai--) {
            const a = asteroids[ai];
            for (let bi = bullets.length - 1; bi >= 0; bi--) {
                const b = bullets[bi];
                if (Math.hypot(a.x - b.x, a.y - b.y) < a.radius) {
                    bullets.splice(bi, 1);
                    burst(a.x, a.y, 8);
                    asteroids.splice(ai, 1);
                    score += a.size === 'big' ? 20 : a.size === 'med' ? 50 : 100;
                    if (a.size === 'big') {
                        asteroids.push(makeAsteroid(a.x, a.y, 'med'));
                        asteroids.push(makeAsteroid(a.x, a.y, 'med'));
                    } else if (a.size === 'med') {
                        asteroids.push(makeAsteroid(a.x, a.y, 'small'));
                        asteroids.push(makeAsteroid(a.x, a.y, 'small'));
                    }
                    updateHud();
                    continue outer;
                }
            }
        }

        // ship vs asteroid
        if (!gameOver && invulnerable <= 0) {
            for (const a of asteroids) {
                if (Math.hypot(a.x - ship.x, a.y - ship.y) < a.radius + ship.radius) {
                    lives--;
                    burst(ship.x, ship.y, 14);
                    updateHud();
                    if (lives <= 0) {
                        endGame();
                    } else {
                        ship.x = W / 2; ship.y = H / 2; ship.vx = 0; ship.vy = 0;
                        invulnerable = 120;
                    }
                    break;
                }
            }
        }

        if (!gameOver && asteroids.length === 0) {
            spawnWave(Math.min(4 + Math.floor(score / 500), 8));
        }
    }

    function burst(x, y, count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 1.5 + 0.3;
            particles.push({
                x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                life: 20 + Math.random() * 15,
            });
        }
    }

    function endGame() {
        gameOver = true;
        releaseKeys();
        if (qualifies(score)) {
            enteringName = true;
            initials = '';
        }
    }

    function updateHud() {
        scoreEl.textContent = `SCORE ${String(score).padStart(4, '0')}`;
        livesEl.textContent = '♥ '.repeat(Math.max(lives, 0)).trim() || '—';
    }

    function draw() {
        ctx.fillStyle = '#05070c';
        ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = '#4ade80';
        ctx.fillStyle = '#4ade80';
        particles.forEach((p) => {
            // canvas ignores globalAlpha outside 0-1, which would leak the previous value
            ctx.globalAlpha = Math.min(Math.max(p.life / 25, 0), 1);
            ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
        });
        ctx.globalAlpha = 1;

        ctx.strokeStyle = '#e8f4fb';
        bullets.forEach((b) => {
            ctx.fillStyle = '#facc15';
            ctx.fillRect(Math.round(b.x), Math.round(b.y), 2, 2);
        });

        ctx.strokeStyle = '#7dd3fc';
        ctx.lineWidth = 1;
        asteroids.forEach((a) => {
            ctx.beginPath();
            const verts = a.jitter.length;
            for (let i = 0; i <= verts; i++) {
                const t = a.rot + (i % verts) * ((Math.PI * 2) / verts);
                const r = a.radius * a.jitter[i % verts];
                const px = a.x + Math.cos(t) * r;
                const py = a.y + Math.sin(t) * r;
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.stroke();
        });

        if (!gameOver && (invulnerable <= 0 || Math.floor(invulnerable / 6) % 2 === 0)) {
            ctx.save();
            ctx.translate(ship.x, ship.y);
            ctx.rotate(ship.angle);
            ctx.strokeStyle = '#4A9FD3';
            ctx.fillStyle = '#eef5fa';
            ctx.beginPath();
            ctx.moveTo(9, 0);
            ctx.lineTo(-7, 6);
            ctx.lineTo(-4, 0);
            ctx.lineTo(-7, -6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            if (keys.up) {
                ctx.beginPath();
                ctx.moveTo(-4, 0);
                ctx.lineTo(-10, 3);
                ctx.lineTo(-13, 0);
                ctx.lineTo(-10, -3);
                ctx.closePath();
                ctx.fillStyle = '#f97316';
                ctx.fill();
            }
            ctx.restore();
        }

        if (gameOver) {
            ctx.fillStyle = 'rgba(5, 7, 12, 0.72)';
            ctx.fillRect(0, 0, W, H);
            ctx.textAlign = 'center';
            ctx.fillStyle = '#eef5fa';
            ctx.font = '16px "Courier New", monospace';
            ctx.fillText('GAME OVER', W / 2, enteringName ? 84 : 112);

            if (enteringName) {
                ctx.font = '9px "Courier New", monospace';
                ctx.fillStyle = '#7dd3fc';
                ctx.fillText('NEW HIGH SCORE — ENTER INITIALS', W / 2, 104);

                const slotW = 24;
                const gap = 12;
                const startX = W / 2 - (slotW * NAME_LENGTH + gap * (NAME_LENGTH - 1)) / 2;
                const blinkOn = Math.floor(Date.now() / 400) % 2 === 0;
                for (let i = 0; i < NAME_LENGTH; i++) {
                    const x = startX + i * (slotW + gap);
                    const isCursor = i === initials.length;
                    ctx.fillStyle = isCursor && blinkOn ? '#facc15' : '#4A9FD3';
                    ctx.fillRect(x, 140, slotW, 2);
                    if (initials[i]) {
                        ctx.fillStyle = '#eef5fa';
                        ctx.font = '20px "Courier New", monospace';
                        ctx.fillText(initials[i], x + slotW / 2, 136);
                    }
                }

                ctx.font = '8px "Courier New", monospace';
                ctx.fillStyle = '#9bb1c2';
                ctx.fillText(
                    initials.length === NAME_LENGTH
                        ? 'ENTER TO SAVE · BACKSPACE TO EDIT'
                        : 'TYPE A-Z',
                    W / 2,
                    162
                );
            } else {
                ctx.font = '10px "Courier New", monospace';
                ctx.fillText('PRESS R TO RESTART · ESC TO EXIT', W / 2, 132);
            }
            ctx.textAlign = 'start';
        }
    }

    function loop(now) {
        if (!active) return;
        if (!lastFrame) lastFrame = now;
        // step at a fixed 60Hz so the tuned speeds hold on 120Hz+ displays; the cap keeps a
        // backgrounded tab from fast-forwarding a huge batch of steps when it comes back
        stepDebt += Math.min(now - lastFrame, MAX_CATCHUP_MS);
        lastFrame = now;
        while (stepDebt >= STEP_MS) {
            update();
            stepDebt -= STEP_MS;
        }
        draw();
        rafId = requestAnimationFrame(loop);
    }

    function loadScores() {
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (!Array.isArray(stored)) return [];
            // storage is user-writable: drop anything that isn't a usable entry
            return stored.filter((s) => s && typeof s === 'object' && Number.isFinite(s.score));
        } catch {
            return [];
        }
    }

    function qualifies(value) {
        if (value <= 0) return false;
        const scores = loadScores();
        return scores.length < MAX_SCORES || value > scores[scores.length - 1].score;
    }

    function saveScore(value, name) {
        let scores = loadScores().map((s) => ({ ...s, latest: false }));
        scores.push({ name, score: value, date: new Date().toISOString(), latest: true });
        scores = scores.sort((a, b) => b.score - a.score).slice(0, MAX_SCORES);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
        } catch {
            /* storage unavailable, ignore */
        }
    }

    function renderLeaderboard() {
        const list = document.getElementById('leaderboardList');
        if (!list) return;
        const scores = loadScores().sort((a, b) => b.score - a.score);
        if (scores.length === 0) {
            list.innerHTML = '<li class="leaderboard-empty">No scores yet — go fly!</li>';
            return;
        }
        list.innerHTML = scores
            .map((s) => {
                // storage is user-writable, so re-apply the A-Z rule before it reaches innerHTML
                const name = String(s.name || '').replace(/[^A-Za-z]/g, '').slice(0, NAME_LENGTH).toUpperCase() || '---';
                return `<li class="${s.latest ? 'is-latest' : ''}"><span class="lb-name">${name}</span><span class="lb-score">${Number(s.score) || 0}</span></li>`;
            })
            .join('');
    }

    trigger.addEventListener('click', startGame);
    trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            startGame();
        }
    });
    exitBtn.addEventListener('click', exitGame);

    // ClientRouter swaps the DOM without unloading the page, so leaving mid-game would
    // otherwise strand the loop and its key listeners on a detached canvas. `once` keeps
    // this from stacking, since setup re-runs on every astro:page-load.
    document.addEventListener('astro:before-swap', teardown, { once: true });
}
