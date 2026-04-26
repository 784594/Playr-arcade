(() => {
	const size = 4;
	const OWNER_IDENTIFIER = 'owner@playr.io';
	const boardElement = document.getElementById('gameBoard');
	const tilesLayer = document.getElementById('tilesLayer');
	const statusElement = document.getElementById('gameStatus');
	const overlayElement = document.getElementById('overlay');
	const overlayLabelElement = document.getElementById('overlayLabel');
	const overlayScoreElement = document.getElementById('overlayScore');
	const overlayTextElement = document.getElementById('overlayText');
	const restartButton = document.getElementById('restartButton');
	const overlayRestartButton = document.getElementById('overlayRestartButton');
	const adminTools = document.getElementById('adminTools');
	const adminModeBtn = document.getElementById('adminModeBtn');
	const adminInfo = document.getElementById('adminInfo');
	const adminValueInput = document.getElementById('adminValueInput');
	const adminAddTileBtn = document.getElementById('adminAddTileBtn');
	const adminRemoveTileBtn = document.getElementById('adminRemoveTileBtn');
	const adminSelection = document.getElementById('adminSelection');

	if (
		!boardElement
		|| !tilesLayer
		|| !statusElement
		|| !overlayElement
		|| !overlayLabelElement
		|| !overlayScoreElement
		|| !overlayTextElement
		|| !restartButton
		|| !overlayRestartButton
	) {
		return;
	}

	const tileColors = {
		2: { bg: '#d7ecff', fg: '#14243d' },
		4: { bg: '#bfe1ff', fg: '#10233f' },
		8: { bg: '#8cd5ff', fg: '#0b1f35' },
		16: { bg: '#72c6ff', fg: '#081c31' },
		32: { bg: '#65b8ff', fg: '#07182b' },
		64: { bg: '#66e3da', fg: '#05221f' },
		128: { bg: '#56d6c9', fg: '#04201b' },
		256: { bg: '#48c9bd', fg: '#031c18' },
		512: { bg: '#4db8e8', fg: '#041b2b' },
		1024: { bg: '#4a9ef2', fg: '#04192a' },
		2048: { bg: '#7cf0c5', fg: '#03231b' },
	};

	const tileElements = new Map();
	const selectionLayer = document.createElement('div');
	const selectionHighlight = document.createElement('div');
	selectionLayer.className = 'selection-layer';
	selectionHighlight.className = 'selection-highlight';
	selectionLayer.appendChild(selectionHighlight);
	boardElement.insertBefore(selectionLayer, overlayElement);

	const state = {
		tiles: [],
		nextTileId: 0,
		score: 0,
		won: false,
		over: false,
		swipeStart: null,
		adminEnabled: false,
		selectedCell: null,
	};

	function normalizeIdentifier(value) {
		return String(value || '').trim().toLowerCase();
	}

	function getStoredLegacyUser() {
		try {
			const raw = localStorage.getItem('playrCurrentUser');
			return raw ? JSON.parse(raw) : null;
		} catch {
			return null;
		}
	}

	function getCurrentRecord() {
		if (window.PlayrProgression && typeof window.PlayrProgression.getCurrentRecord === 'function') {
			return window.PlayrProgression.getCurrentRecord();
		}
		return getStoredLegacyUser();
	}

	function isOwnerUser() {
		const record = getCurrentRecord();
		return normalizeIdentifier(record?.identifier) === OWNER_IDENTIFIER;
	}

	function createTile(value, row, column, options = {}) {
		return {
			id: ++state.nextTileId,
			value,
			row,
			column,
			justSpawned: Boolean(options.justSpawned),
			justMerged: Boolean(options.justMerged),
		};
	}

	function resetTileFlags(tile) {
		tile.justSpawned = false;
		tile.justMerged = false;
	}

	function getTileStyle(value) {
		if (tileColors[value]) {
			return tileColors[value];
		}

		const safeValue = Math.max(2, Number(value) || 2);
		const exponent = Math.round(Math.log2(safeValue));
		const hue = (35 + exponent * 18) % 360;
		return { bg: `hsl(${hue} 78% 58%)`, fg: '#f9f6f2' };
	}

	function getGapSize() {
		const computedGap = getComputedStyle(boardElement).getPropertyValue('--tile-gap').trim();
		const gapSize = Number.parseFloat(computedGap);
		return Number.isFinite(gapSize) ? gapSize : 12;
	}

	function getLayout() {
		const bounds = tilesLayer.getBoundingClientRect();
		const gapSize = getGapSize();
		const cellSize = Math.max((Math.min(bounds.width, bounds.height) - gapSize * (size - 1)) / size, 0);
		return { cellSize, gapSize, bounds };
	}

	function positionFor(row, column, layout) {
		const step = layout.cellSize + layout.gapSize;
		return {
			x: column * step,
			y: row * step,
		};
	}

	function renderSelection(layout = getLayout()) {
		const selected = state.selectedCell;
		if (!selected || !state.adminEnabled || !isOwnerUser()) {
			selectionHighlight.classList.remove('visible');
			return;
		}

		const position = positionFor(selected.row, selected.column, layout);
		selectionHighlight.style.width = `${layout.cellSize}px`;
		selectionHighlight.style.height = `${layout.cellSize}px`;
		selectionHighlight.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
		selectionHighlight.classList.add('visible');
	}

	function getEmptyCells() {
		const occupied = new Set(state.tiles.map((tile) => `${tile.row}:${tile.column}`));
		const cells = [];

		for (let row = 0; row < size; row += 1) {
			for (let column = 0; column < size; column += 1) {
				if (!occupied.has(`${row}:${column}`)) {
					cells.push({ row, column });
				}
			}
		}

		return cells;
	}

	function spawnTile() {
		const emptyCells = getEmptyCells();
		if (emptyCells.length === 0) {
			return false;
		}

		const { row, column } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
		const value = Math.random() < 0.9 ? 2 : 4;
		state.tiles.push(createTile(value, row, column, { justSpawned: true }));
		return true;
	}

	function buildLine(direction, lineIndex) {
		const tiles = state.tiles.filter((tile) => {
			if (direction === 'left' || direction === 'right') {
				return tile.row === lineIndex;
			}

			return tile.column === lineIndex;
		});

		return tiles.sort((leftTile, rightTile) => {
			if (direction === 'left') {
				return leftTile.column - rightTile.column;
			}

			if (direction === 'right') {
				return rightTile.column - leftTile.column;
			}

			if (direction === 'up') {
				return leftTile.row - rightTile.row;
			}

			return rightTile.row - leftTile.row;
		});
	}

	function getTargetPosition(direction, lineIndex, slotIndex) {
		if (direction === 'left') {
			return { row: lineIndex, column: slotIndex };
		}

		if (direction === 'right') {
			return { row: lineIndex, column: size - 1 - slotIndex };
		}

		if (direction === 'up') {
			return { row: slotIndex, column: lineIndex };
		}

		return { row: size - 1 - slotIndex, column: lineIndex };
	}

	function resolveMove(direction) {
		const nextTiles = [];
		let scoreGain = 0;
		let changed = false;

		for (let lineIndex = 0; lineIndex < size; lineIndex += 1) {
			let lineTiles = buildLine(direction, lineIndex).map((tile) => ({
				...tile,
				justMerged: false,
				justSpawned: false,
			}));

			let mergedInPass = true;
			while (mergedInPass && lineTiles.length > 1) {
				mergedInPass = false;
				const nextLine = [];

				for (let index = 0; index < lineTiles.length; index += 1) {
					const currentTile = lineTiles[index];
					const nextTile = lineTiles[index + 1];

					if (nextTile && nextTile.value === currentTile.value) {
						const mergedValue = currentTile.value * 2;
						nextLine.push({
							...currentTile,
							value: mergedValue,
							justMerged: true,
							justSpawned: false,
						});
						scoreGain += mergedValue;
						changed = true;
						mergedInPass = true;
						index += 1;
						continue;
					}

					nextLine.push({
						...currentTile,
						justSpawned: false,
					});
				}

				lineTiles = nextLine;
			}

			lineTiles.forEach((tile, slotIndex) => {
				const target = getTargetPosition(direction, lineIndex, slotIndex);
				const currentMoved = tile.row !== target.row || tile.column !== target.column;
				nextTiles.push({
					...tile,
					row: target.row,
					column: target.column,
				});
				if (currentMoved) {
					changed = true;
				}
			});
		}

		return { nextTiles, scoreGain, changed };
	}

	function canMove() {
		if (state.tiles.length < size * size) {
			return true;
		}

		const matrix = Array.from({ length: size }, () => Array(size).fill(0));
		for (const tile of state.tiles) {
			matrix[tile.row][tile.column] = tile.value;
		}

		for (let row = 0; row < size; row += 1) {
			for (let column = 0; column < size; column += 1) {
				const value = matrix[row][column];
				if (row + 1 < size && matrix[row + 1][column] === value) {
					return true;
				}
				if (column + 1 < size && matrix[row][column + 1] === value) {
					return true;
				}
			}
		}

		return false;
	}

	function getTileAt(row, column) {
		return state.tiles.find((tile) => tile.row === row && tile.column === column) || null;
	}

	function recalculateStateFlags() {
		state.score = Math.max(0, Math.trunc(Number(state.score) || 0));
		state.won = state.tiles.some((tile) => tile.value >= 2048);
		state.over = state.tiles.length > 0 && !canMove();
	}

	function formatStatus() {
		if (state.won) {
			return `Score: ${state.score} | 2048 reached`;
		}

		return `Score: ${state.score}`;
	}

	function syncAdminUi() {
		if (!adminTools || !adminModeBtn || !adminInfo || !adminValueInput || !adminAddTileBtn || !adminRemoveTileBtn || !adminSelection) {
			return;
		}

		const owner = isOwnerUser();
		if (!owner) {
			state.adminEnabled = false;
			state.selectedCell = null;
			adminTools.hidden = true;
			renderSelection();
			return;
		}

		adminTools.hidden = false;
		adminModeBtn.textContent = state.adminEnabled ? 'Disable Admin' : 'Enable Admin';
		adminValueInput.disabled = !state.adminEnabled;
		adminAddTileBtn.disabled = !state.adminEnabled || !state.selectedCell;
		adminRemoveTileBtn.disabled = !state.adminEnabled || !state.selectedCell;

		if (!state.adminEnabled) {
			adminInfo.textContent = 'Admin disabled. Enable it to click a cell and edit the board.';
		} else {
			adminInfo.textContent = 'Admin enabled. Click a cell to target it, then add/update or remove a tile.';
		}

		if (!state.selectedCell) {
			adminSelection.textContent = 'No cell selected.';
		} else {
			const tile = getTileAt(state.selectedCell.row, state.selectedCell.column);
			adminSelection.textContent = `Selected row ${state.selectedCell.row + 1}, column ${state.selectedCell.column + 1}${tile ? ` | current: ${tile.value}` : ' | empty cell'}`;
		}
	}

	function render() {
		const layout = getLayout();
		const activeIds = new Set(state.tiles.map((tile) => tile.id));

		for (const [id, element] of tileElements) {
			if (!activeIds.has(id)) {
				element.remove();
				tileElements.delete(id);
			}
		}

		for (const tile of state.tiles) {
			let element = tileElements.get(tile.id);
			const isNewElement = !element;

			if (!element) {
				element = document.createElement('div');
				element.className = 'tile';
				tileElements.set(tile.id, element);
				tilesLayer.appendChild(element);
			}

			const tileStyle = getTileStyle(tile.value);
			const position = positionFor(tile.row, tile.column, layout);
			element.dataset.value = String(tile.value);
			element.style.width = `${layout.cellSize}px`;
			element.style.height = `${layout.cellSize}px`;
			element.style.setProperty('--tile-bg', tileStyle.bg);
			element.style.setProperty('--tile-fg', tileStyle.fg);
			element.textContent = String(tile.value);
			element.style.left = '0px';
			element.style.top = '0px';

			if (isNewElement && tile.justSpawned) {
				element.classList.add('tile--spawn');
				element.style.opacity = '0';
				element.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) scale(0.72)`;
			} else if (tile.justMerged) {
				element.classList.add('tile--merged');
				element.style.opacity = '1';
				element.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) scale(1.08)`;
				requestAnimationFrame(() => {
					element.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) scale(1)`;
					element.classList.remove('tile--merged');
				});
			} else {
				element.style.opacity = '1';
				element.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) scale(1)`;
			}

			if (isNewElement && tile.justSpawned) {
				requestAnimationFrame(() => {
					element.classList.remove('tile--spawn');
					element.style.opacity = '1';
					element.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) scale(1)`;
				});
			}

			resetTileFlags(tile);
		}

		statusElement.textContent = formatStatus();
		syncAdminUi();
		renderSelection(layout);

		if (state.over) {
			overlayLabelElement.textContent = 'You lost';
			overlayScoreElement.textContent = `Final score: ${state.score}`;
			overlayTextElement.textContent = 'No more moves are available. Restart and try again.';
			overlayElement.classList.remove('hidden');
		} else {
			overlayElement.classList.add('hidden');
		}
	}

	function restartGame() {
		state.tiles = [];
		state.nextTileId = 0;
		state.score = 0;
		state.won = false;
		state.over = false;
		state.swipeStart = null;
		state.selectedCell = null;
		overlayElement.classList.add('hidden');
		spawnTile();
		spawnTile();
		render();
		boardElement.focus({ preventScroll: true });
	}

	function finishIfStuck() {
		if (!canMove()) {
			state.over = true;
			render();
		}
	}

	function move(direction) {
		if (state.over || state.adminEnabled) {
			return;
		}

		const result = resolveMove(direction);
		if (!result.changed) {
			finishIfStuck();
			return;
		}

		state.tiles = result.nextTiles;
		state.score += result.scoreGain;
		recalculateStateFlags();
		spawnTile();
		recalculateStateFlags();
		render();
	}

	function handleKeydown(event) {
		if (state.adminEnabled || event.defaultPrevented) {
			return;
		}

		const key = event.key.toLowerCase();
		const directionMap = {
			arrowleft: 'left',
			a: 'left',
			arrowright: 'right',
			d: 'right',
			arrowup: 'up',
			w: 'up',
			arrowdown: 'down',
			s: 'down',
		};

		const direction = directionMap[key];
		if (!direction) {
			return;
		}

		event.preventDefault();
		move(direction);
	}

	function startSwipe(point) {
		state.swipeStart = point;
	}

	function endSwipe(point) {
		if (!state.swipeStart || state.adminEnabled) {
			return;
		}

		const deltaX = point.clientX - state.swipeStart.clientX;
		const deltaY = point.clientY - state.swipeStart.clientY;
		const distance = Math.max(Math.abs(deltaX), Math.abs(deltaY));
		state.swipeStart = null;

		if (distance < 28) {
			return;
		}

		if (Math.abs(deltaX) > Math.abs(deltaY)) {
			move(deltaX > 0 ? 'right' : 'left');
			return;
		}

		move(deltaY > 0 ? 'down' : 'up');
	}

	function getCellFromPoint(clientX, clientY) {
		const layout = getLayout();
		const x = clientX - layout.bounds.left;
		const y = clientY - layout.bounds.top;
		const step = layout.cellSize + layout.gapSize;
		const column = Math.max(0, Math.min(size - 1, Math.floor(x / step)));
		const row = Math.max(0, Math.min(size - 1, Math.floor(y / step)));
		return { row, column };
	}

	function selectCellFromEvent(event) {
		if (!state.adminEnabled || !isOwnerUser()) {
			return;
		}

		state.selectedCell = getCellFromPoint(event.clientX, event.clientY);
		render();
	}

	function parseAdminValue() {
		return Math.max(1, Math.trunc(Number(adminValueInput?.value) || 0));
	}

	function applySelectedTileValue() {
		if (!state.adminEnabled || !state.selectedCell) {
			return;
		}

		const nextValue = parseAdminValue();
		if (!nextValue) {
			return;
		}

		if (adminValueInput) {
			adminValueInput.value = String(nextValue);
		}

		const existingTile = getTileAt(state.selectedCell.row, state.selectedCell.column);
		const previousValue = existingTile ? existingTile.value : 0;

		if (existingTile) {
			existingTile.value = nextValue;
			existingTile.justMerged = false;
			existingTile.justSpawned = false;
		} else {
			state.tiles.push(createTile(nextValue, state.selectedCell.row, state.selectedCell.column, { justSpawned: true }));
		}

		state.score = Math.max(0, state.score - previousValue + nextValue);
		recalculateStateFlags();
		render();
	}

	function removeSelectedTile() {
		if (!state.adminEnabled || !state.selectedCell) {
			return;
		}

		const tile = getTileAt(state.selectedCell.row, state.selectedCell.column);
		if (!tile) {
			render();
			return;
		}

		state.tiles = state.tiles.filter((entry) => entry.id !== tile.id);
		state.score = Math.max(0, state.score - tile.value);
		recalculateStateFlags();
		render();
	}

	boardElement.addEventListener('keydown', handleKeydown);
	document.addEventListener('keydown', handleKeydown);
	boardElement.addEventListener('pointerdown', (event) => {
		if (event.pointerType === 'mouse' && event.button !== 0) {
			return;
		}
		if (state.adminEnabled) {
			return;
		}

		startSwipe({ clientX: event.clientX, clientY: event.clientY });
		if (boardElement.setPointerCapture) {
			try {
				boardElement.setPointerCapture(event.pointerId);
			} catch (error) {
				void error;
			}
		}
	});
	boardElement.addEventListener('pointerup', (event) => {
		if (state.adminEnabled) {
			selectCellFromEvent(event);
			return;
		}
		endSwipe({ clientX: event.clientX, clientY: event.clientY });
	});
	boardElement.addEventListener('pointercancel', () => {
		state.swipeStart = null;
	});
	boardElement.addEventListener('lostpointercapture', () => {
		state.swipeStart = null;
	});
	restartButton.addEventListener('click', restartGame);
	overlayRestartButton.addEventListener('click', restartGame);
	overlayElement.addEventListener('click', (event) => {
		if (event.target === overlayRestartButton) {
			restartGame();
		}
	});
	overlayRestartButton.addEventListener('pointerdown', (event) => {
		event.stopPropagation();
	});
	window.addEventListener('resize', render);

	if (adminModeBtn) {
		adminModeBtn.addEventListener('click', () => {
			if (!isOwnerUser()) {
				state.adminEnabled = false;
				syncAdminUi();
				return;
			}

			state.adminEnabled = !state.adminEnabled;
			if (!state.adminEnabled) {
				state.selectedCell = null;
			}
			render();
		});
	}

	if (adminAddTileBtn) {
		adminAddTileBtn.addEventListener('click', applySelectedTileValue);
	}

	if (adminRemoveTileBtn) {
		adminRemoveTileBtn.addEventListener('click', removeSelectedTile);
	}

	window.addEventListener('playr-auth-changed', () => {
		if (!isOwnerUser()) {
			state.adminEnabled = false;
			state.selectedCell = null;
		}
		render();
	});

	window.addEventListener('storage', (event) => {
		if (event.key === 'playrCurrentUser' || event.key === 'playrProfiles') {
			if (!isOwnerUser()) {
				state.adminEnabled = false;
				state.selectedCell = null;
			}
			render();
		}
	});

	restartGame();
})();
