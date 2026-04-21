/**
 * Shared Admin Toolkit for Playr
 * 
 * Provides dev controls: manual mine placement (Minesweeper), custom timing,
 * board clearing, and other game-specific admin capabilities.
 * 
 * Usage in game.js:
 * 1. Add adminState to your game's state object with: adminEnabled, adminMineEdit, adminCustomMines
 * 2. Call initAdminToolkit({ gameState, callbacks, elements })
 * 3. Pass callback functions for custom actions
 */

const AdminToolkit = {
	_isOwnerUser() {
		try {
			if (window.PlayrAuth && typeof window.PlayrAuth.getCurrentUser === 'function') {
				const user = window.PlayrAuth.getCurrentUser();
				if (user && String(user.displayName || '').trim().toLowerCase() === 'owner') {
					return true;
				}
			}
		} catch {
			// no-op
		}

		try {
			const raw = localStorage.getItem('playrCurrentUser');
			if (!raw) return false;
			const parsed = JSON.parse(raw);
			return String(parsed?.displayName || '').trim().toLowerCase() === 'owner';
		} catch {
			return false;
		}
	},

	/**
	 * Initialize admin toolkit for a game
	 * @param {Object} config
	 * @param {Object} config.gameState - Reference to the game's state object (must have admin fields)
	 * @param {Object} config.elements - DOM element references
	 * @param {HTMLElement} config.elements.adminTools - The admin-tools container
	 * @param {HTMLElement} config.elements.adminModeBtn - Toggle admin mode button
	 * @param {HTMLElement} config.elements.adminInfo - Info text display
	 * @param {HTMLElement} [config.elements.customButtons] - Map of {id: element} for game-specific buttons
	 * @param {HTMLElement} [config.elements.customInputs] - Map of {id: element} for game-specific inputs
	 * @param {Object} config.callbacks - Game-specific callback functions
	 * @param {Function} [config.callbacks.onClearBoard] - Called when clear board is triggered
	 * @param {Function} [config.callbacks.onMinePlaceToggle] - Called when mine edit mode is toggled
	 * @param {Function} [config.callbacks.onApplyTime] - Called when custom time is applied
	 * @param {Function} [config.callbacks.onRefreshUI] - Called to refresh UI state
	 * @returns {Object} Admin API { toggleMode, revealPanel, clearBoard, applyTime }
	 */
	init(config) {
		const { gameState, elements, callbacks } = config;

		// Validate required state fields
		if (!gameState.hasOwnProperty('adminEnabled') || !gameState.hasOwnProperty('adminMineEdit')) {
			console.error('AdminToolkit: gameState must have adminEnabled and adminMineEdit fields');
			return null;
		}

		// Validate required elements
		if (!elements.adminTools || !elements.adminModeBtn || !elements.adminInfo) {
			console.error('AdminToolkit: missing required DOM elements (adminTools, adminModeBtn, adminInfo)');
			return null;
		}

		const { adminTools, adminModeBtn, adminInfo } = elements;
		const api = {};

		/**
		 * Toggle admin mode on/off
		 */
		api.toggleMode = () => {
			if (!this._isOwnerUser()) {
				gameState.adminEnabled = false;
				gameState.adminMineEdit = false;
				adminInfo.textContent = 'Admin controls are restricted to the Owner account.';
				return;
			}

			gameState.adminEnabled = !gameState.adminEnabled;
			if (!gameState.adminEnabled) {
				gameState.adminMineEdit = false;
			}
			api.refreshUI();
			if (callbacks.onRefreshUI) callbacks.onRefreshUI();
		};

		/**
		 * Reveal the admin panel (without enabling)
		 */
		api.revealPanel = () => {
			if (!adminTools) return;
			adminTools.hidden = false;
			if (!this._isOwnerUser()) {
				gameState.adminEnabled = false;
				gameState.adminMineEdit = false;
				adminInfo.textContent = 'Admin controls are restricted to the Owner account.';
			}
		};

		/**
		 * Refresh admin UI state (button text, disabled states, info text)
		 */
		api.refreshUI = () => {
			if (!adminTools) return;
			const isOwner = this._isOwnerUser();
			if (!isOwner) {
				gameState.adminEnabled = false;
				gameState.adminMineEdit = false;
				adminModeBtn.textContent = 'Enable Admin';
				adminInfo.textContent = 'Admin controls are restricted to the Owner account.';
				if (elements.customButtons) {
					Object.values(elements.customButtons).forEach((btn) => {
						if (btn) btn.disabled = true;
					});
				}
				if (elements.customInputs) {
					Object.values(elements.customInputs).forEach((input) => {
						if (input) input.disabled = true;
					});
				}
				return;
			}

			adminModeBtn.textContent = gameState.adminEnabled ? 'Disable Admin' : 'Enable Admin';
			if (!gameState.adminEnabled) {
				adminInfo.textContent = 'Admin disabled. Add ?admin=1 to URL or press Ctrl+Shift+A to show this panel.';
			} else {
				adminInfo.textContent = 'Admin enabled. Game-specific controls are available above.';
			}
		};

		/**
		 * Clear board (game-specific implementation)
		 */
		api.clearBoard = () => {
			if (!gameState.adminEnabled) return;
			if (callbacks.onClearBoard) {
				callbacks.onClearBoard();
				api.refreshUI();
			}
		};

		/**
		 * Apply custom time (game-specific implementation)
		 */
		api.applyTime = (seconds) => {
			if (!gameState.adminEnabled) return;
			if (callbacks.onApplyTime) {
				callbacks.onApplyTime(seconds);
			}
		};

		/**
		 * Setup event listeners
		 */
		this._setupEventListeners(gameState, adminModeBtn, elements, callbacks, api);

		return api;
	},

	/**
	 * Setup keyboard and URL parameter listeners for admin mode
	 * Called internally during init()
	 */
	_setupEventListeners(gameState, adminModeBtn, elements, callbacks, api) {
		// Admin mode button toggle
		adminModeBtn.addEventListener('click', () => {
			api.toggleMode();
		});

		// Ctrl+Shift+A keyboard shortcut
		window.addEventListener('keydown', (event) => {
			if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'a') {
				event.preventDefault();
				if (!this._isOwnerUser()) {
					elements.adminInfo.textContent = 'Admin controls are restricted to the Owner account.';
					return;
				}
				api.revealPanel();
			}
		});

		// Check URL for ?admin=1 on page load
		const hasAdminQuery = new URLSearchParams(window.location.search).get('admin') === '1';
		if (hasAdminQuery) {
			api.revealPanel();
			gameState.adminEnabled = this._isOwnerUser();
			api.refreshUI();
		}

		window.addEventListener('playr-auth-changed', () => {
			api.refreshUI();
		});
	},
};
