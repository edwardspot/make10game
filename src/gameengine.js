// This game shell was happily modified from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

class GameEngine {
    constructor(options) {
        // What you will use to draw
        // Documentation: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
        this.ctx = null;

        // Everything that will be updated and drawn each frame
        this.entities = [];

        // Information on the input
        this.click = null;
        this.mouse = null;
        this.wheel = null;
        this.keys = {};

        // Options and the Details
        this.options = options || {
            debugging: false,
        };
    };

    init(ctx) {
        this.ctx = ctx;
        this.startInput();
        this.timer = new Timer();
    };

    start() {
        this.running = true;
        const gameLoop = () => {
            this.loop();
            requestAnimFrame(gameLoop, this.ctx.canvas);
        };
        gameLoop();
    };

    startInput() {
        
        const getXandY = e => ({
            x: e.clientX - this.ctx.canvas.getBoundingClientRect().left,
            y: e.clientY - this.ctx.canvas.getBoundingClientRect().top
        });
        
        this.ctx.canvas.addEventListener("mousemove", e => {
            if (this.options.debugging) {
                console.log("MOUSE_MOVE", getXandY(e));
            }
            this.mouse = getXandY(e);
        });

        this.ctx.canvas.addEventListener("click", e => {
            if (this.options.debugging) {
                console.log("CLICK", getXandY(e));
            }
            this.click = getXandY(e);
        });

        this.ctx.canvas.addEventListener("wheel", e => {
            if (this.options.debugging) {
                console.log("WHEEL", getXandY(e), e.wheelDelta);
            }
            e.preventDefault(); // Prevent Scrolling
            this.wheel = e;
        });

        this.ctx.canvas.addEventListener("contextmenu", e => {
            if (this.options.debugging) {
                console.log("RIGHT_CLICK", getXandY(e));
            }
            e.preventDefault(); // Prevent Context Menu
            this.rightclick = getXandY(e);
        });

        this.ctx.canvas.addEventListener("keydown", event => this.keys[event.key] = true);
        this.ctx.canvas.addEventListener("keyup", event => this.keys[event.key] = false);
        
        //Dragging 
        this.isDragging = false;
        this.dragStart = null;
        this.dragEnd = null;

        this.ctx.canvas.addEventListener("mousedown", e => {
        this.isDragging = true;
        this.dragStart = getXandY(e);
        this.dragEnd = this.dragStart;
        });

        this.ctx.canvas.addEventListener("mousemove", e => {
            if (this.isDragging) {
                this.dragEnd = getXandY(e);
            }
        });

        this.ctx.canvas.addEventListener("mouseup", () => {
        this.isDragging = false;
        this.checkSelection();
        });

        
    };

    addEntity(entity) {
        this.entities.push(entity);
    };

    draw() {
        // Clear the whole canvas with transparent color (rgba(0, 0, 0, 0))
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Draw latest things first
        for (let i = this.entities.length - 1; i >= 0; i--) {
            this.entities[i].draw(this.ctx, this);
        }

        //Create a box when dragging the mouse
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
    };

    update() {
        let entitiesCount = this.entities.length;

        for (let i = 0; i < entitiesCount; i++) {
            let entity = this.entities[i];

            if (!entity.removeFromWorld) {
                entity.update();
            }
        }

        for (let i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
            }
        }
    };

    loop() {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
    };

    //function to check if apples in the dragged box == 10.
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
            selectedApples.forEach(apple => apple.removeFromWorld = true);
        }
    }

};

// KV Le was here :)