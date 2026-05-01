// ═══════════════════════════════════════════
// hud.js — Heads-up display, stat cards, tool buttons
// ═══════════════════════════════════════════

const HUD = {
    elements: {},

    init() {
        // Cache DOM references
        this.elements = {
            moneyDisplay: document.getElementById('moneyDisplay'),
            incomeDisplay: document.getElementById('incomeDisplay'),
            popDisplay: document.getElementById('popDisplay'),
            toolButtons: document.querySelectorAll('.tool-btn'),
        };

        // Wire up tool buttons
        this.elements.toolButtons.forEach(btn => {
            const tool = btn.dataset.tool;
            btn.addEventListener('click', () => {
                INPUT.setTool(tool);
            });
        });
    },

    update(world) {
        this.updateMoney(world);
        this.updateIncome(world);
        this.updatePopulation(world);
        this.updateToolButtons();
    },

    updateMoney(world) {
        if (this.elements.moneyDisplay) {
            this.elements.moneyDisplay.textContent = `$${Math.floor(world.money)}`;
        }
    },

    updateIncome(world) {
        if (this.elements.incomeDisplay) {
            this.elements.incomeDisplay.textContent = `$${Economy.calculateIncome(world)}`;
        }
    },

    updatePopulation(world) {
        if (this.elements.popDisplay) {
            const residentials = world.getAllEntitiesOfType('residential');
            const total = residentials.reduce((sum, e) => sum + (e.occupants || 0), 0);
            this.elements.popDisplay.textContent = total;
        }
    },

    updateToolButtons() {
        this.elements.toolButtons.forEach(btn => {
            const tool = btn.dataset.tool;
            btn.classList.toggle('active', INPUT.selectedTool === tool);
        });
    },
};
window.HUD = HUD;
