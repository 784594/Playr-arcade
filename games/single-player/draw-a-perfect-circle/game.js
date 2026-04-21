(function () {
	const root = document.getElementById('gameRoot');
	const canvas = document.getElementById('circleCanvas');
	const stage = document.getElementById('circleStage');
	const status = document.getElementById('gameStatus');
	const overlayNote = document.getElementById('overlayNote');
	const retryBtn = document.getElementById('retryBtn');
	const leaderboardRows = document.getElementById('leaderboardRows');
	const resultBadge = document.getElementById('resultBadge');
	const resultBadgeValue = document.getElementById('resultBadgeValue');

	const accuracyValue = document.getElementById('accuracyValue');
	const roundnessValue = document.getElementById('roundnessValue');
	const closureValue = document.getElementById('closureValue');
	const coverageValue = document.getElementById('coverageValue');
	const deviationValue = document.getElementById('deviationValue');
	const timeValue = document.getElementById('timeValue');
	const pointsValue = document.getElementById('pointsValue');

	if (!root || !canvas || !stage || !status || !leaderboardRows) return;

	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	const LEADERBOARD_KEY = 'playr.lb.draw-a-perfect-circle';
	const PENDING_SUBMISSIONS_KEY = 'playr.pendingSubmissions';
	const MAX_BOARD_ROWS = 100;

	const state = {
		drawing: false,
		points: [],
		startedAt: 0,
		endedAt: 0,
		lastScore: null,
		pointerId: null,
		displayWidth: 900,
		displayHeight: 560,
	};

	function formatMs(value) {
		return `${Math.round(value)}ms`;
	}

	function getCurrentDisplayName() {
		try {
			if (window.PlayrAuth && typeof window.PlayrAuth.getCurrentUser === 'function') {
				const user = window.PlayrAuth.getCurrentUser();
				if (user && user.displayName) {
					return String(user.displayName).trim().slice(0, 24) || 'Guest';
				}
			}
		} catch (_error) {
			// Fallback to storage-based identity.
		}

		try {
			const rawCurrent = localStorage.getItem('playrCurrentUser');
			if (rawCurrent) {
				const parsed = JSON.parse(rawCurrent);
				const name = String(parsed?.displayName || '').trim();
				if (name) return name.slice(0, 24);
			}
		} catch (_error) {
			// Ignore malformed local profile.
		}

		const legacy = String(localStorage.getItem('playr.username') || '').trim();
		return legacy ? legacy.slice(0, 24) : 'Guest';
	}

	function readLocalLeaderboard() {
		try {
			const raw = localStorage.getItem(LEADERBOARD_KEY);
			if (!raw) return [];
			const parsed = JSON.parse(raw);
			return Array.isArray(parsed) ? parsed : [];
		} catch (_error) {
			return [];
		}
	}

	function writeLocalLeaderboard(rows) {
		localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(rows));
	}

	function queuePendingSubmission(payload) {
		try {
			const raw = localStorage.getItem(PENDING_SUBMISSIONS_KEY);
			const queue = raw ? JSON.parse(raw) : [];
			const nextQueue = Array.isArray(queue) ? queue : [];
			nextQueue.push(payload);
			localStorage.setItem(PENDING_SUBMISSIONS_KEY, JSON.stringify(nextQueue));
		} catch (_error) {
			// Local board still updates even when queue storage fails.
		}
	}

	function renderLeaderboard() {
		const rows = readLocalLeaderboard().slice(0, 8);
		if (!rows.length) {
			leaderboardRows.innerHTML = '<tr><td colspan="4">No runs saved yet.</td></tr>';
			return;
		}

		leaderboardRows.innerHTML = rows
			.map((row, index) => `
				<tr>
					<td>#${index + 1}</td>
					<td>${String(row.player || 'Guest').slice(0, 24)}</td>
					<td>${Number(row.accuracy || 0).toFixed(2)}%</td>
					<td>${Math.round(Number(row.drawTimeMs || 0))}ms</td>
				</tr>
			`)
			.join('');
	}

	function clearScoreFields() {
		accuracyValue.textContent = '--';
		roundnessValue.textContent = '--';
		closureValue.textContent = '--';
		coverageValue.textContent = '--';
		deviationValue.textContent = '--';
		timeValue.textContent = '--';
		pointsValue.textContent = '--';
	}

	function updateScoreFields(score) {
		accuracyValue.textContent = `${score.accuracy.toFixed(2)}%`;
		roundnessValue.textContent = `${score.roundness.toFixed(2)}%`;
		closureValue.textContent = `${score.closure.toFixed(2)}%`;
		coverageValue.textContent = `${score.coverage.toFixed(2)}%`;
		deviationValue.textContent = `${score.deviationPct.toFixed(2)}%`;
		timeValue.textContent = formatMs(score.drawTimeMs);
		pointsValue.textContent = String(score.pointCount);
	}

	function resizeCanvas() {
		const ratio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
		const rect = stage.getBoundingClientRect();
		const width = Math.max(320, Math.floor(rect.width));
		const height = Math.max(360, Math.floor(canvas.clientHeight || 560));

		state.displayWidth = width;
		state.displayHeight = height;

		canvas.width = Math.floor(width * ratio);
		canvas.height = Math.floor(height * ratio);
		ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
		renderScene();
	}

	function getPointFromEvent(event) {
		const rect = canvas.getBoundingClientRect();
		return {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top,
			t: performance.now(),
		};
	}

	function getIdealGuide() {
		const center = {
			x: state.displayWidth / 2,
			y: state.displayHeight / 2,
		};
		const radius = Math.min(state.displayWidth, state.displayHeight) * 0.29;
		return { center, radius };
	}

	function renderBackgroundGuide() {
		const guide = getIdealGuide();

		ctx.save();
		ctx.strokeStyle = 'rgba(127, 255, 243, 0.25)';
		ctx.lineWidth = 2;
		ctx.setLineDash([7, 8]);
		ctx.beginPath();
		ctx.arc(guide.center.x, guide.center.y, guide.radius, 0, Math.PI * 2);
		ctx.stroke();
		ctx.restore();

		ctx.save();
		ctx.strokeStyle = 'rgba(255, 181, 101, 0.18)';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(guide.center.x - guide.radius - 30, guide.center.y);
		ctx.lineTo(guide.center.x + guide.radius + 30, guide.center.y);
		ctx.moveTo(guide.center.x, guide.center.y - guide.radius - 30);
		ctx.lineTo(guide.center.x, guide.center.y + guide.radius + 30);
		ctx.stroke();
		ctx.restore();
	}

	function renderPath() {
		if (!state.points.length) return;

		ctx.save();
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.lineWidth = 4;

		if (state.drawing) {
			ctx.shadowBlur = 16;
			ctx.shadowColor = 'rgba(152, 255, 171, 0.45)';
			ctx.strokeStyle = '#9bffcb';
		} else {
			ctx.strokeStyle = '#7ffff3';
		}

		ctx.beginPath();
		ctx.moveTo(state.points[0].x, state.points[0].y);
		for (let i = 1; i < state.points.length; i += 1) {
			ctx.lineTo(state.points[i].x, state.points[i].y);
		}
		ctx.stroke();
		ctx.restore();
	}

	function renderScoredCircle(score) {
		if (!score || !score.center || !Number.isFinite(score.radiusMean)) return;

		ctx.save();
		ctx.strokeStyle = 'rgba(255, 181, 101, 0.55)';
		ctx.lineWidth = 2;
		ctx.setLineDash([5, 7]);
		ctx.beginPath();
		ctx.arc(score.center.x, score.center.y, score.radiusMean, 0, Math.PI * 2);
		ctx.stroke();
		ctx.restore();
	}

	function renderScene() {
		ctx.clearRect(0, 0, state.displayWidth, state.displayHeight);
		renderBackgroundGuide();
		renderPath();
		if (!state.drawing) {
			renderScoredCircle(state.lastScore);
		}
	}

	function simplifyPoints(points, minDistanceSq) {
		if (points.length <= 2) return points.slice();
		const result = [points[0]];
		let prev = points[0];

		for (let i = 1; i < points.length - 1; i += 1) {
			const point = points[i];
			const dx = point.x - prev.x;
			const dy = point.y - prev.y;
			if (dx * dx + dy * dy >= minDistanceSq) {
				result.push(point);
				prev = point;
			}
		}

		result.push(points[points.length - 1]);
		return result;
	}

	function computeCoverage(points, center) {
		const bins = 72;
		const seen = new Array(bins).fill(false);

		points.forEach((point) => {
			const angle = Math.atan2(point.y - center.y, point.x - center.x);
			const normalized = (angle + Math.PI * 2) % (Math.PI * 2);
			const index = Math.min(bins - 1, Math.floor((normalized / (Math.PI * 2)) * bins));
			seen[index] = true;
		});

		const covered = seen.reduce((sum, active) => sum + (active ? 1 : 0), 0);
		return (covered / bins) * 100;
	}

	function isPointOnGuide(point) {
		const guide = getIdealGuide();
		const distFromCenter = Math.hypot(point.x - guide.center.x, point.y - guide.center.y);
		const distFromGuideRadius = Math.abs(distFromCenter - guide.radius);
		return distFromGuideRadius < 60; // Allow 60px tolerance from the guide line
	}

	function isCircleOnGuide(rawPoints) {
		if (rawPoints.length === 0) return false;
		const pointsOnGuide = rawPoints.filter(p => isPointOnGuide(p));
		return pointsOnGuide.length / rawPoints.length > 0.6; // At least 60% of points should be on guide
	}

	function analyzeCircle(rawPoints, drawTimeMs) {
		const points = simplifyPoints(rawPoints, 5);

		const center = points.reduce((acc, point) => {
			acc.x += point.x;
			acc.y += point.y;
			return acc;
		}, { x: 0, y: 0 });

		center.x /= points.length;
		center.y /= points.length;

		const radii = points.map((point) => Math.hypot(point.x - center.x, point.y - center.y));
		const radiusMean = radii.reduce((sum, r) => sum + r, 0) / radii.length;

		const variance = radii.reduce((sum, r) => {
			const diff = r - radiusMean;
			return sum + diff * diff;
		}, 0) / radii.length;

		const stdDev = Math.sqrt(variance);
		const deviationPct = radiusMean > 0 ? (stdDev / radiusMean) * 100 : 100;

		const start = points[0];
		const end = points[points.length - 1];
		const closureDistance = Math.hypot(end.x - start.x, end.y - start.y);
		const closureRatio = closureDistance / Math.max(radiusMean, 1);
		const closure = Math.max(0, 100 - closureRatio * 100);

		const coverage = computeCoverage(points, center);
		const roundness = Math.max(0, 100 - deviationPct * 2.5);

		const speedPenalty = drawTimeMs < 380 ? Math.min(9, (380 - drawTimeMs) / 42) : 0;

		const accuracy = Math.max(
			0,
			Math.min(
				100,
				roundness * 0.64
					+ closure * 0.24
					+ coverage * 0.12
					- speedPenalty
			)
		);

		return {
			accuracy,
			roundness,
			closure,
			coverage,
			deviationPct,
			drawTimeMs,
			pointCount: points.length,
			center,
			radiusMean,
			closureDistance,
			scoredAt: Date.now(),
		};
	}

	function buildLeaderboardPayload(score) {
		const runId = `circle-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
		const playerName = getCurrentDisplayName();

		return {
			gameId: 'draw-a-perfect-circle',
			metric: 'accuracy_percent',
			direction: 'desc',
			primaryScore: Number(score.accuracy.toFixed(4)),
			secondaryStats: {
				roundness: Number(score.roundness.toFixed(4)),
				closure: Number(score.closure.toFixed(4)),
				coverage: Number(score.coverage.toFixed(4)),
				deviationPct: Number(score.deviationPct.toFixed(4)),
				drawTimeMs: Math.round(score.drawTimeMs),
				pointCount: score.pointCount,
			},
			submittedAt: Date.now(),
			runId,
			player: {
				username: playerName,
				loggedIn: localStorage.getItem('playrLoggedIn') === 'true',
			},
			antiCheat: {
				trusted: true,
				flags: [],
			},
		};
	}

	function setResultBadge(score) {
		if (!resultBadge || !resultBadgeValue) return;
		if (!score) {
			resultBadge.hidden = true;
			return;
		}
		resultBadge.hidden = false;
		resultBadgeValue.textContent = `${score.accuracy.toFixed(2)}%`;
	}

	function resetBoard(message) {
		state.drawing = false;
		state.points = [];
		state.startedAt = 0;
		state.endedAt = 0;
		state.lastScore = null;
		if (overlayNote) overlayNote.textContent = 'Draw one circle in one stroke';
		if (message) status.textContent = message;
		setResultBadge(null);
		clearScoreFields();
		renderScene();
	}

	function startDrawing(event) {
		if (state.drawing) return;

		state.drawing = true;
		state.pointerId = event.pointerId;
		state.points = [];
		state.startedAt = performance.now();
		state.endedAt = 0;
		state.lastScore = null;

		status.textContent = 'Drawing... keep the line smooth and close the loop.';
		if (overlayNote) overlayNote.textContent = 'Release to score your circle';
		setResultBadge(null);
		clearScoreFields();

		canvas.setPointerCapture(event.pointerId);
		const point = getPointFromEvent(event);
		state.points.push(point);
		renderScene();
	}

	function continueDrawing(event) {
		if (!state.drawing || state.pointerId !== event.pointerId) return;
		const point = getPointFromEvent(event);
		const last = state.points[state.points.length - 1];
		const dx = point.x - last.x;
		const dy = point.y - last.y;

		if (dx * dx + dy * dy < 3.5) return;
		state.points.push(point);
		renderScene();
	}

	function finishDrawing(event) {
		if (!state.drawing || state.pointerId !== event.pointerId) return;

		state.drawing = false;
		state.endedAt = performance.now();

		try {
			canvas.releasePointerCapture(event.pointerId);
		} catch (_error) {
			// Safe to ignore if capture was already released.
		}

		const drawTimeMs = Math.max(0, state.endedAt - state.startedAt);

		if (state.points.length < 36) {
			status.textContent = 'Too short. Draw a larger circle in one continuous stroke.';
			if (overlayNote) overlayNote.textContent = 'Try a wider, slower circle';
			setResultBadge(null);
			renderScene();
			return;
		}

		if (!isCircleOnGuide(state.points)) {
			status.textContent = 'Draw ON the yellow dashed line, not outside it!';
			if (overlayNote) overlayNote.textContent = 'Stay on the guide line';
			setResultBadge(null);
			renderScene();
			return;
		}

		const result = analyzeCircle(state.points, drawTimeMs);
		state.lastScore = result;

		updateScoreFields(result);
		setResultBadge(result);
		renderScene();

		status.textContent = `Scored ${result.accuracy.toFixed(2)}% accuracy. Saved to leaderboard!`;
		if (overlayNote) overlayNote.textContent = 'Draw another run';
		autoSaveRun(result);
	}

	function autoSaveRun(score) {
		if (!score) return;

		const payload = buildLeaderboardPayload(score);
		const currentRows = readLocalLeaderboard();

		const newRow = {
			player: payload.player.username,
			accuracy: payload.primaryScore,
			roundness: payload.secondaryStats.roundness,
			closure: payload.secondaryStats.closure,
			coverage: payload.secondaryStats.coverage,
			deviationPct: payload.secondaryStats.deviationPct,
			drawTimeMs: payload.secondaryStats.drawTimeMs,
			pointCount: payload.secondaryStats.pointCount,
			submittedAt: payload.submittedAt,
			runId: payload.runId,
		};

		const nextRows = [...currentRows, newRow]
			.sort((a, b) => Number(b.accuracy) - Number(a.accuracy) || Number(a.drawTimeMs) - Number(b.drawTimeMs))
			.slice(0, 5); // Keep only top 5 runs

		writeLocalLeaderboard(nextRows);
		queuePendingSubmission(payload);
		renderLeaderboard();
	}

	canvas.addEventListener('pointerdown', startDrawing);
	canvas.addEventListener('pointermove', continueDrawing);
	canvas.addEventListener('pointerup', finishDrawing);
	canvas.addEventListener('pointercancel', finishDrawing);

	retryBtn?.addEventListener('click', () => {
		resetBoard('Press and hold inside the board to start.');
	});

	window.addEventListener('resize', resizeCanvas);

	resizeCanvas();
	clearScoreFields();
	renderLeaderboard();
	status.textContent = 'Press and hold inside the board to start.';
})();
