# Lexicon: Tactical Word-Harvesting Battle

Lexicon is a high-stakes, strategic word-building battle game that blends the tactical positioning of *Battleship* with the linguistic depth of *Scrabble*. Players deploy "tactical units" (letter tiles) on a hidden grid, harvest letters from their opponent's board, and unleash devastating "Word Bombs" to dominate the battlefield.

---

## 🎮 Gameplay Overview

The game is divided into two distinct phases:

### 1. Deployment Phase (Setup)

Players must strategically position **15 tactical units** on a 10x10 grid.

* **Buffer Rule**: Every unit must have at least a 1-cell empty buffer around it (no adjacent units, including diagonals).
* **Tier Constraints**:
  * **Common (1x1)**: Standard units. Minimum **5-6 vowels** required (guarantees ~40% lexical density).
  * **Uncommon (1x2)**: Larger units that occupy two cells.
  * **Rare (1x1)**: High-value units. Maximum 2 allowed.
  * **Wildcard (★)**: Flexible unit. Maximum 1 allowed.
* **Special Assets**: Unique units with defensive or offensive passive abilities (Vault, Poison, Mirror, Charged).

### 2. Battle Phase

Players take turns "striking" cells on a **Unified Grid**.

* **Striking**: Click a cell to fire. A "HIT" reveals the letter and adds it to your **Tactical Bank**. A "MISS" ends your turn.
* **Harvesting**: Successfully hitting a tile allows you to continue your turn (Chain Strikes).
* **Word Bombs**: Instead of a standard strike, you can spend harvested letters from your bank to "Fire a Bomb".

---

## 💣 Word Bombs & Effects

The length of the word you create determines the magnitude of the tactical strike:

| Word Length    | Effect Name   | Description                                           | Targeting         |
|:-------------- |:------------- |:----------------------------------------------------- |:----------------- |
| **3 Letters**  | **Spark**     | Scans a row/column for the presence of enemy tiles.   | Row/Col Selection |
| **4 Letters**  | **Blast**     | Precision strike on a single targeted cell.           | Single Cell       |
| **5 Letters**  | **Surge**     | Reveals all tile positions in a targeted row or column.| Row/Col Selection |
| **6 Letters**  | **Storm**     | Inflicts heavy damage in a 2x2 area.                  | 2x2 Block         |
| **7 Letters**  | **Tempest**   | Extracts a random letter from the opponent's bank.    | Immediate         |
| **8+ Letters** | **Obliterate**| Total destruction of an entire row or column.         | Row/Col Selection |

---

## 🏗️ Technical Architecture & Design

### Application Stack

* **Framework**: React 18 with Vite for ultra-fast development and builds.
* **Styling**: Tailwind CSS for a utility-first, responsive "Blueprint" aesthetic.
* **Animations**: Framer Motion (`motion/react`) for tactile UI feedback and smooth transitions.
* **Icons**: Lucide-React for consistent, scalable tactical iconography.
* **State Management**: A centralized React state orchestrates the complex turn-based logic, grid updates, and AI behavior.

### Design Evolution & Refinements

1. **Definitive 3-Column Command Center**: The interface is anchored by a structured 3-column grid:
    * **Left (Branding & Intel)**: High-fidelity mission logo and "Victory Protocol" win conditions.
    * **Middle (Tactical Area)**: The **Expanded Unified Grid** dominates the screen, scaling to maximum visibility.
    * **Right (Command & Control)**: Dual-player racks, Word Bomb assembly, and turn-status telemetry.
2. **Tactical Codex (Tutorial)**: A dedicated rulebook module provides interactive guidance on deployment, tiers, and Word Bomb mechanics.
3. **Advanced Scaling Logic**: Components dynamically adjust to viewport dimensions, with sophisticated vertical and horizontal scrolling management to ensure "Mission Integrity" across all devices.
4. **Robust Auto-Deployment**: A multi-attempt heuristic algorithm guarantees a valid, rule-compliant 15-tile layout. Integrated an **Emergency Fallback** that forces placement in any available cells if the randomized buffer rule fails after multiple global passes.
5. **Word Bomb Assembly Area**: Redesigned as a vertical sidebar component for better parity with the board and tactile word-building.

---

## 🤖 AI Intelligence

The game features a built-in AI opponent with two difficulty tiers:

* **Easy**: Fires randomly, providing a relaxed training environment.
* **Hard**: Remembers previous hits, prioritizes finishing damaged units, and strategically saves letters for high-impact Word Bombs.

---

## 🛠️ Development Process (Application View)

Creating **Lexicon** involved several key engineering challenges:

1. **Grid Logic & State Management**: Implementing a robust 2D array system that tracks multiple states per cell (Tile ID, Letter, Hit/Miss status, Revealed status, Special effects). The state is managed centrally to ensure synchronization between the grid, the letter banks, and the turn logic.
2. **Placement Validation**: Developing a recursive-style check for the "1-cell buffer" rule and multi-cell tile (Uncommon) placement logic. This ensures that the deployment phase adheres to strict tactical constraints.
3. **Dictionary Integration**: Seamlessly integrating a client-side dictionary check to validate Word Bombs in real-time. This involved optimizing the dictionary lookup to prevent UI lag during word entry.
4. **Responsive Scaling & Alignment**: Engineering a grid system that maintains perfect label alignment (A-J, 1-10) across all screen sizes. This was achieved using CSS Grid and synchronized dimensions for labels and cells.
5. **Turn Synchronization & Local Multiplayer**: Managing the complex hand-off between Player 1, Player 2 (or AI), including "Pass Device" states to prevent players from seeing each other's hidden grids in local multiplayer mode.
6. **Tactical UI/UX Design**: Iteratively refining the UI from a split-screen layout to a unified, board-centric design. This involved balancing information density (letter banks, word input, grid) with visual hierarchy to create an immersive "Tactical Command" experience.

---

## 🚀 Deployment

The project is optimized for Vercel/Cloud Run:

* **Build Command**: `npm run build`
* **Output**: Static `dist` folder.
* **Environment**: Node.js environment with TypeScript type-stripping for the optional Express backend.
