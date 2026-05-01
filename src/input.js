// ═══════════════════════════════════════════
// input.js — Mouse and keyboard handling
// ═══════════════════════════════════════════

const INPUT = {
    canvas: null,
    selectedTool: 'residential',

    // Callbacks
    onToolChange: null, // function(toolName)
    onCanvasClick: null, // function(row, col, tool)

    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleHover(e));
        document.addEventListener('keydown', (e) => this.handleKey(e));
    },

    setTool(tool) {
        this.selectedTool = tool;
        if (this.onToolChange) {
            this.onToolChange(tool);
        }
    },

    handleClick(e) {
        const pos = this.getGridPosition(e);
        if (!pos) return;

        if (this.onCanvasClick) {
            this.onCanvasClick(pos.row, pos.col, this.selectedTool);
        }
    },

    handleHover(e) {
        // Stub for future hover preview
        // const pos = this.getGridPosition(e);
    },

    handleKey(e) {
        // Keyboard shortcuts for tools
        const keyMap = {
            '1': 'residential',
            '2': 'commercial',
            '3': 'utility',
            '4': 'elevator',
            '0': 'demolish',
        };

        const tool = keyMap[e.key];
        if (tool) {
            this.setTool(tool);
        }
    },

    getGridPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        const col = Math.floor(px / CONFIG.GRID.CELL_SIZE);
        const row = Math.floor(py / CONFIG.GRID.CELL_SIZE);

        if (row < 0 || row >= CONFIG.GRID.ROWS ||
            col < 0 || col >= CONFIG.GRID.COLS) {
            return null;
        }

        return { row, col };
    },
};
window.INPUT = INPUT;
