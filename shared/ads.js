(function () {
  const ADSENSE_SCRIPT_ID = 'playr-adsense-loader';
  const ADSENSE_SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5070133200721707';
  const PROFILE_STORAGE_KEY = 'playrProfiles';
  const LEGACY_USER_STORAGE_KEY = 'playrCurrentUser';
  const PENDING_REFERRAL_STORAGE_KEY = 'playrPendingReferralCode';
  const TRUSTED_VIP_IDENTIFIERS = new Set(['owner@playr.io']);
  const LEVEL_SEED_THRESHOLDS = [0, 100, 250, 450, 700];
  const LEVEL_BADGE_GROUP_SIZE = 10;
  const ACTIVE_TICK_MS = 15000;
  const IDLE_TIMEOUT_MS = 15000;
  const ACTIVE_XP_PER_MINUTE = 10;
  const MULTIPLAYER_XP_PER_MINUTE = 5;
  const ROOM_DAILY_CAP = 50;
  const DAILY_ACTIVITY_BONUSES = [
    { minutes: 10, xp: 20 },
    { minutes: 30, xp: 40 },
    { minutes: 60, xp: 80 },
  ];
  const REFERRAL_TIERS = [
    { count: 1, xp: 50, badgeId: 'referral-1', label: 'Recruiter I', flair: 'Recruiter I' },
    { count: 3, xp: 150, badgeId: 'referral-3', label: 'Recruiter II', flair: 'Referral Flair' },
    { count: 5, xp: 300, badgeId: 'referral-5', label: 'Recruiter III', flair: 'Animated Recruiter' },
    { count: 10, xp: 600, badgeId: 'referral-10', label: 'Recruiter IV', flair: 'Referral Legend' },
    { count: 25, xp: 1500, badgeId: 'referral-25', label: 'Recruiter V', flair: 'Elite Recruiter' },
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
    tickHandle: null,
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

  function getLevelThresholds(targetLevel = 100) {
    const thresholds = [...LEVEL_SEED_THRESHOLDS];
    let previousIncrement = thresholds[thresholds.length - 1] - thresholds[thresholds.length - 2];

    while (thresholds.length < targetLevel) {
      previousIncrement = Math.max(100, Math.round((previousIncrement * 1.2) / 25) * 25);
      thresholds.push(thresholds[thresholds.length - 1] + previousIncrement);
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
    const activityBonusesClaimed = daily.activityBonusesClaimed && typeof daily.activityBonusesClaimed === 'object' ? daily.activityBonusesClaimed : {};
    const referralsRewarded = Array.isArray(referral.rewardedTiers) ? referral.rewardedTiers : [];
    const distinctDaysPlayed = Array.isArray(progression.distinctDaysPlayed) ? progression.distinctDaysPlayed : [];
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
        activityBonusesClaimed,
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
      if (safeProfile.progression.referral.qualifiedCount >= tier.count && !revoked.has(tier.badgeId)) {
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
          referrerProfile.progression.cosmetics.badges.push({
            id: tier.badgeId,
            label: tier.label,
            title: `${tier.count} qualified referrals`,
            emoji: '✧',
            assetPath: referrerProfile.progression.badgeAssets.referral[tier.badgeId] || '',
          });
          referrerProfile.progression.cosmetics.flair = tier.flair;
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

    DAILY_ACTIVITY_BONUSES.forEach((bonus) => {
      const activeMinutes = Math.floor((profile.progression.daily.activeSecondsByDay[dayKey] || 0) / 60);
      const claimedKey = `${dayKey}:${bonus.minutes}`;
      if (activeMinutes >= bonus.minutes && !profile.progression.daily.activityBonusesClaimed[claimedKey]) {
        profile.progression.daily.activityBonusesClaimed[claimedKey] = true;
        profile.progression.xp += bonus.xp;
      }
    });

    profiles[key] = profile;
    writeProfiles(profiles);
    maybeApplyReferralQualification(profile);
    emitProgressionChange(record, profile);
    return getProgressionSnapshot(record, profile);
  }

  function grantRoomXp(record, amount) {
    const created = getOrCreateProfile(record);
    if (!created) return null;
    const { key, profiles } = created;
    const profile = ensureProfileShape(profiles[key], record);
    const dayKey = getCurrentDateKey();
    const grantedToday = Math.max(0, Number(profile.progression.daily.roomXpByDay[dayKey]) || 0);
    const remaining = Math.max(0, ROOM_DAILY_CAP - grantedToday);
    const applied = Math.min(Math.max(0, Number(amount) || 0), remaining);
    if (!applied) return getProgressionSnapshot(record, profile);

    profile.progression.daily.roomXpByDay[dayKey] = grantedToday + applied;
    profile.progression.xp += applied;
    profiles[key] = profile;
    writeProfiles(profiles);
    emitProgressionChange(record, profile);
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
    const elapsedSinceInput = Date.now() - activityState.lastInputAt;
    if (elapsedSinceInput > IDLE_TIMEOUT_MS) return;

    const focusMultiplier = document.visibilityState === 'visible' && document.hasFocus() ? 1 : 0.5;
    const multiplayerBonus = isMultiplayerPage() ? MULTIPLAYER_XP_PER_MINUTE : 0;
    const minuteShare = ACTIVE_TICK_MS / 60000;
    const gainedXp = ((ACTIVE_XP_PER_MINUTE + multiplayerBonus) * minuteShare) * focusMultiplier;

    addActivitySeconds(record, ACTIVE_TICK_MS / 1000, { multiplayer: isMultiplayerPage() });
    awardXp(record, gainedXp, 'active-play');
  }

  function noteInputActivity() {
    activityState.lastInputAt = Date.now();
  }

  function startActivityTracking() {
    injectSharedStyles();
    captureReferralFromUrl();
    applyPendingReferralToCurrentUser();

    ['pointerdown', 'keydown', 'touchstart', 'mousedown', 'wheel', 'click'].forEach((eventName) => {
      window.addEventListener(eventName, noteInputActivity, { passive: true });
    });

    if (!activityState.tickHandle) {
      activityState.tickHandle = window.setInterval(handleActivityTick, ACTIVE_TICK_MS);
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
    grantRoomCreatedXp() {
      return grantRoomXp(getCurrentRecord(), 5);
    },
    grantRoomStartedXp(playerCount = 2) {
      const extraPlayers = Math.max(0, Number(playerCount) - 1);
      return grantRoomXp(getCurrentRecord(), 15 + (extraPlayers * 3));
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
