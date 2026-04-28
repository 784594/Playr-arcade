(function () {
  const ADSENSE_SCRIPT_ID = 'playr-adsense-loader';
  const ADSENSE_SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5070133200721707';
  const PLAYR_FAVICON_PATH = '/images/background-removed-background-removed.png';
  const PROFILE_STORAGE_KEY = 'playrProfiles';
  const LEGACY_USER_STORAGE_KEY = 'playrCurrentUser';
  const PENDING_REFERRAL_STORAGE_KEY = 'playrPendingReferralCode';
  const TRUSTED_VIP_IDENTIFIERS = new Set(['owner@playr.io']);
  const OWNER_XP_RECOVERY_STORAGE_KEY = 'playrOwnerXpRecoveryV1';
  const OWNER_XP_RECOVERY_THRESHOLD = 1000000000;
  const EXTRA_EQUIPPED_BADGE_LIMIT = 5;
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
  const REFERRAL_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
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
  let adsenseLoadScheduled = false;
  const LEVEL_BRACKETS = [
    { min: 1, max: 9, id: 'level-1-9', label: 'Level I', title: 'Levels 1-9' },
    { min: 10, max: 24, id: 'level-10-24', label: 'Level II', title: 'Levels 10-24' },
    { min: 25, max: 49, id: 'level-25-49', label: 'Level III', title: 'Levels 25-49' },
    { min: 50, max: 74, id: 'level-50-74', label: 'Level IV', title: 'Levels 50-74' },
    { min: 75, max: 99, id: 'level-75-99', label: 'Level V', title: 'Levels 75-99' },
    { min: 100, max: 998, id: 'level-100-plus', label: 'Level VI', title: 'Level 100+' },
    { min: 999, max: 999, id: 'level-999', label: 'Level MAX', title: 'Level 999' },
  ];
  const REFERRAL_TIERS = [
    { count: 1, xp: 50, badgeId: 'referral-1', label: 'Rec I', description: 'Awarded after 1 qualified referral' },
    { count: 3, xp: 150, badgeId: 'referral-3', label: 'Rec II', description: 'Awarded after 3 qualified referrals' },
    { count: 5, xp: 300, badgeId: 'referral-5', label: 'Rec III', description: 'Awarded after 5 qualified referrals' },
    { count: 10, xp: 600, badgeId: 'referral-10', label: 'Scout', description: 'Awarded after 10 qualified referrals', animated: true, animationClass: 'referral-animated-scout' },
    { count: 25, xp: 1500, badgeId: 'referral-25', label: 'Signal', description: 'Awarded after 25 qualified referrals', animated: true, animationClass: 'referral-animated-signal', displayColor: '#c38bff' },
  ];
  const LEADERBOARD_BADGES = [
    { id: 'leaderboard-top-100', min: 51, max: 100, label: 'Top 100', title: 'Top 100', description: 'Currently ranked inside the local XP Top 100.' },
    { id: 'leaderboard-top-50', min: 26, max: 50, label: 'Top 50', title: 'Top 50', description: 'Currently ranked inside the local XP Top 50.' },
    { id: 'leaderboard-top-25', min: 11, max: 25, label: 'Top 25', title: 'Top 25', description: 'Currently ranked inside the local XP Top 25.' },
    { id: 'leaderboard-top-10', min: 4, max: 10, label: 'Top 10', title: 'Top 10', description: 'Currently ranked inside the local XP Top 10.' },
    { id: 'leaderboard-top-3', min: 2, max: 3, label: 'Top 3', title: 'Top 3', description: 'Currently ranked inside the local XP Top 3.' },
    { id: 'leaderboard-1st', min: 1, max: 1, label: '1st', title: '1st Place', description: 'Currently holds the #1 local XP spot.' },
  ];
  const DONATION_BADGES = [
    { id: 'donation-1', minimumCad: 0.01, label: 'Dono I', title: 'Donation I', description: 'Reserved for supporters once donations go live.', color: '#22ff4e', assetPath: '/images/donations/dono-1.svg' },
    { id: 'donation-2', minimumCad: 3, label: 'Dono II', title: 'Donation II', description: 'Reserved for supporters once donations go live.', color: '#ffbf20', assetPath: '/images/donations/dono-2.svg' },
    { id: 'donation-3', minimumCad: 10, label: 'Dono III', title: 'Donation III', description: 'Reserved for supporters once donations go live.', color: '#3dc8ff', assetPath: '/images/donations/dono-3.svg' },
    { id: 'donation-4', minimumCad: 50, label: 'Dono IV', title: 'Donation IV', description: 'Reserved for supporters once donations go live.', color: '#ff2b2b', assetPath: '/images/donations/dono-4.svg' },
    { id: 'donation-5', minimumCad: 100, label: 'Dono V', title: 'Donation V', description: 'Reserved for supporters once donations go live.', color: '#a638ff', assetPath: '/images/donations/dono-5.svg' },
  ];

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

  function createSvgDataUri(markup) {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markup)}`;
  }

  function clampColor(value, fallback = '#8ed8ff') {
    const safe = String(value || '').trim();
    return /^#[0-9a-f]{6}$/i.test(safe) ? safe : fallback;
  }

  function createBadgeIcon({
    shape = 'circle',
    primary = '#8ed8ff',
    accent = '#ffffff',
    secondary = 'rgba(255,255,255,0.18)',
    text = '',
  } = {}) {
    const fill = clampColor(primary);
    const stroke = clampColor(accent, '#ffffff');
    const plate = clampColor(secondary, '#1a2337');
    let shapeMarkup = `<circle cx="16" cy="16" r="10.25" fill="${fill}" stroke="${stroke}" stroke-width="1.8" />`;

    if (shape === 'ring') {
      shapeMarkup = `<circle cx="16" cy="16" r="10.5" fill="${plate}" stroke="${stroke}" stroke-width="1.8" /><circle cx="16" cy="16" r="6.4" fill="${fill}" />`;
    } else if (shape === 'diamond') {
      shapeMarkup = `<path d="M16 5.4 26.6 16 16 26.6 5.4 16 16 5.4Z" fill="${fill}" stroke="${stroke}" stroke-width="1.8" />`;
    } else if (shape === 'hex') {
      shapeMarkup = `<path d="M10.3 6.5h11.4l5.7 9.5-5.7 9.5H10.3L4.6 16l5.7-9.5Z" fill="${fill}" stroke="${stroke}" stroke-width="1.8" />`;
    } else if (shape === 'shield') {
      shapeMarkup = `<path d="M16 4.8 25.8 8.3v7.4c0 6.1-3.5 10.3-9.8 11.7-6.3-1.4-9.8-5.6-9.8-11.7V8.3L16 4.8Z" fill="${fill}" stroke="${stroke}" stroke-width="1.8" />`;
    } else if (shape === 'crown') {
      shapeMarkup = `<path d="M7 23.8h18l1.3-11.6-5.7 3.7-4.6-7-4.6 7-5.7-3.7L7 23.8Z" fill="${fill}" stroke="${stroke}" stroke-width="1.7" />`;
    } else if (shape === 'ribbon') {
      shapeMarkup = `<circle cx="16" cy="13" r="7.4" fill="${fill}" stroke="${stroke}" stroke-width="1.7" /><path d="m11.7 18.6-1.9 8 6.2-3.5 6.2 3.5-1.9-8" fill="${plate}" stroke="${stroke}" stroke-width="1.3" />`;
    } else if (shape === 'spark') {
      shapeMarkup = `<path d="M16 4.8 18.8 12l7.2 2.8-7.2 2.8L16 24.8l-2.8-7.2L6 14.8l7.2-2.8L16 4.8Z" fill="${fill}" stroke="${stroke}" stroke-width="1.7" />`;
    } else if (shape === 'network') {
      shapeMarkup = `<circle cx="10" cy="11" r="3.4" fill="${fill}" /><circle cx="22" cy="11" r="3.4" fill="${fill}" /><circle cx="16" cy="22" r="3.8" fill="${fill}" /><path d="M12.8 13.2 16 18.2m3.2-5L16 18.2m-2.2-5.6h4.4" stroke="${stroke}" stroke-width="1.7" stroke-linecap="round" />`;
    }

    const textMarkup = text
      ? `<text x="16" y="20.2" text-anchor="middle" font-size="${text.length > 2 ? 10 : 12}" font-weight="800" font-family="Arial, sans-serif" fill="${stroke}">${escapeHtml(text)}</text>`
      : '';

    return createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <rect x="1.4" y="1.4" width="29.2" height="29.2" rx="10" fill="#0d1424" stroke="rgba(255,255,255,0.14)" />
        ${shapeMarkup}
        ${textMarkup}
      </svg>
    `);
  }

  function createLevelIcon(levelId) {
    const iconMap = {
      'level-1-9': '/images/level-icons/Untitled%20design1.png',
      'level-10-24': '/images/level-icons/Untitled%20design2.png',
      'level-25-49': '/images/level-icons/Untitled%20design3.png',
      'level-50-74': '/images/level-icons/Untitled%20design4.png',
      'level-75-99': '/images/level-icons/Untitled%20design5.png',
      'level-100-plus': '/images/level-icons/Untitled%20design6.png',
      'level-999': '/images/level-icons/Untitled%20design7.png',
    };
    return iconMap[levelId] || iconMap['level-1-9'];
  }

  function createLeaderboardIcon(badgeId) {
    const iconMap = {
      'leaderboard-1st': '/images/leaderboard-icons/1st_place.png',
      'leaderboard-top-3': '/images/leaderboard-icons/top3.png',
      'leaderboard-top-10': '/images/leaderboard-icons/top10.png',
      'leaderboard-top-25': '/images/leaderboard-icons/top25.png',
      'leaderboard-top-50': '/images/leaderboard-icons/top50.png',
      'leaderboard-top-100': '/images/leaderboard-icons/top100.png',
    };
    return iconMap[badgeId] || iconMap['leaderboard-top-100'];
  }

  function createReferralIcon(tierId) {
    if (tierId === 'referral-1') return '/images/referral%20badge%20icons/1ref.png';
    if (tierId === 'referral-3') return '/images/referral%20badge%20icons/3ref.png';
    if (tierId === 'referral-5') return '/images/referral%20badge%20icons/5ref.png';
    if (tierId === 'referral-10') return '/images/referral%20badge%20icons/10ref.png';
    if (tierId === 'referral-25') return '/images/referral%20badge%20icons/25ref.png';
    return createBadgeIcon({ shape: 'network', primary: '#78afff', accent: '#eef5ff' });
  }

  const LEVEL_100_THRESHOLD = (() => {
    const thresholds = [0];
    while (thresholds.length < 100) {
      const sourceLevel = thresholds.length;
      thresholds.push(thresholds[thresholds.length - 1] + getXpRequiredForLevel(sourceLevel));
    }
    return thresholds[99] || 0;
  })();

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
    return path.includes('/games/single-player/')
      || path.includes('/games/two-player/')
      || path.includes('/utils/single-player/')
      || path.includes('/utils/two-player/');
  }

  function isMultiplayerPage() {
    const path = String(window.location.pathname || '');
    return path.includes('/games/two-player/') || path.includes('/utils/two-player/');
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
    let level;
    let currentThreshold;
    let nextThreshold;

    if (xp >= LEVEL_100_THRESHOLD) {
      const extraLevels = Math.floor((xp - LEVEL_100_THRESHOLD) / 15000);
      level = 100 + extraLevels;
      currentThreshold = LEVEL_100_THRESHOLD + (extraLevels * 15000);
      nextThreshold = currentThreshold + 15000;
    } else {
      level = 1;
      currentThreshold = 0;
      nextThreshold = getXpRequiredForLevel(1);

      while (xp >= nextThreshold) {
        currentThreshold = nextThreshold;
        level += 1;
        nextThreshold = currentThreshold + getXpRequiredForLevel(level);
      }
    }

    const uncappedLevel = level;
    const displayLevel = Math.min(999, uncappedLevel);
    let displayCurrentThreshold = currentThreshold;
    let displayNextThreshold = nextThreshold;
    if (displayLevel >= 999) {
      const thresholds = getLevelThresholds(999);
      displayCurrentThreshold = thresholds[998] || currentThreshold;
      displayNextThreshold = Number.POSITIVE_INFINITY;
    }
    const progress = displayLevel >= 999
      ? 1
      : Math.max(0, Math.min(1, (xp - displayCurrentThreshold) / Math.max(1, displayNextThreshold - displayCurrentThreshold)));
    const bracket = LEVEL_BRACKETS.find((entry) => displayLevel >= entry.min && displayLevel <= entry.max) || LEVEL_BRACKETS[LEVEL_BRACKETS.length - 1];

    return {
      xp,
      level: displayLevel,
      uncappedLevel,
      currentThreshold: displayCurrentThreshold,
      nextThreshold: displayNextThreshold,
      progress,
      xpIntoLevel: xp - displayCurrentThreshold,
      xpToNextLevel: displayLevel >= 999 ? 0 : Math.max(0, displayNextThreshold - xp),
      bracket,
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
    const unlockedBadgeIds = Array.isArray(cosmetics.unlockedBadgeIds) ? cosmetics.unlockedBadgeIds : [];
    const daily = progression.daily && typeof progression.daily === 'object' ? progression.daily : {};
    const activeSecondsByDay = daily.activeSecondsByDay && typeof daily.activeSecondsByDay === 'object' ? daily.activeSecondsByDay : {};
    const multiplayerSecondsByDay = daily.multiplayerSecondsByDay && typeof daily.multiplayerSecondsByDay === 'object' ? daily.multiplayerSecondsByDay : {};
    const roomXpByDay = daily.roomXpByDay && typeof daily.roomXpByDay === 'object' ? daily.roomXpByDay : {};
    const pendingLeaderboardXpByDay = daily.pendingLeaderboardXpByDay && typeof daily.pendingLeaderboardXpByDay === 'object' ? daily.pendingLeaderboardXpByDay : {};
    const awardedLeaderboardXpByDay = daily.awardedLeaderboardXpByDay && typeof daily.awardedLeaderboardXpByDay === 'object' ? daily.awardedLeaderboardXpByDay : {};
    const referralsRewarded = Array.isArray(referral.rewardedTiers) ? referral.rewardedTiers : [];
    const qualifiedHistory = Array.isArray(referral.qualifiedHistory) ? referral.qualifiedHistory : [];
    const distinctDaysPlayed = Array.isArray(progression.distinctDaysPlayed) ? progression.distinctDaysPlayed : [];
    const afk = progression.afk && typeof progression.afk === 'object' ? progression.afk : {};
    const support = progression.support && typeof progression.support === 'object' ? progression.support : {};
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
        pendingLeaderboardXpByDay,
        awardedLeaderboardXpByDay,
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
        qualifiedHistory: qualifiedHistory.map((value) => Math.max(0, Number(value) || 0)).filter(Boolean),
        qualifiedAt: referral.qualifiedAt || null,
        hasQualifiedSelf: Boolean(referral.hasQualifiedSelf),
        activeBadgeId: String(referral.activeBadgeId || ''),
        activeBadgeExpiresAt: Math.max(0, Number(referral.activeBadgeExpiresAt) || 0),
        vipGrantMilestone: Math.max(0, Number(referral.vipGrantMilestone) || 0),
        vipExpiresAt: Math.max(0, Number(referral.vipExpiresAt) || 0),
      },
      cosmetics: {
        badges,
        revokedBadges,
        unlockedBadgeIds: unlockedBadgeIds.map((value) => String(value || '').trim()).filter(Boolean),
        title: String(cosmetics.title || ''),
        flair: String(cosmetics.flair || ''),
        displayNameColor: String(cosmetics.displayNameColor || ''),
        equippedBadgeIds: Array.isArray(cosmetics.equippedBadgeIds)
          ? cosmetics.equippedBadgeIds.map((value) => String(value || '').trim()).filter(Boolean)
          : [],
      },
      support: {
        totalDonatedCad: Math.max(0, Number(support.totalDonatedCad) || 0),
        highestDonationBadgeId: String(support.highestDonationBadgeId || ''),
      },
      level: levelInfo.level,
    };

    if (isOwnerRecord(record || merged)) {
      const ownerInventory = new Set(merged.progression.cosmetics.unlockedBadgeIds || []);
      [
        ...LEADERBOARD_BADGES.map((badge) => badge.id),
        ...DONATION_BADGES.map((badge) => badge.id),
        ...REFERRAL_TIERS.map((tier) => tier.badgeId),
        'vip',
        'owner',
      ].forEach((badgeId) => ownerInventory.add(badgeId));
      merged.progression.cosmetics.unlockedBadgeIds = Array.from(ownerInventory);
    }
    if ((Number(merged.progression.referral.vipExpiresAt) || 0) > Date.now()) {
      merged.isVip = true;
    }

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

  function runOwnerXpRecoveryMigration() {
    const alreadyRecovered = window.localStorage.getItem(OWNER_XP_RECOVERY_STORAGE_KEY) === 'done';
    const profiles = readProfiles();
    let changed = false;

    Object.entries(profiles).forEach(([key, profile]) => {
      if (!profile || typeof profile !== 'object') return;
      const identifierType = String(profile.identifierType || '').trim().toLowerCase();
      const identifier = normalizeIdentifier(profile.identifier);
      if (identifierType !== 'email' || !TRUSTED_VIP_IDENTIFIERS.has(identifier)) return;

      const rawXp = Math.max(0, Number(profile?.progression?.xp) || 0);
      if (!alreadyRecovered && rawXp >= OWNER_XP_RECOVERY_THRESHOLD) {
        profiles[key] = {
          ...profile,
          progression: {
            ...(profile.progression && typeof profile.progression === 'object' ? profile.progression : {}),
            xp: 0,
            pendingXpFraction: 0,
            lastLevelNotified: 1,
            daily: {
              ...((profile.progression && profile.progression.daily && typeof profile.progression.daily === 'object') ? profile.progression.daily : {}),
              pendingLeaderboardXpByDay: {},
            },
          },
        };
        changed = true;
      }
    });

    if (changed) {
      writeProfiles(profiles);
    }

    if (!alreadyRecovered) {
      window.localStorage.setItem(OWNER_XP_RECOVERY_STORAGE_KEY, 'done');
    }
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
    reconcileDeferredLeaderboardBonuses(record, nextProfile, Date.now());

    profiles[profileKey] = nextProfile;
    writeProfiles(profiles);
    return { key: profileKey, profile: nextProfile, profiles };
  }

  runOwnerXpRecoveryMigration();

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
      .playr-identity-text[data-playr-color] {
        color: var(--playr-name-color, inherit);
        text-shadow: 0 0 12px rgba(255, 255, 255, 0.18);
      }
      .playr-identity-text[data-playr-gradient] {
        background-image: var(--playr-name-gradient);
        background-size: 100% 100%;
        background-repeat: no-repeat;
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 12px rgba(255, 255, 255, 0.14);
      }
      .playr-badge-stack {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        flex-wrap: wrap;
      }
      .playr-badge {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        min-height: 22px;
        padding: 0 7px;
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
      .playr-badge.owner {
        border-color: rgba(255, 208, 96, 0.42);
        background: rgba(255, 208, 96, 0.16);
        color: #fff1b9;
      }
      .playr-badge.leaderboard {
        border-color: rgba(123, 208, 255, 0.36);
        background: rgba(123, 208, 255, 0.12);
      }
      .playr-badge.donation {
        border-color: rgba(132, 255, 166, 0.34);
        background: rgba(132, 255, 166, 0.1);
      }
      .playr-badge.animated img {
        animation: playrBadgeFloat 1.8s ease-in-out infinite;
      }
      .playr-badge.referral-animated-rec3 img {
        animation: playrBadgeRec3 1.4s ease-in-out infinite;
      }
      .playr-badge.referral-animated-scout img {
        animation: playrBadgeScout 1.15s ease-in-out infinite;
      }
      .playr-badge.referral-animated-signal img {
        animation: playrBadgeSignal 1.25s ease-in-out infinite;
      }
      .playr-badge img {
        width: 15px;
        height: 15px;
        object-fit: contain;
        border-radius: 3px;
      }
      .playr-badge[data-tooltip]::after {
        content: attr(data-tooltip);
        position: absolute;
        left: 50%;
        bottom: calc(100% + 10px);
        transform: translateX(-50%) translateY(4px);
        width: max-content;
        max-width: min(230px, calc(100vw - 40px));
        padding: 8px 10px;
        border-radius: 12px;
        background: rgba(8, 14, 26, 1);
        border: 1px solid rgba(111, 239, 255, 0.28);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.28);
        color: #e9fbff;
        font-size: 0.84rem;
        line-height: 1.35;
        white-space: normal;
        opacity: 0;
        pointer-events: none;
        transition: opacity 120ms ease, transform 120ms ease;
        z-index: 20;
      }
      .playr-badge[data-tooltip]:hover::after,
      .playr-badge[data-tooltip]:focus-visible::after {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
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
        position: relative;
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
        overflow: hidden;
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
      .playr-levelup-card::after {
        content: '';
        position: absolute;
        right: -18px;
        bottom: -46px;
        width: 180px;
        height: 180px;
        background: radial-gradient(circle, rgba(255, 210, 84, 0.24), transparent 70%);
        transform: rotate(12deg);
      }
      .playr-levelup-card p {
        margin: 0;
        color: #dce8ff;
        line-height: 1.6;
      }
      @keyframes playrBadgeFloat {
        0%, 100% { transform: translateY(0) scale(1); filter: drop-shadow(0 0 0 rgba(255,255,255,0)); }
        50% { transform: translateY(-1px) scale(1.05); filter: drop-shadow(0 0 10px rgba(160,205,255,0.35)); }
      }
      @keyframes playrBadgeRec3 {
        0%, 100% { transform: translateY(0) scale(1); filter: drop-shadow(0 0 0 rgba(255,210,94,0)); }
        40% { transform: translateY(-1px) scale(1.08) rotate(-4deg); filter: drop-shadow(0 0 10px rgba(255,210,94,0.34)); }
        70% { transform: translateY(0) scale(1.03) rotate(4deg); filter: drop-shadow(0 0 6px rgba(255,210,94,0.2)); }
      }
      @keyframes playrBadgeScout {
        0% { transform: rotate(0deg) scale(1); filter: drop-shadow(0 0 0 rgba(255,145,87,0)); }
        30% { transform: rotate(-9deg) scale(1.06); filter: drop-shadow(0 0 9px rgba(255,145,87,0.32)); }
        60% { transform: rotate(9deg) scale(1.09); filter: drop-shadow(0 0 12px rgba(255,145,87,0.38)); }
        100% { transform: rotate(0deg) scale(1); filter: drop-shadow(0 0 0 rgba(255,145,87,0)); }
      }
      @keyframes playrBadgeSignal {
        0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(184,93,255,0)); }
        35% { transform: scale(1.12) translateY(-1px); filter: drop-shadow(0 0 14px rgba(184,93,255,0.44)); }
        65% { transform: scale(1.06); filter: drop-shadow(0 0 18px rgba(184,93,255,0.56)); }
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
        <p class="playr-levelup-label">Progression update</p>
        <strong id="playrLevelUpTitle">You've Leveled UP!</strong>
        <p id="playrLevelUpBody">Level 2 unlocked. Keep playing to sharpen your badge lineup.</p>
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
    if (title) title.textContent = `You've Leveled UP! Level ${level}`;
    if (body) body.textContent = `You just earned ${Math.round(gainedXp)} XP and hit Level ${level}. Your level tag has upgraded too.`;
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

  function queueDeferredLeaderboardBonus(profile, dayKey, amount) {
    if (!profile?.progression?.daily || !dayKey) return 0;
    const gain = Math.max(0, Math.floor(Number(amount) || 0));
    if (!gain) return 0;
    profile.progression.daily.pendingLeaderboardXpByDay[dayKey] = Math.max(
      0,
      Number(profile.progression.daily.pendingLeaderboardXpByDay[dayKey]) || 0,
    ) + gain;
    return gain;
  }

  function reconcileDeferredLeaderboardBonuses(record, profile, now = Date.now()) {
    if (!record || !profile?.progression?.daily) return { profile, awardedXp: 0 };
    const currentDayKey = getCurrentDateKey();
    const pending = profile.progression.daily.pendingLeaderboardXpByDay || {};
    const awarded = profile.progression.daily.awardedLeaderboardXpByDay || {};
    const dueDays = Object.keys(pending).filter((dayKey) => dayKey && dayKey < currentDayKey);
    if (!dueDays.length) return { profile, awardedXp: 0 };

    let awardedXp = 0;
    const previousLevel = getLevelInfoFromXp(profile.progression.xp).level;
    dueDays.forEach((dayKey) => {
      const amount = Math.max(0, Math.floor(Number(pending[dayKey]) || 0));
      if (!amount) {
        delete pending[dayKey];
        return;
      }
      profile.progression.xp += amount;
      awarded[dayKey] = Math.max(0, Number(awarded[dayKey]) || 0) + amount;
      delete pending[dayKey];
      awardedXp += amount;
    });

    if (awardedXp > 0) {
      const nextLevel = getLevelInfoFromXp(profile.progression.xp).level;
      profile.updatedAt = now;
      if (nextLevel > previousLevel) {
        profile.progression.lastLevelNotified = nextLevel;
        showLevelUpOverlay(nextLevel, awardedXp);
      }
    }

    return { profile, awardedXp };
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
      queuedLeaderboardBonusXp: 0,
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
    const projectedSessionXp = Math.floor(session.earnedBaseXp * sessionMultiplier);
    const delta = Math.max(0, projectedSessionXp - session.awardedXp);
    const projectedLeaderboardBonus = Math.max(0, Math.floor(session.earnedBaseXp * sessionMultiplier * leaderboardMultiplier) - projectedSessionXp);
    const queuedBonusDelta = Math.max(0, projectedLeaderboardBonus - session.queuedLeaderboardBonusXp);

    if (delta > 0 || queuedBonusDelta > 0) {
      const created = getOrCreateProfile(record);
      if (created?.key) {
        const profile = ensureProfileShape(created.profiles[created.key], record);
        if (delta > 0) {
          profile.progression.xp += delta;
          profile.updatedAt = now;
        }
        if (queuedBonusDelta > 0) {
          queueDeferredLeaderboardBonus(profile, getCurrentDateKey(), queuedBonusDelta);
          profile.updatedAt = now;
        }
        created.profiles[created.key] = profile;
        writeProfiles(created.profiles);
        if (delta > 0) {
          const previousLevel = getLevelInfoFromXp(profile.progression.xp - delta).level;
          const nextLevel = getLevelInfoFromXp(profile.progression.xp).level;
          if (nextLevel > previousLevel) {
            profile.progression.lastLevelNotified = nextLevel;
            created.profiles[created.key] = profile;
            writeProfiles(created.profiles);
            showLevelUpOverlay(nextLevel, delta);
          }
        }
        emitProgressionChange(record, profile);
      }
    }

    activityState.session = null;
    activityState.eventLog = [];
    activityState.lastPointerMoveAt = 0;
    activityState.lastPointerMoveSampleAt = 0;
    return {
      durationMs,
      finalAwardedXp: projectedSessionXp,
      reason,
    };
  }

  function getLevelBadgeConfig(levelInfo) {
    const bracket = levelInfo.bracket || LEVEL_BRACKETS[0];
    return {
      ...bracket,
      assetPath: createLevelIcon(bracket.id),
    };
  }

  function getRecentReferralCount(profile, now = Date.now()) {
    const history = Array.isArray(profile?.progression?.referral?.qualifiedHistory)
      ? profile.progression.referral.qualifiedHistory
      : [];
    return history.filter((value) => (now - Number(value || 0)) <= REFERRAL_WINDOW_MS).length;
  }

  function getReferralTierByCount(count) {
    const safeCount = Math.max(0, Number(count) || 0);
    for (let index = REFERRAL_TIERS.length - 1; index >= 0; index -= 1) {
      if (safeCount >= REFERRAL_TIERS[index].count) {
        return REFERRAL_TIERS[index];
      }
    }
    return null;
  }

  function getActiveReferralTier(profile, now = Date.now()) {
    const referral = profile?.progression?.referral || {};
    const expiresAt = Math.max(0, Number(referral.activeBadgeExpiresAt) || 0);
    if (!expiresAt || expiresAt <= now) return null;
    const activeBadgeId = String(referral.activeBadgeId || '').trim();
    if (!activeBadgeId) return null;
    return REFERRAL_TIERS.find((tier) => tier.badgeId === activeBadgeId) || null;
  }

  function getLocalXpLeaderboardRank(profile) {
    if (!profile) return 0;
    const profiles = Object.values(readProfiles())
      .map((entry) => ensureProfileShape(entry, entry))
      .sort((left, right) => {
        const xpDiff = (Number(right?.progression?.xp) || 0) - (Number(left?.progression?.xp) || 0);
        if (xpDiff !== 0) return xpDiff;
        return normalizeName(left?.displayName || '').localeCompare(normalizeName(right?.displayName || ''));
      });
    const targetKey = profile.uid
      || normalizeIdentifier(profile.identifier)
      || normalizeIdentifier(profile.displayName);
    const index = profiles.findIndex((candidate) => {
      const candidateKey = candidate.uid
        || normalizeIdentifier(candidate.identifier)
        || normalizeIdentifier(candidate.displayName);
      return candidateKey && candidateKey === targetKey;
    });
    return index >= 0 ? index + 1 : 0;
  }

  function getLeaderboardBadgeForRank(rank) {
    const safeRank = Math.max(0, Math.floor(Number(rank) || 0));
    if (!safeRank) return null;
    return LEADERBOARD_BADGES.find((badge) => safeRank >= badge.min && safeRank <= badge.max) || null;
  }

  function getDonationBadgeForProfile(profile) {
    const forcedId = String(profile?.progression?.support?.highestDonationBadgeId || '').trim();
    if (forcedId) {
      return DONATION_BADGES.find((badge) => badge.id === forcedId) || null;
    }
    const amount = Math.max(0, Number(profile?.progression?.support?.totalDonatedCad) || 0);
    for (let index = DONATION_BADGES.length - 1; index >= 0; index -= 1) {
      if (amount >= DONATION_BADGES[index].minimumCad) {
        return DONATION_BADGES[index];
      }
    }
    return null;
  }

  function buildManualBadgeDefinition(badgeId) {
    const leaderboard = LEADERBOARD_BADGES.find((badge) => badge.id === badgeId);
    if (leaderboard) {
      return {
        id: leaderboard.id,
        tone: 'leaderboard',
        label: '',
        title: `${leaderboard.label} Badge`,
        description: `${leaderboard.label} Badge - ${leaderboard.description}`,
        showLabel: false,
        assetPath: createLeaderboardIcon(badgeId),
      };
    }

    const donation = DONATION_BADGES.find((badge) => badge.id === badgeId);
    if (donation) {
      return {
        id: donation.id,
        tone: 'donation',
        label: '',
        title: `${donation.label} Badge`,
        description: `${donation.label} Badge - Supporter donation tag.`,
        showLabel: false,
        assetPath: donation.assetPath || createBadgeIcon({ shape: 'ring', primary: donation.color, accent: '#ffffff', text: '$' }),
        displayGradient: donation.id === 'donation-1'
          ? 'linear-gradient(180deg, #dffff0 0%, #22ff4e 45%, #0a7f23 100%)'
          : donation.id === 'donation-2'
            ? 'linear-gradient(180deg, #fff2c9 0%, #ffbf20 45%, #9d5c00 100%)'
            : donation.id === 'donation-3'
              ? 'linear-gradient(180deg, #ebfaff 0%, #3dc8ff 45%, #116d9d 100%)'
              : donation.id === 'donation-4'
                ? 'linear-gradient(180deg, #ffe3e3 0%, #ff2b2b 45%, #870d0d 100%)'
                : 'linear-gradient(180deg, #f6e5ff 0%, #a638ff 45%, #5f1c93 100%)',
      };
    }

    const referral = REFERRAL_TIERS.find((badge) => badge.badgeId === badgeId);
    if (referral) {
      return {
        id: referral.badgeId,
        tone: 'referral',
        label: '',
        title: `${referral.label} Badge`,
        description: `${referral.label} Badge - ${referral.description}`,
        showLabel: false,
        animated: Boolean(referral.animated),
        animationClass: referral.animationClass || '',
        displayColor: referral.displayColor || '',
        displayGradient: referral.displayGradient || '',
        assetPath: createReferralIcon(referral.badgeId),
      };
    }

    if (badgeId === 'vip') {
      return {
        id: 'vip',
        tone: 'vip',
        label: '',
        title: 'VIP Badge',
        description: 'VIP Badge - VIP Membership Tag',
        showLabel: false,
        assetPath: createBadgeIcon({ shape: 'spark', primary: '#ffd66d', accent: '#fff9db', text: '+' }),
        displayGradient: 'linear-gradient(180deg, #fff7cf 0%, #ffd76b 35%, #b87c1c 70%, #fff2bf 100%)',
      };
    }

    if (badgeId === 'owner') {
      return {
        id: 'owner',
        tone: 'owner',
        label: '',
        title: 'Owner Badge',
        description: 'Owner Badge - Game maker!',
        showLabel: false,
        assetPath: createBadgeIcon({ shape: 'crown', primary: '#ffc967', accent: '#fff5d7' }),
        displayGradient: 'linear-gradient(180deg, #fafcff 0%, #10141a 50%, #fafcff 100%)',
      };
    }

    return null;
  }

  function getAvailableBadges(record, profile) {
    const safeProfile = ensureProfileShape(profile, record);
    const levelInfo = getLevelInfoFromXp(safeProfile.progression.xp);
    const revoked = new Set(safeProfile.progression.cosmetics.revokedBadges || []);
    const badges = [];
    const pushBadge = (badge) => {
      if (!badge?.id || revoked.has(badge.id) || badges.some((entry) => entry.id === badge.id)) return;
      badges.push(badge);
    };

    const levelBadge = getLevelBadgeConfig(levelInfo);
    pushBadge({
      id: 'level',
      tone: 'level',
      label: `Lv. ${levelInfo.level}`,
      title: `Level ${levelInfo.level}`,
      description: `Level Badge - ${levelBadge.title}. Current level ${levelInfo.level}.`,
      showLabel: true,
      assetPath: levelBadge.assetPath,
    });

    if (safeProfile.isVip) {
      pushBadge(buildManualBadgeDefinition('vip'));
    }
    if (isOwnerRecord(record || safeProfile)) {
      pushBadge(buildManualBadgeDefinition('owner'));
    }

    const leaderboardRank = getLocalXpLeaderboardRank(safeProfile);
    const leaderboardBadge = getLeaderboardBadgeForRank(leaderboardRank);
    if (leaderboardBadge) {
      const leaderboardVisual = buildManualBadgeDefinition(leaderboardBadge.id);
      pushBadge({
        id: leaderboardBadge.id,
        tone: 'leaderboard',
        label: '',
        title: `${leaderboardBadge.label} Badge`,
        description: `${leaderboardBadge.label} Badge - ${leaderboardBadge.description} Current rank: #${leaderboardRank}.`,
        showLabel: false,
        assetPath: leaderboardVisual?.assetPath || '',
      });
    }

    const donationBadge = getDonationBadgeForProfile(safeProfile);
    if (donationBadge) {
      pushBadge(buildManualBadgeDefinition(donationBadge.id));
    }

    const referralTier = getActiveReferralTier(safeProfile);
    if (referralTier) {
      pushBadge(buildManualBadgeDefinition(referralTier.badgeId));
    }

    (safeProfile.progression.cosmetics.unlockedBadgeIds || []).forEach((badgeId) => {
      const manual = buildManualBadgeDefinition(badgeId);
      if (manual) pushBadge(manual);
    });

    safeProfile.progression.cosmetics.badges.forEach((badge) => {
      if (!badge || !badge.id || revoked.has(badge.id)) return;
      pushBadge({
        id: badge.id,
        tone: badge.tone || 'cosmetic',
        emoji: badge.emoji || '★',
        label: badge.label || '',
        title: badge.title || badge.label || 'Cosmetic badge',
        description: badge.description || badge.title || badge.label || 'Cosmetic badge',
        assetPath: badge.assetPath || '',
        animated: Boolean(badge.animated),
        displayColor: badge.displayColor || '',
        displayGradient: badge.displayGradient || '',
        showLabel: Boolean(badge.showLabel),
      });
    });

    return badges.sort(compareBadges);
  }

  function getEquippedBadgeIds(profile, availableBadges = []) {
    const safeProfile = ensureProfileShape(profile);
    const allowedIds = new Set(
      availableBadges
        .map((badge) => String(badge?.id || ''))
        .filter((badgeId) => badgeId && badgeId !== 'level')
    );
    const equipped = [];
    (safeProfile.progression.cosmetics.equippedBadgeIds || []).forEach((badgeId) => {
      const safeBadgeId = String(badgeId || '').trim();
      if (!safeBadgeId || !allowedIds.has(safeBadgeId) || equipped.includes(safeBadgeId)) return;
      if (equipped.length >= EXTRA_EQUIPPED_BADGE_LIMIT) return;
      equipped.push(safeBadgeId);
    });
    return equipped.sort((leftId, rightId) => compareBadges(
      availableBadges.find((badge) => badge?.id === leftId),
      availableBadges.find((badge) => badge?.id === rightId)
    ));
  }

  function getBadgePriority(badge) {
    const badgeId = String(badge?.id || '').trim();
    if (badgeId === 'owner') return 0;
    if (badgeId === 'vip') return 1;
    if (badgeId.startsWith('donation-')) return 2;
    if (badgeId === 'leaderboard-1st') return 3;
    if (badgeId === 'leaderboard-top-3') return 4;
    if (badgeId === 'leaderboard-top-10') return 5;
    if (badgeId === 'leaderboard-top-25') return 6;
    if (badgeId === 'leaderboard-top-50') return 7;
    if (badgeId === 'leaderboard-top-100') return 8;
    if (badgeId === 'referral-25') return 9;
    if (badgeId === 'referral-10') return 10;
    if (badgeId === 'referral-5') return 11;
    if (badgeId === 'referral-3') return 12;
    if (badgeId === 'referral-1') return 13;
    if (badgeId === 'level') return 14;
    return 20;
  }

  function compareBadges(left, right) {
    const priorityDiff = getBadgePriority(left) - getBadgePriority(right);
    if (priorityDiff !== 0) return priorityDiff;
    return String(left?.title || left?.label || left?.id || '').localeCompare(
      String(right?.title || right?.label || right?.id || '')
    );
  }

  function getVisibleBadges(record, profile) {
    const availableBadges = getAvailableBadges(record, profile);
    const badgeMap = new Map(
      availableBadges
        .filter((badge) => badge && badge.id)
        .map((badge) => [String(badge.id), badge])
    );
    const visible = [];
    getEquippedBadgeIds(profile, availableBadges).forEach((badgeId) => {
      const badge = badgeMap.get(badgeId);
      if (badge) visible.push(badge);
    });
    if (badgeMap.has('level')) {
      visible.push(badgeMap.get('level'));
    }
    return visible.sort(compareBadges);
  }

  function formatBadgeMarkup(badge) {
    const icon = badge.assetPath
      ? `<img src="${escapeHtml(badge.assetPath)}" alt="" loading="lazy" />`
      : `<span aria-hidden="true">${escapeHtml(badge.emoji || '•')}</span>`;
    const className = ['playr-badge', badge.tone || 'cosmetic', badge.animated ? 'animated' : ''].filter(Boolean).join(' ');
    const fullClassName = [className, badge.animationClass || ''].filter(Boolean).join(' ');
    const description = badge.description || badge.title || badge.label || '';
    const text = badge.showLabel !== false && badge.label ? `<span>${escapeHtml(badge.label || '')}</span>` : '';
    return `<span class="${escapeHtml(fullClassName)}" data-tooltip="${escapeHtml(description)}" tabindex="0">${icon}${text}</span>`;
  }

  function getIdentityDisplayStyle(record, profile, visibleBadges = []) {
    const directColor = String(profile?.progression?.cosmetics?.displayNameColor || '').trim();
    if (directColor) return { color: directColor, gradient: '' };
    const sortedBadges = [...visibleBadges].sort(compareBadges);
    const styledBadge = sortedBadges.find((badge) => String(badge?.displayGradient || '').trim() || String(badge?.displayColor || '').trim());
    if (styledBadge?.displayGradient) {
      return { color: '', gradient: styledBadge.displayGradient };
    }
    if (styledBadge?.displayColor) {
      return { color: styledBadge.displayColor, gradient: '' };
    }
    if (isOwnerRecord(record || profile)) {
      return { color: '', gradient: 'linear-gradient(180deg, #f8fbff 0%, #0f1116 50%, #f8fbff 100%)' };
    }
    return { color: '', gradient: '' };
  }

  function formatIdentityMarkup(name, options = {}) {
    injectSharedStyles();
    const displayName = normalizeName(name || options.displayName || 'Player');
    const record = options.record || null;
    const fallbackProfile = options.profile || (record ? getProfileForRecord(record) : null);
    const badges = options.showBadges === false
      ? []
      : getVisibleBadges(record || { displayName }, fallbackProfile || { displayName });
    const displayStyle = getIdentityDisplayStyle(record, fallbackProfile, badges);
    const compactClass = options.compact ? ' compact' : '';
    const prefixBadges = badges.filter((badge) => badge?.id === 'owner' || String(badge?.id || '').startsWith('donation-'));
    const suffixBadges = badges.filter((badge) => !prefixBadges.includes(badge));
    const styleAttrs = displayStyle.gradient
      ? ` data-playr-gradient="true" style="--playr-name-gradient:${escapeHtml(displayStyle.gradient)}"`
      : displayStyle.color
        ? ` data-playr-color="true" style="--playr-name-color:${escapeHtml(displayStyle.color)}"`
        : '';
    return `
      <span class="playr-identity${compactClass}">
        ${prefixBadges.length ? `<span class="playr-badge-stack">${prefixBadges.map((badge) => formatBadgeMarkup(badge)).join('')}</span>` : ''}
        <span class="playr-identity-text"${styleAttrs}>${escapeHtml(displayName)}</span>
        ${suffixBadges.length ? `<span class="playr-badge-stack">${suffixBadges.map((badge) => formatBadgeMarkup(badge)).join('')}</span>` : ''}
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
    const availableBadges = getAvailableBadges(record, safeProfile);
    const equippedBadgeIds = getEquippedBadgeIds(safeProfile, availableBadges);
    const visibleBadges = getVisibleBadges(record, safeProfile);
    const displayStyle = getIdentityDisplayStyle(record, safeProfile, visibleBadges);
    const xpLeaderboardRank = getLocalXpLeaderboardRank(safeProfile);
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
      recentQualifiedReferrals: getRecentReferralCount(safeProfile),
      title: safeProfile.progression.cosmetics.title,
      flair: safeProfile.progression.cosmetics.flair,
      displayNameColor: displayStyle.color,
      displayNameGradient: displayStyle.gradient,
      leaderboardRestricted: Boolean(safeProfile.progression.afk.leaderboardRestricted),
      xpLeaderboardRank,
      warningCooldownUntil: safeProfile.progression.afk.warningCooldownUntil || 0,
      badges: visibleBadges,
      availableBadges: [...availableBadges].sort(compareBadges),
      equippedBadgeIds,
      maxExtraBadgeSlots: EXTRA_EQUIPPED_BADGE_LIMIT,
      badgeAssets: {},
    };
  }

  function setEquippedBadges(record = getCurrentRecord(), badgeIds = []) {
    if (!record) return null;
    const created = getOrCreateProfile(record);
    if (!created?.key || !created.profile) return null;
    const profile = ensureProfileShape(created.profile, record);
    const availableBadges = getAvailableBadges(record, profile);
    profile.progression.cosmetics.equippedBadgeIds = getEquippedBadgeIds({
      ...profile,
      progression: {
        ...profile.progression,
        cosmetics: {
          ...profile.progression.cosmetics,
          equippedBadgeIds: Array.isArray(badgeIds) ? badgeIds : [],
        },
      },
    }, availableBadges);
    const saved = saveProfile(created.key, profile, created.profiles);
    emitProgressionChange(record, saved);
    return getProgressionSnapshot(record, saved);
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
      const now = Date.now();
      referrerProfile.progression.referral.qualifiedCount += 1;
      referrerProfile.progression.referral.qualifiedHistory.push(now);
      referrerProfile.progression.referral.qualifiedHistory = referrerProfile.progression.referral.qualifiedHistory
        .map((value) => Math.max(0, Number(value) || 0))
        .filter(Boolean)
        .sort((left, right) => left - right);

      REFERRAL_TIERS.forEach((tier) => {
        if (referrerProfile.progression.referral.qualifiedCount >= tier.count && !referrerProfile.progression.referral.rewardedTiers.includes(tier.count)) {
          referrerProfile.progression.referral.rewardedTiers.push(tier.count);
          referrerProfile.progression.xp += tier.xp;
        }
      });

      const activeTier = getReferralTierByCount(referrerProfile.progression.referral.qualifiedCount);
      if (activeTier?.badgeId) {
        referrerProfile.progression.referral.activeBadgeId = activeTier.badgeId;
        referrerProfile.progression.referral.activeBadgeExpiresAt = now + REFERRAL_WINDOW_MS;
      } else if (referrerProfile.progression.referral.activeBadgeExpiresAt > 0) {
        referrerProfile.progression.referral.activeBadgeExpiresAt = now + REFERRAL_WINDOW_MS;
      }

      const vipMilestone = Math.floor(referrerProfile.progression.referral.qualifiedCount / 25);
      if (vipMilestone > (referrerProfile.progression.referral.vipGrantMilestone || 0)) {
        referrerProfile.progression.referral.vipGrantMilestone = vipMilestone;
        referrerProfile.progression.referral.vipExpiresAt = now + REFERRAL_WINDOW_MS;
      }

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
    profiles[key] = profile;
    writeProfiles(profiles);
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
    profiles[key] = profile;
    writeProfiles(profiles);
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
    const dayKey = getCurrentDateKey();

    addActivitySeconds(record, ACTIVE_TICK_MS / 1000, { multiplayer: isMultiplayerPage() });
    session.earnedBaseXp += baseTickXp;
    session.lastActiveAt = now;
    session.leaderboardRank = Number(activityState.leaderboardRank) || session.leaderboardRank || 0;

    maybeHandleAfkEnforcement(record, key, profiles, profile, session, stageInfo, now);

    const sessionMultiplier = getSessionMultiplier(getCurrentSessionDuration(now));
    const leaderboardMultiplier = getLeaderboardMultiplier(session.leaderboardRank);
    const projectedXp = Math.floor(session.earnedBaseXp * sessionMultiplier);
    const delta = Math.max(0, projectedXp - session.awardedXp);
    const projectedLeaderboardBonus = Math.max(0, Math.floor(session.earnedBaseXp * sessionMultiplier * leaderboardMultiplier) - projectedXp);
    const queuedBonusDelta = Math.max(0, projectedLeaderboardBonus - session.queuedLeaderboardBonusXp);
    if (delta > 0) {
      awardXp(record, delta, 'active-play', { notifyLevelUp: true });
      session.awardedXp += delta;
    }
    if (queuedBonusDelta > 0) {
      const latest = getOrCreateProfile(record);
      if (latest?.key) {
        const liveProfile = ensureProfileShape(latest.profiles[latest.key], record);
        queueDeferredLeaderboardBonus(liveProfile, dayKey, queuedBonusDelta);
        liveProfile.updatedAt = now;
        latest.profiles[latest.key] = liveProfile;
        writeProfiles(latest.profiles);
        emitProgressionChange(record, liveProfile);
      }
      session.queuedLeaderboardBonusXp += queuedBonusDelta;
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

    if (!isGameplayPage()) {
      return;
    }

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
      return ensureProfileShape(profiles[record.uid], record).isVip === true;
    }

    const normalizedIdentifier = normalizeIdentifier(record.identifier);
    return Object.values(profiles).some((profile) => {
      if (!profile || typeof profile !== 'object') return false;
      if (normalizeIdentifier(profile.identifier) !== normalizedIdentifier) return false;
      return ensureProfileShape(profile, record).isVip === true;
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
    profiles[key] = profile;
    writeProfiles(profiles);
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

  function scheduleAdsenseScript() {
    if (adsenseLoadScheduled || document.getElementById(ADSENSE_SCRIPT_ID)) {
      return;
    }

    const loadScript = () => {
      adsenseLoadScheduled = false;
      if (document.documentElement.dataset.playrAds === 'vip') {
        return;
      }
      ensureAdsenseScript();
    };

    adsenseLoadScheduled = true;

    if (document.readyState === 'complete') {
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(loadScript, { timeout: 2000 });
      } else {
        window.setTimeout(loadScript, 250);
      }
      return;
    }

    window.addEventListener('load', loadScript, { once: true });
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
      adsenseLoadScheduled = false;
      removeManagedAdsenseArtifacts();
      return;
    }

    scheduleAdsenseScript();
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
    setEquippedBadges(badgeIds, record = getCurrentRecord()) {
      return setEquippedBadges(record, badgeIds);
    },
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
