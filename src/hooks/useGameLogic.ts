import { useState, useCallback, useEffect } from 'react';
import { GameState, GamePhase, WinMode, CellState, PlayerState, HistoryEvent, Difficulty, Toast } from '../types';
import { LETTER_POOL, SPECIAL_TILES, LetterTile, SOUNDS, TOTAL_TILES } from '../constants';
import { COMMON_WORDS, isValidWord } from '../utils/dictionary';

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
  score: 0,
  bombsPlayed: 0,
  tilesDestroyed: 0,
  totalHits: 0,
  isAI: false,
  difficulty: 'medium',
  placementHistory: [],
});

export const useGameLogic = () => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [gameState, setGameState] = useState<GameState>({
    phase: 'setup',
    winMode: 'hybrid',
    activePlayer: 1,
    players: {
      1: initialPlayerState(1),
      2: initialPlayerState(2),
    },
    playedWords: [],
    history: [],
    winner: null,
    turnCount: 0,
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, type, message, duration: 2000 }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2000);
  }, []);

  const playSound = useCallback((url: string) => {
    if (!isSoundEnabled) return;
    const audio = new Audio(url);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  }, [isSoundEnabled]);

  const toggleSound = () => setIsSoundEnabled(prev => !prev);

  const [message, setMessage] = useState<string>('Place your tiles.');
  const [error, setError] = useState<string | null>(null);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      phase: 'setup',
      winMode: 'hybrid',
      activePlayer: 1,
      players: {
        1: { ...initialPlayerState(1), name: prev.players[1].name },
        2: { ...initialPlayerState(2), name: prev.players[2].name, isAI: prev.players[2].isAI },
      },
      playedWords: [],
      history: [],
      winner: null,
      turnCount: 0,
      lastAction: undefined,
    }));
    setMessage('Place your tiles.');
    setError(null);
  }, []);

  const setWinMode = (mode: WinMode) => {
    setGameState(prev => ({ ...prev, winMode: mode }));
  };

  const updatePlayerName = (id: 1 | 2, name: string) => {
    setGameState(prev => ({
      ...prev,
      players: {
        ...prev.players,
        [id]: { ...prev.players[id], name }
      }
    }));
  };

  const toggleAI = (id: 1 | 2) => {
    setGameState(prev => ({
      ...prev,
      players: {
        ...prev.players,
        [id]: { ...prev.players[id], isAI: !prev.players[id].isAI, difficulty: 'medium' }
      }
    }));
  };

  const setDifficulty = (id: 1 | 2, difficulty: Difficulty) => {
    setGameState(prev => ({
      ...prev,
      players: {
        ...prev.players,
        [id]: { ...prev.players[id], difficulty }
      }
    }));
  };

  const undoPlacement = (player: 1 | 2) => {
    setError(null);
    setGameState(prev => {
      const p = prev.players[player];
      if (!p.placementHistory || p.placementHistory.length === 0) return prev;

      const last = p.placementHistory[p.placementHistory.length - 1];
      const newGrid = [...p.grid.map(r => [...r])];

      for (let i = 0; i < last.size; i++) {
        const r = last.orientation === 'v' ? last.row + i : last.row;
        const c = last.orientation === 'h' ? last.col + i : last.col;
        newGrid[r][c] = {
          row: r,
          col: c,
          tileId: null,
          letter: null,
          tier: null,
          isHit: false,
          isMiss: false,
        };
      }

      return {
        ...prev,
        players: {
          ...prev.players,
          [player]: {
            ...p,
            grid: newGrid,
            tilesPlaced: p.tilesPlaced - 1,
            placementHistory: p.placementHistory.slice(0, -1),
          }
        }
      };
    });
  };

  const removeTileAt = (player: 1 | 2, row: number, col: number) => {
    setError(null);
    setGameState(prev => {
      const p = prev.players[player];
      const cell = p.grid[row][col];
      if (!cell.tileId) return prev;

      const targetId = cell.tileId;
      const newGrid = p.grid.map(r => r.map(c => ({ ...c })));

      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (newGrid[r][c].tileId === targetId) {
            newGrid[r][c] = {
              row: r, col: c,
              tileId: null, letter: null, tier: null,
              isHit: false, isMiss: false
            };
          }
        }
      }

      const newHistory = (p.placementHistory || []).filter(h => h.tileId !== targetId);

      return {
        ...prev,
        players: {
          ...prev.players,
          [player]: {
            ...p,
            grid: newGrid,
            tilesPlaced: Math.max(0, p.tilesPlaced - 1),
            placementHistory: newHistory,
          }
        }
      };
    });
  };

  const autoPlace = (player: 1 | 2) => {
    let currentGrid = createEmptyGrid();
    let placedCount = 0;
    let history: { row: number; col: number; tileId: string; size: number; orientation: 'h' | 'v' }[] = [];
    
    const shuffle = <T>(array: T[]): T[] => {
      const newArr = [...array];
      for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
      }
      return newArr;
    };

    const pool = shuffle([...LETTER_POOL]);
    const specials = shuffle([...SPECIAL_TILES]);
    
    const toPlace: LetterTile[] = [];
    
    // Pick 8 Common tiles
    const commonPool = pool.filter(t => t.tier === 'common');
    const vowels = shuffle(commonPool.filter(t => ['A', 'E', 'I', 'O', 'U'].includes(t.letter))).slice(0, 8);
    toPlace.push(...vowels);
    
    // Pick Rare (Max 2)
    const rarePool = pool.filter(t => t.tier === 'rare');
    toPlace.push(...rarePool.slice(0, 2));
    
    // Pick Wildcard (Max 1)
    const wildcard = pool.find(t => t.tier === 'wildcard');
    if (wildcard) toPlace.push(wildcard);
    
    // Pick 6 Uncommon
    const uncommonPool = pool.filter(t => t.tier === 'uncommon');
    toPlace.push(...uncommonPool.slice(0, 6));
    
    // Pick Specials
    toPlace.push(...specials);
    
    // Fill remaining to TOTAL_TILES
    const remainingPool = shuffle(pool.filter(t => !toPlace.find(p => p.id === t.id)));
    if (toPlace.length > TOTAL_TILES) {
      toPlace.splice(TOTAL_TILES);
    } else {
      const needed = TOTAL_TILES - toPlace.length;
      if (needed > 0) {
        toPlace.push(...remainingPool.slice(0, needed));
      }
    }

    let globalAttempts = 0;
    while (placedCount < TOTAL_TILES && globalAttempts < 40) {
      globalAttempts++;
      currentGrid = createEmptyGrid();
      placedCount = 0;
      history = [];

      const shuffledToPlace = shuffle(toPlace);

      for (const tile of shuffledToPlace) {
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 50) {
          attempts++;
          const r = Math.floor(Math.random() * GRID_SIZE);
          const c = Math.floor(Math.random() * GRID_SIZE);
          const orientation = Math.random() > 0.5 ? 'h' : 'v';

          const cells: { r: number; c: number }[] = [];
          let valid = true;
          for (let i = 0; i < tile.size; i++) {
            const nr = orientation === 'v' ? r + i : r;
            const nc = orientation === 'h' ? c + i : c;
            if (nr >= GRID_SIZE || nc >= GRID_SIZE || currentGrid[nr][nc].tileId) {
              valid = false;
              break;
            }
            cells.push({ r: nr, c: nc });
          }

          if (valid) {
            const bufferSize = globalAttempts < 5 ? 1 : 0;
            if (bufferSize > 0) {
              for (const cell of cells) {
                for (let dr = -bufferSize; dr <= bufferSize; dr++) {
                  for (let dc = -bufferSize; dc <= bufferSize; dc++) {
                    const nr = cell.r + dr;
                    const nc = cell.c + dc;
                    if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
                      if (currentGrid[nr][nc].tileId) {
                        valid = false;
                        break;
                      }
                    }
                  }
                  if (!valid) break;
                }
                if (!valid) break;
              }
            }
          }

          if (valid) {
            cells.forEach(cell => {
              currentGrid[cell.r][cell.c] = {
                ...currentGrid[cell.r][cell.c],
                tileId: tile.id,
                letter: tile.letter,
                tier: tile.tier,
                isSpecial: tile.isSpecial,
                hitsRequired: tile.isSpecial === 'vault' ? 2 : 1,
                hitsReceived: 0,
              };
            });
            history.push({ row: r, col: c, tileId: tile.id, size: tile.size, orientation });
            placedCount++;
            placed = true;
            if (placedCount >= TOTAL_TILES) break;
          }
        }
        if (placedCount >= TOTAL_TILES) break;
      }
    }

    if (placedCount < TOTAL_TILES) {
      const remainingTiles = toPlace.filter(t => !history.find(h => h.tileId === t.id));
      for (const tile of remainingTiles) {
        if (placedCount >= TOTAL_TILES) break;
        let forced = false;
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (!currentGrid[r][c].tileId) {
              currentGrid[r][c] = {
                ...currentGrid[r][c],
                tileId: tile.id,
                letter: tile.letter,
                tier: tile.tier,
                isSpecial: tile.isSpecial,
                hitsRequired: tile.isSpecial === 'vault' ? 2 : 1,
                hitsReceived: 0,
              };
              history.push({ row: r, col: c, tileId: tile.id, size: 1, orientation: 'h' });
              placedCount++;
              forced = true;
              break;
            }
          }
          if (forced) break;
        }
      }
    }

    setGameState(prev => ({
      ...prev,
      players: {
        ...prev.players,
        [player]: {
          ...prev.players[player],
          grid: currentGrid,
          tilesPlaced: placedCount,
          placementHistory: history,
        },
      },
    }));
    if (placedCount > 0) playSound(SOUNDS.PLACE);
  };

  const placeTile = (player: 1 | 2, row: number, col: number, tile: LetterTile, orientation: 'h' | 'v') => {
    setError(null);
    const playerState = gameState.players[player];
    const newGrid = [...playerState.grid.map(r => [...r])];

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

    playSound(SOUNDS.PLACE);
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
          placementHistory: [...(prev.players[player].placementHistory || []), { row, col, tileId: tile.id, size: tile.size, orientation }],
        },
      },
    }));
    setError(null);
  };

  const finalizeSetup = (player: 1 | 2) => {
    const p = gameState.players[player];
    if (p.tilesPlaced < TOTAL_TILES) {
      setError(`Place all ${TOTAL_TILES} tiles first`);
      return;
    }

    const placedTiles = p.grid.flat().filter(c => c.tileId);
    const uniqueTileIds = Array.from(new Set(placedTiles.map(c => c.tileId)));
    const allTiles = [...LETTER_POOL, ...SPECIAL_TILES];
    const placedTileObjects = uniqueTileIds.map(id => allTiles.find(t => t.id === id)).filter(Boolean) as LetterTile[];

    const vowels = ['A', 'E', 'I', 'O', 'U'];
    const vowelCount = placedTileObjects.filter(t => t.tier === 'common' && vowels.includes(t.letter)).length;

    if (vowelCount < 7) {
      setError('Deployment Error: Minimum 7 Vowels required for tactical depth');
      return;
    }

    setGameState(prev => {
      if (player === 1) {
        setMessage(`${prev.players[2].name}: Place your tiles.`);
        return {
          ...prev,
          players: {
            ...prev.players,
            1: { ...prev.players[1], isReady: true },
          },
          activePlayer: 2,
        };
      } else {
        setMessage(`Battle begins! ${prev.players[1].name}'s turn.`);
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

  const checkWin = (opponent: PlayerState, mode: WinMode, lastBombLength?: number): boolean => {
    const allTiles = new Set(opponent.grid.flat().filter(c => c.tileId).map(c => c.tileId));
    const destroyedTiles = Array.from(allTiles).filter(tid => 
      opponent.grid.flat().filter(c => c.tileId === tid).every(c => c.isHit)
    );

    const activeId = opponent.id === 1 ? 2 : 1;

    if (mode === 'classic') {
      return destroyedTiles.length >= TOTAL_TILES;
    } else if (mode === 'lexicon') {
      return (lastBombLength !== undefined && lastBombLength >= 8);
    } else if (mode === 'hybrid') {
      return destroyedTiles.length >= 15 || (lastBombLength !== undefined && lastBombLength >= 7);
    }
    return false;
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
    let isPoisonHit = false;

    if (cell.tileId) {
      hit = true;
      playSound(SOUNDS.HIT);
      
      const isMirror = cell.isSpecial === 'mirror';
      const isVault = cell.isSpecial === 'vault';
      const isPoison = cell.isSpecial === 'poison';
      const isCharged = cell.isSpecial === 'charged';

      if (isMirror && !cell.isMirrored) {
        cell.isMirrored = true;
        cell.isHit = false;
      } else {
        cell.isHit = true;
      }
      
      cell.hitsReceived = (cell.hitsReceived || 0) + 1;

      if (isPoison) {
        isPoisonHit = true;
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
        addToast("poison", "⚠️ DECOY HIT - BANK COMPROMISED");
      }

      const canHarvestMirror = isMirror && !cell.isHarvested;
      const canHarvestVault = isVault && cell.hitsReceived === 2;
      const canHarvestRegular = !isMirror && !isVault && !isPoison;

      if (canHarvestMirror || canHarvestVault || canHarvestRegular) {
        harvestedLetter = LETTER_POOL.find(l => l.letter === cell.letter && l.tier === cell.tier) || null;
        if (isMirror && harvestedLetter) {
          cell.isHarvested = true;
        }
        if (harvestedLetter) {
          addToast("harvest", `+1 LETTER HARVESTED [${harvestedLetter.letter}]`);
        }
      }

      if (cell.tier === 'uncommon') {
        const otherHalf = newGrid.flat().find(c => c.tileId === cell.tileId && (c.row !== row || c.col !== col));
        if (otherHalf?.isHit) {
          bonusShot = true;
        }
      }

      if (isCharged) {
        const rowTiles = newGrid[row].filter(c => c.tileId && !c.isHit);
        const colTiles = newGrid.map(r => r[col]).filter(c => c.tileId && !c.isHit);
        if (rowTiles.length === 0 || colTiles.length === 0) {
          bonusShot = true;
        }
      }
    } else {
      playSound(SOUNDS.MISS);
      cell.isMiss = true;
      addToast("miss", "MISS - SECTOR CLEAR");
    }

    let resultMsg = "";
    if (harvestedLetter) {
      resultMsg = `HIT! Harvested '${harvestedLetter.letter}' from ${opponent.name}`;
    } else if (isPoisonHit) {
      resultMsg = "POISON DECOY HIT!";
    } else if (hit) {
      if (!opponent.isAI) addToast("damaged", `ALERT: YOUR TILE HIT AT ${String.fromCharCode(65 + col)}${row + 1}`);
      resultMsg = "HIT!";
      addToast("hit", "DIRECT HIT");
    } else {
      resultMsg = "MISS";
    }
    setMessage(resultMsg);
    setError(null);

    setGameState(prev => {
      const updatedOpponent = { ...prev.players[opponentId], grid: newGrid };
      const updatedActive = { ...prev.players[activeId] };
      if (harvestedLetter) {
        const letterWithId = { ...harvestedLetter, uniqueId: Math.random().toString(36).substring(7) };
        updatedActive.bank = [...updatedActive.bank, letterWithId];
      }

      const nextPlayer = bonusShot ? activeId : opponentId;
      const isGameOver = checkWin(updatedOpponent, prev.winMode);
      const nextPhase = isGameOver ? 'gameover' : 'battle';

      if (isGameOver) playSound(SOUNDS.WIN);

      const historyEvent: HistoryEvent = {
        id: Math.random().toString(36).substring(7),
        turn: prev.turnCount + 1,
        playerId: activeId,
        playerName: prev.players[activeId].name,
        type: 'fire',
        action: `Fired at ${String.fromCharCode(65 + col)}${row + 1}`,
        result: resultMsg,
        timestamp: Date.now(),
      };

      const allTileIds = new Set(newGrid.flat().filter(c => c.tileId).map(c => c.tileId));
      const currentTilesDestroyed = Array.from(allTileIds).filter(tid =>
        newGrid.flat().filter(c => c.tileId === tid).every(c => c.isHit)
      ).length;

      updatedActive.tilesDestroyed = currentTilesDestroyed;
      if (hit) updatedActive.totalHits += 1;

      return {
        ...prev,
        phase: nextPhase,
        activePlayer: nextPlayer,
        history: [historyEvent, ...prev.history],
        lastAction: {
          type: 'fire',
          cells: [{ r: row, c: col }],
          playerId: activeId
        },
        players: {
          ...prev.players,
          [opponentId]: updatedOpponent,
          [activeId]: updatedActive,
        },
        winner: nextPhase === 'gameover' ? activeId : null,
        turnCount: prev.turnCount + 1
      };
    });
  };

  const executeBomb = (word: string, target: { row?: number; col?: number; cell?: { r: number; c: number } }) => {
    playSound(SOUNDS.BOMB);
    const activeId = gameState.activePlayer;
    const opponentId = activeId === 1 ? 2 : 1;
    const activePlayer = gameState.players[activeId];
    const upperWord = word.toUpperCase();

    if (!isValidWord(upperWord)) {
      setError('Invalid word');
      return;
    }
    if (gameState.playedWords.includes(upperWord)) {
      setError('Word already played');
      return;
    }

    const wordLetters = upperWord.split('');
    const newBank = [...activePlayer.bank];
    let wordScore = 0;

    for (const char of wordLetters) {
      const idx = newBank.findIndex(l => l.letter === char);
      const wildcardIdx = idx === -1 ? newBank.findIndex(l => l.tier === 'wildcard') : -1;

      if (idx === -1 && wildcardIdx === -1) {
        setError('Missing letters in bank');
        return;
      }

      const tile = idx !== -1 ? newBank[idx] : newBank[wildcardIdx];
      let points = tile.points;
      if (tile.tier === 'rare') points *= 2;
      wordScore += points;
      newBank.splice(idx !== -1 ? idx : wildcardIdx, 1);
    }

    const length = upperWord.length;
    const opponent = gameState.players[opponentId];
    const newGrid = [...opponent.grid.map(r => [...r])];
    const affectedCells: { r: number; c: number }[] = [];

    if (length === 3) {
      if (target.row !== undefined) {
        for (let c = 0; c < GRID_SIZE; c++) affectedCells.push({ r: target.row, c });
      } else if (target.col !== undefined) {
        for (let r = 0; r < GRID_SIZE; r++) affectedCells.push({ r, c: target.col! });
      }
    } else if (length === 4) {
      if (target.cell) {
        affectedCells.push(target.cell);
        const cell = newGrid[target.cell.r][target.cell.c];
        if (cell.tileId) {
          cell.isHit = true;
          const harvested = LETTER_POOL.find(l => l.letter === cell.letter && l.tier === cell.tier);
          if (harvested) {
            const letterWithId = { ...harvested, uniqueId: Math.random().toString(36).substring(7) };
            newBank.push(letterWithId);
          }
        } else {
          cell.isMiss = true;
        }
      }
    } else if (length === 5) {
      if (target.row !== undefined) {
        for (let c = 0; c < GRID_SIZE; c++) {
          affectedCells.push({ r: target.row, c });
          if (newGrid[target.row][c].tileId) newGrid[target.row][c].isRevealed = true;
        }
      } else if (target.col !== undefined) {
        for (let r = 0; r < GRID_SIZE; r++) {
          affectedCells.push({ r, c: target.col! });
          if (newGrid[r][target.col!].tileId) newGrid[r][target.col!].isRevealed = true;
        }
      }
    } else if (length === 6) {
      if (target.cell) {
        for (let dr = 0; dr < 2; dr++) {
          for (let dc = 0; dc < 2; dc++) {
            const r = target.cell.r + dr;
            const c = target.cell.c + dc;
            if (r < GRID_SIZE && c < GRID_SIZE) {
              affectedCells.push({ r, c });
              if (newGrid[r][c].tileId) newGrid[r][c].isHit = true;
              else newGrid[r][c].isMiss = true;
            }
          }
        }
      }
    } else if (length === 7) {
      const oppBank = [...opponent.bank];
      if (oppBank.length > 0) {
        const stolen = oppBank.splice(Math.floor(Math.random() * oppBank.length), 1)[0];
        newBank.push(stolen);
        setGameState(prev => ({ ...prev, players: { ...prev.players, [opponentId]: { ...prev.players[opponentId], bank: oppBank } } }));
      }
    } else if (length >= 8) {
      if (target.row !== undefined) {
        for (let c = 0; c < GRID_SIZE; c++) {
          affectedCells.push({ r: target.row, c });
          newGrid[target.row][c].isHit = true;
        }
      } else if (target.col !== undefined) {
        for (let r = 0; r < GRID_SIZE; r++) {
          affectedCells.push({ r, c: target.col! });
          newGrid[r][target.col!].isHit = true;
        }
      }
    }

    setGameState(prev => {
      const updatedOpponent = { ...prev.players[opponentId], grid: newGrid };
      const isGameOver = checkWin(updatedOpponent, prev.winMode, length);
      const nextPhase = isGameOver ? 'gameover' : 'battle';
      
      const allTileIds = new Set(newGrid.flat().filter(c => c.tileId).map(c => c.tileId));
      const currentTilesDestroyed = Array.from(allTileIds).filter(tid =>
        newGrid.flat().filter(c => c.tileId === tid).every(c => c.isHit)
      ).length;

      return {
        ...prev,
        phase: nextPhase,
        activePlayer: opponentId,
        playedWords: [...prev.playedWords, upperWord],
        lastAction: { type: 'bomb', cells: affectedCells, playerId: activeId },
        players: {
          ...prev.players,
          [activeId]: { ...prev.players[activeId], bank: newBank, score: prev.players[activeId].score + wordScore, bombsPlayed: prev.players[activeId].bombsPlayed + 1, tilesDestroyed: currentTilesDestroyed },
          [opponentId]: updatedOpponent,
        },
        winner: nextPhase === 'gameover' ? activeId : null,
        turnCount: prev.turnCount + 1,
      };
    });
  };

  const findBestWord = (bank: LetterTile[], played: string[]): string | null => {
    const letters = bank.map(l => l.letter === '★' ? '?' : l.letter).join('');
    const sortedDict = Array.from(COMMON_WORDS).sort((a, b) => b.length - a.length);
    
    for (const word of sortedDict) {
      if (played.includes(word)) continue;
      let tempLetters = letters;
      let canForm = true;
      for (const char of word) {
        let index = tempLetters.indexOf(char);
        if (index === -1) index = tempLetters.indexOf('?');
        if (index === -1) {
          canForm = false;
          break;
        }
        tempLetters = tempLetters.slice(0, index) + tempLetters.slice(index + 1);
      }
      if (canForm) return word;
    }
    return null;
  };

  const aiTurn = useCallback(() => {
    const activeId = gameState.activePlayer;
    const activePlayer = gameState.players[activeId];
    if (!activePlayer.isAI || gameState.phase !== 'battle') return;

    const difficulty = activePlayer.difficulty || 'medium';
    const bombThreshold = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 4 : 3;
    const delay = difficulty === 'easy' ? 1200 : difficulty === 'medium' ? 800 : 400;

    setTimeout(() => {
      setGameState(current => {
        const currActiveId = current.activePlayer;
        const currActivePlayer = current.players[currActiveId];
        if (!currActivePlayer.isAI || current.phase !== 'battle') return current;

        const opponentId = currActiveId === 1 ? 2 : 1;
        const opponent = current.players[opponentId];
        const untargeted = opponent.grid.flat().filter(c => !c.isHit && !c.isMiss);
        const revealed = untargeted.filter(c => c.isRevealed);

        if (currActivePlayer.bank.length >= bombThreshold) {
          const word = findBestWord(currActivePlayer.bank, current.playedWords);
          if (word) {
            const wordLen = word.length;
            const target: any = {};
            if (wordLen === 3 || wordLen === 5 || wordLen >= 8) {
              const revealedRows = Array.from(new Set(revealed.map(c => c.row)));
              target.row = revealedRows.length > 0 ? revealedRows[0] : Math.floor(Math.random() * GRID_SIZE);
            } else {
              if (revealed.length > 0) target.cell = { r: revealed[0].row, c: revealed[0].col };
              else {
                const randomTarget = untargeted[Math.floor(Math.random() * untargeted.length)];
                target.cell = { r: randomTarget.row, c: randomTarget.col };
              }
            }
            setTimeout(() => executeBomb(word, target), 0);
            return current;
          }
        }

        if (untargeted.length > 0) {
          const target = (difficulty !== 'easy' && revealed.length > 0) ? revealed[0] : untargeted[Math.floor(Math.random() * untargeted.length)];
          setTimeout(() => fire(target.row, target.col), 0);
        } else {
          setTimeout(() => skipTurn(), 0);
        }
        return current;
      });
    }, delay);
  }, [gameState.phase, gameState.activePlayer]);

  useEffect(() => {
    if (gameState.phase === 'battle' && gameState.players[gameState.activePlayer].isAI) {
      aiTurn();
    }
  }, [gameState.activePlayer, gameState.phase, aiTurn]);

  const aiSetup = (player: 1 | 2) => {
    autoPlace(player);
    setGameState(prev => {
      const isLastPlayer = player === 2;
      return {
        ...prev,
        phase: isLastPlayer ? 'battle' : 'setup',
        players: { ...prev.players, [player]: { ...prev.players[player], isReady: true } },
        activePlayer: isLastPlayer ? 1 : (player === 1 ? 2 : 1),
        message: isLastPlayer ? `Battle begins! ${prev.players[1].name}'s turn.` : `${prev.players[2].name}: Place your tiles.`,
      };
    });
  };

  useEffect(() => {
    if (gameState.phase === 'setup' && gameState.players[gameState.activePlayer].isAI) {
      setTimeout(() => aiSetup(gameState.activePlayer), 1000);
    }
  }, [gameState.activePlayer, gameState.phase]);

  const skipTurn = () => {
    setGameState(prev => ({ ...prev, activePlayer: prev.activePlayer === 1 ? 2 : 1, turnCount: prev.turnCount + 1 }));
    addToast("info", "Turn Skipped");
  };

  const reorderBank = (player: 1 | 2, newBank: LetterTile[]) => {
    setGameState(prev => ({ ...prev, players: { ...prev.players, [player]: { ...prev.players[player], bank: newBank } } }));
  };

  return {
    gameState, toasts, message, error,
    placeTile, finalizeSetup, fire, executeBomb, resetGame,
    setWinMode, updatePlayerName, toggleAI, setDifficulty,
    undoPlacement, removeTileAt, autoPlace, toggleSound, isSoundEnabled,
    skipTurn, reorderBank,
  };
};
