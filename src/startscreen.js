class StartScreen {
    constructor(game) {
        this.game = game;
        this.canvas = game.ctx.canvas;
        this.handleClick = this.handleClick.bind(this);
        this.canvas.addEventListener("click", this.handleClick);
    }

    handleClick() {
        this.game.isGameStarted = true;
        Apple.spawnApples(this.game);
        this.canvas.removeEventListener("click", this.handleClick); // Remove event after start
    }

    draw(ctx) {
    }
}