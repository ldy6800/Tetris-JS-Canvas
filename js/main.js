const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const canvasNext = document.getElementById('next');
const ctxNext = canvasNext.getContext('2d');
const canvasSaved = document.getElementById('saved');
const ctxSaved = canvasSaved.getContext('2d');

let accountValues = {
	score: 0,
	level: 0,
	lines: 0
};

function updateAccount(key, value) {
	let element = document.getElementById(key);
	if (element) {
		element.textContent = value;
	}
}

let account = new Proxy(accountValues, {
	set: (target, key, value) => {
		target[key] = value;
		updateAccount(key, value);
		return true;
	}
});

let requestId = null;
let time = null;

const moves = {
	[KEY.LEFT]: (p) => ({ ...p, x: p.x - 1 }),
	[KEY.RIGHT]: (p) => ({ ...p, x: p.x + 1 }),
	[KEY.DOWN]: (p) => ({ ...p, y: p.y + 1 }),
	[KEY.SPACE]: (p) => ({ ...p, y: p.y + 1 }),
	[KEY.UP]: (p) => board.rotate(p, ROTATION.RIGHT),
	[KEY.SHIFT]: (p) => board.rotate(p, ROTATION.LEFT)
};

let board = new Board(ctx, ctxNext, ctxSaved);
initNextSaved();
function initNextSaved() {
	ctxNext.canvas.width = 4 * MENU_BLOCK_SIZE;
	ctxNext.canvas.height = 4 * MENU_BLOCK_SIZE;
	ctxNext.scale(MENU_BLOCK_SIZE, MENU_BLOCK_SIZE);
	ctxSaved.canvas.width = 4 * MENU_BLOCK_SIZE;
	ctxSaved.canvas.height = 4 * MENU_BLOCK_SIZE;
	ctxSaved.scale(MENU_BLOCK_SIZE, MENU_BLOCK_SIZE);
}

function addEventListener() {
	document.removeEventListener('keydown', handleKeyPress);
	document.addEventListener('keydown', handleKeyPress);
}

function handleKeyPress(event) {
	if (event.key === KEY.ESC) {
		pause();
	}
	if (moves[event.key]) {
		event.preventDefault();
		let p = moves[event.key](board.piece);
		if (event.key === KEY.SPACE) {
			if (document.querySelector('#pause-btn').style.display === 'block') {
				//dropSound.play();
			} else {
				return;
			}

			while (board.valid(p)) {
				account.score += POINTS.HARD_DROP;
				board.piece.move(p);
				p = moves[KEY.DOWN](board.piece);
			}
			board.piece.hardDrop();
			
			if (!board.drop()) {
				gameOver();
				return;
			}
			// Clear board before drawing new state.
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

			board.draw();
			time.start = now;
		} else if (board.valid(p)) {
			if (document.querySelector('#pause-btn').style.display === 'block') {
				//movesSound.play();
			}
			board.piece.move(p);
			if (event.keyCode === KEY.DOWN &&
				document.querySelector('#pause-btn').style.display === 'block') {
				account.score += POINTS.SOFT_DROP;
			}
		}
	}
}

function resetGame() {
	account.score = 0;
	account.lines = 0;
	account.level = 0;
	board.reset();
	time = { start: performance.now(), elapsed: 0, level: LEVEL[account.level] };
}
function play() {
	addEventListener();
	if (document.querySelector('#play-btn').style.display == '') {
		resetGame();
	}
	if (requestId) {
		cancelAnimationFrame(requestId);
	}
	animate();
	document.querySelector('#play-btn').style.display = 'none';
	document.querySelector('#pause-btn').style.display = 'block';
	//backgroundSound.play();
}

function animate(now = 0) {
	time.elapsed = now - time.start;
	if (time.elapsed > time.level) {
		time.start = now;
		if (!board.drop()) {
			gameOver();
			return;
		}
	}

	// Clear board before drawing new state.
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	board.draw();
	requestId = requestAnimationFrame(animate);
}

function gameOver() {
	cancelAnimationFrame(requestId);

	ctx.fillStyle = 'black';
	ctx.fillRect(1, 3, 8, 1.2);
	ctx.font = '1px Arial';
	ctx.fillStyle = 'red';
	ctx.fillText('GAME OVER', 1.8, 4);

	sound.pause();
	//finishSound.play();
	//checkHighScore(account.score);

	document.querySelector('#pause-btn').style.display = 'none';
	document.querySelector('#play-btn').style.display = '';
}
function pause() {
	if (!requestId) {
		document.querySelector('#play-btn').style.display = 'none';
		document.querySelector('#pause-btn').style.display = 'block';
		animate();
		//backgroundSound.play();
		return;
	}

	cancelAnimationFrame(requestId);
	requestId = null;

	ctx.fillStyle = 'black';
	ctx.fillRect(1, 3, 8, 1.2);
	ctx.font = '1px Arial';
	ctx.fillStyle = 'yellow';
	ctx.fillText('PAUSED', 3, 4);
	document.querySelector('#play-btn').style.display = 'block';
	document.querySelector('#pause-btn').style.display = 'none';
	//sound.pause();
}
