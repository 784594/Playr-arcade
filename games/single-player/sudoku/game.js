(function () {
	const DIFFICULTIES = {
		easy: { label: 'Easy', blanks: 45, blankTargets: [45], minUnitGivens: 4 },
		medium: { label: 'Medium', blanks: 49, blankTargets: [49, 48], minUnitGivens: 3 },
		hard: { label: 'Hard', blanks: 53, blankTargets: [53, 52, 51], minUnitGivens: 2 },
		expert: { label: 'Expert', blanks: 57, blankTargets: [57, 56, 55, 54], minUnitGivens: 2 },
	};

	const BEST_KEY = 'arcadeAtlas.sudoku.bestTimes.v1';
	const RECORDS_KEY = 'arcadeAtlas.sudoku.records.v1';

	const boardEl = document.getElementById('sudokuBoard');
	if (!boardEl) return;

	const modeButtons = Array.from(document.querySelectorAll('[data-difficulty]'));
	const newPuzzleBtn = document.getElementById('newPuzzleBtn');
	const notesToggleBtn = document.getElementById('notesToggleBtn');
	const hintBtn = document.getElementById('hintBtn');
	const checkBtn = document.getElementById('checkBtn');
	const eraseBtn = document.getElementById('eraseBtn');
	const numpadEl = document.getElementById('numpad');
	const gameStatus = document.getElementById('gameStatus');
	const roundStatusEl = document.getElementById('roundStatus');
	const activeDifficultyEl = document.getElementById('activeDifficulty');
	const timerValueEl = document.getElementById('timerValue');
	const filledValueEl = document.getElementById('filledValue');
	const hintTextEl = document.getElementById('hintText');
	const bestEasyEl = document.getElementById('bestEasy');
	const bestMediumEl = document.getElementById('bestMedium');
	const bestHardEl = document.getElementById('bestHard');
	const bestExpertEl = document.getElementById('bestExpert');
	const leaderboardPreviewBody = document.getElementById('leaderboardPreviewBody');
	const boardOverlay = document.getElementById('boardOverlay');
	const overlayKicker = document.getElementById('overlayKicker');
	const overlayTitle = document.getElementById('overlayTitle');
	const overlayText = document.getElementById('overlayText');
	const playAgainBtn = document.getElementById('playAgainBtn');
	const overlayCheckBtn = document.getElementById('overlayCheckBtn');

	const bestEls = {
		easy: bestEasyEl,
		medium: bestMediumEl,
		hard: bestHardEl,
		expert: bestExpertEl,
	};

	const state = {
		difficulty: 'easy',
		solution: Array(81).fill(0),
		puzzle: Array(81).fill(0),
		values: Array(81).fill(0),
		selected: -1,
		notesMode: false,
		notes: Array.from({ length: 81 }, () => new Set()),
		seconds: 0,
		timerId: null,
		timerStarted: false,
		locked: true,
		solved: false,
		bestTimes: loadBestTimes(),
		records: loadRecords(),
	};

	function idx(row, col) {
		return row * 9 + col;
	}

	function rowFromIndex(index) {
		return Math.floor(index / 9);
	}

	function colFromIndex(index) {
		return index % 9;
	}

	function shuffle(values) {
		const out = values.slice();
		for (let index = out.length - 1; index > 0; index -= 1) {
			const swapIndex = Math.floor(Math.random() * (index + 1));
			[out[index], out[swapIndex]] = [out[swapIndex], out[index]];
		}
		return out;
	}

	function canPlace(board, index, value) {
		const row = rowFromIndex(index);
		const col = colFromIndex(index);

		for (let check = 0; check < 9; check += 1) {
			if (board[idx(row, check)] === value) return false;
			if (board[idx(check, col)] === value) return false;
		}

		const boxRow = Math.floor(row / 3) * 3;
		const boxCol = Math.floor(col / 3) * 3;
		for (let rowOffset = 0; rowOffset < 3; rowOffset += 1) {
			for (let colOffset = 0; colOffset < 3; colOffset += 1) {
				if (board[idx(boxRow + rowOffset, boxCol + colOffset)] === value) return false;
			}
		}

		return true;
	}

	function isCompleteValidGrid(board) {
		if (!Array.isArray(board) || board.length !== 81) return false;

		function isValidGroup(indices) {
			const set = new Set();
			for (const index of indices) {
				const value = board[index];
				if (!Number.isInteger(value) || value < 1 || value > 9) return false;
				if (set.has(value)) return false;
				set.add(value);
			}
			return set.size === 9;
		}

		for (let row = 0; row < 9; row += 1) {
			const rowIndices = [];
			for (let col = 0; col < 9; col += 1) rowIndices.push(idx(row, col));
			if (!isValidGroup(rowIndices)) return false;
		}

		for (let col = 0; col < 9; col += 1) {
			const colIndices = [];
			for (let row = 0; row < 9; row += 1) colIndices.push(idx(row, col));
			if (!isValidGroup(colIndices)) return false;
		}

		for (let boxRow = 0; boxRow < 3; boxRow += 1) {
			for (let boxCol = 0; boxCol < 3; boxCol += 1) {
				const boxIndices = [];
				for (let rowOffset = 0; rowOffset < 3; rowOffset += 1) {
					for (let colOffset = 0; colOffset < 3; colOffset += 1) {
						boxIndices.push(idx(boxRow * 3 + rowOffset, boxCol * 3 + colOffset));
					}
				}
				if (!isValidGroup(boxIndices)) return false;
			}
		}

		return true;
	}

	function generateSolvedBoard() {
		const board = Array(81).fill(0);

		function fill(nextIndex) {
			if (nextIndex >= 81) return true;
			if (board[nextIndex] !== 0) return fill(nextIndex + 1);

			const choices = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
			for (const value of choices) {
				if (!canPlace(board, nextIndex, value)) continue;
				board[nextIndex] = value;
				if (fill(nextIndex + 1)) return true;
				board[nextIndex] = 0;
			}
			return false;
		}

		fill(0);
		return board;
	}

	function countSolutions(board, limit = 2) {
		const cells = board.slice();
		let count = 0;

		function search() {
			if (count >= limit) return;

			let bestIndex = -1;
			let bestCandidates = null;

			for (let index = 0; index < 81; index += 1) {
				if (cells[index] !== 0) continue;
				const candidates = [];
				for (let value = 1; value <= 9; value += 1) {
					if (canPlace(cells, index, value)) candidates.push(value);
				}
				if (candidates.length === 0) return;
				if (!bestCandidates || candidates.length < bestCandidates.length) {
					bestIndex = index;
					bestCandidates = candidates;
					if (bestCandidates.length === 1) break;
				}
			}

			if (bestIndex === -1) {
				count += 1;
				return;
			}

			for (const value of bestCandidates) {
				cells[bestIndex] = value;
				search();
				cells[bestIndex] = 0;
				if (count >= limit) return;
			}
		}

		search();
		return count;
	}

	function minGivensSatisfied(puzzle, removedIndices, minUnitGivens) {
		const affectedRows = new Set();
		const affectedCols = new Set();
		const affectedBoxes = new Set();

		removedIndices.forEach((cellIndex) => {
			const row = rowFromIndex(cellIndex);
			const col = colFromIndex(cellIndex);
			affectedRows.add(row);
			affectedCols.add(col);
			affectedBoxes.add(`${Math.floor(row / 3)}:${Math.floor(col / 3)}`);
		});

		for (const row of affectedRows) {
			let count = 0;
			for (let col = 0; col < 9; col += 1) {
				if (puzzle[idx(row, col)] !== 0) count += 1;
			}
			if (count < minUnitGivens) return false;
		}

		for (const col of affectedCols) {
			let count = 0;
			for (let row = 0; row < 9; row += 1) {
				if (puzzle[idx(row, col)] !== 0) count += 1;
			}
			if (count < minUnitGivens) return false;
		}

		for (const box of affectedBoxes) {
			const [boxRowRaw, boxColRaw] = box.split(':');
			const boxRow = Number(boxRowRaw);
			const boxCol = Number(boxColRaw);
			let count = 0;
			for (let rowOffset = 0; rowOffset < 3; rowOffset += 1) {
				for (let colOffset = 0; colOffset < 3; colOffset += 1) {
					if (puzzle[idx(boxRow * 3 + rowOffset, boxCol * 3 + colOffset)] !== 0) count += 1;
				}
			}
			if (count < minUnitGivens) return false;
		}

		return true;
	}

	function buildPuzzle(solution, blanks, minUnitGivens) {
		const puzzle = solution.slice();
		const pairOrder = shuffle(Array.from({ length: 41 }, (_, index) => index));
		let removed = 0;

		while (removed < blanks && pairOrder.length > 0) {
			const base = pairOrder.pop();
			if (typeof base !== 'number') break;
			const mirror = 80 - base;
			const targets = base === mirror ? [base] : [base, mirror];
			if (removed + targets.length > blanks) continue;
			if (targets.some((cellIndex) => puzzle[cellIndex] === 0)) continue;

			const saved = targets.map((cellIndex) => puzzle[cellIndex]);
			targets.forEach((cellIndex) => {
				puzzle[cellIndex] = 0;
			});

			if (!minGivensSatisfied(puzzle, targets, minUnitGivens)) {
				targets.forEach((cellIndex, index) => {
					puzzle[cellIndex] = saved[index];
				});
				continue;
			}

			const solutions = countSolutions(puzzle, 2);
			if (solutions === 1) {
				removed += targets.length;
			} else {
				targets.forEach((cellIndex, index) => {
					puzzle[cellIndex] = saved[index];
				});
			}
		}

		return removed === blanks ? puzzle : null;
	}

	function loadBestTimes() {
		try {
			const parsed = JSON.parse(localStorage.getItem(BEST_KEY) || '{}');
			return {
				easy: typeof parsed.easy === 'number' ? parsed.easy : null,
				medium: typeof parsed.medium === 'number' ? parsed.medium : null,
				hard: typeof parsed.hard === 'number' ? parsed.hard : null,
				expert: typeof parsed.expert === 'number' ? parsed.expert : null,
			};
		} catch {
			return { easy: null, medium: null, hard: null, expert: null };
		}
	}

	function saveBestTimes() {
		try {
			localStorage.setItem(BEST_KEY, JSON.stringify(state.bestTimes));
		} catch {
			// no-op
		}
	}

	function loadRecords() {
		try {
			const parsed = JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]');
			if (!Array.isArray(parsed)) return [];
			return parsed.filter((entry) => entry && typeof entry.seconds === 'number' && DIFFICULTIES[entry.mode]);
		} catch {
			return [];
		}
	}

	function saveRecords() {
		try {
			localStorage.setItem(RECORDS_KEY, JSON.stringify(state.records));
		} catch {
			// no-op
		}
	}

	function formatSeconds(totalSeconds) {
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes}:${String(seconds).padStart(2, '0')}`;
	}

	function setStatus(message, roundLabel) {
		if (gameStatus) gameStatus.textContent = message || '';
		if (roundStatusEl && typeof roundLabel === 'string') roundStatusEl.textContent = roundLabel;
	}

	function startTimer() {
		if (state.timerStarted && state.timerId) return;
		stopTimer();
		state.timerStarted = true;
		state.timerId = window.setInterval(() => {
			state.seconds += 1;
			if (timerValueEl) timerValueEl.textContent = formatSeconds(state.seconds);
		}, 1000);
	}

	function stopTimer() {
		if (!state.timerId) return;
		window.clearInterval(state.timerId);
		state.timerId = null;
	}

	function ensureTimerStarted() {
		if (state.timerStarted || state.locked || state.solved) return;
		startTimer();
	}

	function isFixed(index) {
		return state.puzzle[index] !== 0;
	}

	function filledCount() {
		return state.values.reduce((count, value) => count + (value > 0 ? 1 : 0), 0);
	}

	function getPeerIndices(index) {
		const row = rowFromIndex(index);
		const col = colFromIndex(index);
		const peers = new Set();

		for (let check = 0; check < 9; check += 1) {
			peers.add(idx(row, check));
			peers.add(idx(check, col));
		}

		const boxRow = Math.floor(row / 3) * 3;
		const boxCol = Math.floor(col / 3) * 3;
		for (let rowOffset = 0; rowOffset < 3; rowOffset += 1) {
			for (let colOffset = 0; colOffset < 3; colOffset += 1) {
				peers.add(idx(boxRow + rowOffset, boxCol + colOffset));
			}
		}

		peers.delete(index);
		return peers;
	}

	function computeConflictSet() {
		const conflicts = new Set();

		for (let row = 0; row < 9; row += 1) {
			const seen = new Map();
			for (let col = 0; col < 9; col += 1) {
				const index = idx(row, col);
				const value = state.values[index];
				if (!value) continue;
				if (!seen.has(value)) seen.set(value, []);
				seen.get(value).push(index);
			}
			seen.forEach((indices) => {
				if (indices.length < 2) return;
				indices.forEach((cellIndex) => conflicts.add(cellIndex));
			});
		}

		for (let col = 0; col < 9; col += 1) {
			const seen = new Map();
			for (let row = 0; row < 9; row += 1) {
				const index = idx(row, col);
				const value = state.values[index];
				if (!value) continue;
				if (!seen.has(value)) seen.set(value, []);
				seen.get(value).push(index);
			}
			seen.forEach((indices) => {
				if (indices.length < 2) return;
				indices.forEach((cellIndex) => conflicts.add(cellIndex));
			});
		}

		for (let boxRow = 0; boxRow < 3; boxRow += 1) {
			for (let boxCol = 0; boxCol < 3; boxCol += 1) {
				const seen = new Map();
				for (let rowOffset = 0; rowOffset < 3; rowOffset += 1) {
					for (let colOffset = 0; colOffset < 3; colOffset += 1) {
						const row = boxRow * 3 + rowOffset;
						const col = boxCol * 3 + colOffset;
						const index = idx(row, col);
						const value = state.values[index];
						if (!value) continue;
						if (!seen.has(value)) seen.set(value, []);
						seen.get(value).push(index);
					}
				}
				seen.forEach((indices) => {
					if (indices.length < 2) return;
					indices.forEach((cellIndex) => conflicts.add(cellIndex));
				});
			}
		}

		return conflicts;
	}

	function createNotesMarkup(index) {
		const notes = state.notes[index];
		const wrapper = document.createElement('div');
		wrapper.className = 'notes-grid';
		for (let value = 1; value <= 9; value += 1) {
			const cell = document.createElement('span');
			cell.textContent = notes.has(value) ? String(value) : '';
			wrapper.appendChild(cell);
		}
		return wrapper;
	}

	function renderBoard() {
		const peers = state.selected >= 0 ? getPeerIndices(state.selected) : new Set();

		boardEl.innerHTML = '';
		for (let index = 0; index < 81; index += 1) {
			const row = rowFromIndex(index);
			const col = colFromIndex(index);
			const value = state.values[index];
			const fixed = isFixed(index);
			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'sudoku-cell';
			button.setAttribute('role', 'gridcell');
			button.setAttribute('aria-label', `R${row + 1} C${col + 1}`);
			button.dataset.index = String(index);

			if (fixed) button.classList.add('is-fixed');
			if (state.selected === index) button.classList.add('is-selected');
			if (peers.has(index)) button.classList.add('is-peer');

			if (row % 3 === 0) button.classList.add('box-top');
			if (col % 3 === 0) button.classList.add('box-left');
			if (row === 8) button.classList.add('box-bottom');
			if (col === 8) button.classList.add('box-right');

			if (value > 0) {
				const valueEl = document.createElement('span');
				valueEl.className = 'value';
				valueEl.textContent = String(value);
				button.appendChild(valueEl);
			} else {
				button.appendChild(createNotesMarkup(index));
			}

			boardEl.appendChild(button);
		}

		if (filledValueEl) {
			filledValueEl.textContent = `${filledCount()} / 81`;
		}
	}

	function renderBestTimes() {
		Object.keys(bestEls).forEach((mode) => {
			const target = bestEls[mode];
			if (!target) return;
			const value = state.bestTimes[mode];
			target.textContent = typeof value === 'number' ? formatSeconds(value) : '--';
		});
	}

	function renderLeaderboardPreview() {
		if (!leaderboardPreviewBody) return;
		const ranked = state.records
			.slice()
			.sort((a, b) => a.seconds - b.seconds)
			.slice(0, 4);

		leaderboardPreviewBody.innerHTML = '';
		for (let index = 0; index < 4; index += 1) {
			const record = ranked[index];
			const row = document.createElement('tr');
			const rankCell = document.createElement('td');
			rankCell.textContent = `#${index + 1}`;
			const playerCell = document.createElement('td');
			playerCell.textContent = record?.player || 'Player';
			const modeCell = document.createElement('td');
			modeCell.textContent = record ? DIFFICULTIES[record.mode].label : ['Easy', 'Medium', 'Hard', 'Expert'][index];
			const scoreCell = document.createElement('td');
			scoreCell.textContent = record ? String(record.seconds) : '--';
			row.append(rankCell, playerCell, modeCell, scoreCell);
			leaderboardPreviewBody.appendChild(row);
		}
	}

	function updateModeButtons() {
		modeButtons.forEach((button) => {
			button.classList.toggle('active', button.dataset.difficulty === state.difficulty);
		});
		if (activeDifficultyEl) activeDifficultyEl.textContent = DIFFICULTIES[state.difficulty].label;
	}

	function selectCell(index) {
		state.selected = index;
		renderBoard();
	}

	function clearCell(index) {
		if (index < 0 || isFixed(index) || state.locked) return;
		state.values[index] = 0;
		state.notes[index].clear();
		renderBoard();
	}

	function placeValue(index, value) {
		if (index < 0 || value < 1 || value > 9 || isFixed(index) || state.locked) return;

		if (state.notesMode) {
			if (state.values[index] !== 0) return;
			ensureTimerStarted();
			if (state.notes[index].has(value)) {
				state.notes[index].delete(value);
			} else {
				state.notes[index].add(value);
			}
			renderBoard();
			return;
		}

		ensureTimerStarted();
		state.values[index] = value;
		state.notes[index].clear();

		setStatus('', 'Playing');
		renderBoard();
		checkSolved();
	}

	function moveSelection(rowDelta, colDelta) {
		if (state.selected < 0) {
			state.selected = 0;
			renderBoard();
			return;
		}

		let row = rowFromIndex(state.selected) + rowDelta;
		let col = colFromIndex(state.selected) + colDelta;

		row = (row + 9) % 9;
		col = (col + 9) % 9;
		selectCell(idx(row, col));
	}

	function openOverlay(kicker, title, text) {
		if (!boardOverlay) return;
		if (overlayKicker) overlayKicker.textContent = kicker;
		if (overlayTitle) overlayTitle.textContent = title;
		if (overlayText) overlayText.textContent = text;
		boardOverlay.hidden = false;
	}

	function closeOverlay() {
		if (boardOverlay) boardOverlay.hidden = true;
	}

	function commitWin() {
		state.solved = true;
		state.locked = true;
		stopTimer();
		const finalSeconds = Math.max(1, state.seconds);

		const prevBest = state.bestTimes[state.difficulty];
		if (typeof prevBest !== 'number' || finalSeconds < prevBest) {
			state.bestTimes[state.difficulty] = finalSeconds;
			saveBestTimes();
			renderBestTimes();
		}

		state.records.push({
			player: 'Player',
			mode: state.difficulty,
			seconds: finalSeconds,
			at: Date.now(),
		});
		state.records = state.records
			.slice()
			.sort((a, b) => a.seconds - b.seconds)
			.slice(0, 40);
		saveRecords();
		renderLeaderboardPreview();

		if (hintTextEl) {
			hintTextEl.textContent = `Solved in ${formatSeconds(finalSeconds)} on ${DIFFICULTIES[state.difficulty].label}.`;
		}
		setStatus('', 'Solved');
		openOverlay('Complete', 'Puzzle Solved', `Final time: ${formatSeconds(finalSeconds)} (${finalSeconds}s).`);
	}

	function checkSolved() {
		if (state.solved || state.locked) return false;
		if (!isCompleteValidGrid(state.solution)) return false;

		for (let index = 0; index < 81; index += 1) {
			if (state.values[index] !== state.solution[index]) return false;
		}

		if (computeConflictSet().size > 0) return false;
		if (!isCompleteValidGrid(state.values)) return false;
		commitWin();
		return true;
	}

	function giveHint() {
		if (state.locked) return;
		let target = state.selected;
		if (target < 0 || isFixed(target) || state.values[target] === state.solution[target]) {
			target = -1;
			for (let index = 0; index < 81; index += 1) {
				if (isFixed(index)) continue;
				if (state.values[index] !== state.solution[index]) {
					target = index;
					break;
				}
			}
		}

		if (target < 0) return;
		state.values[target] = state.solution[target];
		state.notes[target].clear();
		state.seconds += 15;
		if (timerValueEl) timerValueEl.textContent = formatSeconds(state.seconds);
		selectCell(target);
		setStatus('Hint used: +15s time penalty applied.', 'Playing');
		renderBoard();
		checkSolved();
	}

	function checkGrid() {
		if (state.solved) return;
		const conflicts = computeConflictSet();
		if (conflicts.size === 0) {
			setStatus('No row, column, or box conflicts found.', 'Playing');
		} else {
			setStatus(`${conflicts.size} cells are currently conflicting.`, 'Playing');
		}
		renderBoard();
	}

	function buildNumpad() {
		if (!numpadEl) return;
		numpadEl.innerHTML = '';
		for (let value = 1; value <= 9; value += 1) {
			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'num-btn';
			button.textContent = String(value);
			button.dataset.value = String(value);
			numpadEl.appendChild(button);
		}
	}

	function setNotesMode(enabled) {
		state.notesMode = enabled;
		if (notesToggleBtn) {
			notesToggleBtn.textContent = `Notes: ${enabled ? 'On' : 'Off'}`;
			notesToggleBtn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
			notesToggleBtn.classList.toggle('secondary', !enabled);
		}
		if (hintTextEl && !state.solved) {
			hintTextEl.textContent = enabled
				? 'Notes mode is active. Number inputs toggle pencil marks.'
				: 'Notes mode is off. Number inputs place values directly.';
		}
	}

	function newPuzzle(mode = state.difficulty) {
		closeOverlay();
		state.locked = true;
		state.solved = false;
		state.selected = -1;
		state.difficulty = DIFFICULTIES[mode] ? mode : 'easy';
		updateModeButtons();

		setStatus('Generating puzzle...', 'Generating');
		const options = DIFFICULTIES[state.difficulty];
		let solved = null;
		let puzzle = null;

		const blankTargets = Array.isArray(options.blankTargets) && options.blankTargets.length
			? options.blankTargets
			: [options.blanks];

		for (let attempt = 0; attempt < 30; attempt += 1) {
			const candidateSolved = generateSolvedBoard();
			if (!isCompleteValidGrid(candidateSolved)) continue;
			for (const blankTarget of blankTargets) {
				const candidatePuzzle = buildPuzzle(candidateSolved, blankTarget, options.minUnitGivens);
				if (!candidatePuzzle) continue;
				solved = candidateSolved;
				puzzle = candidatePuzzle;
				break;
			}
			if (solved && puzzle) break;
		}

		if (!solved || !puzzle) {
			setStatus('Could not generate a valid puzzle. Try again.', 'Error');
			state.locked = true;
			return;
		}

		state.solution = solved;
		state.puzzle = puzzle;
		state.values = puzzle.slice();
		state.notes = Array.from({ length: 81 }, () => new Set());
		state.seconds = 0;
		state.timerStarted = false;
		stopTimer();
		if (timerValueEl) timerValueEl.textContent = '0:00';

		renderBoard();
		state.locked = false;
		setStatus('', 'Ready');
		if (hintTextEl) {
			hintTextEl.textContent = `${DIFFICULTIES[state.difficulty].label} puzzle selected. Timer starts on your first note or number.`;
		}
	}

	function handleBoardClick(event) {
		const target = event.target.closest('.sudoku-cell');
		if (!target) return;
		const index = Number(target.dataset.index);
		if (!Number.isInteger(index)) return;
		selectCell(index);
	}

	function handleKeyboard(event) {
		if (state.solved) return;

		if (event.key >= '1' && event.key <= '9') {
			event.preventDefault();
			placeValue(state.selected, Number(event.key));
			return;
		}

		if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') {
			event.preventDefault();
			clearCell(state.selected);
			return;
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			moveSelection(-1, 0);
			return;
		}

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			moveSelection(1, 0);
			return;
		}

		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			moveSelection(0, -1);
			return;
		}

		if (event.key === 'ArrowRight') {
			event.preventDefault();
			moveSelection(0, 1);
			return;
		}

		if (event.key.toLowerCase() === 'n') {
			event.preventDefault();
			setNotesMode(!state.notesMode);
		}
	}

	modeButtons.forEach((button) => {
		button.addEventListener('click', () => {
			const nextMode = button.dataset.difficulty;
			if (!nextMode || !DIFFICULTIES[nextMode]) return;
			newPuzzle(nextMode);
		});
	});

	if (newPuzzleBtn) {
		newPuzzleBtn.addEventListener('click', () => newPuzzle(state.difficulty));
	}

	if (notesToggleBtn) {
		notesToggleBtn.addEventListener('click', () => setNotesMode(!state.notesMode));
	}

	if (hintBtn) {
		hintBtn.addEventListener('click', giveHint);
	}

	if (checkBtn) {
		checkBtn.addEventListener('click', checkGrid);
	}

	if (eraseBtn) {
		eraseBtn.addEventListener('click', () => clearCell(state.selected));
	}

	if (numpadEl) {
		numpadEl.addEventListener('click', (event) => {
			const target = event.target.closest('.num-btn');
			if (!target) return;
			const value = Number(target.dataset.value);
			if (!Number.isInteger(value)) return;
			placeValue(state.selected, value);
		});
	}

	if (boardEl) {
		boardEl.addEventListener('click', handleBoardClick);
	}

	if (playAgainBtn) {
		playAgainBtn.addEventListener('click', () => newPuzzle(state.difficulty));
	}

	if (overlayCheckBtn) {
		overlayCheckBtn.addEventListener('click', closeOverlay);
	}

	document.addEventListener('keydown', handleKeyboard);

	buildNumpad();
	renderBestTimes();
	renderLeaderboardPreview();
	setNotesMode(false);
	newPuzzle('easy');
})();
