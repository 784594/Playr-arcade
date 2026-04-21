const MODES = {
	easy: { rows: 9, cols: 9, mines: 10 },
	medium: { rows: 16, cols: 16, mines: 40 },
	hard: { rows: 22, cols: 22, mines: 99 },
};

const BEST_KEY = 'playr.minesweeper.bestTimes.v1';

const boardEl = document.getElementById('mineBoard');
const roundStatusEl = document.getElementById('roundStatus');
const minesLeftEl = document.getElementById('minesLeft');
const timerEl = document.getElementById('timer');
const hintTextEl = document.getElementById('hintText');
const boardMetaEl = document.getElementById('boardMeta');
const newBoardBtn = document.getElementById('newBoardBtn');
const playAgainOverlay = document.getElementById('playAgainOverlay');
const modeButtons = Array.from(document.querySelectorAll('[data-mode]'));
const gameStatus = document.getElementById('gameStatus');
const adminSidebarToggleBtn = document.getElementById('adminSidebarToggleBtn');
const adminTools = document.getElementById('adminTools');
const adminModeBtn = document.getElementById('adminModeBtn');
const adminMineEditBtn = document.getElementById('adminMineEditBtn');
const adminClearMinesBtn = document.getElementById('adminClearMinesBtn');
const adminTimeInput = document.getElementById('adminTimeInput');
const adminApplyTimeBtn = document.getElementById('adminApplyTimeBtn');
const adminResetScoresBtn = document.getElementById('adminResetScoresBtn');
const adminRevertScoresBtn = document.getElementById('adminRevertScoresBtn');
const adminInfo = document.getElementById('adminInfo');
const leaderboardPreviewBody = document.getElementById('leaderboardPreviewBody');

const bestTimeEls = {
	easy: document.getElementById('bestEasy'),
	medium: document.getElementById('bestMedium'),
	hard: document.getElementById('bestHard'),
};

let adminAPI = null;

const state = {
	mode: 'easy',
	rows: MODES.easy.rows,
	cols: MODES.easy.cols,
	mineTotal: MODES.easy.mines,
	board: [],
	firstRevealDone: false,
	gameEnded: false,
	won: false,
	revealedCount: 0,
	flagged: new Set(),
	seconds: 0,
	timerId: null,
	cellSize: 30,
	inputLocked: false,
	mineRevealTimerId: null,
	bestTimes: loadBestTimes(),
	adminEnabled: false,
	adminMineEdit: false,
	adminCustomMines: false,
	showPlayAgainOverlay: false,
	adminSidebarOpen: false,
	adminScoreSnapshot: null,
};

function isOwnerAccount() {
	try {
		if (window.PlayrAuth && typeof window.PlayrAuth.getCurrentUser === 'function') {
			const user = window.PlayrAuth.getCurrentUser();
			if (String(user?.displayName || '').trim().toLowerCase() === 'owner') {
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
}

function refreshAdminSidebarUi() {
	const isOwner = isOwnerAccount();
	if (adminSidebarToggleBtn) {
		adminSidebarToggleBtn.hidden = !isOwner;
		adminSidebarToggleBtn.textContent = state.adminSidebarOpen ? 'Hide Admin' : 'Show Admin';
	}

	if (!adminTools) return;
	if (!isOwner) {
		adminTools.hidden = true;
		state.adminSidebarOpen = false;
		return;
	}

	adminTools.hidden = !state.adminSidebarOpen;
}

function loadBestTimes() {
	try {
		const parsed = JSON.parse(localStorage.getItem(BEST_KEY) || '{}');
		return {
			easy: typeof parsed.easy === 'number' ? parsed.easy : null,
			medium: typeof parsed.medium === 'number' ? parsed.medium : null,
			hard: typeof parsed.hard === 'number' ? parsed.hard : null,
		};
	} catch {
		return { easy: null, medium: null, hard: null };
	}
}

function saveBestTimes() {
	localStorage.setItem(BEST_KEY, JSON.stringify(state.bestTimes));
}

function idx(row, col) {
	return row * state.cols + col;
}

function key(row, col) {
	return `${row}:${col}`;
}

function neighbors(row, col) {
	const out = [];
	for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
		for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
			if (rowOffset === 0 && colOffset === 0) continue;
			const nextRow = row + rowOffset;
			const nextCol = col + colOffset;
			if (nextRow >= 0 && nextRow < state.rows && nextCol >= 0 && nextCol < state.cols) {
				out.push([nextRow, nextCol]);
			}
		}
	}
	return out;
}

function startTimer() {
	if (state.timerId) return;
	state.timerId = window.setInterval(() => {
		state.seconds += 1;
		timerEl.textContent = `${state.seconds}s`;
	}, 1000);
}

function stopTimer() {
	if (!state.timerId) return;
	window.clearInterval(state.timerId);
	state.timerId = null;
}

function stopMineRevealAnimation() {
	if (!state.mineRevealTimerId) return;
	window.clearInterval(state.mineRevealTimerId);
	state.mineRevealTimerId = null;
}

function getCellSize() {
	const playArea = boardEl.closest('.play-area');
	if (!playArea) return 30;
	const boardTop = boardEl.getBoundingClientRect().top;
	const availableWidth = Math.max(220, playArea.clientWidth - 40);
	const availableHeight = Math.max(220, window.innerHeight - boardTop - 20);
	const totalGaps = (state.cols - 1) * 4;
	const totalPadding = 20;
	const byWidth = Math.floor((availableWidth - totalGaps - totalPadding) / state.cols);
	const byHeight = Math.floor((availableHeight - totalGaps - totalPadding) / state.rows);
	const raw = Math.min(byWidth, byHeight);
	return Math.max(16, Math.min(42, raw));
}

function resetBoard(mode = state.mode) {
	const config = MODES[mode];
	stopMineRevealAnimation();
	state.mode = mode;
	state.rows = config.rows;
	state.cols = config.cols;
	state.mineTotal = config.mines;
	state.board = Array.from({ length: state.rows * state.cols }, (_, index) => ({
		row: Math.floor(index / state.cols),
		col: index % state.cols,
		mine: false,
		adjacent: 0,
		revealed: false,
		flagged: false,
	}));
	state.firstRevealDone = false;
	state.gameEnded = false;
	state.won = false;
	state.revealedCount = 0;
	state.flagged = new Set();
	state.seconds = 0;
	state.inputLocked = false;
	state.showPlayAgainOverlay = false;
	state.adminMineEdit = false;
	state.adminCustomMines = false;
	stopTimer();

	modeButtons.forEach((button) => button.classList.toggle('active', button.dataset.mode === mode));
	roundStatusEl.textContent = '';
	timerEl.textContent = '0s';
	boardMetaEl.textContent = `${state.rows} x ${state.cols}`;
	hintTextEl.textContent = 'Left click to reveal. Right click to flag. If flags around a number match it, click that number to chord-open nearby cells.';
	newBoardBtn.hidden = false;
	playAgainOverlay.hidden = true;
	refreshMinesweepersAdminUi();
	updateMinesLeft();
	renderBoard();
}

function mineCount() {
	return state.board.reduce((count, cell) => count + (cell.mine ? 1 : 0), 0);
}

function updateMinesLeft() {
	const target = state.adminCustomMines ? mineCount() : state.mineTotal;
	minesLeftEl.textContent = String(Math.max(0, target - state.flagged.size));
}

function plantMines(firstIndex) {
	if (state.adminCustomMines) return;
	const candidates = state.board.map((_, index) => index).filter((index) => index !== firstIndex);
	let remaining = state.mineTotal;

	while (remaining > 0 && candidates.length > 0) {
		const pick = Math.floor(Math.random() * candidates.length);
		const minedIndex = candidates.splice(pick, 1)[0];
		state.board[minedIndex].mine = true;
		remaining -= 1;
	}

	state.board.forEach((cell) => {
		if (cell.mine) return;
		cell.adjacent = neighbors(cell.row, cell.col).reduce((count, [nextRow, nextCol]) => {
			return count + (state.board[idx(nextRow, nextCol)].mine ? 1 : 0);
		}, 0);
	});
}

function revealAllMines() {
	state.board.forEach((cell) => {
		if (cell.mine) cell.revealed = true;
	});
}

function floodReveal(startIndex) {
	const queue = [startIndex];
	while (queue.length > 0) {
		const current = queue.shift();
		const cell = state.board[current];
		if (!cell || cell.revealed || cell.flagged) continue;

		cell.revealed = true;
		state.revealedCount += 1;

		if (cell.adjacent !== 0 || cell.mine) continue;
		neighbors(cell.row, cell.col).forEach(([nextRow, nextCol]) => {
			const nextIndex = idx(nextRow, nextCol);
			const nextCell = state.board[nextIndex];
			if (nextCell && !nextCell.revealed && !nextCell.flagged) {
				queue.push(nextIndex);
			}
		});
	}
}

function countFlaggedNeighbors(row, col) {
	return neighbors(row, col).reduce((count, [nextRow, nextCol]) => {
		const k = key(nextRow, nextCol);
		return count + (state.flagged.has(k) ? 1 : 0);
	}, 0);
}

function chordReveal(index) {
	if (state.inputLocked) return;
	const cell = state.board[index];
	if (!cell || !cell.revealed || cell.adjacent === 0) return;
	const flaggedAround = countFlaggedNeighbors(cell.row, cell.col);
	if (flaggedAround !== cell.adjacent) return;

	neighbors(cell.row, cell.col).forEach(([nextRow, nextCol]) => {
		const nextIndex = idx(nextRow, nextCol);
		const nextCell = state.board[nextIndex];
		if (!nextCell || nextCell.flagged || nextCell.revealed) return;
		revealCell(nextIndex);
	});
}

function checkWin() {
	const effectiveMines = state.adminCustomMines ? mineCount() : state.mineTotal;
	const safeCells = state.rows * state.cols - effectiveMines;
	if (state.revealedCount !== safeCells) return false;

	state.gameEnded = true;
	state.won = true;
	state.inputLocked = true;
	stopTimer();
	roundStatusEl.textContent = 'Cleared';
	hintTextEl.textContent = 'Board cleared. Switch mode or start a fresh board.';

	const recordedSeconds = Math.max(1, state.seconds);
	if (state.adminEnabled) {
		captureAdminScoreSnapshotIfNeeded();
	}
	const currentBest = state.bestTimes[state.mode];
	if (currentBest === null || recordedSeconds < currentBest) {
		state.bestTimes[state.mode] = recordedSeconds;
		saveBestTimes();
		renderBestTimes();
		hintTextEl.textContent = `New ${state.mode} best time: ${recordedSeconds}s.`;
	}

	renderBoard();
	state.inputLocked = false;
	state.showPlayAgainOverlay = true;
	playAgainOverlay.hidden = false;
	newBoardBtn.hidden = true;
	return true;
}

function loseGame() {
	state.gameEnded = true;
	state.won = false;
	state.inputLocked = true;
	stopTimer();
	roundStatusEl.textContent = 'Exploded';
	hintTextEl.textContent = 'Mine triggered. Start a new board and try again.';

	const mineIndices = state.board
		.map((cell, index) => ({ cell, index }))
		.filter((entry) => entry.cell.mine && !entry.cell.revealed)
		.map((entry) => entry.index);

	if (mineIndices.length === 0) {
		renderBoard();
		state.inputLocked = false;
		state.showPlayAgainOverlay = true;
		playAgainOverlay.hidden = false;
		newBoardBtn.hidden = true;
		return;
	}

	newBoardBtn.hidden = true;

	let revealCursor = 0;
	state.mineRevealTimerId = window.setInterval(() => {
		const revealIndex = mineIndices[revealCursor];
		if (typeof revealIndex === 'number') {
			state.board[revealIndex].revealed = true;
			renderBoard();
			revealCursor += 1;
		}

		if (revealCursor >= mineIndices.length) {
			stopMineRevealAnimation();
			state.inputLocked = false;
			state.showPlayAgainOverlay = true;
			playAgainOverlay.hidden = false;
		}
	}, 42);
}

function revealCell(index) {
	if (state.gameEnded || state.inputLocked) return;
	const cell = state.board[index];
	if (!cell || cell.flagged || cell.revealed) return;

	if (state.adminEnabled && state.adminMineEdit && !state.firstRevealDone) {
		cell.mine = !cell.mine;
		state.adminCustomMines = true;
		updateAdjacentCounts();
		updateMinesLeft();
		renderBoard();
		return;
	}

	if (!state.firstRevealDone) {
		plantMines(index);
		updateAdjacentCounts();
		state.firstRevealDone = true;
		startTimer();
		roundStatusEl.textContent = 'Playing';
	}

	if (cell.mine) {
		cell.revealed = true;
		loseGame();
		return;
	}

	floodReveal(index);
	renderBoard();
	updateMinesLeft();
	checkWin();
}

function toggleFlag(index) {
	if (state.gameEnded || state.inputLocked) return;
	if (state.adminEnabled && state.adminMineEdit && !state.firstRevealDone) return;
	const cell = state.board[index];
	if (!cell || cell.revealed) return;

	const k = key(cell.row, cell.col);
	cell.flagged = !cell.flagged;
	if (cell.flagged) {
		state.flagged.add(k);
	} else {
		state.flagged.delete(k);
	}

	if (!state.firstRevealDone) {
		roundStatusEl.textContent = '';
	}

	updateMinesLeft();
	renderBoard();
}

function updateAdjacentCounts() {
	state.board.forEach((cell) => {
		if (cell.mine) {
			cell.adjacent = 0;
			return;
		}
		cell.adjacent = neighbors(cell.row, cell.col).reduce((count, [nextRow, nextCol]) => {
			return count + (state.board[idx(nextRow, nextCol)].mine ? 1 : 0);
		}, 0);
	});
}

function refreshMinesweepersAdminUi() {
	if (!adminTools) return;
	adminMineEditBtn.disabled = !state.adminEnabled || state.firstRevealDone;
	adminClearMinesBtn.disabled = !state.adminEnabled || state.firstRevealDone;
	adminTimeInput.disabled = !state.adminEnabled;
	adminApplyTimeBtn.disabled = !state.adminEnabled;
	if (adminResetScoresBtn) adminResetScoresBtn.disabled = !state.adminEnabled;
	if (adminRevertScoresBtn) adminRevertScoresBtn.disabled = !state.adminEnabled || !state.adminScoreSnapshot;
	adminMineEditBtn.textContent = `Edit Mines: ${state.adminMineEdit ? 'On' : 'Off'}`;
	if (!state.adminEnabled) {
		return;
	} else if (state.firstRevealDone) {
		adminInfo.textContent = 'Admin enabled. Mine editing is only available before first reveal.';
	} else {
		adminInfo.textContent = 'Admin enabled. Click board cells to toggle mines while Edit Mines is On.';
	}
}

function renderBestTimes() {
	Object.entries(bestTimeEls).forEach(([mode, element]) => {
		const value = state.bestTimes[mode];
		element.textContent = value === null ? '--' : `${value}s`;
	});
}

function formatModeLabel(mode) {
	if (!mode) return 'Easy';
	return mode.charAt(0).toUpperCase() + mode.slice(1);
}

function readLeaderboardSnapshot() {
	if (!leaderboardPreviewBody) return [];
	return Array.from(leaderboardPreviewBody.querySelectorAll('tr')).map((row) =>
		Array.from(row.children).map((cell) => cell.textContent || ''),
	);
}

function writeLeaderboardSnapshot(rows) {
	if (!leaderboardPreviewBody || !Array.isArray(rows)) return;
	const trList = Array.from(leaderboardPreviewBody.querySelectorAll('tr'));
	trList.forEach((tr, trIndex) => {
		const rowValues = rows[trIndex];
		if (!Array.isArray(rowValues)) return;
		Array.from(tr.children).forEach((cell, cellIndex) => {
			if (typeof rowValues[cellIndex] === 'string') {
				cell.textContent = rowValues[cellIndex];
			}
		});
	});
}

function captureAdminScoreSnapshotIfNeeded() {
	if (state.adminScoreSnapshot) return;
	state.adminScoreSnapshot = {
		bestTimes: { ...state.bestTimes },
		leaderboardRows: readLeaderboardSnapshot(),
	};
}

function resetAdminScores() {
	if (!state.adminEnabled) return;
	captureAdminScoreSnapshotIfNeeded();

	state.bestTimes = {
		easy: null,
		medium: null,
		hard: null,
	};
	state.seconds = 0;
	saveBestTimes();
	renderBestTimes();

	if (leaderboardPreviewBody) {
		Array.from(leaderboardPreviewBody.querySelectorAll('tr')).forEach((row) => {
			if (row.children.length >= 4) {
				row.children[3].textContent = '--';
			}
		});
	}

	roundStatusEl.textContent = 'Scores Reset';
	hintTextEl.textContent = 'Admin reset all local and preview times to no-score state.';
	resetBoard('easy');
	refreshMinesweepersAdminUi();
}

function revertAdminScores() {
	if (!state.adminEnabled || !state.adminScoreSnapshot) return;
	state.bestTimes = {
		easy: state.adminScoreSnapshot.bestTimes.easy,
		medium: state.adminScoreSnapshot.bestTimes.medium,
		hard: state.adminScoreSnapshot.bestTimes.hard,
	};
	saveBestTimes();
	renderBestTimes();
	writeLeaderboardSnapshot(state.adminScoreSnapshot.leaderboardRows);

	roundStatusEl.textContent = 'Scores Reverted';
	hintTextEl.textContent = 'Admin reverted scores to pre-power values.';
	state.adminScoreSnapshot = null;
	refreshMinesweepersAdminUi();
}

function applyAdminTimeOverride(seconds) {
	if (!Number.isFinite(seconds) || seconds < 0) return;
	captureAdminScoreSnapshotIfNeeded();
	const rounded = Math.max(1, Math.floor(seconds));
	state.seconds = rounded;
	timerEl.textContent = `${rounded}s`;

	const currentBest = state.bestTimes[state.mode];
	if (currentBest === null || rounded < currentBest) {
		state.bestTimes[state.mode] = rounded;
		saveBestTimes();
		renderBestTimes();
	}

	if (leaderboardPreviewBody) {
		const firstRow = leaderboardPreviewBody.querySelector('tr');
		if (firstRow && firstRow.children.length >= 4) {
			firstRow.children[0].textContent = '#1';
			firstRow.children[1].textContent = 'Owner';
			firstRow.children[2].textContent = formatModeLabel(state.mode);
			firstRow.children[3].textContent = String(rounded);
		}
	}

	roundStatusEl.textContent = 'Admin Override';
	hintTextEl.textContent = `Admin set ${formatModeLabel(state.mode)} run to ${rounded}s.`;
}

function renderBoard() {
	state.cellSize = getCellSize();
	boardEl.style.setProperty('--cell-size', `${state.cellSize}px`);
	boardEl.style.gridTemplateColumns = `repeat(${state.cols}, var(--cell-size))`;
	boardEl.innerHTML = state.board
		.map((cell, index) => {
			const classes = ['mine-cell'];
			if (cell.revealed) classes.push('revealed');
			if (cell.flagged) classes.push('flagged');
			if (cell.revealed && cell.mine) classes.push('mine');
			if (state.gameEnded && !state.won && cell.flagged && !cell.mine) classes.push('wrong-flag');
			if (cell.revealed && !cell.mine && cell.adjacent > 0) classes.push(`n${cell.adjacent}`);

			let symbol = '';
			if (state.gameEnded && !state.won && cell.flagged && !cell.mine) {
				symbol = 'X';
			} else if (cell.flagged) {
				symbol = 'F';
			} else if (cell.revealed && cell.mine) {
				symbol = '✹';
			} else if (cell.revealed && cell.adjacent > 0) {
				symbol = String(cell.adjacent);
			}

			return `
				<button
					class="${classes.join(' ')}"
					type="button"
					data-index="${index}"
					aria-label="Row ${cell.row + 1}, Column ${cell.col + 1}"
				>${symbol}</button>
			`;
		})
		.join('');
}

function init() {
	gameStatus.textContent = '';
	renderBestTimes();
	resetBoard('easy');
	state.adminSidebarOpen = isOwnerAccount();
	refreshAdminSidebarUi();

	// Initialize shared admin toolkit
	const adminConfig = {
		gameState: state,
		elements: {
			adminTools,
			adminModeBtn,
			adminInfo,
		},
		callbacks: {
			onClearBoard: () => {
				captureAdminScoreSnapshotIfNeeded();
				state.board.forEach((cell) => {
					cell.mine = false;
				});
				state.adminCustomMines = true;
				updateAdjacentCounts();
				updateMinesLeft();
				renderBoard();
			},
			onApplyTime: () => {
				const parsed = Number(adminTimeInput.value);
				if (!Number.isFinite(parsed) || parsed < 0) return;
				applyAdminTimeOverride(parsed);
			},
			onRefreshUI: () => {
				refreshMinesweepersAdminUi();
			},
		},
	};
	adminAPI = AdminToolkit.init(adminConfig);
	refreshMinesweepersAdminUi();

	if (adminSidebarToggleBtn) {
		adminSidebarToggleBtn.addEventListener('click', () => {
			if (!isOwnerAccount()) return;
			state.adminSidebarOpen = !state.adminSidebarOpen;
			refreshAdminSidebarUi();
		});
	}

	window.addEventListener('playr-auth-changed', () => {
		if (!isOwnerAccount()) {
			state.adminEnabled = false;
			state.adminMineEdit = false;
		}
		if (isOwnerAccount() && !state.adminSidebarOpen) {
			state.adminSidebarOpen = true;
		}
		refreshAdminSidebarUi();
		refreshMinesweepersAdminUi();
	});

	window.addEventListener('resize', () => {
		renderBoard();
	});

	modeButtons.forEach((button) => {
		button.addEventListener('click', () => {
			resetBoard(button.dataset.mode);
		});
	});

	newBoardBtn.addEventListener('click', () => {
		resetBoard(state.mode);
	});

	playAgainOverlay.addEventListener('click', () => {
		resetBoard(state.mode);
	});

	adminMineEditBtn.addEventListener('click', () => {
		if (!state.adminEnabled || state.firstRevealDone) return;
		state.adminMineEdit = !state.adminMineEdit;
		refreshMinesweepersAdminUi();
	});

	adminClearMinesBtn.addEventListener('click', () => {
		adminAPI.clearBoard();
		refreshMinesweepersAdminUi();
	});

	adminApplyTimeBtn.addEventListener('click', () => {
		adminAPI.applyTime();
	});

	if (adminResetScoresBtn) {
		adminResetScoresBtn.addEventListener('click', () => {
			resetAdminScores();
		});
	}

	if (adminRevertScoresBtn) {
		adminRevertScoresBtn.addEventListener('click', () => {
			revertAdminScores();
		});
	}

	boardEl.addEventListener('click', (event) => {
		const target = event.target.closest('[data-index]');
		if (!target) return;
		const index = Number(target.dataset.index);
		const cell = state.board[index];
		if (cell?.revealed) {
			chordReveal(index);
			return;
		}
		revealCell(index);
	});

	boardEl.addEventListener('contextmenu', (event) => {
		const target = event.target.closest('[data-index]');
		if (!target) return;
		event.preventDefault();
		toggleFlag(Number(target.dataset.index));
	});
}

init();
