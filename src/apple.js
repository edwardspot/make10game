class Apple {
    constructor(game, x, y, value) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.value = value;
        this.isDragging = false;
        this.isHighlighted = false;
    }

    static spawnApples(game) {
        const rows = 10; // apples per row
        const cols = 17; // apples per column    
        const spacing = 50; // space between apples
        const startX = 110; // starting X position
        const startY = 150; // starting Y position

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let x = startX + col * spacing;
                let y = startY + row * spacing;
                let value = randomInt(9) + 1;
                game.addEntity(new Apple(game, x, y, value));
            }
        }
    }

    update() {
        if (this.isDragging && this.game.mouse) {
            this.x = this.game.mouse.x;
            this.y = this.game.mouse.y;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.isHighlighted? "green" : "grey";
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "white";
        ctx.font = "21px Roman";
        ctx.textAlign = "center";
        ctx.fillText(this.value, this.x, this.y + 7);
    }

}