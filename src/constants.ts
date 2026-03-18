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

export const TIERS: Record<Tier, { color: string; border: string }> = {
  common: { color: 'bg-white', border: 'border-slate-200' },
  uncommon: { color: 'bg-blue-50', border: 'border-blue-400' },
  rare: { color: 'bg-amber-50', border: 'border-amber-400' },
  wildcard: { color: 'bg-purple-50', border: 'border-purple-400' },
  special: { color: 'bg-slate-100', border: 'border-slate-400' },
};

export const LETTER_POOL: LetterTile[] = [
  // Common (16 in pool, up to 10 placed)
  ...(['E', 'A', 'I', 'O', 'R', 'T', 'N', 'S'] as const).flatMap(l => 
    Array(2).fill(null).map((_, i) => ({ id: `common-${l}-${i}`, letter: l, tier: 'common' as Tier, points: 1, size: 1 as const }))
  ),
  // Uncommon (9 in pool, up to 4 placed, 1x2)
  ...(['B', 'C', 'D', 'F', 'G', 'H', 'L', 'M', 'P'] as const).map(l => ({ id: `uncommon-${l}`, letter: l, tier: 'uncommon' as Tier, points: 2, size: 2 as const })),
  // Rare (8 in pool, max 2 placed)
  ...(['J', 'K', 'Q', 'V', 'W', 'X', 'Y', 'Z'] as const).map(l => ({ id: `rare-${l}`, letter: l, tier: 'rare' as Tier, points: 8, size: 1 as const })),
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
