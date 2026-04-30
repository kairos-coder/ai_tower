// ═══════════════════════════════════════════
// world.js — Pure state. No logic, no rendering.
// Single source of truth for all game data.
// ═══════════════════════════════════════════

const WORLD = {
    // ── Core State ──────────────────────────
    money: CONFIG.ECONOMY.STARTING_MONEY,
    tickAccumulator: 0,

    // ── Spatial Grid ────────────────────────
    // grid[row][col] = entityId (string) | null
    grid: [],

    // ── Entity Registry ─────────────────────
    // All placed items stored by unique ID
    entities: {},
    nextEntityId: 1,

    // ── Elevators ───────────────────────────
    elevators: {},
    nextElevatorId: 1,

    // ── Residents ───────────────────────────
    residents: {},
    nextResidentId: 1,

    // ── Event Log ───────────────────────────
    log: [],

    // ═══════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════
    init() {
        this.grid = Array.from(
            { length: CONFIG.GRID.ROWS },
            () => Array(CONFIG.GRID.COLS).fill(null)
        );
        this.money = CONFIG.ECONOMY.STARTING_MONEY;
        this.tickAccumulator = 0;
        this.entities = {};
        this.nextEntityId = 1;
        this.elevators = {};
        this.nextElevatorId = 1;
        this.residents = {};
        this.nextResidentId = 1;
        this.log = [];
    },

    // ═══════════════════════════════════════
    // ENTITY FACTORY
    // ═══════════════════════════════════════
    createEntity(type, row, col, overrides = {}) {
        const id = `entity_${this.nextEntityId++}`;
        const entity = Floor.create(type, id, row, col, overrides);
        this.entities[id] = entity;

        // Spatial index
        if (this.isInBounds(row, col)) {
            this.grid[row][col] = id;
        }

        return entity;
    },

    // ═══════════════════════════════════════
    // ELEVATOR FACTORY
    // ═══════════════════════════════════════
    createElevator(col, cells = []) {
        const elevator = Elevator.create(this.nextElevatorId++, col, cells);
        this.elevators[elevator.id] = elevator;
        return elevator;
    },

    // ═══════════════════════════════════════
    // RESIDENT FACTORY
    // ═══════════════════════════════════════
    createResident(floorEntityId, overrides = {}) {
        const resident = Resident.create(this.nextResidentId++, floorEntityId, overrides);
        this.residents[resident.id] = resident;

        // Update floor occupant count
        const floor = this.entities[floorEntityId];
        if (floor && floor.type === 'residential') {
            floor.occupants = (floor.occupants || 0) + 1;
        }

        return resident;
    },

    // ═══════════════════════════════════════
    // QUERIES
    // ═══════════════════════════════════════
    isInBounds(row, col) {
        return row >= 0 && row < CONFIG.GRID.ROWS &&
               col >= 0 && col < CONFIG.GRID.COLS;
    },

    getEntityAt(row, col) {
        if (!this.isInBounds(row, col)) return null;
        const id = this.grid[row][col];
        return id ? this.entities[id] : null;
    },

    getEntityById(id) {
        return this.entities[id] || null;
    },

    isCellOccupied(row, col) {
        return this.getEntityAt(row, col) !== null;
    },

    isElevatorCell(row, col) {
        const entity = this.getEntityAt(row, col);
        return entity && entity.type === 'elevator_cell';
    },

    getAdjacentEntities(row, col) {
        const neighbors = [];
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of dirs) {
            const entity = this.getEntityAt(row + dr, col + dc);
            if (entity) neighbors.push(entity);
        }
        return neighbors;
    },

    getAdjacentPositions(row, col) {
        const positions = [];
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of dirs) {
            const r = row + dr;
            const c = col + dc;
            if (this.isInBounds(r, c)) {
                positions.push({ row: r, col: c });
            }
        }
        return positions;
    },

    getAllEntitiesOfType(type) {
        return Object.values(this.entities).filter(e => e.type === type);
    },

    getAllPlacedEntities() {
        return Object.values(this.entities);
    },

    getResidentsOnFloor(floorEntityId) {
        return Object.values(this.residents).filter(
            r => r.floorEntityId === floorEntityId
        );
    },

    countEmptyNeighbors(row, col) {
        return this.getAdjacentPositions(row, col).filter(
            pos => !this.isCellOccupied(pos.row, pos.col)
        ).length;
    },

    // ═══════════════════════════════════════
    // MUTATIONS
    // ═══════════════════════════════════════
    removeEntity(row, col) {
        if (!this.isInBounds(row, col)) return null;

        const id = this.grid[row][col];
        if (!id) return null;

        const entity = this.entities[id];

        // Remove linked residents
        if (entity.type === 'residential') {
            const residents = this.getResidentsOnFloor(id);
            for (const resident of residents) {
                delete this.residents[resident.id];
            }
        }

        // Handle elevator cell
        if (entity.type === 'elevator_cell' && entity.elevatorId) {
            const elevator = this.elevators[entity.elevatorId];
            if (elevator) {
                elevator.cells.delete(row);
                if (elevator.cells.size === 0) {
                    delete this.elevators[entity.elevatorId];
                }
            }
        }

        delete this.entities[id];
        this.grid[row][col] = null;
        return entity;
    },

    addMoney(amount) {
        this.money += amount;
    },

    spendMoney(amount) {
        if (this.money >= amount) {
            this.money -= amount;
            return true;
        }
        return false;
    },

    addLog(message, color = CONFIG.COLORS.LOG_DEFAULT) {
        this.log.unshift({
            message,
            color,
            timestamp: Date.now(),
        });
        if (this.log.length > CONFIG.LOG.MAX_ENTRIES) {
            this.log.pop();
        }
    },

    // ═══════════════════════════════════════
    // SERIALIZATION (for future save/load)
    // ═══════════════════════════════════════
    toJSON() {
        return {
            money: this.money,
            tickAccumulator: this.tickAccumulator,
            grid: this.grid,
            entities: this.entities,
            elevators: Object.fromEntries(
                Object.entries(this.elevators).map(([k, v]) => [
                    k,
                    { ...v, cells: [...v.cells] },
                ])
            ),
            residents: this.residents,
            log: this.log,
        };
    },

    fromJSON(data) {
        this.money = data.money;
        this.tickAccumulator = data.tickAccumulator;
        this.grid = data.grid;
        this.entities = data.entities;
        this.residents = data.residents || {};
        this.log = data.log || [];

        // Reconstruct elevator Sets
        this.elevators = {};
        for (const [key, val] of Object.entries(data.elevators || {})) {
            this.elevators[key] = {
                ...val,
                cells: new Set(val.cells),
            };
        }

        // Recalculate next IDs
        this.nextEntityId = Math.max(1, ...Object.keys(this.entities)
            .map(k => parseInt(k.split('_')[1]) || 0)) + 1;
        this.nextElevatorId = Math.max(1, ...Object.keys(this.elevators)
            .map(k => parseInt(k.split('_')[1]) || 0)) + 1;
        this.nextResidentId = Math.max(1, ...Object.keys(this.residents)
            .map(k => parseInt(k.split('_')[1]) || 0)) + 1;
    },
};
