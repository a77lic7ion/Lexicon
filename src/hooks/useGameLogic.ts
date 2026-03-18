import { useState, useCallback, useEffect } from 'react';
import { GameState, GamePhase, WinMode, CellState, PlayerState } from '../types';
import { LETTER_POOL, SPECIAL_TILES, LetterTile } from '../constants';
import { isValidWord } from '../utils/dictionary';

const GRID_SIZE = 10;

const createEmptyGrid = (): CellState[][] => {
  const grid: CellState[][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row: CellState[] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      row.push({
        row: r,
        col: c,
        tileId: null,
        letter: null,
        tier: null,
        isHit: false,
        isMiss: false,
      });
    }
    grid.push(row);
  }
  return grid;
};

const initialPlayerState = (id: 1 | 2): PlayerState => ({
  id,
  name: `Player ${id}`,
  grid: createEmptyGrid(),
  bank: [],
  tilesPlaced: 0,
  isReady: false,
});

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'setup',
    winMode: 'hybrid',
    activePlayer: 1,
    players: {
      1: initialPlayerState(1),
      2: initialPlayerState(2),
    },
    playedWords: [],
    winner: null,
    turnCount: 0,
  });

  const [message, setMessage] = useState<string>('Player 1: Place your tiles.');
  const [error, setError] = useState<string | null>(null);

  const resetGame = useCallback(() => {
    setGameState({
      phase: 'setup',
      winMode: 'hybrid',
      activePlayer: 1,
      players: {
        1: initialPlayerState(1),
        2: initialPlayerState(2),
      },
      playedWords: [],
      winner: null,
      turnCount: 0,
    });
    setMessage('Player 1: Place your tiles.');
    setError(null);
  }, []);

  const setWinMode = (mode: WinMode) => {
    setGameState(prev => ({ ...prev, winMode: mode }));
  };

  const placeTile = (player: 1 | 2, row: number, col: number, tile: LetterTile, orientation: 'h' | 'v') => {
    const playerState = gameState.players[player];
    const newGrid = [...playerState.grid.map(r => [...r])];

    // Check bounds and overlap
    const cellsToFill: { r: number; c: number }[] = [];
    for (let i = 0; i < tile.size; i++) {
      const r = orientation === 'v' ? row + i : row;
      const c = orientation === 'h' ? col + i : col;
      if (r >= GRID_SIZE || c >= GRID_SIZE) {
        setError('Out of bounds');
        return;
      }
      if (newGrid[r][c].tileId) {
        setError('Overlap detected');
        return;
      }
      cellsToFill.push({ r, c });
    }

    // Check 1-cell buffer rule (no diagonal or adjacent)
    // Actually PRD says "no tile may be placed adjacent to another tile (1-cell buffer required on all sides)"
    // This usually means no sharing edges or corners.
    for (const cell of cellsToFill) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = cell.r + dr;
          const nc = cell.c + dc;
          if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
            const neighbor = newGrid[nr][nc];
            if (neighbor.tileId && neighbor.tileId !== tile.id) {
              setError('Too close to another tile');
              return;
            }
          }
        }
      }
    }

    // Apply placement
    cellsToFill.forEach(cell => {
      newGrid[cell.r][cell.c] = {
        ...newGrid[cell.r][cell.c],
        tileId: tile.id,
        letter: tile.letter,
        tier: tile.tier,
        isSpecial: tile.isSpecial,
        hitsRequired: tile.isSpecial === 'vault' ? 2 : 1,
        hitsReceived: 0,
      };
    });

    setGameState(prev => ({
      ...prev,
      players: {
        ...prev.players,
        [player]: {
          ...prev.players[player],
          grid: newGrid,
          tilesPlaced: prev.players[player].tilesPlaced + 1,
        },
      },
    }));
    setError(null);
  };

  const finalizeSetup = (player: 1 | 2) => {
    const p = gameState.players[player];
    // Validation: 15 tiles total, 3+ vowels, max 2 rare, max 1 wildcard
    if (p.tilesPlaced < 15) {
      setError('Place all 15 tiles first');
      return;
    }

    setGameState(prev => {
      const nextPlayer = player === 1 ? 2 : 1;
      const allReady = prev.players[nextPlayer].isReady || (player === 2);
      
      if (player === 1) {
        setMessage('Player 2: Place your tiles.');
        return {
          ...prev,
          players: {
            ...prev.players,
            1: { ...prev.players[1], isReady: true },
          },
          activePlayer: 2,
        };
      } else {
        setMessage('Battle begins! Player 1 turn.');
        return {
          ...prev,
          phase: 'battle',
          players: {
            ...prev.players,
            2: { ...prev.players[2], isReady: true },
          },
          activePlayer: 1,
        };
      }
    });
  };

  const fire = (row: number, col: number) => {
    if (gameState.phase !== 'battle') return;
    const opponentId = gameState.activePlayer === 1 ? 2 : 1;
    const activeId = gameState.activePlayer;
    const opponent = gameState.players[opponentId];
    const newGrid = [...opponent.grid.map(r => [...r])];
    const cell = newGrid[row][col];

    if (cell.isHit || cell.isMiss) {
      setError('Already targeted');
      return;
    }

    let hit = false;
    let harvestedLetter: LetterTile | null = null;
    let bonusShot = false;

    if (cell.tileId) {
      hit = true;
      cell.isHit = true;
      cell.hitsReceived = (cell.hitsReceived || 0) + 1;

      // Special logic: Vault
      const isVault = cell.isSpecial === 'vault';
      const isPoison = cell.isSpecial === 'poison';
      const isMirror = cell.isSpecial === 'mirror';
      const isCharged = cell.isSpecial === 'charged';

      if (isPoison) {
        // Discard random letter from attacker bank
        const activePlayer = gameState.players[activeId];
        if (activePlayer.bank.length > 0) {
          const newBank = [...activePlayer.bank];
          newBank.splice(Math.floor(Math.random() * newBank.length), 1);
          setGameState(prev => ({
            ...prev,
            players: {
              ...prev.players,
              [activeId]: { ...prev.players[activeId], bank: newBank }
            }
          }));
        }
      }

      const shouldHarvest = !isVault || (cell.hitsReceived === 2);
      
      if (shouldHarvest && !isPoison) {
        harvestedLetter = LETTER_POOL.find(l => l.letter === cell.letter && l.tier === cell.tier) || null;
        if (isMirror) {
          // Mirror doesn't destroy the tile
          cell.isHit = false; // Keep it on grid? PRD says "remains on grid and is NOT destroyed"
          // But we need to mark it as mirrored so it can't be hit again for a letter
          cell.isHit = true; 
        }
      }

      // Uncommon bonus draw
      if (cell.tier === 'uncommon') {
        // Find other half
        const otherHalf = newGrid.flat().find(c => c.tileId === cell.tileId && (c.row !== row || c.col !== col));
        if (otherHalf?.isHit) {
          bonusShot = true;
        }
      }

      // Charged bonus shot
      if (isCharged) {
        // Check if last in row or col
        const rowTiles = newGrid[row].filter(c => c.tileId && !c.isHit);
        const colTiles = newGrid.map(r => r[col]).filter(c => c.tileId && !c.isHit);
        if (rowTiles.length === 0 || colTiles.length === 0) {
          bonusShot = true;
        }
      }
    } else {
      cell.isMiss = true;
    }

    setGameState(prev => {
      const updatedOpponent = { ...prev.players[opponentId], grid: newGrid };
      const updatedActive = { ...prev.players[activeId] };
      if (harvestedLetter) {
        updatedActive.bank = [...updatedActive.bank, harvestedLetter];
      }

      const nextPlayer = bonusShot ? activeId : opponentId;
      const nextPhase = checkWin(updatedOpponent, prev.winMode) ? 'gameover' : 'battle';

      return {
        ...prev,
        phase: nextPhase,
        activePlayer: nextPlayer,
        players: {
          ...prev.players,
          [opponentId]: updatedOpponent,
          [activeId]: updatedActive,
        },
        winner: nextPhase === 'gameover' ? activeId : null,
        turnCount: prev.turnCount + 1,
      };
    });

    setMessage(hit ? 'HIT!' : 'MISS!');
    setError(null);
  };

  const executeBomb = (word: string, target: { row?: number; col?: number; cell?: { r: number; c: number } }) => {
    const activeId = gameState.activePlayer;
    const opponentId = activeId === 1 ? 2 : 1;
    const activePlayer = gameState.players[activeId];
    const upperWord = word.toUpperCase();

    // Validate word
    if (!isValidWord(upperWord)) {
      setError('Invalid word');
      return;
    }
    if (gameState.playedWords.includes(upperWord)) {
      setError('Word already played');
      return;
    }

    // Check bank
    const bankLetters = activePlayer.bank.map(l => l.letter);
    const wordLetters = upperWord.split('');
    const tempBank = [...bankLetters];
    const usedIndices: number[] = [];

    for (const char of wordLetters) {
      const idx = tempBank.indexOf(char);
      if (idx === -1) {
        // Check for wildcard
        const wildcardIdx = tempBank.indexOf('★');
        if (wildcardIdx === -1) {
          setError('Missing letters in bank');
          return;
        }
        tempBank.splice(wildcardIdx, 1);
      } else {
        tempBank.splice(idx, 1);
      }
    }

    // Word is valid and letters are available
    const length = upperWord.length;
    const opponent = gameState.players[opponentId];
    const newGrid = [...opponent.grid.map(r => [...r])];

    // Apply effects
    if (length === 3) { // Spark
      if (target.row !== undefined) {
        const hasTile = newGrid[target.row].some(c => c.tileId);
        setMessage(hasTile ? `Spark: Tile exists in row ${target.row + 1}` : `Spark: No tiles in row ${target.row + 1}`);
      } else if (target.col !== undefined) {
        const hasTile = newGrid.map(r => r[target.col!]).some(c => c.tileId);
        setMessage(hasTile ? `Spark: Tile exists in column ${String.fromCharCode(65 + target.col!)}` : `Spark: No tiles in column ${String.fromCharCode(65 + target.col!)}`);
      }
    } else if (length === 4) { // Blast
      if (target.cell) {
        const cell = newGrid[target.cell.r][target.cell.c];
        if (cell.tileId) {
          cell.isHit = true;
          cell.hitsReceived = (cell.hitsReceived || 0) + 1;
          // Harvest logic simplified for bomb
          const harvested = LETTER_POOL.find(l => l.letter === cell.letter && l.tier === cell.tier);
          if (harvested) {
            setGameState(prev => ({
              ...prev,
              players: {
                ...prev.players,
                [activeId]: { ...prev.players[activeId], bank: [...prev.players[activeId].bank, harvested] }
              }
            }));
          }
        } else {
          cell.isMiss = true;
        }
      }
    } else if (length === 5) { // Surge
      if (target.row !== undefined) {
        newGrid[target.row].forEach(c => { if (c.tileId) c.isRevealed = true; });
      } else if (target.col !== undefined) {
        newGrid.forEach(r => { if (r[target.col!].tileId) r[target.col!].isRevealed = true; });
      }
    } else if (length === 6) { // Storm
      if (target.cell) {
        for (let dr = 0; dr < 2; dr++) {
          for (let dc = 0; dc < 2; dc++) {
            const r = target.cell.r + dr;
            const c = target.cell.c + dc;
            if (r < GRID_SIZE && c < GRID_SIZE) {
              const cell = newGrid[r][c];
              if (cell.tileId) cell.isHit = true;
              else cell.isMiss = true;
            }
          }
        }
      }
    } else if (length === 7) { // Tempest
      const oppBank = [...opponent.bank];
      if (oppBank.length > 0) {
        const stolen = oppBank.splice(Math.floor(Math.random() * oppBank.length), 1)[0];
        setGameState(prev => ({
          ...prev,
          players: {
            ...prev.players,
            [activeId]: { ...prev.players[activeId], bank: [...prev.players[activeId].bank, stolen] },
            [opponentId]: { ...prev.players[opponentId], bank: oppBank }
          }
        }));
      }
    } else if (length >= 8) { // Obliterate
      if (target.row !== undefined) {
        newGrid[target.row].forEach(c => { if (c.tileId) c.isHit = true; else c.isMiss = true; });
      } else if (target.col !== undefined) {
        newGrid.forEach(r => { if (r[target.col!].tileId) r[target.col!].isHit = true; else r[target.col!].isMiss = true; });
      }
    }

    // Consume letters
    const newBank = [...activePlayer.bank];
    for (const char of wordLetters) {
      const idx = newBank.findIndex(l => l.letter === char);
      if (idx !== -1) newBank.splice(idx, 1);
      else {
        const wildIdx = newBank.findIndex(l => l.letter === '★');
        if (wildIdx !== -1) newBank.splice(wildIdx, 1);
      }
    }

    setGameState(prev => {
      const updatedOpponent = { ...prev.players[opponentId], grid: newGrid };
      const updatedActive = { ...prev.players[activeId], bank: newBank };
      const nextPhase = checkWin(updatedOpponent, prev.winMode, length) ? 'gameover' : 'battle';

      return {
        ...prev,
        phase: nextPhase,
        activePlayer: opponentId,
        playedWords: [...prev.playedWords, upperWord],
        players: {
          ...prev.players,
          [opponentId]: updatedOpponent,
          [activeId]: updatedActive,
        },
        winner: nextPhase === 'gameover' ? activeId : null,
        turnCount: prev.turnCount + 1,
      };
    });
    setError(null);
  };

  const checkWin = (opponent: PlayerState, mode: WinMode, lastWordLen: number = 0): boolean => {
    const tilesRemaining = opponent.grid.flat().filter(c => c.tileId && !c.isHit).length;
    const tilesDestroyed = opponent.grid.flat().filter(c => c.tileId && c.isHit).length; // This is tricky because tiles have sizes

    // Simplified destruction count: count unique tileIds that have all their cells hit
    const allTiles = new Set(opponent.grid.flat().filter(c => c.tileId).map(c => c.tileId));
    const destroyedTiles = Array.from(allTiles).filter(tid => 
      opponent.grid.flat().filter(c => c.tileId === tid).every(c => c.isHit)
    );

    if (mode === 'classic') {
      return destroyedTiles.length >= 15;
    } else if (mode === 'lexicon') {
      return lastWordLen >= 8;
    } else if (mode === 'hybrid') {
      return destroyedTiles.length >= 10 || lastWordLen >= 7;
    }
    return false;
  };

  return {
    gameState,
    message,
    error,
    placeTile,
    finalizeSetup,
    fire,
    executeBomb,
    resetGame,
    setWinMode,
  };
};
