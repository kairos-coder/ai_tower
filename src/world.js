// ═══════════════════════════════════════════
// world.js — Pure state, no logic, no rendering
// ═══════════════════════════════════════════

const WORLD = {
    // Grid dimensions
    cols: 16,
    rows: 24,
    groundRow: 18, // row index of ground level
    
    // Core state
    money: 200,
    
    // Entity registry — THE critical architectural decision
    // Every placed thing is an entity with a unique ID
    entities: {},
    nextEntityId: 1,
    
    // Spatial index — maps grid positions to entity IDs
    // null = empty cell
    grid: [], // 2D array [row][col] of entityId | null
    
    // Elevator registry — separate from grid for system-level operations
    elevators: {},
    nextElevatorId: 1,
    
    // Simulation state
    tickAccumulator: 0,
    tickInterval: 10.0, // seconds between income pulses
    
    // Event log (could become Mnemo's domain later)
    log: [],
    maxLogEntries: 30,

    // Initialize grid
    init() {
        this.grid = Array.from({ length: this.rows }, () => 
            Array(this.cols).fill(null)
        );
    },

    // ── Entity Factory ──────────────────────
    createEntity(type, row, col, overrides = {}) {
        const id = `entity_${this.nextEntityId++}`;
        const base = {
            id,
            type, // 'residential' | 'commercial' | 'utility' | 'elevator_cell'
            row,
            col,
            placedAt: Date.now(),
        };

        // Type-specific defaults
        switch (type) {
            case 'residential':
                Object.assign(base, {
                    occupants: 3,
                    occupantCapacity: 3,
                    happiness: 0.7, // 0.0 - 1.0
                    income: 15,
                });
                break;
            case 'commercial':
                Object.assign(base, {
                    businessName: null, // filled by AI later
                    customers: 5,
                    income: 25,
                    happiness: 0.7,
                });
                break;
            case 'utility':
                Object.assign(base, {
                    powerOutput: 10,
                    coverageRadius: 3,
                    income: 0,
                    happiness: 0.7,
                });
                break;
            case 'elevator_cell':
                Object.assign(base, {
                    elevatorId: null, // linked to Elevator system
                });
                break;
        }

        Object.assign(base, overrides);
        this.entities[id] = base;
        
        // Place in spatial index
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            this.grid[row][col] = id;
        }

        return base;
    },

    // ── Elevator Factory ────────────────────
    createElevator(col, initialCells = []) {
        const id = `elevator_${this.nextElevatorId++}`;
        const elevator = {
            id,
            col,
            cells: new Set(initialCells), // Set of row indices
            queue: [], // future: passenger queue
            capacity: 6,
            speed: 0.8, // floors per second
            currentFloor: 0,
            direction: 1,
        };
        this.elevators[id] = elevator;
        return elevator;
    },

    // ── Queries ─────────────────────────────
    getEntityAt(row, col) {
        const id = this.grid[row]?.[col];
        return id ? this.entities[id] : null;
    },

    getEntityById(id) {
        return this.entities[id] || null;
    },

    getAllEntitiesOfType(type) {
        return Object.values(this.entities).filter(e => e.type === type);
    },

    getAllPlacedEntities() {
        return Object.values(this.entities);
    },

    getAdjacentEntities(row, col) {
        const neighbors = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of directions) {
            const r = row + dr;
            const c = col + dc;
            if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                const entity = this.getEntityAt(r, c);
                if (entity) neighbors.push(entity);
            }
        }
        return neighbors;
    },

    isCellOccupied(row, col) {
        return this.grid[row]?.[col] !== null;
    },

    isElevatorCell(row, col) {
        const entity = this.getEntityAt(row, col);
        return entity && entity.type === 'elevator_cell';
    },

    // ── Mutations ───────────────────────────
    removeEntity(row, col) {
        const id = this.grid[row][col];
        if (!id) return null;
        
        const entity = this.entities[id];
        
        // Handle elevator cell removal
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

    addLog(message, color = '#aaa') {
        this.log.unshift({ message, color, timestamp: Date.now() });
        if (this.log.length > this.maxLogEntries) {
            this.log.pop();
        }
    },
};
