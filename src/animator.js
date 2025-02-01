class Animator {
    constructor(spritesheet, xStart, yStart, width, height, frameCount, frameDuration, reverse, loop) {
        Object.assign(this, { spritesheet, xStart, yStart, height, width, frameCount, frameDuration, reverse, loop });

        this.elapsedTime = 0;
        this.totalTime = this.frameCount * this.frameDuration;

    };

    drawFrame(tick, ctx, x, y, scale) {
        this.elapsedTime += tick;

        if (this.isDone()) {    
            if (this.loop) {
                this.elapsedTime = 0;
            } else {
                this.elapsedTime = this.elapsedTime - tick;
            }
        }

        let frame = this.reverse ?  this.frameCount - this.currentFrame() - 1 : this.currentFrame();
               
        ctx.drawImage(this.spritesheet,
            this.xStart + frame * this.width, 
            this.yStart,
            this.width, this.height,
            x, y,
            this.width * scale,
            this.height * scale);
    };

    currentFrame() {
        return Math.floor(this.elapsedTime / this.frameDuration);
    };

    isDone() {
        return (this.elapsedTime >= this.totalTime);
    };
};