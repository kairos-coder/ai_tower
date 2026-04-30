// ═══════════════════════════════════════════
// render.js — Drawing only, reads from WORLD
// ═══════════════════════════════════════════

const RENDER = {
    canvas: null,
    ctx: null,
    cellSize: 36,

    colors: {
        residential: '#e8a87c',
        commercial: '#85cdca',
        utility: '#c38d9e',
        elevator: '#ff6b6b',
        ground: '#6b6b3d',
        grid: '#1a1a35',
        sky: ['#0a0a1e', '#1a1a35', '#0d0d20'],
    },

    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = WORLD.cols * this.cellSize;
        this.canvas.height = 600;
    },

    render(world) {
        const ctx = this.ctx;
        const cs = this.cellSize;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Sky gradient
        const grad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        grad.addColorStop(0, '#0a0a1e');
        grad.addColorStop(0.6, '#1a1a35');
        grad.addColorStop(1, '#0d0d20');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw cells
        for (let r = 0; r < world.rows; r++) {
            for (let c = 0; c < world.cols; c++) {
                const x = c * cs;
                const y = r * cs;
                const entity = world.getEntityAt(r, c);

                // Grid line
                ctx.strokeStyle = this.colors.grid;
                ctx.lineWidth = 0.5;
                ctx.strokeRect(x, y, cs, cs);

                if (entity) {
                    // Filled cell
                    const color = this.colors[entity.type] || '#555';
                    ctx.fillStyle = color;
                    ctx.fillRect(x + 1, y + 1, cs - 2, cs - 2);

                    // Icon
                    ctx.fillStyle = '#fff';
                    ctx.font = '14px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    const cx = x + cs / 2;
                    const cy = y + cs / 2;
                    
                    const icons = {
                        residential: '🏠',
                        commercial: '🏪',
                        utility: '⚡',
                        elevator_cell: '↕',
                    };
                    ctx.fillText(icons[entity.type] || '?', cx, cy);

                    // Happiness indicator for residential/commercial
                    if (entity.happiness !== undefined) {
                        const hx = x + cs - 8;
                        const hy = y + 6;
                        ctx.fillStyle = entity.happiness > 0.7 ? '#6bcb77' : 
                                       entity.happiness > 0.4 ? '#ffd93d' : '#ff6b6b';
                        ctx.beginPath();
                        ctx.arc(hx, hy, 4, 0, Math.PI * 2);
                        ctx.fill();
                    }
                } else {
                    // Empty cell
                    ctx.fillStyle = '#111125';
                    ctx.fillRect(x + 1, y + 1, cs - 2, cs - 2);
                }
            }
        }

        // Ground line
        const groundY = world.groundRow * cs;
        ctx.strokeStyle = this.colors.ground;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(this.canvas.width, groundY);
        ctx.stroke();

        // Ground labels
        ctx.fillStyle = this.colors.ground;
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('═══ GROUND ═══', 4, groundY - 4);

        ctx.fillStyle = '#3a3a5a';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('▲ SKY ▲', this.canvas.width - 8, 14);
        ctx.fillText('▼ BASEMENT ▼', this.canvas.width - 8, groundY + 16);

        // Elevator cars (overlay)
        for (const elevator of Object.values(world.elevators)) {
            const ex = elevator.col * cs + cs / 2 - 12;
            const ey = elevator.currentFloor * cs + cs / 2 - 8;
            
            ctx.fillStyle = '#ff6b6b';
            ctx.fillRect(ex, ey, 24, 16);
            ctx.fillStyle = '#fff';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⬍', ex + 12, ey + 11);
        }
    },
};
