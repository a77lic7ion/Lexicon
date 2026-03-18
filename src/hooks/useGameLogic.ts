import { useState, useCallback, useEffect } from 'react';
import { GameState, GamePhase, WinMode, CellState, PlayerState } from '../types';
import { LETTER_POOL, SPECIAL_TILES, LetterTile, SOUNDS } from '../constants';
import { COMMON_WORDS, isValidWord } from '../utils/dictionary';

const GRID_SIZE = 10;

const playSound = (url: string) => {
  const audio = new Audio(url);
  audio.volume = 0.4;
  audio.play().catch(() => {}); // Ignore errors if browser blocks autoplay
};

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
  isAI: false,
  placementHistory: [],
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

  const [message, setMessage] = useState<string>('Place your tiles.');
  const [error, setError] = useState<string | null>(null);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      phase: 'setup',
      winMode: 'hybrid',
      activePlayer: 1,
      players: {
        1: { ...initialPlayerState(1), name: prev.players[1].name },
        2: { ...initialPlayerState(2), name: prev.players[2].name },
      },
      playedWords: [],
      winner: null,
      turnCount: 0,
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
        [id]: { ...prev.players[id], isAI: !prev.players[id].isAI }
      }
    }));
  };

  const undoPlacement = (player: 1 | 2) => {
    setGameState(prev => {
      const p = prev.players[player];
      if (!p.placementHistory || p.placementHistory.length === 0) return prev;

      const last = p.placementHistory[p.placementHistory.length - 1];
      const newGrid = [...p.grid.map(r => [...r])];

      // Clear cells
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

  const autoPlace = (player: 1 | 2) => {
    const playerState = gameState.players[player];
    let currentGrid = [...playerState.grid.map(r => [...r])];
    let placedCount = 0;
    const history: { row: number; col: number; tileId: string; size: number; orientation: 'h' | 'v' }[] = [];

    // Reset grid first
    currentGrid = createEmptyGrid();

    const pool = [...LETTER_POOL];
    const specials = [...SPECIAL_TILES];
    
    // Intelligent-ish placement:
    // 1. Place 15 tiles
    // 2. Mix of tiers
    // 3. Respect buffer
    
    const toPlace: LetterTile[] = [];
    // 3 Vowels (Common)
    const vowels = pool.filter(t => ['A', 'E', 'I', 'O', 'U'].includes(t.letter)).slice(0, 3);
    toPlace.push(...vowels);
    // 2 Rare
    toPlace.push(...pool.filter(t => t.tier === 'rare').slice(0, 2));
    // 1 Wildcard
    toPlace.push(pool.find(t => t.tier === 'wildcard')!);
    // 4 Uncommon (1x2)
    toPlace.push(...pool.filter(t => t.tier === 'uncommon').slice(0, 4));
    // 4 Special
    toPlace.push(...specials);
    // Fill rest with common
    const remaining = 15 - toPlace.length;
    toPlace.push(...pool.filter(t => t.tier === 'common' && !toPlace.includes(t)).slice(0, remaining));

    for (const tile of toPlace) {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        attempts++;
        const r = Math.floor(Math.random() * GRID_SIZE);
        const c = Math.floor(Math.random() * GRID_SIZE);
        const orientation = Math.random() > 0.5 ? 'h' : 'v';

        // Check bounds and overlap
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
          // Check buffer
          for (const cell of cells) {
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
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
    playSound(SOUNDS.PLACE);
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

    // Check 1-cell buffer rule
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
    if (p.tilesPlaced < 15) {
      setError('Place all 15 tiles first');
      return;
    }

    setGameState(prev => {
      const nextPlayer = player === 1 ? 2 : 1;
      
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

  const checkWin = (opponent: PlayerState, mode: WinMode, lastWordLen: number = 0): boolean => {
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
      playSound(SOUNDS.HIT);
      cell.isHit = true;
      cell.hitsReceived = (cell.hitsReceived || 0) + 1;

      // Special logic
      const isVault = cell.isSpecial === 'vault';
      const isPoison = cell.isSpecial === 'poison';
      const isMirror = cell.isSpecial === 'mirror';
      const isCharged = cell.isSpecial === 'charged';

      if (isPoison) {
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
          cell.isHit = true; 
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
    }

    setGameState(prev => {
      const updatedOpponent = { ...prev.players[opponentId], grid: newGrid };
      const updatedActive = { ...prev.players[activeId] };
      if (harvestedLetter) {
        updatedActive.bank = [...updatedActive.bank, harvestedLetter];
      }

      const nextPlayer = bonusShot ? activeId : opponentId;
      const isGameOver = checkWin(updatedOpponent, prev.winMode);
      const nextPhase = isGameOver ? 'gameover' : 'battle';

      if (isGameOver) playSound(SOUNDS.WIN);

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

    const bankLetters = activePlayer.bank.map(l => l.letter);
    const wordLetters = upperWord.split('');
    const tempBank = [...bankLetters];

    for (const char of wordLetters) {
      const idx = tempBank.indexOf(char);
      if (idx === -1) {
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

    const length = upperWord.length;
    const opponent = gameState.players[opponentId];
    const newGrid = [...opponent.grid.map(r => [...r])];

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
      const isGameOver = checkWin(updatedOpponent, prev.winMode, length);
      const nextPhase = isGameOver ? 'gameover' : 'battle';

      if (isGameOver) playSound(SOUNDS.WIN);

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

  const aiTurn = useCallback(() => {
    const activeId = gameState.activePlayer;
    const activePlayer = gameState.players[activeId];
    if (!activePlayer.isAI || gameState.phase !== 'battle') return;

    // AI Logic:
    // 1. Try to cast a word bomb if bank has 3+ letters
    // 2. Otherwise, fire a random shot

    setTimeout(() => {
      if (activePlayer.bank.length >= 3) {
        // Find a word from bank
        const bankLetters = activePlayer.bank.map(l => l.letter);
        // Simple AI: just pick 3-5 random letters that form a "word" (since isValidWord is permissive)
        const wordLen = Math.min(activePlayer.bank.length, 5);
        const word = bankLetters.slice(0, wordLen).join('');
        
        // Pick a target
        const target: any = {};
        if (wordLen === 3 || wordLen === 5) {
          target.row = Math.floor(Math.random() * GRID_SIZE);
        } else if (wordLen === 4) {
          target.cell = { r: Math.floor(Math.random() * GRID_SIZE), c: Math.floor(Math.random() * GRID_SIZE) };
        }
        
        executeBomb(word, target);
      } else {
        // Random fire
        const opponentId = activeId === 1 ? 2 : 1;
        const opponent = gameState.players[opponentId];
        const untargeted = opponent.grid.flat().filter(c => !c.isHit && !c.isMiss);
        if (untargeted.length > 0) {
          const target = untargeted[Math.floor(Math.random() * untargeted.length)];
          fire(target.row, target.col);
        }
      }
    }, 1000);
  }, [gameState, fire, executeBomb]);

  useEffect(() => {
    if (gameState.phase === 'battle' && gameState.players[gameState.activePlayer].isAI) {
      aiTurn();
    }
  }, [gameState.activePlayer, gameState.phase, aiTurn]);

  useEffect(() => {
    if (gameState.phase === 'setup' && gameState.players[gameState.activePlayer].isAI) {
      autoPlace(gameState.activePlayer);
      setTimeout(() => finalizeSetup(gameState.activePlayer), 1000);
    }
  }, [gameState.activePlayer, gameState.phase]);

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
    updatePlayerName,
    toggleAI,
    undoPlacement,
    autoPlace,
  };
};

