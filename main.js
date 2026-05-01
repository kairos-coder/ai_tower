// ═══════════════════════════════════════════
// main.js — Bootstrap, game loop, wiring
// ═══════════════════════════════════════════

const GAME = {
    lastTime: 0,
    running: false,

    init() {
        // Initialize modules in dependency order
        WORLD.init();
        RENDER.init('towerCanvas');
        INPUT.init('towerCanvas');
        HUD.init();
        Log.init('logBox');

        // Wire input callbacks
        INPUT.onToolChange = (tool) => {
            HUD.update(WORLD);
        };

        INPUT.onCanvasClick = (row, col, tool) => {
            if (tool === 'demolish') {
                SIM.demolish(WORLD, row, col);
            } else {
                SIM.placeEntity(WORLD, tool, row, col);
            }
        };

        // Place starter buildings
        this.placeStarters();

        // Start loop
        this.lastTime = performance.now();
        this.running = true;
        requestAnimationFrame((t) => this.loop(t));
    },

    placeStarters() {
        const startCol = Math.floor(CONFIG.GRID.COLS / 2);
        const groundRow = CONFIG.GRID.GROUND_ROW;

        SIM.placeEntity(WORLD, 'elevator', groundRow - 2, startCol);
        SIM.placeEntity(WORLD, 'residential', groundRow - 1, startCol - 1);
        SIM.placeEntity(WORLD, 'commercial', groundRow - 1, startCol + 1);

        WORLD.addLog('🏗️ Tower Forge ready — build adjacent to existing rooms!', CONFIG.COLORS.LOG_SUCCESS);
        WORLD.addLog('💡 Keys 1-4 for tools, 0 for demolish', CONFIG.COLORS.LOG_INFO);
        WORLD.addLog('💡 Happiness dots: green=happy, yellow=neutral, red=unhappy', CONFIG.COLORS.LOG_INFO);
    },

    loop(timestamp) {
        if (!this.running) return;

        const delta = Math.min((timestamp - this.lastTime) / 1000, 0.2);
        this.lastTime = timestamp;

        // Run simulation
        SIM.tick(WORLD, delta);

        // Render
        RENDER.render(WORLD);

        // Update UI
        HUD.update(WORLD);
        Log.render(WORLD);

        requestAnimationFrame((t) => this.loop(t));
    },
};

// Boot
document.addEventListener('DOMContentLoaded', () => {
    GAME.init();
});
window.GAME = GAME;
