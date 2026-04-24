(function () {
  const ADSENSE_SCRIPT_ID = 'playr-adsense-loader';
  const ADSENSE_SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5070133200721707';
  const PROFILE_STORAGE_KEY = 'playrProfiles';
  const LEGACY_USER_STORAGE_KEY = 'playrCurrentUser';
  const TRUSTED_VIP_IDENTIFIERS = new Set(['owner@playr.io']);

  function normalizeIdentifier(value) {
    return String(value || '').trim().toLowerCase();
  }

  function normalizeRole(role) {
    return String(role || '').trim().toLowerCase();
  }

  function readJsonStorage(key) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
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

  function isVipRecord(record) {
    if (!record) return false;

    const roles = buildRoles(record);
    if (roles.includes('vip')) {
      return true;
    }

    const profiles = readJsonStorage(PROFILE_STORAGE_KEY);
    if (!profiles || typeof profiles !== 'object') {
      return false;
    }

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

  window.addEventListener('playr-auth-changed', refreshAdsState);
  window.addEventListener('storage', (event) => {
    if (event.key === PROFILE_STORAGE_KEY || event.key === LEGACY_USER_STORAGE_KEY) {
      refreshAdsState();
    }
  });
})();
