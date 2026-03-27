export type Tier = 'common' | 'uncommon' | 'rare' | 'wildcard' | 'special';

export interface LetterTile {
  id: string;
  uniqueId?: string;
  letter: string;
  tier: Tier;
  points: number;
  size: 1 | 2;
  isSpecial?: 'vault' | 'poison' | 'mirror' | 'charged';
  description?: string;
}

export const TIERS: Record<Tier, { color: string; border: string; glow: string; label: string; textColor: string }> = {
  common: { 
    color: 'bg-slate-900', 
    border: 'border-slate-400', 
    glow: 'shadow-[0_0_10px_rgba(148,163,184,0.3)]',
    label: 'COMMON',
    textColor: 'text-slate-200'
  },
  uncommon: { 
    color: 'bg-slate-900', 
    border: 'border-emerald-500', 
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.4)]',
    label: 'UNCOMMON',
    textColor: 'text-emerald-400'
  },
  rare: { 
    color: 'bg-slate-900', 
    border: 'border-amber-500', 
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.4)]',
    label: 'RARE',
    textColor: 'text-amber-400'
  },
  wildcard: { 
    color: 'bg-slate-900', 
    border: 'border-purple-500', 
    glow: 'shadow-[0_0_15px_rgba(168,85,247,0.4)]',
    label: 'WILDCARD',
    textColor: 'text-purple-400'
  },
  special: { 
    color: 'bg-slate-900', 
    border: 'border-blue-500', 
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.4)]',
    label: 'SPECIAL',
    textColor: 'text-blue-400'
  },
};

export const LETTER_POOL: LetterTile[] = [
  // Common (21 in pool, up to 10 placed)
  ...(['E', 'A', 'I', 'O', 'U'] as const).flatMap(l => 
    Array(3).fill(null).map((_, i) => ({ id: `common-${l}-${i}`, letter: l, tier: 'common' as Tier, points: 1, size: 1 as const }))
  ),
  ...(['R', 'T', 'N', 'S'] as const).flatMap(l => 
    Array(2).fill(null).map((_, i) => ({ id: `common-${l}-${i}`, letter: l, tier: 'common' as Tier, points: 1, size: 1 as const }))
  ),
  // Uncommon (9 in pool, up to 4 placed, 1x2)
  ...([
    { l: 'B', p: 3 }, { l: 'C', p: 3 }, { l: 'D', p: 2 }, { l: 'F', p: 4 },
    { l: 'G', p: 2 }, { l: 'H', p: 4 }, { l: 'L', p: 1 }, { l: 'M', p: 3 }, { l: 'P', p: 3 }
  ] as const).map(({ l, p }) => ({ id: `uncommon-${l}`, letter: l, tier: 'uncommon' as Tier, points: p, size: 2 as const })),
  // Rare (8 in pool, max 2 placed)
  ...([
    { l: 'J', p: 8 }, { l: 'K', p: 5 }, { l: 'Q', p: 10 }, { l: 'V', p: 4 },
    { l: 'W', p: 4 }, { l: 'X', p: 8 }, { l: 'Y', p: 4 }, { l: 'Z', p: 10 }
  ] as const).map(({ l, p }) => ({ id: `rare-${l}`, letter: l, tier: 'rare' as Tier, points: p, size: 1 as const })),
  // Wildcard (1 in pool, max 1 placed)
  { id: 'wildcard-1', letter: '★', tier: 'wildcard' as Tier, points: 0, size: 1 as const, description: 'Can represent any letter when casting a Word Bomb.' },
];

export const SPECIAL_TILES: LetterTile[] = [
  { id: 'special-vault', letter: 'V', tier: 'special', points: 1, size: 1, isSpecial: 'vault', description: 'Requires 2 hits to destroy. Harvested only on the second hit.' },
  { id: 'special-poison', letter: 'P', tier: 'special', points: 0, size: 1, isSpecial: 'poison', description: 'When hit, the attacker loses a random letter from their bank. Cannot be harvested.' },
  { id: 'special-mirror', letter: 'M', tier: 'special', points: 1, size: 1, isSpecial: 'mirror', description: 'Remains on the grid after being hit. Can be harvested multiple times.' },
  { id: 'special-charged', letter: 'C', tier: 'special', points: 1, size: 1, isSpecial: 'charged', description: 'If this is the last tile in its row or column, the attacker gets a bonus shot.' },
];

export const BOMB_EFFECTS: Record<number, { name: string; description: string }> = {
  3: { name: 'Spark', description: 'Reveal if any tile exists in a chosen row or column (Yes/No).' },
  4: { name: 'Blast', description: 'Directly hit any single chosen cell on the enemy grid.' },
  5: { name: 'Surge', description: 'Reveal the exact positions of all tiles in a chosen row or column.' },
  6: { name: 'Storm', description: 'Hit all cells in a 2x2 area on the enemy grid.' },
  7: { name: 'Tempest', description: 'Steal one random letter from the opponent\'s bank.' },
  8: { name: 'Obliterate', description: 'Destroy every cell in an entire chosen row or column.' },
};

export const SOUNDS = {
  PLACE: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  HIT: 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3',
  MISS: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  BOMB: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3',
  WIN: 'https://assets.mixkit.co/active_storage/sfx/2582/2582-preview.mp3',
};
