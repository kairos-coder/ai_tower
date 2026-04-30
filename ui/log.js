// ═══════════════════════════════════════════
// log.js — Event log display
// ═══════════════════════════════════════════

const Log = {
    element: null,

    init(elementId) {
        this.element = document.getElementById(elementId);
    },

    render(world) {
        if (!this.element) return;

        this.element.innerHTML = world.log
            .map(entry =>
                `<div class="log-entry" style="color:${entry.color};">
                    ${entry.message}
                </div>`
            )
            .join('');

        // Auto-scroll to top (newest)
        this.element.scrollTop = 0;
    },
};
