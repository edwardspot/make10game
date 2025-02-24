const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;
    document.body.style.backgroundColor = "black";

	canvas.style.display = "black"; 
    canvas.style.margin = "100px auto";

	gameEngine.init(ctx);
	new StartScreen(gameEngine);
	
	gameEngine.start();
});
