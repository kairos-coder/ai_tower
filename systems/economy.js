// ═══════════════════════════════════════════
// economy.js — Income calculation, money flow
// ═══════════════════════════════════════════

const Economy = {
    /**
     * Calculate total income per tick
     * Formula: sum(room base income) × utility multiplier
     */
    calculateIncome(world) {
        let total = 0;

        // Count utilities for bonus
        const utilities = world.getAllEntitiesOfType('utility');
        const utilityBonus = 1 + (utilities.length * CONFIG.UTILITY_BONUS);

        // Sum income from residential and commercial
        const incomeGenerators = [
            ...world.getAllEntitiesOfType('residential'),
            ...world.getAllEntitiesOfType('commercial'),
        ];

        for (const entity of incomeGenerators) {
            // Base income scaled by happiness
            const happinessMod = 0.5 + (entity.happiness || CONFIG.HAPPINESS.NEUTRAL) * 0.5;
            const baseIncome = CONFIG.BASE_INCOME[entity.type] || 0;

            // For residential, scale by occupancy
            let occupancyMod = 1;
            if (entity.type === 'residential' && entity.occupantCapacity > 0) {
                occupancyMod = entity.occupants / entity.occupantCapacity;
            }

            total += baseIncome * happinessMod * occupancyMod * utilityBonus;
        }

        return Math.floor(total);
    },

    /**
     * Calculate the cost to build something (may include modifiers later)
     */
    getCost(type) {
        return CONFIG.COSTS[type] || 0;
    },

    /**
     * Calculate upgrade cost for a floor
     */
    getUpgradeCost(entity) {
        const baseCost = CONFIG.COSTS[entity.type] || 40;
        return Math.floor(baseCost * 1.5 * entity.upgradeLevel);
    },
};
window.Economy = Economy;
