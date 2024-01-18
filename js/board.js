class Board{
   
    constructor(ctx, ctxNext, ctxSaved){
        this.ctx = ctx;
        this.ctxNext = ctxNext;
        this.ctxSaved = ctxSaved;
        this.init();
    }

    init(){
        this.ctx.canvas.width = COLS * BLOCK_SIZE;
        this.ctx.canvas.height = ROWS * BLOCK_SIZE;
        this.ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
    }

    reset(){
        this.grid = this.getEmptyGrid();
        this.piece = new Piece(this.ctx);
        this.piece.setStartingPosition();
        this.getNewPiece();
    }

    getNewPiece(){
        const {width, height} = this.ctxNext.canvas;
        this.next = new Piece(this.ctxNext);
        this.ctxNext.clearRect(0, 0, width, height);
        this.next.draw();
    }

    draw(){
        this.piece.draw();
        this.drawBoard();
    }

    drop(){
        let p = moves[KEY.DOWN](this.piece);
        if (this.valid(p)){
            this.piece.move(p);
        } else{
            this.freeze();
            this.clearLines();
            if (this.piece.y == 0){
                return false;
            }
            this.piece = this.next;
            this.piece.ctx = this.ctx;
            this.piece.setStartingPosition();
            this.getNewPiece();
        }
        return true;
    }
    clearLines(){
        let lines = 0;
        this.grid.forEach((row, y) => {
            if (row.every((value)=>value>0)){
                lines++;
                this.grid.splice(y, 1);
                this.grid.unshift(Array(COLS).fill(0));
            }
        });
        if (lines > 0){
            account.score += this.getLinesClearedPoints(lines);
            account.lines += lines;
            if (account.lines >= LINES_PER_LEVEL){
                account.level++;
                account.lines -= LINES_PER_LEVEL;
                time.level = LEVEL[account.level];
            }
        }
    }
    valid(p){
        return p.shape.every((row, dy) =>{
            return row.every((value, dx) => {
                let x = p.x + dx;
                let y= p.y + dy;
                return this.isEmpty(value) || (this.insideWalls(x) && this.aboveFloor(y));
            });
        });
    }
    freeze(){
        this.piece.shape.forEach((row, y)=>{
            row.forEach((value, x) => {
                if (value> 0){
                    this.grid[y+ this.piece.y][x+this.piece.x] = value;
                }
            });
        });
    }

    drawBoard(){
        this.grid.forEach((row, y)=>{
            row.forEach((value, x) => {
                if (value > 0) {
                    this.ctx.fillStyle= COLORS[value];
                    this.ctx.fillRect(x, y, 1, 1);
                }
            });
        });
    }
}