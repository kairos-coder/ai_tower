// ═══════════════════════════════════════════
// sim.js — Rules engine, validation, economics orchestration
// Delegates to subsystem modules for specific logic
// ═══════════════════════════════════════════

const SIM = {
    // ═══════════════════════════════════════
    // PLACEMENT VALIDATION
    // ═══════════════════════════════════════
    canPlace(world, type, row, col) {
        // Bounds check
        if (!world.isInBounds(row, col)) {
            return { allowed: false, reason: 'Out of bounds' };
        }

        // Occupied check
        if (world.isCellOccupied(row, col)) {
            return { allowed: false, reason: 'Cell occupied' };
        }

        // Cost check
        const cost = CONFIG.COSTS[type];
        if (world.money < cost) {
            return {
                allowed: false,
                reason: `Need $${cost}, have $${Math.floor(world.money)}`,
            };
        }

        // Adjacency rule (skip for very first placement)
        const allPlaced = world.getAllPlacedEntities();
        if (allPlaced.length > 0) {
            const adjacent = world.getAdjacentEntities(row, col);
            if (adjacent.length === 0) {
                return {
                    allowed: false,
                    reason: 'Must touch existing building or elevator',
                };
            }
        }

        return { allowed: true };
    },

    // ═══════════════════════════════════════
    // PLACEMENT EXECUTION
    // ═══════════════════════════════════════
    placeEntity(world, type, row, col) {
        const validation = this.canPlace(world, type, row, col);
        if (!validation.allowed) {
            world.addLog(`❌ ${validation.reason}`, CONFIG.COLORS.LOG_ERROR);
            return null;
        }

        const cost = CONFIG.COSTS[type];
        world.spendMoney(cost);

        let entity;

        if (type === 'elevator') {
            // Create elevator system
            const elevator = world.createElevator(col, [row]);
            entity = world.createEntity('elevator_cell', row, col, {
                elevatorId: elevator.id,
            });

            world.addLog(
                `↕ Elevator shaft started at column ${col}`,
                CONFIG.COLORS.ELEVATOR
            );

            // Auto-extend shaft
            ElevatorSystem.extendShaft(world, elevator);

        } else {
            entity = world.createEntity(type, row, col);

            // Auto-populate residents for residential
            if (type === 'residential') {
                const count = CONFIG.RESIDENTS.DEFAULT_PER_RESIDENTIAL;
                for (let i = 0; i < count; i++) {
                    world.createResident(entity.id, {
                        name: Resident.generatePlaceholderName(),
                    });
                }
            }

            world.addLog(
                `✅ ${type} placed at [${row},${col}]`,
                Floor.getColor(type)
            );
        }

        return entity;
    },

    // ═══════════════════════════════════════
    // DEMOLITION
    // ═══════════════════════════════════════
    demolish(world, row, col) {
        const entity = world.removeEntity(row, col);
        if (entity) {
            world.addLog(
                `💣 Demolished ${entity.type} at [${row},${col}]`,
                CONFIG.COLORS.LOG_WARNING
            );
        }
        return entity;
    },

    // ═══════════════════════════════════════
    // MAIN SIMULATION TICK
    // ═══════════════════════════════════════
    tick(world, deltaSeconds) {
        world.tickAccumulator += deltaSeconds;

        // Update elevator movement every frame
        ElevatorSystem.updateAll(world, deltaSeconds);

        // Income pulse
        if (world.tickAccumulator >= CONFIG.ECONOMY.TICK_INTERVAL) {
            world.tickAccumulator -= CONFIG.ECONOMY.TICK_INTERVAL;

            // Calculate and distribute income
            const income = Economy.calculateIncome(world);
            if (income > 0) {
                world.addMoney(income);
                world.addLog(
                    `💰 +$${income} income (${world.getAllPlacedEntities().length} rooms)`,
                    CONFIG.COLORS.GOLD
                );
            }

            // Update happiness
            Happiness.updateAll(world);

            // Update resident moods
            Happiness.updateResidentMoods(world);
        }
    },
};
window.SIM = SIM;
