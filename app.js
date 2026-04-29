const SINGLE_PLAYER_PLACEHOLDERS = [
  { id: 'snake', name: 'Snake', controls: 'Arrow keys' },
  { id: '2048', name: '2048', controls: 'Arrow keys' },
  { id: 'minesweeper', name: 'Minesweeper', controls: 'Mouse' },
  { id: 'infinite-craft-clone', name: 'Infinite Craft', controls: 'Mouse' },
  { id: 'the-password-game', name: 'The Password Game', controls: 'Keyboard' },
  { id: 'tetris', name: 'Tetris', controls: 'Arrow keys' },
  { id: 'dino-run-clone', name: 'Dino Run Clone', controls: 'Space/Arrow' },
  { id: 'pac-man', name: 'Pac-Man', controls: 'Arrow keys' },
  { id: 'wordle-inf', name: 'Wordle Infinite', controls: 'Keyboard' },
  { id: 'flappy-bird-clone', name: 'Flappy Bird Clone', controls: 'Space/Mouse' },
  { id: 'doodle-jump-clone', name: 'Doodle Jump Clone', controls: 'Arrow keys' },
  { id: 'breakout', name: 'Breakout', controls: 'Mouse' },
  { id: 'asteroids', name: 'Asteroids', controls: 'Arrow keys' },
  { id: 'frogger', name: 'Frogger', controls: 'Arrow keys' },
  { id: 'solitaire', name: 'Solitaire', controls: 'Mouse/Touch' },
  { id: 'space-invaders', name: 'Space Invaders', controls: 'Arrow keys' },
  { id: 'little-alchemy-clone', name: 'Little Alchemy Clone', controls: 'Mouse' },
  { id: 'draw-a-perfect-circle', name: 'Draw a Perfect Circle', controls: 'Mouse' },
  { id: 'spend-bill-gates-money', name: "Spend Bill Gates' Money", controls: 'Mouse' },
  { id: 'the-deep-sea', name: 'The Deep Sea', controls: 'Mouse Scroll' },
  { id: 'geometry-dash-clone', name: 'Geometry Dash Clone', controls: 'Mouse Click' },
  { id: 'cookie-clicker', name: 'Cookie Clicker', controls: 'Mouse' },
  { id: 'draw-it', name: 'Draw It', controls: 'Mouse / touch' },
  { id: 'tower-builder', name: 'Tower Builder', controls: 'Mouse Click' },
  { id: 'memory-match', name: 'Memory Match', controls: 'Mouse' },
  { id: 'hextris', name: 'Hextris', controls: 'Arrow keys' },
  { id: 'burrito-bison-clone', name: 'Burrito Bison Clone', controls: 'Mouse' },
  { id: 'aim-training-arena', name: 'Aim Training Arena', controls: 'Mouse' },
  { id: 'typing-test', name: 'Typing Test', controls: 'Keyboard' },
  { id: 'slide-puzzle', name: 'Slide Puzzle', controls: 'Mouse' },
  { id: 'absurd-trolley-problem', name: 'The Absurd Trolley Problem!', controls: 'Mouse' },
];

const MULTIPLAYER_PLACEHOLDERS = [
  { id: 'infinite-craft-multiplayer', name: 'Infinite Craft Multiplayer', controls: 'Mouse - shared room crafting (2P-4P)' },
  { id: 'battleship', name: 'Battleship - Neon Fleet', controls: 'Mouse - room-based 2P fleet duel' },
  { id: 'chopsticks', name: 'Chopsticks', controls: 'Mouse - first-person 2P hand duel' },
  { id: 'connect-4', name: 'Connect 4', controls: 'Mouse - 2P/4P rotation/bracket' },
  { id: 'chess', name: 'Chess', controls: 'Mouse - 2D top-down 2P' },
  { id: 'checkers', name: 'Checkers', controls: 'Mouse - 2P/4P team mode' },
  { id: 'tic-tac-toe', name: 'Tic-Tac-Toe', controls: 'Mouse - 2P/4P chaos mode' },
  { id: 'pong', name: 'Pong', controls: 'Up/Down vs W/S keys 2P' },
  { id: 'tank-trouble-clone', name: 'Tank Trouble Clone', controls: '2D top-down arena 2P' },
  { id: 'slither-io-clone', name: 'Slither.io Clone', controls: 'Mouse - 2D snake arena 2P' },
  { id: 'fireboy-watergirl-clone', name: 'Fireboy & Watergirl Clone', controls: 'Arrow keys & WASD 2P' },
  { id: 'hangman-2p', name: 'Hangman Multiplayer', controls: 'Keyboard - 5-player room + owner' },
  { id: '8-ball-pool', name: '8-Ball Pool', controls: 'Mouse - 2D top-down 2P' },
  { id: 'air-hockey', name: 'Air Hockey', controls: 'Mouse vs Keyboard 2P' },
  { id: 'rock-paper-scissors', name: 'Rock Paper Scissors', controls: 'Mouse - 2P' },
  { id: 'trivia-quiz', name: 'Trivia Quiz', controls: 'Mouse - speed competition multiplayer' },
  { id: 'dots-and-boxes', name: 'Dots and Boxes', controls: 'Mouse - 2P/4P' },
  { id: 'ludo', name: 'Ludo', controls: 'Mouse - 2D board 4P' },
  { id: 'uno-clone', name: 'Uno Clone', controls: 'Mouse - card game 2P/4P' },
  { id: 'tug-of-war', name: 'Tug of War', controls: "Button mash: 'A' vs 'L' 2P" },
  { id: 'mancala', name: 'Mancala', controls: 'Mouse - 2D board 2P/4P' },
  { id: 'penalty-shootout', name: 'Penalty Shootout', controls: 'Mouse - 2D timing 2P' },
  { id: 'snakes-and-ladders', name: 'Snakes & Ladders', controls: 'Mouse - board game 2P/4P' },
  { id: 'among-us-clone', name: 'One Of Us Is The Imposter', controls: 'Mouse - deduction 2P/4P' },
];

const MULTIPLAYER_IMPLEMENTED_IDS = new Set([
  '8-ball-pool',
  'air-hockey',
  'among-us-clone',
  'battleship',
  'chopsticks',
  'checkers',
  'chess',
  'connect-4',
  'dots-and-boxes',
  'fireboy-watergirl-clone',
  'hangman-2p',
  'infinite-craft-multiplayer',
  'ludo',
  'mancala',
  'penalty-shootout',
  'pong',
  'rock-paper-scissors',
  'slither-io-clone',
  'snakes-and-ladders',
  'tank-trouble-clone',
  'tic-tac-toe',
  'trivia-quiz',
  'tug-of-war',
  'uno-clone',
]);

const LEADERBOARD_SPECS = {
  'minesweeper': { label: 'Fastest times', unit: 'time', metric: 'Fastest time per board size', kind: 'time' },
  'snake': { label: 'Best survival runs', unit: 'apples', metric: 'Fastest win / apples / survival', kind: 'count' },
  'tetris': { label: 'Top score stacks', unit: 'score', metric: 'Highest score / survival / level', kind: 'score' },
  'pac-man': { label: 'Arcade score race', unit: 'score', metric: 'Fastest level clear / highest score', kind: 'score' },
  'doodle-jump-clone': { label: 'Highest climbs', unit: 'height', metric: 'Highest height reached', kind: 'distance' },
  'breakout': { label: 'Brick breaker records', unit: 'score', metric: 'Fastest clear / highest score', kind: 'score' },
  'asteroids': { label: 'Space survival', unit: 'score', metric: 'Score / survival time', kind: 'score' },
  'frogger': { label: 'River crossing times', unit: 'time', metric: 'Fastest clear time', kind: 'time' },
  'space-invaders': { label: 'Wave clear board', unit: 'score', metric: 'Highest wave / score', kind: 'score' },
  'geometry-dash-clone': { label: 'Run consistency', unit: 'time', metric: 'Fastest completion / least deaths', kind: 'time' },
  'cookie-clicker': { label: 'Cookies Clicked', unit: 'cookies', metric: 'Cookies clicked / CPC', kind: 'cookies' },
  'draw-a-perfect-circle': { label: 'Accuracy board', unit: 'accuracy', metric: 'Accuracy / deviation %', kind: 'accuracy' },
  'spend-bill-gates-money': { label: 'Spending speedrun', unit: 'time', metric: 'Fastest completion time', kind: 'time' },
  'memory-match': { label: 'Fastest matches', unit: 'time', metric: 'Fastest completion time', kind: 'time' },
  'aim-training-arena': { label: 'Aim discipline', unit: 'score', metric: 'Unified aim score', kind: 'score' },
  '2048': { label: 'Tile champions', unit: 'tile', metric: 'Highest tile / fastest 2048', kind: 'tile' },
  'slide-puzzle': { label: 'Puzzle speedruns', unit: 'time', metric: 'Fastest solve time', kind: 'time' },
  'hextris': { label: 'Hex survival', unit: 'score', metric: 'Score / survival time', kind: 'score' },
  'dino-run-clone': { label: 'Distance survivors', unit: 'distance', metric: 'Distance / survival time', kind: 'distance' },
  'burrito-bison-clone': { label: 'Launch distance', unit: 'distance', metric: 'Distance / score', kind: 'distance' },
};

const multiplayerAccessConfig = {
  requireLoginFor2P: true,
  singleUseInviteLinks: true,
};

const SINGLE_PLAYER_SLUG_ALIASES = {};

const COMPLETED_SINGLE_PLAYER_IDS = new Set([
  'snake',
  '2048',
  'asteroids',
  'breakout',
  'burrito-bison-clone',
  'typing-test',
  'cookie-clicker',
  'dino-run-clone',
  'doodle-jump-clone',
  'draw-a-perfect-circle',
  'draw-it',
  'flappy-bird-clone',
  'frogger',
  'geometry-dash-clone',
  'hextris',
  'infinite-craft-clone',
  'little-alchemy-clone',
  'memory-match',
  'minesweeper',
  'pac-man',
  'spend-bill-gates-money',
  'slide-puzzle',
  'solitaire',
  'space-invaders',
  'tetris',
  'the-deep-sea',
  'the-password-game',
  'tower-builder',
  'aim-training-arena',
  'wordle-inf',
]);

const AUTH_STORAGE_KEYS = {
  profiles: 'playrProfiles',
  legacyLoggedIn: 'playrLoggedIn',
  legacyUser: 'playrCurrentUser',
  adminOverrides: 'playrAdminOverrides',
};
const SITE_NOTICE_STORAGE_KEY = 'playrSiteNoticeReadStateV1';
const OVERSCROLL_EASTER_EGG_MESSAGES = [
  'nothing to see here 👀 (yet)',
  'still sealed up here 👀',
  'top secret area... not quite ready 👀',
];
const OVERSCROLL_EASTER_EGG_TOP_THRESHOLD = 2;
const OVERSCROLL_EASTER_EGG_COOLDOWN_MS = 7000;
const OVERSCROLL_EASTER_EGG_DELAY_MS = 180;
const OVERSCROLL_EASTER_EGG_VISIBLE_MS = 1800;
const OVERSCROLL_EASTER_EGG_TOP_SETTLE_MS = 140;
const OVERSCROLL_EASTER_EGG_WHEEL_PULL_THRESHOLD = 70;
const OVERSCROLL_EASTER_EGG_TOUCH_PULL_THRESHOLD = 54;

// Admin rights are bound to explicit trusted UIDs, never to display names.
const OWNER_ADMIN_UIDS = new Set([]);
const OWNER_VIP_IDENTIFIERS = new Set(['owner@playr.io']);

const firebaseConfig = {
  apiKey: 'AIzaSyAIpLxF3vwcLL_aez4db2HlxkftJBkbTRE',
  authDomain: 'playr3.firebaseapp.com',
  projectId: 'playr3',
  storageBucket: 'playr3.firebasestorage.app',
  messagingSenderId: '784118485475',
  appId: '1:784118485475:web:5347f708718f56602fd0d6',
  measurementId: 'G-J4DKRFRX33',
};

const firebaseApp = window.firebase?.apps?.length
  ? window.firebase.app()
  : window.firebase?.initializeApp
    ? window.firebase.initializeApp(firebaseConfig)
    : null;

const firebaseAuth = firebaseApp && window.firebase?.auth ? window.firebase.auth() : null;
const firebaseDb = firebaseApp && window.firebase?.firestore ? window.firebase.firestore() : null;
const firebaseFunctions = firebaseApp && window.firebase?.functions ? window.firebase.functions() : null;

if (firebaseDb) {
  try {
    firebaseDb.settings({
      experimentalForceLongPolling: true,
      useFetchStreams: false,
    });
  } catch {
    // Firestore settings can throw if initialized elsewhere first.
  }
}

const DISPLAY_NAME_COLLECTION = 'displayNames';
const USER_PROFILE_COLLECTION = 'userProfiles';
const FRIEND_REQUESTS_COLLECTION = 'friendRequests';
const FRIENDSHIPS_COLLECTION = 'friendships';
const PROFILE_SYNC_DEBOUNCE_MS = 900;
const CLOUD_LEADERBOARD_CACHE_MS = 2 * 60 * 1000;
const CLOUD_LEADERBOARD_PROFILE_LIMIT = 150;
const PROFILE_CACHE_TTL_MS = 2 * 60 * 1000;
const SOCIAL_CACHE_TTL_MS = 45 * 1000;
const PROFILE_WARNING_HISTORY_LIMIT = 25;
const CUSTOM_PROFILE_BANNER_LIMIT = 5;
const MAILBOX_STORAGE_KEY = 'playrMailboxV1';
const CUSTOM_BANNER_LIBRARY_KEY = 'playrCustomBannersV1';
const PROFILE_BANNER_DRAW_SIZE = { width: 1500, height: 420 };
const PROFILE_BANNER_ANIMATION_MAX_MS = 2400;
const STAFF_ROLE_SEQUENCE = ['support', 'moderator', 'admin'];
const STAFF_PROMOTION_COOLDOWN_MS = 5 * 24 * 60 * 60 * 1000;
const MODERATION_DURATION_PRESETS = [
  { id: '30m', label: '30 min', minutes: 30 },
  { id: '1h', label: '1 hour', minutes: 60 },
  { id: '12h', label: '12 hours', minutes: 12 * 60 },
  { id: '1d', label: '1 day', minutes: 24 * 60 },
  { id: '1w', label: '1 week', minutes: 7 * 24 * 60 },
  { id: 'perm', label: 'Permanent', minutes: null },
];

const PROFILE_BANNER_PRESETS = [
  { id: 'aurora', type: 'gradient', label: 'Aurora', value: 'linear-gradient(135deg, rgba(74, 128, 245, 0.92), rgba(124, 240, 197, 0.82))' },
  { id: 'ember', type: 'gradient', label: 'Ember', value: 'linear-gradient(135deg, rgba(255, 119, 89, 0.96), rgba(255, 195, 113, 0.82))' },
  { id: 'violet', type: 'gradient', label: 'Violet', value: 'linear-gradient(135deg, rgba(137, 94, 255, 0.94), rgba(255, 127, 205, 0.82))' },
  { id: 'ocean', type: 'gradient', label: 'Ocean', value: 'linear-gradient(135deg, rgba(31, 84, 163, 0.96), rgba(72, 203, 255, 0.78))' },
  { id: 'midnight', type: 'solid', label: 'Midnight', value: '#11203d' },
  { id: 'jade', type: 'solid', label: 'Jade', value: '#0d6d5f' },
  { id: 'ember-solid', type: 'solid', label: 'Ember Solid', value: '#9b372f' },
  { id: 'platinum', type: 'solid', label: 'Platinum', value: '#41536f' },
];

const RESERVED_RANK_TERMS = [
  'admin', 'administrator', 'mod', 'moderator', 'staff', 'support', 'dev', 'developer',
  'owner', 'root', 'system', 'official', 'manager',
];

const PROFANITY_TERMS = [
  // Explicit sexual/vulgar
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'pussy', 'cunt', 'slut',
  'whore', 'porn', 'sex', 'nude', 'nsfw', 'xxx', 'cock', 'ass',
  // Variants
  'fck', 'fcuk', 'shyt', 'btch', 'puss', 'anus', 'piss',
  // Hate speech / slurs
  'faggot', 'fag', 'nigga', 'nigger', 'retard', 'tranny', 'homo',
  // Drugs
  'cocaine', 'heroin', 'meth', 'weed', 'pot', 'xanax',
  // Religious blasphemy
  'goddamn', 'goddam', 'jesus', 'christ',
];

const MODERATION_CHAR_MAP = {
  '0': 'o',
  '1': 'i',
  'l': 'i',
  '2': 'z',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '6': 'g',
  '7': 't',
  '8': 'b',
  '9': 'g',
  '@': 'a',
  '$': 's',
  '!': 'i',
  '|': 'i',
};

function collapseRepeatedChars(value) {
  return String(value || '').replace(/(.)\1{1,}/g, '$1');
}

function levenshteinDistanceWithinLimit(source, target, limit = 1) {
  const a = String(source || '');
  const b = String(target || '');
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) prev[j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i;
    let rowMin = curr[0];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost,
      );
      rowMin = Math.min(rowMin, curr[j]);
    }
    if (rowMin > limit) return limit + 1;
    for (let j = 0; j <= b.length; j += 1) prev[j] = curr[j];
  }
  return prev[b.length];
}

function containsApproximateBlockedTerm(sourceText, blockedTerms = []) {
  const source = String(sourceText || '');
  if (!source) return false;
  return blockedTerms.some((term) => {
    const safeTerm = String(term || '');
    if (!safeTerm) return false;
    if (source.includes(safeTerm)) return true;
    const minLen = Math.max(2, safeTerm.length - 1);
    const maxLen = safeTerm.length + 1;
    for (let start = 0; start < source.length; start += 1) {
      for (let length = minLen; length <= maxLen; length += 1) {
        const slice = source.slice(start, start + length);
        if (!slice) continue;
        if (levenshteinDistanceWithinLimit(slice, safeTerm, 1) <= 1) {
          return true;
        }
      }
    }
    return false;
  });
}

if (firebaseAuth && window.firebase?.auth?.Auth?.Persistence?.LOCAL) {
  firebaseAuth.setPersistence(window.firebase.auth.Auth.Persistence.LOCAL).catch(() => {});
}

function readStoredProfiles() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.profiles);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function persistProfiles(profiles) {
  const safeProfiles = Object.fromEntries(
    Object.entries(profiles || {}).map(([key, value]) => {
      const profile = value && typeof value === 'object' ? value : {};
      const mergedTheme = mergeProfileThemeState({}, profile.profileTheme);
      return [key, {
        ...profile,
        profileTheme: {
          banner: mergedTheme.banner,
          customBanners: [],
        },
      }];
    }),
  );
  localStorage.setItem(AUTH_STORAGE_KEYS.profiles, JSON.stringify(safeProfiles));
}

function readStoredCustomBannerLibrary() {
  try {
    const raw = localStorage.getItem(CUSTOM_BANNER_LIBRARY_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function getAuthUserCreatedAt(user = authState.currentUser) {
  const createdAt = normalizeTimestampToMs(user?.metadata?.creationTime);
  return createdAt || 0;
}

function mergeCustomBannerEntries(existingEntries = [], incomingEntries = []) {
  const mergedById = new Map();
  [...existingEntries, ...incomingEntries].forEach((entry) => {
    if (!entry || typeof entry !== 'object') return;
    const id = String(entry.id || '').trim();
    const dataUrl = String(entry.dataUrl || '').trim();
    if (!id || !dataUrl) return;
    const normalized = {
      id,
      label: String(entry.label || 'Custom banner').trim() || 'Custom banner',
      dataUrl,
      width: Math.max(1, Number(entry.width) || 0),
      height: Math.max(1, Number(entry.height) || 0),
      animated: Boolean(entry.animated),
      scene: normalizeBannerScene(entry.scene),
      createdAt: normalizeTimestampToMs(entry.createdAt),
      updatedAt: normalizeTimestampToMs(entry.updatedAt),
    };
    const previous = mergedById.get(id);
    if (!previous || normalized.updatedAt >= previous.updatedAt) {
      mergedById.set(id, normalized);
    }
  });
  return Array.from(mergedById.values())
    .sort((left, right) => Math.max(0, right.updatedAt || right.createdAt) - Math.max(0, left.updatedAt || left.createdAt))
    .slice(0, CUSTOM_PROFILE_BANNER_LIMIT);
}

function normalizeBannerScene(scene = null) {
  if (!scene || typeof scene !== 'object') return null;
  const width = Math.max(1, Number(scene.width) || PROFILE_BANNER_DRAW_SIZE.width);
  const height = Math.max(1, Number(scene.height) || PROFILE_BANNER_DRAW_SIZE.height);
  const backgroundSource = scene.background && typeof scene.background === 'object' ? scene.background : {};
  const background = {
    mode: backgroundSource.mode === 'gradient' ? 'gradient' : 'solid',
    color: /^#[0-9a-f]{6}$/i.test(String(backgroundSource.color || '').trim()) ? String(backgroundSource.color).trim() : '#ffffff',
    angle: Math.max(0, Math.min(360, Number(backgroundSource.angle) || 135)),
    stops: Array.isArray(backgroundSource.stops)
      ? backgroundSource.stops
        .map((stop, index) => ({
          id: String(stop?.id || `bg-stop-${index + 1}`),
          offset: Math.max(0, Math.min(1, Number(stop?.offset) || 0)),
          color: /^#[0-9a-f]{6}$/i.test(String(stop?.color || '').trim()) ? String(stop.color).trim() : '#ffffff',
        }))
        .sort((left, right) => left.offset - right.offset)
      : [],
  };
  const objects = Array.isArray(scene.objects) ? scene.objects.map((item, index) => normalizeBannerSceneObject(item, index)).filter(Boolean).slice(0, 24) : [];
  return { version: 1, width, height, background, objects };
}

function normalizeBannerSceneObject(item, index = 0) {
  if (!item || typeof item !== 'object') return null;
  const type = item.type === 'image' ? 'image' : item.type === 'stroke' ? 'stroke' : '';
  if (!type) return null;
  const baseAnimation = normalizeBannerSceneAnimation(item.animation, type);
  if (type === 'stroke') {
    const points = Array.isArray(item.points)
      ? item.points.map((point) => ({
        x: Number(point?.x) || 0,
        y: Number(point?.y) || 0,
      })).filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y)).slice(0, 2000)
      : [];
    if (!points.length) return null;
    return {
      id: String(item.id || `stroke-${index}`),
      type: 'stroke',
      points,
      size: Math.max(1, Math.min(80, Number(item.size) || 8)),
      erase: Boolean(item.erase),
      drawMode: item.drawMode === 'pixel' ? 'pixel' : 'freehand',
      groupId: String(item.groupId || ''),
      style: {
        mode: item.style?.mode === 'gradient' ? 'gradient' : 'solid',
        colorA: /^#[0-9a-f]{6}$/i.test(String(item.style?.colorA || '').trim()) ? String(item.style.colorA).trim() : '#183a8f',
        colorB: /^#[0-9a-f]{6}$/i.test(String(item.style?.colorB || '').trim()) ? String(item.style.colorB).trim() : '#7cf0c5',
        angle: Math.max(0, Math.min(360, Number(item.style?.angle) || 35)),
        stops: Array.isArray(item.style?.stops)
          ? item.style.stops.map((stop, stopIndex) => ({
            id: String(stop?.id || `stroke-stop-${stopIndex + 1}`),
            offset: Math.max(0, Math.min(1, Number(stop?.offset) || 0)),
            color: /^#[0-9a-f]{6}$/i.test(String(stop?.color || '').trim()) ? String(stop.color).trim() : '#183a8f',
          })).sort((left, right) => left.offset - right.offset).slice(0, 6)
          : [],
      },
      animation: baseAnimation,
    };
  }
  const src = String(item.src || '').trim();
  if (!src.startsWith('data:image/')) return null;
  return {
    id: String(item.id || `image-${index}`),
    type: 'image',
    src,
    x: Number(item.x) || 0,
    y: Number(item.y) || 0,
    width: Math.max(10, Number(item.width) || 120),
    height: Math.max(10, Number(item.height) || 120),
    baseWidth: Math.max(10, Number(item.baseWidth) || Number(item.width) || 120),
    baseHeight: Math.max(10, Number(item.baseHeight) || Number(item.height) || 120),
    scale: Math.max(20, Math.min(250, Number(item.scale) || 100)),
    groupId: String(item.groupId || ''),
    mimeType: String(item.mimeType || '').trim().toLowerCase(),
    animation: baseAnimation,
  };
}

function normalizeBannerSceneAnimation(animation = null, objectType = 'stroke') {
  const safeType = String(animation?.type || 'none').trim().toLowerCase();
  const allowed = new Set(['none', 'jump', 'shake', 'float', 'pulse', 'redraw']);
  const type = allowed.has(safeType) ? safeType : 'none';
  if (type === 'redraw' && objectType !== 'stroke') {
    return { type: 'none', duration: 0 };
  }
  return {
    type,
    duration: type === 'none' ? 0 : Math.max(320, Math.min(PROFILE_BANNER_ANIMATION_MAX_MS, Number(animation?.duration) || 1200)),
  };
}

function mergeProfileThemeState(existingTheme = {}, incomingTheme = {}) {
  const existingBanner = existingTheme?.banner && typeof existingTheme.banner === 'object' ? existingTheme.banner : {};
  const incomingBanner = incomingTheme?.banner && typeof incomingTheme.banner === 'object' ? incomingTheme.banner : {};
  const existingBannerUpdatedAt = normalizeTimestampToMs(existingBanner.updatedAt);
  const incomingBannerUpdatedAt = normalizeTimestampToMs(incomingBanner.updatedAt);
  const mergedCustomBanners = mergeCustomBannerEntries(
    Array.isArray(existingTheme?.customBanners) ? existingTheme.customBanners : [],
    Array.isArray(incomingTheme?.customBanners) ? incomingTheme.customBanners : [],
  );
  return {
    banner: incomingBannerUpdatedAt >= existingBannerUpdatedAt ? incomingBanner : existingBanner,
    customBanners: mergedCustomBanners,
  };
}

function buildLeanProfileTheme(theme = {}, options = {}) {
  const mergedTheme = mergeProfileThemeState({}, theme);
  return {
    banner: mergedTheme.banner,
    customBanners: options.includeCustomBanners === true ? mergedTheme.customBanners : [],
  };
}

function getProgressionApi() {
  return window.PlayrProgression && typeof window.PlayrProgression.getProgressionSnapshot === 'function'
    ? window.PlayrProgression
    : null;
}

function getProgressionSnapshotForAccount(account = getCurrentAccount()) {
  const api = getProgressionApi();
  if (!api || !account) {
    return {
      xp: 0,
      level: 1,
      currentThreshold: 0,
      nextThreshold: 100,
      xpToNextLevel: 100,
      progress: 0,
      totalActiveMinutes: 0,
      totalMultiplayerMinutes: 0,
      activeTodayMinutes: 0,
      multiplayerTodayMinutes: 0,
      referralCode: '',
      referralLink: '',
      qualifiedReferrals: 0,
      badges: [],
      availableBadges: [],
      equippedBadgeIds: [],
      maxExtraBadgeSlots: 2,
      title: '',
      flair: '',
      badgeAssets: { vip: '', levelGroups: {}, referral: {} },
    };
  }
  return api.getProgressionSnapshot(account);
}

function getProgressionProfileExport(account = getCurrentAccount()) {
  const api = getProgressionApi();
  if (!api || !account || typeof api.exportProfile !== 'function') return null;
  return api.exportProfile(account);
}

function cacheProfileLocally(profile, { persist = true } = {}) {
  if (!profile || typeof profile !== 'object') return null;
  const normalizedProfile = mergeCloudProfileShape(profile);
  const uid = String(normalizedProfile.uid || '').trim();
  if (!uid) return null;
  const previous = mergeCloudProfileShape(authState.profiles[uid] || {});
  const mergedTheme = mergeProfileThemeState(previous.profileTheme, normalizedProfile.profileTheme);
  const preservedCreatedAt = [
    normalizeTimestampToMs(previous.createdAt),
    normalizeTimestampToMs(normalizedProfile.createdAt),
    uid === String(authState.currentUser?.uid || '').trim() ? getAuthUserCreatedAt(authState.currentUser) : 0,
  ].filter(Boolean);
  authState.profiles[uid] = {
    ...previous,
    ...normalizedProfile,
    uid,
    createdAt: preservedCreatedAt.length ? Math.min(...preservedCreatedAt) : Date.now(),
    profileTheme: buildLeanProfileTheme(mergedTheme),
  };
  if (persist) {
    persistProfiles(authState.profiles);
  }
  return authState.profiles[uid];
}

function applyCloudProfileToLocalAccount(account, remoteProfile, options = {}) {
  if (!account || !remoteProfile || typeof remoteProfile !== 'object') return null;
  const progressionApi = getProgressionApi();
  if (progressionApi && typeof progressionApi.importProfile === 'function') {
    progressionApi.importProfile(account, remoteProfile, {
      prefer: options.prefer || 'newer',
      emit: options.emit !== false,
    });
  }
  const exported = getProgressionProfileExport(account) || remoteProfile;
  return cacheProfileLocally(exported, { persist: options.persist !== false });
}

function buildCurrentAccountCloudProfile(account = getCurrentAccount()) {
  if (!account) return null;
  const exported = getProgressionProfileExport(account);
  if (!exported) return null;
  const roles = Array.isArray(account.roles) ? [...account.roles] : [];
  return {
    ...exported,
    uid: account.uid,
    displayName: account.displayName,
    normalizedDisplayName: normalizeDisplayNameForLookup(account.displayName),
    identifier: account.identifier,
    identifierType: account.identifierType,
    verified: account.verified || exported.verified || false,
    roles,
    isVip: Boolean(account.isVip || exported.isVip),
    profileTheme: buildLeanProfileTheme(exported.profileTheme),
    progressionUpdatedAt: Math.max(0, Number(exported.progressionUpdatedAt) || Date.now()),
    createdAt: normalizeTimestampToMs(account.createdAt) || normalizeTimestampToMs(exported.createdAt) || Date.now(),
    updatedAt: Date.now(),
  };
}

async function syncCurrentAccountProfileToFirestore({ immediate = false } = {}) {
  const account = getCurrentAccount();
  if (!firebaseDb || !account?.uid) return;

  if (!immediate) {
    window.clearTimeout(authState.profileSyncTimer);
    authState.profileSyncTimer = window.setTimeout(() => {
      void syncCurrentAccountProfileToFirestore({ immediate: true });
    }, PROFILE_SYNC_DEBOUNCE_MS);
    return;
  }

  window.clearTimeout(authState.profileSyncTimer);
  authState.profileSyncTimer = 0;

  const profile = buildCurrentAccountCloudProfile(account);
  if (!profile) return;

  cacheProfileLocally(profile);

  const timestamp = window.firebase.firestore.FieldValue.serverTimestamp();
  try {
    await firebaseDb.collection(USER_PROFILE_COLLECTION).doc(account.uid).set({
      uid: account.uid,
      displayName: account.displayName,
      normalizedDisplayName: normalizeDisplayNameForLookup(account.displayName),
      identifier: account.identifier,
      identifierType: account.identifierType,
      roles: profile.roles || [],
      isVip: Boolean(profile.isVip),
      verified: profile.verified || false,
      progression: profile.progression || null,
      activity: profile.activity || null,
      moderation: profile.moderation || null,
      profileTheme: buildLeanProfileTheme(profile.profileTheme) || null,
      createdAt: profile.createdAt || Date.now(),
      progressionUpdatedAt: profile.progressionUpdatedAt || Date.now(),
      updatedAt: timestamp,
    }, { merge: true });
  } catch {
    // Keep local progression responsive even if cloud sync is temporarily unavailable.
  }
}

function stopCurrentUserProfileSubscription() {
  if (typeof authState.profileSyncUnsubscribe === 'function') {
    authState.profileSyncUnsubscribe();
  }
  authState.profileSyncUnsubscribe = null;
}

function subscribeToCurrentUserProfile(user) {
  stopCurrentUserProfileSubscription();
  if (!firebaseDb || !user?.uid) return;

  authState.profileSyncUnsubscribe = firebaseDb.collection(USER_PROFILE_COLLECTION).doc(user.uid).onSnapshot((snapshot) => {
    if (!snapshot.exists) {
      void syncCurrentAccountProfileToFirestore({ immediate: true });
      return;
    }

    const account = getCurrentAccount() || {
      uid: user.uid,
      identifier: user.email || user.phoneNumber || user.uid,
      identifierType: user.email ? 'email' : (user.phoneNumber ? 'phone' : 'uid'),
      displayName: user.displayName || authState.profiles[user.uid]?.displayName || 'Player',
      roles: authState.profiles[user.uid]?.roles || [],
      isVip: Boolean(authState.profiles[user.uid]?.isVip),
      createdAt: normalizeTimestampToMs(authState.profiles[user.uid]?.createdAt) || getAuthUserCreatedAt(user),
      verified: {
        email: Boolean(user.emailVerified),
        phone: Boolean(user.phoneNumber),
      },
    };
    const remoteProfile = mergeCloudProfileShape({ uid: user.uid, ...(snapshot.data() || {}) });
    authState.suspendProgressionSyncUntil = Date.now() + 1500;
    const syncedProfile = applyCloudProfileToLocalAccount(account, remoteProfile, {
      prefer: 'newer',
      emit: true,
    }) || remoteProfile;
    cacheResolvedProfile(syncedProfile);
    const syncedBan = mergeCloudProfileShape(syncedProfile).moderation?.ban || {};
    const banStillActive = Boolean(syncedBan.active)
      && (Boolean(syncedBan.permanent) || normalizeTimestampToMs(syncedBan.expiresAt) > Date.now() || normalizeTimestampToMs(syncedBan.expiresAt) === 0);
    if (banStillActive) {
      localStorage.setItem('playrBanNotice', syncedProfile?.moderation?.ban?.reason || 'This account has been banned.');
      void firebaseAuth?.signOut?.().catch(() => {});
      return;
    }
    const localStamp = Math.max(0, Number(syncedProfile?.progressionUpdatedAt) || 0);
    const remoteStamp = Math.max(0, Number(remoteProfile?.progressionUpdatedAt) || 0);
    if (localStamp > remoteStamp) {
      void syncCurrentAccountProfileToFirestore({ immediate: true });
    }
  }, () => {});
}

async function refreshCloudLeaderboardProfiles({ force = false } = {}) {
  if (!firebaseDb || authState.cloudLeaderboardFetchInFlight) return;
  const now = Date.now();
  if (!force && (now - authState.lastCloudLeaderboardSyncAt) < CLOUD_LEADERBOARD_CACHE_MS) {
    return;
  }

  authState.cloudLeaderboardFetchInFlight = true;
  try {
    const snapshot = await firebaseDb
      .collection(USER_PROFILE_COLLECTION)
      .orderBy('progression.xp', 'desc')
      .limit(CLOUD_LEADERBOARD_PROFILE_LIMIT)
      .get();
    snapshot.forEach((doc) => {
      const data = doc.data() || {};
      if (!data.uid) {
        data.uid = doc.id;
      }
      cacheProfileLocally(data, { persist: false });
      cacheResolvedProfile(mergeCloudProfileShape(data));
    });
    authState.lastCloudLeaderboardSyncAt = Date.now();
    persistProfiles(authState.profiles);
    if (isLeaderboardViewActive()) {
      renderLeaderboard();
    }
  } catch {
    // Fall back to the locally cached leaderboard snapshot if Firestore is unavailable.
  } finally {
    authState.cloudLeaderboardFetchInFlight = false;
  }
}

async function fetchCloudStaffProfiles() {
  if (!firebaseDb) return [];
  try {
    const snapshot = await firebaseDb
      .collection(USER_PROFILE_COLLECTION)
      .where('staff.role', 'in', ['support', 'moderator', 'admin'])
      .get();
    return snapshot.docs.map((doc) => mergeCloudProfileShape({
      uid: doc.id,
      ...(doc.data() || {}),
    }));
  } catch {
    return [];
  }
}

async function fetchCloudOwnerProfiles() {
  if (!firebaseDb) return [];
  try {
    const snapshot = await firebaseDb
      .collection(USER_PROFILE_COLLECTION)
      .where('roles', 'array-contains', 'owner')
      .get();
    return snapshot.docs.map((doc) => mergeCloudProfileShape({
      uid: doc.id,
      ...(doc.data() || {}),
    }));
  } catch {
    return [];
  }
}

function mergeProfilesByUid(existingProfiles = [], incomingProfiles = []) {
  const mergedByUid = new Map();
  [...existingProfiles, ...incomingProfiles].forEach((profile) => {
    const safeProfile = mergeCloudProfileShape(profile);
    const uid = String(safeProfile.uid || '').trim();
    if (!uid) return;
    mergedByUid.set(uid, safeProfile);
  });
  return Array.from(mergedByUid.values());
}

function formatPlayerIdentityMarkup(name, options = {}) {
  const api = getProgressionApi();
  if (!api || typeof api.formatIdentityMarkup !== 'function') {
    return String(name || 'Player')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  return api.formatIdentityMarkup(name, options);
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getProfileBannerPresetByValue(type, value) {
  return PROFILE_BANNER_PRESETS.find((preset) => preset.type === type && preset.value === value) || null;
}

function getDefaultProfileBanner() {
  return PROFILE_BANNER_PRESETS[0];
}

function getCustomProfileBanners(profile = {}, account = getCurrentAccount()) {
  const localEntries = Array.isArray(profile?.profileTheme?.customBanners)
    ? profile.profileTheme.customBanners
    : [];
  const libraryEntries = account?.uid
    ? (Array.isArray(readStoredCustomBannerLibrary()[account.uid])
      ? readStoredCustomBannerLibrary()[account.uid]
      : [])
    : [];
  const progressionEntries = window.PlayrProgression?.getStoredCustomBanners
    ? window.PlayrProgression.getStoredCustomBanners(account || profile)
    : [];
  return mergeCustomBannerEntries(
    mergeCustomBannerEntries(localEntries, libraryEntries),
    progressionEntries,
  );
}

function getEditableCurrentProfile(account = getCurrentAccount()) {
  if (!account?.uid) return mergeCloudProfileShape({});
  const localProfile = mergeCloudProfileShape(authState.profiles[account.uid] || {});
  const exported = getProgressionProfileExport(account);
  if (!exported || typeof exported !== 'object') {
    return localProfile;
  }
  return mergeCloudProfileShape({
    ...localProfile,
    ...exported,
    profileTheme: mergeProfileThemeState(localProfile.profileTheme, exported.profileTheme),
  });
}

function getModerationPresetById(presetId) {
  return MODERATION_DURATION_PRESETS.find((preset) => preset.id === String(presetId || '').trim()) || MODERATION_DURATION_PRESETS[1];
}

function formatModerationExpiry(stamp) {
  const safeStamp = normalizeTimestampToMs(stamp);
  if (!safeStamp) return 'Permanent';
  return new Date(safeStamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function buildModerationSummary(moderation = {}) {
  const warnings = Math.max(0, Number(moderation.warningCount) || 0);
  const muteActive = Boolean(moderation.mutedPermanent) || normalizeTimestampToMs(moderation.mutedUntil) > Date.now();
  const banActive = Boolean(moderation.ban?.active) && (Boolean(moderation.ban?.permanent) || normalizeTimestampToMs(moderation.ban?.expiresAt) > Date.now() || normalizeTimestampToMs(moderation.ban?.expiresAt) === 0);
  const parts = [`Warnings: ${warnings}`];
  if (muteActive) {
    parts.push(`Mute: ${moderation.mutedPermanent ? 'Permanent' : `Until ${formatModerationExpiry(moderation.mutedUntil)}`}`);
  }
  if (banActive) {
    parts.push(`Ban: ${moderation.ban?.permanent ? 'Permanent' : `Until ${formatModerationExpiry(moderation.ban?.expiresAt)}`}`);
  }
  return parts.join(' • ');
}

function normalizeTimestampToMs(value) {
  if (!value) return 0;
  if (typeof value?.toMillis === 'function') return Math.max(0, Number(value.toMillis()) || 0);
  if (typeof value?.seconds === 'number') return Math.max(0, (Number(value.seconds) * 1000) + Math.floor(Number(value.nanoseconds || 0) / 1000000));
  const asNumber = Number(value);
  if (Number.isFinite(asNumber) && asNumber > 0) return asNumber;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function formatProfileDate(value) {
  const stamp = normalizeTimestampToMs(value);
  if (!stamp) return 'Unknown';
  return new Date(stamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDurationLabel(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  if (!safeSeconds) return '0 min';
  const days = Math.floor(safeSeconds / 86400);
  const hours = Math.floor((safeSeconds % 86400) / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
}

function normalizeFriendshipId(uidA, uidB) {
  return [String(uidA || '').trim(), String(uidB || '').trim()].filter(Boolean).sort().join('__');
}

function getCurrentModerationSnapshot(account = getCurrentAccount()) {
  const uid = String(account?.uid || '').trim();
  if (!uid) {
    return {
      warningCount: 0,
      warnings: [],
      mutedUntil: 0,
      mutedPermanent: false,
      muteReason: '',
      ban: { active: false, permanent: false, reason: '', bannedAt: 0, expiresAt: 0, bannedByUid: '', bannedByName: '' },
    };
  }
  const profile = authState.profiles[uid] || {};
  const moderation = profile.moderation && typeof profile.moderation === 'object' ? profile.moderation : {};
  return {
    warningCount: Math.max(0, Number(moderation.warningCount) || 0),
    warnings: Array.isArray(moderation.warnings) ? moderation.warnings : [],
    mutedUntil: normalizeTimestampToMs(moderation.mutedUntil),
    mutedPermanent: Boolean(moderation.mutedPermanent),
    muteReason: String(moderation.muteReason || '').trim(),
    ban: {
      active: Boolean(moderation.ban?.active),
      permanent: Boolean(moderation.ban?.permanent),
      reason: String(moderation.ban?.reason || '').trim(),
      bannedAt: normalizeTimestampToMs(moderation.ban?.bannedAt),
      expiresAt: normalizeTimestampToMs(moderation.ban?.expiresAt),
      bannedByUid: String(moderation.ban?.bannedByUid || '').trim(),
      bannedByName: String(moderation.ban?.bannedByName || '').trim(),
    },
  };
}

function isCurrentAccountMuted(account = getCurrentAccount()) {
  const moderation = getCurrentModerationSnapshot(account);
  return moderation.mutedPermanent || moderation.mutedUntil > Date.now();
}

function isCurrentAccountBanned(account = getCurrentAccount()) {
  const ban = getCurrentModerationSnapshot(account).ban;
  return ban.active === true && (ban.permanent || ban.expiresAt > Date.now() || ban.expiresAt === 0);
}

function canCurrentAccountInteract(account = getCurrentAccount()) {
  return Boolean(account && !isCurrentAccountBanned(account) && !isCurrentAccountMuted(account));
}

function getProfilePrimaryRole(profile = {}) {
  if (isOwnerAccount(profile)) return 'owner';
  return getHighestStaffRoleFromRoles(profile?.roles || []);
}

function getActorRoleInfo(actor = getCurrentAccount()) {
  const role = getAccountPrimaryRole(actor);
  return {
    role,
    rank: getRoleRank(role),
  };
}

function getTargetRoleInfo(profile = {}) {
  const role = getProfilePrimaryRole(profile);
  return {
    role,
    rank: getRoleRank(role),
  };
}

function canActorAffectTarget(actor, targetProfile) {
  const actorInfo = getActorRoleInfo(actor);
  const targetInfo = getTargetRoleInfo(targetProfile);
  return Boolean(actorInfo.rank > 0 && actorInfo.rank > targetInfo.rank);
}

function canActorWarnTarget(actor, targetProfile) {
  if (!canActorAffectTarget(actor, targetProfile)) return false;
  const actorRole = getActorRoleInfo(actor).role;
  const targetRank = getTargetRoleInfo(targetProfile).rank;
  if (actorRole === 'support') return targetRank === 0;
  if (actorRole === 'moderator' || actorRole === 'admin' || actorRole === 'owner') return true;
  return false;
}

function canActorMuteTarget(actor, targetProfile) {
  if (!canActorAffectTarget(actor, targetProfile)) return false;
  const actorRole = getActorRoleInfo(actor).role;
  return actorRole === 'moderator' || actorRole === 'admin' || actorRole === 'owner';
}

function canActorBanTarget(actor, targetProfile) {
  if (!canActorAffectTarget(actor, targetProfile)) return false;
  const actorRole = getActorRoleInfo(actor).role;
  return actorRole === 'admin' || actorRole === 'owner';
}

function canActorPromoteTarget(actor, targetProfile) {
  const actorRole = getActorRoleInfo(actor).role;
  const targetRole = getTargetRoleInfo(targetProfile).role;
  if (actorRole === 'owner') {
    return Boolean(getNextStaffRole(targetRole));
  }
  if (actorRole === 'admin') {
    return targetRole === '' || targetRole === 'support';
  }
  if (actorRole === 'moderator') {
    return targetRole === '';
  }
  return false;
}

function canActorDemoteTarget(actor, targetProfile) {
  const actorRole = getActorRoleInfo(actor).role;
  const targetRole = getTargetRoleInfo(targetProfile).role;
  if (actorRole === 'owner') {
    return Boolean(targetRole && targetRole !== 'owner');
  }
  if (actorRole === 'admin') {
    return targetRole === 'moderator' || targetRole === 'support';
  }
  if (actorRole === 'moderator') {
    return targetRole === 'support';
  }
  return false;
}

function getPromotionCooldownRemaining(profile = {}) {
  return Math.max(0, normalizeTimestampToMs(profile?.staff?.promotionCooldownUntil) - Date.now());
}

function getPromotionCooldownLabel(profile = {}) {
  const remaining = getPromotionCooldownRemaining(profile);
  if (!remaining) return '';
  const hours = Math.ceil(remaining / (60 * 60 * 1000));
  if (hours >= 24) {
    return `${Math.ceil(hours / 24)} day cooldown`;
  }
  return `${hours} hour cooldown`;
}

function upsertProfileCacheEntry(key, data) {
  if (!key) return;
  profileCacheState.byLookup[key] = {
    ...(profileCacheState.byLookup[key] || {}),
    ...data,
    cachedAt: Date.now(),
  };
}

function getCachedProfileEntry(target = {}) {
  const keys = [
    String(target.uid || '').trim() ? `uid:${String(target.uid || '').trim()}` : '',
    normalizeDisplayNameForLookup(target.displayName || target.normalizedDisplayName || '') ? `name:${normalizeDisplayNameForLookup(target.displayName || target.normalizedDisplayName || '')}` : '',
  ].filter(Boolean);
  for (const key of keys) {
    const entry = profileCacheState.byLookup[key];
    if (entry && (Date.now() - Number(entry.cachedAt || 0)) <= PROFILE_CACHE_TTL_MS) {
      return entry;
    }
  }
  return null;
}

function cacheResolvedProfile(profile) {
  if (!profile || typeof profile !== 'object') return null;
  const safeProfile = mergeCloudProfileShape({
    ...profile,
    profileTheme: buildLeanProfileTheme(profile.profileTheme),
  });
  const uid = String(safeProfile.uid || '').trim();
  const displayName = String(safeProfile.displayName || '').trim();
  const normalizedName = normalizeDisplayNameForLookup(displayName);
  const cached = {
    profile: safeProfile,
    uid,
    displayName,
    normalizedName,
    cachedAt: Date.now(),
  };
  if (uid) upsertProfileCacheEntry(`uid:${uid}`, cached);
  if (normalizedName) upsertProfileCacheEntry(`name:${normalizedName}`, cached);
  return cached;
}

function applyBannerStyleToElement(element, banner = {}) {
  if (!element) return;
  if (String(banner?.type || '') === 'vip-custom' && String(banner?.value || '').startsWith('data:image/')) {
    element.style.background = '#0f1831';
    element.style.backgroundImage = `url("${banner.value}")`;
    element.style.backgroundSize = 'cover';
    element.style.backgroundPosition = 'center';
    return;
  }
  element.style.backgroundImage = '';
  element.style.backgroundSize = '';
  element.style.backgroundPosition = '';
  element.style.background = banner?.value || getDefaultProfileBanner().value;
}

function stopProfileBannerAnimation() {
  if (profileUi.profileBannerAnimationFrame) {
    window.cancelAnimationFrame(profileUi.profileBannerAnimationFrame);
    profileUi.profileBannerAnimationFrame = 0;
  }
  if (profileUi.profileBannerAnimationCanvas) {
    profileUi.profileBannerAnimationCanvas.remove();
    profileUi.profileBannerAnimationCanvas = null;
  }
}

function buildBannerAnimationFrame(animation = {}, elapsedMs = 0) {
  const type = String(animation?.type || 'none').trim().toLowerCase();
  const duration = Math.max(320, Math.min(PROFILE_BANNER_ANIMATION_MAX_MS, Number(animation?.duration) || 1200));
  if (type === 'none') {
    return { type: 'none', translateX: 0, translateY: 0, scale: 1, visibleRatio: 1 };
  }
  const progress = Math.min(1, Math.max(0, elapsedMs / duration));
  const loop = progress;
  const sine = Math.sin(loop * Math.PI * 2);
  if (type === 'jump') return { type, translateX: 0, translateY: -Math.sin(loop * Math.PI) * 16, scale: 1, visibleRatio: 1 };
  if (type === 'shake') return { type, translateX: sine * 7, translateY: 0, scale: 1, visibleRatio: 1 };
  if (type === 'float') return { type, translateX: 0, translateY: sine * -10, scale: 1, visibleRatio: 1 };
  if (type === 'pulse') return { type, translateX: 0, translateY: 0, scale: 0.96 + (Math.sin(loop * Math.PI) * 0.08), visibleRatio: 1 };
  if (type === 'redraw') return { type, translateX: 0, translateY: 0, scale: 1, visibleRatio: Math.max(0.02, progress) };
  return { type: 'none', translateX: 0, translateY: 0, scale: 1, visibleRatio: 1 };
}

function renderBannerSceneBackground(context, background, width, height) {
  if (background?.mode === 'gradient' && Array.isArray(background?.stops) && background.stops.length >= 2) {
    const radians = ((Number(background.angle) || 135) * Math.PI) / 180;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.max(width, height) / 2;
    const dx = Math.cos(radians) * radius;
    const dy = Math.sin(radians) * radius;
    const gradient = context.createLinearGradient(centerX - dx, centerY - dy, centerX + dx, centerY + dy);
    background.stops.forEach((stop) => {
      gradient.addColorStop(Math.max(0, Math.min(1, Number(stop.offset) || 0)), String(stop.color || '#ffffff'));
    });
    context.fillStyle = gradient;
  } else {
    context.fillStyle = String(background?.color || '#ffffff');
  }
  context.fillRect(0, 0, width, height);
}

function renderBannerSceneStroke(context, object, frame) {
  const points = Array.isArray(object.points) ? object.points : [];
  if (!points.length) return;
  context.save();
  if (object.style?.mode === 'gradient' && Array.isArray(object.style?.stops) && object.style.stops.length >= 2) {
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const radians = ((Number(object.style?.angle) || 35) * Math.PI) / 180;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const radius = Math.max(maxX - minX, maxY - minY, 1) / 2;
    const dx = Math.cos(radians) * radius;
    const dy = Math.sin(radians) * radius;
    const gradient = context.createLinearGradient(centerX - dx, centerY - dy, centerX + dx, centerY + dy);
    object.style.stops.forEach((stop) => {
      gradient.addColorStop(Math.max(0, Math.min(1, Number(stop.offset) || 0)), String(stop.color || '#183a8f'));
    });
    context.strokeStyle = gradient;
    context.fillStyle = gradient;
  } else {
    context.strokeStyle = String(object.style?.colorA || '#183a8f');
    context.fillStyle = String(object.style?.colorA || '#183a8f');
  }
  const visibleCount = frame.type === 'redraw'
    ? Math.max(1, Math.ceil(points.length * frame.visibleRatio))
    : points.length;
  const visiblePoints = points.slice(0, visibleCount);
  if (object.drawMode === 'pixel') {
    const pixelSize = Math.max(2, Math.round(Number(object.size) || 8));
    visiblePoints.forEach((point) => {
      context.fillRect(point.x, point.y, pixelSize, pixelSize);
    });
  } else {
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.lineWidth = Math.max(1, Number(object.size) || 8);
    context.beginPath();
    context.moveTo(visiblePoints[0].x, visiblePoints[0].y);
    for (let index = 1; index < visiblePoints.length; index += 1) {
      context.lineTo(visiblePoints[index].x, visiblePoints[index].y);
    }
    if (visiblePoints.length === 1) {
      context.lineTo(visiblePoints[0].x + 0.01, visiblePoints[0].y + 0.01);
    }
    context.stroke();
  }
  context.restore();
}

function renderBannerSceneObject(context, object, elapsedMs, imageCache) {
  const frame = buildBannerAnimationFrame(object.animation, elapsedMs);
  const bounds = object.type === 'image'
    ? { x: object.x, y: object.y, width: object.width, height: object.height }
    : (() => {
        const xs = (object.points || []).map((point) => point.x);
        const ys = (object.points || []).map((point) => point.y);
        return {
          x: Math.min(...xs),
          y: Math.min(...ys),
          width: Math.max(...xs) - Math.min(...xs),
          height: Math.max(...ys) - Math.min(...ys),
        };
      })();
  const centerX = bounds.x + (bounds.width / 2);
  const centerY = bounds.y + (bounds.height / 2);
  context.save();
  context.translate(centerX + frame.translateX, centerY + frame.translateY);
  context.scale(frame.scale, frame.scale);
  context.translate(-centerX, -centerY);
  if (object.type === 'image') {
    const img = imageCache.get(object.id);
    if (img) {
      context.drawImage(img, object.x, object.y, object.width, object.height);
    }
  } else {
    renderBannerSceneStroke(context, object, frame);
  }
  context.restore();
}

function startProfileBannerAnimation(element, banner = {}) {
  stopProfileBannerAnimation();
  const scene = normalizeBannerScene(banner?.scene);
  const hasMotion = scene?.objects?.some((object) => (object.animation?.type && object.animation.type !== 'none') || /gif/i.test(String(object?.mimeType || object?.src || '')));
  if (!element || !scene || !hasMotion) {
    return;
  }
  const canvas = document.createElement('canvas');
  canvas.className = 'profile-banner-animation-canvas';
  canvas.width = scene.width;
  canvas.height = scene.height;
  element.appendChild(canvas);
  profileUi.profileBannerAnimationCanvas = canvas;
  const context = canvas.getContext('2d');
  const imageObjects = scene.objects.filter((object) => object.type === 'image');
  const imageCache = new Map();
  let loadedImages = 0;
  const beginPlayback = () => {
    const totalDuration = Math.max(...scene.objects.map((object) => Math.max(0, Number(object.animation?.duration) || (/gif/i.test(String(object?.mimeType || object?.src || '')) ? 1800 : 0))), 1200);
    const startedAt = performance.now();
    const tick = (now) => {
      const elapsedMs = now - startedAt;
      context.clearRect(0, 0, scene.width, scene.height);
      renderBannerSceneBackground(context, scene.background, scene.width, scene.height);
      scene.objects.forEach((object) => renderBannerSceneObject(context, object, elapsedMs, imageCache));
      if (elapsedMs < totalDuration) {
        profileUi.profileBannerAnimationFrame = window.requestAnimationFrame(tick);
      } else {
        stopProfileBannerAnimation();
      }
    };
    profileUi.profileBannerAnimationFrame = window.requestAnimationFrame(tick);
  };
  if (!imageObjects.length) {
    beginPlayback();
    return;
  }
  imageObjects.forEach((object) => {
    const image = new Image();
    image.onload = image.onerror = () => {
      loadedImages += 1;
      imageCache.set(object.id, image);
      if (loadedImages >= imageObjects.length) {
        beginPlayback();
      }
    };
    image.src = object.src;
  });
}

function mergeCloudProfileShape(profile = {}) {
  const banner = profile.profileTheme?.banner && typeof profile.profileTheme.banner === 'object'
    ? profile.profileTheme.banner
    : {};
  const customBanners = Array.isArray(profile.profileTheme?.customBanners) ? profile.profileTheme.customBanners : [];
  const mailboxEntries = Array.isArray(profile?.mailbox) ? profile.mailbox : [];
  const highestStaffRole = getHighestStaffRoleFromRoles(profile?.roles || []);
  const favoriteGame = profile.activity?.favoriteGameTitle || '';
  const isVip = Boolean(profile?.isVip)
    || (Array.isArray(profile?.roles) && profile.roles.includes('vip'))
    || normalizeTimestampToMs(profile?.progression?.referral?.vipExpiresAt) > Date.now();
  const normalizedCustomBanners = customBanners
    .map((entry) => entry && typeof entry === 'object' ? {
      id: String(entry.id || '').trim(),
      label: String(entry.label || 'Custom banner').trim() || 'Custom banner',
      dataUrl: String(entry.dataUrl || '').trim(),
      width: Math.max(1, Number(entry.width) || 0),
      height: Math.max(1, Number(entry.height) || 0),
      animated: Boolean(entry.animated),
      scene: normalizeBannerScene(entry.scene),
      createdAt: normalizeTimestampToMs(entry.createdAt),
      updatedAt: normalizeTimestampToMs(entry.updatedAt),
    } : null)
    .filter((entry) => entry && entry.id && entry.dataUrl)
    .slice(0, CUSTOM_PROFILE_BANNER_LIMIT);
  const safeBannerType = ['solid', 'gradient', 'vip-custom'].includes(String(banner.type || '').trim()) ? String(banner.type).trim() : getDefaultProfileBanner().type;
  const resolvedBanner = {
    type: safeBannerType,
    value: String(banner.value || getDefaultProfileBanner().value).trim() || getDefaultProfileBanner().value,
    label: String(banner.label || getProfileBannerPresetByValue(banner.type, banner.value)?.label || getDefaultProfileBanner().label).trim(),
    customBannerId: String(banner.customBannerId || '').trim(),
    animated: Boolean(banner.animated),
    scene: normalizeBannerScene(banner.scene),
    updatedAt: normalizeTimestampToMs(banner.updatedAt),
  };
  return {
    ...profile,
    moderation: {
      warningCount: Math.max(0, Number(profile?.moderation?.warningCount) || 0),
      warnings: Array.isArray(profile?.moderation?.warnings) ? profile.moderation.warnings.slice(-PROFILE_WARNING_HISTORY_LIMIT) : [],
      mutedUntil: normalizeTimestampToMs(profile?.moderation?.mutedUntil),
      mutedPermanent: Boolean(profile?.moderation?.mutedPermanent),
      muteReason: String(profile?.moderation?.muteReason || '').trim(),
      ban: {
        active: Boolean(profile?.moderation?.ban?.active),
        permanent: Boolean(profile?.moderation?.ban?.permanent),
        reason: String(profile?.moderation?.ban?.reason || '').trim(),
        bannedAt: normalizeTimestampToMs(profile?.moderation?.ban?.bannedAt),
        expiresAt: normalizeTimestampToMs(profile?.moderation?.ban?.expiresAt),
        bannedByUid: String(profile?.moderation?.ban?.bannedByUid || '').trim(),
        bannedByName: String(profile?.moderation?.ban?.bannedByName || '').trim(),
      },
    },
    staff: {
      role: highestStaffRole,
      promotedByUid: String(profile?.staff?.promotedByUid || '').trim(),
      promotedByName: String(profile?.staff?.promotedByName || '').trim(),
      promotedAt: normalizeTimestampToMs(profile?.staff?.promotedAt),
      promotionCooldownUntil: normalizeTimestampToMs(profile?.staff?.promotionCooldownUntil),
      history: Array.isArray(profile?.staff?.history)
        ? profile.staff.history
          .map((entry) => entry && typeof entry === 'object' ? {
            fromRole: normalizeRoleName(entry.fromRole),
            toRole: normalizeRoleName(entry.toRole),
            action: String(entry.action || 'promote').trim(),
            byUid: String(entry.byUid || '').trim(),
            byName: String(entry.byName || '').trim(),
            createdAt: normalizeTimestampToMs(entry.createdAt),
          } : null)
          .filter(Boolean)
          .slice(-20)
        : [],
    },
    activity: {
      ...(profile.activity && typeof profile.activity === 'object' ? profile.activity : {}),
      favoriteGameTitle: String(favoriteGame || '').trim(),
      favoriteGameSeconds: Math.max(0, Number(profile?.activity?.favoriteGameSeconds) || 0),
    },
    profileTheme: {
      banner: resolvedBanner.type === 'vip-custom' && !isVip
        ? { ...getDefaultProfileBanner(), customBannerId: '', updatedAt: resolvedBanner.updatedAt }
        : resolvedBanner,
      customBanners: normalizedCustomBanners,
    },
    mailbox: mailboxEntries
      .map((entry) => entry && typeof entry === 'object' ? {
        id: String(entry.id || '').trim(),
        subject: String(entry.subject || '').trim(),
        body: String(entry.body || '').trim(),
        type: String(entry.type || '').trim(),
        category: String(entry.category || '').trim(),
        createdAt: normalizeTimestampToMs(entry.createdAt),
        actorUid: String(entry.actorUid || '').trim(),
        actorName: String(entry.actorName || '').trim(),
        targetUid: String(entry.targetUid || '').trim(),
        targetName: String(entry.targetName || '').trim(),
      } : null)
      .filter(Boolean)
      .slice(0, 50),
  };
}

async function resolveUserProfileRecord(target = {}) {
  const normalizedName = normalizeDisplayNameForLookup(target.displayName || target.normalizedDisplayName || '');
  const uid = String(target.uid || '').trim();
  const cached = getCachedProfileEntry({ uid, displayName: normalizedName });
  if (cached?.profile) {
    return cached.profile;
  }

  if (uid && authState.profiles[uid]) {
    const localProfile = mergeCloudProfileShape(authState.profiles[uid]);
    cacheResolvedProfile(localProfile);
    return localProfile;
  }

  const currentAccount = getCurrentAccount();
  if (currentAccount?.uid && (
    (uid && uid === currentAccount.uid)
    || (normalizedName && normalizeDisplayNameForLookup(currentAccount.displayName || '') === normalizedName)
  )) {
    const localProfile = mergeCloudProfileShape(authState.profiles[currentAccount.uid] || currentAccount);
    cacheResolvedProfile(localProfile);
    return localProfile;
  }

  if (!firebaseDb) {
    const localByName = normalizedName ? findProfileByDisplayName(normalizedName) : null;
    const fallback = localByName ? mergeCloudProfileShape(localByName) : null;
    if (fallback) cacheResolvedProfile(fallback);
    return fallback;
  }

  let resolvedUid = uid;
  if (!resolvedUid && normalizedName) {
    const nameSnapshot = await firebaseDb.collection(DISPLAY_NAME_COLLECTION).doc(normalizedName).get();
    if (nameSnapshot.exists) {
      resolvedUid = String(nameSnapshot.data()?.uid || '').trim();
    }
  }

  if (!resolvedUid) {
    const fallback = normalizedName ? findProfileByDisplayName(normalizedName) : null;
    const merged = fallback ? mergeCloudProfileShape(fallback) : null;
    if (merged) cacheResolvedProfile(merged);
    return merged;
  }

  const profileSnapshot = await firebaseDb.collection(USER_PROFILE_COLLECTION).doc(resolvedUid).get();
  const remoteProfile = profileSnapshot.exists
    ? mergeCloudProfileShape({ uid: resolvedUid, ...(profileSnapshot.data() || {}) })
    : mergeCloudProfileShape({ uid: resolvedUid, displayName: target.displayName || 'Player' });
  cacheProfileLocally(remoteProfile);
  cacheResolvedProfile(remoteProfile);
  return remoteProfile;
}

async function ensureCloudLevelsCache() {
  await refreshCloudLeaderboardProfiles();
  return Object.values(authState.profiles)
    .filter((profile) => profile && typeof profile === 'object' && !Boolean(profile?.moderation?.ban?.active))
    .map((profile) => mergeCloudProfileShape(profile));
}

async function computeXpLeaderboardRankForProfile(profile) {
  if (!profile) return 0;
  const uid = String(profile.uid || '').trim();
  const displayName = normalizeDisplayNameForLookup(profile.displayName || '');
  const entries = await ensureCloudLevelsCache();
  const ranked = entries
    .filter((entry) => entry && String(entry.displayName || '').trim())
    .sort((left, right) => {
      const xpDiff = Math.max(0, Number(right?.progression?.xp) || 0) - Math.max(0, Number(left?.progression?.xp) || 0);
      if (xpDiff !== 0) return xpDiff;
      return normalizeDisplayNameForLookup(left.displayName || '').localeCompare(normalizeDisplayNameForLookup(right.displayName || ''));
    });
  const index = ranked.findIndex((entry) => {
    if (uid && String(entry.uid || '').trim() === uid) return true;
    return displayName && normalizeDisplayNameForLookup(entry.displayName || '') === displayName;
  });
  return index >= 0 ? index + 1 : 0;
}

function getCurrentRelationshipStatus(targetUid) {
  const safeUid = String(targetUid || '').trim();
  if (!safeUid) return 'none';
  if (socialState.friendDocs[safeUid]) return 'friends';
  if (socialState.outgoingRequests[safeUid]) return 'outgoing';
  if (socialState.incomingRequests[safeUid]) return 'incoming';
  return 'none';
}

function closeFriendsSubscriptions() {
  ['friendshipsUnsub', 'incomingUnsub', 'outgoingUnsub'].forEach((key) => {
    if (typeof socialState[key] === 'function') {
      socialState[key]();
    }
    socialState[key] = null;
  });
  socialState.loadedAt = 0;
}

function updateFriendsBell() {
  if (!profileUi.friendsUnreadDot) return;
  const unreadCount = Object.keys(socialState.incomingRequests || {}).length;
  profileUi.friendsUnreadDot.hidden = unreadCount === 0;
}

function setFriendsTab(tabId = 'friends') {
  const safeTab = ['friends', 'incoming', 'outgoing'].includes(String(tabId || '').trim())
    ? String(tabId || '').trim()
    : 'friends';
  socialState.activeTab = safeTab;
  if (profileUi.friendsTabs) {
    profileUi.friendsTabs.querySelectorAll('[data-friends-tab]').forEach((button) => {
      const isActive = button.getAttribute('data-friends-tab') === safeTab;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }
  if (profileUi.friendsOverlay) {
    profileUi.friendsOverlay.querySelectorAll('[data-friends-panel]').forEach((panel) => {
      panel.hidden = panel.getAttribute('data-friends-panel') !== safeTab;
    });
  }
}

function buildSocialIconButton({ action = '', targetUid = '', label = '', glyph = '', tone = 'secondary' } = {}) {
  return `<button class="social-icon-btn social-icon-btn-${escapeHtml(tone)}" type="button" data-social-action="${escapeHtml(action)}" data-social-target="${escapeHtml(targetUid)}" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">${escapeHtml(glyph)}</button>`;
}

function renderProfileBadgeSection(profile) {
  if (!profileUi.profileBadgeList) return;
  const progressionApi = window.PlayrProgression;
  const snapshot = progressionApi && typeof progressionApi.getProgressionSnapshot === 'function'
    ? progressionApi.getProgressionSnapshot(profile, profile)
    : null;
  const visibleBadges = Array.isArray(snapshot?.badges) ? snapshot.badges : [];
  const profileBadges = visibleBadges.filter((badge) => {
    const badgeId = String(badge?.id || '').trim();
    return badgeId
      && badgeId !== 'owner'
      && badgeId !== 'vip'
      && badgeId !== 'support'
      && badgeId !== 'moderator'
      && badgeId !== 'admin'
      && !badgeId.startsWith('donation-');
  });
  if (!profileBadges.length) {
    profileUi.profileBadgeList.innerHTML = '<p class="settings-muted">No extra profile tags equipped.</p>';
    return;
  }
  const badgeMarkup = profileBadges
    .map((badge) => window.PlayrProgression?.formatBadgeMarkup ? window.PlayrProgression.formatBadgeMarkup(badge) : `<span class="profile-pill">${escapeHtml(badge.label || badge.id || 'Tag')}</span>`)
    .join('');
  profileUi.profileBadgeList.innerHTML = `
    <p class="eyebrow">Profile Tags</p>
    <div class="profile-tag-stack">${badgeMarkup}</div>
  `;
}

function renderFriendsPanel() {
  if (!profileUi.friendsList || !profileUi.friendsIncoming || !profileUi.friendsOutgoing) return;

  const friendEntries = Object.values(socialState.friendDocs || {})
    .sort((left, right) => String(left.displayName || '').localeCompare(String(right.displayName || '')));
  const incomingEntries = Object.values(socialState.incomingRequests || {})
    .sort((left, right) => normalizeTimestampToMs(right.createdAt) - normalizeTimestampToMs(left.createdAt));
  const outgoingEntries = Object.values(socialState.outgoingRequests || {})
    .sort((left, right) => normalizeTimestampToMs(right.createdAt) - normalizeTimestampToMs(left.createdAt));

  profileUi.friendsList.innerHTML = friendEntries.length
    ? friendEntries.map((entry) => `
        <article class="social-row">
          <div class="social-row-copy">
            <button class="social-name-button" type="button" data-open-profile-uid="${escapeHtml(entry.uid)}" data-open-profile-name="${escapeHtml(entry.displayName || 'Player')}">
              ${formatPlayerIdentityMarkup(entry.displayName || 'Player', { record: findProfileByDisplayName(entry.displayName || '') || authState.profiles[entry.uid] || { uid: entry.uid, displayName: entry.displayName || 'Player' }, compact: true })}
            </button>
            <span class="social-meta">Friends since ${formatProfileDate(entry.createdAt)}</span>
          </div>
          <div class="social-actions">
            ${buildSocialIconButton({ action: 'unfriend', targetUid: entry.uid, label: `Unfriend ${entry.displayName || 'player'}`, glyph: '⊗', tone: 'danger' })}
          </div>
        </article>
      `).join('')
    : '<p class="settings-muted">No friends added yet.</p>';

  profileUi.friendsIncoming.innerHTML = incomingEntries.length
    ? incomingEntries.map((entry) => `
        <article class="social-row">
          <div class="social-row-copy">
            <button class="social-name-button" type="button" data-open-profile-uid="${escapeHtml(entry.uid)}" data-open-profile-name="${escapeHtml(entry.displayName || 'Player')}">
              ${formatPlayerIdentityMarkup(entry.displayName || 'Player', { record: authState.profiles[entry.uid] || { uid: entry.uid, displayName: entry.displayName || 'Player' }, compact: true })}
            </button>
          </div>
          <div class="social-actions">
            ${buildSocialIconButton({ action: 'accept-request', targetUid: entry.uid, label: `Accept ${entry.displayName || 'request'}`, glyph: '✓', tone: 'primary' })}
            ${buildSocialIconButton({ action: 'reject-request', targetUid: entry.uid, label: `Decline ${entry.displayName || 'request'}`, glyph: '✕', tone: 'danger' })}
          </div>
        </article>
      `).join('')
    : '<p class="settings-muted">No incoming requests.</p>';

  profileUi.friendsOutgoing.innerHTML = outgoingEntries.length
    ? outgoingEntries.map((entry) => `
        <article class="social-row">
          <div class="social-row-copy">
            <button class="social-name-button" type="button" data-open-profile-uid="${escapeHtml(entry.uid)}" data-open-profile-name="${escapeHtml(entry.displayName || 'Player')}">
              ${formatPlayerIdentityMarkup(entry.displayName || 'Player', { record: authState.profiles[entry.uid] || { uid: entry.uid, displayName: entry.displayName || 'Player' }, compact: true })}
            </button>
            <span class="social-meta">Pending</span>
          </div>
          <div class="social-actions">
            ${buildSocialIconButton({ action: 'cancel-request', targetUid: entry.uid, label: `Cancel request to ${entry.displayName || 'player'}`, glyph: '⊗', tone: 'danger' })}
          </div>
        </article>
      `).join('')
    : '<p class="settings-muted">No outgoing requests.</p>';

  setFriendsTab(socialState.activeTab || 'friends');
  updateFriendsBell();
}

function subscribeFriendsData() {
  const account = getCurrentAccount();
  if (!firebaseDb || !account?.uid) {
    closeFriendsSubscriptions();
    socialState.friendDocs = {};
    socialState.incomingRequests = {};
    socialState.outgoingRequests = {};
    renderFriendsPanel();
    return;
  }

  if (
    socialState.friendshipsUnsub
    && socialState.incomingUnsub
    && socialState.outgoingUnsub
    && (Date.now() - socialState.loadedAt) < SOCIAL_CACHE_TTL_MS
  ) {
    renderFriendsPanel();
    return;
  }

  closeFriendsSubscriptions();
  socialState.loadedAt = Date.now();

  socialState.friendshipsUnsub = firebaseDb.collection(FRIENDSHIPS_COLLECTION)
    .where('participants', 'array-contains', account.uid)
    .onSnapshot((snapshot) => {
      const next = {};
      snapshot.forEach((doc) => {
        const data = doc.data() || {};
        const participants = Array.isArray(data.participants) ? data.participants : [];
        const otherUid = participants.find((uid) => uid !== account.uid) || '';
        if (!otherUid) return;
        const names = data.participantNames && typeof data.participantNames === 'object' ? data.participantNames : {};
        next[otherUid] = {
          uid: otherUid,
          displayName: String(names[otherUid] || authState.profiles[otherUid]?.displayName || 'Player').trim(),
          createdAt: data.createdAt || data.updatedAt || 0,
          raw: data,
        };
      });
      socialState.friendDocs = next;
      renderFriendsPanel();
      if (!profileUi.profileOverlay?.hidden) {
        void renderOpenProfilePanel();
      }
    }, () => {});

  socialState.incomingUnsub = firebaseDb.collection(FRIEND_REQUESTS_COLLECTION)
    .where('recipientUid', '==', account.uid)
    .onSnapshot((snapshot) => {
      const next = {};
      snapshot.forEach((doc) => {
        const data = doc.data() || {};
        if (String(data.status || '') !== 'pending') return;
        const senderUid = String(data.senderUid || '').trim();
        if (!senderUid) return;
        next[senderUid] = {
          uid: senderUid,
          displayName: String(data.senderName || authState.profiles[senderUid]?.displayName || 'Player').trim(),
          createdAt: data.createdAt || 0,
          raw: data,
        };
      });
      socialState.incomingRequests = next;
      renderFriendsPanel();
      if (!profileUi.profileOverlay?.hidden) {
        void renderOpenProfilePanel();
      }
    }, () => {});

  socialState.outgoingUnsub = firebaseDb.collection(FRIEND_REQUESTS_COLLECTION)
    .where('senderUid', '==', account.uid)
    .onSnapshot((snapshot) => {
      const next = {};
      snapshot.forEach((doc) => {
        const data = doc.data() || {};
        if (String(data.status || '') !== 'pending') return;
        const recipientUid = String(data.recipientUid || '').trim();
        if (!recipientUid) return;
        next[recipientUid] = {
          uid: recipientUid,
          displayName: String(data.recipientName || authState.profiles[recipientUid]?.displayName || 'Player').trim(),
          createdAt: data.createdAt || 0,
          raw: data,
        };
      });
      socialState.outgoingRequests = next;
      renderFriendsPanel();
      if (!profileUi.profileOverlay?.hidden) {
        void renderOpenProfilePanel();
      }
    }, () => {});
}

async function sendFriendRequestByProfile(targetProfile) {
  const account = getCurrentAccount();
  if (!firebaseDb || !account?.uid) {
    setAuthMode('login');
    openAuthOverlay('Log in to add friends.');
    return;
  }
  if (!canCurrentAccountInteract(account)) {
    setSettingsStatus('This account cannot send friend requests right now.', 'danger');
    return;
  }

  const targetUid = String(targetProfile?.uid || '').trim();
  const targetName = String(targetProfile?.displayName || '').trim();
  if (!targetUid || !targetName) {
    setProfilePanelStatus('Could not find that player profile right now.', 'danger');
    return;
  }
  if (targetUid === account.uid) {
    setProfilePanelStatus('You cannot add yourself.', 'info');
    return;
  }
  if (getCurrentRelationshipStatus(targetUid) === 'friends') {
    setProfilePanelStatus('You are already friends.', 'info');
    return;
  }
  if (getCurrentRelationshipStatus(targetUid) === 'outgoing') {
    setProfilePanelStatus('Friend request already sent.', 'info');
    return;
  }

  const requestId = normalizeFriendshipId(account.uid, targetUid);
  const timestamp = window.firebase.firestore.FieldValue.serverTimestamp();
  await firebaseDb.collection(FRIEND_REQUESTS_COLLECTION).doc(requestId).set({
    senderUid: account.uid,
    senderName: account.displayName,
    recipientUid: targetUid,
    recipientName: targetName,
    status: 'pending',
    createdAt: timestamp,
    updatedAt: timestamp,
  }, { merge: true });
  setProfilePanelStatus(`Friend request sent to ${targetName}.`, 'success');
}

async function respondToFriendRequest(otherUid, action) {
  const account = getCurrentAccount();
  const safeOtherUid = String(otherUid || '').trim();
  if (!firebaseDb || !account?.uid || !safeOtherUid) return;
  const requestId = normalizeFriendshipId(account.uid, safeOtherUid);
  const requestRef = firebaseDb.collection(FRIEND_REQUESTS_COLLECTION).doc(requestId);
  const friendshipRef = firebaseDb.collection(FRIENDSHIPS_COLLECTION).doc(requestId);
  const timestamp = window.firebase.firestore.FieldValue.serverTimestamp();

  if (action === 'accept') {
    const otherName = socialState.incomingRequests[safeOtherUid]?.displayName || authState.profiles[safeOtherUid]?.displayName || 'Player';
    const batch = firebaseDb.batch();
    batch.set(friendshipRef, {
      participants: [account.uid, safeOtherUid].sort(),
      participantNames: {
        [account.uid]: account.displayName,
        [safeOtherUid]: otherName,
      },
      createdByUid: account.uid,
      createdAt: timestamp,
      updatedAt: timestamp,
    }, { merge: true });
    batch.set(requestRef, {
      senderUid: safeOtherUid,
      recipientUid: account.uid,
      senderName: otherName,
      recipientName: account.displayName,
      status: 'accepted',
      respondedAt: timestamp,
      updatedAt: timestamp,
    }, { merge: true });
    await batch.commit();
    return;
  }

  await requestRef.set({
    status: action === 'cancel' ? 'cancelled' : 'rejected',
    updatedAt: timestamp,
    respondedAt: timestamp,
  }, { merge: true });
}

async function removeFriendshipWith(otherUid) {
  const account = getCurrentAccount();
  const safeOtherUid = String(otherUid || '').trim();
  if (!firebaseDb || !account?.uid || !safeOtherUid) return;
  const friendshipId = normalizeFriendshipId(account.uid, safeOtherUid);
  await firebaseDb.collection(FRIENDSHIPS_COLLECTION).doc(friendshipId).delete();
}

function setProfilePanelStatus(message, tone = 'info') {
  if (!profileUi.profileStatus) return;
  profileUi.profileStatus.textContent = message || '';
  profileUi.profileStatus.dataset.tone = tone;
}

function setFriendsPanelStatus(message, tone = 'info') {
  if (!profileUi.friendsStatus) return;
  profileUi.friendsStatus.textContent = message || '';
  profileUi.friendsStatus.dataset.tone = tone;
}

function ensureProfileAndFriendsUi() {
  if (profileUi.injected || typeof document === 'undefined' || !document.body) return;
  profileUi.injected = true;

  if (topbarControls && !document.getElementById('friendsBtn')) {
    const notificationsShell = topbarControls.querySelector('.notifications-shell');
    const shell = document.createElement('div');
    shell.className = 'friends-shell';
    shell.innerHTML = `
      <button class="chip-button notification-button friends-button" type="button" id="friendsBtn" aria-label="Open friends" aria-expanded="false" aria-haspopup="true">
        <span class="friends-button-glyph" aria-hidden="true">&#128101;<small>+</small></span>
        <span class="notification-dot" id="friendsUnreadDot" hidden></span>
      </button>
    `;
    if (notificationsShell) {
      topbarControls.insertBefore(shell, notificationsShell);
    } else {
      topbarControls.appendChild(shell);
    }
  }

  if (!document.getElementById('friendsOverlay')) {
    const overlay = document.createElement('div');
    overlay.className = 'friends-overlay';
    overlay.id = 'friendsOverlay';
    overlay.hidden = true;
    overlay.innerHTML = `
      <section class="friends-modal panel-card" role="dialog" aria-modal="true" aria-labelledby="friendsTitle">
        <div class="friends-modal-header">
          <div>
            <p class="eyebrow">Social</p>
            <h3 id="friendsTitle">Friends</h3>
          </div>
          <button class="chip-button" type="button" id="friendsCloseBtn">Close</button>
        </div>
        <div class="friends-add-row">
          <input class="auth-input" id="friendsAddInput" type="text" maxlength="24" placeholder="Add by display name" />
          <button class="button primary" type="button" id="friendsAddBtn">Add</button>
        </div>
        <p class="friends-status" id="friendsStatus"></p>
        <div class="friends-tabs" id="friendsTabs" role="tablist" aria-label="Friends sections">
          <button class="chip-button active" type="button" data-friends-tab="friends" aria-selected="true">Current Friends</button>
          <button class="chip-button" type="button" data-friends-tab="incoming" aria-selected="false">Incoming Requests</button>
          <button class="chip-button" type="button" data-friends-tab="outgoing" aria-selected="false">Outgoing Requests</button>
        </div>
        <div class="friends-sections">
          <section class="settings-card friends-panel-section" data-friends-panel="friends">
            <h4>Current Friends</h4>
            <div id="friendsList" class="social-list"></div>
          </section>
          <section class="settings-card friends-panel-section" data-friends-panel="incoming" hidden>
            <h4>Incoming Requests</h4>
            <div id="friendsIncoming" class="social-list"></div>
          </section>
          <section class="settings-card friends-panel-section" data-friends-panel="outgoing" hidden>
            <h4>Outgoing Requests</h4>
            <div id="friendsOutgoing" class="social-list"></div>
          </section>
        </div>
      </section>
    `;
    document.body.appendChild(overlay);
  }

  if (!document.getElementById('profileOverlay')) {
    const overlay = document.createElement('div');
    overlay.className = 'profile-overlay';
    overlay.id = 'profileOverlay';
    overlay.hidden = true;
    overlay.innerHTML = `
      <section class="profile-modal panel-card" role="dialog" aria-modal="true" aria-labelledby="profileName">
        <div class="profile-banner" id="profileBanner"></div>
        <div class="profile-modal-header">
          <div>
            <p class="eyebrow">Player Profile</p>
            <h3 id="profileName">Loading...</h3>
            <p class="settings-muted" id="profileMeta">Fetching profile...</p>
            <section class="profile-tag-panel" id="profileBadgeList"></section>
          </div>
          <div class="profile-header-actions" id="profileActionArea"></div>
          <button class="chip-button" type="button" id="profileCloseBtn">Close</button>
        </div>
        <p class="profile-status" id="profileStatus"></p>
        <div class="profile-stats-grid" id="profileStats"></div>
        <div class="profile-warning-chip" id="profileWarnings"></div>
        <section class="settings-card profile-moderation" id="profileModeration" hidden>
          <h4>Owner Moderation</h4>
          <p class="settings-muted profile-moderation-summary" id="profileModerationSummary">Choose an action to issue a warning, mute, or ban.</p>
          <div class="settings-inline-actions profile-moderation-actions">
            <button class="button secondary" type="button" id="profilePromoteBtn">Promote</button>
            <button class="button secondary" type="button" id="profileDemoteBtn">Demote</button>
            <button class="button secondary" type="button" id="profileWarnBtn">Warn</button>
            <button class="button secondary" type="button" id="profileMuteBtn">Mute</button>
            <button class="button primary" type="button" id="profileBanBtn">Ban</button>
            <button class="button secondary" type="button" id="profileUnmuteBtn">Unmute</button>
            <button class="button secondary" type="button" id="profileUnbanBtn">Unban</button>
          </div>
          <div class="profile-moderation-composer" id="profileModerationComposer" hidden>
            <h5 id="profileModerationTitle">Issue moderation action</h5>
            <select class="auth-input" id="profileModerationDuration">
              ${MODERATION_DURATION_PRESETS.map((preset) => `<option value="${escapeHtml(preset.id)}">${escapeHtml(preset.label)}</option>`).join('')}
            </select>
            <textarea class="auth-input profile-moderation-message" id="profileModerationMessage" rows="3" placeholder="Enter a reason"></textarea>
            <div class="settings-inline-actions">
              <button class="button secondary" type="button" id="profileComposeCancelBtn">Cancel</button>
              <button class="button primary" type="button" id="profileComposeSubmitBtn">Apply</button>
            </div>
          </div>
        </section>
      </section>
    `;
    document.body.appendChild(overlay);
  }

  if (!document.getElementById('profileCustomizeOverlay')) {
    const overlay = document.createElement('div');
    overlay.className = 'settings-overlay';
    overlay.id = 'profileCustomizeOverlay';
    overlay.hidden = true;
    overlay.innerHTML = `
      <section class="settings-modal panel-card" role="dialog" aria-modal="true" aria-labelledby="profileCustomizeTitle">
        <div class="settings-modal-header">
          <div>
            <p class="eyebrow">Profile customization</p>
            <h3 id="profileCustomizeTitle">Customize your profile</h3>
          </div>
          <button class="chip-button" type="button" id="profileCustomizeCloseBtn">Close</button>
        </div>
        <div class="settings-grid profile-customize-grid">
          <section class="settings-card">
            <h4>Display tags</h4>
            <p class="settings-muted" id="profileCustomizeBadgeSummary">0/5 extra badges equipped. Level is always shown by default.</p>
            <div class="settings-tag-list" id="profileCustomizeBadgeList"></div>
          </section>
          <section class="settings-card">
            <h4>Profile banner</h4>
            <p class="settings-muted">Pick a solid or gradient banner for your profile panel. Custom banners can be created in Draw It, but only VIP accounts can apply them.</p>
            <div class="banner-picker-grid" id="profileCustomizeBannerGrid"></div>
            <div class="settings-card profile-custom-banner-card">
              <h4>Custom banners</h4>
              <p class="settings-muted">Saved to your account. You can keep up to 5 custom banners and delete old ones here when you need space.</p>
              <div class="social-list" id="profileCustomizeCustomBannerList"></div>
            </div>
          </section>
        </div>
        <p class="auth-status" id="profileCustomizeStatus"></p>
      </section>
    `;
    document.body.appendChild(overlay);
  }

  if (!document.getElementById('vipBannerUpsellOverlay')) {
    const overlay = document.createElement('div');
    overlay.className = 'profile-overlay';
    overlay.id = 'vipBannerUpsellOverlay';
    overlay.hidden = true;
    overlay.innerHTML = `
      <section class="profile-modal panel-card vip-banner-upsell-modal" role="dialog" aria-modal="true" aria-labelledby="vipBannerUpsellTitle">
        <div class="vip-banner-upsell-preview" id="vipBannerUpsellPreview"></div>
        <div class="profile-modal-header">
          <div>
            <p class="eyebrow">VIP Custom Banners</p>
            <h3 id="vipBannerUpsellTitle">This is a VIP option only!</h3>
            <p class="settings-muted">You are basically there. Unlock VIP to apply this banner to your profile.</p>
          </div>
          <button class="chip-button" type="button" id="vipBannerUpsellCloseBtn">Close</button>
        </div>
        <div class="profile-stats-grid vip-banner-upsell-grid">
          <div class="profile-stat-card">
            <span>Referral Progress</span>
            <strong id="vipBannerUpsellProgressLabel">0 / 25 referrals</strong>
            <div class="vip-banner-progress-track">
              <div class="vip-banner-progress-fill" id="vipBannerUpsellProgressBar"></div>
            </div>
          </div>
          <div class="profile-stat-card">
            <span>How to get VIP</span>
            <strong>Reach 25 qualified referrals</strong>
            <p class="settings-muted">Custom banners are saved for everyone, but only VIP accounts can actively use them. Animated banners and GIF exports can layer into this later.</p>
          </div>
        </div>
      </section>
    `;
    document.body.appendChild(overlay);
  }

  profileUi.friendsBtn = document.getElementById('friendsBtn');
  profileUi.friendsUnreadDot = document.getElementById('friendsUnreadDot');
  profileUi.friendsOverlay = document.getElementById('friendsOverlay');
  profileUi.friendsCloseBtn = document.getElementById('friendsCloseBtn');
  profileUi.friendsStatus = document.getElementById('friendsStatus');
  profileUi.friendsTabs = document.getElementById('friendsTabs');
  profileUi.friendsList = document.getElementById('friendsList');
  profileUi.friendsIncoming = document.getElementById('friendsIncoming');
  profileUi.friendsOutgoing = document.getElementById('friendsOutgoing');
  profileUi.friendsAddInput = document.getElementById('friendsAddInput');
  profileUi.friendsAddBtn = document.getElementById('friendsAddBtn');
  profileUi.profileOverlay = document.getElementById('profileOverlay');
  profileUi.profileCloseBtn = document.getElementById('profileCloseBtn');
  profileUi.profileBanner = document.getElementById('profileBanner');
  profileUi.profileName = document.getElementById('profileName');
  profileUi.profileMeta = document.getElementById('profileMeta');
  profileUi.profileStats = document.getElementById('profileStats');
  profileUi.profileWarnings = document.getElementById('profileWarnings');
  profileUi.profileStatus = document.getElementById('profileStatus');
  profileUi.profileActionArea = document.getElementById('profileActionArea');
  profileUi.profileBadgeList = document.getElementById('profileBadgeList');
  profileUi.profileModeration = document.getElementById('profileModeration');
  profileUi.profileModerationComposer = document.getElementById('profileModerationComposer');
  profileUi.profileModerationSummary = document.getElementById('profileModerationSummary');
  profileUi.profileModerationTitle = document.getElementById('profileModerationTitle');
  profileUi.profileModerationMessage = document.getElementById('profileModerationMessage');
  profileUi.profileModerationDuration = document.getElementById('profileModerationDuration');
  profileUi.profilePromoteBtn = document.getElementById('profilePromoteBtn');
  profileUi.profileDemoteBtn = document.getElementById('profileDemoteBtn');
  profileUi.profileWarnBtn = document.getElementById('profileWarnBtn');
  profileUi.profileMuteBtn = document.getElementById('profileMuteBtn');
  profileUi.profileBanBtn = document.getElementById('profileBanBtn');
  profileUi.profileComposeCancelBtn = document.getElementById('profileComposeCancelBtn');
  profileUi.profileComposeSubmitBtn = document.getElementById('profileComposeSubmitBtn');
  profileUi.profileUnmuteBtn = document.getElementById('profileUnmuteBtn');
  profileUi.profileUnbanBtn = document.getElementById('profileUnbanBtn');
  profileUi.vipBannerUpsellOverlay = document.getElementById('vipBannerUpsellOverlay');
  profileUi.vipBannerUpsellPreview = document.getElementById('vipBannerUpsellPreview');
  profileUi.vipBannerUpsellProgressBar = document.getElementById('vipBannerUpsellProgressBar');
  profileUi.vipBannerUpsellProgressLabel = document.getElementById('vipBannerUpsellProgressLabel');
  profileUi.vipBannerUpsellCloseBtn = document.getElementById('vipBannerUpsellCloseBtn');
  profileUi.profileCustomizeOverlay = document.getElementById('profileCustomizeOverlay');
  profileUi.profileCustomizeCloseBtn = document.getElementById('profileCustomizeCloseBtn');
  profileUi.profileCustomizeStatus = document.getElementById('profileCustomizeStatus');
  profileUi.profileCustomizeBadgeSummary = document.getElementById('profileCustomizeBadgeSummary');
  profileUi.profileCustomizeBadgeList = document.getElementById('profileCustomizeBadgeList');
  profileUi.profileCustomizeBannerGrid = document.getElementById('profileCustomizeBannerGrid');
  profileUi.profileCustomizeCustomBannerList = document.getElementById('profileCustomizeCustomBannerList');
  profileUi.settingsStaffDirectoryList = document.getElementById('settingsStaffDirectoryList');
}

function ensureBannerSettingsCard() {
  ensureProfileAndFriendsUi();
  if (!settingsGrid || profileUi.settingsBannerCard) return;
  const existingCard = document.getElementById('settingsBannerCard');
  if (existingCard) {
    profileUi.settingsBannerCard = existingCard;
    profileUi.settingsBannerGrid = null;
    profileUi.settingsCustomBannerList = null;
    return;
  }
  const card = document.createElement('section');
  card.className = 'settings-card';
  card.id = 'settingsBannerCard';
  card.innerHTML = `
    <h4>Profile customization settings are moved!</h4>
    <p class="settings-muted">Profile customization settings are moved! Now found when you look at your own profile</p>
  `;
  settingsGrid.appendChild(card);
  profileUi.settingsBannerCard = card;
  profileUi.settingsBannerGrid = null;
  profileUi.settingsCustomBannerList = null;
}

function ensureStaffDirectoryCard() {
  if (!settingsGrid || profileUi.settingsStaffDirectoryCard) return;
  const card = document.createElement('section');
  card.className = 'settings-card';
  card.id = 'settingsStaffDirectoryCard';
  card.hidden = true;
  card.innerHTML = `
    <h4>Staff directory</h4>
    <p class="settings-muted">Owner-only list of support, moderator, and admin users, including who promoted them and when.</p>
    <div class="social-list" id="settingsStaffDirectoryList"></div>
  `;
  settingsGrid.appendChild(card);
  profileUi.settingsStaffDirectoryCard = card;
  profileUi.settingsStaffDirectoryList = card.querySelector('#settingsStaffDirectoryList');
}

async function renderStaffDirectory(account = getCurrentAccount()) {
  ensureStaffDirectoryCard();
  if (!profileUi.settingsStaffDirectoryCard || !profileUi.settingsStaffDirectoryList) return;
  const isOwner = isOwnerAccount(account);
  profileUi.settingsStaffDirectoryCard.hidden = !isOwner;
  if (!isOwner) return;

  let profiles = Object.values(authState.profiles || {}).map((entry) => mergeCloudProfileShape(entry));
  if (firebaseDb) {
    const cloudStaffProfiles = await fetchCloudStaffProfiles();
    if (cloudStaffProfiles.length) {
      profiles = cloudStaffProfiles;
      profiles.forEach((profile) => cacheProfileLocally(profile, { persist: false }));
    }
  }

  const staffProfiles = profiles
    .filter((profile) => getProfilePrimaryRole(profile) && !isOwnerAccount(profile))
    .sort((left, right) => getRoleRank(getProfilePrimaryRole(right)) - getRoleRank(getProfilePrimaryRole(left))
      || String(left.displayName || '').localeCompare(String(right.displayName || '')));

  if (!staffProfiles.length) {
    profileUi.settingsStaffDirectoryList.innerHTML = '<p class="settings-muted">No staff users yet.</p>';
    return;
  }

  profileUi.settingsStaffDirectoryList.innerHTML = staffProfiles.map((profile) => `
    <article class="social-row">
      <div class="social-row-copy">
        <strong>${formatPlayerIdentityMarkup(profile.displayName || 'Player', { record: profile, compact: true })}</strong>
        <span class="social-meta">
          ${escapeHtml(getProfilePrimaryRole(profile))} • promoted by ${escapeHtml(profile?.staff?.promotedByName || 'Unknown')} on ${escapeHtml(formatProfileDate(profile?.staff?.promotedAt))}
        </span>
      </div>
    </article>
  `).join('');
}

function renderBannerSettingsInto(bannerGridEl, customBannerListEl, account = getCurrentAccount()) {
  if (!bannerGridEl) return;
  authState.profiles = readStoredProfiles();
  const profile = getEditableCurrentProfile(account);
  const activeBanner = profile.profileTheme.banner;
  const customBanners = getCustomProfileBanners(profile);
  bannerGridEl.innerHTML = PROFILE_BANNER_PRESETS.map((preset) => {
    const active = preset.type === activeBanner.type && preset.value === activeBanner.value;
    const style = preset.type === 'solid'
      ? `background:${preset.value};`
      : `background:${preset.value};`;
    return `
      <button class="banner-swatch${active ? ' is-active' : ''}" type="button" data-banner-preset="${escapeHtml(preset.id)}" aria-pressed="${active ? 'true' : 'false'}">
        <span class="banner-swatch-preview" style="${style}"></span>
        <span>${escapeHtml(preset.label)}</span>
      </button>
    `;
  }).join('');

  if (!customBannerListEl) return;
  if (!customBanners.length) {
    customBannerListEl.innerHTML = '<p class="settings-muted">No custom banners saved yet. Use Draw It to create one. If you just saved one, give this panel a moment to refresh or reopen it.</p>';
    return;
  }
  customBannerListEl.innerHTML = customBanners.map((banner) => {
    const active = activeBanner.type === 'vip-custom' && activeBanner.customBannerId === banner.id;
    const applyLabel = isCurrentAccountVip(account) ? (active ? 'Applied' : 'Apply') : 'VIP only';
    return `
      <div class="social-row profile-custom-banner-row">
        <div>
          <strong>${escapeHtml(banner.label)}</strong>
          <p class="social-meta">${escapeHtml(`${banner.width}x${banner.height}`)}</p>
        </div>
        <div class="social-actions">
          <div class="profile-custom-banner-preview" style="background-image:url('${escapeHtml(banner.dataUrl)}')"></div>
          <button class="button secondary" type="button" data-apply-custom-banner="${escapeHtml(banner.id)}">${escapeHtml(applyLabel)}</button>
          <button class="button secondary" type="button" data-delete-custom-banner="${escapeHtml(banner.id)}">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderBannerSettings(account = getCurrentAccount()) {
  ensureBannerSettingsCard();
}

function renderProfileCustomizationBannerSettings(account = getCurrentAccount()) {
  renderBannerSettingsInto(profileUi.profileCustomizeBannerGrid, profileUi.profileCustomizeCustomBannerList, account);
}

function applySelectedBannerPreset(presetId) {
  const account = getCurrentAccount();
  if (!account?.uid) {
    setProfileCustomizationMessage('Log in to update your profile banner.', 'danger');
    return;
  }
  const preset = PROFILE_BANNER_PRESETS.find((entry) => entry.id === String(presetId || '').trim());
  if (!preset) {
    setProfileCustomizationMessage('That banner preset is unavailable.', 'danger');
    return;
  }
  void persistProfileThemeUpdate(account, {
    banner: {
      type: preset.type,
      value: preset.value,
      label: preset.label,
      customBannerId: '',
      updatedAt: Date.now(),
    },
  }, 'Profile banner updated.');
}

async function persistProfileThemeUpdate(account, nextTheme, successMessage = 'Profile banner updated.') {
  if (!account?.uid) return false;
  const profile = getEditableCurrentProfile(account);
  if (Array.isArray(nextTheme?.customBanners) && window.PlayrProgression?.replaceStoredCustomBanners) {
    const storeResult = window.PlayrProgression.replaceStoredCustomBanners(nextTheme.customBanners, account);
    if (!storeResult?.ok) {
      setProfileCustomizationMessage(storeResult?.reason || 'That banner image could not be saved.', 'danger');
      return false;
    }
    nextTheme = {
      ...nextTheme,
      customBanners: Array.isArray(storeResult.entries) ? storeResult.entries : nextTheme.customBanners,
    };
  }
  profile.profileTheme = {
    ...(profile.profileTheme && typeof profile.profileTheme === 'object' ? profile.profileTheme : {}),
    ...nextTheme,
  };
  cacheProfileLocally(profile);
  cacheResolvedProfile(profile);
  if (window.PlayrProgression?.importProfile) {
    window.PlayrProgression.importProfile(account, profile, { prefer: 'remote', emit: true });
  }
  renderProfileCustomizationPanel(account);
  window.dispatchEvent(new CustomEvent('playr-profiles-updated', {
    detail: { uid: account.uid },
  }));
  await syncCurrentAccountProfileToFirestore({ immediate: true });
  setProfileCustomizationMessage(successMessage, 'success');
  return true;
}

function applySavedCustomBanner(customBannerId) {
  const account = getCurrentAccount();
  if (!account?.uid) {
    setProfileCustomizationMessage('Log in to update your profile banner.', 'danger');
    return;
  }
  const profile = getEditableCurrentProfile(account);
  const customBanner = getCustomProfileBanners(profile).find((entry) => entry.id === String(customBannerId || '').trim());
  if (!customBanner) {
    setProfileCustomizationMessage('That custom banner could not be found.', 'danger');
    return;
  }
  if (!isCurrentAccountVip(account)) {
    openVipBannerUpsell(customBanner);
    setProfileCustomizationMessage('This is a VIP option only! Reach 25 qualified referrals to unlock VIP and use custom banners.', 'info');
    return;
  }
  void persistProfileThemeUpdate(account, {
    banner: {
      type: 'vip-custom',
      value: customBanner.dataUrl,
      label: customBanner.label,
      customBannerId: customBanner.id,
      animated: Boolean(customBanner.animated),
      scene: normalizeBannerScene(customBanner.scene),
      updatedAt: Date.now(),
    },
  }, 'Custom banner applied.');
}

function deleteSavedCustomBanner(customBannerId) {
  const account = getCurrentAccount();
  if (!account?.uid) {
    setProfileCustomizationMessage('Log in to manage custom banners.', 'danger');
    return;
  }
  const profile = getEditableCurrentProfile(account);
  const safeId = String(customBannerId || '').trim();
  const nextCustomBanners = getCustomProfileBanners(profile).filter((entry) => entry.id !== safeId);
  const nextBanner = profile.profileTheme.banner?.customBannerId === safeId
    ? { ...getDefaultProfileBanner(), customBannerId: '', updatedAt: Date.now() }
    : profile.profileTheme.banner;
  void persistProfileThemeUpdate(account, {
    banner: nextBanner,
    customBanners: nextCustomBanners,
  }, 'Custom banner removed.');
}

async function saveNewCustomBanner({ label = 'Custom banner', dataUrl = '', width = 0, height = 0, animated = false, scene = null } = {}) {
  const account = getCurrentAccount();
  if (!account?.uid) {
    return { ok: false, reason: 'Log in to save a custom banner.' };
  }
  if (!String(dataUrl || '').startsWith('data:image/')) {
    return { ok: false, reason: 'That banner image could not be saved.' };
  }
  const profile = getEditableCurrentProfile(account);
  const current = getCustomProfileBanners(profile);
  if (current.length >= CUSTOM_PROFILE_BANNER_LIMIT) {
    return { ok: false, reason: `You can save up to ${CUSTOM_PROFILE_BANNER_LIMIT} custom banners. Delete one in settings first.` };
  }
  const stamp = Date.now();
  const bannerEntry = {
    id: `custom-banner-${stamp}`,
    label: String(label || 'Custom banner').trim().slice(0, 32) || 'Custom banner',
    dataUrl: String(dataUrl || '').trim(),
    width: Math.max(1, Number(width) || PROFILE_BANNER_DRAW_SIZE.width),
    height: Math.max(1, Number(height) || PROFILE_BANNER_DRAW_SIZE.height),
    animated: Boolean(animated),
    scene: normalizeBannerScene(scene),
    createdAt: stamp,
    updatedAt: stamp,
  };
  const saved = await persistProfileThemeUpdate(account, {
    customBanners: [...current, bannerEntry],
  }, 'Custom banner saved to your account.');
  if (!saved) {
    return { ok: false, reason: 'That banner image could not be saved.' };
  }
  return { ok: true, banner: bannerEntry, vipRequired: !isCurrentAccountVip(account) };
}

function openFriendsPanel() {
  ensureProfileAndFriendsUi();
  if (!profileUi.friendsOverlay) return;
  if (!getCurrentAccount()) {
    setAuthMode('login');
    openAuthOverlay('Log in to use friends.');
    return;
  }
  profileUi.friendsOverlay.hidden = false;
  if (profileUi.friendsBtn) profileUi.friendsBtn.setAttribute('aria-expanded', 'true');
  setFriendsTab('friends');
  subscribeFriendsData();
  renderFriendsPanel();
  setFriendsPanelStatus('');
}

function closeFriendsPanel() {
  if (!profileUi.friendsOverlay) return;
  profileUi.friendsOverlay.hidden = true;
  if (profileUi.friendsBtn) profileUi.friendsBtn.setAttribute('aria-expanded', 'false');
  setFriendsPanelStatus('');
  if (profileUi.profileOverlay?.hidden) {
    closeFriendsSubscriptions();
  }
}

async function openProfilePanel(target = {}) {
  ensureProfileAndFriendsUi();
  if (!profileUi.profileOverlay) return;
  stopProfileBannerAnimation();
  profileUi.profileOverlay.hidden = false;
  profileUi.profileOverlay.dataset.profileUid = String(target.uid || '').trim();
  profileUi.profileOverlay.dataset.profileName = String(target.displayName || '').trim();
  profileUi.profileName.textContent = target.displayName || 'Loading...';
  profileUi.profileMeta.textContent = 'Fetching profile...';
  profileUi.profileStats.innerHTML = '<p class="settings-muted">Loading profile...</p>';
  profileUi.profileWarnings.textContent = '';
  if (profileUi.profileBadgeList) {
    profileUi.profileBadgeList.innerHTML = '';
  }
  profileUi.profileActionArea.innerHTML = '';
  profileUi.profileModeration.hidden = true;
  setProfilePanelStatus('');
  subscribeFriendsData();
  await renderOpenProfilePanel();
}

function closeProfilePanel() {
  if (!profileUi.profileOverlay) return;
  stopProfileBannerAnimation();
  profileUi.profileOverlay.hidden = true;
  profileUi.profileOverlay.dataset.profileUid = '';
  profileUi.profileOverlay.dataset.profileName = '';
  closeModerationComposer();
  setProfilePanelStatus('');
  if (profileUi.friendsOverlay?.hidden) {
    closeFriendsSubscriptions();
  }
}

async function renderOpenProfilePanel() {
  if (!profileUi.profileOverlay || profileUi.profileOverlay.hidden) return;
  const target = {
    uid: profileUi.profileOverlay.dataset.profileUid || '',
    displayName: profileUi.profileOverlay.dataset.profileName || '',
  };
  const profile = await resolveUserProfileRecord(target);
  if (!profile) {
    profileUi.profileMeta.textContent = 'Profile unavailable right now.';
    profileUi.profileStats.innerHTML = '<p class="settings-muted">Could not load this profile.</p>';
    if (profileUi.profileBadgeList) profileUi.profileBadgeList.innerHTML = '';
    return;
  }
  const merged = mergeCloudProfileShape(profile);
  cacheResolvedProfile(merged);
  const activeSeconds = Math.max(0, Number(merged?.progression?.totalActiveSeconds) || 0);
  const warningCount = Math.max(0, Number(merged?.moderation?.warningCount) || 0);
  const banner = merged?.profileTheme?.banner || getDefaultProfileBanner();
  const rank = await computeXpLeaderboardRankForProfile(merged);
  const relationship = getCurrentRelationshipStatus(merged.uid);
  const currentAccount = getCurrentAccount();
  const isSelf = Boolean(currentAccount?.uid && currentAccount.uid === merged.uid);
  const actorRole = getAccountPrimaryRole(currentAccount);
  const targetRole = getProfilePrimaryRole(merged);
  const staffToolsVisible = Boolean(currentAccount && !isSelf && (
    canActorWarnTarget(currentAccount, merged)
    || canActorMuteTarget(currentAccount, merged)
    || canActorBanTarget(currentAccount, merged)
    || canActorPromoteTarget(currentAccount, merged)
    || canActorDemoteTarget(currentAccount, merged)
  ));
  const isMuted = Boolean(merged?.moderation?.mutedPermanent) || normalizeTimestampToMs(merged?.moderation?.mutedUntil) > Date.now();
  const isBanned = Boolean(merged?.moderation?.ban?.active)
    && (Boolean(merged?.moderation?.ban?.permanent) || normalizeTimestampToMs(merged?.moderation?.ban?.expiresAt) > Date.now() || normalizeTimestampToMs(merged?.moderation?.ban?.expiresAt) === 0);

  profileUi.profileOverlay.dataset.profileUid = String(merged.uid || '').trim();
  profileUi.profileOverlay.dataset.profileName = merged.displayName || '';
  profileUi.profileName.innerHTML = window.PlayrProgression?.formatIdentityMarkup
    ? window.PlayrProgression.formatIdentityMarkup(merged.displayName || 'Player', { record: merged, profile: merged, showBadges: false })
    : escapeHtml(merged.displayName || 'Player');
  const statusBits = [`Joined ${formatProfileDate(merged.createdAt)}`];
  if (targetRole) {
    statusBits.push(targetRole === 'support' ? 'Support staff' : targetRole === 'moderator' ? 'Moderator' : targetRole === 'admin' ? 'Admin' : 'Owner');
  }
  if (isBanned) {
    statusBits.push(merged?.moderation?.ban?.permanent ? 'Permanently banned' : `Banned until ${formatModerationExpiry(merged?.moderation?.ban?.expiresAt)}`);
  }
  if (isMuted) {
    statusBits.push(merged?.moderation?.mutedPermanent ? 'Permanently muted' : `Muted until ${formatModerationExpiry(merged?.moderation?.mutedUntil)}`);
  }
  profileUi.profileMeta.textContent = statusBits.join(' • ');
  applyBannerStyleToElement(profileUi.profileBanner, banner);
  startProfileBannerAnimation(profileUi.profileBanner, banner);
  profileUi.profileStats.innerHTML = `
    <div class="profile-stat-card">
      <span>Favourite Game</span>
      <strong>${escapeHtml(merged?.activity?.favoriteGameTitle || 'No active game data yet')}</strong>
    </div>
    <div class="profile-stat-card">
      <span>Total Active Time</span>
      <strong>${escapeHtml(formatDurationLabel(activeSeconds))}</strong>
    </div>
    <div class="profile-stat-card">
      <span>XP Leaderboard Rank</span>
      <strong>${rank ? `#${rank}` : 'Unranked'}</strong>
    </div>
    <div class="profile-stat-card">
      <span>Banner</span>
      <strong>${escapeHtml(banner.label || (banner.type === 'solid' ? 'Solid banner' : 'Gradient banner'))}</strong>
    </div>
  `;
  profileUi.profileWarnings.innerHTML = `<strong>Warnings:</strong> <span>${warningCount}</span>`;
  renderProfileBadgeSection(merged);

  if (!currentAccount) {
    profileUi.profileActionArea.innerHTML = '<button class="button secondary" type="button" data-open-login-from-profile="true">Log in to add friends</button>';
  } else if (isSelf) {
    profileUi.profileActionArea.innerHTML = `
      <span class="profile-pill">This is you</span>
      <button class="chip-button profile-settings-gear" type="button" data-open-profile-customization="true" aria-label="Open profile settings" title="Open profile settings">⚙</button>
    `;
  } else if (relationship === 'friends') {
    profileUi.profileActionArea.innerHTML = '<span class="profile-pill">Already friends</span>';
  } else if (relationship === 'outgoing') {
    profileUi.profileActionArea.innerHTML = `<button class="button secondary" type="button" data-friend-cancel="${escapeHtml(merged.uid)}">Request Sent</button>`;
  } else if (relationship === 'incoming') {
    profileUi.profileActionArea.innerHTML = `
      <button class="button primary" type="button" data-friend-accept="${escapeHtml(merged.uid)}">Accept Friend</button>
      <button class="button secondary" type="button" data-friend-reject="${escapeHtml(merged.uid)}">Reject</button>
    `;
  } else {
    profileUi.profileActionArea.innerHTML = `<button class="button primary" type="button" data-profile-add-friend="${escapeHtml(merged.uid)}">Add Friend</button>`;
  }

  profileUi.profileModeration.hidden = !staffToolsVisible;
  profileUi.profileModeration.dataset.targetUid = String(merged.uid || '');
  if (staffToolsVisible) {
    const moderationHeading = profileUi.profileModeration.querySelector('h4');
    if (moderationHeading) {
      moderationHeading.textContent = actorRole === 'owner' ? 'Owner Moderation' : actorRole === 'admin' ? 'Admin Moderation' : actorRole === 'moderator' ? 'Moderator Moderation' : 'Support Moderation';
    }
    const roleSummaryBits = [buildModerationSummary(merged.moderation || {})];
    if (merged?.staff?.promotedAt && targetRole) {
      roleSummaryBits.push(`${targetRole} since ${formatProfileDate(merged.staff.promotedAt)}`);
    }
    const cooldownLabel = getPromotionCooldownLabel(merged);
    if (cooldownLabel) {
      roleSummaryBits.push(cooldownLabel);
    }
    if (profileUi.profileModerationSummary) {
      profileUi.profileModerationSummary.textContent = roleSummaryBits.join(' • ');
    }
    if (profileUi.profileModerationComposer) {
      profileUi.profileModerationComposer.hidden = true;
      profileUi.profileModerationComposer.dataset.action = '';
    }
    if (profileUi.profileModerationTitle) {
      profileUi.profileModerationTitle.textContent = 'Issue moderation action';
    }
    if (profileUi.profileModerationMessage) {
      profileUi.profileModerationMessage.value = '';
    }
    if (profileUi.profileModerationDuration) {
      profileUi.profileModerationDuration.value = '1h';
    }
    if (profileUi.profilePromoteBtn) {
      const canPromote = canActorPromoteTarget(currentAccount, merged);
      const cooldownLabel = getPromotionCooldownLabel(merged);
      const nextRole = getNextStaffRole(targetRole);
      profileUi.profilePromoteBtn.hidden = !canPromote;
      profileUi.profilePromoteBtn.textContent = nextRole
        ? `Promote to ${nextRole.charAt(0).toUpperCase()}${nextRole.slice(1)}`
        : 'Promote';
      profileUi.profilePromoteBtn.disabled = Boolean(cooldownLabel);
      profileUi.profilePromoteBtn.title = cooldownLabel || '';
    }
    if (profileUi.profileDemoteBtn) {
      profileUi.profileDemoteBtn.hidden = !canActorDemoteTarget(currentAccount, merged);
    }
    if (profileUi.profileWarnBtn) profileUi.profileWarnBtn.hidden = !canActorWarnTarget(currentAccount, merged);
    if (profileUi.profileMuteBtn) profileUi.profileMuteBtn.hidden = !canActorMuteTarget(currentAccount, merged) || isBanned;
    if (profileUi.profileBanBtn) profileUi.profileBanBtn.hidden = !canActorBanTarget(currentAccount, merged) || isBanned;
    if (profileUi.profileUnmuteBtn) profileUi.profileUnmuteBtn.hidden = !isMuted || !canActorMuteTarget(currentAccount, merged);
    if (profileUi.profileUnbanBtn) profileUi.profileUnbanBtn.hidden = !isBanned || !canActorBanTarget(currentAccount, merged);
    if (profileUi.profileModerationDuration) {
      const actorPrimaryRole = getAccountPrimaryRole(currentAccount);
      Array.from(profileUi.profileModerationDuration.options).forEach((option) => {
        const preset = getModerationPresetById(option.value);
        let hidden = false;
        if (actorPrimaryRole === 'moderator' && preset.minutes != null && preset.minutes > (24 * 60)) hidden = true;
        if (actorPrimaryRole === 'moderator' && preset.minutes == null) hidden = true;
        if (actorPrimaryRole === 'admin' && preset.minutes != null && preset.minutes > (7 * 24 * 60)) hidden = true;
        if (actorPrimaryRole === 'admin' && preset.minutes == null) hidden = true;
        option.hidden = hidden;
      });
    }
  }
}

function openModerationComposer(action) {
  if (!profileUi.profileModerationComposer || !profileUi.profileModerationTitle || !profileUi.profileModerationDuration) return;
  const safeAction = String(action || '').trim();
  profileUi.profileModerationComposer.hidden = false;
  profileUi.profileModerationComposer.dataset.action = safeAction;
  profileUi.profileModerationTitle.textContent = safeAction === 'warn'
    ? 'Warn player'
    : safeAction === 'mute'
      ? 'Mute player'
      : 'Ban player';
  profileUi.profileModerationDuration.hidden = safeAction === 'warn';
  profileUi.profileModerationDuration.value = safeAction === 'ban' ? '1d' : '1h';
  if (profileUi.profileModerationMessage) {
    profileUi.profileModerationMessage.value = '';
    profileUi.profileModerationMessage.placeholder = safeAction === 'warn'
      ? 'Enter warning reason'
      : safeAction === 'mute'
        ? 'Enter mute reason'
        : 'Enter ban reason';
  }
}

function closeModerationComposer() {
  if (!profileUi.profileModerationComposer) return;
  profileUi.profileModerationComposer.hidden = true;
  profileUi.profileModerationComposer.dataset.action = '';
  if (profileUi.profileModerationMessage) {
    profileUi.profileModerationMessage.value = '';
  }
}

function openVipBannerUpsell(customBanner = null) {
  ensureProfileAndFriendsUi();
  if (!profileUi.vipBannerUpsellOverlay) return;
  const account = getCurrentAccount();
  const progression = getProgressionSnapshotForAccount(account);
  const qualified = Math.max(0, Number(progression.qualifiedReferrals) || 0);
  const target = 25;
  const progress = Math.max(0, Math.min(1, qualified / target));
  if (profileUi.vipBannerUpsellProgressLabel) {
    profileUi.vipBannerUpsellProgressLabel.textContent = `${qualified} / ${target} referrals`;
  }
  if (profileUi.vipBannerUpsellProgressBar) {
    profileUi.vipBannerUpsellProgressBar.style.width = `${Math.round(progress * 100)}%`;
  }
  if (profileUi.vipBannerUpsellPreview) {
    const previewBanner = customBanner
      ? {
          type: 'vip-custom',
          value: String(customBanner.dataUrl || '').trim(),
          label: String(customBanner.label || 'Custom banner').trim(),
        }
      : getDefaultProfileBanner();
    applyBannerStyleToElement(profileUi.vipBannerUpsellPreview, previewBanner);
  }
  profileUi.vipBannerUpsellOverlay.hidden = false;
}

function closeVipBannerUpsell() {
  if (!profileUi.vipBannerUpsellOverlay) return;
  profileUi.vipBannerUpsellOverlay.hidden = true;
}

async function getModerationCopyRecipients(actor, action) {
  const actorRole = getAccountPrimaryRole(actor);
  const actorUid = String(actor?.uid || '').trim();
  const actorName = String(actor?.displayName || 'Staff').trim() || 'Staff';
  const recipients = [];
  const addRecipient = (profile) => {
    if (!profile?.uid || profile.uid === actorUid) return;
    if (recipients.some((entry) => entry.uid === profile.uid)) return;
    recipients.push(profile);
  };
  let allProfiles = Object.values(authState.profiles || {}).map((entry) => mergeCloudProfileShape(entry));
  const cloudOwners = await fetchCloudOwnerProfiles();
  if (cloudOwners.length) {
    allProfiles = mergeProfilesByUid(allProfiles, cloudOwners);
  }
  if (actorRole === 'support' || actorRole === 'moderator') {
    const cloudStaffProfiles = await fetchCloudStaffProfiles();
    if (cloudStaffProfiles.length) {
      allProfiles = mergeProfilesByUid(allProfiles, cloudStaffProfiles);
    }
  }
  if (actorRole === 'support') {
    allProfiles.filter((profile) => ['moderator', 'admin'].includes(getProfilePrimaryRole(profile)) || isOwnerAccount(profile)).forEach(addRecipient);
  } else if (actorRole === 'moderator') {
    allProfiles.filter((profile) => getProfilePrimaryRole(profile) === 'admin' || isOwnerAccount(profile)).forEach(addRecipient);
  } else if (actorRole === 'admin') {
    allProfiles.filter((profile) => isOwnerAccount(profile)).forEach(addRecipient);
  }
  return recipients.map((profile) => ({
    ...profile,
    actorUid,
    actorName,
  }));
}

async function appendModerationCopies(actor, targetProfile, action, reason = '') {
  const recipients = await getModerationCopyRecipients(actor, action);
  recipients.forEach((recipient) => {
    window.PlayrProgression?.appendMailboxMessage?.(recipient, {
      subject: `Staff ${action}`,
      body: `${actor.displayName} used ${action} on ${targetProfile.displayName || 'a user'}${reason ? `: ${reason}` : '.'}`,
      type: 'staff-copy',
      category: 'Moderation',
      actorUid: actor.uid,
      actorName: actor.displayName,
      targetUid: targetProfile.uid,
      targetName: targetProfile.displayName || 'Player',
      createdAt: Date.now(),
    });
  });
}

function buildNextStaffRolesForPromotion(targetProfile = {}) {
  const targetRole = getProfilePrimaryRole(targetProfile);
  const nextRole = getNextStaffRole(targetRole);
  if (!nextRole) return null;
  return buildAccountRoles({
    roles: [...(Array.isArray(targetProfile.roles) ? targetProfile.roles : []).filter((role) => !STAFF_ROLE_SEQUENCE.includes(normalizeRoleName(role))), nextRole],
    isVip: Boolean(targetProfile.isVip),
    identifierType: targetProfile.identifierType,
    identifier: targetProfile.identifier,
  });
}

function buildNextStaffRolesForDemotion(targetProfile = {}) {
  const targetRole = getProfilePrimaryRole(targetProfile);
  const previousRole = getPreviousStaffRole(targetRole);
  const baseRoles = [...(Array.isArray(targetProfile.roles) ? targetProfile.roles : []).filter((role) => !STAFF_ROLE_SEQUENCE.includes(normalizeRoleName(role)))];
  if (previousRole) baseRoles.push(previousRole);
  return buildAccountRoles({
    roles: baseRoles,
    isVip: Boolean(targetProfile.isVip),
    identifierType: targetProfile.identifierType,
    identifier: targetProfile.identifier,
  });
}

async function applyStaffRoleChange(action) {
  const account = getCurrentAccount();
  if (!firebaseDb || !account?.uid || !profileUi.profileModeration) return;
  const targetUid = String(profileUi.profileModeration.dataset.targetUid || '').trim();
  if (!targetUid) return;
  const targetProfile = await resolveUserProfileRecord({ uid: targetUid, displayName: profileUi.profileOverlay?.dataset.profileName || '' });
  if (!targetProfile) return;
  if (action === 'promote' && !canActorPromoteTarget(account, targetProfile)) return;
  if (action === 'demote' && !canActorDemoteTarget(account, targetProfile)) return;
  if (action === 'promote' && getPromotionCooldownRemaining(targetProfile) > 0) {
    setProfilePanelStatus(`This user is still on a promotion cooldown for ${getPromotionCooldownLabel(targetProfile)}.`, 'info');
    return;
  }
  const nextRoles = action === 'promote' ? buildNextStaffRolesForPromotion(targetProfile) : buildNextStaffRolesForDemotion(targetProfile);
  const nextRole = getHighestStaffRoleFromRoles(nextRoles || []);
  const previousRole = getProfilePrimaryRole(targetProfile);
  const now = Date.now();
  const staff = {
    ...(targetProfile.staff && typeof targetProfile.staff === 'object' ? targetProfile.staff : {}),
    role: nextRole,
    promotedByUid: action === 'promote' ? account.uid : String(targetProfile.staff?.promotedByUid || '').trim(),
    promotedByName: action === 'promote' ? account.displayName : String(targetProfile.staff?.promotedByName || '').trim(),
    promotedAt: action === 'promote' ? now : normalizeTimestampToMs(targetProfile.staff?.promotedAt),
    promotionCooldownUntil: action === 'promote' && nextRole ? now + STAFF_PROMOTION_COOLDOWN_MS : 0,
    history: [
      ...((Array.isArray(targetProfile.staff?.history) ? targetProfile.staff.history : []).slice(-19)),
      {
        fromRole: previousRole,
        toRole: nextRole,
        action,
        byUid: account.uid,
        byName: account.displayName,
        createdAt: now,
      },
    ],
  };
  const timestamp = window.firebase.firestore.FieldValue.serverTimestamp();
  await firebaseDb.collection(USER_PROFILE_COLLECTION).doc(targetUid).set({
    roles: nextRoles,
    staff,
    updatedAt: timestamp,
  }, { merge: true });
  cacheProfileLocally({
    ...targetProfile,
    roles: nextRoles,
    staff,
  });
  cacheResolvedProfile({
    ...targetProfile,
    roles: nextRoles,
    staff,
  });
  setProfilePanelStatus(`${action === 'promote' ? 'Promoted' : 'Demoted'} ${targetProfile.displayName || 'user'} ${action === 'promote' ? `to ${nextRole}.` : `to ${nextRole || 'normal user'}.`}`, 'success');
  if (!settingsOverlay?.hidden) {
    void renderStaffDirectory(account);
  }
  await renderOpenProfilePanel();
}

async function applyStaffModerationAction(action) {
  const account = getCurrentAccount();
  if (!firebaseDb || !account?.uid || !profileUi.profileModeration) return;
  const actorRole = getAccountPrimaryRole(account);
  if (!actorRole) return;
  const targetUid = String(profileUi.profileModeration.dataset.targetUid || '').trim();
  if (!targetUid) return;
  const targetProfile = await resolveUserProfileRecord({ uid: targetUid, displayName: profileUi.profileOverlay?.dataset.profileName || '' });
  if (!targetProfile) return;
  if (action === 'warn' && !canActorWarnTarget(account, targetProfile)) return;
  if ((action === 'mute' || action === 'unmute') && !canActorMuteTarget(account, targetProfile)) return;
  if ((action === 'ban' || action === 'unban') && !canActorBanTarget(account, targetProfile)) return;

  const message = String(profileUi.profileModerationMessage?.value || '').trim();
  const durationPreset = getModerationPresetById(profileUi.profileModerationDuration?.value || '');
  const moderation = mergeCloudProfileShape(targetProfile).moderation;
  const now = Date.now();

  if (action === 'warn') {
    moderation.warningCount = Math.max(0, Number(moderation.warningCount) || 0) + 1;
    moderation.warnings = [...(Array.isArray(moderation.warnings) ? moderation.warnings : []), {
      message: message || `${actorRole} warning issued.`,
      createdAt: now,
      issuedByUid: account.uid,
      issuedByName: account.displayName,
    }].slice(-PROFILE_WARNING_HISTORY_LIMIT);
  }
  if (action === 'mute') {
    if (actorRole === 'moderator' && (durationPreset.minutes == null || durationPreset.minutes > (24 * 60))) {
      setProfilePanelStatus('Moderators can mute for up to 24 hours.', 'danger');
      return;
    }
    moderation.mutedPermanent = durationPreset.minutes == null;
    moderation.mutedUntil = durationPreset.minutes == null ? 0 : now + (durationPreset.minutes * 60 * 1000);
    moderation.muteReason = message || `Muted by ${actorRole}.`;
  }
  if (action === 'unmute') {
    moderation.mutedUntil = 0;
    moderation.mutedPermanent = false;
    moderation.muteReason = '';
  }
  if (action === 'ban') {
    if (actorRole === 'admin' && (durationPreset.minutes == null || durationPreset.minutes > (7 * 24 * 60))) {
      setProfilePanelStatus('Admins can ban for up to 1 week.', 'danger');
      return;
    }
    moderation.ban = {
      active: true,
      permanent: durationPreset.minutes == null,
      reason: message || `Banned by ${actorRole}.`,
      bannedAt: now,
      expiresAt: durationPreset.minutes == null ? 0 : now + (durationPreset.minutes * 60 * 1000),
      bannedByUid: account.uid,
      bannedByName: account.displayName,
    };
    moderation.mutedUntil = 0;
    moderation.mutedPermanent = false;
    moderation.muteReason = '';
  }
  if (action === 'unban') {
    moderation.ban = {
      active: false,
      permanent: false,
      reason: '',
      bannedAt: 0,
      expiresAt: 0,
      bannedByUid: '',
      bannedByName: '',
    };
  }

  const timestamp = window.firebase.firestore.FieldValue.serverTimestamp();
  await firebaseDb.collection(USER_PROFILE_COLLECTION).doc(targetUid).set({
    moderation,
    updatedAt: timestamp,
  }, { merge: true });

  cacheProfileLocally({
    ...targetProfile,
    moderation,
  });
  cacheResolvedProfile({
    ...targetProfile,
    moderation,
  });
  await appendModerationCopies(account, targetProfile, action, message || moderation.muteReason || moderation.ban?.reason || '');
  setProfilePanelStatus(`Moderation action applied: ${action}.`, 'success');
  closeModerationComposer();
  await renderOpenProfilePanel();
}

function readSiteNoticeState() {
  try {
    const raw = localStorage.getItem(SITE_NOTICE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const readIds = Array.isArray(parsed?.readIds)
      ? parsed.readIds.map((value) => String(value || '').trim()).filter(Boolean)
      : [];
    return { readIds };
  } catch {
    return { readIds: [] };
  }
}

function persistSiteNoticeState(state) {
  localStorage.setItem(SITE_NOTICE_STORAGE_KEY, JSON.stringify({
    readIds: Array.from(new Set(Array.isArray(state?.readIds) ? state.readIds : [])),
  }));
}

function getPublicSiteNotices() {
  const notices = Array.isArray(window.PlayrSiteNotices) ? window.PlayrSiteNotices : [];
  return notices
    .filter((notice) => notice && String(notice.audience || 'public') === 'public')
    .sort((left, right) => new Date(right.publishedAt || 0).getTime() - new Date(left.publishedAt || 0).getTime());
}

function formatSiteNoticeDate(dateValue) {
  const stamp = new Date(dateValue || '');
  if (Number.isNaN(stamp.getTime())) return 'Recent';
  return stamp.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function markPublicSiteNoticesRead(noticeIds = []) {
  const ids = noticeIds.map((value) => String(value || '').trim()).filter(Boolean);
  if (!ids.length) return;
  const state = readSiteNoticeState();
  persistSiteNoticeState({
    readIds: [...state.readIds, ...ids],
  });
}

function hasUnreadSiteNotices() {
  const readSet = new Set(readSiteNoticeState().readIds);
  return getPublicSiteNotices().some((notice) => !readSet.has(String(notice.id || '')));
}

function getCurrentMailboxNotifications() {
  return getMailboxMessagesForAccount(getCurrentAccount())
    .map((entry) => entry && typeof entry === 'object' ? {
      id: String(entry.id || '').trim(),
      subject: String(entry.subject || '').trim() || 'Notification',
      body: String(entry.body || '').trim(),
      type: String(entry.type || '').trim() || 'staff-copy',
      category: String(entry.category || '').trim() || 'Staff',
      createdAt: normalizeTimestampToMs(entry.createdAt),
      actorName: String(entry.actorName || '').trim(),
      targetName: String(entry.targetName || '').trim(),
    } : null)
    .filter(Boolean)
    .sort((left, right) => right.createdAt - left.createdAt)
    .slice(0, 8);
}

function syncSiteNoticeBell() {
  const hasUnread = hasUnreadSiteNotices() || getCurrentMailboxNotifications().length > 0;
  if (notificationsUnreadDot) {
    notificationsUnreadDot.hidden = !hasUnread;
  }
  if (notificationsBellBtn) {
    notificationsBellBtn.setAttribute('aria-expanded', uiState.notificationsOpen ? 'true' : 'false');
    notificationsBellBtn.dataset.unread = hasUnread ? 'true' : 'false';
  }
}

function positionNotificationsDropdown() {
  if (!notificationsDropdown || !notificationsBellBtn || notificationsDropdown.hidden) return;

  const rect = notificationsBellBtn.getBoundingClientRect();
  const panelWidth = Math.min(360, Math.max(260, window.innerWidth - 24));
  const left = Math.max(12, Math.min(rect.right - panelWidth, window.innerWidth - panelWidth - 12));
  const top = Math.min(rect.bottom + 12, window.innerHeight - 24);

  notificationsDropdown.style.width = `min(92vw, ${panelWidth}px)`;
  notificationsDropdown.style.left = `${left}px`;
  notificationsDropdown.style.top = `${top}px`;
  notificationsDropdown.style.right = 'auto';
}

function closeNotificationsDropdown() {
  uiState.notificationsOpen = false;
  if (notificationsDropdown) notificationsDropdown.hidden = true;
  syncSiteNoticeBell();
}

function renderNotificationsDropdown() {
  if (!notificationsList || !notificationsEmpty) return;

  const notices = getPublicSiteNotices().slice(0, 1);
  const mailboxEntries = getCurrentMailboxNotifications();
  notificationsList.innerHTML = '';

  if (!notices.length && !mailboxEntries.length) {
    notificationsEmpty.hidden = false;
    syncSiteNoticeBell();
    return;
  }

  notificationsEmpty.hidden = true;

  if (mailboxEntries.length) {
    const section = document.createElement('div');
    section.className = 'notification-section-label';
    section.textContent = 'Staff notifications';
    notificationsList.appendChild(section);

    mailboxEntries.forEach((notice) => {
      const article = document.createElement('article');
      article.className = 'notification-item';

      const top = document.createElement('div');
      top.className = 'notification-item-top';

      const titleWrap = document.createElement('div');
      const title = document.createElement('h4');
      title.textContent = notice.subject;
      const summary = document.createElement('p');
      summary.textContent = notice.body || 'Staff activity copied here.';
      titleWrap.append(title, summary);

      const meta = document.createElement('div');
      meta.className = 'notification-meta';
      const tag = document.createElement('span');
      tag.className = 'notification-tag';
      tag.textContent = notice.category || 'Staff';
      const date = document.createElement('span');
      date.className = 'notification-date';
      date.textContent = formatSiteNoticeDate(notice.createdAt);
      meta.append(tag, date);

      top.append(titleWrap, meta);
      article.append(top);
      notificationsList.appendChild(article);
    });
  }

  if (mailboxEntries.length && notices.length) {
    const divider = document.createElement('div');
    divider.className = 'notification-section-label';
    divider.textContent = 'Site updates';
    notificationsList.appendChild(divider);
  }

  notices.forEach((notice) => {
    const article = document.createElement('article');
    article.className = 'notification-item';

    const top = document.createElement('div');
    top.className = 'notification-item-top';

    const titleWrap = document.createElement('div');
    const title = document.createElement('h4');
    title.textContent = String(notice.title || 'Site notice');
    const summary = document.createElement('p');
    summary.textContent = String(notice.summary || '');
    titleWrap.append(title, summary);

    const meta = document.createElement('div');
    meta.className = 'notification-meta';
    const tag = document.createElement('span');
    tag.className = 'notification-tag';
    tag.textContent = String(notice.category || 'Notice');
    const date = document.createElement('span');
    date.className = 'notification-date';
    date.textContent = formatSiteNoticeDate(notice.publishedAt);
    meta.append(tag, date);

    top.append(titleWrap, meta);

    const actions = document.createElement('div');
    actions.className = 'notification-item-actions';
    const link = document.createElement('a');
    link.className = 'button secondary';
    link.href = `/updates#${encodeURIComponent(String(notice.id || ''))}`;
    link.textContent = 'Learn more';
    actions.appendChild(link);

    article.append(top, actions);
    notificationsList.appendChild(article);
  });

  syncSiteNoticeBell();
}

function openNotificationsDropdown() {
  if (!notificationsDropdown) return;
  uiState.notificationsOpen = true;
  notificationsDropdown.hidden = false;
  renderNotificationsDropdown();
  positionNotificationsDropdown();
  markPublicSiteNoticesRead(getPublicSiteNotices().map((notice) => notice.id));
  syncSiteNoticeBell();
}

function toggleNotificationsDropdown() {
  if (!notificationsDropdown) return;
  if (uiState.notificationsOpen) {
    closeNotificationsDropdown();
    return;
  }
  openNotificationsDropdown();
}

function findProfileByDisplayName(displayName) {
  const normalized = normalizeDisplayNameForLookup(displayName);
  if (!normalized) return null;
  return Object.values(authState.profiles).find((profile) => {
    if (!profile) return false;
    return normalizeDisplayNameForLookup(profile.displayName) === normalized;
  }) || null;
}

function normalizeIdentifier(rawValue) {
  const value = String(rawValue || '').trim();
  if (!value) return null;

  const email = value.toLowerCase();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { type: 'email', value: email };
  }

  const displayNameValidation = validateDisplayName(value);
  if (displayNameValidation.valid) {
    return { type: 'displayName', value: displayNameValidation.cleaned };
  }

  return null;
}

function createSyntheticSignupEmail(displayName) {
  const normalized = normalizeDisplayNameForLookup(displayName)
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20) || 'player';
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return `${normalized}.${suffix}@playr.local`;
}

async function resolveLoginDisplayName(displayName) {
  const normalized = normalizeDisplayNameForLookup(displayName);
  if (!normalized) return null;

  const cachedAccount = Object.values(authState.profiles).find((account) => {
    if (!account) return false;
    return normalizeDisplayNameForLookup(account.displayName) === normalized;
  });

  if (cachedAccount?.identifier && cachedAccount?.identifierType) {
    return {
      uid: cachedAccount.uid || null,
      displayName: cachedAccount.displayName,
      identifier: cachedAccount.identifier,
      identifierType: cachedAccount.identifierType,
    };
  }

  if (!firebaseDb) return null;

  const displayNameRef = firebaseDb.collection(DISPLAY_NAME_COLLECTION).doc(normalized);
  const displayNameSnapshot = await displayNameRef.get();
  if (!displayNameSnapshot.exists) return null;

  const ownerUid = displayNameSnapshot.data()?.uid || null;
  if (!ownerUid) return null;

  const profileSnapshot = await firebaseDb.collection(USER_PROFILE_COLLECTION).doc(ownerUid).get();
  const profileData = profileSnapshot.exists ? (profileSnapshot.data() || {}) : {};

  const identifier = profileData.identifier || profileData.identifierValue || null;
  const identifierType = profileData.identifierType || null;

  if (!identifier || !identifierType) {
    return {
      uid: ownerUid,
      displayName: displayNameSnapshot.data()?.displayName || canonicalizeDisplayName(displayName),
      identifier: null,
      identifierType: null,
    };
  }

  return {
    uid: ownerUid,
    displayName: profileData.displayName || displayNameSnapshot.data()?.displayName || canonicalizeDisplayName(displayName),
    identifier,
    identifierType,
  };
}

function createDisplayNameFromIdentifier(identifier) {
  if (!identifier) return 'Player';
  if (identifier.type === 'email') {
    return identifier.value.split('@')[0].slice(0, 16) || 'Player';
  }
  return `Player ${identifier.value.slice(-4)}`;
}

function canonicalizeDisplayName(rawValue) {
  return String(rawValue || '').trim().replace(/\s+/g, ' ').slice(0, 24);
}

function normalizeDisplayNameForLookup(displayName) {
  return canonicalizeDisplayName(displayName).toLowerCase();
}

function normalizeAccountIdentifier(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeRoleName(role) {
  return String(role || '').trim().toLowerCase();
}

function getRoleRank(roleName) {
  const safeRole = normalizeRoleName(roleName);
  if (safeRole === 'owner') return 4;
  if (safeRole === 'admin') return 3;
  if (safeRole === 'moderator') return 2;
  if (safeRole === 'support') return 1;
  return 0;
}

function getHighestStaffRoleFromRoles(roles = []) {
  const normalized = Array.isArray(roles) ? roles.map(normalizeRoleName) : [];
  if (normalized.includes('admin')) return 'admin';
  if (normalized.includes('moderator')) return 'moderator';
  if (normalized.includes('support')) return 'support';
  return '';
}

function getAccountPrimaryRole(account = getCurrentAccount()) {
  if (isOwnerAccount(account)) return 'owner';
  return getHighestStaffRoleFromRoles(account?.roles || []);
}

function getNextStaffRole(role = '') {
  const safeRole = normalizeRoleName(role);
  if (!safeRole) return STAFF_ROLE_SEQUENCE[0];
  const index = STAFF_ROLE_SEQUENCE.indexOf(safeRole);
  return index >= 0 && index < STAFF_ROLE_SEQUENCE.length - 1 ? STAFF_ROLE_SEQUENCE[index + 1] : '';
}

function getPreviousStaffRole(role = '') {
  const safeRole = normalizeRoleName(role);
  const index = STAFF_ROLE_SEQUENCE.indexOf(safeRole);
  return index > 0 ? STAFF_ROLE_SEQUENCE[index - 1] : '';
}

function readMailboxStore() {
  try {
    const raw = localStorage.getItem(MAILBOX_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function getMailboxMessagesForAccount(account = getCurrentAccount()) {
  if (window.PlayrProgression?.getMailboxMessages) {
    return window.PlayrProgression.getMailboxMessages(account);
  }
  const key = account?.uid ? `user:${account.uid}` : account?.identifier ? `identifier:${normalizeAccountIdentifier(account.identifier)}` : 'guest';
  const mailbox = readMailboxStore();
  return Array.isArray(mailbox[key]) ? mailbox[key] : [];
}

function buildAccountRoles({ roles = [], isVip = false, identifierType = 'unknown', identifier = '' } = {}) {
  const merged = new Set(
    Array.isArray(roles)
      ? roles
        .map(normalizeRoleName)
        .filter((role) => role && role !== 'owner')
      : [],
  );

  if (isVip) {
    merged.add('vip');
  }

  if (identifierType === 'email' && OWNER_VIP_IDENTIFIERS.has(normalizeAccountIdentifier(identifier))) {
    merged.add('owner');
    merged.add('vip');
  }

  if (merged.has('admin')) {
    merged.delete('moderator');
    merged.delete('support');
  } else if (merged.has('moderator')) {
    merged.delete('support');
  }

  return Array.from(merged);
}

function hasAccountRole(account, roleName) {
  const targetRole = normalizeRoleName(roleName);
  if (!targetRole) return false;

  const roles = buildAccountRoles({
    roles: account?.roles,
    isVip: account?.isVip,
    identifierType: account?.identifierType,
    identifier: account?.identifier,
  });

  return roles.includes(targetRole);
}

function isCurrentAccountAdmin(account = getCurrentAccount()) {
  return isOwnerAccount(account);
}

function isCurrentAccountVip(account = getCurrentAccount()) {
  return hasAccountRole(account, 'vip');
}

function isOwnerAccount(account = getCurrentAccount()) {
  return Boolean(
    account
    && account.identifierType === 'email'
    && OWNER_VIP_IDENTIFIERS.has(normalizeAccountIdentifier(account.identifier)),
  );
}

function normalizeForModeration(displayName) {
  const lowered = normalizeDisplayNameForLookup(displayName);
  const replaced = lowered
    .split('')
    .map((char) => MODERATION_CHAR_MAP[char] || char)
    .join('');
  return collapseRepeatedChars(replaced
    .replace(/[\s_.\-]+/g, '')
    .replace(/[^a-z]/g, ''));
}

function validateDisplayName(displayName) {
  const cleaned = canonicalizeDisplayName(displayName);

  if (cleaned.length < 3) {
    return { valid: false, reason: 'Login name must be at least 3 characters.', reasonCode: 'too-short' };
  }

  if (cleaned.length > 24) {
    return { valid: false, reason: 'Login name must be 24 characters or less.', reasonCode: 'too-long' };
  }

  if (!/^[A-Za-z0-9 _.-]+$/.test(cleaned)) {
    return {
      valid: false,
      reason: 'Login name can only use letters, numbers, spaces, dots, dashes, and underscores.',
      reasonCode: 'invalid-characters',
    };
  }

  const moderationText = normalizeForModeration(cleaned);
  const sparseCheck = collapseRepeatedChars(cleaned.toLowerCase().replace(/[^a-z]/g, ''));
  const consonantCheck = moderationText.replace(/[aeiou]/g, '');

  const hasReserved = containsApproximateBlockedTerm(moderationText, RESERVED_RANK_TERMS)
    || containsApproximateBlockedTerm(sparseCheck, RESERVED_RANK_TERMS);
  if (hasReserved) {
    return {
      valid: false,
      reason: 'That login name uses a reserved staff or rank word.',
      reasonCode: 'reserved-term',
    };
  }

  const profanityConsonants = PROFANITY_TERMS.map((term) => term.replace(/[aeiou]/g, ''));
  const hasProfanity = containsApproximateBlockedTerm(moderationText, PROFANITY_TERMS)
    || containsApproximateBlockedTerm(sparseCheck, PROFANITY_TERMS)
    || containsApproximateBlockedTerm(consonantCheck, profanityConsonants);
  if (hasProfanity) {
    return {
      valid: false,
      reason: 'That login name contains a blocked word or inappropriate language.',
      reasonCode: 'restricted-language',
    };
  }

  return { valid: true, cleaned, reasonCode: 'valid' };
}

function buildDisplayNameCandidatePool(rawBase) {
  const base = canonicalizeDisplayName(rawBase)
    .replace(/[^A-Za-z0-9 _.-]/g, '')
    .replace(/\s+/g, '')
    .slice(0, 14) || 'Player';

  const year = new Date().getFullYear();
  const pool = [
    `${base}`,
    `${base}Playr`,
    `${base}Arcade`,
    `${base}${Math.floor(100 + Math.random() * 900)}`,
    `${base}_${Math.floor(10 + Math.random() * 90)}`,
    `${base}.${Math.floor(10 + Math.random() * 90)}`,
    `The${base}`,
    `${base}${String(year).slice(-2)}`,
    `Playr${base}`,
  ];

  return Array.from(new Set(pool)).map((name) => name.slice(0, 24));
}

async function checkDisplayNameAvailability(displayName, ignoreUid = null) {
  const normalized = normalizeDisplayNameForLookup(displayName);
  if (!normalized) return { available: false, ownerUid: null };

  if (!firebaseDb) {
    const localTaken = isDisplayNameTaken(displayName);
    return { available: !localTaken, ownerUid: null };
  }

  const ref = firebaseDb.collection(DISPLAY_NAME_COLLECTION).doc(normalized);
  const snapshot = await ref.get();
  if (!snapshot.exists) {
    return { available: true, ownerUid: null };
  }

  const ownerUid = snapshot.data()?.uid || null;
  if (ignoreUid && ownerUid === ignoreUid) {
    return { available: true, ownerUid };
  }

  return { available: false, ownerUid };
}

async function reserveDisplayNameForUid(displayName, uid, identifierType = 'unknown', identifierValue = '') {
  if (!firebaseDb) {
    throw { code: 'firestore/not-initialized' };
  }

  const normalized = normalizeDisplayNameForLookup(displayName);
  if (!normalized) {
    throw { code: 'auth/invalid-display-name' };
  }

  const timestamp = window.firebase.firestore.FieldValue.serverTimestamp();
  const displayNameRef = firebaseDb.collection(DISPLAY_NAME_COLLECTION).doc(normalized);
  const profileRef = firebaseDb.collection(USER_PROFILE_COLLECTION).doc(uid);
  const ownerFlag = false;

  await firebaseDb.runTransaction(async (transaction) => {
    const existingProfile = await transaction.get(profileRef);
    const existingProfileData = existingProfile.exists ? (existingProfile.data() || {}) : {};
    const roles = buildAccountRoles({
      roles: existingProfileData.roles,
      isVip: existingProfileData.isVip,
      identifierType,
      identifier: identifierValue,
    });
    const vipFlag = roles.includes('vip');
    const existing = await transaction.get(displayNameRef);
    const existingUid = existing.exists ? existing.data()?.uid : null;

    if (existing.exists && existingUid !== uid) {
      throw { code: 'auth/display-name-taken' };
    }

    transaction.set(displayNameRef, {
      uid,
      displayName,
      normalized,
      isAdmin: ownerFlag,
      isVip: vipFlag,
      roles,
      createdAt: existing.exists ? (existing.data()?.createdAt || timestamp) : timestamp,
      updatedAt: timestamp,
    }, { merge: true });

    transaction.set(profileRef, {
      uid,
      displayName,
      normalizedDisplayName: normalized,
      identifierType,
      identifier: identifierValue || null,
      isAdmin: ownerFlag,
      isVip: vipFlag,
      roles,
      updatedAt: timestamp,
      createdAt: timestamp,
    }, { merge: true });
  });
}

async function suggestAvailableDisplayNames(requestedDisplayName, count = 3) {
  const candidates = buildDisplayNameCandidatePool(requestedDisplayName);
  const suggestions = [];

  for (const candidate of candidates) {
    const validation = validateDisplayName(candidate);
    if (!validation.valid) continue;

    try {
      const availability = await checkDisplayNameAvailability(validation.cleaned);
      if (availability.available) {
        suggestions.push(validation.cleaned);
      }
    } catch {
      // Ignore temporary check failures while generating suggestions.
    }

    if (suggestions.length >= count) break;
  }

  return suggestions;
}

function suggestLocalDisplayNames(requestedDisplayName, count = 3) {
  const candidates = buildDisplayNameCandidatePool(requestedDisplayName);
  const suggestions = [];

  for (const candidate of candidates) {
    const validation = validateDisplayName(candidate);
    if (validation.valid) {
      suggestions.push(validation.cleaned);
    }
  }

  return suggestions.slice(0, count);
}

function getFirebaseAuthErrorMessage(error, fallback) {
  const code = error?.code || '';
  if (code === 'auth/invalid-email') return 'Invalid account data. Try signing up again.';
  if (code === 'auth/invalid-credential') return 'Incorrect login name or password.';
  if (code === 'auth/wrong-password') return 'Incorrect login name or password.';
  if (code === 'auth/user-not-found') return 'No account found for that login name.';
  if (code === 'auth/email-already-in-use') return 'That account already exists. Try logging in instead.';
  if (code === 'auth/weak-password') return 'Password must be at least 6 characters.';
  if (code === 'auth/too-many-requests') return 'Too many attempts. Try again later.';
  if (code === 'auth/invalid-phone-number') return 'Enter a valid phone number with country code.';
  if (code === 'auth/missing-phone-number') return 'Enter a phone number first.';
  if (code === 'auth/quota-exceeded') return 'SMS quota exceeded for now. Try again later.';
  if (code === 'auth/network-request-failed') return 'Network error. Check your connection and try again.';
  if (code === 'auth/operation-not-allowed') return 'This sign-in method is not enabled in Firebase Authentication.';
  if (code === 'auth/display-name-taken') return 'That display name is already taken.';
  if (code === 'auth/invalid-display-name') return 'That display name is invalid.';
  if (code === 'permission-denied') return 'Firestore permission denied. Update Firestore rules for profile writes.';
  if (code === 'unavailable') return 'Firestore is currently unavailable. Try again in a moment.';
  if (code === 'failed-precondition') return 'Firestore is not fully set up yet. Create the Firestore database in Firebase Console.';
  if (code === 'not-found') return 'Firestore collection setup is missing. Check your database configuration.';
  if (code === 'firestore/not-initialized') return 'Firestore SDK is not initialized. Refresh after loading Firestore SDK.';
  return fallback || 'Authentication failed. Please try again.';
}

function isAccountVerified(account) {
  return Boolean(account);
}

function createSingleUseHostLink(gameId, hostId = 'host-demo') {
  const token = `${gameId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    gameId,
    hostId,
    token,
    url: `${window.location.origin}${window.location.pathname}?join=${token}`,
    maxUses: multiplayerAccessConfig.singleUseInviteLinks ? 1 : Infinity,
    uses: 0,
  };
}

function formatLeaderboardValue(kind, rank) {
  if (kind === 'time') return `${38 + rank}s`;
  if (kind === 'score') return `${(9800 - rank * 71).toLocaleString()}`;
  if (kind === 'distance') return `${(5600 - rank * 29).toLocaleString()}m`;
  if (kind === 'tile') return `${Math.max(256, 8192 - rank * 64)}`;
  if (kind === 'accuracy') return `${Math.max(88, 100 - rank * 0.09).toFixed(2)}%`;
  if (kind === 'cps') return `${Math.max(6, 17 - rank * 0.08).toFixed(2)} cps`;
  if (kind === 'wpm') return `${Math.max(32, 128 - rank * 0.82).toFixed(2)} WPM`;
  if (kind === 'cookies') return `${(Math.pow(10, 6 + rank * 0.05)).toLocaleString('en', { maximumFractionDigits: 0 })}`;
  if (kind === 'guesses') return `${Math.min(6, 2 + Math.floor(rank / 25))}`;
  return `${Math.max(1, 420 - rank * 2)}`;
}

function buildBlankLeaderboardRows(limit = 100) {
  return Array.from({ length: limit }, (_, index) => ({
    rank: index + 1,
    player: '',
    value: '',
    level: '',
    profile: null,
  }));
}

function buildLevelsLeaderboardRows(limit = 100) {
  const progressionApi = getProgressionApi();
  const profiles = Object.values(readStoredProfiles())
    .filter((profile) => profile && typeof profile === 'object' && String(profile.displayName || '').trim() && !Boolean(profile?.moderation?.ban?.active))
    .map((profile) => {
      const xp = Math.max(0, Number(profile?.progression?.xp) || 0);
      const levelInfo = progressionApi?.getLevelInfoFromXp
        ? progressionApi.getLevelInfoFromXp(xp)
        : { level: 1 };
      return {
        profile,
        player: String(profile.displayName || 'Player').slice(0, 24),
        xp: Math.round(xp),
        level: Math.max(1, Math.floor(Number(levelInfo.level || 1))),
      };
    })
    .sort((left, right) => right.xp - left.xp || right.level - left.level || left.player.localeCompare(right.player))
    .slice(0, limit)
    .map((entry, index) => ({
      rank: index + 1,
      player: entry.player,
      value: entry.xp,
      level: entry.level,
      profile: entry.profile,
    }));

  return profiles;
}

function readJsonStorage(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallbackValue;
    return JSON.parse(raw);
  } catch {
    return fallbackValue;
  }
}

function formatLeaderboardRowValue(kind, value) {
  if (kind === 'time') return `${Number(value).toFixed(0)}s`;
  if (kind === 'accuracy') return `${Number(value).toFixed(2)}%`;
  if (kind === 'distance') return `${Number(value).toLocaleString()}m`;
  if (kind === 'tile') return String(value);
  if (kind === 'cookies') return `${Number(value).toLocaleString()} cookies`;
  if (kind === 'cps') return `${Number(value).toFixed(2)} cps`;
  if (kind === 'wpm') return `${Number(value).toFixed(2)} WPM`;
  return String(value);
}

function normalizeLeaderboardRows(gameId, spec) {
  const rows = [];
  const currentAccount = getCurrentAccount();
  const currentName = currentAccount?.displayName || 'You';

  if (gameId === 'typing-test') {
    const entries = readJsonStorage('playr.typing-test.leaderboard.v1', []);
    if (Array.isArray(entries)) {
      entries
        .filter((entry) => entry && Number.isFinite(Number(entry.wpm)))
        .sort((a, b) => Number(b.wpm) - Number(a.wpm)
          || Number(b.accuracy || 0) - Number(a.accuracy || 0)
          || Number(b.rawWpm || 0) - Number(a.rawWpm || 0)
          || Number(a.errors || 0) - Number(b.errors || 0))
        .slice(0, 100)
        .forEach((entry, index) => {
          rows.push({
            rank: index + 1,
            player: String(entry.player || currentName || 'Guest').slice(0, 24),
            value: `${Number(entry.wpm).toFixed(2)} WPM`,
            detail: `${Number(entry.accuracy || 0).toFixed(2)}% accuracy • ${String(entry.mode || 'Standard')} • ${Number(entry.duration || 0)}s`,
          });
        });
    }
  } else if (gameId === 'click-speed-test') {
    const entries = readJsonStorage('playrClickSpeedLeaderboard', []);
    if (Array.isArray(entries)) {
      entries
        .filter((entry) => entry && Number.isFinite(Number(entry.cps)))
        .sort((a, b) => Number(b.cps) - Number(a.cps) || Number(b.clicks || 0) - Number(a.clicks || 0))
        .slice(0, 100)
        .forEach((entry, index) => {
          rows.push({
            rank: index + 1,
            player: String(entry.name || 'Guest').slice(0, 24),
            value: `${Number(entry.cps).toFixed(2)} cps`,
            detail: `${Number(entry.clicks || 0)} clicks • ${Number(entry.duration || 0)}s`,
          });
        });
    }
  } else if (gameId === 'draw-a-perfect-circle') {
    const entries = readJsonStorage('playr.lb.draw-a-perfect-circle', []);
    if (Array.isArray(entries)) {
      entries
        .filter((entry) => entry && Number.isFinite(Number(entry.accuracy)))
        .sort((a, b) => Number(b.accuracy) - Number(a.accuracy) || Number(a.drawTimeMs || 0) - Number(b.drawTimeMs || 0))
        .slice(0, 100)
        .forEach((entry, index) => {
          rows.push({
            rank: index + 1,
            player: String(entry.player || 'Guest').slice(0, 24),
            value: `${Number(entry.accuracy).toFixed(2)}%`,
            detail: `${Number(entry.deviationPct || 0).toFixed(2)}% deviation • ${Number(entry.drawTimeMs || 0)}ms`,
          });
        });
    }
  } else if (gameId === 'simon-says') {
    const entries = readJsonStorage('playr-simon-says-board-v1', []);
    if (Array.isArray(entries)) {
      entries
        .filter((entry) => entry && Number.isFinite(Number(entry.score)))
        .sort((a, b) => Number(b.score) - Number(a.score))
        .slice(0, 100)
        .forEach((entry, index) => {
          rows.push({
            rank: index + 1,
            player: String(entry.mode ? `${entry.mode} • ${entry.date || 'Run'}` : entry.date || currentName).slice(0, 24),
            value: `${Number(entry.score)} rounds`,
            detail: 'Memory streak',
          });
        });
    }
  } else if (gameId === 'snake') {
    const scores = readJsonStorage('playr.snake.bestScores.v2', {});
    const entries = [
      { mode: 'Free Play', value: scores.freePlay },
      { mode: 'Trophy', value: scores.trophy },
    ].filter((entry) => Number.isFinite(Number(entry.value)) && Number(entry.value) > 0);
    entries
      .sort((a, b) => Number(b.value) - Number(a.value))
      .forEach((entry, index) => {
        rows.push({
          rank: index + 1,
          player: currentName,
          value: String(Number(entry.value)),
          detail: entry.mode,
        });
      });
  } else if (gameId === 'minesweeper') {
    const bestTimes = readJsonStorage('playr.minesweeper.bestTimes.v1', {});
    const entries = [
      { mode: 'Easy', value: bestTimes.easy },
      { mode: 'Medium', value: bestTimes.medium },
      { mode: 'Hard', value: bestTimes.hard },
    ].filter((entry) => Number.isFinite(Number(entry.value)) && Number(entry.value) > 0);
    entries
      .sort((a, b) => Number(a.value) - Number(b.value))
      .forEach((entry, index) => {
        rows.push({
          rank: index + 1,
          player: currentName,
          value: `${Number(entry.value)}s`,
          detail: entry.mode,
        });
      });
  }

  return rows.map((entry, index) => ({ ...entry, rank: index + 1 }));
}

function hydrateLeaderboardGames() {
  games.forEach((game, index) => {
    const spec = LEADERBOARD_SPECS[game.id] || null;
    if (!spec) return;

    const rows = normalizeLeaderboardRows(game.id, spec);
    game.leaderboardTop100 = rows;
    game.leaderboard = rows.slice(0, 5);
    game.leaderboardEligible = Boolean(spec);
    game.competitive = Boolean(spec);

    const currentAccount = getCurrentAccount();
    const currentName = currentAccount?.displayName || 'Guest';
    const bestRow = rows.find((row) => row && row.player) || null;
    game.currentPlayer = bestRow
      ? {
          username: currentName,
          rank: bestRow.rank,
          value: bestRow.value,
          secondaryValue: game.id === 'cookie-clicker' ? (game.currentPlayer?.secondaryValue ?? null) : null,
        }
      : game.currentPlayer;

    if (index === 0 && rows.length === 0) {
      game.leaderboardEligible = Boolean(spec);
    }
  });
}

function buildSinglePlayerGame(entry, index) {
  const lbSpec = LEADERBOARD_SPECS[entry.id] || null;
  const top100 = [];
  
  const resolvedSlug = SINGLE_PLAYER_SLUG_ALIASES[entry.id] || entry.id;
  const launchUrl = `/games/single-player/${resolvedSlug}`;
  
  return {
    id: entry.id,
    name: entry.name,
    controls: entry.controls,
    mode: '1P',
    category: 'single-player',
    competitive: Boolean(lbSpec),
    leaderboardEligible: Boolean(lbSpec),
    trending: index < 10,
    isNew: index % 4 === 0,
    topPlayers: Boolean(lbSpec),
    metric: lbSpec ? lbSpec.metric : 'Casual progression mode',
    status: '',
    accent: lbSpec ? 'accent' : 'warn',
    summary: `${entry.name} with ${entry.controls.toLowerCase()} controls.`,
    leaderboardLabel: lbSpec ? lbSpec.label : 'No leaderboard',
    leaderboardUnit: lbSpec ? lbSpec.unit : 'n/a',
    leaderboardTop100: top100,
    leaderboard: [],
    launchUrl,
    currentPlayer: null,
  };
}

function buildTwoPlayerGame(entry, index) {
  const launchUrl = MULTIPLAYER_IMPLEMENTED_IDS.has(entry.id)
    ? `/games/two-player/${entry.id}`
    : null;

  return {
    id: entry.id,
    name: entry.name,
    controls: entry.controls,
    mode: '2P',
    category: 'two-player',
    competitive: false,
    leaderboardEligible: false,
    trending: index < 6,
    isNew: index % 5 === 0,
    topPlayers: false,
    metric: 'No leaderboard (anti-alt policy)',
    status: '',
    accent: 'warn',
    summary: `${entry.name} placeholder. Host creates a shareable invite link for one guest.`,
    leaderboardLabel: 'No leaderboard',
    leaderboardUnit: 'n/a',
    leaderboardTop100: [],
    leaderboard: [],
    launchUrl,
    currentPlayer: null,
    requiresLoginForMatchmaking: true,
    inviteLinkReady: true,
  };
}

const games = [
  ...SINGLE_PLAYER_PLACEHOLDERS.map(buildSinglePlayerGame),
  ...MULTIPLAYER_PLACEHOLDERS.map(buildTwoPlayerGame),
];

const stats = [
  { label: '1P placeholders', value: String(SINGLE_PLAYER_PLACEHOLDERS.length) },
  { label: 'Multiplayer placeholders', value: String(MULTIPLAYER_PLACEHOLDERS.length) },
  { label: 'Leaderboard titles', value: String(Object.keys(LEADERBOARD_SPECS).length) },
];

const donationLeaderboard = [
  { player: 'Arcade Ally', value: '$120', detail: 'Monthly supporter' },
  { player: 'Pixel Patron', value: '$90', detail: 'Launch sponsor' },
  { player: 'GameHero', value: '$60', detail: 'Community boost' },
  { player: 'Atlas Fan', value: '$35', detail: 'Weekly donor' },
  { player: 'Console Cat', value: '$20', detail: 'First donation' },
];

const publishingFeatures = [
  {
    title: 'Random featured game',
    summary: 'Rotate a different game to the top of the page so the homepage always feels fresh.',
    accent: 'accent',
    state: 'Planned',
    hook: 'Link later',
  },
  {
    title: 'Daily leaderboard',
    summary: 'Show the best run from today for every game without changing the game-specific score format.',
    accent: 'warn',
    state: 'Planned',
    hook: 'Scheduled board',
  },
  {
    title: 'Weekly leaderboard',
    summary: 'Summarize the strongest runs from the current week and keep the competition visible.',
    accent: 'accent',
    state: 'Planned',
    hook: 'Weekly reset',
  },
  {
    title: 'Premium membership',
    summary: 'Add a no-ads supporter tier with room for small perks and future account features.',
    accent: 'danger',
    state: 'Planned',
    hook: 'No ads',
  },
  {
    title: 'Donation button',
    summary: 'Keep a one-click support option near the top of the site for future publishing.',
    accent: 'warn',
    state: 'Planned',
    hook: 'Support link',
  },
  {
    title: 'Donation leaderboard',
    summary: 'Recognize supporters with a separate leaderboard that tracks contributions instead of game scores.',
    accent: 'accent',
    state: 'Planned',
    hook: 'Supporter board',
  },
];

const gameGrid = document.getElementById('gameGrid');
const topbarControls = document.querySelector('.topbar-controls');
const leaderboardTabs = document.getElementById('leaderboardTabs');
const leaderboardCard = document.getElementById('leaderboardCard');
const leaderboardRangeFilters = document.getElementById('leaderboardRangeFilters');
const leaderboardAbout = document.getElementById('leaderboardAbout');
const leaderboardSection = document.getElementById('leaderboards');
const publishingGrid = document.getElementById('publishingGrid');
const libraryTabs = document.getElementById('libraryTabs');
const librarySearchShell = document.getElementById('librarySearchShell');
const gameSearch = document.getElementById('gameSearch');
const gameGridFooter = document.getElementById('gameGridFooter');
const showMoreGamesBtn = document.getElementById('showMoreGamesBtn');
const supportBtn = document.getElementById('supportBtn');
const supportSection = document.getElementById('support');
const donateBtn = document.getElementById('donateBtn');
const signalFilters = document.getElementById('signalFilters');
const filterSummary = document.getElementById('filterSummary');
const statsContainer = document.getElementById('stats');
const mineBoard = document.getElementById('mineBoard');
const mineState = document.getElementById('mineState');
const mineRemaining = document.getElementById('mineRemaining');
const mineTimer = document.getElementById('mineTimer');
const mineHint = document.getElementById('mineHint');
const mineRestart = document.getElementById('mineRestart');
const mineRevealCheat = document.getElementById('mineRevealCheat');
const mineDimensions = document.getElementById('mineDimensions');
const modeButtons = Array.from(document.querySelectorAll('[data-mode]'));
const scoreSavePanel = document.getElementById('scoreSavePanel');
const scoreSaveTitle = document.getElementById('scoreSaveTitle');
const scoreSaveBody = document.getElementById('scoreSaveBody');
const saveScoreLoginBtn = document.getElementById('saveScoreLoginBtn');
const dismissScorePanelBtn = document.getElementById('dismissScorePanelBtn');
const loginBtn = document.getElementById('loginBtn');
const notificationsBellBtn = document.getElementById('notificationsBellBtn');
const notificationsUnreadDot = document.getElementById('notificationsUnreadDot');
const notificationsDropdown = document.getElementById('notificationsDropdown');
const notificationsList = document.getElementById('notificationsList');
const notificationsEmpty = document.getElementById('notificationsEmpty');
const authOverlay = document.getElementById('authOverlay');
const authCloseBtn = document.getElementById('authCloseBtn');
const authTitle = document.getElementById('authTitle');
const authDescription = document.getElementById('authDescription');
const authFormSection = document.getElementById('authFormSection');
const authIdentifierInput = document.getElementById('authIdentifierInput');
const authIdentifierLabel = document.querySelector('label[for="authIdentifierInput"]');
const authIdentifierLabelText = authIdentifierLabel?.querySelector('span');
const authNameIndicator = document.getElementById('authNameIndicator');
const authPinInput = document.getElementById('authPinInput');
const authPinToggleBtn = document.getElementById('authPinToggleBtn');
const authPinLabel = document.querySelector('label[for="authPinInput"]');
const authCaptchaShell = document.getElementById('authCaptchaShell');
const authCaptchaContainer = document.getElementById('authCaptchaContainer');
const authCaptchaNote = document.getElementById('authCaptchaNote');
const authContinueBtn = document.getElementById('authContinueBtn');
const authModeToggleBtn = document.getElementById('authModeToggleBtn');
const authStatus = document.getElementById('authStatus');
const claimOverlay = document.getElementById('claimOverlay');
const claimLoginBtn = document.getElementById('claimLoginBtn');
const claimSignupBtn = document.getElementById('claimSignupBtn');
const systemOverlay = document.getElementById('systemOverlay');
const systemTitle = document.getElementById('systemTitle');
const systemMessage = document.getElementById('systemMessage');
const systemCancelBtn = document.getElementById('systemCancelBtn');
const systemConfirmBtn = document.getElementById('systemConfirmBtn');
const settingsOverlay = document.getElementById('settingsOverlay');
const settingsGrid = settingsOverlay?.querySelector('.settings-grid') || null;
const settingsCloseBtn = document.getElementById('settingsCloseBtn');
const settingsStatus = document.getElementById('settingsStatus');
const settingsDisplayInput = document.getElementById('settingsDisplayInput');
const settingsUpdateDisplayBtn = document.getElementById('settingsUpdateDisplayBtn');
const settingsCurrentPasswordInput = document.getElementById('settingsCurrentPasswordInput');
const settingsNewPasswordInput = document.getElementById('settingsNewPasswordInput');
const settingsUpdatePasswordBtn = document.getElementById('settingsUpdatePasswordBtn');
const settingsShowPasswordsToggle = document.getElementById('settingsShowPasswordsToggle');
const settingsLogoutBtn = document.getElementById('settingsLogoutBtn');
const settingsXpLevel = document.getElementById('settingsXpLevel');
const settingsXpTotal = document.getElementById('settingsXpTotal');
const settingsXpProgress = document.getElementById('settingsXpProgress');
const settingsXpProgressLabel = document.getElementById('settingsXpProgressLabel');
const settingsActiveToday = document.getElementById('settingsActiveToday');
const settingsMultiplayerToday = document.getElementById('settingsMultiplayerToday');
const settingsReferralCode = document.getElementById('settingsReferralCode');
const settingsReferralLink = document.getElementById('settingsReferralLink');
const settingsReferralCopyBtn = document.getElementById('settingsReferralCopyBtn');
const settingsQualifiedReferrals = document.getElementById('settingsQualifiedReferrals');
const settingsReferralRewards = document.getElementById('settingsReferralRewards');
const settingsBadgeSummary = document.getElementById('settingsBadgeSummary');
const settingsBadgeList = document.getElementById('settingsBadgeList');
const settingsBadgeCard = settingsBadgeSummary?.closest('.settings-card') || null;
const adminSettingsCard = document.getElementById('adminSettingsCard');
const ownerXpSettingsCard = document.getElementById('ownerXpSettingsCard');
const ownerXpAmountInput = document.getElementById('ownerXpAmountInput');
const ownerXpAddBtn = document.getElementById('ownerXpAddBtn');
const ownerXpRemoveBtn = document.getElementById('ownerXpRemoveBtn');
const adminGameSelect = document.getElementById('adminGameSelect');
const adminRankInput = document.getElementById('adminRankInput');
const adminPlayerInput = document.getElementById('adminPlayerInput');
const adminValueInput = document.getElementById('adminValueInput');
const adminDetailInput = document.getElementById('adminDetailInput');
const adminInjectScoreBtn = document.getElementById('adminInjectScoreBtn');
const adminQuickMinesBtn = document.getElementById('adminQuickMinesBtn');
const adminQuickCookiesBtn = document.getElementById('adminQuickCookiesBtn');
const adminResetScoresBtn = document.getElementById('adminResetScoresBtn');
const adminRevertScoresBtn = document.getElementById('adminRevertScoresBtn');
const adminPurgeUnknownAccountsBtn = document.getElementById('adminPurgeUnknownAccountsBtn');

const featuredTitle = document.getElementById('featuredTitle');
const featuredSummary = document.getElementById('featuredSummary');
const featuredControls = document.getElementById('featuredControls');
const featuredMetric = document.getElementById('featuredMetric');
const featuredRotation = document.getElementById('featuredRotation');
const featuredStatus = document.getElementById('featuredStatus');
const featuredMode = document.getElementById('featuredMode');
const featuredGameCard = document.getElementById('featuredGameCard');
const overscrollEasterEgg = document.getElementById('overscrollEasterEgg');
const hasMineUi = Boolean(
  mineBoard
  && mineState
  && mineRemaining
  && mineTimer
  && mineHint
  && mineRestart
  && mineDimensions,
);

const FEATURED_TAB_CONFIG = {
  all: { anchorId: 'pac-man' },
  'single-player': { anchorId: 'minesweeper' },
  'multiplayer': { anchorId: 'battleship' },
  competitive: { anchorId: 'pac-man' },
  leaderboard: { anchorId: 'snake' },
};

const pageMode = document.body?.dataset.page || 'home';
const initialHomeTab = (() => {
  if (pageMode === 'leaderboard') return 'leaderboard';
  try {
    const requested = new URL(window.location.href).searchParams.get('tab');
    return ['all', 'single-player', 'multiplayer', 'competitive'].includes(requested) ? requested : 'all';
  } catch {
    return 'all';
  }
})();
const GAME_GRID_BATCH_SIZE = {
  all: 6,
  'single-player': 6,
  multiplayer: 6,
  competitive: 6,
};

const uiState = {
  activeLibraryTab: initialHomeTab,
  activeSignalFilter: 'all',
  activeGameId: games[0]?.id || null,
  activeLeaderboardRange: 'levels',
  expandedLeaderboardByGame: {},
  adminPanelByGame: {},
  notificationsOpen: false,
  librarySearchQuery: '',
  featuredGameId: null,
  featuredLaunchUrl: null,
  visibleGameCount: GAME_GRID_BATCH_SIZE.all,
  lastScrollY: typeof window !== 'undefined' ? window.scrollY : 0,
  scrollDirection: 'idle',
};

function isHomeRoute() {
  const path = String(window.location.pathname || '/');
  return path === '/' || path === '/index.html';
}

function initOverscrollEasterEgg() {
  if (!overscrollEasterEgg || !isHomeRoute()) {
    return () => {};
  }

  let touchStartX = 0;
  let touchStartY = 0;
  let lastTriggeredAt = 0;
  let showDelayTimer = 0;
  let hideTimer = 0;
  let visible = false;
  let topReachedAt = Date.now();
  let wheelPullDistance = 0;
  let touchPullDistance = 0;

  function clearTimers() {
    window.clearTimeout(showDelayTimer);
    window.clearTimeout(hideTimer);
    showDelayTimer = 0;
    hideTimer = 0;
  }

  function hideToast() {
    visible = false;
    overscrollEasterEgg.classList.remove('visible');
  }

  function chooseMessage() {
    const index = Math.floor(Math.random() * OVERSCROLL_EASTER_EGG_MESSAGES.length);
    return OVERSCROLL_EASTER_EGG_MESSAGES[index] || OVERSCROLL_EASTER_EGG_MESSAGES[0];
  }

  function isAtTop() {
    return (window.scrollY || window.pageYOffset || 0) <= OVERSCROLL_EASTER_EGG_TOP_THRESHOLD;
  }

  function resetOverscrollAttempt() {
    wheelPullDistance = 0;
    touchPullDistance = 0;
  }

  function canTrigger() {
    return Date.now() - lastTriggeredAt >= OVERSCROLL_EASTER_EGG_COOLDOWN_MS;
  }

  function scheduleToast() {
    if (visible || showDelayTimer || !canTrigger()) {
      return;
    }

    lastTriggeredAt = Date.now();
    showDelayTimer = window.setTimeout(() => {
      showDelayTimer = 0;
      overscrollEasterEgg.textContent = chooseMessage();
      overscrollEasterEgg.classList.add('visible');
      visible = true;
      hideTimer = window.setTimeout(() => {
        hideTimer = 0;
        hideToast();
      }, OVERSCROLL_EASTER_EGG_VISIBLE_MS);
    }, OVERSCROLL_EASTER_EGG_DELAY_MS);
  }

  function updateScrollDirection() {
    const currentY = window.scrollY || window.pageYOffset || 0;
    if (currentY < uiState.lastScrollY) {
      uiState.scrollDirection = 'up';
    } else if (currentY > uiState.lastScrollY) {
      uiState.scrollDirection = 'down';
    }
    uiState.lastScrollY = currentY;
  }

  function maybeTriggerFromOverscroll(direction) {
    uiState.scrollDirection = direction;
    if (!isAtTop() || uiState.scrollDirection !== 'up') {
      return;
    }
    if ((Date.now() - topReachedAt) < OVERSCROLL_EASTER_EGG_TOP_SETTLE_MS) {
      return;
    }
    scheduleToast();
  }

  function handleScroll() {
    const previousY = uiState.lastScrollY;
    updateScrollDirection();
    if (isAtTop()) {
      if (previousY > OVERSCROLL_EASTER_EGG_TOP_THRESHOLD) {
        topReachedAt = Date.now();
        resetOverscrollAttempt();
      }
    } else {
      resetOverscrollAttempt();
    }
    if (!isAtTop() && visible) {
      hideToast();
    }
  }

  function handleWheel(event) {
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
      return;
    }
    if (event.deltaY < 0) {
      if (!isAtTop()) {
        return;
      }
      wheelPullDistance += Math.abs(event.deltaY);
      if (wheelPullDistance >= OVERSCROLL_EASTER_EGG_WHEEL_PULL_THRESHOLD) {
        wheelPullDistance = 0;
        maybeTriggerFromOverscroll('up');
      }
    } else if (event.deltaY > 0) {
      uiState.scrollDirection = 'down';
      wheelPullDistance = 0;
    }
  }

  function handleTouchStart(event) {
    const touch = event.touches?.[0];
    if (!touch) return;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }

  function handleTouchMove(event) {
    const touch = event.touches?.[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return;
    }
    if (deltaY > 14) {
      if (!isAtTop()) {
        touchPullDistance = 0;
        return;
      }
      touchPullDistance = Math.max(0, deltaY);
      if (touchPullDistance >= OVERSCROLL_EASTER_EGG_TOUCH_PULL_THRESHOLD) {
        touchPullDistance = 0;
        maybeTriggerFromOverscroll('up');
      }
    } else if (deltaY < -14) {
      uiState.scrollDirection = 'down';
      touchPullDistance = 0;
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('wheel', handleWheel, { passive: true });
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchmove', handleTouchMove, { passive: true });

  return () => {
    clearTimers();
    hideToast();
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('wheel', handleWheel);
    window.removeEventListener('touchstart', handleTouchStart);
    window.removeEventListener('touchmove', handleTouchMove);
  };
}

const authState = {
  profiles: readStoredProfiles(),
  currentUser: firebaseAuth?.currentUser || null,
  profileSyncTimer: 0,
  profileSyncUnsubscribe: null,
  lastCloudLeaderboardSyncAt: 0,
  cloudLeaderboardFetchInFlight: false,
  suspendProgressionSyncUntil: 0,
};

const authUiState = {
  step: 'form',
  mode: 'signup',
  pendingRegistration: null,
  showPassword: false,
  nameCheckRequestId: 0,
  captchaToken: '',
  captchaWidgetId: null,
  captchaVerifiedAt: 0,
  captchaVerificationId: '',
  captchaRenderPending: false,
};

const profileUi = {
  injected: false,
  friendsBtn: null,
  friendsUnreadDot: null,
  friendsOverlay: null,
  friendsCloseBtn: null,
  friendsStatus: null,
  friendsTabs: null,
  friendsList: null,
  friendsIncoming: null,
  friendsOutgoing: null,
  friendsAddInput: null,
  friendsAddBtn: null,
  profileOverlay: null,
  profileCloseBtn: null,
  profileBanner: null,
  profileBannerAnimationCanvas: null,
  profileBannerAnimationFrame: 0,
  profileName: null,
  profileMeta: null,
  profileStats: null,
  profileWarnings: null,
  profileStatus: null,
  profileActionArea: null,
  profileBadgeList: null,
  profileModeration: null,
  profileModerationComposer: null,
  profileModerationSummary: null,
  profileModerationTitle: null,
  profileModerationMessage: null,
  profileModerationDuration: null,
  profilePromoteBtn: null,
  profileDemoteBtn: null,
  profileWarnBtn: null,
  profileMuteBtn: null,
  profileBanBtn: null,
  profileComposeCancelBtn: null,
  profileComposeSubmitBtn: null,
  profileUnmuteBtn: null,
  profileUnbanBtn: null,
  profileCustomizeOverlay: null,
  profileCustomizeCloseBtn: null,
  profileCustomizeStatus: null,
  profileCustomizeBadgeSummary: null,
  profileCustomizeBadgeList: null,
  profileCustomizeBannerGrid: null,
  profileCustomizeCustomBannerList: null,
  settingsBannerCard: null,
  settingsBannerGrid: null,
  settingsCustomBannerList: null,
  settingsStaffDirectoryCard: null,
  settingsStaffDirectoryList: null,
  vipBannerUpsellOverlay: null,
  vipBannerUpsellPreview: null,
  vipBannerUpsellProgressBar: null,
  vipBannerUpsellProgressLabel: null,
  vipBannerUpsellCloseBtn: null,
};

const profileCacheState = {
  byLookup: {},
};

const socialState = {
  loadedAt: 0,
  activeTab: 'friends',
  friendDocs: {},
  incomingRequests: {},
  outgoingRequests: {},
  friendshipsUnsub: null,
  incomingUnsub: null,
  outgoingUnsub: null,
};

function readStoredAdminOverrides() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.adminOverrides);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function persistAdminOverrides(entries) {
  localStorage.setItem(AUTH_STORAGE_KEYS.adminOverrides, JSON.stringify(entries || {}));
}

const adminState = {
  overrides: readStoredAdminOverrides(),
  snapshots: {},
};

function isCurrentUserAdmin() {
  return isCurrentAccountAdmin();
}

function getAdminEligibleGames() {
  return games.filter((game) => game.leaderboardEligible && Array.isArray(game.leaderboardTop100));
}

function clampAdminRank(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.min(100, Math.floor(parsed)));
}

function applyAdminOverrideToGame(gameId, overrideEntry, persist = true) {
  const game = getGameById(gameId);
  if (!game || !Array.isArray(game.leaderboardTop100)) {
    return false;
  }

  if (!adminState.snapshots[gameId]) {
    adminState.snapshots[gameId] = {
      leaderboardTop100: JSON.parse(JSON.stringify(game.leaderboardTop100 || [])),
      leaderboard: JSON.parse(JSON.stringify(game.leaderboard || [])),
      currentPlayer: game.currentPlayer ? JSON.parse(JSON.stringify(game.currentPlayer)) : null,
    };
  }

  const rank = clampAdminRank(overrideEntry?.rank);
  const player = String(overrideEntry?.player || 'Owner').trim().slice(0, 24) || 'Owner';
  const value = String(overrideEntry?.value || '').trim();
  const detail = String(overrideEntry?.detail || 'Admin override').trim().slice(0, 48) || 'Admin override';

  if (!value) {
    return false;
  }

  const entries = Array.isArray(game.leaderboardTop100) ? [...game.leaderboardTop100] : [];
  const newEntry = {
    rank,
    player,
    value,
    detail,
  };

  entries.splice(rank - 1, 0, newEntry);
  const top100 = entries.slice(0, 100).map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));

  game.leaderboardTop100 = top100;
  game.leaderboard = top100.slice(0, 5);

  const account = getCurrentAccount();
  if (account && normalizeDisplayNameForLookup(account.displayName) === normalizeDisplayNameForLookup(player)) {
    game.currentPlayer = {
      username: player,
      rank,
      value,
      secondaryValue: game.id === 'cookie-clicker' ? (game.currentPlayer?.secondaryValue ?? null) : null,
    };
  }

  if (persist) {
    adminState.overrides[gameId] = {
      rank,
      player,
      value,
      detail,
      updatedAt: Date.now(),
    };
    persistAdminOverrides(adminState.overrides);
  }

  return true;
}

function applyPersistedAdminOverrides() {
  const overrideEntries = Object.entries(adminState.overrides || {});
  overrideEntries.forEach(([gameId, overrideEntry]) => {
    applyAdminOverrideToGame(gameId, overrideEntry, false);
  });
}

function seedAdminFormDefaults() {
  if (adminRankInput) adminRankInput.value = '1';
  if (adminDetailInput) adminDetailInput.value = 'Admin override';
  const account = getCurrentAccount();
  if (adminPlayerInput) {
    adminPlayerInput.value = account?.displayName || 'Owner';
  }
}

function populateAdminGameSelect() {
  if (!adminGameSelect) return;
  const eligibleGames = getAdminEligibleGames();
  adminGameSelect.innerHTML = eligibleGames
    .map((game) => `<option value="${game.id}">${game.name}</option>`)
    .join('');

  const activeEligible = eligibleGames.some((game) => game.id === uiState.activeGameId);
  if (activeEligible) {
    adminGameSelect.value = uiState.activeGameId;
  }
}

function runAdminInjection(options = {}) {
  if (!isCurrentUserAdmin()) {
    setSettingsStatus('Admin access denied. Sign in as Owner.', 'danger');
    return;
  }

  const gameId = String(options.gameId || adminGameSelect?.value || '').trim();
  const rank = clampAdminRank(options.rank ?? adminRankInput?.value);
  const player = String(options.player ?? adminPlayerInput?.value ?? 'Owner').trim();
  const value = String(options.value ?? adminValueInput?.value ?? '').trim();
  const detail = String(options.detail ?? adminDetailInput?.value ?? 'Admin override').trim();

  if (!gameId) {
    setSettingsStatus('Pick a game first.', 'danger');
    return;
  }

  if (!value) {
    setSettingsStatus('Enter a score value to inject.', 'danger');
    return;
  }

  const injected = applyAdminOverrideToGame(gameId, { rank, player, value, detail }, true);
  if (!injected) {
    setSettingsStatus('Could not inject score for that game.', 'danger');
    return;
  }

  uiState.activeGameId = gameId;
  refreshGameViews();
  updateLeaderboardAbout();
  setSettingsStatus(`Injected #${rank} for ${player} in ${gameId}.`, 'success');
}

function isLeaderboardAdminPanelVisible(gameId) {
  return uiState.adminPanelByGame[gameId] === true;
}

function toggleLeaderboardAdminPanel(gameId) {
  uiState.adminPanelByGame[gameId] = !isLeaderboardAdminPanelVisible(gameId);
}

function getQuickAbuseValueForGame(game) {
  if (!game) return '999999999';
  if (game.id === 'cookie-clicker') return 'inf';
  if (game.id === 'minesweeper') return '1s';
  const spec = LEADERBOARD_SPECS[game.id] || null;
  if (!spec) return '999999999';
  if (spec.kind === 'time') return '1s';
  if (spec.kind === 'accuracy') return '100.00%';
  if (spec.kind === 'distance') return '999999999m';
  return '999999999';
}

function getResetValueForGame(game) {
  const spec = LEADERBOARD_SPECS[game?.id] || null;
  if (game?.id === 'cookie-clicker') return '0 clicks';
  if (!spec) return '--';
  if (spec.kind === 'time') return '--';
  if (spec.kind === 'distance') return '--';
  if (spec.kind === 'accuracy') return '--';
  if (spec.kind === 'cookies') return '0 clicks';
  if (spec.kind === 'guesses') return '--';
  if (spec.kind === 'tile') return '--';
  if (spec.kind === 'count') return '0';
  if (spec.kind === 'score') return '0';
  if (spec.kind === 'cps') return '0.00 cps';
  return '0';
}

function runAdminResetScores(options = {}) {
  if (!isCurrentUserAdmin()) {
    setSettingsStatus('Admin access denied. Sign in as Owner.', 'danger');
    return;
  }

  const gameId = String(options.gameId || adminGameSelect?.value || '').trim();
  const game = getGameById(gameId);
  if (!game || !Array.isArray(game.leaderboardTop100)) {
    setSettingsStatus('Pick a valid game first.', 'danger');
    return;
  }

  if (!adminState.snapshots[gameId]) {
    adminState.snapshots[gameId] = {
      leaderboardTop100: JSON.parse(JSON.stringify(game.leaderboardTop100 || [])),
      leaderboard: JSON.parse(JSON.stringify(game.leaderboard || [])),
      currentPlayer: game.currentPlayer ? JSON.parse(JSON.stringify(game.currentPlayer)) : null,
    };
  }

  const resetValue = getResetValueForGame(game);
  game.leaderboardTop100 = game.leaderboardTop100.map((row, index) => ({
    ...row,
    rank: index + 1,
    value: resetValue,
    detail: 'No score recorded',
  }));
  game.leaderboard = game.leaderboardTop100.slice(0, 5);
  if (game.currentPlayer) {
    game.currentPlayer = {
      ...game.currentPlayer,
      value: resetValue,
      rank: game.currentPlayer.rank || 1,
    };
  }

  delete adminState.overrides[gameId];
  persistAdminOverrides(adminState.overrides);

  uiState.activeGameId = gameId;
  refreshGameViews();
  updateLeaderboardAbout();
  setSettingsStatus(`Reset ${gameId} to default no-score values.`, 'success');
}

function runAdminRevertScores(options = {}) {
  if (!isCurrentUserAdmin()) {
    setSettingsStatus('Admin access denied. Sign in as Owner.', 'danger');
    return;
  }

  const gameId = String(options.gameId || adminGameSelect?.value || '').trim();
  const game = getGameById(gameId);
  const snapshot = adminState.snapshots[gameId];
  if (!game || !snapshot) {
    setSettingsStatus('No saved pre-admin snapshot exists for that game yet.', 'info');
    return;
  }

  game.leaderboardTop100 = JSON.parse(JSON.stringify(snapshot.leaderboardTop100 || []));
  game.leaderboard = JSON.parse(JSON.stringify(snapshot.leaderboard || [])).slice(0, 5);
  game.currentPlayer = snapshot.currentPlayer ? JSON.parse(JSON.stringify(snapshot.currentPlayer)) : null;

  delete adminState.overrides[gameId];
  persistAdminOverrides(adminState.overrides);

  uiState.activeGameId = gameId;
  refreshGameViews();
  updateLeaderboardAbout();
  setSettingsStatus(`Reverted ${gameId} scores to the state before admin powers were used.`, 'success');
}

async function runAdminPurgeUnknownAccounts() {
  if (!isCurrentUserAdmin()) {
    setSettingsStatus('Admin access denied. Sign in as Owner.', 'danger');
    return;
  }

  if (!firebaseDb) {
    setSettingsStatus('Firestore is not available in this session.', 'danger');
    return;
  }

  const keepSet = new Set(['owner', 'johndoe']);
  try {
    const snapshot = await firebaseDb.collection(USER_PROFILE_COLLECTION).get();
    const toDelete = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((profile) => !keepSet.has(normalizeDisplayNameForLookup(profile.displayName || '')));

    if (toDelete.length === 0) {
      setSettingsStatus('No extra accounts found. Owner and Johndoe are the only remaining profiles.', 'success');
      return;
    }

    const batch = firebaseDb.batch();
    toDelete.forEach((profile) => {
      const uid = String(profile.id || '');
      if (uid) {
        batch.delete(firebaseDb.collection(USER_PROFILE_COLLECTION).doc(uid));
      }
      const normalized = normalizeDisplayNameForLookup(profile.displayName || '');
      if (normalized) {
        batch.delete(firebaseDb.collection(DISPLAY_NAME_COLLECTION).doc(normalized));
      }
      if (uid && authState.profiles[uid]) {
        delete authState.profiles[uid];
      }
    });

    await batch.commit();
    persistProfiles(authState.profiles);
    setSettingsStatus(`Removed ${toDelete.length} unknown account profile(s).`, 'success');
  } catch (error) {
    setSettingsStatus(getFirebaseAuthErrorMessage(error, 'Could not purge unknown accounts. Check Firestore rules.'), 'danger');
  }
}

let hasHandledInitialAuthState = false;

const mineModes = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 22, cols: 22, mines: 99 },
};

const mineStateData = {
  mode: 'easy',
  rows: mineModes.easy.rows,
  cols: mineModes.easy.cols,
  mines: mineModes.easy.mines,
  board: [],
  revealed: new Set(),
  flagged: new Set(),
  safeFirstClick: false,
  started: false,
  ended: false,
  won: false,
  timerId: null,
  seconds: 0,
  firstClickIndex: null,
  boardLocked: false,
};

function getCurrentAccount() {
  const user = authState.currentUser || firebaseAuth?.currentUser || null;
  if (!user) return null;

  const identifier = user.email || user.phoneNumber || user.uid;
  const identifierType = user.email ? 'email' : (user.phoneNumber ? 'phone' : 'uid');
  const storedProfile = authState.profiles[user.uid] || {};
  const displayName = storedProfile.displayName
    || user.displayName
    || createDisplayNameFromIdentifier({ type: identifierType, value: identifier });
  const roles = buildAccountRoles({
    roles: storedProfile.roles,
    isVip: storedProfile.isVip,
    identifierType,
    identifier,
  });
  const baseAccount = {
    uid: user.uid,
    identifier,
    identifierType,
    displayName,
    createdAt: normalizeTimestampToMs(storedProfile.createdAt) || getAuthUserCreatedAt(user),
    roles,
    isVip: roles.includes('vip'),
    verified: {
      email: Boolean(user.emailVerified),
      phone: Boolean(user.phoneNumber),
    },
    moderation: storedProfile.moderation || null,
    activity: storedProfile.activity || null,
    profileTheme: storedProfile.profileTheme || null,
  };
  const progression = getProgressionSnapshotForAccount(baseAccount);

  return {
    ...baseAccount,
    progression,
  };
}

function persistCurrentProfile(displayNameOverride = null) {
  const user = authState.currentUser;
  if (!user) return;

  const identifier = user.email || user.phoneNumber || user.uid;
  const identifierType = user.email ? 'email' : (user.phoneNumber ? 'phone' : 'uid');
  const previous = authState.profiles[user.uid] || {};
  const displayName = String(
    displayNameOverride
    || user.displayName
    || previous.displayName
    || createDisplayNameFromIdentifier({ type: identifierType, value: identifier }),
  ).slice(0, 24);
  const roles = buildAccountRoles({
    roles: previous.roles,
    isVip: previous.isVip,
    identifierType,
    identifier,
  });

  authState.profiles[user.uid] = {
    ...previous,
    uid: user.uid,
    displayName,
    identifier,
    identifierType,
    roles,
    isVip: roles.includes('vip'),
    updatedAt: Date.now(),
    createdAt: normalizeTimestampToMs(previous.createdAt) || getAuthUserCreatedAt(user) || Date.now(),
  };

  persistProfiles(authState.profiles);
}

function syncLegacyAuthState() {
  const account = getCurrentAccount();
  if (!account) {
    localStorage.removeItem(AUTH_STORAGE_KEYS.legacyLoggedIn);
    localStorage.removeItem(AUTH_STORAGE_KEYS.legacyUser);
    return;
  }

  localStorage.setItem(AUTH_STORAGE_KEYS.legacyLoggedIn, 'true');
  localStorage.setItem(
    AUTH_STORAGE_KEYS.legacyUser,
    JSON.stringify({
      uid: account.uid,
      displayName: account.displayName,
      identifier: account.identifier,
      identifierType: account.identifierType,
      verified: isAccountVerified(account),
      isAdmin: isCurrentAccountAdmin(account),
      isVip: isCurrentAccountVip(account),
      roles: account.roles || [],
      progression: account.progression || null,
      moderation: account.moderation || null,
    }),
  );
}

function exposePlayrAuth() {
  const account = getCurrentAccount();
  const verified = isAccountVerified(account);
  const isAdmin = isCurrentAccountAdmin(account);
  const isVip = isCurrentAccountVip(account);
  const roles = account?.roles || [];

  window.PlayrAuth = {
    isLoggedIn: Boolean(account),
    isVerified: verified,
    isAdmin,
    isVip,
    roles,
    user: account
      ? {
          uid: account.uid,
          displayName: account.displayName,
          identifier: account.identifier,
          identifierType: account.identifierType,
          verified,
          isAdmin,
          isVip,
          roles,
          progression: account.progression || null,
          moderation: account.moderation || null,
        }
      : null,
    getCurrentUser() {
      const liveAccount = getCurrentAccount();
      if (!liveAccount) return null;
      return {
        uid: liveAccount.uid,
        displayName: liveAccount.displayName,
        identifier: liveAccount.identifier,
        identifierType: liveAccount.identifierType,
        verified: isAccountVerified(liveAccount),
        isAdmin: isCurrentAccountAdmin(liveAccount),
        isVip: isCurrentAccountVip(liveAccount),
        roles: liveAccount.roles || [],
        progression: liveAccount.progression || null,
        moderation: liveAccount.moderation || null,
      };
    },
    getProgressionSnapshot() {
      return getProgressionSnapshotForAccount(getCurrentAccount());
    },
    formatIdentityMarkup(name, options = {}) {
      return formatPlayerIdentityMarkup(name, options);
    },
    openAuthModal() {
      setAuthMode('login');
      openAuthOverlay();
    },
    canPlayMultiplayer() {
      return Boolean(getCurrentAccount());
    },
    canAppearOnLeaderboard() {
      const current = getCurrentAccount();
      return Boolean(current && isAccountVerified(current) && !current.progression?.leaderboardRestricted);
    },
    canAccessAdminControls() {
      return isCurrentAccountAdmin();
    },
    canInteract() {
      return canCurrentAccountInteract(getCurrentAccount());
    },
    isMuted() {
      return isCurrentAccountMuted(getCurrentAccount());
    },
    isBanned() {
      return isCurrentAccountBanned(getCurrentAccount());
    },
    hasRole(roleName) {
      return hasAccountRole(getCurrentAccount(), roleName);
    },
    shouldShowAds() {
      return !isCurrentAccountVip();
    },
    async saveCustomBanner(entry = {}) {
      return saveNewCustomBanner(entry);
    },
  };

  window.dispatchEvent(new CustomEvent('playr-auth-changed', {
    detail: {
      isLoggedIn: Boolean(account),
      isVerified: verified,
      isAdmin,
      isVip,
      roles,
    },
  }));
}

async function syncCurrentAccountRolesToFirestore() {
  const account = getCurrentAccount();
  if (!account?.uid || !firebaseDb) return;

  const profile = authState.profiles[account.uid] || {};
  const roles = buildAccountRoles({
    roles: profile.roles,
    isVip: profile.isVip,
    identifierType: account.identifierType,
    identifier: account.identifier,
  });
  const vipFlag = roles.includes('vip');

  authState.profiles[account.uid] = {
    ...profile,
    uid: account.uid,
    displayName: account.displayName,
    identifier: account.identifier,
    identifierType: account.identifierType,
    roles,
    isVip: vipFlag,
    updatedAt: Date.now(),
    createdAt: normalizeTimestampToMs(profile.createdAt) || normalizeTimestampToMs(account.createdAt) || Date.now(),
  };
  persistProfiles(authState.profiles);

  try {
    const timestamp = window.firebase.firestore.FieldValue.serverTimestamp();
    await firebaseDb.collection(USER_PROFILE_COLLECTION).doc(account.uid).set({
      uid: account.uid,
      displayName: account.displayName,
      normalizedDisplayName: normalizeDisplayNameForLookup(account.displayName),
      identifier: account.identifier,
      identifierType: account.identifierType,
      roles,
      isVip: vipFlag,
      updatedAt: timestamp,
    }, { merge: true });
  } catch {
    // Keep the local VIP cache even if Firestore sync is temporarily unavailable.
  }
}

function setAuthStatus(message, tone = 'info') {
  if (!authStatus) return;
  authStatus.textContent = message || '';
  authStatus.style.color = tone === 'danger' ? '#ff9cb1' : tone === 'success' ? '#9ff5cb' : '#d2e5ff';
}

function getCaptchaConfig() {
  const config = window.PlayrCaptchaConfig && typeof window.PlayrCaptchaConfig === 'object'
    ? window.PlayrCaptchaConfig
    : {};
  return {
    provider: String(config.provider || 'turnstile').trim().toLowerCase(),
    turnstileEnabled: Boolean(config.turnstileEnabled),
    turnstileSiteKey: String(config.turnstileSiteKey || '').trim(),
  };
}

function resetSignupCaptchaState({ resetWidget = true } = {}) {
  authUiState.captchaToken = '';
  authUiState.captchaVerifiedAt = 0;
  authUiState.captchaVerificationId = '';
  const turnstileApi = window.turnstile;
  if (resetWidget && turnstileApi && authUiState.captchaWidgetId != null) {
    try {
      turnstileApi.reset(authUiState.captchaWidgetId);
    } catch {
      // Ignore widget reset issues and let the next render attempt recover.
    }
  }
}

function shouldRequireSignupCaptcha() {
  const config = getCaptchaConfig();
  return authUiState.mode === 'signup'
    && config.provider === 'turnstile'
    && config.turnstileEnabled
    && Boolean(config.turnstileSiteKey);
}

function renderSignupCaptchaIfNeeded() {
  if (!authCaptchaShell || !authCaptchaContainer) return;
  const config = getCaptchaConfig();
  const shouldShow = shouldRequireSignupCaptcha();
  authCaptchaShell.hidden = !shouldShow;
  if (!shouldShow) {
    resetSignupCaptchaState({ resetWidget: true });
    return;
  }
  if (!window.turnstile || typeof window.turnstile.render !== 'function') {
    if (authCaptchaNote) {
      authCaptchaNote.textContent = 'Captcha is still loading. Please wait a moment.';
    }
    authUiState.captchaRenderPending = true;
    return;
  }
  authUiState.captchaRenderPending = false;
  if (authCaptchaNote) {
    authCaptchaNote.textContent = 'Complete the captcha before creating your first account. This helps block fake referrals.';
  }
  if (authUiState.captchaWidgetId == null) {
    authCaptchaContainer.innerHTML = '';
    authUiState.captchaWidgetId = window.turnstile.render(authCaptchaContainer, {
      sitekey: config.turnstileSiteKey,
      theme: 'dark',
      size: 'flexible',
      callback(token) {
        authUiState.captchaToken = String(token || '').trim();
        authUiState.captchaVerifiedAt = Date.now();
        if (authCaptchaNote) {
          authCaptchaNote.textContent = 'Captcha completed. You can create the account now.';
        }
      },
      'expired-callback': function expiredCallback() {
        authUiState.captchaToken = '';
        authUiState.captchaVerifiedAt = 0;
        if (authCaptchaNote) {
          authCaptchaNote.textContent = 'Captcha expired. Please complete it again.';
        }
      },
      'error-callback': function errorCallback() {
        authUiState.captchaToken = '';
        authUiState.captchaVerifiedAt = 0;
        if (authCaptchaNote) {
          authCaptchaNote.textContent = 'Captcha could not load cleanly. Please retry.';
        }
        return true;
      },
    });
    return;
  }
  resetSignupCaptchaState({ resetWidget: false });
  try {
    window.turnstile.reset(authUiState.captchaWidgetId);
  } catch {
    authUiState.captchaWidgetId = null;
    renderSignupCaptchaIfNeeded();
  }
}

async function verifySignupCaptchaToken() {
  if (!shouldRequireSignupCaptcha()) {
    return { ok: true, result: null };
  }
  const token = String(authUiState.captchaToken || '').trim();
  if (!token) {
    return { ok: false, message: 'Complete the captcha before creating your account.' };
  }
  if (!firebaseFunctions) {
    return { ok: false, message: 'Firebase Functions is not available for captcha verification on this page.' };
  }
  try {
    const callable = firebaseFunctions.httpsCallable('verifySignupCaptcha');
    const response = await callable({
      token,
      action: 'signup',
      loginName: String(authIdentifierInput?.value || '').trim(),
    });
    const data = response?.data || {};
    if (!data.success) {
      resetSignupCaptchaState({ resetWidget: true });
      return { ok: false, message: 'Captcha verification failed. Please try again.' };
    }
    authUiState.captchaVerificationId = String(data.verificationId || '').trim();
    return { ok: true, result: data };
  } catch {
    resetSignupCaptchaState({ resetWidget: true });
    return { ok: false, message: 'Captcha verification could not be completed. Please try again.' };
  }
}

async function claimVerifiedSignupCaptcha(verificationId) {
  const safeVerificationId = String(verificationId || '').trim();
  if (!safeVerificationId || !firebaseFunctions) {
    return { ok: false };
  }
  try {
    const callable = firebaseFunctions.httpsCallable('claimSignupCaptchaVerification');
    const response = await callable({ verificationId: safeVerificationId });
    return { ok: Boolean(response?.data?.success) };
  } catch {
    return { ok: false };
  }
}

function setAuthNameIndicator(state = 'idle') {
  if (!authNameIndicator) return;
  authNameIndicator.dataset.state = state;
  authNameIndicator.hidden = state === 'idle';
}

function buildSignupNameMessage(validation, suggestions = []) {
  const suggestionText = suggestions.length ? ` Try: ${suggestions.join(', ')}.` : '';
  if (!validation || validation.valid) return '';

  if (validation.reasonCode === 'restricted-language') {
    return `That login name includes a blocked word or inappropriate language.${suggestionText}`;
  }

  if (validation.reasonCode === 'reserved-term') {
    return `That login name looks like a staff or system name, so it can’t be used.${suggestionText}`;
  }

  return `${validation.reason}${suggestionText}`;
}

async function refreshSignupNameIndicator() {
  const currentRequestId = ++authUiState.nameCheckRequestId;

  if (authUiState.mode !== 'signup' || !authIdentifierInput) {
    setAuthNameIndicator('idle');
    return;
  }

  const requestedName = String(authIdentifierInput.value || '').trim();
  if (!requestedName) {
    setAuthNameIndicator('idle');
    return;
  }

  const validation = validateDisplayName(requestedName);
  if (!validation.valid) {
    setAuthNameIndicator('invalid');
    return;
  }

  setAuthNameIndicator('checking');

  try {
    const availability = await checkDisplayNameAvailability(validation.cleaned);
    if (currentRequestId !== authUiState.nameCheckRequestId) return;
    setAuthNameIndicator(availability.available ? 'valid' : 'invalid');
  } catch {
    if (currentRequestId !== authUiState.nameCheckRequestId) return;
    setAuthNameIndicator('invalid');
  }
}

function isDisplayNameTaken(displayName, ignoreIdentifier = null) {
  const normalized = String(displayName || '').trim().toLowerCase();
  if (!normalized) return false;
  return Object.values(authState.profiles).some((account) => {
    if (!account) return false;
    if (ignoreIdentifier && account.identifier === ignoreIdentifier) return false;
    return String(account.displayName || '').trim().toLowerCase() === normalized;
  });
}

function setAuthMode(mode) {
  authUiState.mode = mode === 'login' ? 'login' : 'signup';
}

function setAuthPasswordVisibility(show) {
  const isVisible = Boolean(show);
  authUiState.showPassword = isVisible;
  if (authPinInput) {
    authPinInput.type = isVisible ? 'text' : 'password';
  }
  if (authPinToggleBtn) {
    authPinToggleBtn.setAttribute('aria-pressed', isVisible ? 'true' : 'false');
    authPinToggleBtn.setAttribute('aria-label', isVisible ? 'Hide password' : 'Show password');
    authPinToggleBtn.title = isVisible ? 'Hide password' : 'Show password';
  }
}

function toggleAuthMode() {
  setAuthMode(authUiState.mode === 'signup' ? 'login' : 'signup');
  if (authPinInput) authPinInput.value = '';
  if (authIdentifierInput) authIdentifierInput.value = '';
  authUiState.nameCheckRequestId += 1;
  resetSignupCaptchaState({ resetWidget: true });
  setAuthNameIndicator('idle');
  setAuthPasswordVisibility(false);
  setAuthStatus('', 'info');
  renderAuthUi();
}

function showClaimOverlay() {
  if (!claimOverlay) return false;
  claimOverlay.hidden = false;
  return true;
}

function hideClaimOverlay() {
  if (!claimOverlay) return;
  claimOverlay.hidden = true;
}

let systemDialogResolver = null;

function closeSystemDialog(result = false) {
  if (systemOverlay) {
    systemOverlay.hidden = true;
  }

  if (systemDialogResolver) {
    const resolver = systemDialogResolver;
    systemDialogResolver = null;
    resolver(Boolean(result));
  }
}

function openSystemDialog(message, options = {}) {
  if (!systemOverlay || !systemMessage || !systemConfirmBtn || !systemCancelBtn) {
    return Promise.resolve(true);
  }

  if (systemTitle) {
    systemTitle.textContent = options.title || 'Confirm action';
  }
  systemMessage.textContent = message || '';
  systemConfirmBtn.textContent = options.confirmText || 'OK';
  systemCancelBtn.textContent = options.cancelText || 'Cancel';
  systemOverlay.hidden = false;

  return new Promise((resolve) => {
    systemDialogResolver = resolve;
  });
}

function setSettingsStatus(message, tone = 'info') {
  if (!settingsStatus) return;
  settingsStatus.textContent = message || '';
  settingsStatus.style.color = tone === 'danger' ? '#ff9cb1' : tone === 'success' ? '#9ff5cb' : '#d2e5ff';
}

function setProfileCustomizationStatus(message, tone = 'info') {
  if (!profileUi.profileCustomizeStatus) return;
  profileUi.profileCustomizeStatus.textContent = message || '';
  profileUi.profileCustomizeStatus.style.color = tone === 'danger' ? '#ff9cb1' : tone === 'success' ? '#9ff5cb' : '#d2e5ff';
}

function setProfileCustomizationMessage(message, tone = 'info') {
  setSettingsStatus(message, tone);
  setProfileCustomizationStatus(message, tone);
}

function getExtraBadgeOptions(progression = {}) {
  const availableBadges = Array.isArray(progression.availableBadges) ? progression.availableBadges : [];
  return availableBadges.filter((badge) => {
    const badgeId = String(badge?.id || '').trim();
    return badgeId
      && badgeId !== 'level'
      && badgeId !== 'owner'
      && badgeId !== 'vip'
      && badgeId !== 'support'
      && badgeId !== 'moderator'
      && badgeId !== 'admin'
      && !badgeId.startsWith('donation-');
  });
}

function renderBadgeManagerInto(summaryEl, listEl, account = getCurrentAccount()) {
  if (!summaryEl || !listEl) return;
  const progression = getProgressionSnapshotForAccount(account);
  const mandatoryStaffRole = getAccountPrimaryRole(account);
  const extraBadges = getExtraBadgeOptions(progression);
  const equippedIds = Array.isArray(progression.equippedBadgeIds) ? progression.equippedBadgeIds : [];
  const equippedSet = new Set(equippedIds);

  summaryEl.textContent = mandatoryStaffRole
    ? `${Math.min(equippedIds.length + 1, 5)}/5 visible tag slots used. Your ${mandatoryStaffRole} staff badge is permanent and uses 1 slot.`
    : `${Math.min(equippedIds.length, 5)}/5 extra badges equipped. Level is always shown by default.`;
  listEl.innerHTML = '';

  if (!extraBadges.length) {
    const empty = document.createElement('p');
    empty.className = 'settings-muted';
    empty.textContent = 'No extra earned badges yet. As you unlock them, you can equip up to 5 here.';
    listEl.appendChild(empty);
    return;
  }

  extraBadges.forEach((badge) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `settings-tag-option${equippedSet.has(badge.id) ? ' is-equipped' : ''}`;
    button.dataset.badgeId = badge.id;
    button.setAttribute('aria-pressed', equippedSet.has(badge.id) ? 'true' : 'false');
    button.title = badge.description || badge.title || badge.label || badge.id;

    const preview = document.createElement('span');
    preview.className = 'settings-tag-option-preview';
    if (window.PlayrProgression?.formatBadgeMarkup) {
      preview.innerHTML = window.PlayrProgression.formatBadgeMarkup(badge);
    } else {
      preview.textContent = badge.label || badge.id;
    }

    const stateLabel = document.createElement('span');
    stateLabel.className = 'settings-tag-option-state';
    stateLabel.textContent = equippedSet.has(badge.id) ? 'Equipped' : 'Available';

    const details = document.createElement('span');
    details.className = 'settings-tag-option-details';

    const desc = document.createElement('span');
    desc.className = 'settings-tag-option-description';
    desc.textContent = badge.description || badge.title || 'Hover for details';

    details.append(stateLabel, desc);
    button.append(preview, details);
    listEl.appendChild(button);
  });
}

function renderSettingsBadgeManager(account = getCurrentAccount()) {
  renderBadgeManagerInto(settingsBadgeSummary, settingsBadgeList, account);
}

function renderProfileCustomizationBadgeManager(account = getCurrentAccount()) {
  renderBadgeManagerInto(profileUi.profileCustomizeBadgeSummary, profileUi.profileCustomizeBadgeList, account);
}

function renderSettingsProgression(account = getCurrentAccount()) {
  const progression = getProgressionSnapshotForAccount(account);
  if (settingsXpLevel) settingsXpLevel.textContent = `Level ${progression.level}`;
  if (settingsXpTotal) settingsXpTotal.textContent = `${Math.round(progression.xp)} XP`;
  if (settingsXpProgress) settingsXpProgress.style.width = `${Math.round((progression.progress || 0) * 100)}%`;
  if (settingsXpProgressLabel) {
    settingsXpProgressLabel.textContent = Number.isFinite(Number(progression.nextThreshold))
      ? `${Math.round(progression.xp)} / ${Math.round(progression.nextThreshold)} XP`
      : `${Math.round(progression.xp)} XP / MAX`;
  }
  if (settingsActiveToday) settingsActiveToday.textContent = `${progression.activeTodayMinutes} min`;
  if (settingsMultiplayerToday) settingsMultiplayerToday.textContent = `${progression.multiplayerTodayMinutes} min`;
  if (settingsReferralCode) settingsReferralCode.textContent = progression.referralCode || '--';
  if (settingsReferralLink) settingsReferralLink.value = progression.referralLink || '';
  if (settingsQualifiedReferrals) {
    settingsQualifiedReferrals.textContent = String(progression.qualifiedReferrals || 0);
  }
  if (settingsReferralRewards) {
    settingsReferralRewards.innerHTML = [
      { count: 1, reward: '+50 XP + Recruiter I tag' },
      { count: 3, reward: '+150 XP + Recruiter II tag' },
      { count: 5, reward: '+300 XP + Recruiter III tag' },
      { count: 10, reward: '+600 XP + animated Scoutmaster tag' },
      { count: 25, reward: '+1500 XP + animated Signal Sovereign tag + 1-week VIP perk' },
    ].map((tier) => `
      <div class="settings-tier-row ${progression.qualifiedReferrals >= tier.count ? 'claimed' : ''}">
        <strong>${tier.count}</strong>
        <span>${tier.reward}</span>
      </div>
    `).join('');
  }
}

function renderProfileCustomizationPanel(account = getCurrentAccount()) {
  ensureProfileAndFriendsUi();
  renderProfileCustomizationBadgeManager(account);
  renderProfileCustomizationBannerSettings(account);
}

function toggleEquippedSettingsBadge(badgeId) {
  const safeBadgeId = String(badgeId || '').trim();
  if (!safeBadgeId || safeBadgeId === 'level') return;
  const account = getCurrentAccount();
  if (!account) {
    setProfileCustomizationMessage('Log in to manage your tags.', 'danger');
    return;
  }

  const progression = getProgressionSnapshotForAccount(account);
  const availableIds = new Set((progression.availableBadges || []).map((badge) => String(badge?.id || '')));
  if (!availableIds.has(safeBadgeId)) {
    setProfileCustomizationMessage('That tag is not unlocked on this account.', 'danger');
    return;
  }

  const nextEquipped = Array.isArray(progression.equippedBadgeIds) ? [...progression.equippedBadgeIds] : [];
  const mandatoryStaffRole = getAccountPrimaryRole(account);
  const maxEquipCount = mandatoryStaffRole ? 4 : 5;
  const existingIndex = nextEquipped.indexOf(safeBadgeId);
  if (existingIndex >= 0) {
    nextEquipped.splice(existingIndex, 1);
  } else {
    if (nextEquipped.length >= maxEquipCount) {
      setProfileCustomizationMessage(mandatoryStaffRole ? `Your ${mandatoryStaffRole} staff badge uses 1 of the 5 visible slots.` : 'You can equip up to 5 extra badges at a time.', 'info');
      return;
    }
    nextEquipped.push(safeBadgeId);
  }

  const snapshot = window.PlayrProgression?.setEquippedBadges?.(nextEquipped);
  if (!snapshot) {
    setProfileCustomizationMessage('Could not update equipped tags right now.', 'danger');
    return;
  }

  authState.profiles = readStoredProfiles();
  syncLegacyAuthState();
  exposePlayrAuth();
  refreshSettingsProgressionIfOpen();
  renderProfileCustomizationBadgeManager(account);
  setProfileCustomizationMessage(existingIndex >= 0 ? 'Tag unequipped.' : 'Tag equipped.', 'success');
}

function openSettingsOverlay() {
  const account = getCurrentAccount();
  if (!account) {
    setAuthMode('login');
    openAuthOverlay('Log in to open settings.');
    return;
  }

  authState.profiles = readStoredProfiles();
  if (settingsDisplayInput) settingsDisplayInput.value = account.displayName || '';
  if (settingsCurrentPasswordInput) settingsCurrentPasswordInput.value = '';
  if (settingsNewPasswordInput) settingsNewPasswordInput.value = '';
  if (settingsShowPasswordsToggle) settingsShowPasswordsToggle.checked = false;
  setSettingsPasswordVisibility(false);
  renderSettingsProgression(account);
  void renderStaffDirectory(account);
  if (settingsBadgeCard) {
    settingsBadgeCard.hidden = true;
  }

  const isAdmin = isCurrentAccountAdmin(account);
  const isOwner = isOwnerAccount(account);
  if (adminSettingsCard) {
    adminSettingsCard.hidden = !isAdmin;
  }
  if (ownerXpSettingsCard) {
    ownerXpSettingsCard.hidden = !isOwner;
  }
  if (isAdmin) {
    populateAdminGameSelect();
    seedAdminFormDefaults();
  }
  if (isOwner && ownerXpAmountInput) {
    ownerXpAmountInput.value = String(Math.max(1, Math.trunc(Number(ownerXpAmountInput.value) || 100)));
  }

  if (settingsOverlay) settingsOverlay.hidden = false;
  setSettingsStatus('');
}

function closeSettingsOverlay() {
  if (!settingsOverlay) return;
  settingsOverlay.hidden = true;
  setSettingsStatus('');
}

function setSettingsPasswordVisibility(show) {
  const type = show ? 'text' : 'password';
  if (settingsCurrentPasswordInput) settingsCurrentPasswordInput.type = type;
  if (settingsNewPasswordInput) settingsNewPasswordInput.type = type;
}

async function updateDisplayNameFromSettings() {
  const user = firebaseAuth?.currentUser || authState.currentUser;
  if (!user) {
    setSettingsStatus('Log in first to change your display name.', 'danger');
    return;
  }

  const requested = String(settingsDisplayInput?.value || '').trim();
  const validation = validateDisplayName(requested);
  if (!validation.valid) {
    const suggestions = suggestLocalDisplayNames(requested, 3);
    const suggestionText = suggestions.length ? ` Try: ${suggestions.join(', ')}.` : '';
    setSettingsStatus(`${validation.reason}${suggestionText}`, 'danger');
    return;
  }

  const cleaned = validation.cleaned;
  const normalized = normalizeDisplayNameForLookup(cleaned);
  const oldDisplay = user.displayName || authState.profiles[user.uid]?.displayName || '';
  const oldNormalized = normalizeDisplayNameForLookup(oldDisplay);
  if (normalized === oldNormalized) {
    setSettingsStatus('Display name is unchanged.', 'info');
    return;
  }

  if (!firebaseDb) {
    setSettingsStatus('Firestore is required to update display names.', 'danger');
    return;
  }

  try {
    const availability = await checkDisplayNameAvailability(cleaned, user.uid);
    if (!availability.available) {
      const suggestions = await suggestAvailableDisplayNames(cleaned, 3);
      const suggestionText = suggestions.length ? ` Try: ${suggestions.join(', ')}.` : '';
      setSettingsStatus(`That display name is already in use.${suggestionText}`, 'danger');
      return;
    }

    const timestamp = window.firebase.firestore.FieldValue.serverTimestamp();
    const identifier = user.email || user.phoneNumber || authState.profiles[user.uid]?.identifier || user.uid;
    const identifierType = user.email ? 'email' : (user.phoneNumber ? 'phone' : (authState.profiles[user.uid]?.identifierType || 'uid'));

    await firebaseDb.runTransaction(async (transaction) => {
      const newRef = firebaseDb.collection(DISPLAY_NAME_COLLECTION).doc(normalized);
      const newSnapshot = await transaction.get(newRef);
      const existingUid = newSnapshot.exists ? newSnapshot.data()?.uid : null;
      if (newSnapshot.exists && existingUid !== user.uid) {
        throw { code: 'auth/display-name-taken' };
      }

      const profileRef = firebaseDb.collection(USER_PROFILE_COLLECTION).doc(user.uid);
      const profileSnapshot = await transaction.get(profileRef);
      const existingProfileData = profileSnapshot.exists ? (profileSnapshot.data() || {}) : {};
      const roles = buildAccountRoles({
        roles: existingProfileData.roles,
        isVip: existingProfileData.isVip,
        identifierType,
        identifier,
      });
      const vipFlag = roles.includes('vip');

      transaction.set(newRef, {
        uid: user.uid,
        displayName: cleaned,
        normalized,
        isAdmin: false,
        isVip: vipFlag,
        roles,
        createdAt: newSnapshot.exists ? (newSnapshot.data()?.createdAt || timestamp) : timestamp,
        updatedAt: timestamp,
      }, { merge: true });

      transaction.set(profileRef, {
        uid: user.uid,
        displayName: cleaned,
        normalizedDisplayName: normalized,
        identifier,
        identifierType,
        isAdmin: false,
        isVip: vipFlag,
        roles,
        updatedAt: timestamp,
      }, { merge: true });

      if (oldNormalized && oldNormalized !== normalized) {
        const oldRef = firebaseDb.collection(DISPLAY_NAME_COLLECTION).doc(oldNormalized);
        transaction.delete(oldRef);
      }
    });

    await user.updateProfile({ displayName: cleaned });
    authState.currentUser = user;
    persistCurrentProfile(cleaned);
    syncLegacyAuthState();
    exposePlayrAuth();
    renderAuthUi();
    refreshGameViews();
    setSettingsStatus('Display name updated.', 'success');
  } catch (error) {
    setSettingsStatus(getFirebaseAuthErrorMessage(error, 'Could not update display name.'), 'danger');
  }
}

async function reauthenticateEmailUser(currentPassword) {
  const user = firebaseAuth?.currentUser || null;
  if (!user) throw { code: 'auth/no-current-user' };
  if (!user.email) throw { code: 'auth/email-required' };
  const password = String(currentPassword || '').trim();
  if (!password) throw { code: 'auth/missing-password' };
  const credential = window.firebase.auth.EmailAuthProvider.credential(user.email, password);
  await user.reauthenticateWithCredential(credential);
  return user;
}

async function updatePasswordFromSettings() {
  const newPassword = String(settingsNewPasswordInput?.value || '').trim();
  if (!newPassword) {
    setSettingsStatus('Enter a new password.', 'danger');
    return;
  }
  if (newPassword.length < 6) {
    setSettingsStatus('New password must be at least 6 characters.', 'danger');
    return;
  }

  try {
    const user = await reauthenticateEmailUser(settingsCurrentPasswordInput?.value || '');
    await user.updatePassword(newPassword);
    if (settingsNewPasswordInput) settingsNewPasswordInput.value = '';
    if (settingsCurrentPasswordInput) settingsCurrentPasswordInput.value = '';
    setSettingsStatus('Password updated.', 'success');
  } catch (error) {
    if (error?.code === 'auth/missing-password') {
      setSettingsStatus('Enter your current password to change password.', 'danger');
      return;
    }
    if (error?.code === 'auth/email-required') {
      setSettingsStatus('Password changes are available for email-based accounts only.', 'danger');
      return;
    }
    setSettingsStatus(getFirebaseAuthErrorMessage(error, 'Could not update password.'), 'danger');
  }
}

function updateOwnerXpFromSettings(direction = 'add') {
  const account = getCurrentAccount();
  if (!account) {
    setSettingsStatus('Log in first to change XP.', 'danger');
    return;
  }

  if (!isOwnerAccount(account)) {
    setSettingsStatus('This XP panel is restricted to the owner account.', 'danger');
    return;
  }

  const rawAmount = Math.trunc(Number(ownerXpAmountInput?.value) || 0);
  if (rawAmount <= 0) {
    setSettingsStatus('Enter an XP amount greater than 0.', 'danger');
    return;
  }

  const delta = direction === 'remove' ? -rawAmount : rawAmount;
  const snapshot = window.PlayrProgression?.adjustCurrentXp?.(delta, { notifyLevelUp: delta > 0 });
  if (!snapshot) {
    setSettingsStatus('Could not update XP right now.', 'danger');
    return;
  }

  renderSettingsProgression(getCurrentAccount());
  setSettingsStatus(
    delta > 0 ? `Added ${rawAmount} XP to your account.` : `Removed ${rawAmount} XP from your account.`,
    'success',
  );
}

async function logoutFromSettings() {
  const shouldLogout = await openSystemDialog('Log out of your PlayR account?', {
    title: 'Log out',
    confirmText: 'Log out',
    cancelText: 'Stay signed in',
  });
  if (!shouldLogout) {
    setSettingsStatus('Stayed signed in.', 'info');
    return;
  }

  closeSettingsOverlay();
  try {
    await logoutCurrentAccount();
  } catch (error) {
    openSettingsOverlay();
    setSettingsStatus(getFirebaseAuthErrorMessage(error, 'Could not log out right now. Try again.'), 'danger');
  }
}

async function logoutCurrentAccount() {
  if (!firebaseAuth) {
    openAuthOverlay('Firebase is not initialized for this page.');
    setAuthStatus('Firebase is not initialized for this page.', 'danger');
    return;
  }

  let signOutError = null;
  try {
    await firebaseAuth.signOut();
  } catch (error) {
    signOutError = error;
  }

  if (signOutError) {
    openAuthOverlay('Could not log out right now.');
    setAuthStatus(getFirebaseAuthErrorMessage(signOutError, 'Could not log out right now. Try again.'), 'danger');
    return;
  }

  authState.currentUser = null;
  stopCurrentUserProfileSubscription();
  window.clearTimeout(authState.profileSyncTimer);
  authState.profileSyncTimer = 0;
  closeFriendsSubscriptions();
  socialState.friendDocs = {};
  socialState.incomingRequests = {};
  socialState.outgoingRequests = {};
  renderFriendsPanel();
  authUiState.pendingRegistration = null;
  authUiState.step = 'form';
  setAuthMode('signup');
  syncLegacyAuthState();
  exposePlayrAuth();
  renderAuthUi();
  refreshGameViews();
  hideClaimOverlay();
  openAuthOverlay('Logged out successfully.');
  setAuthStatus('Logged out successfully.', 'success');
}

function renderAuthUi() {
  const account = getCurrentAccount();

  if (authTitle) {
    authTitle.textContent = 'Log in now to unlock multiplayer and Leaderboard Eligibility!';
  }

  if (loginBtn) {
    if (account) {
      const label = String(account.displayName || 'Account').slice(0, 18);
      loginBtn.textContent = `${label} \u2699`;
    } else {
      loginBtn.textContent = 'Log in';
    }
  }

  if (!authOverlay) return;

  if (!account) {
    authFormSection.hidden = false;
    if (authDescription) {
      authDescription.textContent = authUiState.mode === 'login'
        ? 'Enter your login name and password. Warning: password recovery is disabled right now.'
        : 'Create your account with a login name and password. Warning: password recovery is disabled right now, so save your password safely.';
    }
    if (authIdentifierLabelText) {
      authIdentifierLabelText.textContent = authUiState.mode === 'login' ? 'Login name' : 'Create a Login Name';
    }
    if (authPinLabel) {
      authPinLabel.textContent = authUiState.mode === 'login' ? 'Password' : 'Create A Password';
    }
    if (authIdentifierInput) {
      authIdentifierInput.placeholder = authUiState.mode === 'login'
        ? 'Your login name'
        : 'This will be your display name too';
    }
    if (authContinueBtn) {
      authContinueBtn.textContent = authUiState.mode === 'login' ? 'Log in' : 'Create Account';
    }
    if (authModeToggleBtn) {
      authModeToggleBtn.textContent = authUiState.mode === 'login'
        ? 'Need a new account? Sign up'
        : 'Already have an account?';
    }
    renderSignupCaptchaIfNeeded();
    if (authIdentifierInput) authIdentifierInput.disabled = false;
    if (authPinInput) authPinInput.disabled = false;
    setAuthPasswordVisibility(authUiState.showPassword);
    void refreshSignupNameIndicator();
    return;
  }

  if (authDescription) {
    authDescription.textContent = `You are logged in as ${account.displayName}.`;
  }
  authFormSection.hidden = true;
  if (authCaptchaShell) authCaptchaShell.hidden = true;
  setAuthNameIndicator('idle');
}

function openProfileCustomizationOverlay() {
  ensureProfileAndFriendsUi();
  const account = getCurrentAccount();
  if (!account?.uid || !profileUi.profileCustomizeOverlay) return;
  renderProfileCustomizationPanel(account);
  profileUi.profileCustomizeOverlay.hidden = false;
  setProfileCustomizationStatus('');
}

function closeProfileCustomizationOverlay() {
  if (!profileUi.profileCustomizeOverlay) return;
  profileUi.profileCustomizeOverlay.hidden = true;
  setProfileCustomizationStatus('');
}

function openAuthOverlay(prefillMessage = '') {
  if (!authOverlay) return;
  if (!authUiState.pendingRegistration) {
    authUiState.step = 'form';
  }
  authOverlay.hidden = false;
  renderAuthUi();
  setAuthStatus(prefillMessage || '');
}

function closeAuthOverlay() {
  if (!authOverlay) return;
  authOverlay.hidden = true;
  resetSignupCaptchaState({ resetWidget: true });
  setAuthStatus('');
}

function showPendingBanNoticeIfNeeded() {
  const reason = String(localStorage.getItem('playrBanNotice') || '').trim();
  if (!reason) return;
  localStorage.removeItem('playrBanNotice');
  setAuthMode('login');
  openAuthOverlay('This account is banned.');
  setAuthStatus(reason, 'danger');
}

async function loginOrCreateAccount() {
  if (!firebaseAuth) {
    setAuthStatus('Firebase is not initialized for this page.', 'danger');
    return;
  }

  const requestedIdentifier = String(authIdentifierInput?.value || '').trim();
  const normalized = normalizeIdentifier(authIdentifierInput?.value);

  if (authUiState.mode === 'signup' && !requestedIdentifier) {
    setAuthNameIndicator('invalid');
    setAuthStatus('Enter a login name to sign up.', 'danger');
    return;
  }

  if (!normalized && authUiState.mode === 'login') {
    setAuthStatus('Enter a valid login name.', 'danger');
    return;
  }

  const pin = String(authPinInput?.value || '').trim();
  const captchaConfig = getCaptchaConfig();

  if (authUiState.mode === 'login' && !pin) {
    setAuthStatus('Enter your password to log in.', 'danger');
    return;
  }

  try {
    if (normalized.type === 'displayName') {
      if (authUiState.mode === 'signup') {
        // Sign-up supports display-name-only input and auto-generates a hidden auth identifier.
      }

      if (authUiState.mode === 'login') {
        const resolvedAccount = await resolveLoginDisplayName(normalized.value);
        if (!resolvedAccount || !resolvedAccount.identifier || resolvedAccount.identifierType !== 'email') {
          setAuthStatus('No account found for that login name.', 'danger');
          return;
        }

        if (pin.length < 6) {
          setAuthStatus('Password must be at least 6 characters.', 'danger');
          return;
        }

        await firebaseAuth.signInWithEmailAndPassword(resolvedAccount.identifier, pin);
        authUiState.pendingRegistration = null;
        authUiState.step = 'form';
        closeAuthOverlay();
        hideClaimOverlay();
        setAuthStatus('Logged in successfully.', 'success');
        return;
      }
    }

    if (authUiState.mode === 'login' && normalized.type !== 'email') {
      setAuthStatus('Enter a valid login name.', 'danger');
      return;
    }

    if (pin.length < 6) {
      setAuthStatus('Password must be at least 6 characters.', 'danger');
      return;
    }

    if (authUiState.mode === 'login') {
      await firebaseAuth.signInWithEmailAndPassword(normalized.value, pin);
      authUiState.pendingRegistration = null;
      authUiState.step = 'form';
      closeAuthOverlay();
      hideClaimOverlay();
      setAuthStatus('Logged in successfully.', 'success');
      return;
    }

    if (!firebaseDb) {
      setAuthStatus('Enable Firestore first to enforce global display-name uniqueness.', 'danger');
      return;
    }

    if (captchaConfig.turnstileEnabled && !captchaConfig.turnstileSiteKey) {
      setAuthStatus('Signup captcha is enabled but the Turnstile site key is not configured yet.', 'danger');
      return;
    }

    if (normalized.type !== 'displayName') {
      setAuthStatus('Use a login name (letters/numbers), not an email.', 'danger');
      return;
    }

    const displayNameValidation = validateDisplayName(requestedIdentifier);
    if (!displayNameValidation.valid) {
      const suggestions = suggestLocalDisplayNames(requestedIdentifier, 3);
      setAuthNameIndicator('invalid');
      setAuthStatus(buildSignupNameMessage(displayNameValidation, suggestions), 'danger');
      return;
    }

    const displayName = displayNameValidation.cleaned;
    const availability = await checkDisplayNameAvailability(displayName);
    if (!availability.available) {
      const suggestions = await suggestAvailableDisplayNames(displayName, 3);
      const suggestionText = suggestions.length ? ` Try: ${suggestions.join(', ')}.` : '';
      setAuthNameIndicator('invalid');
      setAuthStatus(`That login name is already in use.${suggestionText}`, 'danger');
      return;
    }

    setAuthNameIndicator('valid');

    const captchaVerification = await verifySignupCaptchaToken();
    if (!captchaVerification.ok) {
      setAuthStatus(captchaVerification.message, 'danger');
      return;
    }

    const signupIdentifier = normalized.type === 'email'
      ? normalized.value
      : createSyntheticSignupEmail(displayName);

    let captchaClaimed = false;
    const credential = await firebaseAuth.createUserWithEmailAndPassword(signupIdentifier, pin);
    if (credential?.user) {
      try {
        await reserveDisplayNameForUid(displayName, credential.user.uid, 'email', signupIdentifier);
      } catch (reservationError) {
        await credential.user.delete().catch(() => {});
        throw { code: reservationError?.code || 'auth/display-name-taken' };
      }
      await credential.user.updateProfile({ displayName });
      authState.currentUser = credential.user;
      persistCurrentProfile(displayName);
      const captchaClaim = await claimVerifiedSignupCaptcha(captchaVerification.result?.verificationId || authUiState.captchaVerificationId);
      if (captchaClaim.ok) {
        captchaClaimed = true;
        cacheProfileLocally({
          ...(authState.profiles[credential.user.uid] || {}),
          uid: credential.user.uid,
          displayName,
          signupCaptcha: {
            provider: 'turnstile',
            verifiedAt: Date.now(),
            hostname: String(captchaVerification.result?.hostname || '').trim(),
            action: 'signup',
          },
        });
      }
    }

    authUiState.pendingRegistration = null;
    authUiState.step = 'form';
    resetSignupCaptchaState({ resetWidget: true });
    closeAuthOverlay();
    hideClaimOverlay();
    renderAuthUi();
    setAuthStatus(
      captchaClaimed
        ? 'Account created. Keep your password safe because recovery is currently disabled.'
        : 'Account created, but captcha verification could not be finalized. This account will not count toward referral qualification until that server step is working.',
      captchaClaimed ? 'success' : 'info',
    );
  } catch (error) {
    const fallback = error?.code
      ? `Could not continue auth (${error.code}).`
      : 'Could not continue auth.';
    setAuthStatus(getFirebaseAuthErrorMessage(error, fallback), 'danger');
  }
}

function handleAuthEnterSubmit(event) {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  void loginOrCreateAccount();
}

function isLoggedIn() {
  return Boolean(getCurrentAccount());
}

function formatTitle(game) {
  return game.name;
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function hashText(text) {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getFeaturedGameForTab(tabId) {
  const config = FEATURED_TAB_CONFIG[tabId] || FEATURED_TAB_CONFIG.all;
  let pool = games;

  if (tabId === 'single-player') {
    pool = games.filter((game) => game.category === 'single-player');
  } else if (tabId === 'multiplayer') {
    pool = games.filter((game) => game.category === 'two-player');
  } else if (tabId === 'competitive') {
    pool = games.filter((game) => game.competitive === true);
  } else if (tabId === 'leaderboard') {
    pool = games.filter((game) => game.leaderboardEligible);
  }

  if (!pool.length) return games[0];

  const anchorIndex = Math.max(0, pool.findIndex((game) => game.id === config.anchorId));
  const offset = hashText(`${getTodayKey()}:${tabId}`) % pool.length;
  const featuredIndex = (anchorIndex + offset) % pool.length;
  return pool[featuredIndex] || pool[0];
}

function pickRandomGame() {
  const pool = games.length > 0 ? games : [{
    name: 'PlayR',
    summary: 'A polished game hub.',
    controls: 'Browse the site',
    metric: 'Featured picks',
    status: '',
    mode: 'Platform',
    leaderboardLabel: 'Highlights',
    leaderboardUnit: 'feature',
    leaderboard: [],
  }];
  return pool[Math.floor(Math.random() * pool.length)];
}

function renderStats() {
  if (!statsContainer) return;
  statsContainer.innerHTML = stats
    .map(
      (entry) => `
        <article class="stat-card">
          <span>${entry.label}</span>
          <strong>${entry.value}</strong>
        </article>
      `,
    )
    .join('');
}

function renderPublishingPreview() {
  if (!publishingGrid) return;
  publishingGrid.innerHTML = publishingFeatures
    .map(
      (feature) => `
        <article class="publish-card">
          <div class="meta-row">
            <span class="tag ${feature.accent}">${feature.state}</span>
            <span class="tag">Link later</span>
          </div>
          <h3>${feature.title}</h3>
          <p>${feature.summary}</p>
          <div class="tag-row">
            <span class="meta-pill">${feature.hook}</span>
          </div>
        </article>
      `,
    )
    .join('');
}

function getFilteredGames() {
  let filtered = [...games];

  if (uiState.activeLibraryTab === 'single-player') {
    filtered = filtered.filter((game) => game.category === 'single-player');
  } else if (uiState.activeLibraryTab === 'competitive') {
    filtered = filtered.filter((game) => game.competitive === true);
  } else if (uiState.activeLibraryTab === 'leaderboard') {
    filtered = filtered.filter((game) => game.leaderboardEligible === true);
  } else if (uiState.activeLibraryTab === 'multiplayer') {
    filtered = filtered.filter((game) => game.category === 'two-player');
  }

  if (uiState.activeSignalFilter === 'trending') {
    filtered = filtered.filter((game) => game.trending);
  } else if (uiState.activeSignalFilter === 'new') {
    filtered = filtered.filter((game) => game.isNew);
  } else if (uiState.activeSignalFilter === 'top-players') {
    filtered = filtered.filter((game) => game.topPlayers);
  } else if (uiState.activeSignalFilter === 'leaderboard') {
    filtered = filtered.filter((game) => Array.isArray(game.leaderboard) && game.leaderboard.length > 0);
  }

  const query = uiState.librarySearchQuery.trim().toLowerCase();
  if (query && uiState.activeLibraryTab !== 'leaderboard') {
    filtered = filtered.filter((game) => {
      const haystack = `${game.name} ${game.controls} ${game.summary} ${game.metric} ${game.leaderboardLabel}`.toLowerCase();
      return haystack.includes(query);
    });
  }

  return filtered;
}

function getGameGridBatchSize(tabId = uiState.activeLibraryTab) {
  return GAME_GRID_BATCH_SIZE[tabId] || GAME_GRID_BATCH_SIZE.all;
}

function resetVisibleGameCount(tabId = uiState.activeLibraryTab) {
  uiState.visibleGameCount = getGameGridBatchSize(tabId);
}

function updateFilterSummary(filteredGames) {
  if (!filterSummary) return;
  const tabLabelMap = {
    'all': 'All Games',
    'single-player': '1P Games',
    'competitive': 'Competitive',
    'leaderboard': 'Leaderboard',
    'multiplayer': 'Multiplayer',
  };
  const signalLabelMap = {
    'all': 'All',
    'trending': 'Trending',
    'new': 'New',
    'top-players': 'Top Players',
    'leaderboard': 'Leaderboard',
  };
  const tabLabel = tabLabelMap[uiState.activeLibraryTab] || 'All Games';
  const signalLabel = signalLabelMap[uiState.activeSignalFilter] || 'All';
  const count = filteredGames.length;
  const showingCount = uiState.activeLibraryTab === 'leaderboard'
    ? count
    : Math.min(count, uiState.visibleGameCount);
  const displayTab = uiState.activeLibraryTab === 'multiplayer' ? 'Multiplayer' : tabLabel;
  const displayText = uiState.activeSignalFilter === 'all'
    ? `${displayTab}: showing ${showingCount} of ${count} game${count === 1 ? '' : 's'}.`
    : `${displayTab} + ${signalLabel}: showing ${showingCount} of ${count} game${count === 1 ? '' : 's'}.`;
  filterSummary.textContent = displayText;
}

function syncControlStates() {
  if (libraryTabs) {
    libraryTabs.querySelectorAll('[data-library-tab]').forEach((button) => {
      button.classList.toggle('active', button.dataset.libraryTab === uiState.activeLibraryTab);
    });
  }
  if (signalFilters) {
    signalFilters.querySelectorAll('[data-signal-filter]').forEach((button) => {
      button.classList.toggle('active', button.dataset.signalFilter === uiState.activeSignalFilter);
    });
  }
  if (leaderboardRangeFilters) {
    leaderboardRangeFilters.querySelectorAll('[data-range]').forEach((button) => {
      button.classList.toggle('active', button.dataset.range === uiState.activeLeaderboardRange);
    });
  }
  if (librarySearchShell) {
    librarySearchShell.hidden = uiState.activeLibraryTab === 'leaderboard';
  }
}

function keyFor(row, col) {
  return `${row}:${col}`;
}

function indexFor(row, col, cols) {
  return row * cols + col;
}

function neighbors(row, col, rows, cols) {
  const result = [];
  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
      if (rowOffset === 0 && colOffset === 0) continue;
      const nextRow = row + rowOffset;
      const nextCol = col + colOffset;
      if (nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols) {
        result.push([nextRow, nextCol]);
      }
    }
  }
  return result;
}

function createMineBoard(rows, cols, mineCount, safeIndex) {
  const board = Array.from({ length: rows * cols }, (_, index) => ({
    mined: false,
    revealed: false,
    flagged: false,
    adjacent: 0,
    row: Math.floor(index / cols),
    col: index % cols,
  }));

  const safeZone = new Set([safeIndex]);
  const safeRow = Math.floor(safeIndex / cols);
  const safeCol = safeIndex % cols;
  neighbors(safeRow, safeCol, rows, cols).forEach(([row, col]) => safeZone.add(indexFor(row, col, cols)));

  const available = board
    .map((_, index) => index)
    .filter((index) => !safeZone.has(index));

  let remaining = mineCount;
  while (remaining > 0 && available.length > 0) {
    const pickIndex = Math.floor(Math.random() * available.length);
    const picked = available.splice(pickIndex, 1)[0];
    board[picked].mined = true;
    remaining -= 1;
  }

  board.forEach((cell) => {
    if (cell.mined) return;
    cell.adjacent = neighbors(cell.row, cell.col, rows, cols).reduce((count, [nextRow, nextCol]) => {
      const nextIndex = indexFor(nextRow, nextCol, cols);
      return count + (board[nextIndex].mined ? 1 : 0);
    }, 0);
  });

  return board;
}

function startMineTimer() {
  if (mineStateData.timerId) return;
  mineStateData.timerId = window.setInterval(() => {
    mineStateData.seconds += 1;
    mineTimer.textContent = `${mineStateData.seconds}s`;
  }, 1000);
}

function stopMineTimer() {
  if (!mineStateData.timerId) return;
  window.clearInterval(mineStateData.timerId);
  mineStateData.timerId = null;
}

function updateMineStatus(message) {
  mineState.textContent = message;
}

function updateMineCounters() {
  const flaggedCount = mineStateData.flagged.size;
  mineRemaining.textContent = String(Math.max(0, mineStateData.mines - flaggedCount));
  mineTimer.textContent = `${mineStateData.seconds}s`;
  mineDimensions.textContent = `${mineStateData.rows} x ${mineStateData.cols}`;
}

function renderMineBoard() {
  mineBoard.style.gridTemplateColumns = `repeat(${mineStateData.cols}, minmax(0, 1fr))`;
  mineBoard.innerHTML = mineStateData.board
    .map((cell, index) => {
      const classes = ['mine-cell'];
      if (cell.revealed) classes.push('revealed');
      if (cell.flagged) classes.push('flagged');
      if (mineStateData.ended && cell.mined) classes.push('mine-revealed');
      if (cell.revealed && !cell.mined && cell.adjacent > 0) classes.push(`number-${cell.adjacent}`);
      const symbol = cell.flagged ? 'F' : cell.revealed && cell.mined ? '✹' : cell.revealed ? (cell.adjacent || '') : '';
      const ariaLabel = `Row ${cell.row + 1}, Column ${cell.col + 1}`;
      return `
        <button
          class="${classes.join(' ')}"
          type="button"
          data-index="${index}"
          aria-label="${ariaLabel}"
          aria-pressed="${cell.revealed ? 'true' : 'false'}"
          aria-disabled="${mineStateData.ended ? 'true' : 'false'}"
        >
          <span>${symbol}</span>
        </button>
      `;
    })
    .join('');
}

function syncModeButtons(activeMode) {
  modeButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.mode === activeMode);
  });
}

function finishMineGame(won) {
  mineStateData.ended = true;
  mineStateData.won = won;
  stopMineTimer();
  updateMineStatus(won ? 'Cleared' : 'Exploded');
  mineHint.textContent = won
    ? 'Board cleared. Pick another mode for a harder run.'
    : 'Hit a mine. Restart the board and try again.';
  renderMineBoard();
  if (won) {
    maybePromptLoginForMineScore(mineStateData.seconds);
  }
}

function checkMineWin() {
  const totalSafeCells = mineStateData.rows * mineStateData.cols - mineStateData.mines;
  if (mineStateData.revealed.size >= totalSafeCells) {
    finishMineGame(true);
  }
}

function floodReveal(startIndex) {
  const queue = [startIndex];
  while (queue.length > 0) {
    const index = queue.shift();
    if (mineStateData.revealed.has(index)) continue;
    const cell = mineStateData.board[index];
    if (!cell || cell.flagged) continue;
    mineStateData.revealed.add(index);
    cell.revealed = true;
    if (cell.adjacent !== 0 || cell.mined) continue;
    neighbors(cell.row, cell.col, mineStateData.rows, mineStateData.cols).forEach(([row, col]) => {
      const nextIndex = indexFor(row, col, mineStateData.cols);
      if (!mineStateData.revealed.has(nextIndex)) queue.push(nextIndex);
    });
  }
}

function revealMineCell(index) {
  if (mineStateData.ended) return;
  const cell = mineStateData.board[index];
  if (!cell || cell.flagged) return;

  if (!mineStateData.started) {
    mineStateData.started = true;
    mineStateData.board = createMineBoard(mineStateData.rows, mineStateData.cols, mineStateData.mines, index);
    mineStateData.firstClickIndex = index;
    startMineTimer();
  }

  if (cell.mined) {
    cell.revealed = true;
    mineStateData.revealed.add(index);
    finishMineGame(false);
    return;
  }

  floodReveal(index);
  updateMineStatus('Playing');
  renderMineBoard();
  updateMineCounters();
  checkMineWin();
}

function toggleMineFlag(index) {
  if (mineStateData.ended) return;
  const cell = mineStateData.board[index];
  if (!cell || cell.revealed) return;
  cell.flagged = !cell.flagged;
  if (cell.flagged) {
    mineStateData.flagged.add(index);
  } else {
    mineStateData.flagged.delete(index);
  }
  updateMineStatus(mineStateData.started ? 'Playing' : '');
  renderMineBoard();
  updateMineCounters();
}

function resetMineGame(mode = mineStateData.mode) {
  const config = mineModes[mode];
  mineStateData.mode = mode;
  mineStateData.rows = config.rows;
  mineStateData.cols = config.cols;
  mineStateData.mines = config.mines;
  mineStateData.board = Array.from({ length: config.rows * config.cols }, (_, index) => ({
    mined: false,
    revealed: false,
    flagged: false,
    adjacent: 0,
    row: Math.floor(index / config.cols),
    col: index % config.cols,
  }));
  mineStateData.revealed = new Set();
  mineStateData.flagged = new Set();
  mineStateData.safeFirstClick = true;
  mineStateData.started = false;
  mineStateData.ended = false;
  mineStateData.won = false;
  mineStateData.seconds = 0;
  mineStateData.firstClickIndex = null;
  updateMineStatus('');
  mineHint.textContent = 'Left click to reveal, right click to flag. The first revealed cell will always be safe.';
  hideScoreSavePanel();
  stopMineTimer();
  updateMineCounters();
  syncModeButtons(mode);
  renderMineBoard();
}

function parseLeaderboardTimeToSeconds(value) {
  if (!value) return Number.POSITIVE_INFINITY;
  if (value.includes(':')) {
    const [minutesText, secondsText] = value.split(':');
    const minutes = Number(minutesText);
    const seconds = Number(secondsText);
    if (Number.isFinite(minutes) && Number.isFinite(seconds)) {
      return minutes * 60 + seconds;
    }
  }
  return Number(String(value).replace('s', ''));
}

function getProjectedMineLeaderboardPosition(seconds) {
  const mineEntry = games.find((game) => game.id === 'minesweeper');
  if (!mineEntry || !Array.isArray(mineEntry.leaderboardTop100)) return { shouldPrompt: false, rank: null };
  const allTimes = mineEntry.leaderboardTop100.map((row) => parseLeaderboardTimeToSeconds(row.value));
  const insertion = allTimes.findIndex((value) => seconds <= value);
  const cutoff = allTimes[allTimes.length - 1] ?? Number.POSITIVE_INFINITY;
  const closeThresholdSeconds = 10;
  const shouldPrompt = insertion !== -1 || seconds <= cutoff + closeThresholdSeconds;
  const rank = insertion === -1 ? allTimes.length + 1 : insertion + 1;
  return { shouldPrompt, rank };
}

function hideScoreSavePanel() {
  if (!scoreSavePanel) return;
  scoreSavePanel.hidden = true;
}

function showScoreSavePanel(rank, seconds) {
  if (!scoreSavePanel || !scoreSaveTitle || !scoreSaveBody) return;
  scoreSaveTitle.textContent = `Potential leaderboard spot: #${rank}`;
  scoreSaveBody.textContent = `You cleared in ${seconds}s. Log in to save this run and claim your projected ranking.`;
  scoreSavePanel.hidden = false;
}

function maybePromptLoginForMineScore(seconds) {
  const { shouldPrompt, rank } = getProjectedMineLeaderboardPosition(seconds);
  if (!shouldPrompt || !rank) {
    hideScoreSavePanel();
    hideClaimOverlay();
    return;
  }

  if (!isLoggedIn()) {
    const shown = showClaimOverlay();
    if (shown) {
      hideScoreSavePanel();
    } else {
      showScoreSavePanel(rank, seconds);
    }
    return;
  }

  showScoreSavePanel(rank, seconds);
}

function revealEntireMineBoard() {
  if (!mineStateData.board.length) return;
  if (!mineStateData.started) {
    mineStateData.board = createMineBoard(mineStateData.rows, mineStateData.cols, mineStateData.mines, Math.floor(mineStateData.board.length / 2));
  }
  mineStateData.board.forEach((cell, index) => {
    cell.revealed = true;
    mineStateData.revealed.add(index);
  });
  mineStateData.ended = true;
  updateMineStatus('Preview');
  stopMineTimer();
  renderMineBoard();
}

function setFeaturedGame(game) {
  if (!game || !featuredTitle || !featuredSummary || !featuredControls || !featuredMetric || !featuredRotation || !featuredStatus || !featuredMode) {
    return;
  }
  uiState.featuredGameId = game.id;
  featuredTitle.textContent = formatTitle(game);
  featuredSummary.textContent = game.summary;
  featuredControls.textContent = game.controls;
  featuredMetric.textContent = game.metric;
  featuredRotation.textContent = 'Random pick';
  featuredStatus.textContent = game.status;
  featuredMode.textContent = game.mode;
  uiState.featuredLaunchUrl = game.launchUrl || null;
  if (featuredGameCard) {
    featuredGameCard.setAttribute('aria-disabled', uiState.featuredLaunchUrl ? 'false' : 'true');
    featuredGameCard.dataset.launchUrl = uiState.featuredLaunchUrl || '';
  }
}

function syncFeaturedGameToActiveTab() {
  if (!featuredGameCard) return;
  setFeaturedGame(getFeaturedGameForTab(uiState.activeLibraryTab));
}

function getGameById(gameId) {
  return games.find((game) => game.id === gameId) || null;
}

function getFeaturedGame() {
  return getGameById(uiState.featuredGameId);
}

function getFeaturedCompetitiveLeaderboardGame() {
  const featuredCompetitive = getFeaturedGameForTab('competitive');
  if (featuredCompetitive?.leaderboardEligible) return featuredCompetitive;
  return games.find((game) => game.competitive === true && game.leaderboardEligible === true) || null;
}

function canLaunchGame(game) {
  if (!game) return false;
  if (multiplayerAccessConfig.requireLoginFor2P && game.category === 'two-player' && !isLoggedIn()) {
    return false;
  }
  if (!game.requiresLoginForMatchmaking) return true;
  return isLoggedIn();
}

function promptLoginForMultiplayer() {
  setAuthMode('login');
  openAuthOverlay('Log in to play multiplayer games.');
}

function renderGames() {
  if (!gameGrid) return;
  const filteredGames = getFilteredGames();
  updateFilterSummary(filteredGames);
  if (filteredGames.length === 0) {
    gameGrid.innerHTML = `
      <article class="game-card empty-state">
        <h3>No games match these filters yet.</h3>
        <p>Try a different tab or filter while we keep expanding the hub.</p>
      </article>
    `;
    if (gameGridFooter) gameGridFooter.hidden = true;
    return;
  }
  const visibleGames = filteredGames.slice(0, Math.min(filteredGames.length, uiState.visibleGameCount));
  gameGrid.innerHTML = visibleGames
    .map(
      (game) => `
        <article class="game-card" tabindex="0" role="button" data-game-id="${game.id}" data-launch-url="${game.launchUrl || ''}">
          <div class="meta-row">
            ${game.status ? `<span class="tag ${game.accent}">${game.status}</span>` : ''}
            <span class="tag">${game.mode}</span>
          </div>
          <h3>${game.name}</h3>
          <p>${game.summary}</p>
          <div class="tag-row">
            <span class="meta-pill">${game.controls}</span>
            <span class="meta-pill">${game.metric}</span>
            ${game.category === 'two-player' ? '<span class="meta-pill">Login required for multiplayer</span>' : ''}
          </div>
        </article>
      `,
    )
    .join('');
  if (gameGridFooter && showMoreGamesBtn) {
    const hasMore = filteredGames.length > visibleGames.length;
    gameGridFooter.hidden = !hasMore;
    showMoreGamesBtn.textContent = hasMore
      ? `Show more (${filteredGames.length - visibleGames.length} left)`
      : 'Show more';
  }
}

function renderLeaderboard() {
  hydrateLeaderboardGames();
  const eligibleGames = games.filter((game) => game.leaderboardEligible);
  if (leaderboardCard) {
    leaderboardCard.classList.toggle('leaderboard-card-levels', uiState.activeLeaderboardRange === 'levels');
    leaderboardCard.classList.toggle('leaderboard-card-featured', uiState.activeLeaderboardRange === 'featured');
  }

  const getPaddedRows = (rows, limit) => {
    const safeRows = Array.isArray(rows) ? rows.slice(0, limit) : [];
    while (safeRows.length < limit) {
      safeRows.push({
        rank: safeRows.length + 1,
        player: '',
        value: '',
        level: '',
        profile: null,
      });
    }
    return safeRows;
  };

  if (uiState.activeLeaderboardRange === 'levels') {
    void refreshCloudLeaderboardProfiles();
    const currentAccount = getCurrentAccount();
    const boardKey = '__levels__';
    const isExpanded = uiState.expandedLeaderboardByGame[boardKey] === true;
    const rows = buildLevelsLeaderboardRows(100);
    const visibleRows = getPaddedRows(rows, isExpanded ? 100 : 10);

    leaderboardCard.innerHTML = `
      <div class="leaderboard-card-standalone">
      <div class="leaderboard-header">
        <div>
          <p class="panel-label">Progression leaderboard</p>
          <h3>Levels</h3>
          <p>Total XP decides placement while the table surfaces each player's current level beside their display name.</p>
        </div>
        <button class="button secondary leaderboard-expand-btn" type="button" data-expand-game="${boardKey}">
          ${isExpanded ? 'Show Top 10' : 'Show Top 100'}
        </button>
      </div>
      <p class="leaderboard-summary">Showing ${isExpanded ? 'Top 100' : 'Top 10'}</p>
      <div class="table-wrap">
        <table class="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>XP</th>
              <th>Level</th>
            </tr>
          </thead>
          <tbody>
            ${visibleRows.map((row) => `
              <tr>
                <td class="rank">#${row.rank}</td>
                <td>${row.player ? formatPlayerIdentityMarkup(row.player, { record: row.profile || findProfileByDisplayName(row.player), compact: true }) : '<span class="leaderboard-empty-cell">--</span>'}</td>
                <td>${row.player ? Number(row.value || 0).toLocaleString() : '<span class="leaderboard-empty-cell">--</span>'}</td>
                <td>${row.player ? `Level ${row.level}` : '<span class="leaderboard-empty-cell">--</span>'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ${currentAccount ? `<div class="leaderboard-player-footer"><strong>Your Progress:</strong> ${formatPlayerIdentityMarkup(currentAccount.displayName, { record: currentAccount, compact: true })}<span>${Math.round(getProgressionSnapshotForAccount(currentAccount).xp).toLocaleString()} XP</span><span>Level ${getProgressionSnapshotForAccount(currentAccount).level}</span></div>` : ''}
      </div>
    `;
    return;
  }

  if (uiState.activeLeaderboardRange === 'featured') {
    const game = getFeaturedCompetitiveLeaderboardGame();
    const rows = game ? getPaddedRows(game.leaderboardTop100 || [], 10) : getPaddedRows([], 10);
    leaderboardCard.innerHTML = game ? `
      <div class="leaderboard-card-standalone">
        <div class="leaderboard-header">
          <div>
            <p class="panel-label">Featured competitive board</p>
            <h3>${game.name}</h3>
            <p>Today&apos;s featured competitive leaderboard shows the top 10 players for the daily spotlight game.</p>
          </div>
          <span class="tag accent">Top 10 only</span>
        </div>
        <p class="leaderboard-summary">${game.leaderboardLabel}. The featured game rotates daily from the competitive lineup.</p>
        <div class="table-wrap">
          <table class="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>${game.leaderboardLabel}</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map((row) => `
                <tr>
                  <td class="rank">#${row.rank}</td>
                  <td>${row.player ? formatPlayerIdentityMarkup(row.player, { record: findProfileByDisplayName(row.player), compact: true }) : '<span class="leaderboard-empty-cell">--</span>'}</td>
                  <td>${row.player ? row.value : '<span class="leaderboard-empty-cell">--</span>'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    ` : `
      <div class="leaderboard-card-standalone">
        <div class="leaderboard-header">
          <div>
            <p class="panel-label">Featured competitive board</p>
            <h3>No featured leaderboard yet</h3>
            <p>Add more competitive games with saved rankings and this slot will populate automatically.</p>
          </div>
        </div>
      </div>
    `;
    return;
  }

  if (uiState.activeLeaderboardRange === 'donation') {
    leaderboardCard.innerHTML = `
      <div class="leaderboard-header">
        <div>
          <p class="panel-label">Donation leaderboard</p>
          <h3>Top supporters</h3>
          <p>Community support that helps fund no-ads membership and future game infrastructure.</p>
        </div>
        <div>
          <span class="tag warn">Support tracking</span>
        </div>
      </div>
      <p class="leaderboard-summary">Donation entries are placeholders until payment and account systems are connected.</p>
      <div class="table-wrap">
        <table class="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Supporter</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${donationLeaderboard
              .map(
                (row, index) => `
                  <tr>
                    <td class="rank">#${index + 1}</td>
                    <td>${row.player}</td>
                    <td>${row.value}</td>
                  </tr>
                `,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;
    return;
  }

  const game = eligibleGames.find((g) => g.id === uiState.activeGameId) || eligibleGames[0];
  if (!game) {
    leaderboardCard.innerHTML = '<p>No leaderboard games available.</p>';
    return;
  }

  const rangeBadge = uiState.activeLeaderboardRange === 'featured'
    ? 'Featured game'
    : uiState.activeLeaderboardRange === 'your-stats'
      ? 'Your stats preview'
      : 'All-time records';

  const isExpanded = uiState.expandedLeaderboardByGame[game.id] === true;
  const visibleRows = getPaddedRows(game.leaderboardTop100 || [], isExpanded ? 100 : 5);
  const currentAccount = getCurrentAccount();
  const isAdmin = isCurrentAccountAdmin(currentAccount);
  const adminPanelVisible = isLeaderboardAdminPanelVisible(game.id);
  const currentName = currentAccount ? currentAccount.displayName : (game.currentPlayer?.username || 'Guest');
  const eligibilityText = !currentAccount
    ? 'Log in to save scores and unlock multiplayer.'
    : 'Logged-in account: leaderboard eligible.';
  const adminDefaultPlayer = (currentAccount?.displayName || 'Owner').slice(0, 24);
  const quickValue = getQuickAbuseValueForGame(game);

  leaderboardCard.innerHTML = `
    <div class="leaderboard-games-list">
      ${eligibleGames
        .map(
          (g) => `
            <button class="leaderboard-game-item ${g.id === game.id ? 'active' : ''}" type="button" data-game-id="${g.id}">
              ${g.name}
            </button>
          `,
        )
        .join('')}
    </div>
    <div class="leaderboard-content">
      <div>
        <p class="panel-label">${rangeBadge}</p>
        <h3>${game.name}</h3>
          <p style="color: var(--muted); line-height: 1.6; margin: 0;">${game.summary}</p>
      </div>
      <div class="leaderboard-actions">
        <p class="leaderboard-summary">${game.leaderboardLabel}. Showing ${isExpanded ? 'Top 100' : 'Top 5'}.</p>
        <button class="button secondary leaderboard-expand-btn" type="button" data-expand-game="${game.id}">
          ${isExpanded ? 'Show Top 5' : 'Show Top 100'}
        </button>
      </div>
      ${isAdmin ? `
        <div class="leaderboard-admin-shell">
          <button class="button secondary" type="button" data-admin-toggle-game="${game.id}">
            ${adminPanelVisible ? 'Hide admin panel' : 'Show admin panel'}
          </button>
          <div class="leaderboard-admin-panel" data-admin-panel-game="${game.id}" ${adminPanelVisible ? '' : 'hidden'}>
            <div class="leaderboard-admin-grid">
              <label class="auth-label">Rank</label>
              <input class="auth-input" data-admin-rank type="number" min="1" max="100" value="1" />

              <label class="auth-label">Player</label>
              <input class="auth-input" data-admin-player type="text" maxlength="24" value="${adminDefaultPlayer}" />

              <label class="auth-label">Value</label>
              <input class="auth-input" data-admin-value type="text" placeholder="${quickValue}" />

              <label class="auth-label">Detail</label>
              <input class="auth-input" data-admin-detail type="text" maxlength="48" value="Admin override" />
            </div>
            <div class="settings-inline-actions">
              <button class="button secondary" type="button" data-admin-inject-game="${game.id}">Inject custom score</button>
              <button class="button secondary" type="button" data-admin-quick-game="${game.id}">Quick abuse #1</button>
            </div>
          </div>
        </div>
      ` : ''}
      <div class="leaderboard-scores-shell">
        <div class="table-wrap">
          <table class="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>${game.leaderboardLabel}</th>
              </tr>
            </thead>
            <tbody>
              ${visibleRows
                .map(
                  (row) => `
                    <tr>
                      <td class="rank">#${row.rank}</td>
                      <td>${row.player ? formatPlayerIdentityMarkup(row.player, { record: findProfileByDisplayName(row.player), compact: true }) : '<span class="leaderboard-empty-cell">--</span>'}</td>
                      <td>${row.player ? row.value : '<span class="leaderboard-empty-cell">--</span>'}</td>
                    </tr>
                  `,
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
      <div class="leaderboard-player-footer">
        <strong>Your Scores:</strong> ${formatPlayerIdentityMarkup(currentName, { record: currentAccount, compact: true })}
        <span>${game.id === 'cookie-clicker' ? 'Cookies Clicked' : 'Score'}: ${currentAccount ? (game.currentPlayer?.value || 'n/a') : 'Login required'}</span>
        ${currentAccount && game.currentPlayer?.secondaryValue != null ? `<span>CPC: ${game.currentPlayer.secondaryValue}</span>` : ''}
        <span>Position: ${currentAccount ? `#${game.currentPlayer?.rank || 'n/a'}` : 'Login required'}</span>
        <span>${eligibilityText}</span>
      </div>
    </div>
  `;
}

function setActiveGame(gameId) {
  const filteredGames = getFilteredGames();
  const fallback = filteredGames[0] ?? games[0];
  const game = filteredGames.find((entry) => entry.id === gameId) ?? fallback;
  if (!game) return;
  uiState.activeGameId = game.id;
  renderLeaderboard();
}

function updateLeaderboardAbout() {
  if (!leaderboardAbout) return;
  if (uiState.activeLeaderboardRange === 'featured') {
    leaderboardAbout.textContent = 'Featured Game highlights one competitive leaderboard each day and keeps the focus on that game\'s top 10 players.';
  } else if (uiState.activeLeaderboardRange === 'all-time') {
    leaderboardAbout.textContent = 'All-time view keeps persistent records for long-term competition.';
  } else if (uiState.activeLeaderboardRange === 'levels') {
    leaderboardAbout.textContent = 'Levels ranks accounts by total XP while showing the current level beside each display name.';
  } else if (uiState.activeLeaderboardRange === 'your-stats') {
    const account = getCurrentAccount();
    if (!account) {
      leaderboardAbout.textContent = 'Log in to see your saved stats and multiplayer access state.';
    } else {
      leaderboardAbout.textContent = 'Your stats are linked to your account and eligible for leaderboard placement.';
    }
  } else {
    leaderboardAbout.textContent = 'Donation leaderboard recognizes supporters separately from gameplay rankings.';
  }
}

function isLeaderboardViewActive() {
  return uiState.activeLibraryTab === 'leaderboard';
}

function refreshSettingsProgressionIfOpen() {
  if (!settingsOverlay?.hidden) {
    renderSettingsProgression(getCurrentAccount());
  }
}

function scheduleNonCriticalHomepageWork() {
  const run = () => {
    renderStats();
    renderPublishingPreview();
    syncSiteNoticeBell();
  };

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(run, { timeout: 1500 });
    return;
  }

  window.setTimeout(run, 120);
}

function refreshGameViews() {
  applyPersistedAdminOverrides();
  renderGames();
  const shouldRenderLeaderboard = isLeaderboardViewActive();

  if (!shouldRenderLeaderboard) {
    return;
  }

  const eligibleGames = games.filter((game) => game.leaderboardEligible);

  if (uiState.activeLeaderboardRange === 'levels' || uiState.activeLeaderboardRange === 'featured') {
    renderLeaderboard();
    return;
  }

  if (eligibleGames.length === 0 || !uiState.activeGameId) {
    if (eligibleGames.length > 0) {
      uiState.activeGameId = eligibleGames[0].id;
    }
    leaderboardCard.innerHTML = `
      <div class="leaderboard-header">
        <div>
          <p class="panel-label">No leaderboard</p>
          <h3>Adjust filters</h3>
          <p>No leaderboard data matches the current tab and filter selection.</p>
        </div>
      </div>
    `;
    return;
  }
  const gameExists = eligibleGames.some((game) => game.id === uiState.activeGameId);
  if (!gameExists) {
    uiState.activeGameId = eligibleGames[0].id;
  }
  renderLeaderboard();
}

function setSupportPanelVisible(visible) {
  if (!supportSection) return;
  supportSection.hidden = !visible;
  if (visible) {
    supportSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function setLeaderboardPanelVisible(visible) {
  if (!leaderboardSection) return;
  leaderboardSection.hidden = !visible;
  if (visible) {
    requestAnimationFrame(() => {
      leaderboardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}

function init() {
  const cleanupOverscrollEasterEgg = initOverscrollEasterEgg();
  applyPersistedAdminOverrides();
  ensureProfileAndFriendsUi();
  ensureBannerSettingsCard();

  if (firebaseAuth) {
    firebaseAuth.onAuthStateChanged((user) => {
      authState.currentUser = user || null;

      if (!hasHandledInitialAuthState) {
        hasHandledInitialAuthState = true;
      }

      if (user) {
        persistCurrentProfile();
        subscribeToCurrentUserProfile(user);
        void syncCurrentAccountRolesToFirestore();
        void syncCurrentAccountProfileToFirestore({ immediate: true });
        if (isLeaderboardViewActive()) {
          void refreshCloudLeaderboardProfiles({ force: true });
        }
      } else {
        stopCurrentUserProfileSubscription();
        closeFriendsSubscriptions();
      }
      syncLegacyAuthState();
      exposePlayrAuth();
      renderAuthUi();
      if (!user) {
        showPendingBanNoticeIfNeeded();
      }
      refreshSettingsProgressionIfOpen();
      if (isLeaderboardViewActive()) {
        refreshGameViews();
        updateLeaderboardAbout();
      }
    });
  }

  syncLegacyAuthState();
  exposePlayrAuth();
  renderAuthUi();
  syncControlStates();
  syncFeaturedGameToActiveTab();
  refreshGameViews();
  if (isLeaderboardViewActive()) {
    updateLeaderboardAbout();
    void refreshCloudLeaderboardProfiles();
  }
  scheduleNonCriticalHomepageWork();
  setLeaderboardPanelVisible(isLeaderboardViewActive());
  setSupportPanelVisible(false);
  if (hasMineUi) {
    resetMineGame('easy');
  }

  if (libraryTabs) {
    libraryTabs.addEventListener('click', (event) => {
      const button = event.target.closest('[data-library-tab]');
      if (!button) return;
      const tabId = button.dataset.libraryTab;
      uiState.activeLibraryTab = tabId;
      resetVisibleGameCount(tabId);
      syncControlStates();
      syncFeaturedGameToActiveTab();
      setLeaderboardPanelVisible(isLeaderboardViewActive());
      setSupportPanelVisible(false);
      refreshGameViews();
      if (isLeaderboardViewActive()) {
        updateLeaderboardAbout();
      }
      if (uiState.activeLibraryTab !== 'leaderboard' && window.scrollY > 0) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  if (featuredGameCard) {
    const openFeaturedGame = () => {
      if (!uiState.featuredLaunchUrl) return;
      const featuredGame = getFeaturedGame();
      if (featuredGame && !canLaunchGame(featuredGame)) {
        promptLoginForMultiplayer();
        return;
      }
      window.location.href = uiState.featuredLaunchUrl;
    };

    featuredGameCard.addEventListener('click', openFeaturedGame);
    featuredGameCard.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openFeaturedGame();
      }
    });
  }

  if (supportBtn) {
    supportBtn.addEventListener('click', () => {
      setSupportPanelVisible(true);
      closeNotificationsDropdown();
    });
  }

  if (donateBtn) {
    donateBtn.addEventListener('click', () => {
      openAuthOverlay('Donation support will connect after payment setup.');
    });
  }

  if (signalFilters) {
    signalFilters.addEventListener('click', (event) => {
      const button = event.target.closest('[data-signal-filter]');
      if (!button) return;
      uiState.activeSignalFilter = button.dataset.signalFilter;
      resetVisibleGameCount();
      syncControlStates();
      refreshGameViews();
    });
  }

  if (gameSearch) {
    gameSearch.addEventListener('input', () => {
      uiState.librarySearchQuery = gameSearch.value;
      resetVisibleGameCount();
      refreshGameViews();
    });
  }

  if (showMoreGamesBtn) {
    showMoreGamesBtn.addEventListener('click', () => {
      uiState.visibleGameCount += getGameGridBatchSize();
      renderGames();
    });
  }

  if (gameGrid) {
    gameGrid.addEventListener('click', (event) => {
      const card = event.target.closest('.game-card');
      if (!card) return;
      const game = getGameById(card.dataset.gameId || '');
      if (!game) return;
      if (game.launchUrl) {
        if (!canLaunchGame(game)) {
          promptLoginForMultiplayer();
          return;
        }
        window.location.href = game.launchUrl;
        return;
      }
      setActiveGame(card.dataset.gameId);
    });

    gameGrid.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const card = event.target.closest('.game-card');
      if (!card) return;
      event.preventDefault();
      const game = getGameById(card.dataset.gameId || '');
      if (!game) return;
      if (game.launchUrl) {
        if (!canLaunchGame(game)) {
          promptLoginForMultiplayer();
          return;
        }
        window.location.href = game.launchUrl;
        return;
      }
      setActiveGame(card.dataset.gameId);
    });
  }

  if (leaderboardCard) {
    leaderboardCard.addEventListener('click', (event) => {
      const adminToggle = event.target.closest('[data-admin-toggle-game]');
      if (adminToggle) {
        const gameId = adminToggle.dataset.adminToggleGame;
        if (gameId) {
          toggleLeaderboardAdminPanel(gameId);
          renderLeaderboard();
        }
        return;
      }

      const adminInject = event.target.closest('[data-admin-inject-game]');
      if (adminInject) {
        const gameId = adminInject.dataset.adminInjectGame;
        if (!gameId) return;
        const panel = leaderboardCard.querySelector(`[data-admin-panel-game="${gameId}"]`);
        if (!panel) return;

        const rankInput = panel.querySelector('[data-admin-rank]');
        const playerInput = panel.querySelector('[data-admin-player]');
        const valueInput = panel.querySelector('[data-admin-value]');
        const detailInput = panel.querySelector('[data-admin-detail]');

        runAdminInjection({
          gameId,
          rank: rankInput?.value,
          player: playerInput?.value,
          value: valueInput?.value,
          detail: detailInput?.value,
        });
        return;
      }

      const adminQuick = event.target.closest('[data-admin-quick-game]');
      if (adminQuick) {
        const gameId = adminQuick.dataset.adminQuickGame;
        const gameRef = getGameById(gameId || '');
        if (!gameId || !gameRef) return;

        runAdminInjection({
          gameId,
          rank: 1,
          player: getCurrentAccount()?.displayName || 'Owner',
          value: getQuickAbuseValueForGame(gameRef),
          detail: 'Owner quick abuse override',
        });
        return;
      }

      const gameButton = event.target.closest('[data-game-id]');
      if (gameButton) {
        setActiveGame(gameButton.dataset.gameId);
        return;
      }
      const toggleButton = event.target.closest('[data-expand-game]');
      if (!toggleButton) return;
      const gameId = toggleButton.dataset.expandGame;
      uiState.expandedLeaderboardByGame[gameId] = !uiState.expandedLeaderboardByGame[gameId];
      renderLeaderboard();
    });
  }

  if (leaderboardRangeFilters) {
    leaderboardRangeFilters.addEventListener('click', (event) => {
      const button = event.target.closest('[data-range]');
      if (!button) return;
      uiState.activeLeaderboardRange = button.dataset.range;
      syncControlStates();
      updateLeaderboardAbout();
      refreshGameViews();
    });
  }

  if (hasMineUi) {
    modeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        resetMineGame(button.dataset.mode);
      });
    });

    mineRestart.addEventListener('click', () => {
      resetMineGame(mineStateData.mode);
    });

    if (mineRevealCheat) {
      mineRevealCheat.addEventListener('click', () => {
        revealEntireMineBoard();
      });
    }
  }

  window.addEventListener('storage', (event) => {
    if (!event.key) return;
    if (event.key === 'playrClickSpeedLeaderboard'
      || event.key === 'playr.lb.draw-a-perfect-circle'
      || event.key === 'playr.minesweeper.bestTimes.v1'
      || event.key === 'playr.snake.bestScores.v2'
      || event.key === 'playr-simon-says-board-v1'
      || event.key === AUTH_STORAGE_KEYS.profiles) {
      if (isLeaderboardViewActive()) {
        hydrateLeaderboardGames();
        applyPersistedAdminOverrides();
        refreshGameViews();
      }
      refreshSettingsProgressionIfOpen();
    }
    if (event.key === SITE_NOTICE_STORAGE_KEY) {
      if (uiState.notificationsOpen) {
        renderNotificationsDropdown();
      } else {
        syncSiteNoticeBell();
      }
    }
  });

  if (dismissScorePanelBtn) {
    dismissScorePanelBtn.addEventListener('click', () => {
      hideScoreSavePanel();
    });
  }

  const loginAction = () => {
    if (isLoggedIn()) {
      openSettingsOverlay();
      return;
    }
    setAuthMode('login');
    openAuthOverlay();
  };

  const loginOnlyAction = () => {
    setAuthMode('login');
    openAuthOverlay();
  };

  if (saveScoreLoginBtn) {
    saveScoreLoginBtn.addEventListener('click', loginOnlyAction);
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', loginAction);
  }

  if (notificationsBellBtn) {
    notificationsBellBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleNotificationsDropdown();
    });
  }

  if (notificationsDropdown) {
    notificationsDropdown.addEventListener('click', (event) => {
      event.stopPropagation();
    });
  }

  if (authCloseBtn) {
    authCloseBtn.addEventListener('click', closeAuthOverlay);
  }

  document.addEventListener('click', () => {
    if (uiState.notificationsOpen) {
      closeNotificationsDropdown();
    }
  });

  document.addEventListener('pointerdown', (event) => {
    const target = event.target;
    if (!uiState.notificationsOpen) return;
    if (notificationsDropdown?.contains(target) || notificationsBellBtn?.contains(target)) return;
    closeNotificationsDropdown();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && uiState.notificationsOpen) {
      closeNotificationsDropdown();
    }
  });

  window.addEventListener('resize', () => {
    if (uiState.notificationsOpen) {
      positionNotificationsDropdown();
    }
  });

  window.addEventListener('load', () => {
    if (!authOverlay?.hidden || authUiState.mode === 'signup') {
      renderSignupCaptchaIfNeeded();
    }
  });

  window.addEventListener('scroll', () => {
    if (uiState.notificationsOpen) {
      positionNotificationsDropdown();
    }
  }, { passive: true });

  if (authOverlay) {
    authOverlay.addEventListener('click', (event) => {
      if (event.target === authOverlay) {
        closeAuthOverlay();
      }
    });
  }

  if (systemOverlay) {
    systemOverlay.addEventListener('click', (event) => {
      if (event.target === systemOverlay) {
        closeSystemDialog(false);
      }
    });
  }

  if (systemCancelBtn) {
    systemCancelBtn.addEventListener('click', () => closeSystemDialog(false));
  }

  if (systemConfirmBtn) {
    systemConfirmBtn.addEventListener('click', () => closeSystemDialog(true));
  }

  if (settingsOverlay) {
    settingsOverlay.addEventListener('click', (event) => {
      if (event.target === settingsOverlay) {
        closeSettingsOverlay();
      }
    });
  }

  if (settingsCloseBtn) {
    settingsCloseBtn.addEventListener('click', closeSettingsOverlay);
  }

  window.addEventListener('playr-profiles-updated', () => {
    authState.profiles = readStoredProfiles();
    if (!profileUi.profileCustomizeOverlay?.hidden) {
      renderProfileCustomizationPanel(getCurrentAccount());
    }
  });

  window.addEventListener('playr-custom-banners-updated', () => {
    if (!profileUi.profileCustomizeOverlay?.hidden) {
      renderProfileCustomizationPanel(getCurrentAccount());
    }
  });

  if (settingsUpdateDisplayBtn) {
    settingsUpdateDisplayBtn.addEventListener('click', () => {
      void updateDisplayNameFromSettings();
    });
  }

  if (settingsUpdatePasswordBtn) {
    settingsUpdatePasswordBtn.addEventListener('click', () => {
      void updatePasswordFromSettings();
    });
  }

  if (settingsLogoutBtn) {
    settingsLogoutBtn.addEventListener('click', () => {
      void logoutFromSettings();
    });
  }

  if (settingsShowPasswordsToggle) {
    settingsShowPasswordsToggle.addEventListener('change', () => {
      setSettingsPasswordVisibility(Boolean(settingsShowPasswordsToggle.checked));
    });
  }

  if (settingsReferralCopyBtn) {
    settingsReferralCopyBtn.addEventListener('click', async () => {
      const link = String(settingsReferralLink?.value || '').trim();
      if (!link) {
        setSettingsStatus('Referral link is not ready yet.', 'danger');
        return;
      }
      try {
        await navigator.clipboard.writeText(link);
        setSettingsStatus('Referral link copied.', 'success');
      } catch {
        setSettingsStatus('Could not copy the referral link. Try again.', 'danger');
      }
    });
  }

  if (settingsBadgeList) {
    settingsBadgeList.addEventListener('click', (event) => {
      const button = event.target.closest('[data-badge-id]');
      if (!button) return;
      toggleEquippedSettingsBadge(button.getAttribute('data-badge-id') || '');
    });
  }

  if (profileUi.profileCustomizeBadgeList) {
    profileUi.profileCustomizeBadgeList.addEventListener('click', (event) => {
      const button = event.target.closest('[data-badge-id]');
      if (!button) return;
      toggleEquippedSettingsBadge(button.getAttribute('data-badge-id') || '');
    });
  }

  if (ownerXpAddBtn) {
    ownerXpAddBtn.addEventListener('click', () => {
      updateOwnerXpFromSettings('add');
    });
  }

  if (ownerXpRemoveBtn) {
    ownerXpRemoveBtn.addEventListener('click', () => {
      updateOwnerXpFromSettings('remove');
    });
  }

  if (profileUi.friendsBtn) {
    profileUi.friendsBtn.addEventListener('click', () => {
      if (profileUi.friendsOverlay?.hidden) {
        openFriendsPanel();
      } else {
        closeFriendsPanel();
      }
    });
  }

  if (profileUi.friendsCloseBtn) {
    profileUi.friendsCloseBtn.addEventListener('click', closeFriendsPanel);
  }

  if (profileUi.profileCloseBtn) {
    profileUi.profileCloseBtn.addEventListener('click', closeProfilePanel);
  }

  if (profileUi.profileCustomizeCloseBtn) {
    profileUi.profileCustomizeCloseBtn.addEventListener('click', closeProfileCustomizationOverlay);
  }

  if (profileUi.friendsAddBtn) {
    profileUi.friendsAddBtn.addEventListener('click', async () => {
      const rawName = String(profileUi.friendsAddInput?.value || '').trim();
      if (!rawName) {
        setFriendsPanelStatus('Enter a display name first.', 'info');
        return;
      }
      try {
        const targetProfile = await resolveUserProfileRecord({ displayName: rawName });
        if (!targetProfile?.uid) {
          setFriendsPanelStatus('Could not find that player.', 'danger');
          return;
        }
        await sendFriendRequestByProfile(targetProfile);
        if (profileUi.friendsAddInput) profileUi.friendsAddInput.value = '';
        setFriendsPanelStatus(`Friend request sent to ${targetProfile.displayName}.`, 'success');
      } catch {
        setFriendsPanelStatus('Could not send friend request right now.', 'danger');
      }
    });
  }

  if (profileUi.friendsTabs) {
    profileUi.friendsTabs.addEventListener('click', (event) => {
      const button = event.target.closest('[data-friends-tab]');
      if (!button) return;
      setFriendsTab(button.getAttribute('data-friends-tab') || 'friends');
    });
  }

  if (profileUi.vipBannerUpsellCloseBtn) {
    profileUi.vipBannerUpsellCloseBtn.addEventListener('click', closeVipBannerUpsell);
  }

  document.addEventListener('click', (event) => {
    const profileTrigger = event.target.closest('[data-profile-trigger="true"]');
    if (profileTrigger) {
      void openProfilePanel({
        uid: profileTrigger.getAttribute('data-profile-uid') || '',
        displayName: profileTrigger.getAttribute('data-profile-display-name') || '',
      });
      return;
    }

    const openProfileBtn = event.target.closest('[data-open-profile-uid], [data-open-profile-name]');
    if (openProfileBtn) {
      void openProfilePanel({
        uid: openProfileBtn.getAttribute('data-open-profile-uid') || '',
        displayName: openProfileBtn.getAttribute('data-open-profile-name') || '',
      });
      return;
    }

    const addFriendBtn = event.target.closest('[data-profile-add-friend]');
    if (addFriendBtn) {
      const targetUid = addFriendBtn.getAttribute('data-profile-add-friend') || '';
      void resolveUserProfileRecord({
        uid: targetUid,
        displayName: profileUi.profileOverlay?.dataset.profileName || '',
      }).then((targetProfile) => {
        if (targetProfile) {
          return sendFriendRequestByProfile(targetProfile);
        }
        return null;
      }).catch(() => {
        setProfilePanelStatus('Could not send friend request right now.', 'danger');
      });
      return;
    }

    const openCustomizationBtn = event.target.closest('[data-open-profile-customization="true"]');
    if (openCustomizationBtn) {
      openProfileCustomizationOverlay();
      return;
    }

    const acceptBtn = event.target.closest('[data-friend-accept]');
    if (acceptBtn) {
      void respondToFriendRequest(acceptBtn.getAttribute('data-friend-accept') || '', 'accept')
        .then(() => {
          setFriendsPanelStatus('Friend request accepted.', 'success');
          setProfilePanelStatus('Friend request accepted.', 'success');
        })
        .catch(() => {
          setFriendsPanelStatus('Could not accept that request right now.', 'danger');
        });
      return;
    }

    const rejectBtn = event.target.closest('[data-friend-reject]');
    if (rejectBtn) {
      void respondToFriendRequest(rejectBtn.getAttribute('data-friend-reject') || '', 'reject')
        .then(() => {
          setFriendsPanelStatus('Friend request rejected.', 'info');
          setProfilePanelStatus('Friend request rejected.', 'info');
        })
        .catch(() => {
          setFriendsPanelStatus('Could not reject that request right now.', 'danger');
        });
      return;
    }

    const cancelBtn = event.target.closest('[data-friend-cancel]');
    if (cancelBtn) {
      void respondToFriendRequest(cancelBtn.getAttribute('data-friend-cancel') || '', 'cancel')
        .then(() => {
          setFriendsPanelStatus('Friend request cancelled.', 'info');
          setProfilePanelStatus('Friend request cancelled.', 'info');
        })
        .catch(() => {
          setFriendsPanelStatus('Could not cancel that request right now.', 'danger');
        });
      return;
    }

    const socialActionBtn = event.target.closest('[data-social-action]');
    if (socialActionBtn) {
      const action = socialActionBtn.getAttribute('data-social-action') || '';
      const targetUid = socialActionBtn.getAttribute('data-social-target') || '';
      if (action === 'accept-request') {
        void respondToFriendRequest(targetUid, 'accept')
          .then(() => {
            setFriendsPanelStatus('Friend request accepted.', 'success');
            setProfilePanelStatus('Friend request accepted.', 'success');
          })
          .catch(() => {
            setFriendsPanelStatus('Could not accept that request right now.', 'danger');
          });
        return;
      }
      if (action === 'reject-request') {
        void respondToFriendRequest(targetUid, 'reject')
          .then(() => {
            setFriendsPanelStatus('Friend request declined.', 'info');
            setProfilePanelStatus('Friend request declined.', 'info');
          })
          .catch(() => {
            setFriendsPanelStatus('Could not decline that request right now.', 'danger');
          });
        return;
      }
      if (action === 'cancel-request') {
        if (!window.confirm('Cancel this outgoing friend request?')) return;
        void respondToFriendRequest(targetUid, 'cancel')
          .then(() => {
            setFriendsPanelStatus('Friend request cancelled.', 'info');
            setProfilePanelStatus('Friend request cancelled.', 'info');
          })
          .catch(() => {
            setFriendsPanelStatus('Could not cancel that request right now.', 'danger');
          });
        return;
      }
      if (action === 'unfriend') {
        if (!window.confirm('Remove this friend from your friends list?')) return;
        void removeFriendshipWith(targetUid)
          .then(() => {
            setFriendsPanelStatus('Friend removed.', 'info');
            setProfilePanelStatus('Friend removed.', 'info');
          })
          .catch(() => {
            setFriendsPanelStatus('Could not remove that friend right now.', 'danger');
          });
        return;
      }
    }

    if (event.target.closest('#profileWarnBtn')) {
      openModerationComposer('warn');
      return;
    }
    if (event.target.closest('#profilePromoteBtn')) {
      void applyStaffRoleChange('promote');
      return;
    }
    if (event.target.closest('#profileDemoteBtn')) {
      void applyStaffRoleChange('demote');
      return;
    }
    if (event.target.closest('#profileMuteBtn')) {
      openModerationComposer('mute');
      return;
    }
    if (event.target.closest('#profileBanBtn')) {
      openModerationComposer('ban');
      return;
    }
    if (event.target.closest('#profileUnmuteBtn')) {
      void applyStaffModerationAction('unmute');
      return;
    }
    if (event.target.closest('#profileUnbanBtn')) {
      void applyStaffModerationAction('unban');
      return;
    }
    if (event.target.closest('#profileComposeCancelBtn')) {
      closeModerationComposer();
      return;
    }
    if (event.target.closest('#profileComposeSubmitBtn')) {
      const action = profileUi.profileModerationComposer?.dataset.action || '';
      if (action === 'warn' || action === 'mute' || action === 'ban') {
        void applyStaffModerationAction(action);
      }
      return;
    }

    const loginFromProfile = event.target.closest('[data-open-login-from-profile]');
    if (loginFromProfile) {
      setAuthMode('login');
      openAuthOverlay('Log in to add friends.');
      return;
    }

    const bannerPreset = event.target.closest('[data-banner-preset]');
    if (bannerPreset) {
      applySelectedBannerPreset(bannerPreset.getAttribute('data-banner-preset') || '');
      return;
    }

    const customBannerApplyBtn = event.target.closest('[data-apply-custom-banner]');
    if (customBannerApplyBtn) {
      applySavedCustomBanner(customBannerApplyBtn.getAttribute('data-apply-custom-banner') || '');
      return;
    }

    const customBannerDeleteBtn = event.target.closest('[data-delete-custom-banner]');
    if (customBannerDeleteBtn) {
      deleteSavedCustomBanner(customBannerDeleteBtn.getAttribute('data-delete-custom-banner') || '');
    }
  });

  document.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target instanceof HTMLElement && event.target.matches('[data-profile-trigger="true"]')) {
      event.preventDefault();
      void openProfilePanel({
        uid: event.target.getAttribute('data-profile-uid') || '',
        displayName: event.target.getAttribute('data-profile-display-name') || '',
      });
    }
    if (event.key === 'Escape') {
      if (!profileUi.profileOverlay?.hidden) closeProfilePanel();
      if (!profileUi.friendsOverlay?.hidden) closeFriendsPanel();
      if (!profileUi.vipBannerUpsellOverlay?.hidden) closeVipBannerUpsell();
    }
  });

  if (profileUi.profileOverlay) {
    profileUi.profileOverlay.addEventListener('click', (event) => {
      if (event.target === profileUi.profileOverlay) {
        closeProfilePanel();
      }
    });
  }

  if (profileUi.profileCustomizeOverlay) {
    profileUi.profileCustomizeOverlay.addEventListener('click', (event) => {
      if (event.target === profileUi.profileCustomizeOverlay) {
        closeProfileCustomizationOverlay();
      }
    });
  }

  if (profileUi.friendsOverlay) {
    profileUi.friendsOverlay.addEventListener('click', (event) => {
      if (event.target === profileUi.friendsOverlay) {
        closeFriendsPanel();
      }
    });
  }

  if (profileUi.vipBannerUpsellOverlay) {
    profileUi.vipBannerUpsellOverlay.addEventListener('click', (event) => {
      if (event.target === profileUi.vipBannerUpsellOverlay) {
        closeVipBannerUpsell();
      }
    });
  }

  window.addEventListener('playr-progression-changed', () => {
    if (authState.currentUser && Date.now() >= authState.suspendProgressionSyncUntil) {
      void syncCurrentAccountProfileToFirestore();
    }
    if (!settingsOverlay?.hidden) {
      renderSettingsProgression(getCurrentAccount());
      renderBannerSettings(getCurrentAccount());
    }
    if (uiState.activeLeaderboardRange === 'levels') {
      renderLeaderboard();
    }
    if (!profileUi.profileOverlay?.hidden) {
      void renderOpenProfilePanel();
    }
  });

  if (adminInjectScoreBtn) {
    adminInjectScoreBtn.addEventListener('click', () => {
      runAdminInjection();
    });
  }

  if (adminQuickMinesBtn) {
    adminQuickMinesBtn.addEventListener('click', () => {
      runAdminInjection({
        gameId: 'minesweeper',
        rank: 1,
        player: 'Owner',
        value: '1s',
        detail: 'Owner speedrun override',
      });
    });
  }

  if (adminQuickCookiesBtn) {
    adminQuickCookiesBtn.addEventListener('click', () => {
      runAdminInjection({
        gameId: 'cookie-clicker',
        rank: 1,
        player: 'Owner',
        value: 'inf',
        detail: 'Owner cookie flood override',
      });
    });
  }

  if (adminResetScoresBtn) {
    adminResetScoresBtn.addEventListener('click', () => {
      runAdminResetScores();
    });
  }

  if (adminRevertScoresBtn) {
    adminRevertScoresBtn.addEventListener('click', () => {
      runAdminRevertScores();
    });
  }

  if (adminPurgeUnknownAccountsBtn) {
    adminPurgeUnknownAccountsBtn.addEventListener('click', () => {
      void runAdminPurgeUnknownAccounts();
    });
  }

  if (authContinueBtn) {
    authContinueBtn.addEventListener('click', loginOrCreateAccount);
  }

  if (authIdentifierInput) {
    authIdentifierInput.addEventListener('keydown', handleAuthEnterSubmit);
    authIdentifierInput.addEventListener('input', () => {
      setAuthStatus('', 'info');
      void refreshSignupNameIndicator();
    });
  }

  if (authPinInput) {
    authPinInput.addEventListener('keydown', handleAuthEnterSubmit);
  }

  if (authPinToggleBtn) {
    authPinToggleBtn.addEventListener('click', () => {
      setAuthPasswordVisibility(!authUiState.showPassword);
      if (authPinInput) {
        authPinInput.focus();
      }
    });
  }

  if (authModeToggleBtn) {
    authModeToggleBtn.onclick = (event) => {
      event.preventDefault();
      toggleAuthMode();
    };
  }

  if (claimLoginBtn) {
    claimLoginBtn.addEventListener('click', () => {
      hideClaimOverlay();
      setAuthMode('login');
      openAuthOverlay();
    });
  }

  if (claimSignupBtn) {
    claimSignupBtn.addEventListener('click', () => {
      hideClaimOverlay();
      setAuthMode('signup');
      openAuthOverlay();
    });
  }

  if (claimOverlay) {
    claimOverlay.addEventListener('click', (event) => {
      if (event.target === claimOverlay) {
        hideClaimOverlay();
      }
    });
  }

  if (hasMineUi) {
    mineBoard.addEventListener('click', (event) => {
      const cellButton = event.target.closest('[data-index]');
      if (!cellButton) return;
      revealMineCell(Number(cellButton.dataset.index));
    });

    mineBoard.addEventListener('contextmenu', (event) => {
      const cellButton = event.target.closest('[data-index]');
      if (!cellButton) return;
      event.preventDefault();
      toggleMineFlag(Number(cellButton.dataset.index));
    });
  }

  window.addEventListener('pagehide', cleanupOverscrollEasterEgg, { once: true });
}

init();
