(function () {
  const FIREBASE_CONFIG = {
    apiKey: 'AIzaSyAIpLxF3vwcLL_aez4db2HlxkftJBkbTRE',
    authDomain: 'playr3.firebaseapp.com',
    projectId: 'playr3',
    storageBucket: 'playr3.firebasestorage.app',
    messagingSenderId: '784118485475',
    appId: '1:784118485475:web:5347f708718f56602fd0d6',
    measurementId: 'G-J4DKRFRX33',
  };
  const STORAGE_KEY = 'playr.draw-it.artworks.v1';
  const PROFILE_STORAGE_KEY = 'playrProfiles';
  const CUSTOM_BANNER_LIMIT = 5;
  const CUSTOM_BANNER_MODE = 'profile-banner';
  const MAX_RECENT_ARTWORKS = 10;
  const PROFILE_BANNER_SIZE = { width: 1500, height: 420 };
  const MODES = {
    'wallpaper-pc': { label: '16:9 wallpaper', width: 1600, height: 900, freeform: false },
    'wallpaper-phone': { label: '20:9 wallpaper', width: 900, height: 2000, freeform: false },
    'freeform': { label: 'Freeform', width: 1400, height: 900, freeform: true },
    'profile-banner': { label: 'Profile banner', width: PROFILE_BANNER_SIZE.width, height: PROFILE_BANNER_SIZE.height, freeform: false },
  };

  const state = {
    mode: 'wallpaper-pc',
    width: MODES['wallpaper-pc'].width,
    height: MODES['wallpaper-pc'].height,
    background: '#ffffff',
    brushColor: '#183a8f',
    brushSize: 8,
    drawing: false,
    pointerId: null,
    strokes: [],
    currentStroke: null,
    lastExport: null,
    hasUnsavedWork: false,
    pendingNavigationHref: '',
  };

  const stageShell = document.getElementById('drawStageShell');
  const canvas = document.getElementById('drawCanvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  const drawStatus = document.getElementById('drawStatus');
  const modeGrid = document.getElementById('modeGrid');
  const brushSizeInput = document.getElementById('brushSizeInput');
  const brushColorInput = document.getElementById('brushColorInput');
  const backgroundColorInput = document.getElementById('backgroundColorInput');
  const clearBtn = document.getElementById('clearBtn');
  const finishBtn = document.getElementById('finishBtn');
  const exportPanel = document.getElementById('exportPanel');
  const exportPreview = document.getElementById('exportPreview');
  const downloadBtn = document.getElementById('downloadBtn');
  const saveBannerBtn = document.getElementById('saveBannerBtn');
  const saveBannerHint = document.getElementById('saveBannerHint');
  const downloadFormatSelect = document.getElementById('downloadFormatSelect');
  const fileNameInput = document.getElementById('fileNameInput');
  const recentList = document.getElementById('recentList');
  const modeLabel = document.getElementById('modeLabel');
  const sizeLabel = document.getElementById('sizeLabel');
  const strokeCountLabel = document.getElementById('strokeCountLabel');
  const lastSavedLabel = document.getElementById('lastSavedLabel');
  const bannerModeNote = document.getElementById('bannerModeNote');
  const unsavedOverlay = document.getElementById('unsavedOverlay');
  const unsavedFormatSelect = document.getElementById('unsavedFormatSelect');
  const unsavedDownloadBtn = document.getElementById('unsavedDownloadBtn');
  const unsavedStayBtn = document.getElementById('unsavedStayBtn');
  const unsavedLeaveBtn = document.getElementById('unsavedLeaveBtn');

  function readJsonStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJsonStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function setStatus(message) {
    if (drawStatus) drawStatus.textContent = message;
  }

  function markUnsavedWork(nextValue = true) {
    state.hasUnsavedWork = Boolean(nextValue);
  }

  function getModeConfig(mode = state.mode) {
    return MODES[mode] || MODES['wallpaper-pc'];
  }

  function resizeCanvas(width, height) {
    canvas.width = width;
    canvas.height = height;
    state.width = width;
    state.height = height;
    redrawCanvas();
    updateMeta();
  }

  function redrawCanvas() {
    ctx.fillStyle = state.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    state.strokes.forEach((stroke) => {
      if (!stroke.points.length) return;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i += 1) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });
  }

  function updateMeta() {
    const mode = getModeConfig();
    modeLabel.textContent = mode.label;
    sizeLabel.textContent = `${state.width} x ${state.height}`;
    strokeCountLabel.textContent = String(state.strokes.length);
    bannerModeNote.hidden = state.mode !== CUSTOM_BANNER_MODE;
    saveBannerBtn.hidden = state.mode !== CUSTOM_BANNER_MODE || !state.lastExport;
    saveBannerHint.hidden = state.mode !== CUSTOM_BANNER_MODE || !state.lastExport;
  }

  function createSvgExportData() {
    const pngData = canvas.toDataURL('image/png', 0.92);
    const safeWidth = Math.max(1, canvas.width);
    const safeHeight = Math.max(1, canvas.height);
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${safeWidth}" height="${safeHeight}" viewBox="0 0 ${safeWidth} ${safeHeight}">
        <image href="${pngData}" width="${safeWidth}" height="${safeHeight}" preserveAspectRatio="none"/>
      </svg>`,
    )}`;
  }

  function switchMode(mode) {
    const config = getModeConfig(mode);
    state.mode = mode;
    state.strokes = [];
    state.currentStroke = null;
    state.lastExport = null;
    markUnsavedWork(false);
    closeUnsavedOverlay();
    exportPanel.hidden = true;
    resizeCanvas(config.width, config.height);
    modeGrid.querySelectorAll('[data-mode]').forEach((button) => {
      button.classList.toggle('active', button.getAttribute('data-mode') === mode);
    });
    setStatus(`${config.label} ready. Start drawing.`);
    updateMeta();
  }

  function getCanvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function maybeExpandFreeform(point) {
    if (!getModeConfig().freeform) return;
    const margin = 80;
    let nextWidth = canvas.width;
    let nextHeight = canvas.height;
    if (point.x > canvas.width - margin) nextWidth += 280;
    if (point.y > canvas.height - margin) nextHeight += 220;
    if (nextWidth === canvas.width && nextHeight === canvas.height) return;
    const snapshot = document.createElement('canvas');
    snapshot.width = canvas.width;
    snapshot.height = canvas.height;
    snapshot.getContext('2d').drawImage(canvas, 0, 0);
    canvas.width = nextWidth;
    canvas.height = nextHeight;
    state.width = nextWidth;
    state.height = nextHeight;
    ctx.fillStyle = state.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(snapshot, 0, 0);
    updateMeta();
  }

  function beginStroke(event) {
    const point = getCanvasPoint(event);
    state.drawing = true;
    state.pointerId = event.pointerId;
    state.currentStroke = {
      color: state.brushColor,
      size: state.brushSize,
      points: [point],
    };
    state.strokes.push(state.currentStroke);
    markUnsavedWork(true);
    canvas.setPointerCapture(event.pointerId);
    redrawCanvas();
  }

  function extendStroke(event) {
    if (!state.drawing || state.pointerId !== event.pointerId || !state.currentStroke) return;
    const point = getCanvasPoint(event);
    maybeExpandFreeform(point);
    state.currentStroke.points.push(point);
    const points = state.currentStroke.points;
    const last = points[points.length - 2];
    ctx.strokeStyle = state.currentStroke.color;
    ctx.lineWidth = state.currentStroke.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  }

  function endStroke(event) {
    if (!state.drawing || state.pointerId !== event.pointerId) return;
    state.drawing = false;
    state.pointerId = null;
    state.currentStroke = null;
    updateMeta();
  }

  function clearCanvas() {
    state.strokes = [];
    state.currentStroke = null;
    state.lastExport = null;
    exportPanel.hidden = true;
    markUnsavedWork(false);
    redrawCanvas();
    updateMeta();
    setStatus('Canvas cleared.');
  }

  function createExportData(format = 'png') {
    if (format === 'svg') {
      return createSvgExportData();
    }
    const mimeType = format === 'jpeg'
      ? 'image/jpeg'
      : format === 'webp'
        ? 'image/webp'
        : 'image/png';
    return canvas.toDataURL(mimeType, 0.92);
  }

  function persistRecentArtwork(entry) {
    const existing = readJsonStorage(STORAGE_KEY, []);
    const next = [entry, ...existing].slice(0, MAX_RECENT_ARTWORKS);
    writeJsonStorage(STORAGE_KEY, next);
    lastSavedLabel.textContent = new Date(entry.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    renderRecentArtworks();
  }

  function finishDrawing() {
    if (!state.strokes.length) {
      setStatus('Draw something first.');
      return;
    }
    const dataUrl = createExportData('png');
    state.lastExport = {
      mode: state.mode,
      width: canvas.width,
      height: canvas.height,
      dataUrl,
      createdAt: Date.now(),
    };
    exportPreview.src = dataUrl;
    exportPanel.hidden = false;
    saveBannerBtn.hidden = state.mode !== CUSTOM_BANNER_MODE;
    saveBannerHint.hidden = state.mode !== CUSTOM_BANNER_MODE;
    persistRecentArtwork({
      id: `art-${Date.now()}`,
      mode: state.mode,
      width: canvas.width,
      height: canvas.height,
      dataUrl,
      createdAt: Date.now(),
    });
    updateMeta();
    setStatus('Drawing finished. Preview ready.');
  }

  function downloadCurrentArtwork() {
    if (!state.lastExport && !state.strokes.length) {
      setStatus('Finish the drawing first.');
      return;
    }
    const format = downloadFormatSelect.value || 'png';
    const dataUrl = createExportData(format);
    const fileName = (fileNameInput.value || 'playr-draw-it').trim().replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '') || 'playr-draw-it';
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${fileName}.${format === 'jpeg' ? 'jpg' : format}`;
    link.click();
    markUnsavedWork(false);
    setStatus(`Downloaded ${link.download}.`);
  }

  function downloadUnsavedArtwork() {
    if (!state.strokes.length) return;
    const format = unsavedFormatSelect.value || 'png';
    const previous = downloadFormatSelect.value;
    downloadFormatSelect.value = format;
    downloadCurrentArtwork();
    downloadFormatSelect.value = previous;
  }

  function renderRecentArtworks() {
    const recent = readJsonStorage(STORAGE_KEY, []);
    if (!recent.length) {
      recentList.innerHTML = '<p class="draw-note">Your finished drawings will appear here.</p>';
      return;
    }
    recentList.innerHTML = recent.map((entry) => `
      <article class="recent-item">
        <img src="${entry.dataUrl}" alt="${entry.mode} drawing preview" />
        <div>
          <strong>${getModeConfig(entry.mode).label}</strong>
          <span class="draw-note">${entry.width} x ${entry.height}</span>
        </div>
      </article>
    `).join('');
  }

  async function getFirebaseTools() {
    if (!window.firebase?.initializeApp || !window.firebase?.auth || !window.firebase?.firestore) return null;
    const app = window.firebase.apps?.length ? window.firebase.app() : window.firebase.initializeApp(FIREBASE_CONFIG);
    const auth = window.firebase.auth(app);
    const db = window.firebase.firestore(app);
    try {
      db.settings({ experimentalForceLongPolling: true, useFetchStreams: false });
    } catch {
      // Settings may already be locked in.
    }
    return { auth, db };
  }

  function readLegacyAccount() {
    try {
      return JSON.parse(localStorage.getItem('playrCurrentUser') || 'null');
    } catch {
      return null;
    }
  }

  function readProfiles() {
    return readJsonStorage(PROFILE_STORAGE_KEY, {});
  }

  function writeProfiles(profiles) {
    writeJsonStorage(PROFILE_STORAGE_KEY, profiles);
  }

  function saveBannerLocally(bannerEntry) {
    const legacyUser = readLegacyAccount();
    const uid = String(legacyUser?.uid || '').trim();
    if (!uid) {
      return { ok: false, reason: 'Log in on PlayR first to save banner art to your account.' };
    }
    const profiles = readProfiles();
    const profile = profiles[uid] && typeof profiles[uid] === 'object' ? profiles[uid] : { uid, displayName: legacyUser.displayName || 'Player' };
    const profileTheme = profile.profileTheme && typeof profile.profileTheme === 'object' ? profile.profileTheme : {};
    const customBanners = Array.isArray(profileTheme.customBanners) ? profileTheme.customBanners.slice(0, CUSTOM_BANNER_LIMIT) : [];
    if (customBanners.length >= CUSTOM_BANNER_LIMIT) {
      return { ok: false, reason: `You already have ${CUSTOM_BANNER_LIMIT} custom banners saved. Delete one in Settings first.` };
    }
    customBanners.push(bannerEntry);
    profiles[uid] = {
      ...profile,
      profileTheme: {
        ...profileTheme,
        customBanners,
      },
      updatedAt: Date.now(),
    };
    writeProfiles(profiles);
    return { ok: true, uid, displayName: profiles[uid].displayName || 'Player' };
  }

  async function syncBannerToCloud(uid, bannerEntry) {
    const tools = await getFirebaseTools();
    if (!tools) return { ok: false, reason: 'Cloud sync is unavailable in this browser.' };
    const currentUser = tools.auth.currentUser || await new Promise((resolve) => {
      const unsubscribe = tools.auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
      setTimeout(() => resolve(null), 1800);
    });
    if (!currentUser || currentUser.uid !== uid) {
      return { ok: false, reason: 'Banner saved locally. Open the home page while logged in to finish cloud sync.' };
    }
    const profileRef = tools.db.collection('userProfiles').doc(uid);
    const snapshot = await profileRef.get();
    const data = snapshot.exists ? (snapshot.data() || {}) : {};
    const profileTheme = data.profileTheme && typeof data.profileTheme === 'object' ? data.profileTheme : {};
    const current = Array.isArray(profileTheme.customBanners) ? profileTheme.customBanners.slice(0, CUSTOM_BANNER_LIMIT) : [];
    if (current.length >= CUSTOM_BANNER_LIMIT && !current.some((entry) => entry && entry.id === bannerEntry.id)) {
      return { ok: false, reason: `Banner saved locally, but cloud storage already has ${CUSTOM_BANNER_LIMIT} custom banners.` };
    }
    const next = [...current.filter((entry) => entry && entry.id !== bannerEntry.id), bannerEntry].slice(0, CUSTOM_BANNER_LIMIT);
    await profileRef.set({
      profileTheme: {
        ...profileTheme,
        customBanners: next,
      },
      updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    return { ok: true };
  }

  async function saveCurrentAsCustomBanner() {
    if (!state.lastExport || state.mode !== CUSTOM_BANNER_MODE) {
      setStatus('Switch to profile banner mode and finish a drawing first.');
      return;
    }
    const bannerEntry = {
      id: `custom-banner-${Date.now()}`,
      label: `Draw It banner ${new Date().toLocaleDateString('en-US')}`,
      dataUrl: state.lastExport.dataUrl,
      width: state.lastExport.width,
      height: state.lastExport.height,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const localResult = saveBannerLocally(bannerEntry);
    if (!localResult.ok) {
      setStatus(localResult.reason);
      return;
    }
    markUnsavedWork(false);
    setStatus('Custom banner saved to your account. Applying it later is a VIP-only option in Settings.');
    try {
      const cloudResult = await syncBannerToCloud(localResult.uid, bannerEntry);
      if (!cloudResult.ok) {
        setStatus(cloudResult.reason);
        return;
      }
      setStatus('Custom banner saved to your account and synced to cloud.');
    } catch {
      setStatus('Custom banner saved locally. Open the home page while logged in to finish cloud sync.');
    }
  }

  function openUnsavedOverlay(href = '') {
    if (!unsavedOverlay) return false;
    state.pendingNavigationHref = String(href || '').trim();
    unsavedOverlay.hidden = false;
    return true;
  }

  function closeUnsavedOverlay() {
    if (!unsavedOverlay) return;
    state.pendingNavigationHref = '';
    unsavedOverlay.hidden = true;
  }

  function leaveAfterUnsavedPrompt() {
    const href = state.pendingNavigationHref;
    closeUnsavedOverlay();
    if (href) {
      window.location.href = href;
    }
  }

  modeGrid?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-mode]');
    if (!button) return;
    switchMode(button.getAttribute('data-mode') || 'wallpaper-pc');
  });

  brushSizeInput?.addEventListener('input', () => {
    state.brushSize = Math.max(1, Number(brushSizeInput.value) || 8);
  });

  brushColorInput?.addEventListener('input', () => {
    state.brushColor = brushColorInput.value || '#183a8f';
  });

  backgroundColorInput?.addEventListener('input', () => {
    state.background = backgroundColorInput.value || '#ffffff';
    redrawCanvas();
  });

  clearBtn?.addEventListener('click', clearCanvas);
  finishBtn?.addEventListener('click', finishDrawing);
  downloadBtn?.addEventListener('click', downloadCurrentArtwork);
  saveBannerBtn?.addEventListener('click', () => {
    void saveCurrentAsCustomBanner();
  });

  unsavedDownloadBtn?.addEventListener('click', downloadUnsavedArtwork);
  unsavedStayBtn?.addEventListener('click', closeUnsavedOverlay);
  unsavedLeaveBtn?.addEventListener('click', leaveAfterUnsavedPrompt);

  canvas.addEventListener('pointerdown', beginStroke);
  canvas.addEventListener('pointermove', extendStroke);
  canvas.addEventListener('pointerup', endStroke);
  canvas.addEventListener('pointercancel', endStroke);
  canvas.addEventListener('pointerleave', endStroke);

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    if (!state.hasUnsavedWork || !href || href.startsWith('#')) return;
    const resolved = new URL(href, window.location.href);
    if (resolved.href === window.location.href) return;
    event.preventDefault();
    openUnsavedOverlay(resolved.href);
  });

  window.addEventListener('beforeunload', (event) => {
    if (!state.hasUnsavedWork) return;
    event.preventDefault();
    event.returnValue = '';
  });

  switchMode(state.mode);
  redrawCanvas();
  renderRecentArtworks();
  stageShell.scrollTop = 0;
})();
