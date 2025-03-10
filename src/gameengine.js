class GameEngine {
    constructor(options) {
        this.ctx = null;
        this.entities = [];
        this.click = null;
        this.mouse = null;
        this.wheel = null;
        this.keys = {};
        this.options = options || { debugging: false };

        // Timer & Game State
        this.timer = new Timer();
        this.timeLeft = 1; // 120 seconds countdown
        this.gameOver = false;
        this.score = 0;
        this.isGameStarted = false;
    }

    init(ctx) {
        this.ctx = ctx;
        this.startInput();
        this.timer.lastTimestamp = Date.now();
    }

    start() {
        const gameLoop = () => {
            this.loop();
            requestAnimFrame(gameLoop, this.ctx.canvas);
        };
        gameLoop();
    }

    startInput() {
        const getXandY = e => ({
            x: e.clientX - this.ctx.canvas.getBoundingClientRect().left,
            y: e.clientY - this.ctx.canvas.getBoundingClientRect().top
        });

        this.ctx.canvas.addEventListener("mousemove", e => this.mouse = getXandY(e));
        this.ctx.canvas.addEventListener("click", e => this.click = getXandY(e));
        this.ctx.canvas.addEventListener("wheel", e => e.preventDefault());
        this.ctx.canvas.addEventListener("contextmenu", e => e.preventDefault());
        this.ctx.canvas.addEventListener("keydown", event => this.keys[event.key] = true);
        this.ctx.canvas.addEventListener("keyup", event => this.keys[event.key] = false);

        // Dragging Box Selection
        this.isDragging = false;
        this.dragStart = null;
        this.dragEnd = null;

        this.ctx.canvas.addEventListener("mousedown", e => {
            this.isDragging = true;
            this.dragStart = getXandY(e);
            this.dragEnd = this.dragStart;

            this.highlightSelection();
        });

        this.ctx.canvas.addEventListener("mousemove", e => {
            if (this.isDragging) this.dragEnd = getXandY(e);
            this.highlightSelection();
        });

        this.ctx.canvas.addEventListener("mouseup", () => {
            this.isDragging = false;

            this.checkSelection();
            
            // Reset all apple highlights BEFORE checking selection
            for (let entity of this.entities) {
                if (entity instanceof Apple) {
                    entity.isHighlighted = false;
                }
            }
        
        });

        // Restart Game on 'R'
        this.ctx.canvas.addEventListener("keydown", event => {
            if (event.key === "r" && this.gameOver) {
                this.restart();
            }
        });
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    draw() {
        if(this.isGameStarted) {
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

            for (let i = this.entities.length - 1; i >= 0; i--) {
                this.entities[i].draw(this.ctx, this);
            }

            //Dragging Selection Box
            if (this.isDragging && this.dragStart && this.dragEnd) {
                const x = Math.min(this.dragStart.x, this.dragEnd.x);
                const y = Math.min(this.dragStart.y, this.dragEnd.y);
                const width = Math.abs(this.dragStart.x - this.dragEnd.x);
                const height = Math.abs(this.dragStart.y - this.dragEnd.y);
                
                this.ctx.save();
                this.ctx.strokeStyle = "green";
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x, y, width, height);
                this.ctx.restore();
            }
        

            //Timer & Score
            this.ctx.fillStyle = "white";
            this.ctx.font = "20px Arial";
            this.ctx.fillText(`Time Left: ${Math.ceil(this.timeLeft)}s`, 80, 30);
            this.ctx.fillText(`Score: ${this.score}`, 950, 30);

            //Game Over Screen
            if (this.gameOver) {
                this.ctx.fillStyle = "rgba(155, 36, 36, 0.43)";
                this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

                this.ctx.fillStyle = "red";
                this.ctx.font = "40px Arial";
                this.ctx.fillText("Times Up!", this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);

                this.ctx.fillStyle = "white";
                this.ctx.font = "20px Arial";
                this.ctx.fillText(`Score: ${this.score}`, this.ctx.canvas.width / 2, this.ctx.canvas.height / 2 + 40);
                this.ctx.fillText("Press R to Restart", this.ctx.canvas.width / 2, this.ctx.canvas.height / 2 + 80);
                this.ctx.fillText("According to data..", this.ctx.canvas.width / 2, this.ctx.canvas.height / 2 + 200);
                this.ctx.fillText("Score < 50 is Bad", this.ctx.canvas.width / 2, this.ctx.canvas.height / 2 + 250);
                this.ctx.fillText("Score > 70 is Average", this.ctx.canvas.width / 2, this.ctx.canvas.height / 2 + 280);
                this.ctx.fillText("Score > 90 is God", this.ctx.canvas.width / 2, this.ctx.canvas.height / 2 + 310);

            }
        
        } else {
            this.ctx.fillStyle = "rgba(20, 20, 20, 0.33)";
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.ctx.fillStyle = "white";
            this.ctx.font = "40px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText("Make 10", this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);
            this.ctx.font = "20px Arial";
            this.ctx.fillText("Click Anywhere to Start", this.ctx.canvas.width / 2, this.ctx.canvas.height / 2 + 50); 
        }
        
    
    }

    update() {
        if (this.isGameStarted) {
            this.timeLeft -= this.clockTick;

            if (this.timeLeft <= 0) {
                this.timeLeft = 0;
                this.endGame();
            }

            for (let entity of this.entities) {
                if (!entity.removeFromWorld) {
                    entity.update();
                }
            }

            this.entities = this.entities.filter(entity => !entity.removeFromWorld);
        }
    }

    loop() {
        this.clockTick = this.timer.tick();

        if (!this.gameOver){
            this.update();
            this.draw();
        }
    }

    highlightSelection() {
        if (!this.dragStart || !this.dragEnd) return;

        const xMin = Math.min(this.dragStart.x, this.dragEnd.x);
        const yMin = Math.min(this.dragStart.y, this.dragEnd.y);
        const xMax = Math.max(this.dragStart.x, this.dragEnd.x);
        const yMax = Math.max(this.dragStart.y, this.dragEnd.y);

        for (let entity of this.entities) {
            if (entity instanceof Apple) {
                // Check if apple is inside the selection box
                let insideBox = (
                    entity.x >= xMin && entity.x <= xMax &&
                    entity.y >= yMin && entity.y <= yMax
                );
    
                entity.isHighlighted = insideBox && this.isDragging;
            }
        }

    }

    
    checkSelection() {
        if (!this.dragStart || !this.dragEnd) return;

        const xMin = Math.min(this.dragStart.x, this.dragEnd.x);
        const yMin = Math.min(this.dragStart.y, this.dragEnd.y);
        const xMax = Math.max(this.dragStart.x, this.dragEnd.x);
        const yMax = Math.max(this.dragStart.y, this.dragEnd.y);

        let selectedApples = [];
        let sum = 0;

        for (let entity of this.entities) {
            if (
                entity instanceof Apple &&
                entity.x >= xMin && entity.x <= xMax &&
                entity.y >= yMin && entity.y <= yMax
            ) {
                selectedApples.push(entity);
                sum += entity.value;
            }
        }

        if (sum === 10) {
            this.score += selectedApples.length;
            selectedApples.forEach(apple => apple.removeFromWorld = true);
        }
    }

    addScore(points) {
        this.score += points;
    }

    endGame() {
        this.gameOver = true;
    }

    restart() {
        this.entities = [];
        this.timeLeft = 120;
        this.score = 0;
        this.gameOver = false;
        Apple.spawnApples(this);
        this.timer.lastTimestamp = Date.now();
    }
}
