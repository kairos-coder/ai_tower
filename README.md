Here's an updated README that reflects the architectural transformation from a single-file prototype to a modular simulation engine.

```markdown
# 🏗️ Tower Forge

> A manual tower-building simulation game with AI-assisted content generation.
> Built one absurdly small step at a time.

**Current version: v0.3 — Entity Architecture**

---

## 🎯 Project Vision

Tower Forge is a simulation game where you manually design, build, and manage a tower — placing every room, elevator shaft, and utility closet yourself. The long-term vision layers AI-generated content (resident bios, events, company names, quests) on top of deterministic simulation systems.

**Core philosophy:** Separate deterministic systems from AI flavor systems. The simulation must run perfectly without AI. AI adds personality, not physics.

---

## 🧱 Current State (v0.3)

### What's implemented
- **16×24 buildable grid** — build above ground (sky) or below (basement)
- **Manual placement** — click each cell; nothing auto-populates
- **3 room types:**
  - 🏠 **Residential** — $15 base income, spawns 3 residents each
  - 🏪 **Commercial** — $25 base income
  - ⚡ **Utility** — +15% global income bonus per room
- **Elevator shafts** — place manually; auto-extend to ground and adjacent buildings
- **Adjacency requirement** — rooms must touch an existing building or elevator
- **Resident system** — each residential floor spawns named residents with moods
- **Happiness simulation** — emergent behavior from:
  - Adjacent elevators (+happiness)
  - Adjacent utilities (+happiness)
  - Fully surrounded rooms (-happiness, claustrophobia)
  - Natural drift toward neutral
- **Income scaling** — modified by happiness, occupancy, and utility bonuses
- **Demolish** — free removal with resident eviction
- **Keyboard shortcuts** — keys 1-4 for tools, 0 for demolish
- **Happiness visualization** — colored dots on rooms (green/yellow/red)
- **Modular architecture** — 14 files across 5 directories

### Architecture (v0.3)

```

ai-tower/
├── index.html              ← Entry point, loads scripts in dependency order
│
├── src/
│   ├── config.js           ← All constants, balance knobs, magic numbers
│   ├── world.js            ← Pure state, entity registry, queries, mutations
│   ├── sim.js              ← Rules engine, placement validation, tick orchestrator
│   ├── render.js           ← Canvas drawing only (reads WORLD, never modifies)
│   └── input.js            ← Mouse/keyboard handling
│
├── entities/
│   ├── Floor.js            ← Floor entity factory + type helpers
│   ├── Elevator.js         ← Elevator entity factory + range queries
│   └── Resident.js         ← Resident entity factory (AI content hook)
│
├── systems/
│   ├── economy.js          ← Income calculation, utility bonuses
│   ├── elevatorSystem.js   ← Elevator movement, shaft extension
│   └── happiness.js        ← Happiness simulation, resident mood updates
│
├── ui/
│   ├── hud.js              ← Stat cards, tool buttons
│   └── log.js              ← Event log display
│
└── main.js                 ← Bootstrap, game loop, module wiring

```

### Design Principles
- **Deterministic core** — simulation runs identically without AI
- **Entity layer** — every placed item has a unique ID and typed properties
- **Separation of concerns** — state (world.js), rules (sim.js + systems/), rendering (render.js), input (input.js), UI (ui/)
- **AI-ready hooks** — Resident entities have `name`, `title`, `bio`, `mood` fields waiting for AI content generation
- **Zero dependencies** — vanilla JS, HTML5 Canvas, no build step, no npm

### What's deliberately NOT implemented yet
- Auth / accounts / multiplayer
- AI-generated anything (names are placeholder-generated)
- Save/load persistence (serialization methods exist, not wired to UI)
- Elevator queue/wait time mechanics
- Day/night cycle
- Floor upgrades
- Events or quests
- Sound or animations
- 3D or pixel art

---

## 🚀 Running It

```bash
# Clone the repo
git clone https://github.com/your-username/tower-forge.git
cd tower-forge

# Serve with any static file server
# Option 1: Python
python3 -m http.server 8000

# Option 2: Node
npx serve .

# Option 3: VS Code Live Server extension

# Open in browser
open http://localhost:8000
```

Important: Must be served from a local server, not opened as file://. The multi-file architecture requires proper HTTP loading.

---

🎮 How to Play

Action How
Select tool Click button or press keys 1-4, 0
Place room Click empty grid cell adjacent to existing building
Place elevator Click empty cell (auto-extends to ground)
Demolish Select demolish tool (0), click occupied cell
Read room status Happiness dot: 🟢 happy, 🟡 neutral, 🔴 unhappy

Tips:

· Elevators make adjacent rooms happier
· Utilities boost income globally
· Don't box rooms in completely — they get claustrophobic
· Commercial rooms generate more income but cost more to build
· Build basements for cheap expansion space

---

🗺️ Roadmap

✅ v0.1 — Core Loop (Complete)

· Empty tower shaft
· Click to build
· Money generation over time
· Elevator movement
· Single HTML file

✅ v0.2 — Manual Grid (Complete)

· 16×24 grid with ground level
· Manual elevator placement
· Room types (residential, commercial, utility)
· Adjacency requirement
· Demolish

✅ v0.3 — Entity Architecture (Current)

· Modular file structure (14 files)
· Entity layer with unique IDs
· Resident system with moods
· Happiness simulation (emergent behavior)
· Economy system with multipliers
· Keyboard shortcuts
· Serialization methods (for future save/load)

🔲 v0.4 — Persistence & Depth

· localStorage save/load with UI
· Elevator queue and wait time mechanics
· Floor upgrade system (level 2, 3, etc.)
· Day/night cycle affecting income
· Basic resident needs (comfort, social, entertainment)
· Resident movement between floors

🔲 v0.5 — AI Integration (Phase 1)

· AI-generated resident names and bios (via API)
· AI-generated business names and descriptions
· Cached AI content (generate once, store locally)
· Resident personality traits affecting behavior
· "Fake news" events that affect tower economy

🔲 v0.6 — Systems Deepening

· Power grid (utility rooms provide power; exceeding capacity causes outages)
· Zoning bonuses (adjacent same-type rooms get synergy)
· Random events (fires, VIP visits, elevator breakdowns)
· Resident complaints and requests
· Visitor NPCs (non-resident agents)

🔲 v1.0 — Content Ecosystem

· Devlog/livestream integration
· AI agent pipeline (Hermes, Demeter, Apollo, Athena, Kronos, Mnemo)
· Community-submitted room types
· Exportable tower stats for sharing
· Tower-wide stats and achievements

---

🧠 Architecture Notes

Separation of Concerns

```
┌─────────────────────────────────────┐
│         DETERMINISTIC CORE          │
│                                     │
│  config.js  →  constants            │
│  world.js   →  pure state           │
│  sim.js     →  rules engine         │
│  systems/   →  economy, elevators,  │
│                happiness            │
│                                     │
│  → Must run perfectly without AI    │
└─────────────────────────────────────┘
              ▲
              │ feeds data to
              ▼
┌─────────────────────────────────────┐
│         AI FLAVOR LAYER             │
│                                     │
│  Resident.name, .title, .bio        │
│  Commercial.businessName            │
│  Event descriptions                 │
│  Quest text                         │
│                                     │
│  → Fails gracefully; never breaks   │
│    the simulation                   │
└─────────────────────────────────────┘
```

Entity Layer

Every placed item in the game is an entity with:

· Unique ID (entity_1, entity_2, etc.)
· Type (residential, commercial, utility, elevator_cell)
· Position (row, col)
· Type-specific properties (happiness, occupants, income, etc.)

This enables:

· Querying by type: world.getAllEntitiesOfType('residential')
· Spatial queries: world.getAdjacentEntities(row, col)
· Individual updates: happiness per entity
· Future agent pathfinding
· AI content injection without breaking state

Load Order

index.html loads scripts in strict dependency order (8 layers):

Layer Files Depends On
0 config.js Nothing
1 entities/*.js Config
2 world.js Config, Entities
3 systems/*.js Config, World, Entities
4 sim.js All systems
5 render.js Config, World
6 input.js Config
7 ui/*.js World, Input, Economy
8 main.js Everything

AI Agent Roles (Future)

Agent Domain System Mapping
Hermes Movement & routing elevatorSystem.js — pathfinding, queue optimization
Demeter Growth & residents happiness.js, economy.js — population dynamics
Apollo Analytics & balance config.js — predictive tuning, anomaly detection
Athena Architecture Code review, refactoring suggestions
Kronos Time & cycles Day/night, seasonal events, tick management
Mnemo Memory & persistence Save/load, event history, state snapshots

Happiness System (First Emergent Behavior)

The happiness simulation is the first "agent-like" system:

```
happiness_delta = drift_to_neutral
                + elevator_adjacency_bonus
                + utility_adjacency_bonus
                - crowding_penalty
```

This creates emergent gameplay:

· Corner rooms near elevators become premium real estate
· Sandwiching residential between utility and elevator maximizes happiness
· Players discover optimal layouts through experimentation
· Unhappy residents affect income (happiness × base income)

---

🎬 Content Strategy

This project is designed to be developed publicly. Devlog topics that perform well:

· "AI coded elevators today and created a bottleneck"
· "The tower economy collapsed because of utility placement"
· "My AI accidentally generated a resident cult"
· "Fixing pathfinding live — the elevator broke everything"
· "Residents are complaining about claustrophobia — the happiness system works"

---

🤝 Contributing

Version 0.3 is the first version with a proper architecture. The best ways to contribute:

1. Play it — find what's satisfying and what's frustrating
2. Read the code — the modular structure is designed to be approachable
3. Suggest balance changes — all numbers are in config.js
4. Propose new room types — what would make interesting gameplay?
5. Open issues — bugs, ideas, balance feedback

Code contributions are welcome. Start with systems/ or entities/ — they're the most self-contained modules.

---

🔧 Development

Adding a new room type

1. Add costs/income to src/config.js
2. Add type defaults in entities/Floor.js
3. Add color/icon in entities/Floor.js
4. Add tool button in index.html
5. Add keyboard shortcut in src/input.js

Adding a new system

1. Create file in systems/
2. Add <script> tag in index.html (Layer 3)
3. Call from src/sim.js in the tick() method

Tuning balance

All game balance numbers are in src/config.js:

· ECONOMY.STARTING_MONEY
· ECONOMY.TICK_INTERVAL
· COSTS.*
· BASE_INCOME.*
· UTILITY_BONUS
· HAPPINESS.*

---

📜 License

MIT — do whatever you want. Build your own tower.

---

🔗 Related

· Inspired by: SimTower, Project Highrise, Dwarf Fortress
· Built with: Vanilla JS, HTML5 Canvas, zero dependencies
· Philosophy: "Start absurdly small"

---

"You do NOT need to be an expert programmer anymore to do this. You need to become: creative director, systems curator, debugger, pipeline orchestrator."

```

---

This README now documents:

1. **The architecture transformation** — why 14 files beat 1 file
2. **The load order** — critical for anyone contributing
3. **The entity layer** — why it matters for future AI integration
4. **The happiness system** — first emergent behavior, explained
5. **How to contribute** — specific entry points for each module
6. **Development guide** — how to add rooms, systems, and tune balance
7. **The AI agent mapping** — which systems map to which mythical agents

Want me to add a troubleshooting section, or flesh out any particular part?
