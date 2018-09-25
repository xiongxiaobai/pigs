/**
 * Player of the core snake for controls   控制核心蛇的玩家
 * @param  {Phaser.Game} game      game object
 * @param  {String} spriteKey Phaser sprite key
 * @param  {Number} x         coordinate
 * @param  {Number} y         coordinate
 */
PlayerSnake = function(game, spriteKey, x, y) {
    Snake.call(this, game, spriteKey, x, y);
    this.cursors = game.input.keyboard.createCursorKeys();

    //handle the space key so that the player's snake can speed up   处理空间键，使玩家的蛇可以加速
    var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    var self = this;
    spaceKey.onDown.add(this.spaceKeyDown, this);
    spaceKey.onUp.add(this.spaceKeyUp, this);
    this.addDestroyedCallback(function() {
        spaceKey.onDown.remove(this.spaceKeyDown, this);
        spaceKey.onUp.remove(this.spaceKeyUp, this);
    }, this);
}

PlayerSnake.prototype = Object.create(Snake.prototype);
PlayerSnake.prototype.constructor = PlayerSnake;

//make this snake light up and speed up when the space key is down   当空间键下降时，使这条蛇发光并加速。
PlayerSnake.prototype.spaceKeyDown = function() {
    this.speed = this.fastSpeed;
    this.shadow.isLightingUp = true;
}
//make the snake slow down when the space key is up again  当空间键再次上升时，使蛇慢下来。
PlayerSnake.prototype.spaceKeyUp = function() {
    this.speed = this.slowSpeed;
    this.shadow.isLightingUp = false;
}

/**
 * Add functionality to the original snake update method so that the player
 * can control where this snake goes    添加原始蛇更新方法的功能，让玩家可以控制蛇的去向。
 */
PlayerSnake.prototype.tempUpdate = PlayerSnake.prototype.update;
PlayerSnake.prototype.update = function() {
    //find the angle that the head needs to rotate
    //through in order to face the mouse   寻找头部需要旋转的角度，以面对鼠标
    var mousePosX = this.game.input.activePointer.worldX;
    var mousePosY = this.game.input.activePointer.worldY;
    var headX = this.head.body.x;
    var headY = this.head.body.y;
    var angle = (180*Math.atan2(mousePosX-headX,mousePosY-headY)/Math.PI);
    if (angle > 0) {
        angle = 180-angle;
    }
    else {
        angle = -180-angle;
    }
    var dif = this.head.body.angle - angle;
    this.head.body.setZeroRotation();
    //allow arrow keys to be used   允许使用箭头键
    if (this.cursors.left.isDown) {
        this.head.body.rotateLeft(this.rotationSpeed);
    }
    else if (this.cursors.right.isDown) {
        this.head.body.rotateRight(this.rotationSpeed);
    }
    //decide whether rotating left or right will angle the head towards
    //the mouse faster, if arrow keys are not used     如果不使用箭头键，决定是否向左或向右旋转将头部朝向鼠标更快。
    else if (dif < 0 && dif > -180 || dif > 180) {
        this.head.body.rotateRight(this.rotationSpeed);
    }
    else if (dif > 0 && dif < 180 || dif < -180) {
        this.head.body.rotateLeft(this.rotationSpeed);
    }

    //call the original snake update method  调用原始的蛇更新方法
    this.tempUpdate();
}
