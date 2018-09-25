/**
 * Bot extension of the core snake    机器人核心
 * @param  {Phaser.Game} game      game object
 * @param  {String} spriteKey Phaser sprite key
 * @param  {Number} x         coordinate
 * @param  {Number} y         coordinate
 */
BotSnake = function(game, spriteKey, x, y) {
    Snake.call(this, game, spriteKey, x, y);
    this.trend = 1;
}

BotSnake.prototype = Object.create(Snake.prototype);
BotSnake.prototype.constructor = BotSnake;

/**
 * Add functionality to the original snake update method so that this bot snake
 * can turn randomly   添加功能到原始蛇更新方法，使这个机器人蛇可以随机转向
 */
BotSnake.prototype.tempUpdate = BotSnake.prototype.update;
BotSnake.prototype.update = function() {
    this.head.body.setZeroRotation();

    //ensure that the bot keeps rotating in one direction for a
    //substantial amount of time before switching directions    在切换方向之前确保BOT在一个方向上保持一个相当大的时间旋转。
    if (Util.randomInt(1,20) == 1) {
        this.trend *= -1;
    }
    this.head.body.rotateRight(this.trend * this.rotationSpeed);
    this.tempUpdate();
}
