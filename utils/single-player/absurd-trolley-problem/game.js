const TIMER_SECONDS = 10;
const FAKE_CROWD_SIZE = 1000;
const VIEWBOX_WIDTH = 1200;
const VIEWBOX_HEIGHT = 440;

const SCENARIOS = [
	{ subtitle: 'Level 1: Office Gridlock', prompt: 'A trolley is heading toward 12 office workers guarding the last printer cartridge. The other track has 1 person with all your life savings.', mainCount: 12, divertCount: 1 },
	{ subtitle: 'Level 2: Parent Pickup', prompt: 'A trolley is heading toward 8 exhausted parents waiting in the school pickup lane. The other track has 2 people tied there by their own bad idea.', mainCount: 8, divertCount: 2 },
	{ subtitle: 'Level 3: Break Room Debate', prompt: 'A trolley is heading toward 9 coworkers arguing over the last slice of pizza. The other track has 3 people tied onto the rails for no good reason.', mainCount: 9, divertCount: 3 },
	{ subtitle: 'Level 4: Quiet Cats', prompt: 'A trolley is heading toward 20 cats silently judging your browser history. The other track has 4 people holding a single rescue ladder.', mainCount: 20, divertCount: 4 },
	{ subtitle: 'Level 5: Tuesday Bug', prompt: 'A trolley is heading toward 14 programmers about to patch a bug that only appears after lunch. The other track has 5 people tied down by zip ties.', mainCount: 14, divertCount: 5 },
	{ subtitle: 'Level 6: Duck March', prompt: 'A trolley is heading toward 50 ducks running a surprisingly organized parade. The other track has 7 people tied there after ignoring all warning signs.', mainCount: 50, divertCount: 7 },
	{ subtitle: 'Level 7: Savings Vault', prompt: 'A trolley is heading toward 11 commuters and a vault with all your life savings. The other track has 1 person who asked for this challenge.', mainCount: 11, divertCount: 1 },
	{ subtitle: 'Level 8: Baby Robots', prompt: 'A trolley is heading toward 100 baby robots learning how to blink. The other track has 9 people who tied themselves to prove a point.', mainCount: 100, divertCount: 9 },
	{ subtitle: 'Level 9: Sandwich Union', prompt: 'A trolley is heading toward 18 sentient sandwiches staging a union meeting. The other track has 2 people with a box of your life savings.', mainCount: 18, divertCount: 2 },
	{ subtitle: 'Level 10: Ant Complex', prompt: 'A trolley is heading toward 10,000 ants building a tiny apartment tower. The other track has 10 people tied to the rails, and 1 of them is the landlord.', mainCount: 10000, divertCount: 10 },
	{ subtitle: 'Level 11: Fake Problem', prompt: 'A trolley is heading toward 16 scientists trying to prove the trolley problem is fake. The other track has 6 people who are very sure it is not fake.', mainCount: 16, divertCount: 6 },
	{ subtitle: 'Level 12: Timeline Argument', prompt: 'A trolley is heading toward 5 versions of the same person from different timelines. The other track has 3 people tied there by a very suspicious knot.', mainCount: 5, divertCount: 3 },
	{ subtitle: 'Level 13: Stock Market Cat', prompt: 'A trolley is heading toward 13 accountants and 1 cat that accidentally controls the market. The other track has 4 people tied up with a briefcase of your savings.', mainCount: 13, divertCount: 4 },
	{ subtitle: 'Level 14: Engineer Team', prompt: 'A trolley is heading toward 20 engineers fixing the trolley itself while it approaches them. The other track has 5 people who tied themselves onto the rails.', mainCount: 20, divertCount: 5 },
	{ subtitle: 'Level 15: Live Tweet', prompt: 'A trolley is heading toward 19 lurkers and 1 guy live tweeting the disaster. The other track has 2 people with your entire password list.', mainCount: 19, divertCount: 2 },
	{ subtitle: 'Level 16: Pigeon Officials', prompt: 'A trolley is heading toward 50 pigeons that believe they are government officials. The other track has 8 people tied to the rails with a fake permit.', mainCount: 50, divertCount: 8 },
	{ subtitle: 'Level 17: Sarcasm Overload', prompt: 'A trolley is heading toward 15 exhausted teachers and 1 child who just discovered sarcasm. The other track has 4 people who really should not have tied themselves there.', mainCount: 15, divertCount: 4 },
	{ subtitle: 'Level 18: Clone Debate', prompt: 'A trolley is heading toward 10 clones of you arguing about who is original. The other track has 2 people holding a box labeled life savings.', mainCount: 10, divertCount: 2 },
	{ subtitle: 'Level 19: Explainer AI', prompt: 'A trolley is heading toward 12 interns and 1 AI trying to explain the trolley problem in real time. The other track has 7 people tied down with clipboard tape.', mainCount: 12, divertCount: 7 },
	{ subtitle: 'Level 20: Forbidden Button', prompt: 'A trolley is heading toward 20 auditors and a red button marked do not press. The other track has 1 person, 3 chairs, and a very questionable plan.', mainCount: 20, divertCount: 1 },
];

const levelLabel = document.getElementById('levelLabel');
const promptText = document.getElementById('promptText');
const choiceDoNothing = document.getElementById('choiceDoNothing');
const choicePullLever = document.getElementById('choicePullLever');
const timerSeconds = document.getElementById('timerSeconds');
const timerFill = document.getElementById('timerFill');
const trolley = document.getElementById('trolley');
const leverFigure = document.getElementById('leverFigure');
const mainVictims = document.getElementById('mainVictims');
const divertVictims = document.getElementById('divertVictims');
const splatMain = document.getElementById('splatMain');
const splatDivert = document.getElementById('splatDivert');
const resultBar = document.getElementById('resultBar');
const resultPie = document.getElementById('resultPie');
const resultText = document.getElementById('resultText');
const nextBtn = document.getElementById('nextBtn');
const soundToggle = document.getElementById('soundToggle');

const routeMain = document.getElementById('routeMain');
const routeDivert = document.getElementById('routeDivert');
const mainTopTrack = document.getElementById('mainTopTrack');
const mainBottomTrack = document.getElementById('mainBottomTrack');
const divertTopTrack = document.getElementById('divertTopTrack');
const divertBottomTrack = document.getElementById('divertBottomTrack');
const trackMarksMain = document.getElementById('trackMarksMain');
const trackMarksDivert = document.getElementById('trackMarksDivert');

const state = {
	index: 0,
	countdown: TIMER_SECONDS,
	countdownTimer: null,
	typedTimer: null,
	resolving: false,
	awaitingNext: false,
	soundOn: true,
	audioContext: null,
};

function clampCountForDrawing(value) {
	return Math.max(1, Math.min(Number(value) || 1, 15));
}

function formatCount(value) {
	return Number(value || 0).toLocaleString('en-US');
}

function toPercentX(x) {
	return (x / VIEWBOX_WIDTH) * 100;
}

function toPercentY(y) {
	return (y / VIEWBOX_HEIGHT) * 100;
}

function pathSample(path, t) {
	const len = path.getTotalLength();
	const distance = Math.max(0, Math.min(len, len * t));
	const p = path.getPointAtLength(distance);
	const p2 = path.getPointAtLength(Math.min(len, distance + 1));
	const angle = Math.atan2(p2.y - p.y, p2.x - p.x) * (180 / Math.PI);
	return { x: p.x, y: p.y, angle };
}

function drawTrackMarks(upperPath, lowerPath, targetGroup, startT = 0.06, endT = 0.95, step = 0.065) {
	targetGroup.innerHTML = '';
	for (let t = startT; t <= endT; t += step) {
		const topPoint = pathSample(upperPath, t);
		const bottomPoint = pathSample(lowerPath, t);
		const mark = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		mark.setAttribute('x1', String(topPoint.x));
		mark.setAttribute('y1', String(topPoint.y));
		mark.setAttribute('x2', String(bottomPoint.x));
		mark.setAttribute('y2', String(bottomPoint.y));
		targetGroup.appendChild(mark);
	}
}

function positionTrolley(path, t) {
	const point = pathSample(path, t);
	trolley.style.left = `${toPercentX(point.x)}%`;
	trolley.style.top = `${toPercentY(point.y)}%`;
	trolley.style.transform = `translate(-50%, -74%) rotate(${point.angle}deg)`;
}

function renderVictims(container, count, path) {
	const drawCount = clampCountForDrawing(count);
	container.innerHTML = '';
	const startT = drawCount <= 2 ? 0.86 : 0.78;
	const spread = drawCount <= 2 ? 0.08 : 0.17;

	for (let i = 0; i < drawCount; i += 1) {
		const victim = document.createElement('div');
		victim.className = 'victim';

		const p = pathSample(path, startT + ((i / Math.max(1, drawCount - 1)) * spread));
		victim.style.left = `${toPercentX(p.x)}%`;
		victim.style.top = `${toPercentY(p.y)}%`;
		victim.style.transform = `translate(-50%, -57%) rotate(${p.angle + 92}deg)`;

		const head = document.createElement('span');
		head.className = 'v-head';
		const body = document.createElement('span');
		body.className = 'v-body';
		const leftLeg = document.createElement('span');
		leftLeg.className = 'v-leg left';
		const rightLeg = document.createElement('span');
		rightLeg.className = 'v-leg right';

		victim.appendChild(head);
		victim.appendChild(body);
		victim.appendChild(leftLeg);
		victim.appendChild(rightLeg);
		container.appendChild(victim);
	}
}

function positionCrashMarkers() {
	const mainPoint = pathSample(mainBottomTrack, 0.9);
	const divertPoint = pathSample(divertBottomTrack, 0.9);
	splatMain.style.left = `${toPercentX(mainPoint.x)}%`;
	splatMain.style.top = `${toPercentY(mainPoint.y)}%`;
	splatMain.style.transform = `translate(-50%, -62%) rotate(${mainPoint.angle * 0.15}deg)`;
	splatDivert.style.left = `${toPercentX(divertPoint.x)}%`;
	splatDivert.style.top = `${toPercentY(divertPoint.y)}%`;
	splatDivert.style.transform = `translate(-50%, -62%) rotate(${divertPoint.angle * 0.15}deg)`;
}

function clearTimers() {
	if (state.countdownTimer) {
		clearInterval(state.countdownTimer);
		state.countdownTimer = null;
	}
	if (state.typedTimer) {
		clearInterval(state.typedTimer);
		state.typedTimer = null;
	}
}

function resetSceneVisuals() {
	leverFigure.classList.remove('pulled');
	splatMain.classList.remove('visible');
	splatDivert.classList.remove('visible');
	mainVictims.style.opacity = '1';
	divertVictims.style.opacity = '1';
	positionTrolley(routeMain, 0.06);
}

function disableChoices(disabled) {
	choiceDoNothing.disabled = disabled;
	choicePullLever.disabled = disabled;
}

function runFadeTyping(text, target) {
	if (state.typedTimer) {
		clearInterval(state.typedTimer);
	}

	target.innerHTML = '';
	const chars = text.split('');
	let index = 0;

	return new Promise((resolve) => {
		if (!chars.length) {
			resolve();
			return;
		}

		state.typedTimer = setInterval(() => {
			if (index >= chars.length) {
				clearInterval(state.typedTimer);
				state.typedTimer = null;
				resolve();
				return;
			}

			const span = document.createElement('span');
			span.className = 'typed-char';
			span.textContent = chars[index];
			span.style.animationDelay = `${(index % 9) * 0.08}s`;
			target.appendChild(span);
			requestAnimationFrame(() => span.classList.add('visible'));

			index += 1;
		}, 15);
	});
}

function getCurrentScenario() {
	const idx = state.index % SCENARIOS.length;
	return SCENARIOS[idx];
}

function isLoggedIn() {
	if (window.PlayrAuth) {
		if (typeof window.PlayrAuth.isLoggedIn === 'boolean') {
			return window.PlayrAuth.isLoggedIn;
		}
		if (typeof window.PlayrAuth.isLoggedIn === 'function') {
			try {
				return Boolean(window.PlayrAuth.isLoggedIn());
			} catch {
				return false;
			}
		}
		if (typeof window.PlayrAuth.getCurrentUser === 'function') {
			return Boolean(window.PlayrAuth.getCurrentUser());
		}
	}

	try {
		const raw = localStorage.getItem('playrCurrentUser');
		return Boolean(raw && JSON.parse(raw));
	} catch {
		return false;
	}
}

async function startRound() {
	clearTimers();
	state.resolving = false;
	state.awaitingNext = false;
	choiceDoNothing.disabled = true;
	choicePullLever.disabled = true;
	state.countdown = TIMER_SECONDS;

	const scenario = getCurrentScenario();
	levelLabel.textContent = scenario.subtitle;

	renderVictims(mainVictims, scenario.mainCount, mainBottomTrack);
	renderVictims(divertVictims, scenario.divertCount, divertBottomTrack);
	positionCrashMarkers();
	resetSceneVisuals();

	resultBar.hidden = true;
	timerSeconds.textContent = String(TIMER_SECONDS);
	timerFill.style.width = '100%';

	const prompt = `Oh no! ${scenario.prompt} Do you pull the lever or let it roll?`;
	await runFadeTyping(prompt, promptText);
	disableChoices(false);

	state.countdownTimer = setInterval(() => {
		state.countdown -= 0.1;
		const secondsLeft = Math.max(0, Math.ceil(state.countdown));
		timerSeconds.textContent = String(secondsLeft);

		const pct = Math.max(0, Math.min(1, state.countdown / TIMER_SECONDS));
		timerFill.style.width = `${pct * 100}%`;

		if (Math.abs(state.countdown - Math.round(state.countdown)) < 0.051) {
			playTick();
		}

		if (state.countdown <= 0) {
			clearInterval(state.countdownTimer);
			state.countdownTimer = null;
			handleTimeout();
		}
	}, 100);
}

function seededRandom(seed) {
	let value = seed % 2147483647;
	if (value <= 0) value += 2147483646;
	return () => {
		value = (value * 48271) % 2147483647;
		return (value - 1) / 2147483646;
	};
}

function simulateFictionalUniverses(levelSeed, choice) {
	const baseEntries = Array.from({ length: FAKE_CROWD_SIZE }, (_, index) => ({
		id: index + 1,
		choice: index < (FAKE_CROWD_SIZE / 2) ? 'pull' : 'nothing',
	}));
	const random = seededRandom((levelSeed * 7919) + 1337);
	for (let index = baseEntries.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(random() * (index + 1));
		[baseEntries[index], baseEntries[swapIndex]] = [baseEntries[swapIndex], baseEntries[index]];
	}

	const leverCount = baseEntries.filter((entry) => entry.choice === 'pull').length;
	const doNothingCount = baseEntries.length - leverCount;
	return {
		doNothingCount,
		leverCount,
		totalRuns: baseEntries.length,
		entries: baseEntries,
	};
}

function easeInOut(value) {
	return value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2;
}

function animateTrolley(route) {
	const path = route === 'divert' ? routeDivert : routeMain;
	const duration = 3300;
	const startedAt = performance.now();

	return new Promise((resolve) => {
		function frame(now) {
			const elapsed = now - startedAt;
			const t = Math.min(1, elapsed / duration);
			positionTrolley(path, easeInOut(t));
			if (t < 1) {
				requestAnimationFrame(frame);
			} else {
				resolve();
			}
		}
		requestAnimationFrame(frame);
	});
}

function showResultFooter({ timedOut, choice }) {
	resultBar.hidden = false;
	nextBtn.focus();

	if (timedOut) {
		resultPie.style.display = 'none';
		resultText.textContent = 'Out of time. The trolley kept going on the main track. No crowd data shown for this round.';
		nextBtn.textContent = 'Next ->';
		return;
	}

	const simulation = simulateFictionalUniverses(state.index + 1, choice);
	const userBucket = choice === 'pull' ? simulation.leverCount : simulation.doNothingCount;

	resultPie.style.display = 'block';
	resultPie.style.background = 'conic-gradient(var(--accent) 0 50%, var(--accent-2) 50% 100%)';
	resultText.textContent = `Fake crowd data: ${simulation.leverCount} would pull, ${simulation.doNothingCount} would do nothing. Your choice matched ${userBucket} of ${simulation.totalRuns} entries.`;
	nextBtn.textContent = 'Next ->';
}

async function resolveChoice(choice, timedOut = false) {
	if (state.resolving || state.awaitingNext) return;
	state.resolving = true;
	clearTimers();
	disableChoices(true);

	const scenario = getCurrentScenario();
	const route = choice === 'pull' ? 'divert' : 'main';
	if (route === 'divert') {
		leverFigure.classList.add('pulled');
	}

	playMove();
	await animateTrolley(route);

	if (route === 'main') {
		splatMain.classList.add('visible');
		playSplat();
		mainVictims.style.opacity = '0.15';
	} else {
		splatDivert.classList.add('visible');
		playSplat();
		divertVictims.style.opacity = '0.15';
	}

	showResultFooter({ timedOut, choice });
	state.resolving = false;
	state.awaitingNext = true;
}

function handleTimeout() {
	resolveChoice('nothing', true);
}

function audioContext() {
	if (!state.soundOn) return null;
	if (!state.audioContext) {
		const Ctx = window.AudioContext || window.webkitAudioContext;
		if (!Ctx) return null;
		state.audioContext = new Ctx();
	}
	return state.audioContext;
}

function playTone(freq, duration, type = 'triangle', volume = 0.03, endFreq = null) {
	const ctx = audioContext();
	if (!ctx) return;

	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.type = type;
	osc.frequency.value = freq;
	if (endFreq) {
		osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration / 1000);
	}

	gain.gain.value = volume;
	gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration / 1000);

	osc.connect(gain);
	gain.connect(ctx.destination);
	osc.start();
	osc.stop(ctx.currentTime + duration / 1000);
}

function playMove() {
	playTone(180, 250, 'sawtooth', 0.022, 120);
}

function playSplat() {
	playTone(130, 120, 'square', 0.03, 80);
	setTimeout(() => playTone(98, 180, 'triangle', 0.02, 70), 70);
}

function playTick() {
	if (state.countdown > 3.2) return;
	playTone(690, 40, 'square', 0.012);
}

choiceDoNothing.addEventListener('click', () => {
	resolveChoice('nothing', false);
});

choicePullLever.addEventListener('click', () => {
	resolveChoice('pull', false);
});

nextBtn.addEventListener('click', () => {
	if (!state.awaitingNext) return;
	state.index += 1;
	mainVictims.style.opacity = '1';
	divertVictims.style.opacity = '1';
	void startRound();
});

soundToggle.addEventListener('click', () => {
	state.soundOn = !state.soundOn;
	soundToggle.textContent = state.soundOn ? 'sound on' : 'sound off';
});

document.addEventListener('keydown', (event) => {
	if (state.resolving) return;

	const key = event.key.toLowerCase();
	if (key === 'a') {
		resolveChoice('nothing', false);
	} else if (key === 'b') {
		resolveChoice('pull', false);
	} else if ((event.code === 'Space' || key === 'enter') && state.awaitingNext) {
		event.preventDefault();
		nextBtn.click();
	}
});

drawTrackMarks(mainTopTrack, mainBottomTrack, trackMarksMain, 0.05, 0.97, 0.055);
drawTrackMarks(divertTopTrack, divertBottomTrack, trackMarksDivert, 0.04, 0.94, 0.08);
resetSceneVisuals();
void startRound();
