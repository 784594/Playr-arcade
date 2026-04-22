(function () {
	const STARTER_ELEMENTS = [
		{ id: 'earth', name: 'Earth', emoji: '🌍', tags: ['nature', 'ground'] },
		{ id: 'water', name: 'Water', emoji: '💧', tags: ['liquid', 'nature'] },
		{ id: 'fire', name: 'Fire', emoji: '🔥', tags: ['energy', 'heat'] },
		{ id: 'wind', name: 'Wind', emoji: '💨', tags: ['air', 'motion'] },
	];

	const BASE_RECIPES = {
		'earth::earth': { name: 'Mountain', emoji: '🏔️', tags: ['nature', 'stone'] },
		'water::water': { name: 'Lake', emoji: '🏞️', tags: ['liquid', 'nature'] },
		'mountain::mountain': { name: 'Mountain Range', emoji: '⛰️', tags: ['nature', 'stone'] },
		'earth::mountain': { name: 'Volcano', emoji: '🌋', tags: ['nature', 'heat', 'stone'] },
		'earth::water': { name: 'Mud', emoji: '🟤', tags: ['nature', 'soil'] },
		'earth::fire': { name: 'Lava', emoji: '🌋', tags: ['heat', 'stone'] },
		'fire::mountain': { name: 'Volcano', emoji: '🌋', tags: ['nature', 'heat', 'stone'] },
		'earth::lava': { name: 'Volcano', emoji: '🌋', tags: ['heat', 'nature'] },
		'earth::wind': { name: 'Dust', emoji: '🌫️', tags: ['air', 'ground'] },
		'fire::water': { name: 'Steam', emoji: '☁️', tags: ['air', 'heat'] },
		'fire::wind': { name: 'Smoke', emoji: '🌪️', tags: ['air', 'heat'] },
		'water::wind': { name: 'Wave', emoji: '🌊', tags: ['liquid', 'motion'] },
		'lava::water': { name: 'Obsidian', emoji: '🪨', tags: ['material', 'heat'] },
		'volcano::water': { name: 'Geyser', emoji: '♨️', tags: ['nature', 'heat'] },
		'volcano::wind': { name: 'Ash Cloud', emoji: '🌫️', tags: ['weather', 'heat'] },
		'mud::fire': { name: 'Brick', emoji: '🧱', tags: ['material', 'craft'] },
		'steam::earth': { name: 'Hot Spring', emoji: '♨️', tags: ['nature', 'liquid'] },
		'water::stone': { name: 'Pebble', emoji: '🪨', tags: ['nature', 'material'] },
		'fire::dust': { name: 'Glass', emoji: '🔮', tags: ['material', 'craft'] },
		'water::plant': { name: 'Algae', emoji: '🟩', tags: ['life', 'nature'] },
		'dust::water': { name: 'Clay', emoji: '🏺', tags: ['earth', 'craft'] },
		'steam::wind': { name: 'Cloud', emoji: '☁️', tags: ['sky', 'weather'] },
		'cloud::water': { name: 'Rain', emoji: '🌧️', tags: ['weather', 'liquid'] },
		'cloud::fire': { name: 'Lightning', emoji: '⚡', tags: ['energy', 'weather'] },
		'earth::rain': { name: 'Plant', emoji: '🌱', tags: ['nature', 'life'] },
		'fire::plant': { name: 'Ash', emoji: '⚫', tags: ['powder', 'heat'] },
		'plant::water': { name: 'Swamp', emoji: '🟢', tags: ['nature', 'wetland'] },
		'plant::wind': { name: 'Seed', emoji: '🌰', tags: ['nature', 'life'] },
		'plant::stone': { name: 'Moss', emoji: '🍃', tags: ['nature', 'growth'] },
		'cloud::stone': { name: 'Sky Island', emoji: '🏝️', tags: ['myth', 'sky'] },
		'fire::stone': { name: 'Metal', emoji: '🔩', tags: ['material', 'craft'] },
		'metal::water': { name: 'Rust', emoji: '🧲', tags: ['material', 'chemistry'] },
		'metal::wind': { name: 'Blade', emoji: '🗡️', tags: ['tool', 'craft'] },
		'fire::metal': { name: 'Forge', emoji: '🏭', tags: ['industry', 'heat'] },
		'plant::swamp': { name: 'Tree', emoji: '🌳', tags: ['nature', 'life'] },
		'tree::fire': { name: 'Charcoal', emoji: '🧱', tags: ['fuel', 'heat'] },
		'tree::water': { name: 'River', emoji: '🏞️', tags: ['nature', 'liquid'] },
		'blade::metal': { name: 'Sword', emoji: '⚔️', tags: ['weapon', 'tool'] },
		'cloud::rain': { name: 'Storm', emoji: '⛈️', tags: ['weather', 'energy'] },
		'storm::water': { name: 'Ocean', emoji: '🌊', tags: ['liquid', 'nature'] },
		'ocean::wind': { name: 'Hurricane', emoji: '🌀', tags: ['weather', 'motion'] },
		'plant::sun': { name: 'Flower', emoji: '🌸', tags: ['nature', 'beauty'] },
		'cloud::lightning': { name: 'Thunder', emoji: '🔊', tags: ['sound', 'weather'] },
	};

	const CRAFT_FORMS = ['Stone', 'Bloom', 'Essence', 'Forge', 'Mist', 'Shard', 'Spirit', 'Flow', 'Spark', 'Root'];
	const PLACEHOLDER_EMOJI = '✨';
	const CANONICAL_EMOJI_BY_NAME = (() => {
		const map = new Map();
		for (const starter of STARTER_ELEMENTS) {
			map.set(String(starter.name || '').trim().toLowerCase(), starter.emoji || PLACEHOLDER_EMOJI);
		}
		for (const recipe of Object.values(BASE_RECIPES)) {
			if (!recipe?.name) continue;
			map.set(String(recipe.name).trim().toLowerCase(), recipe.emoji || PLACEHOLDER_EMOJI);
		}
		return map;
	})();
	const TAG_LABELS = {
		nature: 'Wild',
		liquid: 'Tide',
		heat: 'Ember',
		sky: 'Sky',
		weather: 'Storm',
		energy: 'Spark',
		material: 'Iron',
		life: 'Life',
		craft: 'Craft',
		motion: 'Swift',
	};
	const EMOJI_BY_TAG = {
		nature: ['🌿', '🍀', '🌳', '🪵'],
		liquid: ['💧', '🌊', '🫧', '☔'],
		heat: ['🔥', '🌋', '☄️', '♨️'],
		sky: ['☁️', '🌤️', '🌌', '🪂'],
		weather: ['🌧️', '⛈️', '🌪️', '❄️'],
		energy: ['⚡', '✨', '🔋', '💥'],
		material: ['⚙️', '🧱', '🪨', '🔩'],
		life: ['🌱', '🧬', '🪴', '🐾'],
		craft: ['🛠️', '🏺', '🧪', '🧰'],
		motion: ['💨', '🛞', '🌀', '🏃'],
	};
	const FALLBACK_EMOJI = ['✨', '🧪', '🪐', '🧩', '💠', '🔮', '🌀', '🌟'];
	const COMBINE_DISTANCE = 66;
	const STRICT_KNOWN_RECIPES_ONLY = false;
	const API_ONLY_RECIPES_MODE = false;
	const DATASET_ONLY_RECIPES_MODE = false;
	const MULTIPLAYER_MAX_PLAYERS = 5;
	const ROOM_COLLECTION = 'craftRooms';
	const ROOM_PRESENCE_COLLECTION = 'presence';
	const PROGRESS_STORAGE_KEY = 'playrInfiniteCraftSinglePlayerProgressV1';
	const CURSOR_UPDATE_MS = 50;
	const ACHIEVEMENT_VISIBLE_MS = 5000;
	const FIREBASE_CONFIG = {
		apiKey: 'AIzaSyAIpLxF3vwcLL_aez4db2HlxkftJBkbTRE',
		authDomain: 'playr3.firebaseapp.com',
		projectId: 'playr3',
		storageBucket: 'playr3.firebasestorage.app',
		messagingSenderId: '784118485475',
		appId: '1:784118485475:web:5347f708718f56602fd0d6',
		measurementId: 'G-J4DKRFRX33',
	};
	const LIVE_RECIPE_LOOKUP_ENABLED = true;
	const LIVE_RECIPE_TIMEOUT_MS = 5000;
	const LIVE_RECIPE_COOLDOWN_MS = 450;
	const LIVE_CACHE_STORAGE_KEY = 'playrInfiniteCraftLiveCacheV1';
	const BOARD_PARTICLE_COUNT = 30;
	const BOARD_CONNECTION_RADIUS = 180;
	const BOARD_AMBIENT_RADIUS = 125;
	const BOARD_MAX_LINES_PER_NODE = 5;
	const LOCAL_EXTRACT_RECIPES_PATHS = [
		'./data/wiki-recipes-lite.json',
	];
	const WIKI_DATA_PREFIX_CANDIDATES = [
		new URL(window.location.href).searchParams.get('wikiData') || '',
		window.INFINITE_CRAFT_WIKI_DATA_PREFIX,
		window.localStorage?.getItem('playrInfiniteCraftWikiDataPrefix') || '',
		'/InfiniteCraftWiki-main/web/data/',
		'../../../InfiniteCraftWiki-main/web/data/',
		'../../../../InfiniteCraftWiki-main/web/data/',
		'../../../../../InfiniteCraftWiki-main/web/data/',
		'../../../../../../InfiniteCraftWiki-main/web/data/',
	].filter(Boolean);
	const WIKI_BASE64_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-=';

	const state = {
		firebaseApp: null,
		auth: null,
		db: null,
		user: null,
		elementsById: new Map(),
		elementIdByName: new Map(),
		adminCatalog: [],
		adminCatalogById: new Map(),
		adminCatalogByName: new Map(),
		discoveredCraftedNames: new Set(),
		recipeResults: new Map(),
		livePairCache: new Map(),
		livePairPromises: new Map(),
		liveRequestChain: Promise.resolve(),
		liveLastRequestAt: 0,
		liveApiReachable: null,
		liveApiFailureStreak: 0,
		notifiedApiFallback: false,
		workspaceNodes: [],
		nextNodeId: 1,
		starterIds: new Set(),
		roomId: '',
		roomData: null,
		roomUnsub: null,
		presenceUnsub: null,
		ownerLobbyUnsub: null,
		roomDocPending: false,
		roomPlayers: [],
		roomCursors: new Map(),
		roomCursorsDirty: false,
		roomCreatePending: false,
		roomJoinPending: false,
		adminPanelOpen: false,
		adminSearch: '',
		adminDrag: null,
		achievement: null,
		achievementTimer: null,
		lastAchievementAtSeen: 0,
		cursorSendAt: 0,
		cursorX: 0,
		cursorY: 0,
		userColor: '#7cf0c5',
		selectedOwnerRoomId: '',
		selectedOwnerParticipantId: '',
		ownerRooms: [],
		ownerLobbyOpen: false,
		ownerRoomLimit: MULTIPLAYER_MAX_PLAYERS,
		localExtractReady: false,
		localExtractLoadFailed: false,
		localExtractSource: '',
		localExtractMap: new Map(),
		localExtractPromise: null,
		progressSaveTimer: null,
		inventorySortMode: 'name',
		inventorySortDescending: false,
		boardParticles: [],
		boardAnimationFrame: 0,
		boardLastFrameAt: 0,
		wikiPrefix: '',
		wikiReady: false,
		wikiLoadFailed: false,
		wikiNameToId: new Map(),
		wikiElementById: new Map(),
		wikiDataChunkByNumber: new Map(),
		wikiDataChunkPromises: new Map(),
		wikiIndexPromise: null,
		inventorySearch: '',
		drag: null,
		noticeTimer: null,
	};

	const els = {
		status: document.getElementById('gameStatus'),
		workspace: document.getElementById('workspace'),
		workspaceOverlay: document.getElementById('workspaceOverlay'),
		inventoryPanel: document.getElementById('inventoryPanel'),
		inventoryList: document.getElementById('inventoryList'),
		starterQuick: document.getElementById('starterQuick'),
		tipBanner: document.getElementById('tipBanner'),
		inventorySearch: document.getElementById('inventorySearch'),
		clearWorkspaceBtn: document.getElementById('clearWorkspaceBtn'),
		uniqueCounter: document.getElementById('uniqueCounter'),
		itemCount: document.getElementById('itemCount'),
		inventorySortModeBtn: document.getElementById('inventorySortModeBtn'),
		inventorySortTimeBtn: document.getElementById('inventorySortTimeBtn'),
		inventorySortDirectionBtn: document.getElementById('inventorySortDirectionBtn'),
		achievementToast: document.getElementById('achievementToast'),
		roomStatus: document.getElementById('roomStatus'),
		roomHint: document.getElementById('roomHint'),
		roomCodeDisplay: document.getElementById('roomCodeDisplay'),
		createRoomBtn: document.getElementById('createRoomBtn'),
		copyRoomInviteBtn: document.getElementById('copyRoomInviteBtn'),
		ownerLobbyBtn: document.getElementById('ownerLobbyBtn'),
		joinRoomInput: document.getElementById('joinRoomInput'),
		joinRoomBtn: document.getElementById('joinRoomBtn'),
		adminPanel: document.getElementById('adminPanel'),
		adminSearch: document.getElementById('adminSearch'),
		adminBlockList: document.getElementById('adminBlockList'),
		ownerLobbyPanel: document.getElementById('ownerLobbyPanel'),
		ownerRoomList: document.getElementById('ownerRoomList'),
		selectedRoomTitle: document.getElementById('selectedRoomTitle'),
		selectedRoomMeta: document.getElementById('selectedRoomMeta'),
		selectedRoomPlayers: document.getElementById('selectedRoomPlayers'),
		spectateRoomBtn: document.getElementById('spectateRoomBtn'),
		joinRoomFromLobbyBtn: document.getElementById('joinRoomFromLobbyBtn'),
		selectedUserName: document.getElementById('selectedUserName'),
		ownerActionStatus: document.getElementById('ownerActionStatus'),
		refreshRoomsBtn: document.getElementById('refreshRoomsBtn'),
	};

	function showNotice(message, timeoutMs = 1400) {
		if (!els.status) return;
		els.status.textContent = message || '';
		if (state.noticeTimer) {
			clearTimeout(state.noticeTimer);
			state.noticeTimer = null;
		}
		if (!message) return;
		state.noticeTimer = setTimeout(() => {
			if (els.status) els.status.textContent = '';
			state.noticeTimer = null;
		}, timeoutMs);
	}

	function showRoomHint(message) {
		if (els.roomHint) els.roomHint.textContent = message || '';
	}

	function showAchievement(message, byName = '') {
		if (!els.achievementToast) return;
		const safeMessage = String(message || '').trim();
		if (!safeMessage) return;
		if (state.achievementTimer) {
			clearTimeout(state.achievementTimer);
			state.achievementTimer = null;
		}
		els.achievementToast.textContent = byName ? `${byName} ${safeMessage}` : safeMessage;
		els.achievementToast.hidden = false;
		els.achievementToast.classList.add('is-visible');
		els.achievementToast.classList.remove('is-fading');
		state.achievementTimer = setTimeout(() => {
			if (!els.achievementToast) return;
			els.achievementToast.classList.add('is-fading');
			state.achievementTimer = setTimeout(() => {
				if (!els.achievementToast) return;
				els.achievementToast.hidden = true;
				els.achievementToast.classList.remove('is-visible', 'is-fading');
				state.achievementTimer = null;
			}, 320);
		}, ACHIEVEMENT_VISIBLE_MS);
	}

	function requiredCursorLayer() {
		return els.workspaceOverlay || els.workspace;
	}

	function escapeHtml(value) {
		return String(value ?? '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function normalizeRoomCode(value) {
		return String(value || '').trim().replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 24);
	}

	function getCurrentUserInfo() {
		try {
			if (window.PlayrAuth && typeof window.PlayrAuth.getCurrentUser === 'function') {
				const user = window.PlayrAuth.getCurrentUser();
				if (user) {
					return {
						uid: String(user.uid || user.id || user.email || getDisplayName(user)),
						displayName: normalizeName(user.displayName || user.name || 'Player'),
					};
				}
			}
		} catch {
			// no-op
		}

		try {
			const raw = localStorage.getItem('playrCurrentUser');
			if (!raw) return null;
			const parsed = JSON.parse(raw);
			if (!parsed) return null;
			return {
				uid: String(parsed.uid || parsed.email || parsed.displayName || 'guest'),
				displayName: normalizeName(parsed.displayName || parsed.name || 'Player'),
			};
		} catch {
			return null;
		}
	}

	function isOwnerAccount(user = state.user) {
		return normalizeLookupName(user?.displayName || '') === 'owner';
	}

	function isCurrentUserOwner() {
		return isOwnerAccount(state.user);
	}

	function getFirebase() {
		if (state.firebaseApp && state.auth && state.db) {
			return { app: state.firebaseApp, auth: state.auth, db: state.db };
		}
		if (!window.firebase?.initializeApp) return null;
		state.firebaseApp = window.firebase.apps?.length ? window.firebase.app() : window.firebase.initializeApp(FIREBASE_CONFIG);
		state.auth = window.firebase.auth ? window.firebase.auth() : null;
		state.db = window.firebase.firestore ? window.firebase.firestore() : null;
		if (!state.auth || !state.db) return null;
		return { app: state.firebaseApp, auth: state.auth, db: state.db };
	}

	function roomRef(roomId) {
		return state.db.collection(ROOM_COLLECTION).doc(roomId);
	}

	function roomPresenceRef(roomId, uid) {
		return roomRef(roomId).collection(ROOM_PRESENCE_COLLECTION).doc(uid);
	}

	function sanitizeWorkspaceNodes(nodes) {
		if (!Array.isArray(nodes)) return [];
		return nodes
			.map((node) => {
				if (!node || typeof node !== 'object') return null;
				const elementId = String(node.elementId || '');
				if (!elementId) return null;
				return {
					id: String(node.id || `node-${Date.now()}`),
					elementId,
					x: Number(node.x || 0),
					y: Number(node.y || 0),
					newlyCraftedUntil: Number(node.newlyCraftedUntil || 0),
				};
			})
			.filter(Boolean);
	}

	function upsertPersistedElement(record) {
		if (!record || typeof record !== 'object') return null;
		const id = String(record.id || '');
		if (!id) return null;
		const safeElement = {
			id,
			name: normalizeName(record.name || 'Element'),
			emoji: String(record.emoji || '✨'),
			tags: Array.isArray(record.tags) ? record.tags.slice(0, 6) : [],
			wikiId: Number.isFinite(Number(record.wikiId)) ? Number(record.wikiId) : undefined,
			discoveredAt: Number(record.discoveredAt || Date.now()),
		};
		state.elementsById.set(safeElement.id, safeElement);
		const savedNameKey = normalizeLookupName(safeElement.name);
		if (savedNameKey) state.elementIdByName.set(savedNameKey, safeElement.id);
		if (!state.starterIds.has(safeElement.id) && savedNameKey) {
			state.discoveredCraftedNames.add(savedNameKey);
		}
		return safeElement;
	}

	function persistProgress() {
		try {
			const payload = {
				version: 1,
				elements: [...state.elementsById.values()].map((element) => ({
					id: String(element.id || ''),
					name: String(element.name || 'Element'),
					emoji: String(element.emoji || '✨'),
					tags: Array.isArray(element.tags) ? element.tags.slice(0, 6) : [],
					wikiId: Number.isFinite(Number(element.wikiId)) ? Number(element.wikiId) : undefined,
					discoveredAt: Number(element.discoveredAt || 0),
				})),
				workspaceNodes: state.workspaceNodes.map(workspaceNodeToRoomPayload),
				nextNodeId: Number(state.nextNodeId || 1),
				inventorySortMode: state.inventorySortMode,
				inventorySortDescending: Boolean(state.inventorySortDescending),
			};
			window.localStorage?.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(payload));
		} catch {
			// Ignore save failures and quota issues.
		}
	}

	function scheduleProgressPersist() {
		if (state.progressSaveTimer) clearTimeout(state.progressSaveTimer);
		state.progressSaveTimer = setTimeout(() => {
			state.progressSaveTimer = null;
			persistProgress();
		}, 150);
	}

	function loadProgress() {
		try {
			const raw = window.localStorage?.getItem(PROGRESS_STORAGE_KEY);
			if (!raw) return;
			const parsed = JSON.parse(raw);
			if (!parsed || typeof parsed !== 'object') return;
			if (Array.isArray(parsed.elements)) {
				for (const element of parsed.elements) {
					upsertPersistedElement(element);
				}
			}
			state.workspaceNodes = sanitizeWorkspaceNodes(parsed.workspaceNodes);
			let maxNodeId = state.nextNodeId;
			for (const node of state.workspaceNodes) {
				const match = String(node.id || '').match(/node-(\d+)$/i);
				if (match) maxNodeId = Math.max(maxNodeId, Number(match[1]) + 1);
			}
			state.nextNodeId = Number.isFinite(Number(parsed.nextNodeId))
				? Math.max(maxNodeId, Number(parsed.nextNodeId))
				: maxNodeId;
			if (parsed.inventorySortMode === 'name' || parsed.inventorySortMode === 'discovered') {
				state.inventorySortMode = parsed.inventorySortMode;
			}
			state.inventorySortDescending = Boolean(parsed.inventorySortDescending);
		} catch {
			// Ignore malformed local progress.
		}
	}

	function compareInventoryEntries(a, b) {
		let result = 0;
		if (state.inventorySortMode === 'discovered') {
			result = (a.discoveredAt || 0) - (b.discoveredAt || 0);
			if (!result) result = a.name.localeCompare(b.name);
		} else {
			result = a.name.localeCompare(b.name);
			if (!result) result = (a.discoveredAt || 0) - (b.discoveredAt || 0);
		}
		return state.inventorySortDescending ? -result : result;
	}

	function setInventorySortMode(mode) {
		if (mode !== 'name' && mode !== 'discovered') return;
		state.inventorySortMode = mode;
		renderInventory();
		scheduleProgressPersist();
	}

	function toggleInventorySortDirection() {
		state.inventorySortDescending = !state.inventorySortDescending;
		renderInventory();
		scheduleProgressPersist();
	}

	function updateInventoryToolbarState() {
		if (els.inventorySortModeBtn) {
			els.inventorySortModeBtn.classList.toggle('is-active', state.inventorySortMode === 'name');
		}
		if (els.inventorySortTimeBtn) {
			els.inventorySortTimeBtn.classList.toggle('is-active', state.inventorySortMode === 'discovered');
		}
		if (els.inventorySortDirectionBtn) {
			els.inventorySortDirectionBtn.textContent = state.inventorySortDescending ? '↑' : '↓';
			els.inventorySortDirectionBtn.title = state.inventorySortDescending ? 'Show oldest first' : 'Show newest first';
		}
	}

	function getWorkspaceSize() {
		if (!els.workspace) return { width: 0, height: 0 };
		const rect = els.workspace.getBoundingClientRect();
		return {
			width: Math.max(1, rect.width),
			height: Math.max(1, rect.height),
		};
	}

	function createBoardParticle(width, height) {
		const speed = 8 + Math.random() * 20;
		const angle = Math.random() * Math.PI * 2;
		const x = Math.random() * width;
		const y = Math.random() * height;
		return {
			id: `particle-${Math.random().toString(36).slice(2, 10)}`,
			x,
			y,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			size: 1.5 + Math.random() * 2.8,
			brightness: 0.34 + Math.random() * 0.54,
		};
	}

	function ensureBoardParticles() {
		const { width, height } = getWorkspaceSize();
		if (!state.boardParticles.length) {
			state.boardParticles = Array.from({ length: BOARD_PARTICLE_COUNT }, () => createBoardParticle(width, height));
			return;
		}
		for (const particle of state.boardParticles) {
			particle.x = Math.max(0, Math.min(width, particle.x));
			particle.y = Math.max(0, Math.min(height, particle.y));
		}
	}

	function wrapBoardParticle(particle, width, height) {
		const pad = 24;
		if (particle.x < -pad) particle.x = width + pad;
		if (particle.x > width + pad) particle.x = -pad;
		if (particle.y < -pad) particle.y = height + pad;
		if (particle.y > height + pad) particle.y = -pad;
	}

	function stepBoardParticles(deltaMs) {
		ensureBoardParticles();
		const { width, height } = getWorkspaceSize();
		const step = Math.max(0.001, deltaMs / 1000);
		for (const particle of state.boardParticles) {
			particle.x += particle.vx * step;
			particle.y += particle.vy * step;
			wrapBoardParticle(particle, width, height);
		}
	}

	function renderBoardBackdrop() {
		if (!els.workspace) return;
		const backdrop = els.workspace.querySelector('.board-backdrop');
		if (!backdrop) return;
		ensureBoardParticles();

		const lines = [];
		const ambientLines = [];
		const usedParticles = new Set();
		const nodeCounts = new Map();

		for (const node of state.workspaceNodes) {
			const candidates = [];
			for (const particle of state.boardParticles) {
				const dx = particle.x - node.x;
				const dy = particle.y - node.y;
				const distance = Math.hypot(dx, dy);
				if (distance <= BOARD_CONNECTION_RADIUS) {
					candidates.push({ particle, distance });
				}
			}
			candidates.sort((a, b) => a.distance - b.distance);
			for (const candidate of candidates) {
				const count = nodeCounts.get(node.id) || 0;
				if (count >= BOARD_MAX_LINES_PER_NODE) break;
				if (usedParticles.has(candidate.particle.id)) continue;
				usedParticles.add(candidate.particle.id);
				nodeCounts.set(node.id, count + 1);
				lines.push({
					x1: node.x,
					y1: node.y,
					x2: candidate.particle.x,
					y2: candidate.particle.y,
					opacity: Math.max(0.16, 1 - (candidate.distance / BOARD_CONNECTION_RADIUS)),
				});
			}
		}

		for (let i = 0; i < state.boardParticles.length; i += 1) {
			const particle = state.boardParticles[i];
			let nearest = null;
			let nearestDistance = Number.POSITIVE_INFINITY;
			for (let j = 0; j < state.boardParticles.length; j += 1) {
				if (i === j) continue;
				const other = state.boardParticles[j];
				const dx = other.x - particle.x;
				const dy = other.y - particle.y;
				const distance = Math.hypot(dx, dy);
				if (distance < nearestDistance && distance <= BOARD_AMBIENT_RADIUS) {
					nearest = other;
					nearestDistance = distance;
				}
			}
			if (nearest) {
				ambientLines.push({
					x1: particle.x,
					y1: particle.y,
					x2: nearest.x,
					y2: nearest.y,
					opacity: Math.max(0.05, 0.24 - (nearestDistance / BOARD_AMBIENT_RADIUS) * 0.18),
				});
			}
		}

		const dotMarkup = state.boardParticles.map((particle) => `
			<span
				class="board-dot${particle.brightness > 0.72 ? ' is-bright' : ''}"
				style="left:${particle.x}px;top:${particle.y}px;width:${particle.size}px;height:${particle.size}px;opacity:${particle.brightness};"
			></span>
		`).join('');
		const lineMarkup = [...ambientLines, ...lines].map((line) => `
			<line class="board-link" x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}" style="opacity:${line.opacity};"></line>
		`).join('');

		backdrop.innerHTML = `
			<svg class="board-links" aria-hidden="true" focusable="false">
				${lineMarkup}
			</svg>
			${dotMarkup}
		`;
	}

	function startBoardAnimation() {
		if (state.boardAnimationFrame) return;
		const tick = (now) => {
			if (!state.boardLastFrameAt) state.boardLastFrameAt = now;
			const delta = Math.min(48, now - state.boardLastFrameAt);
			state.boardLastFrameAt = now;
			stepBoardParticles(delta);
			renderBoardBackdrop();
			state.boardAnimationFrame = window.requestAnimationFrame(tick);
		};
		state.boardAnimationFrame = window.requestAnimationFrame(tick);
	}

	function workspaceNodeToRoomPayload(node) {
		return {
			id: String(node.id || ''),
			elementId: String(node.elementId || ''),
			x: Number(node.x || 0),
			y: Number(node.y || 0),
			newlyCraftedUntil: Number(node.newlyCraftedUntil || 0),
		};
	}

	function getRoomPlayerCount(room) {
		const participants = room?.participants || {};
		return Object.keys(participants).length;
	}

	function getRoomPlayerName(room, uid) {
		if (!room || !uid) return 'Player';
		const participant = room.participants?.[uid];
		return normalizeName(participant?.name || uid.slice(0, 6) || 'Player');
	}

	function ensureRemoteElement(element) {
		if (!element || !element.id) return null;
		const existing = state.elementsById.get(String(element.id));
		if (existing) return existing;
		return addElement({
			id: String(element.id),
			name: normalizeName(element.name || 'Element'),
			emoji: element.emoji || '✨',
			tags: Array.isArray(element.tags) ? element.tags : [],
		});
	}

	function normalizeName(value) {
		return String(value || '')
			.normalize('NFKC')
			.replace(/[\u200B-\u200D\uFEFF]/g, '')
			.trim()
			.replace(/\s+/g, ' ');
	}

	function normalizeLookupName(value) {
		return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
	}

	function slugify(value) {
		return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 42);
	}

	function titleCase(value) {
		return String(value || '')
			.split(' ')
			.filter(Boolean)
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
			.join(' ')
			.trim();
	}

	function hashString(value) {
		let hash = 2166136261;
		for (let i = 0; i < value.length; i += 1) {
			hash ^= value.charCodeAt(i);
			hash = Math.imul(hash, 16777619);
		}
		return Math.abs(hash >>> 0);
	}

	function sortedPairKey(idA, idB) {
		const a = String(idA || '');
		const b = String(idB || '');
		return [a, b].sort().join('::');
	}

	function livePairNameKey(nameA, nameB) {
		const a = normalizeLookupName(nameA);
		const b = normalizeLookupName(nameB);
		if (!a || !b) return '';
		return [a, b].sort().join('::');
	}

	function loadLiveCache() {
		try {
			const raw = window.localStorage?.getItem(LIVE_CACHE_STORAGE_KEY);
			if (!raw) return;
			const parsed = JSON.parse(raw);
			if (!parsed || typeof parsed !== 'object') return;
			for (const [key, value] of Object.entries(parsed)) {
				if (!key || !value || typeof value !== 'object') continue;
				state.livePairCache.set(key, {
					name: normalizeName(value.name || ''),
					emoji: String(value.emoji || '✨'),
				});
			}
		} catch {
			// Ignore malformed local cache.
		}
	}

	function persistLiveCache() {
		try {
			const entries = [...state.livePairCache.entries()].slice(-2000);
			const serializable = {};
			for (const [key, value] of entries) {
				serializable[key] = { name: value.name, emoji: value.emoji };
			}
			window.localStorage?.setItem(LIVE_CACHE_STORAGE_KEY, JSON.stringify(serializable));
		} catch {
			// Ignore storage quota failures.
		}
	}

	async function runLiveApiRequest(url) {
		const execute = async () => {
			const waitFor = Math.max(0, LIVE_RECIPE_COOLDOWN_MS - (Date.now() - state.liveLastRequestAt));
			if (waitFor > 0) {
				await new Promise((resolve) => setTimeout(resolve, waitFor));
			}

			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), LIVE_RECIPE_TIMEOUT_MS);
			try {
				state.liveLastRequestAt = Date.now();
				const response = await fetch(url, {
					signal: controller.signal,
					cache: 'no-store',
				});
				if (!response.ok) return null;
				const payload = await response.json();
				state.liveApiReachable = true;
				state.liveApiFailureStreak = 0;
				return payload;
			} catch {
				state.liveApiFailureStreak += 1;
				if (state.liveApiFailureStreak >= 3) {
					state.liveApiReachable = false;
				}
				return null;
			} finally {
				clearTimeout(timeoutId);
			}
		};

		const queued = state.liveRequestChain.then(execute, execute);
		state.liveRequestChain = queued.then(() => undefined, () => undefined);
		return queued;
	}

	function wikiFromBase64(value) {
		let result = 0;
		const input = String(value || '');
		for (let i = 0; i < input.length; i += 1) {
			const index = WIKI_BASE64_TABLE.indexOf(input[i]);
			if (index < 0) continue;
			result = (result * 64) + index;
		}
		return result;
	}

	function decodeWikiRecipeSegment(encoded) {
		const value = String(encoded || '');
		if (value.length < 8) return [0, 0];
		return [wikiFromBase64(value.slice(0, 4)), wikiFromBase64(value.slice(4, 8))];
	}

	function getWikiDataChunkNumber(elementId) {
		const id = Number(elementId || 0);
		if (!id) return 1;
		return Math.floor(Math.log((id / 50) + 1) * 8) + 1;
	}

	async function fetchJsonSafe(url) {
		try {
			const response = await fetch(url, { cache: 'no-store' });
			if (!response.ok) return null;
			return await response.json();
		} catch {
			return null;
		}
	}

	async function loadLocalExtractRecipes() {
		let data = null;
		let sourcePath = '';
		for (const path of LOCAL_EXTRACT_RECIPES_PATHS) {
			const candidate = await fetchJsonSafe(path);
			if (candidate && typeof candidate === 'object' && typeof candidate.recipes === 'object') {
				data = candidate;
				sourcePath = path;
				break;
			}
		}

		if (!data) {
			state.localExtractLoadFailed = true;
			state.localExtractReady = false;
			state.localExtractSource = '';
			return false;
		}

		const nextMap = new Map();
		for (const [key, value] of Object.entries(data.recipes)) {
			if (!key || !value || typeof value !== 'object') continue;
			nextMap.set(String(key).toLowerCase(), {
				id: Number(value.id || 0),
				name: normalizeName(value.name || 'Element'),
				emoji: String(value.emoji || '✨'),
			});
		}

		if (!nextMap.size) {
			state.localExtractLoadFailed = true;
			state.localExtractReady = false;
			return false;
		}

		state.localExtractMap = nextMap;
		state.localExtractReady = true;
		state.localExtractLoadFailed = false;
		state.localExtractSource = sourcePath;
		return true;
	}

	function ensureLocalExtractRecipes() {
		if (state.localExtractReady) return Promise.resolve(true);
		if (state.localExtractLoadFailed) return Promise.resolve(false);
		if (state.localExtractPromise) return state.localExtractPromise;
		state.localExtractPromise = loadLocalExtractRecipes().finally(() => {
			state.localExtractPromise = null;
			if (state.localExtractReady) buildAdminCatalog();
		});
		return state.localExtractPromise;
	}

	function buildAdminCatalog() {
		const entries = new Map();
		for (const entry of state.localExtractMap.values()) {
			if (!entry?.id) continue;
			const id = String(entry.id);
			if (entries.has(id)) continue;
			entries.set(id, {
				id,
				name: normalizeName(entry.name || 'Element'),
				emoji: String(entry.emoji || '✨'),
			});
		}

		for (const starter of STARTER_ELEMENTS) {
			if (!entries.has(starter.id)) {
				entries.set(starter.id, {
					id: starter.id,
					name: starter.name,
					emoji: starter.emoji,
				});
			}
		}

		state.adminCatalog = [...entries.values()].sort((a, b) => a.name.localeCompare(b.name));
		state.adminCatalogById = new Map(state.adminCatalog.map((entry) => [entry.id, entry]));
		state.adminCatalogByName = new Map(state.adminCatalog.map((entry) => [normalizeLookupName(entry.name), entry]));
	}

	function sortedAdminCatalog() {
		const term = state.adminSearch.trim().toLowerCase();
		if (!term) return state.adminCatalog;
		return state.adminCatalog.filter((entry) => entry.name.toLowerCase().includes(term));
	}

	function renderAdminPanel() {
		if (!els.adminPanel) return;
		const canShow = isCurrentUserOwner();
		els.adminPanel.hidden = !canShow || !state.adminPanelOpen;
		if (!canShow) return;

		if (!els.adminBlockList) return;
		const entries = sortedAdminCatalog();
		els.adminBlockList.innerHTML = entries.slice(0, 240).map((entry) => `
			<button type="button" class="admin-block-item" data-admin-block-id="${entry.id}" draggable="false" title="${entry.name}">
				<span class="craft-node-emoji">${entry.emoji}</span>
				<span class="inventory-item-name">${entry.name}</span>
				<span class="room-flag">Drag</span>
			</button>
		`).join('');
	}

	function renderRoomControls() {
		if (!els.roomStatus || !els.roomCodeDisplay) return;
		if (els.ownerLobbyBtn) {
			els.ownerLobbyBtn.hidden = !isCurrentUserOwner();
		}
		if (!state.roomId) {
			els.roomStatus.textContent = 'Offline';
			els.roomCodeDisplay.textContent = 'No room yet.';
			showRoomHint('Create or join a shared workplane.');
			return;
		}
		const room = state.roomData || {};
		const count = getRoomPlayerCount(room);
		els.roomStatus.textContent = room.ownerUid ? `Room ${room.roomId || state.roomId}` : `Room ${state.roomId}`;
		els.roomCodeDisplay.textContent = `Players: ${count}/${state.ownerRoomLimit}`;
		showRoomHint(room.status === 'active' ? 'Shared board is live.' : 'Waiting for more players.');
	}

	function renderPresenceLayer() {
		if (!els.workspaceOverlay) return;
		const cursors = [...state.roomCursors.values()].filter((cursor) => cursor && cursor.uid !== state.user?.uid);
		if (!cursors.length) {
			els.workspaceOverlay.innerHTML = '';
			return;
		}
		els.workspaceOverlay.innerHTML = cursors.map((cursor) => `
			<div class="craft-cursor" style="left:${cursor.x}px;top:${cursor.y}px;">
				<div class="craft-cursor-badge">
					<span class="craft-cursor-dot" style="background:${cursor.color || '#7cf0c5'}"></span>
					<span class="craft-cursor-label">${cursor.name || 'Player'}</span>
				</div>
			</div>
		`).join('');
	}

	function renderOwnerLobby() {
		if (!els.ownerLobbyPanel) return;
		const canShow = isCurrentUserOwner();
		els.ownerLobbyPanel.hidden = !canShow || !state.ownerLobbyOpen;
		if (!canShow) return;

		if (els.ownerRoomList) {
			const rooms = state.ownerRooms || [];
			els.ownerRoomList.innerHTML = rooms.length ? rooms.map((room) => {
				const isActive = room.roomId === state.selectedOwnerRoomId;
				const count = getRoomPlayerCount(room);
				return `
					<button type="button" class="owner-room-item ${isActive ? 'active' : ''}" data-owner-room-id="${room.roomId}">
						<span class="craft-node-emoji">🗂</span>
						<span class="inventory-item-name">${escapeHtml(room.roomId || '')}</span>
						<span class="room-flag">${count}/${state.ownerRoomLimit}</span>
						<span class="room-meta">${escapeHtml(room.status || 'waiting')}</span>
					</button>
				`;
			}).join('') : '<p class="hint">No active rooms yet.</p>';
		}

		const selected = (state.ownerRooms || []).find((room) => room.roomId === state.selectedOwnerRoomId) || null;
		if (els.selectedRoomTitle) els.selectedRoomTitle.textContent = selected ? `Room ${selected.roomId}` : 'Select a room';
		if (els.selectedRoomMeta) els.selectedRoomMeta.textContent = selected ? `${getRoomPlayerCount(selected)}/${state.ownerRoomLimit} players • ${selected.status || 'waiting'}` : 'Pick a room to spectate or join.';
		if (els.selectedRoomPlayers) {
			const participants = selected?.participants || {};
			const rows = Object.entries(participants).map(([uid, participant]) => `<div class="room-member-chip" data-owner-participant-id="${uid}">${escapeHtml(participant?.name || uid)}</div>`);
			els.selectedRoomPlayers.innerHTML = rows.length ? rows.join('') : '<p class="hint">No participants listed.</p>';
		}
		if (els.spectateRoomBtn) els.spectateRoomBtn.disabled = !selected;
		if (els.joinRoomFromLobbyBtn) els.joinRoomFromLobbyBtn.disabled = !selected;
		if (els.selectedUserName) els.selectedUserName.textContent = state.selectedOwnerParticipantId ? `Selected: ${state.selectedOwnerParticipantId}` : 'No user selected.';
	}

	function attachWikiIdsToKnownElements() {
		if (!state.wikiReady) return;
		for (const element of state.elementsById.values()) {
			if (typeof element.wikiId === 'number') continue;
			const match = state.wikiNameToId.get(normalizeLookupName(element.name));
			if (typeof match === 'number') element.wikiId = match;
		}
	}

	async function loadWikiIndex() {
		for (const prefix of WIKI_DATA_PREFIX_CANDIDATES) {
			const normalizedPrefix = String(prefix).endsWith('/') ? String(prefix) : `${prefix}/`;
			const metadata = await fetchJsonSafe(`${normalizedPrefix}metadata.json`);
			if (!metadata || !metadata.indexCount) continue;

			let complete = true;
			const nextNameMap = new Map();
			const nextElementMap = new Map();
			for (let i = 1; i <= Number(metadata.indexCount); i += 1) {
				const chunk = await fetchJsonSafe(`${normalizedPrefix}index/idx-${i}.json`);
				if (!Array.isArray(chunk)) {
					complete = false;
					break;
				}
				for (const row of chunk) {
					if (!Array.isArray(row) || row.length < 3) continue;
					const id = Number(row[0]);
					if (!Number.isFinite(id)) continue;
					const emoji = String(row[1] || '✨');
					const name = normalizeName(row[2] || `Element ${id}`);
					nextElementMap.set(id, { id, emoji, name });
					const key = normalizeLookupName(name);
					if (key && !nextNameMap.has(key)) nextNameMap.set(key, id);
				}
			}

			if (!complete || !nextElementMap.size) continue;

			state.wikiPrefix = normalizedPrefix;
			state.wikiNameToId = nextNameMap;
			state.wikiElementById = nextElementMap;
			state.wikiReady = true;
			state.wikiLoadFailed = false;
			attachWikiIdsToKnownElements();
			return true;
		}

		state.wikiLoadFailed = true;
		state.wikiReady = false;
		return false;
	}

	function ensureWikiIndex() {
		if (state.wikiReady) return Promise.resolve(true);
		if (state.wikiLoadFailed) return Promise.resolve(false);
		if (state.wikiIndexPromise) return state.wikiIndexPromise;
		state.wikiIndexPromise = loadWikiIndex().finally(() => {
			state.wikiIndexPromise = null;
		});
		return state.wikiIndexPromise;
	}

	async function loadWikiDataChunk(chunkNumber) {
		if (state.wikiDataChunkByNumber.has(chunkNumber)) {
			return state.wikiDataChunkByNumber.get(chunkNumber);
		}
		if (state.wikiDataChunkPromises.has(chunkNumber)) {
			return state.wikiDataChunkPromises.get(chunkNumber);
		}

		const loader = (async () => {
			const data = await fetchJsonSafe(`${state.wikiPrefix}data/dat-${chunkNumber}.json`);
			if (!Array.isArray(data)) {
				state.wikiDataChunkByNumber.set(chunkNumber, null);
				return null;
			}
			const byId = new Map();
			for (const row of data) {
				if (!Array.isArray(row) || row.length < 3) continue;
				const elementId = Number(row[0]);
				if (!Number.isFinite(elementId)) continue;
				byId.set(elementId, row);
			}
			state.wikiDataChunkByNumber.set(chunkNumber, byId);
			return byId;
		})();

		state.wikiDataChunkPromises.set(chunkNumber, loader);
		const resolved = await loader;
		state.wikiDataChunkPromises.delete(chunkNumber);
		return resolved;
	}

	async function findWikiResultId(idA, idB) {
		const chunkA = getWikiDataChunkNumber(idA);
		const dataA = await loadWikiDataChunk(chunkA);
		const rowA = dataA?.get(idA);
		const toA = Array.isArray(rowA?.[1]) ? rowA[1] : [];
		for (const encoded of toA) {
			const [otherId, resultId] = decodeWikiRecipeSegment(encoded);
			if (otherId === idB) return resultId;
		}

		const chunkB = getWikiDataChunkNumber(idB);
		if (chunkB === chunkA) return 0;
		const dataB = await loadWikiDataChunk(chunkB);
		const rowB = dataB?.get(idB);
		const toB = Array.isArray(rowB?.[1]) ? rowB[1] : [];
		for (const encoded of toB) {
			const [otherId, resultId] = decodeWikiRecipeSegment(encoded);
			if (otherId === idA) return resultId;
		}

		return 0;
	}

	function uniqueName(baseName) {
		const normalizedBase = normalizeName(baseName) || 'Element';
		const existingLower = new Set([...state.elementsById.values()].map((element) => element.name.toLowerCase()));
		if (!existingLower.has(normalizedBase.toLowerCase())) return normalizedBase;

		let attempt = 2;
		while (attempt < 1000) {
			const candidate = `${normalizedBase} ${attempt}`;
			if (!existingLower.has(candidate.toLowerCase())) return candidate;
			attempt += 1;
		}
		return `${normalizedBase} X`;
	}

	function addElement(element) {
		if (!element || !element.id) return null;
		const incomingNameKey = normalizeLookupName(element.name || '');
		const incomingEmoji = String(element.emoji || '').trim() || PLACEHOLDER_EMOJI;
		const incomingWikiId = Number(element.wikiId);
		const derivedWikiId = Number.isFinite(incomingWikiId)
			? incomingWikiId
			: state.wikiNameToId.get(incomingNameKey);
		const nameKey = incomingNameKey;
		if (nameKey) {
			const existingIdByName = state.elementIdByName.get(nameKey);
			if (existingIdByName && state.elementsById.has(existingIdByName)) {
				const existing = state.elementsById.get(existingIdByName);
				if (existing) {
					if ((!existing.emoji || existing.emoji === PLACEHOLDER_EMOJI) && incomingEmoji !== PLACEHOLDER_EMOJI) {
						existing.emoji = incomingEmoji;
					}
					if (!Number.isFinite(Number(existing.wikiId)) && Number.isFinite(derivedWikiId)) {
						existing.wikiId = derivedWikiId;
					}
				}
				return existing;
			}
		}
		if (state.elementsById.has(element.id)) {
			const existingById = state.elementsById.get(element.id);
			if (existingById) {
				if ((!existingById.emoji || existingById.emoji === PLACEHOLDER_EMOJI) && incomingEmoji !== PLACEHOLDER_EMOJI) {
					existingById.emoji = incomingEmoji;
				}
				if (!Number.isFinite(Number(existingById.wikiId)) && Number.isFinite(derivedWikiId)) {
					existingById.wikiId = derivedWikiId;
				}
			}
			return existingById;
		}
		const safeElement = {
			id: String(element.id),
			name: normalizeName(element.name || 'Element'),
			emoji: incomingEmoji,
			tags: Array.isArray(element.tags) ? element.tags.slice(0, 6) : [],
			wikiId: Number.isFinite(derivedWikiId) ? derivedWikiId : undefined,
			discoveredAt: Date.now(),
		};
		state.elementsById.set(safeElement.id, safeElement);
		const savedNameKey = normalizeLookupName(safeElement.name);
		if (savedNameKey) state.elementIdByName.set(savedNameKey, safeElement.id);
		if (!state.starterIds.has(safeElement.id) && savedNameKey) {
			state.discoveredCraftedNames.add(savedNameKey);
		}
		scheduleProgressPersist();
		return safeElement;
	}

	function pickEmoji(tags, seed) {
		const candidates = [];
		for (const tag of tags) {
			const mapped = EMOJI_BY_TAG[tag];
			if (mapped) candidates.push(...mapped);
		}
		if (!candidates.length) candidates.push(...FALLBACK_EMOJI);
		return candidates[seed % candidates.length];
	}

	function makeDynamicRecipe(elementA, elementB) {
		const key = sortedPairKey(elementA.id, elementB.id);
		const seed = hashString(key);
		const orderedNames = [elementA.name, elementB.name].sort();
		const mergedTags = [...new Set([...elementA.tags, ...elementB.tags])].slice(0, 5);
		const dominantTag = mergedTags[seed % Math.max(1, mergedTags.length)] || '';
		const tagLabel = TAG_LABELS[dominantTag] || '';
		const form = CRAFT_FORMS[seed % CRAFT_FORMS.length];
		const baseGeneratedName = tagLabel
			? `${tagLabel} ${form}`
			: `${orderedNames[seed % 2]} ${form}`;

		const generatedName = uniqueName(titleCase(normalizeName(baseGeneratedName)));
		const generatedId = slugify(generatedName) || `element-${seed.toString(36)}`;
		const emoji = pickEmoji(mergedTags, seed);

		return {
			id: generatedId,
			name: generatedName,
			emoji,
			tags: mergedTags,
		};
	}

	async function resolveWikiRecipe(elementA, elementB) {
		const wikiReady = await ensureWikiIndex();
		if (!wikiReady) return null;

		const idA = Number.isFinite(Number(elementA.wikiId))
			? Number(elementA.wikiId)
			: state.wikiNameToId.get(normalizeLookupName(elementA.name));
		const idB = Number.isFinite(Number(elementB.wikiId))
			? Number(elementB.wikiId)
			: state.wikiNameToId.get(normalizeLookupName(elementB.name));
		if (!Number.isFinite(idA) || !Number.isFinite(idB)) return null;

		const resultWikiId = await findWikiResultId(idA, idB);
		if (!Number.isFinite(resultWikiId) || !resultWikiId) return null;

		const result = state.wikiElementById.get(resultWikiId);
		if (!result) return null;

		const mergedTags = [...new Set([...elementA.tags, ...elementB.tags])].slice(0, 5);
		return {
			id: `wiki-${resultWikiId}`,
			wikiId: resultWikiId,
			name: result.name,
			emoji: result.emoji || pickEmoji(mergedTags, resultWikiId),
			tags: mergedTags,
		};
	}

	async function resolveLocalExtractRecipe(elementA, elementB) {
		const localReady = await ensureLocalExtractRecipes();
		if (!localReady) return null;

		const a = normalizeLookupName(elementA.name);
		const b = normalizeLookupName(elementB.name);
		if (!a || !b) return null;
		const sortedKey = [a, b].sort().join('::');
		const forwardKey = `${a}::${b}`;
		const reverseKey = `${b}::${a}`;
		const entry = state.localExtractMap.get(forwardKey)
			|| state.localExtractMap.get(reverseKey)
			|| state.localExtractMap.get(sortedKey);
		if (!entry) return null;

		const mergedTags = [...new Set([...elementA.tags, ...elementB.tags])].slice(0, 5);
		const normalizedResultName = normalizeLookupName(entry.name);
		const canonicalEmoji = CANONICAL_EMOJI_BY_NAME.get(normalizedResultName) || '';
		const datasetEmoji = String(entry.emoji || '').trim();
		const resolvedEmoji = datasetEmoji && datasetEmoji !== PLACEHOLDER_EMOJI
			? datasetEmoji
			: (canonicalEmoji || pickEmoji(mergedTags, hashString(sortedKey)));
		return {
			id: `local-${entry.id || slugify(entry.name)}`,
			wikiId: Number.isFinite(entry.id) ? entry.id : undefined,
			name: entry.name,
			emoji: resolvedEmoji,
			tags: mergedTags,
		};
	}

	async function resolveLiveApiRecipe(elementA, elementB) {
		if (!LIVE_RECIPE_LOOKUP_ENABLED) return null;
		const nameA = normalizeName(elementA.name);
		const nameB = normalizeName(elementB.name);
		const key = livePairNameKey(nameA, nameB);
		if (!key) return null;

		const cached = state.livePairCache.get(key);
		if (cached?.name) {
			const mergedTags = [...new Set([...elementA.tags, ...elementB.tags])].slice(0, 5);
			return {
				id: `live-${slugify(cached.name) || hashString(key).toString(36)}`,
				name: cached.name,
				emoji: cached.emoji || pickEmoji(mergedTags, hashString(key)),
				tags: mergedTags,
			};
		}

		if (state.livePairPromises.has(key)) {
			return state.livePairPromises.get(key);
		}

		const fetchPromise = (async () => {
			try {
				const first = encodeURIComponent(nameA);
				const second = encodeURIComponent(nameB);
				let payload = await runLiveApiRequest(`https://neal.fun/api/infinite-craft/pair?first=${first}&second=${second}`);
				if (!payload || normalizeName(payload?.result) === 'Nothing') {
					payload = await runLiveApiRequest(`https://neal.fun/api/infinite-craft/pair?first=${second}&second=${first}`);
				}
				if (!payload) return null;
				const resultName = normalizeName(payload?.result || '');
				if (!resultName || resultName === 'Nothing') return null;
				const resultEmoji = String(payload?.emoji || '✨');
				state.livePairCache.set(key, { name: resultName, emoji: resultEmoji });
				persistLiveCache();

				const mergedTags = [...new Set([...elementA.tags, ...elementB.tags])].slice(0, 5);
				return {
					id: `live-${slugify(resultName) || hashString(key).toString(36)}`,
					name: resultName,
					emoji: resultEmoji || pickEmoji(mergedTags, hashString(key)),
					tags: mergedTags,
				};
			} catch {
				return null;
			}
		})();

		state.livePairPromises.set(key, fetchPromise);
		const resolved = await fetchPromise;
		state.livePairPromises.delete(key);
		return resolved;
	}

	async function resolveRecipe(elementA, elementB) {
		const key = sortedPairKey(elementA.id, elementB.id);
		const forwardKey = `${String(elementA.id || '')}::${String(elementB.id || '')}`;
		const reverseKey = `${String(elementB.id || '')}::${String(elementA.id || '')}`;
		const base = BASE_RECIPES[forwardKey] || BASE_RECIPES[reverseKey] || BASE_RECIPES[key];
		if (base) {
			const baseSaved = addElement({
				id: slugify(base.name),
				name: base.name,
				emoji: base.emoji,
				tags: Array.isArray(base.tags) ? base.tags : [],
			});
			if (baseSaved) state.recipeResults.set(key, baseSaved.id);
			return baseSaved;
		}

		const isKnownRecipeElement = (entry) => {
			if (!entry) return false;
			if (String(entry.id || '').startsWith('live-')) return true;
			if (String(entry.id || '').startsWith('wiki-')) return true;
			if (String(entry.id || '').startsWith('local-')) return true;
			return Number.isFinite(Number(entry.wikiId));
		};

		const existingResultId = state.recipeResults.get(key);
		if (existingResultId && state.elementsById.has(existingResultId)) {
			const existingEntry = state.elementsById.get(existingResultId);
			if (isKnownRecipeElement(existingEntry)) {
				return existingEntry;
			}
		}

		if (DATASET_ONLY_RECIPES_MODE) {
			const localOnly = await resolveLocalExtractRecipe(elementA, elementB);
			if (localOnly) {
				const localSaved = addElement(localOnly);
				if (localSaved) state.recipeResults.set(key, localSaved.id);
				return localSaved;
			}
			return null;
		}

		const liveRecipe = await resolveLiveApiRecipe(elementA, elementB);
		if (liveRecipe) {
			const liveSaved = addElement(liveRecipe);
			if (liveSaved) state.recipeResults.set(key, liveSaved.id);
			return liveSaved;
		}

		if (API_ONLY_RECIPES_MODE && state.liveApiReachable !== false) {
			return null;
		}

		if (API_ONLY_RECIPES_MODE && state.liveApiReachable === false && !state.notifiedApiFallback) {
			showNotice('Live API unavailable, using local fallback recipes');
			state.notifiedApiFallback = true;
		}

		const wikiRecipe = await resolveWikiRecipe(elementA, elementB);
		if (wikiRecipe) {
			const wikiSaved = addElement(wikiRecipe);
			if (wikiSaved) state.recipeResults.set(key, wikiSaved.id);
			return wikiSaved;
		}

		const localRecipe = await resolveLocalExtractRecipe(elementA, elementB);
		if (localRecipe) {
			const localSaved = addElement(localRecipe);
			if (localSaved) state.recipeResults.set(key, localSaved.id);
			return localSaved;
		}

		if (STRICT_KNOWN_RECIPES_ONLY) {
			return null;
		}

		const recipeElement = makeDynamicRecipe(elementA, elementB);

		const saved = addElement(recipeElement);
		if (saved) state.recipeResults.set(key, saved.id);
		return saved;
	}

	function updateCounter() {
		if (!els.uniqueCounter) return;
		const craftedCount = state.discoveredCraftedNames.size;
		els.uniqueCounter.textContent = `Unique Crafted: ${craftedCount}`;
		if (els.itemCount) els.itemCount.textContent = String(state.elementsById.size);
	}

	function renderStarterQuick() {
		if (!els.starterQuick) return;
		const starterOrder = STARTER_ELEMENTS
			.map((starter) => state.elementsById.get(starter.id))
			.filter(Boolean);
		const discoveredByName = new Map();
		for (const entry of state.elementsById.values()) {
			if (state.starterIds.has(entry.id)) continue;
			const key = normalizeLookupName(entry.name || '');
			if (!key || discoveredByName.has(key)) continue;
			discoveredByName.set(key, entry);
		}
		const discoveredOrder = [...discoveredByName.values()].sort((a, b) => (a.discoveredAt || 0) - (b.discoveredAt || 0));
		const items = [...starterOrder, ...discoveredOrder]
			.map((entry) => `
				<button type="button" class="starter-item" data-quick-id="${entry.id}" title="${entry.name}">
					<span class="craft-node-emoji">${entry.emoji}</span>
					<span class="inventory-item-name">${entry.name}</span>
				</button>
			`)
			.join('');
		els.starterQuick.innerHTML = items;
	}

	function clampToWorkspace(x, y) {
		if (!els.workspace) return { x, y };
		const rect = els.workspace.getBoundingClientRect();
		const minX = 30;
		const minY = 30;
		const maxX = Math.max(minX, rect.width - 30);
		const maxY = Math.max(minY, rect.height - 30);
		return {
			x: Math.max(minX, Math.min(maxX, x)),
			y: Math.max(minY, Math.min(maxY, y)),
		};
	}

	function workspacePointFromClient(clientX, clientY) {
		if (!els.workspace) return { x: 0, y: 0 };
		const rect = els.workspace.getBoundingClientRect();
		const rawX = clientX - rect.left;
		const rawY = clientY - rect.top;
		return clampToWorkspace(rawX, rawY);
	}

	function isClientPointInWorkspace(clientX, clientY) {
		if (!els.workspace) return false;
		const rect = els.workspace.getBoundingClientRect();
		return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
	}

	function isClientPointInSidebar(clientX, clientY) {
		if (!els.inventoryPanel) return false;
		const rect = els.inventoryPanel.getBoundingClientRect();
		return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
	}

	function createWorkspaceNode(elementId, x, y, options = {}) {
		const element = state.elementsById.get(elementId);
		if (!element) return null;
		const point = clampToWorkspace(x, y);
		const node = {
			id: `node-${state.nextNodeId}`,
			elementId,
			x: point.x,
			y: point.y,
			newlyCraftedUntil: Number(options.newlyCraftedUntil || 0),
		};
		state.nextNodeId += 1;
		state.workspaceNodes.push(node);
		scheduleProgressPersist();
		return node;
	}

	function removeWorkspaceNode(nodeId) {
		state.workspaceNodes = state.workspaceNodes.filter((node) => node.id !== nodeId);
		renderWorkspace();
		void persistRoomWorkspace();
		scheduleProgressPersist();
	}

	function findNodeById(nodeId) {
		return state.workspaceNodes.find((node) => node.id === nodeId) || null;
	}

	function findCombineTarget(activeNodeId, x, y) {
		let candidate = null;
		let closestDistance = Number.POSITIVE_INFINITY;
		for (const node of state.workspaceNodes) {
			if (node.id === activeNodeId) continue;
			const dx = node.x - x;
			const dy = node.y - y;
			const distance = Math.hypot(dx, dy);
			if (distance < COMBINE_DISTANCE && distance < closestDistance) {
				candidate = node;
				closestDistance = distance;
			}
		}
		return candidate;
	}

	async function combineNodes(firstNode, secondNode) {
		const firstElement = state.elementsById.get(firstNode.elementId);
		const secondElement = state.elementsById.get(secondNode.elementId);
		if (!firstElement || !secondElement) return;

		const result = await resolveRecipe(firstElement, secondElement);
		if (!result) {
			showNotice('No known combination');
			return false;
		}
		if (!state.workspaceNodes.some((node) => node.id === firstNode.id) || !state.workspaceNodes.some((node) => node.id === secondNode.id)) {
			return false;
		}

		const midpoint = clampToWorkspace((firstNode.x + secondNode.x) / 2, (firstNode.y + secondNode.y) / 2);
		state.workspaceNodes = state.workspaceNodes.filter((node) => node.id !== firstNode.id && node.id !== secondNode.id);
		createWorkspaceNode(result.id, midpoint.x, midpoint.y, { newlyCraftedUntil: Date.now() + 1300 });
		showNotice(`Created ${result.emoji} ${result.name}`);
		showAchievement(`crafted ${result.name}`, state.user?.displayName || '');
		state.lastAchievementAtSeen = Date.now();
		renderAll();
		void persistRoomWorkspace({
			lastCraftedName: result.name,
			lastCraftedBy: state.user?.uid || '',
			lastCraftedByName: state.user?.displayName || 'Player',
			lastCraftedAt: Date.now(),
		});
		showCombineFlash(midpoint.x, midpoint.y);
		return true;
	}

	function showCombineFlash(x, y) {
		if (!els.workspace) return;
		const flash = document.createElement('div');
		flash.className = 'craft-combine-flash';
		flash.style.left = `${x}px`;
		flash.style.top = `${y}px`;
		els.workspace.appendChild(flash);
		setTimeout(() => flash.remove(), 360);
	}

	function sortedInventory() {
		const byName = new Map();
		for (const entry of state.elementsById.values()) {
			if (state.starterIds.has(entry.id)) continue;
			const key = normalizeLookupName(entry.name || '');
			if (!key || byName.has(key)) continue;
			byName.set(key, entry);
		}
		const entries = [...byName.values()].sort(compareInventoryEntries);
		return entries;
	}

	function renderInventory() {
		if (!els.inventoryList) return;
		const term = state.inventorySearch.trim().toLowerCase();
		const entries = sortedInventory();
		const filteredCount = entries.filter((entry) => !term || entry.name.toLowerCase().includes(term)).length;
		if (!entries.length) {
			els.inventoryList.innerHTML = '<p class="inventory-empty">No matching elements.</p>';
			return;
		}

		els.inventoryList.innerHTML = entries.map((entry) => `
			<button type="button" class="inventory-item" data-inventory-id="${entry.id}" draggable="false" title="${entry.name}">
				<span class="craft-node-emoji">${entry.emoji}</span>
				<span class="inventory-item-name">${entry.name}</span>
			</button>
		`).join('');

		if (filteredCount === 0) {
			els.inventoryList.insertAdjacentHTML('beforeend', '<p class="inventory-empty">No matching elements.</p>');
		}
		updateInventoryToolbarState();
	}

	function renderWorkspace() {
		if (!els.workspace) return;
		const now = Date.now();
		const combineTargetId = state.drag?.combineTargetId || '';
		els.workspace.innerHTML = `
			<div class="board-backdrop" aria-hidden="true"></div>
			${state.workspaceNodes.map((node) => {
			const element = state.elementsById.get(node.elementId);
			if (!element) return '';
			const isDragging = state.drag?.type === 'workspace' && state.drag.nodeId === node.id;
			const classes = ['craft-node'];
			if (isDragging) classes.push('dragging');
			if (combineTargetId && combineTargetId === node.id) classes.push('combine-target');
			if (node.newlyCraftedUntil > now) classes.push('newly-crafted');
			return `
				<div
					class="${classes.join(' ')}"
					data-node-id="${node.id}"
					style="left:${node.x}px;top:${node.y}px"
					title="${element.name}"
				>
					<span class="craft-node-emoji">${element.emoji}</span>
					<span class="craft-node-name">${element.name}</span>
				</div>
			`;
		}).join('')}
		`;
		renderBoardBackdrop();
	}

	function renderRoomWorkspaceFromSnapshot(room) {
		const nodes = sanitizeWorkspaceNodes(room?.workspaceNodes || []);
		state.workspaceNodes = nodes;
		state.nextNodeId = Math.max(1, ...nodes.map((node) => Number(String(node.id).replace(/\D+/g, '')) || 0)) + 1;
		for (const node of nodes) {
			ensureRemoteElement({ id: node.elementId, name: room?.elements?.[node.elementId]?.name || node.elementId, emoji: room?.elements?.[node.elementId]?.emoji || '✨' });
		}
	}

	async function persistRoomWorkspace(extra = {}) {
		if (!state.roomId || !state.user?.uid || !state.db) return;
		const payload = {
			roomId: state.roomId,
			workspaceNodes: state.workspaceNodes.map(workspaceNodeToRoomPayload),
			updatedAt: Date.now(),
			ownerUid: state.roomData?.ownerUid || state.user.uid,
			ownerName: state.roomData?.ownerName || state.user.displayName || 'Owner',
			participants: state.roomData?.participants || {},
			status: state.roomData?.status || 'active',
			...extra,
		};
		await roomRef(state.roomId).set(payload, { merge: true });
	}

	async function updatePresence(extra = {}) {
		if (!state.roomId || !state.user?.uid || !state.db) return;
		const payload = {
			uid: state.user.uid,
			name: state.user.displayName || 'Player',
			x: Number(extra.x || state.cursorX || 0),
			y: Number(extra.y || state.cursorY || 0),
			color: extra.color || state.userColor || '#7cf0c5',
			updatedAt: Date.now(),
			active: true,
		};
		await roomPresenceRef(state.roomId, state.user.uid).set(payload, { merge: true });
	}

	function selectRoom(roomId, roomData = null) {
		state.roomId = normalizeRoomCode(roomId);
		state.roomData = roomData;
		renderRoomControls();
	}

	async function createRoom() {
		const firebase = getFirebase();
		if (!firebase || !state.user?.uid) {
			showNotice('Sign in to create a room');
			return;
		}
		if (state.roomCreatePending) return;
		state.roomCreatePending = true;
		try {
			const roomId = `R${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
			const participant = {
				name: state.user.displayName || 'Owner',
				joinedAt: Date.now(),
				role: 'owner',
			};
			await roomRef(roomId).set({
				roomId,
				ownerUid: state.user.uid,
				ownerName: state.user.displayName || 'Owner',
				status: 'waiting',
				updatedAt: Date.now(),
				workspaceNodes: [],
				participants: { [state.user.uid]: participant },
				leader: state.user.uid,
			}, { merge: true });
			await joinRoom(roomId, { skipRoomCheck: true, createIfMissing: true });
			showNotice(`Room ${roomId} created`);
		} finally {
			state.roomCreatePending = false;
		}
	}

	async function joinRoom(roomIdInput, options = {}) {
		const roomId = normalizeRoomCode(roomIdInput);
		const firebase = getFirebase();
		if (!firebase || !state.user?.uid) {
			showNotice('Sign in to join a room');
			return false;
		}
		if (!roomId) {
			showNotice('Enter a room code');
			return false;
		}
		if (state.roomJoinPending) return false;
		state.roomJoinPending = true;
		try {
			let roomSnapshot = null;
			if (!options.skipRoomCheck) {
				roomSnapshot = await roomRef(roomId).get();
				if (!roomSnapshot.exists && !options.createIfMissing) {
					showNotice('Room not found');
					return false;
				}
				const roomData = roomSnapshot.exists ? roomSnapshot.data() : null;
				const participants = roomData?.participants || {};
				if (!options.createIfMissing && Object.keys(participants).length >= state.ownerRoomLimit && !participants[state.user.uid]) {
					showNotice('Room is full');
					return false;
				}
			}
			const participant = {
				name: state.user.displayName || 'Player',
				joinedAt: Date.now(),
				role: isCurrentUserOwner() ? 'owner' : 'player',
			};
			await roomRef(roomId).set({
				roomId,
				updatedAt: Date.now(),
				participants: { [state.user.uid]: participant },
				status: 'active',
			}, { merge: true });
			selectRoom(roomId, roomSnapshot?.data() || null);
			watchRoom(roomId);
			watchPresence(roomId);
			await updatePresence();
			renderRoomControls();
			return true;
		} finally {
			state.roomJoinPending = false;
		}
	}

	async function leaveRoom() {
		const roomId = state.roomId;
		if (!roomId || !state.user?.uid || !state.db) return;
		try {
			await roomPresenceRef(roomId, state.user.uid).delete();
		} catch {
			// ignore
		}
		if (state.roomUnsub) {
			state.roomUnsub();
			state.roomUnsub = null;
		}
		if (state.presenceUnsub) {
			state.presenceUnsub();
			state.presenceUnsub = null;
		}
		state.roomCursors.clear();
		state.roomData = null;
		selectRoom('');
		renderPresenceLayer();
		renderOwnerLobby();
	}

	function watchRoom(roomId) {
		if (!state.db) return;
		if (state.roomUnsub) {
			state.roomUnsub();
			state.roomUnsub = null;
		}
		state.roomUnsub = roomRef(roomId).onSnapshot((snapshot) => {
			if (!snapshot.exists) return;
			const previousRoom = state.roomData || {};
			const room = snapshot.data() || {};
			state.roomData = room;
			renderRoomControls();
			renderOwnerLobby();
			renderRoomWorkspaceFromSnapshot(room);
			renderWorkspace();
			if (room.lastCraftedName && room.lastCraftedAt && room.lastCraftedAt !== previousRoom.lastCraftedAt && room.lastCraftedAt > state.lastAchievementAtSeen) {
				showAchievement(`crafted ${room.lastCraftedName}`, room.lastCraftedByName || room.lastCraftedBy || '');
				state.lastAchievementAtSeen = room.lastCraftedAt;
			}
		});
	}

	function watchPresence(roomId) {
		if (!state.db) return;
		if (state.presenceUnsub) {
			state.presenceUnsub();
			state.presenceUnsub = null;
		}
		state.presenceUnsub = roomRef(roomId).collection(ROOM_PRESENCE_COLLECTION).onSnapshot((snapshot) => {
			state.roomCursors.clear();
			snapshot.forEach((doc) => {
				const data = doc.data() || {};
				state.roomCursors.set(doc.id, {
					uid: doc.id,
					name: normalizeName(data.name || 'Player'),
					x: Number(data.x || 0),
					y: Number(data.y || 0),
					color: String(data.color || '#7cf0c5'),
				});
			});
			renderPresenceLayer();
		});
	}

	async function syncOwnerLobby() {
		if (!isCurrentUserOwner() || !state.db) return;
		if (state.ownerLobbyUnsub) {
			state.ownerLobbyUnsub();
			state.ownerLobbyUnsub = null;
		}
		state.ownerLobbyUnsub = state.db.collection(ROOM_COLLECTION).orderBy('updatedAt', 'desc').limit(20).onSnapshot((snapshot) => {
			state.ownerRooms = snapshot.docs.map((doc) => ({ roomId: doc.id, ...doc.data() }));
			if (!state.selectedOwnerRoomId && state.ownerRooms.length) {
				state.selectedOwnerRoomId = state.ownerRooms[0].roomId;
			}
			renderOwnerLobby();
		});
	}

	function toggleAdminPanel(forceOpen) {
		if (!isCurrentUserOwner()) return;
		state.adminPanelOpen = typeof forceOpen === 'boolean' ? forceOpen : !state.adminPanelOpen;
		renderAdminPanel();
	}

	function renderAll() {
		updateCounter();
		renderStarterQuick();
		renderInventory();
		renderWorkspace();
		renderRoomControls();
		renderAdminPanel();
		renderOwnerLobby();
		renderPresenceLayer();
		if (els.tipBanner) {
			els.tipBanner.classList.toggle('is-hidden', state.workspaceNodes.length > 0);
		}
	}

	function beginInventoryDrag(elementId, pointerEvent) {
		const element = state.elementsById.get(elementId);
		if (!element) return;
		state.drag = {
			type: 'inventory',
			elementId,
			combineTargetId: '',
			ghost: null,
		};
		createGhost(element, pointerEvent.clientX, pointerEvent.clientY);
	}

	function beginWorkspaceDrag(nodeId, pointerEvent) {
		const node = findNodeById(nodeId);
		if (!node) return;
		const point = workspacePointFromClient(pointerEvent.clientX, pointerEvent.clientY);
		state.drag = {
			type: 'workspace',
			nodeId,
			offsetX: node.x - point.x,
			offsetY: node.y - point.y,
			combineTargetId: '',
			ghost: null,
		};
		renderWorkspace();
	}

	function createGhost(element, x, y) {
		const ghost = document.createElement('div');
		ghost.className = 'craft-node craft-ghost';
		ghost.innerHTML = `<span class="craft-node-emoji">${element.emoji}</span><span class="craft-node-name">${element.name}</span>`;
		ghost.style.left = `${x}px`;
		ghost.style.top = `${y}px`;
		document.body.appendChild(ghost);
		if (state.drag) state.drag.ghost = ghost;
	}

	function moveGhost(x, y) {
		if (!state.drag?.ghost) return;
		state.drag.ghost.style.left = `${x}px`;
		state.drag.ghost.style.top = `${y}px`;
	}

	function endDragCleanup(shouldRender = true) {
		if (state.drag?.ghost) state.drag.ghost.remove();
		state.drag = null;
		if (shouldRender) renderWorkspace();
	}

	function handlePointerMove(event) {
		state.cursorX = event.clientX;
		state.cursorY = event.clientY;
		if (state.roomId && state.user?.uid && Date.now() - state.cursorSendAt > CURSOR_UPDATE_MS) {
			state.cursorSendAt = Date.now();
			void updatePresence({ x: event.clientX, y: event.clientY });
		}
		if (!state.drag) return;
		if (state.drag.type === 'inventory') {
			moveGhost(event.clientX, event.clientY);
			if (!isClientPointInWorkspace(event.clientX, event.clientY)) {
				if (state.drag.combineTargetId) {
					state.drag.combineTargetId = '';
					renderWorkspace();
				}
				return;
			}
			const point = workspacePointFromClient(event.clientX, event.clientY);
			const target = findCombineTarget('', point.x, point.y);
			const targetId = target ? target.id : '';
			if (state.drag.combineTargetId !== targetId) {
				state.drag.combineTargetId = targetId;
				renderWorkspace();
			}
			return;
		}

		if (state.drag.type === 'workspace') {
			const node = findNodeById(state.drag.nodeId);
			if (!node) {
				endDragCleanup();
				return;
			}
			const point = workspacePointFromClient(event.clientX, event.clientY);
			const nextPoint = clampToWorkspace(point.x + state.drag.offsetX, point.y + state.drag.offsetY);
			node.x = nextPoint.x;
			node.y = nextPoint.y;
			const target = findCombineTarget(node.id, node.x, node.y);
			const targetId = target ? target.id : '';
			const nodeEl = els.workspace?.querySelector(`[data-node-id="${node.id}"]`);
			if (nodeEl) {
				nodeEl.style.left = `${node.x}px`;
				nodeEl.style.top = `${node.y}px`;
			}
			if (state.drag.combineTargetId !== targetId) {
				state.drag.combineTargetId = targetId;
				renderWorkspace();
			}
		}
	}

	function handlePointerUp(event) {
		if (!state.drag) return;
		const drag = state.drag;

		if (drag.type === 'inventory') {
			if (!isClientPointInWorkspace(event.clientX, event.clientY)) {
				endDragCleanup();
				return;
			}
			const point = workspacePointFromClient(event.clientX, event.clientY);
			const target = drag.combineTargetId ? findNodeById(drag.combineTargetId) : findCombineTarget('', point.x, point.y);
			if (target) {
				const tempNode = createWorkspaceNode(drag.elementId, point.x, point.y);
				if (tempNode) {
					void (async () => {
						const merged = await combineNodes(tempNode, target);
						if (!merged) {
							tempNode.x = Math.min(tempNode.x + 36, Math.max(30, (els.workspace?.getBoundingClientRect().width || tempNode.x) - 30));
							tempNode.y = Math.min(tempNode.y + 18, Math.max(30, (els.workspace?.getBoundingClientRect().height || tempNode.y) - 30));
							renderWorkspace();
						}
					})();
				}
			} else {
				createWorkspaceNode(drag.elementId, point.x, point.y);
				renderAll();
				void persistRoomWorkspace();
			}
			endDragCleanup(false);
			return;
		}

		if (drag.type === 'workspace') {
			const node = findNodeById(drag.nodeId);
			if (!node) {
				endDragCleanup();
				return;
			}
			if (isClientPointInSidebar(event.clientX, event.clientY)) {
				removeWorkspaceNode(node.id);
				endDragCleanup(false);
				return;
			}
			const target = drag.combineTargetId ? findNodeById(drag.combineTargetId) : null;
			if (target) {
				void combineNodes(node, target);
				endDragCleanup(false);
			} else {
				endDragCleanup(true);
				void persistRoomWorkspace();
				scheduleProgressPersist();
			}
		}
	}

	function spawnElementNearCenter(elementId) {
		if (!els.workspace) return;
		const rect = els.workspace.getBoundingClientRect();
		const x = rect.width * (0.42 + Math.random() * 0.16);
		const y = rect.height * (0.34 + Math.random() * 0.26);
		createWorkspaceNode(elementId, x, y);
		renderWorkspace();
		void persistRoomWorkspace();
	}

	function bindEvents() {
		if (els.starterQuick) {
			els.starterQuick.addEventListener('pointerdown', (event) => {
				const button = event.target.closest('[data-quick-id]');
				if (!button) return;
				const elementId = button.getAttribute('data-quick-id');
				if (!elementId) return;
				event.preventDefault();
				beginInventoryDrag(elementId, event);
			});
		}

		if (els.inventorySearch) {
			els.inventorySearch.addEventListener('input', () => {
				state.inventorySearch = els.inventorySearch.value || '';
				renderInventory();
			});
		}

		if (els.clearWorkspaceBtn) {
			els.clearWorkspaceBtn.addEventListener('click', () => {
				state.workspaceNodes = [];
				renderWorkspace();
				showNotice('Workspace cleared');
				void persistRoomWorkspace();
				scheduleProgressPersist();
			});
		}

		if (els.inventoryList) {
			els.inventoryList.addEventListener('pointerdown', (event) => {
				const button = event.target.closest('[data-inventory-id]');
				if (!button) return;
				const elementId = button.getAttribute('data-inventory-id');
				if (!elementId) return;
				event.preventDefault();
				beginInventoryDrag(elementId, event);
			});

			els.inventoryList.addEventListener('dblclick', (event) => {
				const button = event.target.closest('[data-inventory-id]');
				if (!button) return;
				const elementId = button.getAttribute('data-inventory-id');
				if (!elementId) return;
				spawnElementNearCenter(elementId);
			});
		}

		if (els.workspace) {
			els.workspace.addEventListener('pointerdown', (event) => {
				const nodeEl = event.target.closest('[data-node-id]');
				if (!nodeEl) return;
				const nodeId = nodeEl.getAttribute('data-node-id');
				if (!nodeId) return;
				event.preventDefault();
				beginWorkspaceDrag(nodeId, event);
			});

			els.workspace.addEventListener('contextmenu', (event) => {
				const nodeEl = event.target.closest('[data-node-id]');
				if (!nodeEl) return;
				event.preventDefault();
				const nodeId = nodeEl.getAttribute('data-node-id');
				if (!nodeId) return;
				removeWorkspaceNode(nodeId);
			});
		}

		if (els.createRoomBtn) {
			els.createRoomBtn.addEventListener('click', () => {
				void createRoom();
			});
		}

		if (els.copyRoomInviteBtn) {
			els.copyRoomInviteBtn.addEventListener('click', async () => {
				if (!state.roomId) {
					showNotice('Create or join a room first');
					return;
				}
				try {
					await navigator.clipboard.writeText(state.roomId);
					showNotice('Room code copied');
				} catch {
					showNotice(`Room code: ${state.roomId}`);
				}
			});
		}

		if (els.joinRoomBtn) {
			els.joinRoomBtn.addEventListener('click', () => {
				void joinRoom(els.joinRoomInput?.value || '');
			});
		}

		if (els.joinRoomInput) {
			els.joinRoomInput.addEventListener('keydown', (event) => {
				if (event.key !== 'Enter') return;
				void joinRoom(els.joinRoomInput.value || '');
			});
		}

		if (els.adminSearch) {
			els.adminSearch.addEventListener('input', () => {
				state.adminSearch = els.adminSearch.value || '';
				renderAdminPanel();
			});
		}

		if (els.adminBlockList) {
			els.adminBlockList.addEventListener('pointerdown', (event) => {
				const button = event.target.closest('[data-admin-block-id]');
				if (!button) return;
				const elementId = button.getAttribute('data-admin-block-id');
				if (!elementId) return;
				event.preventDefault();
				spawnElementNearCenter(elementId);
			});
		}

		if (els.refreshRoomsBtn) {
			els.refreshRoomsBtn.addEventListener('click', () => {
				void syncOwnerLobby();
			});
		}

		if (els.ownerLobbyBtn) {
			els.ownerLobbyBtn.addEventListener('click', () => {
				if (!isCurrentUserOwner()) return;
				state.ownerLobbyOpen = !state.ownerLobbyOpen;
				renderOwnerLobby();
			});
		}

		if (els.ownerRoomList) {
			els.ownerRoomList.addEventListener('click', (event) => {
				const button = event.target.closest('[data-owner-room-id]');
				if (!button) return;
				const roomId = button.getAttribute('data-owner-room-id');
				if (!roomId) return;
				state.selectedOwnerRoomId = roomId;
				renderOwnerLobby();
			});
		}

		if (els.spectateRoomBtn) {
			els.spectateRoomBtn.addEventListener('click', () => {
				const roomId = state.selectedOwnerRoomId;
				if (!roomId) return;
				watchRoom(roomId);
				watchPresence(roomId);
				selectRoom(roomId);
				showNotice(`Spectating ${roomId}`);
			});
		}

		if (els.joinRoomFromLobbyBtn) {
			els.joinRoomFromLobbyBtn.addEventListener('click', () => {
				const roomId = state.selectedOwnerRoomId;
				if (!roomId) return;
				void joinRoom(roomId);
			});
		}

		document.addEventListener('keydown', (event) => {
			if (event.ctrlKey && !event.shiftKey && event.key.toLowerCase() === 'a' && isCurrentUserOwner()) {
				const activeTag = document.activeElement?.tagName?.toLowerCase() || '';
				if (activeTag !== 'input' && activeTag !== 'textarea') {
					event.preventDefault();
					toggleAdminPanel();
				}
			}
		});

		document.addEventListener('pointermove', handlePointerMove);
		document.addEventListener('pointerup', handlePointerUp);
		window.addEventListener('resize', () => {
			state.workspaceNodes = state.workspaceNodes.map((node) => {
				const clamped = clampToWorkspace(node.x, node.y);
				return { ...node, x: clamped.x, y: clamped.y };
			});
			renderWorkspace();
			scheduleProgressPersist();
		});

		window.addEventListener('beforeunload', () => {
			persistProgress();
		});
	}

	function initializeElements() {
		STARTER_ELEMENTS.forEach((entry) => {
			state.starterIds.add(entry.id);
		});
		STARTER_ELEMENTS.forEach((entry) => {
			addElement(entry);
		});
		loadProgress();
	}

	function init() {
		if (!els.workspace || !els.inventoryList || !els.uniqueCounter) return;
		loadLiveCache();
		initializeElements();
		const firebase = getFirebase();
		if (firebase?.auth?.onAuthStateChanged) {
			firebase.auth.onAuthStateChanged((user) => {
				state.user = user ? {
					uid: String(user.uid || user.email || 'guest'),
					displayName: normalizeName(user.displayName || user.email || 'Player'),
				} : getCurrentUserInfo();
				if (!state.user) {
					state.user = getCurrentUserInfo() || { uid: 'guest', displayName: 'Player' };
				}
				if (isCurrentUserOwner()) {
					void syncOwnerLobby();
				}
				renderAll();
			});
		} else {
			state.user = getCurrentUserInfo() || { uid: 'guest', displayName: 'Player' };
		}
		window.addEventListener('playr-auth-changed', () => {
			state.user = getCurrentUserInfo() || state.user;
			if (isCurrentUserOwner()) {
				void syncOwnerLobby();
			}
			renderAll();
		});
		if (!API_ONLY_RECIPES_MODE) {
			void ensureLocalExtractRecipes();
			void ensureWikiIndex();
		}
		bindEvents();
		renderAll();
		startBoardAnimation();
	}

	init();
})();
