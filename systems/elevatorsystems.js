// ═══════════════════════════════════════════
// elevatorsystem.js — Elevator movement, shaft management
// ═══════════════════════════════════════════

const ElevatorSystem = {
    /**
     * Update all elevator positions
     */
    updateAll(world, deltaSeconds) {
        for (const elevator of Object.values(world.elevators)) {
            this.update(elevator, deltaSeconds);
        }
    },

    /**
     * Update a single elevator's position
     */
    update(elevator, deltaSeconds) {
        const range = Elevator.getRange(elevator);
        if (range.min === range.max) return; // single-cell shaft, nowhere to go

        elevator.currentFloor += elevator.direction * elevator.speed * deltaSeconds;

        // Bounce at boundaries
        if (elevator.currentFloor >= range.max) {
            elevator.currentFloor = range.max;
            elevator.direction = -1;
        } else if (elevator.currentFloor <= range.min) {
            elevator.currentFloor = range.min;
            elevator.direction = 1;
        }
    },

    /**
     * Extend an elevator shaft to cover adjacent built floors
     */
    extendShaft(world, elevator) {
        const col = elevator.col;
        const rows = [...elevator.cells];
        const minRow = Math.min(...rows);
        const maxRow = Math.max(...rows);

        // Extend down to ground level
        for (let r = maxRow + 1; r <= CONFIG.GRID.GROUND_ROW; r++) {
            if (r < CONFIG.GRID.ROWS && !world.isCellOccupied(r, col)) {
                this.addShaftCell(world, elevator, r, col);
            }
        }

        // Extend up to cover adjacent buildings
        for (let r = minRow - 1; r >= 0; r--) {
            const adjacent = world.getAdjacentEntities(r, col);
            if (adjacent.length > 0 && !world.isCellOccupied(r, col)) {
                this.addShaftCell(world, elevator, r, col);
            } else if (!world.isCellOccupied(r, col)) {
                break; // stop at first row with no adjacent buildings
            }
        }
    },

    /**
     * Add a single cell to an elevator shaft
     */
    addShaftCell(world, elevator, row, col) {
        world.createEntity('elevator_cell', row, col, {
            elevatorId: elevator.id,
        });
        elevator.cells.add(row);
    },

    /**
     * Find the nearest elevator to a given position
     */
    findNearestElevator(world, row, col) {
        let nearest = null;
        let nearestDist = Infinity;

        for (const elevator of Object.values(world.elevators)) {
            const dist = Math.abs(elevator.col - col) +
                         Math.min(...[...elevator.cells].map(r => Math.abs(r - row)));
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = elevator;
            }
        }

        return nearest;
    },

    /**
     * Get wait time estimate for an elevator (stub for future queue system)
     */
    getEstimatedWait(elevator) {
        const range = Elevator.getRange(elevator);
        const shaftLength = range.max - range.min;
        return shaftLength / elevator.speed; // rough round-trip time in seconds
    },
};
window.ElevatorSystem = ElevatorSystem;
