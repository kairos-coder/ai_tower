// ═══════════════════════════════════════════
// render.js — Canvas drawing. Reads WORLD, never modifies it.
// ═══════════════════════════════════════════

const RENDER = {
    canvas: null,
    ctx: null,

    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CONFIG.CANVAS.WIDTH;
        this.canvas.height = CONFIG.CANVAS.HEIGHT;
    },

    render(world) {
        this.drawBackground();
        this.drawGrid(world);
        this.drawGroundLine();
        this.drawElevators(world);
    },

    drawBackground() {
        const ctx = this.ctx;
        const grad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        grad.addColorStop(0, CONFIG.COLORS.SKY_TOP);
        grad.addColorStop(0.6, CONFIG.COLORS.SKY_MID);
        grad.addColorStop(1, CONFIG.COLORS.SKY_BOT);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },

    drawGrid(world) {
        const ctx = this.ctx;
        const cs = CONFIG.GRID.CELL_SIZE;

        for (let r = 0; r < CONFIG.GRID.ROWS; r++) {
            for (let c = 0; c < CONFIG.GRID.COLS; c++) {
                const x = c * cs;
                const y = r * cs;
                const entity = world.getEntityAt(r, c);

                // Grid line
                ctx.strokeStyle = CONFIG.COLORS.GRID_LINE;
                ctx.lineWidth = 0.5;
                ctx.strokeRect(x, y, cs, cs);

                if (entity) {
                    this.drawCell(x, y, cs, entity);
                } else {
                    ctx.fillStyle = CONFIG
