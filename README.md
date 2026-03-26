# Lexicon: Tactical Word-Harvesting Battle

Lexicon is a high-stakes, strategic word-building battle game that blends the tactical positioning of *Battleship* with the linguistic depth of *Scrabble*. Players deploy "tactical units" (letter tiles) on a hidden grid, harvest letters from their opponent's board, and unleash devastating "Word Bombs" to dominate the battlefield.

---

## 🎮 Gameplay Overview

The game is divided into two distinct phases:

### 1. Deployment Phase (Setup)
Players must strategically position **15 tactical units** on a 10x10 grid.
*   **Buffer Rule**: Every unit must have at least a 1-cell empty buffer around it (no adjacent units, including diagonals).
*   **Tier Constraints**:
    *   **Common (1x1)**: Standard units. Minimum 3 vowels required.
    *   **Uncommon (1x2)**: Larger units that occupy two cells.
    *   **Rare (1x1)**: High-value units. Maximum 2 allowed.
    *   **Wildcard (★)**: Flexible unit. Maximum 1 allowed.
*   **Special Assets**: Unique units with defensive or offensive passive abilities (Vault, Poison, Mirror, Charged).

### 2. Battle Phase
Players take turns "striking" cells on a **Unified Grid**.
*   **Striking**: Click a cell to fire. A "HIT" reveals the letter and adds it to your **Tactical Bank**. A "MISS" ends your turn.
*   **Harvesting**: Successfully hitting a tile allows you to continue your turn (Chain Strikes).
*   **Word Bombs**: Instead of a standard strike, you can spend harvested letters from your bank to "Fire a Bomb".

---

## 💣 Word Bombs & Effects

The length of the word you create determines the magnitude of the tactical strike:

| Word Length | Effect Name | Description | Targeting |
| :--- | :--- | :--- | :--- |
| **3 Letters** | **Spark** | Reveals a full row or column. | Row/Col Selection |
| **4 Letters** | **Blast** | Destroys a single targeted cell (guaranteed hit if tile present). | Single Cell |
| **5 Letters** | **Surge** | Reveals a full row or column + damages tiles. | Row/Col Selection |
| **6 Letters** | **Storm** | Devastates a 2x2 area. | 2x2 Block |
| **7 Letters** | **Tempest** | Steals 3 random units from the opponent's bank. | Immediate |
| **8+ Letters** | **Cataclysm** | Obliterates an entire row or column. | Row/Col Selection |

---

## 🏗️ Technical Architecture & Design

### Application Stack
*   **Framework**: React 18 with Vite for ultra-fast development and builds.
*   **Styling**: Tailwind CSS for a utility-first, responsive "Blueprint" aesthetic.
*   **Animations**: Framer Motion (`motion/react`) for tactile UI feedback and smooth transitions.
*   **Icons**: Lucide-React for consistent, scalable tactical iconography.
*   **State Management**: A centralized React state orchestrates the complex turn-based logic, grid updates, and AI behavior.

### Design Evolution
1.  **Unified Grid System**: Transitioned from a traditional split-screen "Home/Tracking" view to a single **Unified Grid**. This reduces cognitive load by overlaying your own units and your strikes on the opponent in one cohesive visual space.
2.  **Visual Targeting**: Replaced coordinate-based text inputs (e.g., "A1") with a **Visual Block Selector**. Players now see a real-time preview of the bomb's area-of-effect before firing.
3.  **1080px Optimization**: The layout is strictly optimized for a 1080px width, ensuring a consistent "Mission Control" feel on desktop while remaining fully responsive for mobile devices.
4.  **Retro-Tech Aesthetic**: The UI uses a "Blueprint" grid background, monospace typography, and high-contrast neon accents to evoke a tactical, military-grade terminal.

---

## 🤖 AI Intelligence

The game features a built-in AI opponent with two difficulty tiers:
*   **Easy**: Fires randomly, providing a relaxed training environment.
*   **Hard**: Remembers previous hits, prioritizes finishing damaged units, and strategically saves letters for high-impact Word Bombs.

---

## 🛠️ Development Process (Application View)

Creating **Lexicon** involved several key engineering challenges:

1.  **Grid Logic**: Implementing a robust 2D array system that tracks multiple states per cell (Tile ID, Letter, Hit/Miss status, Revealed status, Special effects).
2.  **Placement Validation**: Developing a recursive-style check for the "1-cell buffer" rule and multi-cell tile (Uncommon) placement logic.
3.  **Dictionary Integration**: Seamlessly integrating a client-side dictionary check to validate Word Bombs in real-time without external API latency.
4.  **Responsive Scaling**: Engineering a grid system that maintains perfect label alignment (A-J, 1-10) across all screen sizes using CSS Grid synchronization.
5.  **Turn Synchronization**: Managing the complex hand-off between Player 1, Player 2 (or AI), including "Pass Device" states for local multiplayer.

---

## 🚀 Deployment

The project is optimized for Vercel/Cloud Run:
*   **Build Command**: `npm run build`
*   **Output**: Static `dist` folder.
*   **Environment**: Node.js environment with TypeScript type-stripping for the optional Express backend.
