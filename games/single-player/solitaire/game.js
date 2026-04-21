(function () {
	const MODES = {
		draw1: {
			id: 'draw1',
			label: 'Draw 1',
			drawCount: 1,
			redealUnlimited: true,
			vegas: false,
		},
		draw3: {
			id: 'draw3',
			label: 'Draw 3',
			drawCount: 3,
			redealUnlimited: true,
			vegas: false,
		},
		vegas: {
			id: 'vegas',
			label: 'Vegas',
			drawCount: 3,
			redealUnlimited: false,
			vegas: true,
		},
	};

	const SUITS = ['H', 'D', 'C', 'S'];
	const SUIT_SYMBOL = { H: '♥', D: '♦', C: '♣', S: '♠' };
	const SUIT_NAME = { H: 'Hearts', D: 'Diamonds', C: 'Clubs', S: 'Spades' };
	const RANK_LABEL = {
		1: 'A',
		2: '2',
		3: '3',
		4: '4',
		5: '5',
		6: '6',
		7: '7',
		8: '8',
		9: '9',
		10: '10',
		11: 'J',
		12: 'Q',
		13: 'K',
	};

	const STORAGE_KEY = 'arcadeAtlas.solitaire.bestTimes.v1';
	const MAX_UNDO = 220;
	const MAX_BOARD_ROWS = 10;

	const root = document.getElementById('gameRoot');
	const gameStatus = document.getElementById('gameStatus');
	const stage = document.getElementById('solitaireStage');
	const stockPile = document.getElementById('stockPile');
	const wastePile = document.getElementById('wastePile');
	const foundationsEl = document.getElementById('foundations');
	const tableauEl = document.getElementById('tableau');
	const overlay = document.getElementById('boardOverlay');
	const overlayKicker = document.getElementById('overlayKicker');
	const overlayTitle = document.getElementById('overlayTitle');
	const overlayText = document.getElementById('overlayText');
	const startBtn = document.getElementById('startBtn');
	const modeButtons = Array.from(document.querySelectorAll('.mode-btn'));
	const dragLayer = document.getElementById('dragLayer');
	const newGameBtn = document.getElementById('newGameBtn');
	const restartBtn = document.getElementById('restartBtn');
	const undoBtn = document.getElementById('undoBtn');
	const modeValue = document.getElementById('modeValue');
	const timerValue = document.getElementById('timerValue');
	const movesValue = document.getElementById('movesValue');
	const scoreValue = document.getElementById('scoreValue');
	const statusValue = document.getElementById('statusValue');
	const leaderboardPreviewBody = document.getElementById('leaderboardPreviewBody');

	if (!root || !stage || !tableauEl || !stockPile || !wastePile || !foundationsEl) return;

	const state = {
		mode: MODES.draw1,
		selectedMode: MODES.draw1,
		active: false,
		won: false,
		stock: [],
		waste: [],
		foundations: { H: [], D: [], C: [], S: [] },
		tableau: Array.from({ length: 7 }, () => []),
		moves: 0,
		score: 0,
		elapsedAccum: 0,
		timerStarted: false,
		timerStart: 0,
		timerHandle: null,
		passCount: 0,
		suppressClickUntil: 0,
		dragState: null,
		undoStack: [],
		records: loadRecords(),
	};

	function loadRecords() {
		try {
			const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
			if (!Array.isArray(parsed)) return [];
			return parsed
				.filter((entry) => entry && typeof entry.elapsedMs === 'number' && typeof entry.roundedSeconds === 'number')
				.slice(0, MAX_BOARD_ROWS);
		} catch {
			return [];
		}
	}

	function saveRecords() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state.records.slice(0, MAX_BOARD_ROWS)));
		} catch {
			// no-op
		}
	}

	function currentUserName() {
		try {
			if (window.PlayrAuth && typeof window.PlayrAuth.getCurrentUser === 'function') {
				const user = window.PlayrAuth.getCurrentUser();
				const name = String(user?.displayName || '').trim();
				if (name) return name;
			}
		} catch {
			// no-op
		}

		try {
			const raw = localStorage.getItem('playrCurrentUser');
			if (!raw) return 'Guest';
			const parsed = JSON.parse(raw);
			const name = String(parsed?.displayName || '').trim();
			return name || 'Guest';
		} catch {
			return 'Guest';
		}
	}

	function shuffle(cards) {
		const out = cards.slice();
		for (let index = out.length - 1; index > 0; index -= 1) {
			const swap = Math.floor(Math.random() * (index + 1));
			[out[index], out[swap]] = [out[swap], out[index]];
		}
		return out;
	}

	function cardColor(card) {
		return card.suit === 'H' || card.suit === 'D' ? 'red' : 'black';
	}

	function nowMs() {
		return performance.now();
	}

	function elapsedMs() {
		if (!state.timerStarted) return state.elapsedAccum;
		return state.elapsedAccum + (nowMs() - state.timerStart);
	}

	function formatTimer(ms) {
		const seconds = ms / 1000;
		return `${seconds.toFixed(3)}s`;
	}

	function roundedSeconds(ms) {
		return Math.max(1, Math.round(ms / 1000));
	}

	function setStatus(message, centerMessage = '') {
		if (statusValue) statusValue.textContent = message;
		if (gameStatus) gameStatus.textContent = centerMessage;
	}

	function ensureTimer() {
		if (!state.timerStarted) {
			state.timerStarted = true;
			state.timerStart = nowMs();
		}
		if (state.timerHandle) return;
		state.timerHandle = window.setInterval(updateHud, 33);
	}

	function stopTimer() {
		if (state.timerStarted) {
			state.elapsedAccum = elapsedMs();
			state.timerStarted = false;
			state.timerStart = 0;
		}
		if (state.timerHandle) {
			window.clearInterval(state.timerHandle);
			state.timerHandle = null;
		}
	}

	function cardById(cardId) {
		if (!cardId) return null;
		const all = [
			...state.stock,
			...state.waste,
			...state.tableau.flat(),
			...SUITS.flatMap((suit) => state.foundations[suit]),
		];
		return all.find((card) => card.id === cardId) || null;
	}

	function cloneCard(card) {
		return {
			id: card.id,
			suit: card.suit,
			rank: card.rank,
			faceUp: card.faceUp,
		};
	}

	function cloneState() {
		return {
			stock: state.stock.map(cloneCard),
			waste: state.waste.map(cloneCard),
			foundations: {
				H: state.foundations.H.map(cloneCard),
				D: state.foundations.D.map(cloneCard),
				C: state.foundations.C.map(cloneCard),
				S: state.foundations.S.map(cloneCard),
			},
			tableau: state.tableau.map((column) => column.map(cloneCard)),
			moves: state.moves,
			score: state.score,
			elapsedAccum: elapsedMs(),
			timerStarted: state.timerStarted,
			passCount: state.passCount,
			active: state.active,
			won: state.won,
			modeId: state.mode.id,
		};
	}

	function pushUndoSnapshot() {
		state.undoStack.push(cloneState());
		if (state.undoStack.length > MAX_UNDO) {
			state.undoStack.shift();
		}
	}

	function restoreSnapshot(snapshot) {
		state.mode = MODES[snapshot.modeId] || state.mode;
		state.selectedMode = state.mode;
		state.stock = snapshot.stock.map(cloneCard);
		state.waste = snapshot.waste.map(cloneCard);
		state.foundations = {
			H: snapshot.foundations.H.map(cloneCard),
			D: snapshot.foundations.D.map(cloneCard),
			C: snapshot.foundations.C.map(cloneCard),
			S: snapshot.foundations.S.map(cloneCard),
		};
		state.tableau = snapshot.tableau.map((column) => column.map(cloneCard));
		state.moves = snapshot.moves;
		state.score = snapshot.score;
		state.elapsedAccum = snapshot.elapsedAccum;
		state.timerStarted = false;
		state.timerStart = 0;
		state.passCount = snapshot.passCount;
		state.active = snapshot.active;
		state.won = snapshot.won;

		if (state.active && !state.won && snapshot.timerStarted) {
			state.timerStarted = true;
			state.timerStart = nowMs();
			if (!state.timerHandle) state.timerHandle = window.setInterval(updateHud, 33);
		} else {
			stopTimer();
		}

		overlay.classList.add('hidden');
		clearDragArtifacts();
		updateHud();
		renderAll();
	}

	function newDeck() {
		const deck = [];
		for (const suit of SUITS) {
			for (let rank = 1; rank <= 13; rank += 1) {
				deck.push({
					id: `${suit}${rank}`,
					suit,
					rank,
					faceUp: false,
				});
			}
		}
		return shuffle(deck);
	}

	function deal(mode) {
		const deck = newDeck();
		state.mode = mode;
		state.selectedMode = mode;
		state.active = true;
		state.won = false;
		state.stock = [];
		state.waste = [];
		state.foundations = { H: [], D: [], C: [], S: [] };
		state.tableau = Array.from({ length: 7 }, () => []);
		state.moves = 0;
		state.score = mode.vegas ? 0 : 0;
		state.passCount = 0;
		state.elapsedAccum = 0;
		state.timerStarted = false;
		state.timerStart = 0;
		state.undoStack = [];
		clearDragArtifacts();
		stopTimer();

		for (let col = 0; col < 7; col += 1) {
			for (let row = 0; row <= col; row += 1) {
				const card = deck.pop();
				if (!card) continue;
				card.faceUp = row === col;
				state.tableau[col].push(card);
			}
		}

		while (deck.length > 0) {
			const card = deck.pop();
			if (!card) break;
			card.faceUp = false;
			state.stock.push(card);
		}

		overlay.classList.add('hidden');
		setStatus('In round', '');
		updateHud();
		renderAll();
	}

	function showOverlay(kind = 'start', text = '') {
		overlay.classList.remove('hidden');
		if (kind === 'win') {
			overlayKicker.textContent = 'Completed';
			overlayTitle.textContent = 'You cleared the board';
			overlayText.textContent = text || 'Start a new run and chase an even faster time.';
			startBtn.textContent = 'Play Again';
		} else {
			overlayKicker.textContent = 'Choose Mode';
			overlayTitle.textContent = 'Solitaire';
			overlayText.textContent = 'Pick one of three styles and start your run.';
			startBtn.textContent = 'Start';
		}
	}

	function updateModeButtons() {
		modeButtons.forEach((button) => {
			button.classList.toggle('active', button.dataset.mode === state.selectedMode.id);
		});
	}

	function scoreForMoveFoundation() {
		if (!state.mode.vegas) return;
		state.score += 5;
	}

	function scoreForDrawAction() {
		if (!state.mode.vegas) return;
		state.score -= 1;
	}

	function scoreForLeaveFoundation() {
		if (!state.mode.vegas) return;
		state.score -= 5;
	}

	function canMoveToFoundation(card, suit) {
		if (!card || !card.faceUp || !SUITS.includes(suit)) return false;
		const stack = state.foundations[suit];
		if (!stack || card.suit !== suit) return false;
		if (stack.length === 0) return card.rank === 1;
		const top = stack[stack.length - 1];
		return card.rank === top.rank + 1;
	}

	function canMoveToTableau(card, colIndex) {
		const target = state.tableau[colIndex];
		if (!target || !card || !card.faceUp) return false;
		if (target.length === 0) return card.rank === 13;
		const top = target[target.length - 1];
		if (!top.faceUp) return false;
		return cardColor(top) !== cardColor(card) && top.rank === card.rank + 1;
	}

	function isValidTableauSequence(cards) {
		if (!cards.length) return false;
		for (let index = 0; index < cards.length; index += 1) {
			if (!cards[index].faceUp) return false;
			if (index === 0) continue;
			const prev = cards[index - 1];
			const current = cards[index];
			const descending = prev.rank === current.rank + 1;
			const alternating = cardColor(prev) !== cardColor(current);
			if (!descending || !alternating) return false;
		}
		return true;
	}

	function revealTopTableauCard(colIndex) {
		const column = state.tableau[colIndex];
		if (!column || column.length === 0) return;
		const top = column[column.length - 1];
		if (top.faceUp) return;
		top.faceUp = true;
		if (!state.mode.vegas) state.score += 1;
	}

	function sourceOfCard(cardId) {
		if (!cardId) return null;
		if (state.waste.length && state.waste[state.waste.length - 1].id === cardId) {
			return { kind: 'waste' };
		}

		for (const suit of SUITS) {
			const foundation = state.foundations[suit];
			if (foundation.length && foundation[foundation.length - 1].id === cardId) {
				return { kind: 'foundation', suit };
			}
		}

		for (let col = 0; col < state.tableau.length; col += 1) {
			const column = state.tableau[col];
			const at = column.findIndex((card) => card.id === cardId);
			if (at === -1) continue;
			const cards = column.slice(at);
			if (!isValidTableauSequence(cards)) return null;
			return { kind: 'tableau', col, start: at };
		}

		return null;
	}

	function takeCards(source) {
		if (!source) return [];
		if (source.kind === 'waste') {
			const card = state.waste.pop();
			return card ? [card] : [];
		}

		if (source.kind === 'foundation') {
			const pile = state.foundations[source.suit];
			const card = pile.pop();
			return card ? [card] : [];
		}

		if (source.kind === 'tableau') {
			const column = state.tableau[source.col];
			return column.splice(source.start);
		}

		return [];
	}

	function returnCards(source, cards) {
		if (!source || !cards.length) return;
		if (source.kind === 'waste') {
			state.waste.push(...cards);
			return;
		}

		if (source.kind === 'foundation') {
			state.foundations[source.suit].push(...cards);
			return;
		}

		if (source.kind === 'tableau') {
			state.tableau[source.col].push(...cards);
		}
	}

	function finalizeMove(source) {
		if (!source) return;
		state.moves += 1;
		if (source.kind === 'tableau') revealTopTableauCard(source.col);
		updateHud();
		renderAll();
		maybeWin();
	}

	function placeCards(target, cards, source) {
		if (!target || !cards.length || !source) return false;
		if (source.kind === 'foundation' && target.kind === 'foundation') return false;

		if (target.kind === 'foundation') {
			if (cards.length !== 1 || !canMoveToFoundation(cards[0], target.suit)) return false;
			state.foundations[target.suit].push(cards[0]);
			scoreForMoveFoundation();
			finalizeMove(source);
			return true;
		}

		if (target.kind === 'tableau') {
			if (!canMoveToTableau(cards[0], target.col)) return false;
			state.tableau[target.col].push(...cards);
			if (source.kind === 'foundation') scoreForLeaveFoundation();
			if (!state.mode.vegas) state.score += 1;
			finalizeMove(source);
			return true;
		}

		return false;
	}

	function autoMoveCard(cardId) {
		if (!state.active || state.won) return false;
		const source = sourceOfCard(cardId);
		if (!source) return false;

		pushUndoSnapshot();
		const cards = takeCards(source);
		if (cards.length !== 1) {
			if (state.undoStack.length) state.undoStack.pop();
			returnCards(source, cards);
			return false;
		}

		for (const suit of SUITS) {
			if (canMoveToFoundation(cards[0], suit)) {
				ensureTimer();
				const placed = placeCards({ kind: 'foundation', suit }, cards, source);
				if (placed) return true;
				break;
			}
		}

		if (state.undoStack.length) state.undoStack.pop();
		returnCards(source, cards);
		return false;
	}

	function drawFromStock() {
		if (!state.active || state.won) return;

		if (state.stock.length === 0) {
			if (!state.waste.length) return;
			if (!state.mode.redealUnlimited && state.passCount > 0) {
				setStatus('No redeal left in Vegas mode.');
				return;
			}

			pushUndoSnapshot();
			ensureTimer();
			const recycled = state.waste.map((card) => ({ ...card, faceUp: false })).reverse();
			state.stock = recycled;
			state.waste = [];
			state.passCount += 1;
			if (!state.mode.vegas) state.score -= 20;
			state.moves += 1;
			setStatus('Waste recycled back to stock.');
			renderAll();
			updateHud();
			return;
		}

		pushUndoSnapshot();
		ensureTimer();
		const pull = Math.min(state.mode.drawCount, state.stock.length);
		for (let index = 0; index < pull; index += 1) {
			const card = state.stock.pop();
			if (!card) continue;
			card.faceUp = true;
			state.waste.push(card);
		}

		scoreForDrawAction();
		state.moves += 1;
		setStatus('Cards drawn from stock.');
		renderAll();
		updateHud();
	}

	function undoLastMove() {
		if (!state.undoStack.length) {
			setStatus('Nothing to undo.');
			return;
		}
		const snapshot = state.undoStack.pop();
		restoreSnapshot(snapshot);
		setStatus('Undid last move.');
	}

	function maybeWin() {
		const complete = SUITS.every((suit) => state.foundations[suit].length === 13);
		if (!complete || state.won) return;

		state.won = true;
		state.active = false;
		stopTimer();

		const finalMs = state.elapsedAccum;
		const rounded = roundedSeconds(finalMs);
		const record = {
			player: currentUserName(),
			mode: state.mode.label,
			roundedSeconds: rounded,
			elapsedMs: Math.round(finalMs),
			moves: state.moves,
			at: new Date().toISOString(),
		};

		state.records.push(record);
		state.records.sort((a, b) => {
			if (a.roundedSeconds !== b.roundedSeconds) return a.roundedSeconds - b.roundedSeconds;
			if (a.elapsedMs !== b.elapsedMs) return a.elapsedMs - b.elapsedMs;
			return a.moves - b.moves;
		});
		state.records = state.records.slice(0, MAX_BOARD_ROWS);
		saveRecords();
		renderLeaderboard();

		setStatus('Round complete', `Win in ${rounded}s (raw ${formatTimer(finalMs)}).`);
		showOverlay('win', `Final time ${formatTimer(finalMs)}. Leaderboard records ${rounded}s.`);
		updateHud();
	}

	function cardNode(card, source) {
		const node = document.createElement('button');
		node.type = 'button';
		node.className = 'card';
		node.dataset.cardId = card.id;
		node.dataset.source = source.kind;
		node.draggable = false;

		if (source.kind === 'tableau') {
			node.dataset.col = String(source.col);
			node.dataset.row = String(source.row);
		}
		if (source.kind === 'foundation') {
			node.dataset.foundation = source.suit;
		}

		if (!card.faceUp) {
			node.classList.add('face-down');
			node.setAttribute('aria-label', 'Face-down card');
			return node;
		}

		const isRed = cardColor(card) === 'red';
		node.classList.add(isRed ? 'card-red' : 'card-black');
		const rankText = RANK_LABEL[card.rank];
		const suitText = SUIT_SYMBOL[card.suit];
		const verbose = `${rankText} of ${SUIT_NAME[card.suit]}`;
		node.setAttribute('aria-label', verbose);

		const cornerTop = document.createElement('span');
		cornerTop.className = 'card-corner';
		cornerTop.innerHTML = `<span class="card-rank">${rankText}</span><span class="card-suit">${suitText}</span>`;

		const cornerBottom = document.createElement('span');
		cornerBottom.className = 'card-corner-bottom';
		cornerBottom.innerHTML = `<span class="card-rank">${rankText}</span><span class="card-suit">${suitText}</span>`;

		const center = document.createElement('span');
		center.className = 'card-center';
		center.textContent = suitText;

		node.appendChild(cornerTop);
		node.appendChild(cornerBottom);
		node.appendChild(center);
		return node;
	}

	function renderStock() {
		stockPile.innerHTML = '';
		stockPile.classList.toggle('empty', state.stock.length === 0);

		if (state.stock.length > 0) {
			const top = state.stock[state.stock.length - 1];
			const card = cardNode(top, { kind: 'stock' });
			card.classList.add('face-down');
			stockPile.appendChild(card);
		}
	}

	function renderWaste() {
		wastePile.innerHTML = '';
		const fan = document.createElement('div');
		fan.className = 'waste-fan';
		const visible = state.waste.slice(Math.max(0, state.waste.length - 3));

		visible.forEach((card, index) => {
			const node = cardNode(card, { kind: 'waste' });
			node.style.right = `${(visible.length - 1 - index) * 16}px`;
			node.style.zIndex = String(12 + index);
			fan.appendChild(node);
		});

		wastePile.appendChild(fan);
	}

	function renderFoundations() {
		const cells = Array.from(foundationsEl.querySelectorAll('.foundation'));
		cells.forEach((cell) => {
			const suit = cell.dataset.foundation;
			if (!suit || !state.foundations[suit]) return;
			cell.innerHTML = '';
			const stack = state.foundations[suit];
			if (!stack.length) return;
			const top = stack[stack.length - 1];
			const node = cardNode(top, { kind: 'foundation', suit });
			node.style.top = '0px';
			node.style.left = '0px';
			cell.appendChild(node);
		});
	}

	function renderTableau() {
		tableauEl.innerHTML = '';
		state.tableau.forEach((column, col) => {
			const colEl = document.createElement('div');
			colEl.className = 'tableau-col';
			colEl.dataset.zone = 'tableau';
			colEl.dataset.col = String(col);

			if (column.length === 0) {
				colEl.classList.add('empty-slot');
			}

			column.forEach((card, row) => {
				const node = cardNode(card, { kind: 'tableau', col, row });
				node.style.top = `${row * (card.faceUp ? 30 : 12)}px`;
				node.style.zIndex = String(2 + row);
				colEl.appendChild(node);
			});

			tableauEl.appendChild(colEl);
		});
	}

	function renderLeaderboard() {
		if (!leaderboardPreviewBody) return;
		if (!state.records.length) {
			leaderboardPreviewBody.innerHTML = '<tr><td>#1</td><td>-</td><td>-</td><td>--</td></tr>';
			return;
		}

		leaderboardPreviewBody.innerHTML = '';
		state.records.slice(0, 5).forEach((entry, index) => {
			const row = document.createElement('tr');
			row.innerHTML = `
				<td>#${index + 1}</td>
				<td>${escapeHtml(entry.player || 'Guest')}</td>
				<td>${escapeHtml(entry.mode || 'Draw 1')}</td>
				<td>${entry.roundedSeconds}</td>
			`;
			leaderboardPreviewBody.appendChild(row);
		});
	}

	function escapeHtml(value) {
		return String(value)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function updateHud() {
		modeValue.textContent = state.mode.label;
		timerValue.textContent = formatTimer(elapsedMs());
		movesValue.textContent = String(state.moves);
		scoreValue.textContent = String(state.score);
		undoBtn.disabled = state.undoStack.length === 0;
		if (!state.active && !state.won) {
			statusValue.textContent = 'Choose a mode to start';
		}
	}

	function renderAll() {
		renderStock();
		renderWaste();
		renderFoundations();
		renderTableau();
	}

	function clearDropHints() {
		stage.querySelectorAll('.drop-target').forEach((el) => el.classList.remove('drop-target'));
	}

	function clearDragArtifacts() {
		if (state.dragState && state.dragState.releasePointer) {
			state.dragState.releasePointer();
		}
		state.dragState = null;
		dragLayer.innerHTML = '';
		clearDropHints();
		stage.querySelectorAll('.dragging-source').forEach((node) => node.classList.remove('dragging-source'));
	}

	function dragTargetFromPoint(clientX, clientY, cards) {
		const element = document.elementFromPoint(clientX, clientY);
		if (!element) return null;

		const foundation = element.closest('.foundation[data-foundation]');
		if (foundation) {
			const suit = foundation.dataset.foundation;
			if (cards.length === 1 && canMoveToFoundation(cards[0], suit)) {
				return { kind: 'foundation', suit, node: foundation };
			}
		}

		const tableau = element.closest('.tableau-col[data-col]');
		if (tableau) {
			const col = Number(tableau.dataset.col);
			if (Number.isInteger(col) && canMoveToTableau(cards[0], col)) {
				return { kind: 'tableau', col, node: tableau };
			}
		}

		return null;
	}

	function beginDrag(event, source, cards) {
		if (!cards.length || !source) return;
		const pointers = cards.map((card) => {
			const node = stage.querySelector(`.card[data-card-id="${card.id}"]`);
			return { card, node };
		}).filter((entry) => entry.node);

		if (!pointers.length) return;

		const originRect = pointers[0].node.getBoundingClientRect();
		const offsetX = event.clientX - originRect.left;
		const offsetY = event.clientY - originRect.top;

		pointers.forEach((entry) => {
			entry.node.classList.add('dragging-source');
		});

		dragLayer.innerHTML = '';
		const dragCards = pointers.map((entry, index) => {
			const ghost = cardNode(entry.card, { kind: 'drag' });
			ghost.style.left = `${event.clientX - offsetX}px`;
			ghost.style.top = `${event.clientY - offsetY + index * 28}px`;
			ghost.style.zIndex = String(200 + index);
			dragLayer.appendChild(ghost);
			return ghost;
		});

		const onPointerMove = (moveEvent) => {
			moveEvent.preventDefault();
			dragCards.forEach((ghost, index) => {
				ghost.style.left = `${moveEvent.clientX - offsetX}px`;
				ghost.style.top = `${moveEvent.clientY - offsetY + index * 28}px`;
			});

			clearDropHints();
			const target = dragTargetFromPoint(moveEvent.clientX, moveEvent.clientY, cards);
			if (target?.node) target.node.classList.add('drop-target');
			state.dragState.dropTarget = target;
		};

		const onPointerUp = (upEvent) => {
			upEvent.preventDefault();
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', onPointerUp);

			const drag = state.dragState;
			const totalMove = drag
				? Math.hypot(upEvent.clientX - drag.startX, upEvent.clientY - drag.startY)
				: 0;

			if (drag && drag.dropTarget) {
				pushUndoSnapshot();
				ensureTimer();
				const movedCards = takeCards(source);
				const placed = placeCards(drag.dropTarget, movedCards, source);
				if (!placed) {
					returnCards(source, movedCards);
					if (state.undoStack.length) state.undoStack.pop();
					renderAll();
					updateHud();
				}
			}

			if (totalMove > 4) {
				state.suppressClickUntil = Date.now() + 170;
			}
			clearDragArtifacts();
			renderAll();
			updateHud();
		};

		state.dragState = {
			source,
			cards,
			dragCards,
			dropTarget: null,
			startX: event.clientX,
			startY: event.clientY,
			releasePointer: () => {
				window.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
			},
		};

		window.addEventListener('pointermove', onPointerMove);
		window.addEventListener('pointerup', onPointerUp);
	}

	function onCardPointerDown(event) {
		const node = event.target.closest('.card[data-card-id]');
		if (!node || !state.active || state.won) return;
		if (!node.dataset.cardId) return;

		const card = cardById(node.dataset.cardId);
		if (!card || !card.faceUp) return;

		const source = sourceOfCard(card.id);
		if (!source) return;

		const cards = source.kind === 'tableau'
			? state.tableau[source.col].slice(source.start)
			: [card];

		if (!cards.length) return;

		event.preventDefault();
		beginDrag(event, source, cards);
	}

	function onCardClick(event) {
		if (Date.now() < state.suppressClickUntil) return;
		const cardNodeEl = event.target.closest('.card[data-card-id]');
		if (!cardNodeEl || !state.active || state.won) return;
		const cardId = cardNodeEl.dataset.cardId;
		if (!cardId) return;

		const moved = autoMoveCard(cardId);
		if (moved) {
			setStatus('Card auto-moved to foundation.');
		}
	}

	function onCardDoubleClick(event) {
		const cardNodeEl = event.target.closest('.card[data-card-id]');
		if (!cardNodeEl || !state.active || state.won) return;
		const cardId = cardNodeEl.dataset.cardId;
		if (!cardId) return;

		const moved = autoMoveCard(cardId);
		if (moved) {
			setStatus('Quick move complete.');
		}
	}

	function onStockInteract() {
		drawFromStock();
	}

	function handleStart() {
		deal(state.selectedMode);
	}

	function handleNewGame() {
		state.active = false;
		state.won = false;
		stopTimer();
		showOverlay('start');
		updateHud();
		renderAll();
	}

	function handleRestart() {
		deal(state.mode);
	}

	modeButtons.forEach((button) => {
		button.addEventListener('click', () => {
			const mode = MODES[button.dataset.mode];
			if (!mode) return;
			state.selectedMode = mode;
			updateModeButtons();
			if (!state.active || state.won) {
				modeValue.textContent = mode.label;
			}
		});
	});

	startBtn.addEventListener('click', handleStart);
	newGameBtn.addEventListener('click', handleNewGame);
	restartBtn.addEventListener('click', handleRestart);
	undoBtn.addEventListener('click', undoLastMove);

	stockPile.addEventListener('click', onStockInteract);
	stockPile.addEventListener('keydown', (event) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onStockInteract();
		}
	});

	stage.addEventListener('pointerdown', onCardPointerDown);
	stage.addEventListener('click', onCardClick);
	stage.addEventListener('dblclick', onCardDoubleClick);

	window.addEventListener('resize', () => {
		clearDropHints();
	});

	updateModeButtons();
	renderLeaderboard();
	renderAll();
	updateHud();
	showOverlay('start');
})();
