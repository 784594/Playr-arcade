(function () {
  const ADSENSE_SCRIPT_ID = 'playr-adsense-loader';
  const ADSENSE_SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5070133200721707';
  const PLAYR_FAVICON_PATH = '/images/background-removed-background-removed.png';
  const PROFILE_STORAGE_KEY = 'playrProfiles';
  const LEGACY_USER_STORAGE_KEY = 'playrCurrentUser';
  const PENDING_REFERRAL_STORAGE_KEY = 'playrPendingReferralCode';
  const TRUSTED_VIP_IDENTIFIERS = new Set(['owner@playr.io']);
  const LEVEL_BADGE_GROUP_SIZE = 10;
  const ACTIVE_TICK_MS = 5000;
  const ACTIVE_WINDOW_MS = 10000;
  const SESSION_IDLE_TIMEOUT_MS = 30000;
  const BASE_XP_PER_MINUTE = 60;
  const SESSION_MIN_DURATION_MS = 3 * 60 * 1000;
  const SESSION_STEADY_DURATION_MS = 10 * 60 * 1000;
  const SESSION_BONUS_DURATION_MS = 20 * 60 * 1000;
  const ANTI_AFK_STAGE_WINDOW_MS = 5 * 60 * 1000;
  const ANTI_AFK_EVENT_WINDOW_MS = 5 * 60 * 1000;
  const WARNING_COOLDOWN_MS = 60 * 60 * 1000;
  const POINTER_MOVE_SAMPLE_MS = 250;
  const MAX_ACTIVITY_EVENTS = 240;
  const MAILBOX_STORAGE_KEY = 'playrMailboxV1';
  const XP_PAUSED_MESSAGE = 'Unusual activity detected — XP paused.';
  const LEADERBOARD_BONUS_RANKS = [
    { min: 1, max: 10, multiplier: 1.25 },
    { min: 11, max: 25, multiplier: 1.2 },
    { min: 26, max: 50, multiplier: 1.15 },
    { min: 51, max: 100, multiplier: 1.1 },
  ];
  const AFK_REASON_MESSAGES = {
    constant: 'Constant input pattern detected',
    stillMouse: 'No mouse movement over extended period',
    repetitive: 'Repetitive interaction behavior',
    lowDiversity: 'Low interaction diversity over time',
  };
  const REFERRAL_TIERS = [
    { count: 1, xp: 50, badgeId: 'referral-1', label: 'Recruiter I', flair: '', title: '' },
    { count: 3, xp: 150, badgeId: '', label: '', flair: 'Recruiter Flair', title: '' },
    { count: 5, xp: 300, badgeId: 'referral-5', label: 'Animated Recruiter', flair: '', title: '' },
    { count: 10, xp: 600, badgeId: '', label: '', flair: '', title: 'Referral Legend' },
    { count: 25, xp: 1500, badgeId: 'referral-25', label: 'Exclusive Cosmetic', flair: '', title: '' },
  ];
  const BADGE_ASSET_PATHS = {
    vip: '',
    levelGroups: {
      novice: '',
      challenger: '',
      elite: '',
      mythic: '',
    },
    referral: {
      'referral-1': '',
      'referral-3': '',
      'referral-5': '',
      'referral-10': '',
      'referral-25': '',
    },
  };

  const activityState = {
    lastInputAt: 0,
    lastPointerMoveAt: 0,
    lastPointerMoveSampleAt: 0,
    tickHandle: null,
    eventLog: [],
    session: null,
    leaderboardRank: null,
  };

  function normalizeIdentifier(value) {
    return String(value || '').trim().toLowerCase();
  }

  function normalizeRole(role) {
    return String(role || '').trim().toLowerCase();
  }

  function normalizeName(value) {
    return String(value || '').trim();
  }

  function ensurePlayrFavicon() {
    if (typeof document === 'undefined' || !document.head) return;
    const rels = ['icon', 'shortcut icon', 'apple-touch-icon'];
    rels.forEach((relValue) => {
      let link = document.head.querySelector(`link[rel="${relValue}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', relValue);
        document.head.appendChild(link);
      }
      link.setAttribute('href', PLAYR_FAVICON_PATH);
      link.setAttribute('type', 'image/png');
    });
  }

  ensurePlayrFavicon();

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function slugify(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 24);
  }

  function readJsonStorage(key) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function writeJsonStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function buildRoles(record) {
    const roles = new Set(
      Array.isArray(record?.roles)
        ? record.roles.map(normalizeRole).filter(Boolean)
        : [],
    );

    if (record?.isVip) {
      roles.add('vip');
    }

    if (record?.identifierType === 'email' && TRUSTED_VIP_IDENTIFIERS.has(normalizeIdentifier(record.identifier))) {
      roles.add('vip');
    }

    return Array.from(roles);
  }

  function getCurrentRecord() {
    if (window.PlayrAuth && typeof window.PlayrAuth.getCurrentUser === 'function') {
      const liveUser = window.PlayrAuth.getCurrentUser();
      if (liveUser) {
        return liveUser;
      }
    }

    const legacyUser = readJsonStorage(LEGACY_USER_STORAGE_KEY);
    if (legacyUser) {
      return legacyUser;
    }

    return null;
  }

  function readProfiles() {
    const profiles = readJsonStorage(PROFILE_STORAGE_KEY);
    return profiles && typeof profiles === 'object' ? profiles : {};
  }

  function writeProfiles(profiles) {
    writeJsonStorage(PROFILE_STORAGE_KEY, profiles || {});
  }

  function getCurrentDateKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function isGameplayPage() {
    const path = String(window.location.pathname || '');
    return path.includes('/games/single-player/') || path.includes('/games/two-player/');
  }

  function isMultiplayerPage() {
    return String(window.location.pathname || '').includes('/games/two-player/');
  }

  function getXpRequiredForLevel(level) {
    const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
    if (safeLevel >= 100) return 15000;
    if (safeLevel === 50) return 8200;
    if (safeLevel >= 51) return 8300 + ((safeLevel - 51) * 100);
    if (safeLevel === 25) return 2700;
    if (safeLevel >= 26) return 2920 + ((safeLevel - 26) * 220);
    if (safeLevel === 10) return 900;
    if (safeLevel >= 11) return 1020 + ((safeLevel - 11) * 120);
    if (safeLevel >= 6) return 420 + ((safeLevel - 6) * 120);
    return 80 + ((safeLevel - 1) * 40);
  }

  function getLevelThresholds(targetLevel = 100) {
    const cappedTarget = Math.max(1, Math.floor(Number(targetLevel) || 1));
    const thresholds = [0];

    while (thresholds.length < cappedTarget) {
      const sourceLevel = thresholds.length;
      thresholds.push(thresholds[thresholds.length - 1] + getXpRequiredForLevel(sourceLevel));
    }

    return thresholds;
  }

  function getLevelInfoFromXp(xpValue) {
    const xp = Math.max(0, Number(xpValue) || 0);
    const thresholds = getLevelThresholds(100);
    let level = 1;

    for (let index = thresholds.length - 1; index >= 0; index -= 1) {
      if (xp >= thresholds[index]) {
        level = index + 1;
        break;
      }
    }

    const currentThreshold = thresholds[level - 1] || 0;
    const nextThreshold = thresholds[level] || (currentThreshold + Math.max(100, Math.round((currentThreshold || 100) * 0.2)));
    const progress = Math.max(0, Math.min(1, (xp - currentThreshold) / Math.max(1, nextThreshold - currentThreshold)));

    return {
      xp,
      level,
      currentThreshold,
      nextThreshold,
      progress,
      xpIntoLevel: xp - currentThreshold,
      xpToNextLevel: Math.max(0, nextThreshold - xp),
      badgeGroup: Math.floor((level - 1) / LEVEL_BADGE_GROUP_SIZE),
    };
  }

  function createReferralCode(record, profile) {
    const base = slugify(profile?.displayName || record?.displayName || record?.identifier || 'playr');
    const suffixSource = String(profile?.uid || record?.uid || record?.identifier || Date.now()).replace(/[^a-zA-Z0-9]/g, '');
    const suffix = suffixSource.slice(-6).toLowerCase() || 'playr';
    return `${base || 'playr'}-${suffix}`;
  }

  function ensureProfileShape(profile, record = null) {
    const roles = buildRoles({
      ...profile,
      ...record,
    });
    const merged = {
      ...(profile && typeof profile === 'object' ? profile : {}),
    };
    const progression = merged.progression && typeof merged.progression === 'object' ? merged.progression : {};
    const referral = progression.referral && typeof progression.referral === 'object' ? progression.referral : {};
    const cosmetics = progression.cosmetics && typeof progression.cosmetics === 'object' ? progression.cosmetics : {};
    const badges = Array.isArray(cosmetics.badges) ? cosmetics.badges : [];
    const revokedBadges = Array.isArray(cosmetics.revokedBadges) ? cosmetics.revokedBadges : [];
    const daily = progression.daily && typeof progression.daily === 'object' ? progression.daily : {};
    const activeSecondsByDay = daily.activeSecondsByDay && typeof daily.activeSecondsByDay === 'object' ? daily.activeSecondsByDay : {};
    const multiplayerSecondsByDay = daily.multiplayerSecondsByDay && typeof daily.multiplayerSecondsByDay === 'object' ? daily.multiplayerSecondsByDay : {};
    const roomXpByDay = daily.roomXpByDay && typeof daily.roomXpByDay === 'object' ? daily.roomXpByDay : {};
    const referralsRewarded = Array.isArray(referral.rewardedTiers) ? referral.rewardedTiers : [];
    const distinctDaysPlayed = Array.isArray(progression.distinctDaysPlayed) ? progression.distinctDaysPlayed : [];
    const afk = progression.afk && typeof progression.afk === 'object' ? progression.afk : {};
    const xp = Math.max(0, Number(progression.xp) || 0);
    const levelInfo = getLevelInfoFromXp(xp);

    merged.roles = roles;
    merged.isVip = roles.includes('vip');
    merged.progression = {
      xp,
      totalActiveSeconds: Math.max(0, Number(progression.totalActiveSeconds) || 0),
      totalMultiplayerSeconds: Math.max(0, Number(progression.totalMultiplayerSeconds) || 0),
      distinctDaysPlayed,
      pendingXpFraction: Number(progression.pendingXpFraction) || 0,
      lastLevelNotified: Math.max(1, Number(progression.lastLevelNotified) || levelInfo.level),
      daily: {
        activeSecondsByDay,
        multiplayerSecondsByDay,
        roomXpByDay,
      },
      afk: {
        warningCooldownUntil: Math.max(0, Number(afk.warningCooldownUntil) || 0),
        leaderboardRestricted: Boolean(afk.leaderboardRestricted),
        leaderboardRestrictionReason: String(afk.leaderboardRestrictionReason || ''),
        leaderboardRestrictionAt: Math.max(0, Number(afk.leaderboardRestrictionAt) || 0),
        lastReason: String(afk.lastReason || ''),
        lastStageReached: Math.max(0, Number(afk.lastStageReached) || 0),
        lastFlaggedGame: String(afk.lastFlaggedGame || ''),
      },
      referral: {
        code: String(referral.code || createReferralCode(record, merged)),
        referredBy: referral.referredBy ? String(referral.referredBy) : '',
        qualifiedCount: Math.max(0, Number(referral.qualifiedCount) || 0),
        rewardedTiers: referralsRewarded,
        qualifiedAt: referral.qualifiedAt || null,
        hasQualifiedSelf: Boolean(referral.hasQualifiedSelf),
      },
      cosmetics: {
        badges,
        revokedBadges,
        title: String(cosmetics.title || ''),
        flair: String(cosmetics.flair || ''),
      },
      badgeAssets: {
        vip: String(progression?.badgeAssets?.vip || BADGE_ASSET_PATHS.vip),
        levelGroups: {
          novice: String(progression?.badgeAssets?.levelGroups?.novice || BADGE_ASSET_PATHS.levelGroups.novice),
          challenger: String(progression?.badgeAssets?.levelGroups?.challenger || BADGE_ASSET_PATHS.levelGroups.challenger),
          elite: String(progression?.badgeAssets?.levelGroups?.elite || BADGE_ASSET_PATHS.levelGroups.elite),
          mythic: String(progression?.badgeAssets?.levelGroups?.mythic || BADGE_ASSET_PATHS.levelGroups.mythic),
        },
        referral: {
          'referral-1': String(progression?.badgeAssets?.referral?.['referral-1'] || BADGE_ASSET_PATHS.referral['referral-1']),
          'referral-3': String(progression?.badgeAssets?.referral?.['referral-3'] || BADGE_ASSET_PATHS.referral['referral-3']),
          'referral-5': String(progression?.badgeAssets?.referral?.['referral-5'] || BADGE_ASSET_PATHS.referral['referral-5']),
          'referral-10': String(progression?.badgeAssets?.referral?.['referral-10'] || BADGE_ASSET_PATHS.referral['referral-10']),
          'referral-25': String(progression?.badgeAssets?.referral?.['referral-25'] || BADGE_ASSET_PATHS.referral['referral-25']),
        },
      },
      level: levelInfo.level,
    };

    return merged;
  }

  function resolveProfileKey(record, profiles = readProfiles()) {
    if (!record) return null;

    if (record.uid && profiles[record.uid]) {
      return record.uid;
    }

    const normalizedIdentifier = normalizeIdentifier(record.identifier);
    const normalizedName = normalizeIdentifier(record.displayName);
    const foundEntry = Object.entries(profiles).find(([, profile]) => {
      if (!profile || typeof profile !== 'object') return false;
      if (record.uid && profile.uid === record.uid) return true;
      if (normalizedIdentifier && normalizeIdentifier(profile.identifier) === normalizedIdentifier) return true;
      if (normalizedName && normalizeIdentifier(profile.displayName) === normalizedName) return true;
      return false;
    });

    if (foundEntry) {
      return foundEntry[0];
    }

    if (record.uid) return record.uid;
    if (normalizedIdentifier) return normalizedIdentifier;
    if (normalizedName) return `name:${normalizedName}`;
    return null;
  }

  function getOrCreateProfile(record) {
    if (!record) return null;
    const profiles = readProfiles();
    const profileKey = resolveProfileKey(record, profiles);
    if (!profileKey) return null;

    const existing = ensureProfileShape(profiles[profileKey], record);
    const nextProfile = {
      ...existing,
      uid: record.uid || existing.uid || '',
      displayName: normalizeName(record.displayName || existing.displayName || 'Player'),
      identifier: record.identifier || existing.identifier || '',
      identifierType: record.identifierType || existing.identifierType || 'uid',
      verified: record.verified || existing.verified || false,
      roles: buildRoles({
        ...existing,
        ...record,
      }),
      isVip: buildRoles({
        ...existing,
        ...record,
      }).includes('vip'),
      updatedAt: Date.now(),
      createdAt: existing.createdAt || Date.now(),
    };

    profiles[profileKey] = nextProfile;
    writeProfiles(profiles);
    return { key: profileKey, profile: nextProfile, profiles };
  }

  function saveProfile(profileKey, profile, existingProfiles = null) {
    const profiles = existingProfiles || readProfiles();
    profiles[profileKey] = ensureProfileShape(profile, profile);
    writeProfiles(profiles);
    return profiles[profileKey];
  }

  function getProfileForRecord(record) {
    const created = getOrCreateProfile(record);
    return created ? created.profile : null;
  }

  function getReferralLink(profile) {
    const code = profile?.progression?.referral?.code || '';
    if (!code) return '';
    return `${window.location.origin}/?ref=${encodeURIComponent(code)}`;
  }

  function injectSharedStyles() {
    if (document.getElementById('playr-progression-style')) return;
    const style = document.createElement('style');
    style.id = 'playr-progression-style';
    style.textContent = `
      .playr-identity {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .playr-identity.compact {
        gap: 6px;
      }
      .playr-identity-text {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-weight: 700;
      }
      .playr-badge-stack {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        flex-wrap: wrap;
      }
      .playr-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        min-height: 22px;
        padding: 0 8px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.06);
        color: inherit;
        font-size: 0.72rem;
        line-height: 1;
        white-space: nowrap;
      }
      .playr-badge.level {
        border-color: rgba(124, 240, 197, 0.35);
        background: rgba(124, 240, 197, 0.14);
      }
      .playr-badge.vip {
        border-color: rgba(255, 210, 84, 0.42);
        background: rgba(255, 210, 84, 0.18);
        color: #ffe8a8;
      }
      .playr-badge.referral {
        border-color: rgba(122, 167, 255, 0.4);
        background: rgba(122, 167, 255, 0.14);
      }
      .playr-badge.cosmetic {
        border-color: rgba(255, 170, 210, 0.38);
        background: rgba(255, 170, 210, 0.14);
      }
      .playr-badge img {
        width: 14px;
        height: 14px;
        object-fit: contain;
        border-radius: 3px;
      }
      .playr-levelup-overlay {
        position: fixed;
        inset: 0;
        z-index: 5000;
        pointer-events: none;
        display: grid;
        place-items: center;
      }
      .playr-levelup-card {
        min-width: min(420px, calc(100vw - 28px));
        max-width: calc(100vw - 28px);
        padding: 20px 24px;
        border-radius: 24px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        background:
          radial-gradient(circle at top left, rgba(255, 210, 84, 0.32), transparent 36%),
          radial-gradient(circle at bottom right, rgba(122, 167, 255, 0.24), transparent 36%),
          rgba(6, 10, 21, 0.94);
        color: #f7fbff;
        box-shadow: 0 30px 80px rgba(0, 0, 0, 0.38);
        opacity: 0;
        transform: translateY(20px) scale(0.94);
        transition: opacity 220ms ease, transform 220ms ease;
      }
      .playr-levelup-overlay.visible .playr-levelup-card {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      .playr-levelup-label {
        margin: 0 0 8px;
        color: #a7c6ff;
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.16em;
      }
      .playr-levelup-card strong {
        display: block;
        font-size: clamp(1.8rem, 5vw, 2.8rem);
        line-height: 1.05;
        margin-bottom: 8px;
      }
      .playr-levelup-card p {
        margin: 0;
        color: #dce8ff;
        line-height: 1.6;
      }
      .playr-afk-warning-overlay {
        position: fixed;
        inset: 0;
        z-index: 5001;
        display: grid;
        place-items: center;
        padding: 20px;
        background: rgba(4, 9, 18, 0.76);
        backdrop-filter: blur(6px);
      }
      .playr-afk-warning-overlay[hidden] {
        display: none !important;
      }
      .playr-afk-warning-card {
        width: min(520px, 100%);
        padding: 24px;
        border-radius: 24px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background:
          radial-gradient(circle at top left, rgba(255, 114, 138, 0.18), transparent 34%),
          radial-gradient(circle at bottom right, rgba(122, 167, 255, 0.18), transparent 34%),
          rgba(9, 15, 29, 0.96);
        color: #f5f9ff;
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.42);
      }
      .playr-afk-warning-label {
        margin: 0 0 8px;
        color: #ffb6c2;
        font-size: 0.76rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }
      .playr-afk-warning-card h3 {
        margin: 0 0 10px;
        font-size: 1.5rem;
      }
      .playr-afk-warning-card p {
        margin: 0;
        color: #d7e4ff;
        line-height: 1.65;
      }
      .playr-afk-warning-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 18px;
      }
      .playr-afk-warning-btn {
        min-height: 44px;
        padding: 0 18px;
        border-radius: 999px;
        border: 1px solid rgba(124, 240, 197, 0.28);
        background: linear-gradient(135deg, rgba(124, 240, 197, 0.94), rgba(216, 255, 132, 0.92));
        color: #06101b;
        font: inherit;
        font-weight: 800;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureLevelUpOverlay() {
    injectSharedStyles();
    let overlay = document.getElementById('playr-levelup-overlay');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'playr-levelup-overlay';
    overlay.className = 'playr-levelup-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="playr-levelup-card">
        <p class="playr-levelup-label">Level up</p>
        <strong id="playrLevelUpTitle">Level 2 reached</strong>
        <p id="playrLevelUpBody">Keep playing to unlock more badges, borders, and flair.</p>
      </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  function showLevelUpOverlay(level, gainedXp) {
    if (!document.body) return;
    const overlay = ensureLevelUpOverlay();
    const title = overlay.querySelector('#playrLevelUpTitle');
    const body = overlay.querySelector('#playrLevelUpBody');
    if (title) title.textContent = `Level ${level} reached`;
    if (body) body.textContent = `You just earned ${Math.round(gainedXp)} XP. Cosmetic badges and flair are getting sharper now.`;
    overlay.hidden = false;
    requestAnimationFrame(() => {
      overlay.classList.add('visible');
    });
    window.clearTimeout(overlay._hideTimer);
    overlay._hideTimer = window.setTimeout(() => {
      overlay.classList.remove('visible');
      window.setTimeout(() => {
        overlay.hidden = true;
      }, 220);
    }, 2800);
  }

  function ensureAfkWarningOverlay() {
    injectSharedStyles();
    let overlay = document.getElementById('playr-afk-warning-overlay');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'playr-afk-warning-overlay';
    overlay.className = 'playr-afk-warning-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="playr-afk-warning-card" role="dialog" aria-modal="true" aria-labelledby="playrAfkWarningTitle">
        <p class="playr-afk-warning-label">XP Warning</p>
        <h3 id="playrAfkWarningTitle">Unusual activity detected</h3>
        <p id="playrAfkWarningBody">${escapeHtml(XP_PAUSED_MESSAGE)}</p>
        <div class="playr-afk-warning-actions">
          <button class="playr-afk-warning-btn" id="playrAfkWarningOkBtn" type="button">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  function readMailbox() {
    const stored = readJsonStorage(MAILBOX_STORAGE_KEY);
    return stored && typeof stored === 'object' ? stored : {};
  }

  function writeMailbox(mailbox) {
    writeJsonStorage(MAILBOX_STORAGE_KEY, mailbox || {});
  }

  function getMailboxKeyForRecord(record) {
    if (record?.uid) return `user:${record.uid}`;
    if (record?.identifier) return `identifier:${normalizeIdentifier(record.identifier)}`;
    return 'guest';
  }

  function appendMailboxMessage(recipientKey, message) {
    const safeKey = String(recipientKey || '').trim();
    if (!safeKey) return;
    const mailbox = readMailbox();
    const current = Array.isArray(mailbox[safeKey]) ? mailbox[safeKey] : [];
    current.unshift({
      ...message,
      id: String(message?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
      createdAt: Number(message?.createdAt) || Date.now(),
    });
    mailbox[safeKey] = current.slice(0, 50);
    writeMailbox(mailbox);
  }

  function getCurrentGameName() {
    const root = document.getElementById('gameRoot');
    const dataTitle = String(root?.dataset?.gameTitle || '').trim();
    if (dataTitle) return dataTitle;
    return String(document.title || 'PlayR Game').replace(/\s*\|\s*PlayR\s*$/i, '').trim() || 'PlayR Game';
  }

  function getSessionMultiplier(durationMs) {
    const safeDuration = Math.max(0, Number(durationMs) || 0);
    if (safeDuration < SESSION_MIN_DURATION_MS) return 0;
    if (safeDuration < SESSION_STEADY_DURATION_MS) return 0.8;
    if (safeDuration < SESSION_BONUS_DURATION_MS) return 1;
    return 1.1;
  }

  function getLeaderboardMultiplier(rank) {
    const safeRank = Math.floor(Number(rank) || 0);
    if (!safeRank) return 1;
    const match = LEADERBOARD_BONUS_RANKS.find((entry) => safeRank >= entry.min && safeRank <= entry.max);
    return match ? match.multiplier : 1;
  }

  function trimActivityLog(now = Date.now()) {
    const cutoff = now - ANTI_AFK_EVENT_WINDOW_MS;
    activityState.eventLog = activityState.eventLog.filter((entry) => entry && entry.time >= cutoff).slice(-MAX_ACTIVITY_EVENTS);
  }

  function trackActivityEvent(type, event = null) {
    const now = Date.now();
    const safeType = String(type || '').trim();
    if (!safeType) return;
    if (safeType === 'pointermove' && now - activityState.lastPointerMoveSampleAt < POINTER_MOVE_SAMPLE_MS) {
      return;
    }

    if (safeType === 'pointermove') {
      activityState.lastPointerMoveSampleAt = now;
      activityState.lastPointerMoveAt = now;
    }

    activityState.eventLog.push({
      type: safeType,
      time: now,
      x: Number(event?.clientX),
      y: Number(event?.clientY),
    });
    trimActivityLog(now);
  }

  function getActivityAssessment(now = Date.now()) {
    trimActivityLog(now);
    const recentEvents = activityState.eventLog.filter((entry) => entry.time >= now - ANTI_AFK_EVENT_WINDOW_MS);
    const nonMoveEvents = recentEvents.filter((entry) => entry.type !== 'pointermove');
    const moveEvents = recentEvents.filter((entry) => entry.type === 'pointermove');
    const clickishEvents = recentEvents.filter((entry) => ['click', 'pointerdown', 'keydown', 'touchstart'].includes(entry.type));
    const uniqueTypes = new Set(recentEvents.map((entry) => entry.type));
    const positionKeys = new Set(
      recentEvents
        .filter((entry) => Number.isFinite(entry.x) && Number.isFinite(entry.y))
        .map((entry) => `${Math.round(entry.x / 24)}:${Math.round(entry.y / 24)}`),
    );

    if (recentEvents.length < 20) {
      return { suspicious: false, reason: '', reasonCode: '', recentEvents };
    }

    const clickIntervals = [];
    for (let index = 1; index < clickishEvents.length; index += 1) {
      clickIntervals.push(clickishEvents[index].time - clickishEvents[index - 1].time);
    }

    if (clickIntervals.length >= 12) {
      const average = clickIntervals.reduce((sum, value) => sum + value, 0) / clickIntervals.length;
      const variance = clickIntervals.reduce((sum, value) => sum + ((value - average) ** 2), 0) / clickIntervals.length;
      const deviation = Math.sqrt(variance);
      if (average <= 2500 && deviation <= 45) {
        return { suspicious: true, reason: AFK_REASON_MESSAGES.constant, reasonCode: 'constant', recentEvents };
      }
    }

    if (moveEvents.length === 0 && nonMoveEvents.length >= 24 && (now - activityState.lastPointerMoveAt) >= ANTI_AFK_EVENT_WINDOW_MS) {
      return { suspicious: true, reason: AFK_REASON_MESSAGES.stillMouse, reasonCode: 'stillMouse', recentEvents };
    }

    if (uniqueTypes.size <= 2 && nonMoveEvents.length >= 36 && positionKeys.size <= 3) {
      return { suspicious: true, reason: AFK_REASON_MESSAGES.repetitive, reasonCode: 'repetitive', recentEvents };
    }

    if (recentEvents.length >= 48 && (uniqueTypes.size <= 2 || positionKeys.size <= 2)) {
      return { suspicious: true, reason: AFK_REASON_MESSAGES.lowDiversity, reasonCode: 'lowDiversity', recentEvents };
    }

    return { suspicious: false, reason: '', reasonCode: '', recentEvents };
  }

  function getCurrentSessionDuration(now = Date.now()) {
    if (!activityState.session?.startedAt) return 0;
    return Math.max(0, now - activityState.session.startedAt);
  }

  function startSession(record, now = Date.now()) {
    activityState.session = {
      startedAt: now,
      lastActiveAt: now,
      hasInteraction: false,
      earnedBaseXp: 0,
      awardedXp: 0,
      warningShown: false,
      stage3Handled: false,
      stage4Handled: false,
      suspiciousSince: 0,
      currentStage: 0,
      currentReason: '',
      gameName: getCurrentGameName(),
      leaderboardRank: Number(activityState.leaderboardRank) || 0,
    };
  }

  function getCurrentSession(record, now = Date.now()) {
    if (!activityState.session) {
      startSession(record, now);
    }
    return activityState.session;
  }

  function getAfkStage(session, assessment, now = Date.now()) {
    if (!session || !assessment?.suspicious) {
      if (session) {
        session.suspiciousSince = 0;
        session.currentReason = '';
        session.currentStage = 0;
      }
      return { stage: 0, reason: '', reasonCode: '' };
    }

    if (!session.suspiciousSince) {
      session.suspiciousSince = now;
    }
    session.currentReason = assessment.reason;

    const suspiciousDuration = now - session.suspiciousSince;
    let stage = 0;
    if (suspiciousDuration >= (ANTI_AFK_STAGE_WINDOW_MS * 4)) {
      stage = 4;
    } else if (suspiciousDuration >= (ANTI_AFK_STAGE_WINDOW_MS * 3)) {
      stage = 3;
    } else if (suspiciousDuration >= (ANTI_AFK_STAGE_WINDOW_MS * 2)) {
      stage = 2;
    } else if (suspiciousDuration >= ANTI_AFK_STAGE_WINDOW_MS) {
      stage = 1;
    }

    session.currentStage = stage;
    return {
      stage,
      reason: assessment.reason,
      reasonCode: assessment.reasonCode,
    };
  }

  function getActivityMultiplier(stage) {
    if (stage >= 3) return 0;
    if (stage === 2) return 0.5;
    if (stage === 1) return 0.75;
    return 1;
  }

  function saveProfileAndEmit(record, key, profiles, profile) {
    profiles[key] = profile;
    writeProfiles(profiles);
    emitProgressionChange(record, profile);
  }

  function reportAfkWarning(record, profile, reason, gameName) {
    const username = normalizeName(record?.displayName || profile?.displayName || 'Player');
    const safeGameName = String(gameName || getCurrentGameName() || 'PlayR Game');
    const safeReason = String(reason || AFK_REASON_MESSAGES.lowDiversity);

    appendMailboxMessage(getMailboxKeyForRecord(record), {
      subject: XP_PAUSED_MESSAGE,
      body: XP_PAUSED_MESSAGE,
      type: 'system-warning',
      reason: safeReason,
      gameName: safeGameName,
    });

    appendMailboxMessage('owner@playr.io', {
      subject: 'AFK progression flag',
      body: `Flagged user: ${username}\nGame flagged: ${safeGameName}\nReason: ${safeReason}`,
      type: 'moderation-copy',
      reason: safeReason,
      gameName: safeGameName,
      flaggedUser: username,
    });
  }

  function showAfkWarningModal(record, reason, onAcknowledge) {
    const overlay = ensureAfkWarningOverlay();
    const body = overlay.querySelector('#playrAfkWarningBody');
    const button = overlay.querySelector('#playrAfkWarningOkBtn');
    if (body) {
      body.textContent = `${XP_PAUSED_MESSAGE} ${String(reason || AFK_REASON_MESSAGES.lowDiversity)}.`;
    }
    overlay.hidden = false;

    const close = () => {
      overlay.hidden = true;
      button?.removeEventListener('click', handleClick);
      if (typeof onAcknowledge === 'function') {
        onAcknowledge();
      }
    };

    const handleClick = () => close();
    button?.addEventListener('click', handleClick, { once: true });
  }

  function maybeHandleAfkEnforcement(record, key, profiles, profile, session, stageInfo, now = Date.now()) {
    if (!record || !profile || !session) return;

    if (stageInfo.stage >= 3 && !session.stage3Handled) {
      session.stage3Handled = true;
      profile.progression.afk.lastReason = stageInfo.reason;
      profile.progression.afk.lastStageReached = Math.max(profile.progression.afk.lastStageReached || 0, 3);
      profile.progression.afk.lastFlaggedGame = session.gameName;
      reportAfkWarning(record, profile, stageInfo.reason, session.gameName);

      const cooldownUntil = Number(profile.progression.afk.warningCooldownUntil) || 0;
      if (!session.warningShown && now >= cooldownUntil) {
        session.warningShown = true;
        showAfkWarningModal(record, stageInfo.reason, () => {
          const latest = getOrCreateProfile(record);
          if (!latest) return;
          const liveProfile = ensureProfileShape(latest.profiles[latest.key], record);
          liveProfile.progression.afk.warningCooldownUntil = Date.now() + WARNING_COOLDOWN_MS;
          liveProfile.updatedAt = Date.now();
          saveProfileAndEmit(record, latest.key, latest.profiles, liveProfile);
        });
      }
      profile.updatedAt = now;
      saveProfileAndEmit(record, key, profiles, profile);
    }

    if (stageInfo.stage >= 4 && !session.stage4Handled) {
      session.stage4Handled = true;
      profile.progression.afk.leaderboardRestricted = true;
      profile.progression.afk.leaderboardRestrictionReason = stageInfo.reason || AFK_REASON_MESSAGES.lowDiversity;
      profile.progression.afk.leaderboardRestrictionAt = now;
      profile.progression.afk.lastStageReached = 4;
      profile.updatedAt = now;
      saveProfileAndEmit(record, key, profiles, profile);
    }
  }

  function finalizeSession(record, reason = 'ended', now = Date.now()) {
    if (!record || !activityState.session) return null;
    const session = activityState.session;
    const durationMs = Math.max(0, now - session.startedAt);
    const sessionMultiplier = getSessionMultiplier(durationMs);
    const leaderboardMultiplier = getLeaderboardMultiplier(session.leaderboardRank);
    const finalAwardedXp = Math.floor(session.earnedBaseXp * sessionMultiplier * leaderboardMultiplier);
    const delta = Math.max(0, finalAwardedXp - session.awardedXp);

    if (delta > 0) {
      awardXp(record, delta, `session-${reason}`, { notifyLevelUp: true });
    }

    activityState.session = null;
    activityState.eventLog = [];
    activityState.lastPointerMoveAt = 0;
    activityState.lastPointerMoveSampleAt = 0;
    return {
      durationMs,
      finalAwardedXp,
      reason,
    };
  }

  function getLevelBadgeTheme(levelInfo) {
    if (levelInfo.level >= 31) return { id: 'mythic', label: 'Mythic', emoji: '✦' };
    if (levelInfo.level >= 21) return { id: 'elite', label: 'Elite', emoji: '⬢' };
    if (levelInfo.level >= 11) return { id: 'challenger', label: 'Challenger', emoji: '◆' };
    return { id: 'novice', label: 'Novice', emoji: '●' };
  }

  function getVisibleBadges(record, profile) {
    const safeProfile = ensureProfileShape(profile, record);
    const levelInfo = getLevelInfoFromXp(safeProfile.progression.xp);
    const revoked = new Set(safeProfile.progression.cosmetics.revokedBadges || []);
    const levelTheme = getLevelBadgeTheme(levelInfo);
    const badges = [
      {
        id: 'level',
        tone: 'level',
        emoji: levelTheme.emoji,
        label: `Lv. ${levelInfo.level}`,
        title: `${levelTheme.label} tier`,
        assetPath: safeProfile.progression.badgeAssets.levelGroups[levelTheme.id] || '',
      },
    ];

    if (safeProfile.isVip && !revoked.has('vip')) {
      badges.push({
        id: 'vip',
        tone: 'vip',
        emoji: '👑',
        label: 'VIP',
        title: 'VIP account',
        assetPath: safeProfile.progression.badgeAssets.vip || '',
      });
    }

    REFERRAL_TIERS.forEach((tier) => {
      if (tier.badgeId && safeProfile.progression.referral.qualifiedCount >= tier.count && !revoked.has(tier.badgeId)) {
        badges.push({
          id: tier.badgeId,
          tone: 'referral',
          emoji: '✧',
          label: tier.label,
          title: `${tier.count} qualified referral${tier.count === 1 ? '' : 's'}`,
          assetPath: safeProfile.progression.badgeAssets.referral[tier.badgeId] || '',
        });
      }
    });

    safeProfile.progression.cosmetics.badges.forEach((badge) => {
      if (!badge || !badge.id || revoked.has(badge.id)) return;
      badges.push({
        id: badge.id,
        tone: 'cosmetic',
        emoji: badge.emoji || '★',
        label: badge.label || 'Cosmetic',
        title: badge.title || badge.label || 'Cosmetic badge',
        assetPath: badge.assetPath || '',
      });
    });

    return badges;
  }

  function formatBadgeMarkup(badge) {
    const icon = badge.assetPath
      ? `<img src="${escapeHtml(badge.assetPath)}" alt="" loading="lazy" />`
      : `<span aria-hidden="true">${escapeHtml(badge.emoji || '•')}</span>`;
    return `<span class="playr-badge ${escapeHtml(badge.tone || 'cosmetic')}" title="${escapeHtml(badge.title || badge.label || '')}">${icon}<span>${escapeHtml(badge.label || '')}</span></span>`;
  }

  function formatIdentityMarkup(name, options = {}) {
    injectSharedStyles();
    const displayName = normalizeName(name || options.displayName || 'Player');
    const record = options.record || null;
    const fallbackProfile = options.profile || (record ? getProfileForRecord(record) : null);
    const badges = options.showBadges === false
      ? []
      : getVisibleBadges(record || { displayName }, fallbackProfile || { displayName });
    const compactClass = options.compact ? ' compact' : '';
    return `
      <span class="playr-identity${compactClass}">
        <span class="playr-identity-text">${escapeHtml(displayName)}</span>
        ${badges.length ? `<span class="playr-badge-stack">${badges.map((badge) => formatBadgeMarkup(badge)).join('')}</span>` : ''}
      </span>
    `;
  }

  function emitProgressionChange(record, profile) {
    const snapshot = getProgressionSnapshot(record, profile);
    window.dispatchEvent(new CustomEvent('playr-progression-changed', {
      detail: snapshot,
    }));
  }

  function getProgressionSnapshot(record = getCurrentRecord(), profile = null) {
    const liveProfile = profile || (record ? getProfileForRecord(record) : null);
    const safeProfile = liveProfile ? ensureProfileShape(liveProfile, record) : ensureProfileShape({}, record);
    const levelInfo = getLevelInfoFromXp(safeProfile.progression.xp);
    const activeToday = safeProfile.progression.daily.activeSecondsByDay[getCurrentDateKey()] || 0;
    const multiplayerToday = safeProfile.progression.daily.multiplayerSecondsByDay[getCurrentDateKey()] || 0;
    return {
      displayName: normalizeName(record?.displayName || safeProfile.displayName || 'Player'),
      uid: record?.uid || safeProfile.uid || '',
      xp: safeProfile.progression.xp,
      level: levelInfo.level,
      currentThreshold: levelInfo.currentThreshold,
      nextThreshold: levelInfo.nextThreshold,
      xpToNextLevel: levelInfo.xpToNextLevel,
      progress: levelInfo.progress,
      totalActiveMinutes: Math.floor((safeProfile.progression.totalActiveSeconds || 0) / 60),
      totalMultiplayerMinutes: Math.floor((safeProfile.progression.totalMultiplayerSeconds || 0) / 60),
      activeTodayMinutes: Math.floor(activeToday / 60),
      multiplayerTodayMinutes: Math.floor(multiplayerToday / 60),
      referralCode: safeProfile.progression.referral.code,
      referralLink: getReferralLink(safeProfile),
      qualifiedReferrals: safeProfile.progression.referral.qualifiedCount,
      title: safeProfile.progression.cosmetics.title,
      flair: safeProfile.progression.cosmetics.flair,
      leaderboardRestricted: Boolean(safeProfile.progression.afk.leaderboardRestricted),
      warningCooldownUntil: safeProfile.progression.afk.warningCooldownUntil || 0,
      badges: getVisibleBadges(record, safeProfile),
      badgeAssets: safeProfile.progression.badgeAssets,
    };
  }

  function addDistinctPlayDay(profile, dayKey) {
    const days = new Set(profile.progression.distinctDaysPlayed || []);
    if (dayKey) {
      days.add(dayKey);
    }
    profile.progression.distinctDaysPlayed = Array.from(days).sort();
  }

  function maybeApplyReferralQualification(profile) {
    if (!profile?.progression?.referral) return false;
    if (profile.progression.referral.hasQualifiedSelf) return false;

    const levelInfo = getLevelInfoFromXp(profile.progression.xp);
    const distinctDays = Array.isArray(profile.progression.distinctDaysPlayed) ? profile.progression.distinctDaysPlayed.length : 0;
    const totalMinutes = Math.floor((Number(profile.progression.totalActiveSeconds) || 0) / 60);
    const referredBy = String(profile.progression.referral.referredBy || '');

    if (!referredBy || levelInfo.level < 5 || distinctDays < 3 || totalMinutes < 30) {
      return false;
    }

    profile.progression.referral.hasQualifiedSelf = true;
    profile.progression.referral.qualifiedAt = Date.now();

    const profiles = readProfiles();
    const referrerEntry = Object.entries(profiles).find(([, candidate]) => {
      const safeCandidate = ensureProfileShape(candidate, candidate);
      return safeCandidate.progression.referral.code === referredBy;
    });

    if (referrerEntry) {
      const [referrerKey, referrerProfileRaw] = referrerEntry;
      const referrerProfile = ensureProfileShape(referrerProfileRaw, referrerProfileRaw);
      referrerProfile.progression.referral.qualifiedCount += 1;

      REFERRAL_TIERS.forEach((tier) => {
        if (referrerProfile.progression.referral.qualifiedCount >= tier.count && !referrerProfile.progression.referral.rewardedTiers.includes(tier.count)) {
          referrerProfile.progression.referral.rewardedTiers.push(tier.count);
          if (tier.badgeId && tier.label) {
            referrerProfile.progression.cosmetics.badges.push({
              id: tier.badgeId,
              label: tier.label,
              title: `${tier.count} qualified referrals`,
              emoji: '✧',
              assetPath: referrerProfile.progression.badgeAssets.referral[tier.badgeId] || '',
            });
          }
          if (tier.flair) {
            referrerProfile.progression.cosmetics.flair = tier.flair;
          }
          if (tier.title) {
            referrerProfile.progression.cosmetics.title = tier.title;
          }
          referrerProfile.progression.xp += tier.xp;
        }
      });

      profiles[referrerKey] = referrerProfile;
      writeProfiles(profiles);
      emitProgressionChange(referrerProfile, referrerProfile);
    }

    return true;
  }

  function awardXp(record, amount, reason, options = {}) {
    if (!record) return null;
    const created = getOrCreateProfile(record);
    if (!created) return null;
    const { key, profiles } = created;
    const profile = ensureProfileShape(profiles[key], record);
    const previousLevel = getLevelInfoFromXp(profile.progression.xp).level;
    const gain = Math.max(0, Number(amount) || 0);
    if (!gain) return getProgressionSnapshot(record, profile);

    profile.progression.xp += gain;
    profile.updatedAt = Date.now();
    const nextLevel = getLevelInfoFromXp(profile.progression.xp).level;
    profiles[key] = profile;
    writeProfiles(profiles);

    if (options.notifyLevelUp !== false && nextLevel > previousLevel) {
      profile.progression.lastLevelNotified = nextLevel;
      profiles[key] = profile;
      writeProfiles(profiles);
      showLevelUpOverlay(nextLevel, gain);
    }

    maybeApplyReferralQualification(profile);
    emitProgressionChange(record, profile);
    return getProgressionSnapshot(record, profile);
  }

  function addActivitySeconds(record, seconds, metadata = {}) {
    const created = getOrCreateProfile(record);
    if (!created) return null;
    const { key, profiles } = created;
    const profile = ensureProfileShape(profiles[key], record);
    const safeSeconds = Math.max(0, Number(seconds) || 0);
    const dayKey = getCurrentDateKey();
    profile.progression.totalActiveSeconds += safeSeconds;
    if (metadata.multiplayer) {
      profile.progression.totalMultiplayerSeconds += safeSeconds;
      profile.progression.daily.multiplayerSecondsByDay[dayKey] = Math.max(0, Number(profile.progression.daily.multiplayerSecondsByDay[dayKey]) || 0) + safeSeconds;
    }
    profile.progression.daily.activeSecondsByDay[dayKey] = Math.max(0, Number(profile.progression.daily.activeSecondsByDay[dayKey]) || 0) + safeSeconds;
    addDistinctPlayDay(profile, dayKey);

    profiles[key] = profile;
    writeProfiles(profiles);
    maybeApplyReferralQualification(profile);
    emitProgressionChange(record, profile);
    return getProgressionSnapshot(record, profile);
  }

  function grantRoomXp(record, amount) {
    const profile = record ? getProfileForRecord(record) : null;
    return getProgressionSnapshot(record, profile);
  }

  function captureReferralFromUrl() {
    const url = new URL(window.location.href);
    const refCode = String(url.searchParams.get('ref') || '').trim();
    if (!refCode) return;
    writeJsonStorage(PENDING_REFERRAL_STORAGE_KEY, refCode);

    const record = getCurrentRecord();
    if (!record) return;
    const created = getOrCreateProfile(record);
    if (!created) return;
    const { key, profiles } = created;
    const profile = ensureProfileShape(profiles[key], record);
    if (profile.progression.referral.code !== refCode) {
      profile.progression.referral.referredBy = refCode;
      profiles[key] = profile;
      writeProfiles(profiles);
      emitProgressionChange(record, profile);
    }
  }

  function applyPendingReferralToCurrentUser() {
    const pendingCode = String(window.localStorage.getItem(PENDING_REFERRAL_STORAGE_KEY) || '').trim();
    const record = getCurrentRecord();
    if (!pendingCode || !record) return;
    const created = getOrCreateProfile(record);
    if (!created) return;
    const { key, profiles } = created;
    const profile = ensureProfileShape(profiles[key], record);
    if (!profile.progression.referral.referredBy && profile.progression.referral.code !== pendingCode) {
      profile.progression.referral.referredBy = pendingCode;
      profiles[key] = profile;
      writeProfiles(profiles);
      emitProgressionChange(record, profile);
    }
  }

  function handleActivityTick() {
    if (!isGameplayPage()) return;
    const record = getCurrentRecord();
    if (!record) return;
    const now = Date.now();
    const session = getCurrentSession(record, now);
    const inactivityElapsed = session.hasInteraction
      ? now - activityState.lastInputAt
      : now - session.startedAt;

    if (inactivityElapsed > SESSION_IDLE_TIMEOUT_MS) {
      finalizeSession(record, 'idle', now);
      return;
    }

    if (!session.hasInteraction || (now - activityState.lastInputAt) > ACTIVE_WINDOW_MS) {
      return;
    }

    const created = getOrCreateProfile(record);
    if (!created) return;
    const { key, profiles } = created;
    const profile = ensureProfileShape(profiles[key], record);
    const assessment = getActivityAssessment(now);
    const stageInfo = getAfkStage(session, assessment, now);
    const activityMultiplier = getActivityMultiplier(stageInfo.stage);
    const minuteShare = ACTIVE_TICK_MS / 60000;
    const baseTickXp = BASE_XP_PER_MINUTE * minuteShare * activityMultiplier;

    addActivitySeconds(record, ACTIVE_TICK_MS / 1000, { multiplayer: isMultiplayerPage() });
    session.earnedBaseXp += baseTickXp;
    session.lastActiveAt = now;
    session.leaderboardRank = Number(activityState.leaderboardRank) || session.leaderboardRank || 0;

    maybeHandleAfkEnforcement(record, key, profiles, profile, session, stageInfo, now);

    const sessionMultiplier = getSessionMultiplier(getCurrentSessionDuration(now));
    const projectedXp = Math.floor(session.earnedBaseXp * sessionMultiplier);
    const delta = Math.max(0, projectedXp - session.awardedXp);
    if (delta > 0) {
      awardXp(record, delta, 'active-play', { notifyLevelUp: true });
      session.awardedXp += delta;
    }
  }

  function noteInputActivity(event = null, options = {}) {
    const now = Number(options.forceTimestamp) || Date.now();
    activityState.lastInputAt = now;
    if (options.silent) return;

    const eventType = String(options.type || event?.type || '').trim();
    if (eventType) {
      trackActivityEvent(eventType, event);
    }

    if (isGameplayPage()) {
      const record = getCurrentRecord();
      if (record && !activityState.session) {
        startSession(record, now);
      }
      if (activityState.session) {
        activityState.session.hasInteraction = true;
        activityState.session.lastActiveAt = now;
      }
    }
  }

  function startActivityTracking() {
    injectSharedStyles();
    captureReferralFromUrl();
    applyPendingReferralToCurrentUser();

    [
      'pointerdown',
      'keydown',
      'touchstart',
      'mousedown',
      'wheel',
      'click',
      'pointermove',
    ].forEach((eventName) => {
      window.addEventListener(eventName, noteInputActivity, { passive: true });
    });

    if (!activityState.tickHandle) {
      activityState.tickHandle = window.setInterval(handleActivityTick, ACTIVE_TICK_MS);
    }

    if (isGameplayPage()) {
      const record = getCurrentRecord();
      if (record) {
        startSession(record);
      }
    }
  }

  function isVipRecord(record) {
    if (!record) return false;

    const roles = buildRoles(record);
    if (roles.includes('vip')) {
      return true;
    }

    const profiles = readProfiles();
    if (record.uid && profiles[record.uid]) {
      return buildRoles(profiles[record.uid]).includes('vip');
    }

    const normalizedIdentifier = normalizeIdentifier(record.identifier);
    return Object.values(profiles).some((profile) => {
      if (!profile || typeof profile !== 'object') return false;
      if (normalizeIdentifier(profile.identifier) !== normalizedIdentifier) return false;
      return buildRoles(profile).includes('vip');
    });
  }

  function isOwnerRecord(record) {
    if (!record) return false;
    return record.identifierType === 'email' && TRUSTED_VIP_IDENTIFIERS.has(normalizeIdentifier(record.identifier));
  }

  function adjustXp(record, amount, options = {}) {
    if (!record) return null;
    const created = getOrCreateProfile(record);
    if (!created) return null;

    const { key, profiles } = created;
    const profile = ensureProfileShape(profiles[key], record);
    const delta = Math.trunc(Number(amount) || 0);
    if (!delta) {
      return getProgressionSnapshot(record, profile);
    }

    const previousLevel = getLevelInfoFromXp(profile.progression.xp).level;
    profile.progression.xp = Math.max(0, profile.progression.xp + delta);
    profile.updatedAt = Date.now();
    const nextLevel = getLevelInfoFromXp(profile.progression.xp).level;
    profiles[key] = profile;
    writeProfiles(profiles);

    if (delta > 0 && options.notifyLevelUp !== false && nextLevel > previousLevel) {
      profile.progression.lastLevelNotified = nextLevel;
      profiles[key] = profile;
      writeProfiles(profiles);
      showLevelUpOverlay(nextLevel, delta);
    }

    maybeApplyReferralQualification(profile);
    emitProgressionChange(record, profile);
    return getProgressionSnapshot(record, profile);
  }

  function ensureAdsenseScript() {
    if (document.getElementById(ADSENSE_SCRIPT_ID)) {
      return;
    }

    const script = document.createElement('script');
    script.id = ADSENSE_SCRIPT_ID;
    script.async = true;
    script.src = ADSENSE_SRC;
    script.crossOrigin = 'anonymous';
    script.dataset.playrManaged = 'true';
    document.head.appendChild(script);
  }

  function removeManagedAdsenseArtifacts() {
    document.getElementById(ADSENSE_SCRIPT_ID)?.remove();

    document.querySelectorAll('.google-auto-placed, ins.adsbygoogle').forEach((node) => {
      node.remove();
    });

    document.querySelectorAll('iframe').forEach((frame) => {
      const src = String(frame.getAttribute('src') || '');
      const id = String(frame.id || '');
      if (
        id.startsWith('aswift_')
        || src.includes('googlesyndication.com')
        || src.includes('doubleclick.net')
      ) {
        frame.remove();
      }
    });
  }

  function refreshAdsState() {
    const vip = isVipRecord(getCurrentRecord());
    document.documentElement.dataset.playrAds = vip ? 'vip' : 'enabled';

    if (vip) {
      removeManagedAdsenseArtifacts();
      return;
    }

    ensureAdsenseScript();
  }

  window.PlayrProgression = {
    getCurrentRecord,
    getCurrentProfile() {
      const record = getCurrentRecord();
      return record ? getProfileForRecord(record) : null;
    },
    getProgressionSnapshot,
    getLevelInfoFromXp,
    getReferralLink(record = getCurrentRecord()) {
      const profile = record ? getProfileForRecord(record) : null;
      return getReferralLink(profile);
    },
    formatIdentityMarkup,
    formatBadgeMarkup,
    isOwnerRecord(record = getCurrentRecord()) {
      return isOwnerRecord(record);
    },
    captureReferralFromUrl,
    applyPendingReferralToCurrentUser,
    awardXp(amount, reason, options = {}) {
      return awardXp(getCurrentRecord(), amount, reason, options);
    },
    adjustCurrentXp(amount, options = {}) {
      const record = getCurrentRecord();
      if (!isOwnerRecord(record)) return null;
      return adjustXp(record, amount, options);
    },
    setLeaderboardRank(rank) {
      const safeRank = Math.max(0, Math.floor(Number(rank) || 0));
      activityState.leaderboardRank = safeRank;
      if (activityState.session) {
        activityState.session.leaderboardRank = safeRank;
      }
      return safeRank;
    },
    getLeaderboardRank() {
      return Math.max(0, Math.floor(Number(activityState.leaderboardRank) || 0));
    },
    grantRoomCreatedXp() {
      return grantRoomXp(getCurrentRecord(), 0);
    },
    grantRoomStartedXp(playerCount = 2) {
      return grantRoomXp(getCurrentRecord(), 0);
    },
    noteInputActivity,
  };

  window.PlayrAds = {
    refresh: refreshAdsState,
    shouldShowAds() {
      return !isVipRecord(getCurrentRecord());
    },
    isVip() {
      return isVipRecord(getCurrentRecord());
    },
  };

  refreshAdsState();
  startActivityTracking();

  window.addEventListener('pagehide', () => {
    if (isGameplayPage()) {
      finalizeSession(getCurrentRecord(), 'pagehide', Date.now());
    }
  });

  window.addEventListener('playr-auth-changed', () => {
    refreshAdsState();
    applyPendingReferralToCurrentUser();
    emitProgressionChange(getCurrentRecord(), getProfileForRecord(getCurrentRecord()));
  });

  window.addEventListener('storage', (event) => {
    if (
      event.key === PROFILE_STORAGE_KEY
      || event.key === LEGACY_USER_STORAGE_KEY
      || event.key === PENDING_REFERRAL_STORAGE_KEY
    ) {
      refreshAdsState();
      applyPendingReferralToCurrentUser();
      emitProgressionChange(getCurrentRecord(), getProfileForRecord(getCurrentRecord()));
    }
  });
})();
