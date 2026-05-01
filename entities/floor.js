// ═══════════════════════════════════════════
// floor.js — Entity definition for placed rooms
// ═══════════════════════════════════════════

const Floor = {
    /**
     * Create a floor entity
     * @param {string} type - 'residential' | 'commercial' | 'utility' | 'elevator_cell'
     * @param {string} id - unique entity ID
     * @param {number} row - grid row
     * @param {number} col - grid column
     * @param {object} overrides - additional properties
     * @returns {object} entity
     */
    create(type, id, row, col, overrides = {}) {
        const base = {
            // Identity
            id,
            type,
            row,
            col,
            placedAt: Date.now(),

            // Display (for future AI flavor layer)
            name: null,        // "The Rusty Nail" (commercial), "Apt 4B" (residential)
            customLabel: null, // player-given name
        };

        // Type-specific defaults
        switch (type) {
            case 'residential':
                Object.assign(base, {
                    occupants: 0,
                    occupantCapacity: CONFIG.RESIDENTS.DEFAULT_PER_RESIDENTIAL,
                    happiness: CONFIG.HAPPINESS.NEUTRAL,
                    income: CONFIG.BASE_INCOME.residential,
                    upgradeLevel: 1,
                });
                break;

            case 'commercial':
                Object.assign(base, {
                    businessName: null,
                    customers: 0,
                    maxCustomers: 8,
                    happiness: CONFIG.HAPPINESS.NEUTRAL,
                    income: CONFIG.BASE_INCOME.commercial,
                    upgradeLevel: 1,
                });
                break;

            case 'utility':
                Object.assign(base, {
                    powerOutput: 10,
                    coverageRadius: 3,
                    income: 0,
                    upgradeLevel: 1,
                });
                break;

            case 'elevator_cell':
                Object.assign(base, {
                    elevatorId: null,
                });
                break;

            default:
                break;
        }

        // Apply any overrides
        Object.assign(base, overrides);

        return base;
    },

    /**
     * Get display icon for a floor type
     */
    getIcon(type) {
        const icons = {
            residential: '🏠',
            commercial: '🏪',
            utility: '⚡',
            elevator_cell: '↕',
        };
        return icons[type] || '❓';
    },

    /**
     * Get color for a floor type
     */
    getColor(type) {
        const colors = {
            residential: CONFIG.COLORS.RESIDENTIAL,
            commercial: CONFIG.COLORS.COMMERCIAL,
            utility: CONFIG.COLORS.UTILITY,
            elevator_cell: CONFIG.COLORS.ELEVATOR,
        };
        return colors[type] || '#555555';
    },

    /**
     * Check if a floor type generates income
     */
    generatesIncome(type) {
        return type === 'residential' || type === 'commercial';
    },
};
window.Floor = Floor;
