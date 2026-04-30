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
                    ctx.fillStyle = CONFIG.COLORS.EMPTY_CELL;
                    ctx.fillRect(x + 1, y + 1, cs - 2, cs - 2);
                }
            }
        }
    },

    drawCell(x, y, size, entity) {
        const ctx = this.ctx;

        // Fill
        ctx.fillStyle = Floor.getColor(entity.type);
        ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

        // Icon
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Floor.getIcon(entity.type), x + size / 2, y + size / 2);

        // Happiness dot (residential and commercial only)
        if (entity.happiness !== undefined) {
            const dotX = x + size - 8;
            const dotY = y + 6;
            ctx.fillStyle = Happiness.getColor(entity.happiness);
            ctx.beginPath();
            ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    drawGroundLine() {
        const ctx = this.ctx;
        const groundY = CONFIG.GRID.GROUND_ROW * CONFIG.GRID.CELL_SIZE;

        ctx.strokeStyle = CONFIG.COLORS.GROUND;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(this.canvas.width, groundY);
        ctx.stroke();

        // Labels
        ctx.fillStyle = CONFIG.COLORS.GROUND;
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('═══ GROUND ═══', 4, groundY - 4);

        ctx.fillStyle = '#3a3a5a';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('▲ SKY ▲', this.canvas.width - 8, 14);
        ctx.fillText('▼ BASEMENT ▼', this.canvas.width - 8, groundY + 16);
    },

    drawElevators(world) {
        const ctx = this.ctx;
        const cs = CONFIG.GRID.CELL_SIZE;

        for (const elevator of Object.values(world.elevators)) {
            const x = elevator.col * cs + cs / 2 - 12;
            const y = elevator.currentFloor * cs + cs / 2 - 8;

            // Car
            ctx.fillStyle = CONFIG.COLORS.ELEVATOR;
            ctx.fillRect(x, y, 24, 16);

            // Direction indicator
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            const arrow = elevator.direction > 0 ? '⬇' : '⬆';
            ctx.fillText(arrow, x + 12, y + 11);
        }
    },
};
