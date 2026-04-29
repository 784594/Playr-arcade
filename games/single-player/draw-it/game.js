(function () {
  const DRAW_STORAGE_KEY = 'playrDrawItRecentV2';
  const DRAW_UNSAVED_KEY = 'playrDrawItDraftV2';
  const PROFILE_STORAGE_KEY = 'playrProfiles';
  const LEGACY_USER_STORAGE_KEY = 'playrCurrentUser';
  const CUSTOM_PROFILE_BANNER_LIMIT = 5;
  const FIREBASE_CONFIG = {
    apiKey: 'AIzaSyAIpLxF3vwcLL_aez4db2HlxkftJBkbTRE',
    authDomain: 'playr3.firebaseapp.com',
    projectId: 'playr3',
    storageBucket: 'playr3.firebasestorage.app',
    messagingSenderId: '8064842344',
    appId: '1:8064842344:web:0f4f37804e3f5372d9b91a',
  };
  const MODE_CONFIG = {
    'wallpaper-pc': { label: '16:9 wallpaper', width: 1600, height: 900 },
    'wallpaper-phone': { label: '20:9 wallpaper', width: 1400, height: 630 },
    'freeform': { label: 'Freeform', width: 1400, height: 900 },
    'profile-banner': { label: 'Profile banner', width: 1500, height: 420 },
  };
  const POINTER_EDGE_EXPAND_MARGIN = 90;
  const FREEFORM_EXPAND_BY = 220;
  const MAX_RECENT_DRAWS = 10;

  const state = {
    mode: 'wallpaper-pc',
    tool: 'brush',
    canvasWidth: MODE_CONFIG['wallpaper-pc'].width,
    canvasHeight: MODE_CONFIG['wallpaper-pc'].height,
    currentStroke: null,
    objects: [],
    selectedIds: new Set(),
    dragging: null,
    strokeGradientStops: [
      { id: 'stroke-stop-1', offset: 0, color: '#183a8f' },
      { id: 'stroke-stop-2', offset: 1, color: '#7cf0c5' },
    ],
    activeStrokeStopId: 'stroke-stop-1',
    background: {
      mode: 'solid',
      color: '#ffffff',
      angle: 135,
      stops: [
        { id: 'bg-stop-1', offset: 0, color: '#ffffff' },
        { id: 'bg-stop-2', offset: 1, color: '#dce8ff' },
      ],
    },
    exportDataUrl: '',
    exportMime: 'image/png',
    finishOpen: false,
    pendingHref: '',
    hasUnsavedWork: false,
    lastSavedAt: 0,
    currentUser: null,
    firebaseApp: null,
    firebaseAuth: null,
    firestore: null,
  };

  const ui = {};

  function $(id) {
    return document.getElementById(id);
  }

  function safeNow() {
    return Date.now();
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function normalizeHex(value, fallback = '#183a8f') {
    const safe = String(value || '').trim();
    return /^#[0-9a-f]{6}$/i.test(safe) ? safe : fallback;
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
      .slice(0, 32) || 'playr-draw-it';
  }

  function uid(prefix = 'draw') {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${safeNow().toString(36)}`;
  }

  function readJson(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function readProfiles() {
    return readJson(PROFILE_STORAGE_KEY, {}) || {};
  }

  function getLocalCurrentUser() {
    const legacy = readJson(LEGACY_USER_STORAGE_KEY, null);
    if (legacy && legacy.uid) {
      return {
        uid: String(legacy.uid),
        displayName: String(legacy.displayName || 'Player').slice(0, 24),
        identifier: String(legacy.identifier || legacy.uid),
        identifierType: String(legacy.identifierType || 'uid'),
      };
    }
    return null;
  }

  function getCurrentAccount() {
    const local = state.currentUser || getLocalCurrentUser();
    if (!local?.uid) return null;
    const profiles = readProfiles();
    const stored = profiles[local.uid] || {};
    return {
      uid: String(local.uid),
      displayName: String(stored.displayName || local.displayName || 'Player').slice(0, 24),
      identifier: String(stored.identifier || local.identifier || local.uid),
      identifierType: String(stored.identifierType || local.identifierType || 'uid'),
      isVip: Boolean(stored.isVip || (Array.isArray(stored.roles) && stored.roles.includes('vip'))),
      referralCount: Math.max(0, Number(stored?.progression?.referral?.qualifiedCount) || 0),
      profileTheme: stored.profileTheme || null,
    };
  }

  function ensureFirebase() {
    if (!window.firebase?.initializeApp) return;
    try {
      state.firebaseApp = window.firebase.apps?.length
        ? window.firebase.app()
        : window.firebase.initializeApp(FIREBASE_CONFIG);
      state.firebaseAuth = window.firebase.auth ? window.firebase.auth() : null;
      state.firestore = window.firebase.firestore ? window.firebase.firestore() : null;
      if (state.firebaseAuth) {
        state.firebaseAuth.onAuthStateChanged((user) => {
          if (!user) {
            state.currentUser = getLocalCurrentUser();
            return;
          }
          state.currentUser = {
            uid: user.uid,
            displayName: String(user.displayName || getLocalCurrentUser()?.displayName || 'Player').slice(0, 24),
            identifier: String(user.email || user.phoneNumber || user.uid),
            identifierType: user.email ? 'email' : (user.phoneNumber ? 'phone' : 'uid'),
          };
        });
      }
    } catch {
      state.currentUser = getLocalCurrentUser();
    }
  }

  function getCanvasPoint(event) {
    const rect = ui.canvas.getBoundingClientRect();
    const scaleX = state.canvasWidth / rect.width;
    const scaleY = state.canvasHeight / rect.height;
    const clientX = event.clientX ?? (event.touches && event.touches[0]?.clientX) ?? 0;
    const clientY = event.clientY ?? (event.touches && event.touches[0]?.clientY) ?? 0;
    return {
      x: clamp((clientX - rect.left) * scaleX, 0, state.canvasWidth),
      y: clamp((clientY - rect.top) * scaleY, 0, state.canvasHeight),
    };
  }

  function createStrokeStyle() {
    const strokeStops = getStrokeGradientStops();
    return {
      mode: ui.strokeModeSelect.value === 'gradient' ? 'gradient' : 'solid',
      colorA: normalizeHex(ui.brushColorInput.value, '#183a8f'),
      colorB: normalizeHex(strokeStops[strokeStops.length - 1]?.color, '#7cf0c5'),
      angle: clamp(Number(ui.strokeAngleInput.value) || 35, 0, 360),
      stops: strokeStops,
    };
  }

  function getDrawingMode() {
    return ui.drawingModeSelect?.value === 'pixel' ? 'pixel' : 'freehand';
  }

  function getModeConfig(mode = state.mode) {
    return MODE_CONFIG[mode] || MODE_CONFIG['wallpaper-pc'];
  }

  function markDirty() {
    state.hasUnsavedWork = true;
    persistDraft();
    updateMeta();
  }

  function clearDirty() {
    state.hasUnsavedWork = false;
    try {
      window.localStorage.removeItem(DRAW_UNSAVED_KEY);
    } catch {}
    updateMeta();
  }

  function snapshotState() {
    return {
      mode: state.mode,
      canvasWidth: state.canvasWidth,
      canvasHeight: state.canvasHeight,
      tool: state.tool,
      background: structuredClone(state.background),
      objects: state.objects.map((item) => ({
        ...item,
        imageEl: undefined,
      })),
      lastSavedAt: state.lastSavedAt,
    };
  }

  function structuredClone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function persistDraft() {
    const draft = snapshotState();
    writeJson(DRAW_UNSAVED_KEY, draft);
  }

  function loadDraft() {
    const draft = readJson(DRAW_UNSAVED_KEY, null);
    if (!draft || typeof draft !== 'object' || !draft.mode || !Array.isArray(draft.objects)) return false;
    state.mode = MODE_CONFIG[draft.mode] ? draft.mode : 'wallpaper-pc';
    state.canvasWidth = Math.max(300, Number(draft.canvasWidth) || getModeConfig(state.mode).width);
    state.canvasHeight = Math.max(220, Number(draft.canvasHeight) || getModeConfig(state.mode).height);
    state.tool = String(draft.tool || 'brush');
    state.background = sanitizeBackground(draft.background);
    state.objects = draft.objects.map(sanitizeObject).filter(Boolean);
    state.lastSavedAt = Math.max(0, Number(draft.lastSavedAt) || 0);
    state.hasUnsavedWork = state.objects.length > 0;
    return true;
  }

  function sanitizeBackground(value) {
    const safe = value && typeof value === 'object' ? value : {};
    const stops = Array.isArray(safe.stops) ? safe.stops : [];
    return {
      mode: safe.mode === 'gradient' ? 'gradient' : 'solid',
      color: normalizeHex(safe.color, '#ffffff'),
      angle: clamp(Number(safe.angle) || 135, 0, 360),
      stops: stops.length
        ? stops.map((stop, index) => ({
            id: String(stop?.id || uid(`bg-stop-${index + 1}`)),
            offset: clamp(Number(stop?.offset) || 0, 0, 1),
            color: normalizeHex(stop?.color, '#ffffff'),
          })).sort((a, b) => a.offset - b.offset)
        : [
            { id: uid('bg-stop'), offset: 0, color: '#ffffff' },
            { id: uid('bg-stop'), offset: 1, color: '#dce8ff' },
          ],
    };
  }

  function sanitizeObject(item) {
    if (!item || typeof item !== 'object') return null;
    if (item.type === 'stroke') {
      return {
        id: String(item.id || uid('stroke')),
        type: 'stroke',
        points: Array.isArray(item.points) ? item.points.map((point) => ({
          x: Number(point?.x) || 0,
          y: Number(point?.y) || 0,
        })).filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y)) : [],
        size: clamp(Number(item.size) || 8, 1, 80),
        erase: Boolean(item.erase),
        drawMode: item.drawMode === 'pixel' ? 'pixel' : 'freehand',
        groupId: item.groupId ? String(item.groupId) : '',
        style: {
          mode: item.style?.mode === 'gradient' ? 'gradient' : 'solid',
          colorA: normalizeHex(item.style?.colorA, '#183a8f'),
          colorB: normalizeHex(item.style?.colorB, '#7cf0c5'),
          angle: clamp(Number(item.style?.angle) || 35, 0, 360),
          stops: normalizeGradientStops(item.style?.stops, [
            { id: uid('stroke-stop'), offset: 0, color: normalizeHex(item.style?.colorA, '#183a8f') },
            { id: uid('stroke-stop'), offset: 1, color: normalizeHex(item.style?.colorB, '#7cf0c5') },
          ]),
        },
      };
    }
    if (item.type === 'image' && String(item.src || '').startsWith('data:image/')) {
      return {
        id: String(item.id || uid('image')),
        type: 'image',
        src: String(item.src),
        x: Number(item.x) || 0,
        y: Number(item.y) || 0,
        width: Math.max(10, Number(item.width) || 200),
        height: Math.max(10, Number(item.height) || 200),
        baseWidth: Math.max(10, Number(item.baseWidth) || Number(item.width) || 200),
        baseHeight: Math.max(10, Number(item.baseHeight) || Number(item.height) || 200),
        scale: clamp(Number(item.scale) || 100, 20, 250),
        groupId: item.groupId ? String(item.groupId) : '',
        imageEl: null,
      };
    }
    return null;
  }

  function normalizeGradientStops(stops, fallbackStops = []) {
    const source = Array.isArray(stops) && stops.length ? stops : fallbackStops;
    const normalized = source
      .map((stop, index) => ({
        id: String(stop?.id || uid(`gradient-stop-${index + 1}`)),
        offset: clamp(Number(stop?.offset) || 0, 0, 1),
        color: normalizeHex(stop?.color, '#183a8f'),
      }))
      .sort((left, right) => left.offset - right.offset);
    if (normalized.length >= 2) return normalized;
    return [
      { id: uid('gradient-stop'), offset: 0, color: '#183a8f' },
      { id: uid('gradient-stop'), offset: 1, color: '#7cf0c5' },
    ];
  }

  function getStrokeGradientStops() {
    state.strokeGradientStops = normalizeGradientStops(state.strokeGradientStops, state.strokeGradientStops);
    return state.strokeGradientStops;
  }

  function preloadImages() {
    const promises = state.objects
      .filter((item) => item.type === 'image' && item.src && !item.imageEl)
      .map((item) => new Promise((resolve) => {
        const image = new Image();
        image.onload = () => {
          item.imageEl = image;
          resolve();
        };
        image.onerror = () => resolve();
        image.src = item.src;
      }));
    return Promise.all(promises);
  }

  function renderBackground(context, width, height) {
    if (state.background.mode === 'gradient') {
      const gradient = createLinearGradient(
        context,
        0,
        0,
        width,
        height,
        state.background.angle,
      );
      const stops = state.background.stops.length ? state.background.stops : [
        { offset: 0, color: state.background.color },
        { offset: 1, color: '#dce8ff' },
      ];
      stops
        .slice()
        .sort((a, b) => a.offset - b.offset)
        .forEach((stop) => gradient.addColorStop(clamp(stop.offset, 0, 1), normalizeHex(stop.color, '#ffffff')));
      context.fillStyle = gradient;
    } else {
      context.fillStyle = normalizeHex(state.background.color, '#ffffff');
    }
    context.fillRect(0, 0, width, height);
  }

  function createLinearGradient(context, x, y, width, height, angleDegrees) {
    const radians = (angleDegrees * Math.PI) / 180;
    const centerX = x + (width / 2);
    const centerY = y + (height / 2);
    const radius = Math.max(width, height) / 2;
    const dx = Math.cos(radians) * radius;
    const dy = Math.sin(radians) * radius;
    return context.createLinearGradient(centerX - dx, centerY - dy, centerX + dx, centerY + dy);
  }

  function getStrokeBounds(stroke) {
    const xs = stroke.points.map((point) => point.x);
    const ys = stroke.points.map((point) => point.y);
    if (!xs.length || !ys.length) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    const pad = stroke.size / 2 + 6;
    const minX = Math.min(...xs) - pad;
    const maxX = Math.max(...xs) + pad;
    const minY = Math.min(...ys) - pad;
    const maxY = Math.max(...ys) + pad;
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  function snapPixelPoint(point, brushSize) {
    const step = Math.max(2, Math.round(Number(brushSize) || 8));
    return {
      x: Math.floor(point.x / step) * step,
      y: Math.floor(point.y / step) * step,
    };
  }

  function appendPixelPoints(stroke, nextPoint) {
    const step = Math.max(2, Math.round(stroke.size));
    const snapped = snapPixelPoint(nextPoint, step);
    const lastPoint = stroke.points[stroke.points.length - 1];
    if (!lastPoint) {
      stroke.points.push(snapped);
      return;
    }
    const startX = Math.round(lastPoint.x / step);
    const startY = Math.round(lastPoint.y / step);
    const endX = Math.round(snapped.x / step);
    const endY = Math.round(snapped.y / step);
    const dx = Math.abs(endX - startX);
    const dy = Math.abs(endY - startY);
    const sx = startX < endX ? 1 : -1;
    const sy = startY < endY ? 1 : -1;
    let error = dx - dy;
    let x = startX;
    let y = startY;
    while (x !== endX || y !== endY) {
      const doubledError = error * 2;
      if (doubledError > -dy) {
        error -= dy;
        x += sx;
      }
      if (doubledError < dx) {
        error += dx;
        y += sy;
      }
      const candidate = { x: x * step, y: y * step };
      const previous = stroke.points[stroke.points.length - 1];
      if (!previous || previous.x !== candidate.x || previous.y !== candidate.y) {
        stroke.points.push(candidate);
      }
    }
  }

  function getObjectBounds(item) {
    if (!item) return { x: 0, y: 0, width: 0, height: 0 };
    if (item.type === 'image') {
      return { x: item.x, y: item.y, width: item.width, height: item.height };
    }
    return getStrokeBounds(item);
  }

  function renderStroke(context, stroke) {
    if (!Array.isArray(stroke.points) || !stroke.points.length) return;
    context.save();
    if (stroke.erase) {
      context.globalCompositeOperation = 'destination-out';
    }
    if (stroke.style.mode === 'gradient') {
      const bounds = getStrokeBounds(stroke);
      const gradient = createLinearGradient(
        context,
        bounds.x,
        bounds.y,
        Math.max(bounds.width, 1),
        Math.max(bounds.height, 1),
        stroke.style.angle,
      );
      normalizeGradientStops(stroke.style.stops, [
        { id: uid('fallback-stop'), offset: 0, color: normalizeHex(stroke.style.colorA, '#183a8f') },
        { id: uid('fallback-stop'), offset: 1, color: normalizeHex(stroke.style.colorB, '#7cf0c5') },
      ]).forEach((stop) => {
        gradient.addColorStop(clamp(stop.offset, 0, 1), normalizeHex(stop.color, '#183a8f'));
      });
      context.strokeStyle = gradient;
      context.fillStyle = gradient;
    } else {
      const solidColor = normalizeHex(stroke.style.colorA, '#183a8f');
      context.strokeStyle = solidColor;
      context.fillStyle = solidColor;
    }
    if (stroke.drawMode === 'pixel') {
      const pixelSize = Math.max(2, Math.round(stroke.size));
      stroke.points.forEach((point) => {
        context.fillRect(point.x, point.y, pixelSize, pixelSize);
      });
    } else {
      context.lineJoin = 'round';
      context.lineCap = 'round';
      context.lineWidth = stroke.size;
      context.beginPath();
      context.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let index = 1; index < stroke.points.length; index += 1) {
        const point = stroke.points[index];
        context.lineTo(point.x, point.y);
      }
      if (stroke.points.length === 1) {
        context.lineTo(stroke.points[0].x + 0.01, stroke.points[0].y + 0.01);
      }
      context.stroke();
    }
    context.restore();
  }

  function renderImageObject(context, item) {
    if (!item.imageEl) return;
    context.drawImage(item.imageEl, item.x, item.y, item.width, item.height);
  }

  function getSelectionBounds() {
    const items = state.objects.filter((item) => state.selectedIds.has(item.id));
    if (!items.length) return null;
    const bounds = items.map(getObjectBounds);
    return {
      x: Math.min(...bounds.map((entry) => entry.x)),
      y: Math.min(...bounds.map((entry) => entry.y)),
      width: Math.max(...bounds.map((entry) => entry.x + entry.width)) - Math.min(...bounds.map((entry) => entry.x)),
      height: Math.max(...bounds.map((entry) => entry.y + entry.height)) - Math.min(...bounds.map((entry) => entry.y)),
    };
  }

  function drawSelectionOverlay(context) {
    const bounds = getSelectionBounds();
    if (!bounds) return;
    context.save();
    context.strokeStyle = 'rgba(74, 128, 245, 0.95)';
    context.fillStyle = 'rgba(124, 240, 197, 0.08)';
    context.lineWidth = 2;
    context.setLineDash([10, 8]);
    context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    context.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    context.restore();
  }

  function renderScene(targetContext = ui.context, { includeSelection = true } = {}) {
    if (targetContext === ui.context) {
      if (ui.canvas.width !== state.canvasWidth) ui.canvas.width = state.canvasWidth;
      if (ui.canvas.height !== state.canvasHeight) ui.canvas.height = state.canvasHeight;
      ui.canvas.style.aspectRatio = `${state.canvasWidth} / ${state.canvasHeight}`;
    }
    targetContext.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
    renderBackground(targetContext, state.canvasWidth, state.canvasHeight);
    state.objects.forEach((item) => {
      if (item.type === 'image') {
        renderImageObject(targetContext, item);
      } else {
        renderStroke(targetContext, item);
      }
    });
    if (includeSelection) {
      drawSelectionOverlay(targetContext);
    }
  }

  function updateCanvasCursor() {
    const cursor = {
      brush: 'crosshair',
      eraser: 'cell',
      select: 'pointer',
      move: state.selectedIds.size ? 'grab' : 'pointer',
      fill: 'copy',
      image: 'pointer',
    }[state.tool] || 'crosshair';
    ui.canvas.style.cursor = cursor;
  }

  function syncStrokeUiFromState() {
    if (ui.brushColorInput) {
      const firstStop = getStrokeGradientStops()[0];
      ui.brushColorInput.value = normalizeHex(firstStop?.color, '#183a8f');
    }
    if (ui.selectedStrokeStopColorInput) {
      const activeStop = getStrokeGradientStops().find((stop) => stop.id === state.activeStrokeStopId) || getStrokeGradientStops()[0];
      if (activeStop) {
        state.activeStrokeStopId = activeStop.id;
        ui.selectedStrokeStopColorInput.value = normalizeHex(activeStop.color, '#183a8f');
      }
    }
  }

  function updateStrokeModeUi() {
    const isGradient = ui.strokeModeSelect.value === 'gradient';
    if (ui.strokeSolidColorField) ui.strokeSolidColorField.hidden = isGradient;
    if (ui.strokeGradientEditor) ui.strokeGradientEditor.hidden = !isGradient;
    syncStrokeUiFromState();
    renderStrokeStops();
  }

  function updateBackgroundModeUi() {
    const isGradient = ui.backgroundModeSelect.value === 'gradient';
    if (ui.backgroundAngleField) ui.backgroundAngleField.hidden = !isGradient;
    if (ui.backgroundStopsList) ui.backgroundStopsList.hidden = !isGradient;
    if (ui.backgroundStopActions) ui.backgroundStopActions.hidden = !isGradient;
  }

  function setTool(tool) {
    state.tool = tool;
    Array.from(ui.toolButtons.querySelectorAll('button')).forEach((button) => {
      const isActive = button.getAttribute('data-tool') === tool;
      button.classList.toggle('is-active', isActive);
      button.classList.toggle('action-btn-primary', isActive);
    });
    updateCanvasCursor();
    updateStatus();
  }

  function setMode(mode, { preserveObjects = true, markChanged = true } = {}) {
    const config = getModeConfig(mode);
    state.mode = mode;
    state.canvasWidth = config.width;
    state.canvasHeight = config.height;
    if (!preserveObjects && mode !== 'freeform') {
      state.objects = [];
      state.selectedIds.clear();
    }
    Array.from(ui.modeGrid.querySelectorAll('button')).forEach((button) => {
      button.classList.toggle('active', button.getAttribute('data-mode') === mode);
    });
    ui.bannerModeNote.hidden = mode !== 'profile-banner';
    ui.saveBannerBtn.hidden = !state.finishOpen || mode !== 'profile-banner';
    ui.saveBannerHint.hidden = mode !== 'profile-banner';
    renderBackgroundStops();
    renderScene();
    updateMeta();
    updateStatus();
    if (markChanged) {
      markDirty();
    }
  }

  function updateStatus(text) {
    const fallback = {
      brush: 'Brush on the canvas to draw strokes.',
      eraser: 'Erase parts of the canvas with soft removal strokes.',
      select: 'Click an object to select it. Shift-click adds more.',
      move: 'Drag the current selection to reposition it.',
      fill: 'Use Fill to apply your current background settings instantly.',
      image: 'Import PNG or JPEG art, then move or scale it in the scene.',
    }[state.tool];
    ui.drawStatus.textContent = text || fallback || 'Start drawing.';
  }

  function updateMeta() {
    ui.modeLabel.textContent = getModeConfig(state.mode).label;
    ui.sizeLabel.textContent = `${state.canvasWidth} x ${state.canvasHeight}`;
    ui.strokeCountLabel.textContent = String(state.objects.length);
    ui.lastSavedLabel.textContent = state.lastSavedAt
      ? new Date(state.lastSavedAt).toLocaleString()
      : (state.hasUnsavedWork ? 'Unsaved changes' : 'None yet');
    const selectedCount = state.selectedIds.size;
    const groupedCount = state.objects.filter((item) => state.selectedIds.has(item.id) && item.groupId).length;
    ui.selectionSummary.textContent = selectedCount
      ? `${selectedCount} object${selectedCount === 1 ? '' : 's'} selected${groupedCount ? `, ${groupedCount} in group${groupedCount === 1 ? '' : 's'}` : ''}.`
      : 'No selection yet.';
    const selectedImage = getSingleSelectedImage();
    ui.selectedImageScaleInput.disabled = !selectedImage;
    if (selectedImage) {
      ui.selectedImageScaleInput.value = String(selectedImage.scale || 100);
    }
  }

  function getObjectById(id) {
    return state.objects.find((item) => item.id === id) || null;
  }

  function getSelectedObjects() {
    return state.objects.filter((item) => state.selectedIds.has(item.id));
  }

  function getSingleSelectedImage() {
    const selected = getSelectedObjects().filter((item) => item.type === 'image');
    return selected.length === 1 ? selected[0] : null;
  }

  function getGroupMembers(groupId) {
    if (!groupId) return [];
    return state.objects.filter((item) => item.groupId === groupId);
  }

  function setSelection(ids, { append = false } = {}) {
    if (!append) state.selectedIds.clear();
    ids.forEach((id) => state.selectedIds.add(id));
    updateMeta();
    renderScene();
  }

  function clearSelection() {
    state.selectedIds.clear();
    updateMeta();
    renderScene();
  }

  function pointInRect(point, rect) {
    return point.x >= rect.x
      && point.x <= rect.x + rect.width
      && point.y >= rect.y
      && point.y <= rect.y + rect.height;
  }

  function pointToSegmentDistance(point, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (!dx && !dy) {
      return Math.hypot(point.x - a.x, point.y - a.y);
    }
    const t = clamp((((point.x - a.x) * dx) + ((point.y - a.y) * dy)) / ((dx * dx) + (dy * dy)), 0, 1);
    const projectionX = a.x + (t * dx);
    const projectionY = a.y + (t * dy);
    return Math.hypot(point.x - projectionX, point.y - projectionY);
  }

  function hitTestStroke(stroke, point) {
    if (!stroke.points.length) return false;
    if (stroke.drawMode === 'pixel') {
      const pixelSize = Math.max(2, Math.round(stroke.size));
      return stroke.points.some((pixelPoint) => pointInRect(point, {
        x: pixelPoint.x,
        y: pixelPoint.y,
        width: pixelSize,
        height: pixelSize,
      }));
    }
    if (stroke.points.length === 1) {
      return Math.hypot(point.x - stroke.points[0].x, point.y - stroke.points[0].y) <= (stroke.size / 2) + 6;
    }
    for (let index = 1; index < stroke.points.length; index += 1) {
      const distance = pointToSegmentDistance(point, stroke.points[index - 1], stroke.points[index]);
      if (distance <= (stroke.size / 2) + 6) {
        return true;
      }
    }
    return false;
  }

  function hitTestObject(item, point) {
    if (item.type === 'image') {
      return pointInRect(point, getObjectBounds(item));
    }
    return hitTestStroke(item, point);
  }

  function hitTest(point) {
    for (let index = state.objects.length - 1; index >= 0; index -= 1) {
      const item = state.objects[index];
      if (hitTestObject(item, point)) {
        if (item.groupId) {
          return getGroupMembers(item.groupId).map((entry) => entry.id);
        }
        return [item.id];
      }
    }
    return [];
  }

  function translateObject(item, dx, dy) {
    if (item.type === 'image') {
      item.x += dx;
      item.y += dy;
      return;
    }
    item.points = item.points.map((point) => ({ x: point.x + dx, y: point.y + dy }));
  }

  function maybeExpandFreeform(point) {
    if (state.mode !== 'freeform') return false;
    let changed = false;
    if (point.x > state.canvasWidth - POINTER_EDGE_EXPAND_MARGIN) {
      state.canvasWidth += FREEFORM_EXPAND_BY;
      changed = true;
    }
    if (point.y > state.canvasHeight - POINTER_EDGE_EXPAND_MARGIN) {
      state.canvasHeight += FREEFORM_EXPAND_BY;
      changed = true;
    }
    if (changed) {
      updateMeta();
    }
    return changed;
  }

  function beginStroke(point, erase = false) {
    const drawMode = getDrawingMode();
    const stroke = {
      id: uid('stroke'),
      type: 'stroke',
      points: [drawMode === 'pixel' ? snapPixelPoint(point, Number(ui.brushSizeInput.value) || 8) : point],
      size: clamp(Number(ui.brushSizeInput.value) || 8, 1, 80),
      erase,
      drawMode,
      groupId: '',
      style: createStrokeStyle(),
    };
    state.currentStroke = stroke;
    state.objects.push(stroke);
  }

  function extendStroke(point) {
    if (!state.currentStroke) return;
    if (state.currentStroke.drawMode === 'pixel') {
      appendPixelPoints(state.currentStroke, point);
    } else {
      state.currentStroke.points.push(point);
    }
    maybeExpandFreeform(point);
    renderScene();
  }

  function finishStroke() {
    if (!state.currentStroke) return;
    if (state.currentStroke.points.length < 1) {
      state.objects = state.objects.filter((item) => item.id !== state.currentStroke.id);
    }
    state.currentStroke = null;
    markDirty();
    updateMeta();
    renderScene();
  }

  function beginMove(point) {
    if (!state.selectedIds.size) {
      const hitIds = hitTest(point);
      if (!hitIds.length) return false;
      setSelection(hitIds);
    }
    state.dragging = {
      kind: 'move',
      startPoint: point,
    };
    updateCanvasCursor();
    return true;
  }

  function handleMove(point) {
    if (!state.dragging || state.dragging.kind !== 'move') return;
    const dx = point.x - state.dragging.startPoint.x;
    const dy = point.y - state.dragging.startPoint.y;
    if (!dx && !dy) return;
    getSelectedObjects().forEach((item) => translateObject(item, dx, dy));
    state.dragging.startPoint = point;
    maybeExpandFreeform(point);
    markDirty();
    renderScene();
  }

  function endMove() {
    if (!state.dragging || state.dragging.kind !== 'move') return;
    state.dragging = null;
    updateCanvasCursor();
    updateMeta();
  }

  function applyFill() {
    state.background.mode = ui.backgroundModeSelect.value === 'gradient' ? 'gradient' : 'solid';
    state.background.color = normalizeHex(ui.backgroundColorInput.value, '#ffffff');
    state.background.angle = clamp(Number(ui.backgroundAngleInput.value) || 135, 0, 360);
    if (state.background.mode === 'gradient' && state.background.stops.length < 2) {
      state.background.stops = [
        { id: uid('bg-stop'), offset: 0, color: state.background.color },
        { id: uid('bg-stop'), offset: 1, color: '#dce8ff' },
      ];
    }
    renderBackgroundStops();
    updateBackgroundModeUi();
    renderScene();
    markDirty();
    updateStatus('Background updated.');
  }

  function applyStyleToSelection() {
    const style = createStrokeStyle();
    let updated = 0;
    getSelectedObjects().forEach((item) => {
      if (item.type !== 'stroke' || item.erase) return;
      item.style = { ...style };
      updated += 1;
    });
    if (!updated) {
      updateStatus('Select one or more strokes first to recolour them.');
      return;
    }
    renderScene();
    markDirty();
    updateStatus(`Updated ${updated} selected stroke${updated === 1 ? '' : 's'}.`);
  }

  function groupSelection() {
    const selected = getSelectedObjects();
    if (selected.length < 2) {
      updateStatus('Select at least two objects before grouping.');
      return;
    }
    const groupId = uid('group');
    selected.forEach((item) => {
      item.groupId = groupId;
    });
    markDirty();
    renderScene();
    updateMeta();
    updateStatus('Selection grouped.');
  }

  function ungroupSelection() {
    const selected = getSelectedObjects();
    if (!selected.length) return;
    selected.forEach((item) => {
      item.groupId = '';
    });
    markDirty();
    renderScene();
    updateMeta();
    updateStatus('Selection ungrouped.');
  }

  function deleteSelection() {
    if (!state.selectedIds.size) return;
    state.objects = state.objects.filter((item) => !state.selectedIds.has(item.id));
    state.selectedIds.clear();
    markDirty();
    renderScene();
    updateMeta();
    updateStatus('Selection removed.');
  }

  function addBackgroundStop() {
    state.background.mode = 'gradient';
    ui.backgroundModeSelect.value = 'gradient';
    const lastOffset = state.background.stops.length
      ? state.background.stops[state.background.stops.length - 1].offset
      : 0;
    state.background.stops.push({
      id: uid('bg-stop'),
      offset: clamp(lastOffset + 0.12, 0, 1),
      color: '#7cf0c5',
    });
    renderBackgroundStops();
    updateBackgroundModeUi();
    renderScene();
    markDirty();
  }

  function removeBackgroundStop(stopId) {
    if (state.background.stops.length <= 2) {
      updateStatus('Keep at least two gradient stops.');
      return;
    }
    state.background.stops = state.background.stops.filter((stop) => stop.id !== stopId);
    renderBackgroundStops();
    updateBackgroundModeUi();
    renderScene();
    markDirty();
  }

  function renderBackgroundStops() {
    ui.backgroundStopsList.innerHTML = '';
    state.background.stops
      .slice()
      .sort((a, b) => a.offset - b.offset)
      .forEach((stop) => {
        const row = document.createElement('div');
        row.className = 'gradient-stop-row';
        row.innerHTML = `
          <label>
            Stop colour
            <input type="color" value="${normalizeHex(stop.color, '#ffffff')}" data-stop-color="${stop.id}" />
          </label>
          <label>
            Offset
            <input type="number" min="0" max="100" step="1" value="${Math.round(stop.offset * 100)}" data-stop-offset="${stop.id}" />
          </label>
          <button class="action-btn" type="button" data-remove-stop="${stop.id}">Remove</button>
        `;
        ui.backgroundStopsList.appendChild(row);
      });
  }

  function renderStrokeStops() {
    if (!ui.strokeStopTrack) return;
    const stops = getStrokeGradientStops();
    const gradientCss = stops
      .map((stop) => `${normalizeHex(stop.color, '#183a8f')} ${Math.round(clamp(stop.offset, 0, 1) * 100)}%`)
      .join(', ');
    ui.strokeStopTrack.style.setProperty('--gradient-preview', `linear-gradient(90deg, ${gradientCss})`);
    ui.strokeStopTrack.innerHTML = stops.map((stop) => `
      <button
        class="gradient-stop-thumb${stop.id === state.activeStrokeStopId ? ' is-active' : ''}"
        type="button"
        data-stroke-stop="${stop.id}"
        data-stop-offset="${stop.offset}"
        style="left: calc(10px + (${Math.round(clamp(stop.offset, 0, 1) * 100)}% * (100% - 20px) / 100)); --stop-colour:${escapeHtml(normalizeHex(stop.color, '#183a8f'))};"
        title="Drag to move this stop"
        aria-label="Gradient stop"
      ></button>
    `).join('');
    syncStrokeUiFromState();
  }

  function addStrokeStop() {
    const stops = getStrokeGradientStops();
    const lastOffset = stops[stops.length - 1]?.offset ?? 0;
    const previousColor = stops[stops.length - 1]?.color || '#7cf0c5';
    const nextStop = {
      id: uid('stroke-stop'),
      offset: clamp(lastOffset - 0.18 > 0 ? lastOffset - 0.18 : Math.min(lastOffset + 0.12, 1), 0, 1),
      color: previousColor,
    };
    state.strokeGradientStops = normalizeGradientStops([...stops, nextStop], stops);
    state.activeStrokeStopId = nextStop.id;
    renderStrokeStops();
  }

  function updateActiveStrokeStopColor(value) {
    const activeStop = getStrokeGradientStops().find((stop) => stop.id === state.activeStrokeStopId);
    if (!activeStop) return;
    activeStop.color = normalizeHex(value, activeStop.color);
    if (ui.brushColorInput && activeStop.offset === Math.min(...getStrokeGradientStops().map((stop) => stop.offset))) {
      ui.brushColorInput.value = activeStop.color;
    }
    renderStrokeStops();
  }

  function moveStrokeStop(stopId, clientX) {
    const stop = getStrokeGradientStops().find((entry) => entry.id === stopId);
    if (!stop || !ui.strokeStopTrack) return;
    const rect = ui.strokeStopTrack.getBoundingClientRect();
    const offset = clamp((clientX - rect.left - 10) / Math.max(1, rect.width - 20), 0, 1);
    stop.offset = offset;
    state.strokeGradientStops.sort((left, right) => left.offset - right.offset);
    renderStrokeStops();
    markDirty();
  }

  function updateBackgroundStop(stopId, key, value) {
    const stop = state.background.stops.find((entry) => entry.id === stopId);
    if (!stop) return;
    if (key === 'color') {
      stop.color = normalizeHex(value, stop.color);
    } else if (key === 'offset') {
      stop.offset = clamp(Number(value) / 100, 0, 1);
    }
    state.background.stops.sort((a, b) => a.offset - b.offset);
    renderScene();
    markDirty();
  }

  function downloadDataUrl(dataUrl, fileName) {
    const anchor = document.createElement('a');
    anchor.href = dataUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  function createExportCanvas() {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = state.canvasWidth;
    exportCanvas.height = state.canvasHeight;
    const context = exportCanvas.getContext('2d');
    renderBackground(context, state.canvasWidth, state.canvasHeight);
    state.objects.forEach((item) => {
      if (item.type === 'image') {
        renderImageObject(context, item);
      } else {
        renderStroke(context, item);
      }
    });
    return exportCanvas;
  }

  function escapeXml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getExportData(format = 'png') {
    const safeFormat = ['png', 'jpeg', 'webp', 'svg'].includes(format) ? format : 'png';
    const exportCanvas = createExportCanvas();
    if (safeFormat === 'svg') {
      const embeddedPng = exportCanvas.toDataURL('image/png');
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${state.canvasWidth}" height="${state.canvasHeight}" viewBox="0 0 ${state.canvasWidth} ${state.canvasHeight}">
          <image href="${escapeXml(embeddedPng)}" width="${state.canvasWidth}" height="${state.canvasHeight}" />
        </svg>
      `.trim();
      return {
        dataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
        mime: 'image/svg+xml',
      };
    }
    const mime = safeFormat === 'jpeg'
      ? 'image/jpeg'
      : safeFormat === 'webp'
        ? 'image/webp'
        : 'image/png';
    return {
      dataUrl: exportCanvas.toDataURL(mime, 0.96),
      mime,
    };
  }

  function openFinishOverlay() {
    const exported = getExportData('png');
    state.exportDataUrl = exported.dataUrl;
    state.exportMime = exported.mime;
    ui.exportPreview.src = exported.dataUrl;
    ui.finishOverlay.hidden = false;
    state.finishOpen = true;
    ui.saveBannerBtn.hidden = state.mode !== 'profile-banner';
    ui.saveBannerHint.hidden = state.mode !== 'profile-banner';
  }

  function closeFinishOverlay() {
    ui.finishOverlay.hidden = true;
    state.finishOpen = false;
    ui.saveBannerBtn.hidden = true;
    ui.saveBannerHint.hidden = true;
  }

  function saveToRecent(dataUrl) {
    const recent = readJson(DRAW_STORAGE_KEY, []);
    const entry = {
      id: uid('recent'),
      mode: state.mode,
      label: getModeConfig(state.mode).label,
      preview: dataUrl,
      createdAt: safeNow(),
      width: state.canvasWidth,
      height: state.canvasHeight,
    };
    const next = [entry, ...recent].slice(0, MAX_RECENT_DRAWS);
    writeJson(DRAW_STORAGE_KEY, next);
    state.lastSavedAt = safeNow();
    renderRecentDrawings();
    updateMeta();
  }

  function renderRecentDrawings() {
    const recent = readJson(DRAW_STORAGE_KEY, []);
    if (!recent.length) {
      ui.recentList.innerHTML = '<p class="draw-note">Your finished drawings will appear here.</p>';
      return;
    }
    ui.recentList.innerHTML = recent.map((item) => `
      <article class="recent-item">
        <img src="${item.preview}" alt="${item.label} preview" />
        <div>
          <strong>${item.label}</strong>
          <span class="draw-note">${new Date(item.createdAt).toLocaleString()}</span>
        </div>
      </article>
    `).join('');
  }

  function clearScene() {
    state.objects = [];
    state.selectedIds.clear();
    state.currentStroke = null;
    renderScene();
    markDirty();
    updateMeta();
    updateStatus('Scene cleared.');
  }

  function restoreDefaultBackground() {
    state.background = sanitizeBackground({
      mode: 'solid',
      color: '#ffffff',
      angle: 135,
      stops: [
        { offset: 0, color: '#ffffff' },
        { offset: 1, color: '#dce8ff' },
      ],
    });
  }

  function createImportedImage(file) {
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result || '');
      if (!src.startsWith('data:image/')) return;
      const image = new Image();
      image.onload = () => {
        const maxWidth = state.canvasWidth * 0.52;
        const maxHeight = state.canvasHeight * 0.52;
        const ratio = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
        const width = Math.round(image.width * ratio);
        const height = Math.round(image.height * ratio);
        const item = {
          id: uid('image'),
          type: 'image',
          src,
          x: Math.round((state.canvasWidth - width) / 2),
          y: Math.round((state.canvasHeight - height) / 2),
          width,
          height,
          baseWidth: width,
          baseHeight: height,
          scale: 100,
          groupId: '',
          imageEl: image,
        };
        state.objects.push(item);
        setSelection([item.id]);
        markDirty();
        updateStatus('Image imported. Switch to Move or Select to place it.');
      };
      image.src = src;
    };
    reader.readAsDataURL(file);
  }

  function updateSelectedImageScale(percent) {
    const selectedImage = getSingleSelectedImage();
    if (!selectedImage) return;
    const safeScale = clamp(Number(percent) || 100, 20, 250);
    selectedImage.scale = safeScale;
    selectedImage.width = Math.round(selectedImage.baseWidth * (safeScale / 100));
    selectedImage.height = Math.round(selectedImage.baseHeight * (safeScale / 100));
    renderScene();
    markDirty();
  }

  function persistBannerLocally(entry) {
    const account = getCurrentAccount();
    if (!account?.uid) {
      return { ok: false, reason: 'Log in to save a custom banner.' };
    }
    const profiles = readProfiles();
    const profile = profiles[account.uid] && typeof profiles[account.uid] === 'object'
      ? profiles[account.uid]
      : {
          uid: account.uid,
          displayName: account.displayName,
          identifier: account.identifier,
          identifierType: account.identifierType,
          createdAt: safeNow(),
          updatedAt: safeNow(),
          profileTheme: {},
        };
    const profileTheme = profile.profileTheme && typeof profile.profileTheme === 'object' ? profile.profileTheme : {};
    const customBanners = Array.isArray(profileTheme.customBanners) ? profileTheme.customBanners.slice(0, CUSTOM_PROFILE_BANNER_LIMIT) : [];
    if (customBanners.length >= CUSTOM_PROFILE_BANNER_LIMIT) {
      return { ok: false, reason: `You can save up to ${CUSTOM_PROFILE_BANNER_LIMIT} custom banners. Delete one in settings first.` };
    }
    customBanners.push(entry);
    profiles[account.uid] = {
      ...profile,
      uid: account.uid,
      displayName: account.displayName,
      identifier: account.identifier,
      identifierType: account.identifierType,
      profileTheme: {
        ...profileTheme,
        customBanners,
      },
      updatedAt: safeNow(),
    };
    writeJson(PROFILE_STORAGE_KEY, profiles);
    return { ok: true, profile: profiles[account.uid] };
  }

  async function persistBannerToCloud() {
    const account = getCurrentAccount();
    if (!account?.uid || !state.firestore) return;
    const profiles = readProfiles();
    const profile = profiles[account.uid];
    if (!profile) return;
    const payload = {
      uid: account.uid,
      displayName: account.displayName,
      normalizedDisplayName: account.displayName.toLowerCase(),
      isAdmin: false,
      identifier: account.identifier,
      identifierType: account.identifierType,
      profileTheme: profile.profileTheme || { customBanners: [] },
      updatedAt: safeNow(),
    };
    try {
      await state.firestore.collection('userProfiles').doc(account.uid).set(payload, { merge: true });
    } catch {
      // Local save still counts; cloud save can catch up later from settings/homepage.
    }
  }

  async function saveCurrentAsBanner() {
    if (state.mode !== 'profile-banner') {
      updateStatus('Switch to Profile banner mode before saving banner art.');
      return;
    }
    const account = getCurrentAccount();
    if (!account?.uid) {
      updateStatus('Log in to save a custom banner.');
      return;
    }
    const exportData = getExportData('png');
    const stamp = safeNow();
    const entry = {
      id: `custom-banner-${stamp}`,
      label: `Custom banner ${new Date(stamp).toLocaleDateString()}`,
      dataUrl: exportData.dataUrl,
      width: state.canvasWidth,
      height: state.canvasHeight,
      createdAt: stamp,
      updatedAt: stamp,
    };
    const result = persistBannerLocally(entry);
    if (!result.ok) {
      updateStatus(result.reason || 'That banner could not be saved.');
      return;
    }
    await persistBannerToCloud();
    updateStatus(account.isVip
      ? 'Custom banner saved to your account.'
      : 'Custom banner saved. Applying it is still VIP-only from Settings.');
  }

  function handleCanvasPointerDown(event) {
    const point = getCanvasPoint(event);
    if (state.tool === 'brush') {
      beginStroke(point, false);
      renderScene();
      return;
    }
    if (state.tool === 'eraser') {
      beginStroke(point, true);
      renderScene();
      return;
    }
    if (state.tool === 'fill') {
      applyFill();
      return;
    }
    if (state.tool === 'image') {
      ui.imageImportInput.click();
      return;
    }
    const hitIds = hitTest(point);
    if (state.tool === 'select') {
      if (!hitIds.length) {
        clearSelection();
        return;
      }
      setSelection(hitIds, { append: event.shiftKey });
      return;
    }
    if (state.tool === 'move') {
      if (hitIds.length && !hitIds.every((id) => state.selectedIds.has(id))) {
        setSelection(hitIds, { append: false });
      }
      beginMove(point);
    }
  }

  function handleCanvasPointerMove(event) {
    const point = getCanvasPoint(event);
    if (state.currentStroke) {
      extendStroke(point);
      return;
    }
    if (state.dragging?.kind === 'move') {
      handleMove(point);
    }
  }

  function handleGlobalPointerMove(event) {
    if (state.dragging?.kind === 'stroke-stop') {
      moveStrokeStop(state.dragging.stopId, event.clientX);
    }
  }

  function handleCanvasPointerUp() {
    if (state.currentStroke) {
      finishStroke();
    }
    if (state.dragging?.kind === 'move') {
      endMove();
      return;
    }
    if (state.dragging?.kind === 'stroke-stop') {
      state.dragging = null;
      renderStrokeStops();
    }
  }

  function bindEvents() {
    ui.modeGrid.addEventListener('click', (event) => {
      const button = event.target.closest('[data-mode]');
      if (!button) return;
      setMode(button.getAttribute('data-mode') || 'wallpaper-pc');
    });

    ui.toolButtons.addEventListener('click', (event) => {
      const button = event.target.closest('[data-tool]');
      if (!button) return;
      const tool = button.getAttribute('data-tool') || 'brush';
      if (tool === 'image') {
        setTool(tool);
        ui.imageImportInput.click();
        return;
      }
      setTool(tool);
    });

    ui.canvas.addEventListener('pointerdown', handleCanvasPointerDown);
    ui.canvas.addEventListener('pointermove', handleCanvasPointerMove);
    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleCanvasPointerUp);
    window.addEventListener('pointercancel', handleCanvasPointerUp);

    ui.applySelectedStyleBtn.addEventListener('click', applyStyleToSelection);
    ui.strokeModeSelect.addEventListener('change', updateStrokeModeUi);
    ui.brushColorInput.addEventListener('input', () => {
      const firstStop = getStrokeGradientStops()[0];
      if (firstStop) {
        firstStop.color = normalizeHex(ui.brushColorInput.value, '#183a8f');
      }
      syncStrokeUiFromState();
      renderStrokeStops();
    });
    ui.addStrokeStopBtn.addEventListener('click', addStrokeStop);
    ui.selectedStrokeStopColorInput.addEventListener('input', () => {
      updateActiveStrokeStopColor(ui.selectedStrokeStopColorInput.value);
    });
    ui.strokeStopTrack.addEventListener('pointerdown', (event) => {
      const thumb = event.target.closest('[data-stroke-stop]');
      if (!thumb) return;
      event.preventDefault();
      state.activeStrokeStopId = thumb.getAttribute('data-stroke-stop') || '';
      ui.strokeStopTrack.setPointerCapture(event.pointerId);
      state.dragging = {
        kind: 'stroke-stop',
        pointerId: event.pointerId,
        stopId: state.activeStrokeStopId,
      };
      renderStrokeStops();
    });
    ui.groupSelectionBtn.addEventListener('click', groupSelection);
    ui.ungroupSelectionBtn.addEventListener('click', ungroupSelection);
    ui.deleteSelectionBtn.addEventListener('click', deleteSelection);
    ui.addBackgroundStopBtn.addEventListener('click', addBackgroundStop);
    ui.backgroundStopsList.addEventListener('input', (event) => {
      const colorTarget = event.target.closest('[data-stop-color]');
      if (colorTarget) {
        updateBackgroundStop(colorTarget.getAttribute('data-stop-color') || '', 'color', colorTarget.value);
        return;
      }
      const offsetTarget = event.target.closest('[data-stop-offset]');
      if (offsetTarget) {
        updateBackgroundStop(offsetTarget.getAttribute('data-stop-offset') || '', 'offset', offsetTarget.value);
      }
    });
    ui.backgroundStopsList.addEventListener('click', (event) => {
      const button = event.target.closest('[data-remove-stop]');
      if (!button) return;
      removeBackgroundStop(button.getAttribute('data-remove-stop') || '');
    });

    ui.importImageBtn.addEventListener('click', () => {
      ui.imageImportInput.click();
    });
    ui.imageImportInput.addEventListener('change', () => {
      const file = ui.imageImportInput.files?.[0];
      ui.imageImportInput.value = '';
      if (!file) return;
      if (!/^image\/(png|jpeg)$/i.test(file.type)) {
        updateStatus('Only PNG and JPEG imports are supported right now.');
        return;
      }
      createImportedImage(file);
      setTool('move');
    });

    ui.selectedImageScaleInput.addEventListener('input', () => {
      updateSelectedImageScale(ui.selectedImageScaleInput.value);
    });

    ui.clearBtn.addEventListener('click', clearScene);
    ui.finishBtn.addEventListener('click', () => {
      openFinishOverlay();
      const exported = getExportData('png');
      saveToRecent(exported.dataUrl);
    });
    ui.finishCloseBtn.addEventListener('click', closeFinishOverlay);
    ui.finishOverlay.addEventListener('click', (event) => {
      if (event.target === ui.finishOverlay) {
        closeFinishOverlay();
      }
    });

    ui.downloadBtn.addEventListener('click', () => {
      const format = ui.downloadFormatSelect.value || 'png';
      const fileName = `${slugify(ui.fileNameInput.value)}.${format === 'jpeg' ? 'jpg' : format}`;
      const exported = getExportData(format);
      downloadDataUrl(exported.dataUrl, fileName);
    });

    ui.saveBannerBtn.addEventListener('click', () => {
      saveCurrentAsBanner();
    });

    ui.backgroundModeSelect.addEventListener('change', () => {
      if (ui.backgroundModeSelect.value === 'gradient' && state.background.stops.length < 2) {
        state.background.stops = [
          { id: uid('bg-stop'), offset: 0, color: state.background.color },
          { id: uid('bg-stop'), offset: 1, color: '#dce8ff' },
        ];
      }
      updateBackgroundModeUi();
      applyFill();
    });
    ui.backgroundColorInput.addEventListener('input', applyFill);
    ui.backgroundAngleInput.addEventListener('input', applyFill);

    document.querySelectorAll('a[href]').forEach((anchor) => {
      anchor.addEventListener('click', (event) => {
        if (!state.hasUnsavedWork) return;
        const href = anchor.getAttribute('href') || '';
        if (!href || href.startsWith('#')) return;
        event.preventDefault();
        state.pendingHref = anchor.href;
        ui.unsavedOverlay.hidden = false;
      });
    });

    ui.unsavedStayBtn.addEventListener('click', () => {
      state.pendingHref = '';
      ui.unsavedOverlay.hidden = true;
    });
    ui.unsavedLeaveBtn.addEventListener('click', () => {
      const href = state.pendingHref;
      state.pendingHref = '';
      ui.unsavedOverlay.hidden = true;
      clearDirty();
      if (href) {
        window.location.href = href;
      }
    });
    ui.unsavedDownloadBtn.addEventListener('click', () => {
      const format = ui.unsavedFormatSelect.value || 'png';
      const exported = getExportData(format);
      const fileName = `${slugify(ui.fileNameInput.value || 'playr-draw-it-unsaved')}.${format === 'jpeg' ? 'jpg' : format}`;
      downloadDataUrl(exported.dataUrl, fileName);
    });

    window.addEventListener('beforeunload', (event) => {
      if (!state.hasUnsavedWork) return;
      event.preventDefault();
      event.returnValue = '';
    });
  }

  function cacheElements() {
    ui.modeGrid = $('modeGrid');
    ui.toolButtons = $('toolButtons');
    ui.canvas = $('drawCanvas');
    ui.context = ui.canvas.getContext('2d');
    ui.drawStatus = $('drawStatus');
    ui.brushSizeInput = $('brushSizeInput');
    ui.drawingModeSelect = $('drawingModeSelect');
    ui.strokeModeSelect = $('strokeModeSelect');
    ui.strokeSolidColorField = $('strokeSolidColorField');
    ui.strokeGradientEditor = $('strokeGradientEditor');
    ui.strokeStopTrack = $('strokeStopTrack');
    ui.addStrokeStopBtn = $('addStrokeStopBtn');
    ui.selectedStrokeStopColorInput = $('selectedStrokeStopColorInput');
    ui.brushColorInput = $('brushColorInput');
    ui.strokeAngleInput = $('strokeAngleInput');
    ui.applySelectedStyleBtn = $('applySelectedStyleBtn');
    ui.backgroundModeSelect = $('backgroundModeSelect');
    ui.backgroundColorInput = $('backgroundColorInput');
    ui.backgroundAngleField = $('backgroundAngleField');
    ui.backgroundAngleInput = $('backgroundAngleInput');
    ui.backgroundStopsList = $('backgroundStopsList');
    ui.backgroundStopActions = $('backgroundStopActions');
    ui.addBackgroundStopBtn = $('addBackgroundStopBtn');
    ui.groupSelectionBtn = $('groupSelectionBtn');
    ui.ungroupSelectionBtn = $('ungroupSelectionBtn');
    ui.deleteSelectionBtn = $('deleteSelectionBtn');
    ui.selectionSummary = $('selectionSummary');
    ui.imageImportInput = $('imageImportInput');
    ui.importImageBtn = $('importImageBtn');
    ui.selectedImageScaleInput = $('selectedImageScaleInput');
    ui.bannerModeNote = $('bannerModeNote');
    ui.clearBtn = $('clearBtn');
    ui.finishBtn = $('finishBtn');
    ui.modeLabel = $('modeLabel');
    ui.sizeLabel = $('sizeLabel');
    ui.strokeCountLabel = $('strokeCountLabel');
    ui.lastSavedLabel = $('lastSavedLabel');
    ui.recentList = $('recentList');
    ui.finishOverlay = $('finishOverlay');
    ui.finishCloseBtn = $('finishCloseBtn');
    ui.exportPreview = $('exportPreview');
    ui.downloadFormatSelect = $('downloadFormatSelect');
    ui.fileNameInput = $('fileNameInput');
    ui.downloadBtn = $('downloadBtn');
    ui.saveBannerBtn = $('saveBannerBtn');
    ui.saveBannerHint = $('saveBannerHint');
    ui.unsavedOverlay = $('unsavedOverlay');
    ui.unsavedFormatSelect = $('unsavedFormatSelect');
    ui.unsavedDownloadBtn = $('unsavedDownloadBtn');
    ui.unsavedStayBtn = $('unsavedStayBtn');
    ui.unsavedLeaveBtn = $('unsavedLeaveBtn');
  }

  async function init() {
    cacheElements();
    ensureFirebase();
    restoreDefaultBackground();
    const loadedDraft = loadDraft();
    ui.backgroundModeSelect.value = state.background.mode;
    ui.backgroundColorInput.value = state.background.color;
    ui.backgroundAngleInput.value = String(state.background.angle);
    syncStrokeUiFromState();
    setMode(loadedDraft ? state.mode : 'wallpaper-pc', { preserveObjects: true, markChanged: false });
    renderBackgroundStops();
    updateStrokeModeUi();
    updateBackgroundModeUi();
    await preloadImages();
    renderRecentDrawings();
    setTool(state.tool || 'brush');
    updateMeta();
    updateCanvasCursor();
    bindEvents();
    renderScene();
    updateStatus(loadedDraft ? 'Restored your latest local draft.' : 'Pick a canvas mode and start building.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
