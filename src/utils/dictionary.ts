export const COMMON_WORDS = new Set([
  'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'ANY', 'CAN', 'HAD', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS', 'HOW', 'MAN', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WAY', 'WHO', 'BOY', 'DID', 'ITS', 'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE', 'ACT', 'ADD', 'AGE', 'AIR', 'ART', 'ASK', 'BAD', 'BAG', 'BAR', 'BAT', 'BED', 'BEE', 'BIG', 'BIT', 'BOX', 'BUS', 'CAR', 'CAT', 'CUP', 'CUT', 'DOG', 'DRY', 'EAT', 'EGG', 'END', 'EYE', 'FAN', 'FAR', 'FAT', 'FIG', 'FLY', 'FUN', 'GAS', 'GUM', 'HAT', 'HIT', 'HOT', 'ICE', 'INK', 'JAM', 'JET', 'JOB', 'KEY', 'LAP', 'LEG', 'LIP', 'LOG', 'LOW', 'MAD', 'MAP', 'MAT', 'MIX', 'MUD', 'NET', 'NIL', 'ODD', 'OFF', 'OIL', 'OWN', 'PAD', 'PAN', 'PAY', 'PEN', 'PET', 'PIG', 'PIN', 'POT', 'RAT', 'RAW', 'RED', 'RIB', 'RID', 'ROB', 'ROD', 'RUN', 'SAD', 'SEA', 'SET', 'SEW', 'SIN', 'SIT', 'SIX', 'SKY', 'SON', 'SUN', 'TAP', 'TAX', 'TEA', 'TEN', 'TIE', 'TIP', 'TOP', 'TOY', 'TRY', 'VAN', 'WAR', 'WET', 'WIN', 'YES', 'ZIP',
  'THAT', 'WITH', 'HAVE', 'THIS', 'WILL', 'YOUR', 'FROM', 'THEY', 'KNOW', 'WANT', 'BEEN', 'MUCH', 'SOME', 'TIME', 'VERY', 'WHEN', 'COME', 'HERE', 'JUST', 'LIKE', 'LONG', 'MAKE', 'MANY', 'MORE', 'ONLY', 'OVER', 'SUCH', 'THAN', 'THEM', 'THEN', 'UPON', 'ABOUT', 'AFTER', 'AGAIN', 'COULD', 'EVERY', 'FIRST', 'GREAT', 'OTHER', 'RIGHT', 'SMALL', 'SOUND', 'STILL', 'THESE', 'THING', 'THINK', 'THREE', 'WATER', 'WHERE', 'WHICH', 'WORLD', 'WOULD', 'WRITE', 'YEARS',
  'BEFORE', 'LITTLE', 'PEOPLE', 'SHOULD', 'THROUGH', 'BETWEEN', 'THOUGHT', 'ANOTHER', 'BECAUSE', 'CHILDREN', 'DIFFERENT', 'IMPORTANT', 'SOMETHING', 'TOGETHER', 'UNDERSTAND',
  'STORM', 'SPARK', 'BLAST', 'SURGE', 'TEMPEST', 'OBLITERATE', 'LEXICON', 'BATTLE', 'HARVEST', 'WEAPON', 'SMART', 'WORD', 'BOMB', 'GRID', 'TILE', 'BANK', 'TURN', 'PHASE', 'WIN', 'MODE', 'CLASSIC', 'HYBRID', 'VAULT', 'POISON', 'MIRROR', 'CHARGED', 'COMMON', 'UNCOMMON', 'RARE', 'WILDCARD', 'POW', 'BOOM', 'ZAP', 'CRASH', 'BANG', 'SMASH', 'WHACK', 'THUMP', 'CLANG', 'DING', 'DONG', 'TICK', 'TOCK', 'BUZZ', 'HISS', 'ROAR', 'GROWL', 'BARK', 'MEOW', 'QUACK', 'MOO', 'NEIGH', 'BAA', 'OINK', 'CHIRP', 'TWEET', 'HOOT', 'CROW', 'CLUCK', 'PEEP', 'SQUEAK', 'CROAK', 'HISS', 'SLITHER', 'CRAWL', 'WALK', 'RUN', 'JUMP', 'HOP', 'SKIP', 'LEAP', 'DANCE', 'SING', 'PLAY', 'READ', 'WRITE', 'DRAW', 'PAINT', 'BUILD', 'BREAK', 'FIX', 'CLEAN', 'WASH', 'COOK', 'EAT', 'DRINK', 'SLEEP', 'WAKE', 'DREAM', 'LAUGH', 'SMILE', 'CRY', 'SHOUT', 'WHISPER', 'TALK', 'LISTEN', 'HEAR', 'SEE', 'LOOK', 'WATCH', 'FEEL', 'TOUCH', 'SMELL', 'TASTE', 'THINK', 'KNOW', 'LEARN', 'TEACH', 'HELP', 'GIVE', 'TAKE', 'SEND', 'BRING', 'KEEP', 'HOLD', 'FIND', 'LOSE', 'WIN', 'LOSE', 'START', 'STOP', 'WAIT', 'GO', 'COME', 'STAY', 'LEAVE', 'ENTER', 'EXIT', 'OPEN', 'CLOSE', 'PUSH', 'PULL', 'LIFT', 'DROP', 'THROW', 'CATCH', 'HIT', 'MISS', 'WIN', 'LOSE', 'GAME', 'PLAY', 'PLAYER', 'TEAM', 'SCORE', 'GOAL', 'POINT', 'WIN', 'LOSE', 'DRAW', 'MATCH', 'RACE', 'FIGHT', 'BATTLE', 'WAR', 'PEACE', 'LOVE', 'HATE', 'FRIEND', 'ENEMY', 'LIFE', 'DEATH', 'BIRTH', 'TIME', 'SPACE', 'WORLD', 'EARTH', 'SUN', 'MOON', 'STAR', 'SKY', 'SEA', 'LAND', 'FIRE', 'WATER', 'AIR', 'WIND', 'RAIN', 'SNOW', 'ICE', 'HEAT', 'COLD', 'LIGHT', 'DARK', 'SOUND', 'SILENCE', 'MUSIC', 'NOISE', 'VOICE', 'WORD', 'BOOK', 'PEN', 'PAPER', 'COMPUTER', 'PHONE', 'INTERNET', 'CODE', 'DATA', 'SYSTEM', 'NETWORK', 'POWER', 'ENERGY', 'FORCE', 'SPEED', 'TIME', 'SPACE', 'MATTER', 'ATOM', 'CELL', 'BODY', 'MIND', 'SOUL', 'HEART', 'BLOOD', 'BONE', 'SKIN', 'HAIR', 'EYE', 'EAR', 'NOSE', 'MOUTH', 'HAND', 'FOOT', 'ARM', 'LEG', 'HEAD', 'FACE', 'BRAIN', 'THOUGHT', 'IDEA', 'DREAM', 'HOPE', 'FEAR', 'JOY', 'SAY', 'LOVE', 'HATE', 'ANGER', 'PEACE', 'WAR', 'LIFE', 'DEATH', 'TRUTH', 'LIE', 'GOOD', 'EVIL', 'RIGHT', 'WRONG', 'YES', 'NO', 'MAYBE', 'PLEASE', 'THANKS', 'SORRY', 'HELLO', 'BYE',
]);

export function isValidWord(word: string): boolean {
  const upperWord = word.toUpperCase();
  if (upperWord.length < 3) return false;
  if (COMMON_WORDS.has(upperWord)) return true;
  return false;
}

export async function validateWordOnline(word: string): Promise<boolean> {
  const upper = word.toUpperCase();
  if (upper.length < 3 || !/^[A-Z]+$/.test(upper)) return false;
  try {
    const g = await fetch(`/api/validate-google?word=${encodeURIComponent(upper)}`);
    if (g.ok) {
      const gj = await g.json();
      if (typeof gj.valid === 'boolean') return !!gj.valid;
    }
    const r = await fetch(`/api/validate?word=${encodeURIComponent(upper)}`);
    const j = await r.json();
    return !!j.valid;
  } catch {
    return COMMON_WORDS.has(upper);
  }
}
