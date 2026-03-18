export type Tier = 'common' | 'uncommon' | 'rare' | 'wildcard' | 'special';

export interface LetterTile {
  id: string;
  letter: string;
  tier: Tier;
  points: number;
  size: 1 | 2;
  isSpecial?: 'vault' | 'poison' | 'mirror' | 'charged';
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
  { id: 'wildcard-1', letter: '★', tier: 'wildcard' as Tier, points: 0, size: 1 as const },
];

export const SPECIAL_TILES: LetterTile[] = [
  { id: 'special-vault', letter: 'V', tier: 'special', points: 1, size: 1, isSpecial: 'vault' },
  { id: 'special-poison', letter: 'P', tier: 'special', points: 0, size: 1, isSpecial: 'poison' },
  { id: 'special-mirror', letter: 'M', tier: 'special', points: 1, size: 1, isSpecial: 'mirror' },
  { id: 'special-charged', letter: 'C', tier: 'special', points: 1, size: 1, isSpecial: 'charged' },
];

export const BOMB_EFFECTS = {
  3: { name: 'Spark', description: 'Reveal if tile exists in row/col (yes/no)' },
  4: { name: 'Blast', description: 'Hit any 1 chosen cell' },
  5: { name: 'Surge', description: 'Reveal all tile positions in row/col' },
  6: { name: 'Storm', description: 'Hit 2x2 area' },
  7: { name: 'Tempest', description: 'Steal 1 random letter from opponent' },
  8: { name: 'Obliterate', description: 'Destroy full row/col' },
};
