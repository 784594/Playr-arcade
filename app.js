const SINGLE_PLAYER_PLACEHOLDERS = [
  { id: 'snake', name: 'Snake', controls: 'Arrow keys' },
  { id: '2048', name: '2048', controls: 'Arrow keys' },
  { id: 'minesweeper', name: 'Minesweeper', controls: 'Mouse' },
  { id: 'infinite-craft-clone', name: 'Infinite Craft', controls: 'Mouse' },
  { id: 'the-password-game', name: 'The Password Game', controls: 'Keyboard' },
  { id: 'tetris', name: 'Tetris', controls: 'Arrow keys' },
  { id: 'dino-run-clone', name: 'Dino Run Clone', controls: 'Space/Arrow' },
  { id: 'pac-man', name: 'Pac-Man', controls: 'Arrow keys' },
  { id: 'sudoku', name: 'Sudoku', controls: 'Mouse' },
  { id: 'wordle-inf', name: 'Wordle Infinite', controls: 'Keyboard' },
  { id: 'flappy-bird-clone', name: 'Flappy Bird Clone', controls: 'Space/Mouse' },
  { id: 'doodle-jump-clone', name: 'Doodle Jump Clone', controls: 'Arrow keys' },
  { id: 'breakout', name: 'Breakout', controls: 'Mouse' },
  { id: 'asteroids', name: 'Asteroids', controls: 'Arrow keys' },
  { id: 'frogger', name: 'Frogger', controls: 'Arrow keys' },
  { id: 'solitaire', name: 'Solitaire', controls: 'Mouse/Touch' },
  { id: 'space-invaders', name: 'Space Invaders', controls: 'Arrow keys' },
  { id: 'simon-says', name: 'Simon Says', controls: 'Mouse' },
  { id: 'little-alchemy-clone', name: 'Little Alchemy Clone', controls: 'Mouse' },
  { id: 'draw-a-perfect-circle', name: 'Draw a Perfect Circle', controls: 'Mouse' },
  { id: 'spend-bill-gates-money', name: "Spend Bill Gates' Money", controls: 'Mouse' },
  { id: 'the-deep-sea', name: 'The Deep Sea', controls: 'Mouse Scroll' },
  { id: 'geometry-dash-clone', name: 'Geometry Dash Clone', controls: 'Mouse Click' },
  { id: 'cookie-clicker', name: 'Cookie Clicker', controls: 'Mouse' },
  { id: 'type-test', name: 'Type Test', controls: 'Keyboard' },
  { id: 'tower-builder', name: 'Tower Builder', controls: 'Mouse Click' },
  { id: 'memory-match', name: 'Memory Match', controls: 'Mouse' },
  { id: 'hextris', name: 'Hextris', controls: 'Arrow keys' },
  { id: 'burrito-bison-clone', name: 'Burrito Bison Clone', controls: 'Mouse' },
  { id: 'click-speed-test', name: 'Click Speed Test', controls: 'Mouse' },
  { id: 'aim-training-arena', name: 'Aim Training Arena', controls: 'Mouse' },
  { id: 'typing-test', name: 'Typing Test', controls: 'Keyboard' },
  { id: 'slide-puzzle', name: 'Slide Puzzle', controls: 'Mouse' },
  { id: 'absurd-trolley-problem', name: 'The Absurd Trolley Problem!', controls: 'Mouse' },
];

const MULTIPLAYER_PLACEHOLDERS = [
  { id: 'infinite-craft-multiplayer', name: 'Infinite Craft Multiplayer', controls: 'Mouse - shared room crafting (2P-4P)' },
  { id: 'battleship', name: 'Battleship', controls: 'Mouse - Turn-based 2P/4P tournament' },
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
  'click-speed-test': { label: 'Highest CPS', unit: 'cps', metric: 'Fastest clicks per second', kind: 'cps' },
  'typing-test': { label: 'Highest WPM', unit: 'wpm', metric: 'Speed plus accuracy trainer', kind: 'wpm' },
  'tetris': { label: 'Top score stacks', unit: 'score', metric: 'Highest score / survival / level', kind: 'score' },
  'pac-man': { label: 'Arcade score race', unit: 'score', metric: 'Fastest level clear / highest score', kind: 'score' },
  'doodle-jump-clone': { label: 'Highest climbs', unit: 'height', metric: 'Highest height reached', kind: 'distance' },
  'breakout': { label: 'Brick breaker records', unit: 'score', metric: 'Fastest clear / highest score', kind: 'score' },
  'asteroids': { label: 'Space survival', unit: 'score', metric: 'Score / survival time', kind: 'score' },
  'frogger': { label: 'River crossing times', unit: 'time', metric: 'Fastest clear time', kind: 'time' },
  'space-invaders': { label: 'Wave clear board', unit: 'score', metric: 'Highest wave / score', kind: 'score' },
  'geometry-dash-clone': { label: 'Run consistency', unit: 'time', metric: 'Fastest completion / least deaths', kind: 'time' },
  'cookie-clicker': { label: 'Cookies Clicked', unit: 'cookies', metric: 'Cookies clicked / CPC', kind: 'cookies' },
  'type-test': { label: 'Typing speed', unit: 'wpm', metric: 'Words per minute / accuracy', kind: 'score' },
  'simon-says': { label: 'Memory streaks', unit: 'sequence', metric: 'Longest sequence survived', kind: 'count' },
  'draw-a-perfect-circle': { label: 'Accuracy board', unit: 'accuracy', metric: 'Accuracy / deviation %', kind: 'accuracy' },
  'spend-bill-gates-money': { label: 'Spending speedrun', unit: 'time', metric: 'Fastest completion time', kind: 'time' },
  'memory-match': { label: 'Fastest matches', unit: 'time', metric: 'Fastest completion time', kind: 'time' },
  'aim-training-arena': { label: 'Aim discipline', unit: 'score', metric: 'Unified aim score', kind: 'score' },
  '2048': { label: 'Tile champions', unit: 'tile', metric: 'Highest tile / fastest 2048', kind: 'tile' },
  'sudoku': { label: 'Sudoku solve speed', unit: 'time', metric: 'Fastest solve time', kind: 'time' },
  'slide-puzzle': { label: 'Puzzle speedruns', unit: 'time', metric: 'Fastest solve time', kind: 'time' },
  'hextris': { label: 'Hex survival', unit: 'score', metric: 'Score / survival time', kind: 'score' },
  'dino-run-clone': { label: 'Distance survivors', unit: 'distance', metric: 'Distance / survival time', kind: 'distance' },
  'burrito-bison-clone': { label: 'Launch distance', unit: 'distance', metric: 'Distance / score', kind: 'distance' },
  'infinite-craft-clone': { label: 'Discovery milestones', unit: 'discoveries', metric: 'Discovery milestones / total', kind: 'count' },
};

const PLAYER_POOL = [
  'Nova', 'Kite', 'Milo', 'Aya', 'Juno', 'Sage', 'Iris', 'Theo', 'Luna', 'Eden',
  'Zed', 'Rin', 'Opal', 'Nico', 'Quinn', 'Atlas', 'Rae', 'Finn', 'Mira', 'Oak',
  'Pax', 'Skye', 'Rey', 'Ari', 'Noa', 'Jax', 'Lux', 'Cora', 'Vale', 'Sora',
];

const multiplayerAccessConfig = {
  requireLoginFor2P: true,
  singleUseInviteLinks: true,
};

const SINGLE_PLAYER_SLUG_ALIASES = {
  'type-test': 'typing-test',
};

const COMPLETED_SINGLE_PLAYER_IDS = new Set([
  'snake',
  '2048',
  'asteroids',
  'breakout',
  'burrito-bison-clone',
  'click-speed-test',
  'typing-test',
  'cookie-clicker',
  'type-test',
  'dino-run-clone',
  'doodle-jump-clone',
  'draw-a-perfect-circle',
  'flappy-bird-clone',
  'frogger',
  'geometry-dash-clone',
  'hextris',
  'infinite-craft-clone',
  'little-alchemy-clone',
  'memory-match',
  'minesweeper',
  'pac-man',
  'simon-says',
  'spend-bill-gates-money',
  'slide-puzzle',
  'solitaire',
  'space-invaders',
  'sudoku',
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
  localStorage.setItem(AUTH_STORAGE_KEYS.profiles, JSON.stringify(profiles || {}));
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
      title: '',
      flair: '',
      badgeAssets: { vip: '', levelGroups: {}, referral: {} },
    };
  }
  return api.getProgressionSnapshot(account);
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

function syncSiteNoticeBell() {
  const hasUnread = hasUnreadSiteNotices();
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
  notificationsList.innerHTML = '';

  if (!notices.length) {
    notificationsEmpty.hidden = false;
    syncSiteNoticeBell();
    return;
  }

  notificationsEmpty.hidden = true;

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

function buildAccountRoles({ roles = [], isVip = false, identifierType = 'unknown', identifier = '' } = {}) {
  const merged = new Set(
    Array.isArray(roles)
      ? roles.map(normalizeRoleName).filter(Boolean)
      : [],
  );

  if (isVip) {
    merged.add('vip');
  }

  if (identifierType === 'email' && OWNER_VIP_IDENTIFIERS.has(normalizeAccountIdentifier(identifier))) {
    merged.add('vip');
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
  return Boolean(account?.uid && OWNER_ADMIN_UIDS.has(account.uid));
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
  return replaced
    .replace(/[\s_.\-]+/g, '')
    .replace(/[^a-z]/g, '');
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
  // Also check with minimal normalization to catch obfuscation
  const sparseCheck = cleaned.toLowerCase().replace(/[^a-z]/g, '');

  const hasReserved = RESERVED_RANK_TERMS.some((term) => moderationText.includes(term));
  if (hasReserved) {
    return {
      valid: false,
      reason: 'That login name uses a reserved staff or rank word.',
      reasonCode: 'reserved-term',
    };
  }

  const hasProfanity = PROFANITY_TERMS.some((term) => moderationText.includes(term) || sparseCheck.includes(term));
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

function buildTop100ForGame(gameId, kind) {
  return Array.from({ length: 100 }, (_, index) => {
    const rank = index + 1;
    const name = `${PLAYER_POOL[index % PLAYER_POOL.length]}${rank > PLAYER_POOL.length ? rank : ''}`;
    return {
      rank,
      player: name,
      value: formatLeaderboardValue(kind, rank),
      detail: rank <= 5 ? 'Top contender' : 'Qualifier',
    };
  });
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

  if (!rows.length && spec) {
    return buildTop100ForGame(gameId, spec.kind);
  }

  if (rows.length < 5 && spec) {
    const filler = buildTop100ForGame(gameId, spec.kind)
      .filter((entry) => !rows.some((row) => row.player === entry.player && row.value === entry.value))
      .slice(0, Math.max(0, 100 - rows.length));
    return rows.concat(filler).map((entry, index) => ({ ...entry, rank: index + 1 }));
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
    game.leaderboardEligible = rows.length > 0;
    game.competitive = rows.length > 0;

    const currentAccount = getCurrentAccount();
    const currentName = currentAccount?.displayName || 'Guest';
    const bestRow = rows[0] || null;
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
  const top100 = lbSpec ? buildTop100ForGame(entry.id, lbSpec.kind) : [];
  const currentRank = lbSpec ? Math.min(100, 45 + (index % 30)) : null;
  const secondaryValue = entry.id === 'cookie-clicker'
    ? Math.max(1, 1 + Math.floor(Math.random() * 10))
    : null;
  
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
    leaderboard: top100.slice(0, 5),
    launchUrl,
    currentPlayer: lbSpec
      ? {
          username: 'You (Guest)',
          rank: currentRank,
          value: formatLeaderboardValue(lbSpec.kind, currentRank),
          secondaryValue,
        }
      : null,
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
const leaderboardTabs = document.getElementById('leaderboardTabs');
const leaderboardCard = document.getElementById('leaderboardCard');
const leaderboardRangeFilters = document.getElementById('leaderboardRangeFilters');
const leaderboardAbout = document.getElementById('leaderboardAbout');
const leaderboardSection = document.getElementById('leaderboards');
const publishingGrid = document.getElementById('publishingGrid');
const libraryTabs = document.getElementById('libraryTabs');
const librarySearchShell = document.getElementById('librarySearchShell');
const gameSearch = document.getElementById('gameSearch');
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
  all: { anchorId: 'snake' },
  'single-player': { anchorId: 'minesweeper' },
  'multiplayer': { anchorId: 'battleship' },
  competitive: { anchorId: 'pac-man' },
  leaderboard: { anchorId: 'pac-man' },
};

const uiState = {
  activeLibraryTab: 'all',
  activeSignalFilter: 'all',
  activeGameId: games[0]?.id || null,
  activeLeaderboardRange: 'daily',
  expandedLeaderboardByGame: {},
  adminPanelByGame: {},
  notificationsOpen: false,
  librarySearchQuery: '',
  featuredGameId: null,
  featuredLaunchUrl: null,
};

const authState = {
  profiles: readStoredProfiles(),
  currentUser: firebaseAuth?.currentUser || null,
};

const authUiState = {
  step: 'form',
  mode: 'signup',
  pendingRegistration: null,
  showPassword: false,
  nameCheckRequestId: 0,
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
  const user = authState.currentUser;
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
    roles,
    isVip: roles.includes('vip'),
    verified: {
      email: Boolean(user.emailVerified),
      phone: Boolean(user.phoneNumber),
    },
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
    createdAt: previous.createdAt || Date.now(),
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
      return Boolean(current && isAccountVerified(current));
    },
    canAccessAdminControls() {
      return isCurrentAccountAdmin();
    },
    hasRole(roleName) {
      return hasAccountRole(getCurrentAccount(), roleName);
    },
    shouldShowAds() {
      return !isCurrentAccountVip();
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
    createdAt: profile.createdAt || Date.now(),
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

function renderSettingsProgression(account = getCurrentAccount()) {
  const progression = getProgressionSnapshotForAccount(account);
  if (settingsXpLevel) settingsXpLevel.textContent = `Level ${progression.level}`;
  if (settingsXpTotal) settingsXpTotal.textContent = `${Math.round(progression.xp)} XP`;
  if (settingsXpProgress) settingsXpProgress.style.width = `${Math.round((progression.progress || 0) * 100)}%`;
  if (settingsXpProgressLabel) {
    settingsXpProgressLabel.textContent = `${Math.round(progression.xp)} / ${Math.round(progression.nextThreshold)} XP`;
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
      { count: 1, reward: '+50 XP + Recruiter I' },
      { count: 3, reward: '+150 XP + profile flair' },
      { count: 5, reward: '+300 XP + animated badge' },
      { count: 10, reward: '+600 XP + special title' },
      { count: 25, reward: '+1500 XP + exclusive cosmetic' },
    ].map((tier) => `
      <div class="settings-tier-row ${progression.qualifiedReferrals >= tier.count ? 'claimed' : ''}">
        <strong>${tier.count}</strong>
        <span>${tier.reward}</span>
      </div>
    `).join('');
  }
}

function openSettingsOverlay() {
  const account = getCurrentAccount();
  if (!account) {
    setAuthMode('login');
    openAuthOverlay('Log in to open settings.');
    return;
  }

  if (settingsDisplayInput) settingsDisplayInput.value = account.displayName || '';
  if (settingsCurrentPasswordInput) settingsCurrentPasswordInput.value = '';
  if (settingsNewPasswordInput) settingsNewPasswordInput.value = '';
  if (settingsShowPasswordsToggle) settingsShowPasswordsToggle.checked = false;
  setSettingsPasswordVisibility(false);
  renderSettingsProgression(account);

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
  setAuthNameIndicator('idle');
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
  setAuthStatus('');
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

    const signupIdentifier = normalized.type === 'email'
      ? normalized.value
      : createSyntheticSignupEmail(displayName);

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
    }

    authUiState.pendingRegistration = null;
    authUiState.step = 'form';
    closeAuthOverlay();
    hideClaimOverlay();
    renderAuthUi();
    setAuthStatus('Account created. Keep your password safe because recovery is currently disabled.', 'success');
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
    pool = games.filter((game) => game.competitive && game.leaderboardEligible);
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
    filtered = filtered.filter((game) => game.competitive === true && Array.isArray(game.leaderboard) && game.leaderboard.length > 0);
  } else if (uiState.activeLibraryTab === 'leaderboard') {
    filtered = filtered.filter((game) => Array.isArray(game.leaderboard) && game.leaderboard.length > 0);
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
  const displayTab = uiState.activeLibraryTab === 'multiplayer' ? 'Multiplayer' : tabLabel;
  const displayText = uiState.activeSignalFilter === 'all'
    ? `${displayTab}: ${count} game${count === 1 ? '' : 's'} shown.`
    : `${displayTab} + ${signalLabel}: ${count} game${count === 1 ? '' : 's'} shown.`;
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
  setFeaturedGame(getFeaturedGameForTab(uiState.activeLibraryTab));
}

function getGameById(gameId) {
  return games.find((game) => game.id === gameId) || null;
}

function getFeaturedGame() {
  return getGameById(uiState.featuredGameId);
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
  const filteredGames = getFilteredGames();
  updateFilterSummary(filteredGames);
  if (filteredGames.length === 0) {
    gameGrid.innerHTML = `
      <article class="game-card empty-state">
        <h3>No games match these filters yet.</h3>
        <p>Try a different tab or filter while we keep expanding the hub.</p>
      </article>
    `;
    return;
  }
  gameGrid.innerHTML = filteredGames
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
}

function renderLeaderboard() {
  const eligibleGames = games.filter((game) => game.leaderboardEligible && Array.isArray(game.leaderboardTop100) && game.leaderboardTop100.length > 0);

  if (uiState.activeLeaderboardRange === 'most-xp') {
    const currentAccount = getCurrentAccount();
    const currentProgression = getProgressionSnapshotForAccount(currentAccount);
    const rows = Array.from({ length: 10 }, (_, index) => {
      if (index === 0 && currentAccount) {
        return {
          rank: 1,
          player: currentAccount.displayName,
          xp: Math.round(currentProgression.xp),
          level: currentProgression.level,
          profile: currentAccount,
          detail: 'Live local progression preview',
        };
      }
      return {
        rank: index + 1,
        player: `Player ${index + 1}`,
        xp: 5000 - (index * 375),
        level: Math.max(1, 12 - index),
        profile: null,
        detail: 'Ready for backend hookup',
      };
    });

    leaderboardCard.innerHTML = `
      <div class="leaderboard-header">
        <div>
          <p class="panel-label">Progression leaderboard</p>
          <h3>Most XP</h3>
          <p>This board is staged and UI-ready. It will rank accounts by total XP once the shared backend feed is connected.</p>
        </div>
        <div>
          <span class="tag warn">Prepared now</span>
        </div>
      </div>
      <p class="leaderboard-summary">Showing the planned top 10 layout with rank, XP, and level.</p>
      <div class="table-wrap">
        <table class="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Total XP</th>
              <th>Level</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((row) => `
              <tr>
                <td class="rank">#${row.rank}</td>
                <td>${formatPlayerIdentityMarkup(row.player, { record: row.profile || findProfileByDisplayName(row.player), compact: true })}</td>
                <td>${row.xp.toLocaleString()}</td>
                <td>Level ${row.level}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
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
              <th>Notes</th>
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
                    <td>${row.detail}</td>
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

  const rangeBadge = uiState.activeLeaderboardRange === 'daily'
    ? 'Daily snapshot'
    : uiState.activeLeaderboardRange === 'your-stats'
      ? 'Your stats preview'
      : 'All-time records';

  const isExpanded = uiState.expandedLeaderboardByGame[game.id] === true;
  const visibleRows = isExpanded ? game.leaderboardTop100 : game.leaderboardTop100.slice(0, 5);
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
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${visibleRows
                .map(
                  (row) => `
                    <tr>
                      <td class="rank">#${row.rank}</td>
                      <td>${formatPlayerIdentityMarkup(row.player, { record: findProfileByDisplayName(row.player), compact: true })}</td>
                      <td>${row.value}</td>
                      <td>${row.detail}</td>
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
  if (uiState.activeLeaderboardRange === 'daily') {
    leaderboardAbout.textContent = 'Daily view highlights each game\'s strongest runs from the current day.';
  } else if (uiState.activeLeaderboardRange === 'all-time') {
    leaderboardAbout.textContent = 'All-time view keeps persistent records for long-term competition.';
  } else if (uiState.activeLeaderboardRange === 'most-xp') {
    leaderboardAbout.textContent = 'Most XP is staged for the progression system and will rank total experience with levels shown beside each name.';
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

function refreshGameViews() {
  hydrateLeaderboardGames();
  applyPersistedAdminOverrides();
  renderGames();
  const filteredGames = getFilteredGames();
  const eligibleGames = games.filter((game) => game.leaderboardEligible && Array.isArray(game.leaderboardTop100) && game.leaderboardTop100.length > 0);

  if (uiState.activeLeaderboardRange === 'most-xp') {
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
}

function init() {
  hydrateLeaderboardGames();
  applyPersistedAdminOverrides();

  if (firebaseAuth) {
    firebaseAuth.onAuthStateChanged((user) => {
      authState.currentUser = user || null;

      if (!hasHandledInitialAuthState) {
        hasHandledInitialAuthState = true;
        if (!user) {
          setAuthMode('signup');
          openAuthOverlay('');
        }
      }

      if (user) {
        persistCurrentProfile();
        void syncCurrentAccountRolesToFirestore();
      }
      syncLegacyAuthState();
      exposePlayrAuth();
      renderAuthUi();
      renderSettingsProgression(getCurrentAccount());
      refreshGameViews();
      updateLeaderboardAbout();
    });
  }

  syncLegacyAuthState();
  exposePlayrAuth();
  renderStats();
  renderPublishingPreview();
  renderAuthUi();
  renderSettingsProgression(getCurrentAccount());
  renderNotificationsDropdown();
  syncSiteNoticeBell();
  syncControlStates();
  syncFeaturedGameToActiveTab();
  refreshGameViews();
  updateLeaderboardAbout();
  setLeaderboardPanelVisible(uiState.activeLibraryTab === 'leaderboard');
  setSupportPanelVisible(uiState.activeLibraryTab === 'leaderboard');
  if (hasMineUi) {
    resetMineGame('easy');
  }

  if (libraryTabs) {
    libraryTabs.addEventListener('click', (event) => {
      const button = event.target.closest('[data-library-tab]');
      if (!button) return;
      const tabId = button.dataset.libraryTab;
      uiState.activeLibraryTab = tabId;
      syncControlStates();
      syncFeaturedGameToActiveTab();
      setLeaderboardPanelVisible(uiState.activeLibraryTab === 'leaderboard');
      setSupportPanelVisible(uiState.activeLibraryTab === 'leaderboard');
      refreshGameViews();
      if (window.scrollY > 0) {
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
      syncControlStates();
      refreshGameViews();
    });
  }

  if (gameSearch) {
    gameSearch.addEventListener('input', () => {
      uiState.librarySearchQuery = gameSearch.value;
      refreshGameViews();
    });
  }

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
      hydrateLeaderboardGames();
      applyPersistedAdminOverrides();
      refreshGameViews();
      renderSettingsProgression(getCurrentAccount());
    }
    if (event.key === SITE_NOTICE_STORAGE_KEY) {
      renderNotificationsDropdown();
      syncSiteNoticeBell();
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

  window.addEventListener('playr-progression-changed', () => {
    if (!settingsOverlay?.hidden) {
      renderSettingsProgression(getCurrentAccount());
    }
    if (uiState.activeLeaderboardRange === 'most-xp') {
      renderLeaderboard();
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
}

init();
