// ═══════════════════════════════════════════
// elevator.js — Elevator system entity
// ═══════════════════════════════════════════

const Elevator = {
    /**
     * Create an elevator system
     * @param {number} idNum - numeric ID
     * @param {number} col - grid column
     * @param {number[]} cells - initial row indices
     * @returns {object} elevator
     */
    create(idNum, col, cells = []) {
        return {
            id: `elevator_${idNum}`,
            col,

            // Shaft
            cells: new Set(cells), // Set of row indices

            // Movement
            currentFloor: cells.length > 0 ? Math.min(...cells) : 0,
            direction: 1,          // 1 = down, -1 = up
            speed: CONFIG.ELEVATOR.DEFAULT_SPEED,

            // Queue system (future)
            queue: [],             // { fromRow, toRow, residentId }
            capacity: CONFIG.ELEVATOR.DEFAULT_CAPACITY,
            currentPassengers: [],

            // Stats
            totalTrips: 0,
            totalWaitTime: 0,
        };
    },

    /**
     * Get the min and max row this elevator serves
     */
    getRange(elevator) {
        const rows = [...elevator.cells];
        if (rows.length === 0) return { min: 0, max: 0 };
        return {
            min: Math.min(...rows),
            max: Math.max(...rows),
        };
    },

    /**
     * Check if elevator serves a specific row
     */
    servesRow(elevator, row) {
        return elevator.cells.has(row);
    },
};
