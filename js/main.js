const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const canvasNext = document.getElementById('next');
const ctxNext = canvasNext.getContext('2d');
const canvasSaved = document.getElementById('saved');
const ctxSaved = canvasSaved.getContext('2d');

moves = {
	[KEY.LEFT]: p => ({ ...p, x: p.x - 1 }),
	[KEY.RIGHT]: p => ({ ...p, x: p.x + 1 }),
	[KEY.UP]: p => ({ ...p, y: p.y + 1 })
};

let board = new Board(ctx, ctxNext, ctxSaved);
function play() {
	board.reset();
	console.table(board.grid);
	let piece = new Piece(ctx);
	piece.draw();

	board.piece = piece;
}

window.addEventListener('keydown', event => {
	if (moves[event.key]) {
		// 이벤트 버블링을 막는다.
		event.preventDefault();
		
		// 조각의 새 상태를 얻는다.
		if (moves[event.key]){
			let p = moves[event.key](board.piece);

			if (board.valid(p)) {
				// 이동이 가능한 상태라면 조각을 이동한다.
				board.piece.move(p);

				// 그리기 전에 이전 좌표를 지운다.
				ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

				board.piece.draw();
			}
		}
	}
});