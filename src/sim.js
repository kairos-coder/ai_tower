// ═══════════════════════════════════════════
// sim.js — Rules engine, validation, economics
// ═══════════════════════════════════════════

const SIM = {
    // ── Costs ───────────────────────────────
    costs: {
        residential: 40,
        commercial: 60,
        utility: 30,
        elevator: 100,
    },

    // ── Base income per tick ────────────────
    baseIncome: {
        residential: 15,
        commercial: 25,
        utility: 0,
    },

    // ── Placement Validation ────────────────
    canPlace(world, type, row, col) {
        // Out of bounds
        if (row < 0 || row >= world.rows || col < 0 || col >= world.cols) {
            return { allowed: false, reason: 'Out of bounds' };
        }

        // Already occupied
        if (world.isCellOccupied(row, col)) {
            return { allowed: false, reason: 'Cell occupied' };
        }

        // Cost check
        const cost = this.costs[type];
        if (world.money < cost) {
            return { allowed: false, reason: `Need $${cost}, have $${Math.floor(world.money)}` };
        }

        // Adjacency rule: must touch existing building or elevator
        // Exception: very first placement
        const allPlaced = world.getAllPlacedEntities();
        if (allPlaced.length > 0) {
            const adjacent = world.getAdjacentEntities(row, col);
            const hasAdjacentBuilding = adjacent.length > 0;
            // Also check if adjacent to elevator shaft (elevator_cell)
            const hasAdjacentElevator = adjacent.some(e => e.type === 'elevator_cell');
            
            if (!hasAdjacentBuilding && !hasAdjacentElevator) {
                return { 
                    allowed: false, 
                    reason: 'Must be adjacent to existing building or elevator' 
                };
            }
        }

        return { allowed: true };
    },

    // ── Placement Execution ─────────────────
    placeEntity(world, type, row, col) {
        const validation = this.canPlace(world, type, row, col);
        if (!validation.allowed) {
            world.addLog(`❌ ${validation.reason}`, '#ff6b6b');
            return null;
        }

        const cost = this.costs[type];
        world.spendMoney(cost);

        let entity;
        if (type === 'elevator') {
            // Create elevator system + first cell
            const elevator = world.createElevator(col, [row]);
            entity = world.createEntity('elevator_cell', row, col, {
                elevatorId: elevator.id,
            });
            world.addLog(`↕ Elevator shaft started at column ${col}`, '#ff6b6b');
            
            // Auto-extend shaft
            this.extendElevatorShaft(world, elevator);
        } else {
            entity = world.createEntity(type, row, col);
            world.addLog(`✅ ${type} placed at [${row},${col}]`, '#6bcb77');
        }

        return entity;
    },

    // ── Elevator Shaft Extension ────────────
    extendElevatorShaft(world, elevator) {
        const col = elevator.col;
        const rows = [...elevator.cells];
        const minRow = Math.min(...rows);
        const maxRow = Math.max(...rows);

        // Extend down to ground
        for (let r = maxRow + 1; r <= world.groundRow; r++) {
            if (!world.isCellOccupied(r, col)) {
                const cellEntity = world.createEntity('elevator_cell', r, col, {
                    elevatorId: elevator.id,
                });
                elevator.cells.add(r);
            }
        }

        // Extend up if adjacent to buildings
        for (let r = minRow - 1; r >= 0; r--) {
            const adjacent = world.getAdjacentEntities(r, col);
            if (adjacent.length > 0 && !world.isCellOccupied(r, col)) {
                const cellEntity = world.createEntity('elevator_cell', r, col, {
                    elevatorId: elevator.id,
                });
                elevator.cells.add(r);
            } else {
                break;
            }
        }
    },

    // ── Demolition ──────────────────────────
    demolish(world, row, col) {
        const entity = world.removeEntity(row, col);
        if (entity) {
            world.addLog(`💣 Demolished ${entity.type} at [${row},${col}]`, '#ff6b6b');
        }
        return entity;
    },

    // ── Income Calculation ──────────────────
    calculateIncome(world) {
        let total = 0;
        const utilities = world.getAllEntitiesOfType('utility');
        const utilityBonus = 1 + (utilities.length * 0.15);

        const residentials = world.getAllEntitiesOfType('residential');
        const commercials = world.getAllEntitiesOfType('commercial');

        for (const entity of [...residentials, ...commercials]) {
            total += (this.baseIncome[entity.type] || 0) * utilityBonus;
        }

        return Math.floor(total);
    },

    // ── Happiness Update (first agent-like system) ──
    updateHappiness(world) {
        for (const entity of world.getAllPlacedEntities()) {
            if (entity.type === 'residential' || entity.type === 'commercial') {
                // Base happiness drift toward neutral
                let delta = (0.7 - entity.happiness) * 0.05;

                // Proximity to elevator: +happiness
                const adjacent = world.getAdjacentEntities(entity.row, entity.col);
                const nearElevator = adjacent.some(e => e.type === 'elevator_cell');
                if (nearElevator) {
                    delta += 0.02;
                }

                // Proximity to utility: +happiness (powered!)
                const nearUtility = adjacent.some(e => e.type === 'utility');
                if (nearUtility) {
                    delta += 0.03;
                }

                // Crowding penalty: if no adjacent empty cells
                const allAdjacent = [
                    [entity.row - 1, entity.col],
                    [entity.row + 1, entity.col],
                    [entity.row, entity.col - 1],
                    [entity.row, entity.col + 1],
                ];
                const emptyNeighbors = allAdjacent.filter(([r, c]) => 
                    r >= 0 && r < world.rows && 
                    c >= 0 && c < world.cols && 
                    !world.isCellOccupied(r, c)
                );
                if (emptyNeighbors.length === 0) {
                    delta -= 0.03; // claustrophobia
                }

                entity.happiness = Math.max(0, Math.min(1, entity.happiness + delta));
            }
        }
    },

    // ── Simulation Tick ─────────────────────
    tick(world, deltaSeconds) {
        world.tickAccumulator += deltaSeconds;

        // Update elevator positions
        for (const elevator of Object.values(world.elevators)) {
            const rows = [...elevator.cells];
            if (rows.length === 0) continue;
            
            const minRow = Math.min(...rows);
            const maxRow = Math.max(...rows);
            
            elevator.currentFloor += elevator.direction * elevator.speed * deltaSeconds;
            
            if (elevator.currentFloor >= maxRow) {
                elevator.currentFloor = maxRow;
                elevator.direction = -1;
            } else if (elevator.currentFloor <= minRow) {
                elevator.currentFloor = minRow;
                elevator.direction = 1;
            }
        }

        // Income pulse
        if (world.tickAccumulator >= world.tickInterval) {
            world.tickAccumulator -= world.tickInterval;
            
            const income = this.calculateIncome(world);
            if (income > 0) {
                world.addMoney(income);
                world.addLog(`💰 +$${income} income`, '#ffd93d');
            }

            // Update happiness on income pulse
            this.updateHappiness(world);
        }
    },
};
