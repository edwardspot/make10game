class Apple {
    constructor(game, x, y, value) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.value = value;
        this.isDragging = false;
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
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.value, this.x, this.y + 7);
    }

}