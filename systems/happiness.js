// ═══════════════════════════════════════════
// happiness.js — Happiness simulation
// First agent-like emergent behavior system
// ═══════════════════════════════════════════

const Happiness = {
    /**
     * Update happiness for all residential and commercial floors
     */
    updateAll(world) {
        const relevantTypes = ['residential', 'commercial'];
        for (const entity of world.getAllPlacedEntities()) {
            if (relevantTypes.includes(entity.type)) {
                this.updateFloor(world, entity);
            }
        }
    },

    /**
     * Update happiness for a single floor
     */
    updateFloor(world, entity) {
        let delta = 0;

        // Natural drift toward neutral
        delta += (CONFIG.HAPPINESS.NEUTRAL - entity.happiness) * CONFIG.HAPPINESS.DRIFT_RATE;

        // Adjacent elevator bonus
        const adjacent = world.getAdjacentEntities(entity.row, entity.col);
        const nearElevator = adjacent.some(e => e.type === 'elevator_cell');
        if (nearElevator) {
            delta += CONFIG.HAPPINESS.ELEVATOR_BONUS;
        }

        // Adjacent utility bonus
        const nearUtility = adjacent.some(e => e.type === 'utility');
        if (nearUtility) {
            delta += CONFIG.HAPPINESS.UTILITY_BONUS;
        }

        // Crowding penalty (no empty adjacent cells)
        if (world.countEmptyNeighbors(entity.row, entity.col) === 0) {
            delta -= CONFIG.HAPPINESS.CROWDING_PENALTY;
        }

        // Apply
        entity.happiness = Math.max(0, Math.min(1, entity.happiness + delta));
    },

    /**
     * Update resident moods based on their floor's happiness
     */
    updateResidentMoods(world) {
        for (const resident of Object.values(world.residents)) {
            const floor = world.getEntityById(resident.floorEntityId);
            if (!floor) continue;

            if (floor.happiness >= CONFIG.HAPPINESS.HAPPY_THRESHOLD) {
                resident.mood = 'happy';
            } else if (floor.happiness >= CONFIG.HAPPINESS.NEUTRAL_THRESHOLD) {
                resident.mood = 'neutral';
            } else {
                resident.mood = 'unhappy';
            }
        }
    },

    /**
     * Get color for a happiness value
     */
    getColor(happiness) {
        if (happiness >= CONFIG.HAPPINESS.HAPPY_THRESHOLD) return CONFIG.COLORS.HAPPY;
        if (happiness >= CONFIG.HAPPINESS.NEUTRAL_THRESHOLD) return CONFIG.COLORS.NEUTRAL;
        return CONFIG.COLORS.UNHAPPY;
    },

    /**
     * Get mood emoji for a resident
     */
    getMoodEmoji(mood) {
        const emojis = {
            happy: '😊',
            neutral: '😐',
            unhappy: '😟',
        };
        return emojis[mood] || '😐';
    },
};
window.Happiness = Happiness;
