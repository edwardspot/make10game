const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();



ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;

	const rows = 10; //apples per row 
    const cols = 17; //apples per column    
    const spacing = 50; //Space between apples
    const startX = 110; // Starting X position
    const startY = 110; // Starting Y position

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            let x = startX + col * spacing;
            let y = startY + row * spacing;
            let value = randomInt(9) + 1;
            gameEngine.addEntity(new Apple(gameEngine, x, y, value));
        }
    }
	

	gameEngine.init(ctx);

	gameEngine.start();
});
