(() => {
	const size = 4;
	const boardElement = document.getElementById('gameBoard');
	const tilesLayer = document.getElementById('tilesLayer');
	const statusElement = document.getElementById('gameStatus');
	const overlayElement = document.getElementById('overlay');
	const overlayLabelElement = document.getElementById('overlayLabel');
	const overlayScoreElement = document.getElementById('overlayScore');
	const overlayTextElement = document.getElementById('overlayText');
	const restartButton = document.getElementById('restartButton');
	const overlayRestartButton = document.getElementById('overlayRestartButton');

	if (!boardElement || !tilesLayer || !statusElement || !overlayElement || !overlayLabelElement || !overlayScoreElement || !overlayTextElement || !restartButton || !overlayRestartButton) {
		return;
	}

	const tileColors = {
		2: { bg: '#eee4da', fg: '#776e65' },
		4: { bg: '#ede0c8', fg: '#776e65' },
		8: { bg: '#f2b179', fg: '#f9f6f2' },
		16: { bg: '#f59563', fg: '#f9f6f2' },
		32: { bg: '#f67c5f', fg: '#f9f6f2' },
		64: { bg: '#f65e3b', fg: '#f9f6f2' },
		128: { bg: '#edcf72', fg: '#f9f6f2' },
		256: { bg: '#edcc61', fg: '#f9f6f2' },
		512: { bg: '#edc850', fg: '#f9f6f2' },
		1024: { bg: '#edc53f', fg: '#f9f6f2' },
		2048: { bg: '#edc22e', fg: '#f9f6f2' }
	};

	const tileElements = new Map();
	const state = {
		tiles: [],
		nextTileId: 0,
		score: 0,
		won: false,
		over: false,
		swipeStart: null
	};

	function createTile(value, row, column, options = {}) {
		return {
			id: ++state.nextTileId,
			value,
			row,
			column,
			justSpawned: Boolean(options.justSpawned),
			justMerged: Boolean(options.justMerged)
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

		const exponent = Math.round(Math.log2(value));
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
		return { cellSize, gapSize };
	}

	function positionFor(row, column, layout) {
		const step = layout.cellSize + layout.gapSize;
		return {
			x: column * step,
			y: row * step
		};
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
			const lineTiles = buildLine(direction, lineIndex);
			let slotIndex = 0;

			for (let index = 0; index < lineTiles.length; index += 1) {
				const currentTile = lineTiles[index];
				const nextTile = lineTiles[index + 1];
				const target = getTargetPosition(direction, lineIndex, slotIndex);
				const currentMoved = currentTile.row !== target.row || currentTile.column !== target.column;

				if (nextTile && nextTile.value === currentTile.value) {
					const mergedValue = currentTile.value * 2;
					nextTiles.push({
						...currentTile,
						value: mergedValue,
						row: target.row,
						column: target.column,
						justMerged: true,
						justSpawned: false
					});
					scoreGain += mergedValue;
					changed = true;
					slotIndex += 1;
					index += 1;
					continue;
				}

				nextTiles.push({
					...currentTile,
					row: target.row,
					column: target.column,
					justMerged: false,
					justSpawned: false
				});
				if (currentMoved) {
					changed = true;
				}
				slotIndex += 1;
			}
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

	function formatStatus() {
		if (state.won) {
			return `Score: ${state.score} | 2048 reached`;
		}

		return `Score: ${state.score}`;
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
		if (state.over) {
			return;
		}

		const result = resolveMove(direction);
		if (!result.changed) {
			finishIfStuck();
			return;
		}

		state.tiles = result.nextTiles;
		state.score += result.scoreGain;
		for (const tile of state.tiles) {
			if (tile.value >= 2048) {
				state.won = true;
			}
		}

		spawnTile();
		if (!canMove()) {
			state.over = true;
		}

		render();
	}

	function handleKeydown(event) {
		const key = event.key.toLowerCase();
		const directionMap = {
			arrowleft: 'left',
			a: 'left',
			arrowright: 'right',
			d: 'right',
			arrowup: 'up',
			w: 'up',
			arrowdown: 'down',
			s: 'down'
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
		if (!state.swipeStart) {
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

	boardElement.addEventListener('keydown', handleKeydown);
	document.addEventListener('keydown', handleKeydown);
	boardElement.addEventListener('pointerdown', (event) => {
		if (event.pointerType === 'mouse' && event.button !== 0) {
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
	window.addEventListener('resize', render);

	restartGame();
})();
