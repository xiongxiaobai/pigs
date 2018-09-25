/**
 * Food that snakes eat - it is pulled towards the center of a snake head after
 * it is first touched   蛇吃的食物——在第一次碰到蛇后，它被拉向蛇头的中心。
 * @param  {Phaser.Game} game game object
 * @param  {Number} x    coordinate
 * @param  {Number} y    coordinate
 */
Food = function(game, x, y) {
    this.game = game;
    this.debug = false;
    this.sprite = this.game.add.sprite(x, y, 'food');
    this.sprite.tint = 0xff0000;

    this.game.physics.p2.enable(this.sprite, this.debug);
    this.sprite.body.clearShapes();
    this.sprite.body.addCircle(this.sprite.width * 0.5);
    //set callback for when something hits the food   当食物碰到食物时设置回调
    this.sprite.body.onBeginContact.add(this.onBeginContact, this);

    this.sprite.food = this;

    this.head = null;
    this.constraint = null;
}

Food.prototype = {
    onBeginContact: function(phaserBody, p2Body) {
        if (phaserBody && phaserBody.sprite.name == "head" && this.constraint === null) {
            this.sprite.body.collides([]);
            //Create constraint between the food and the snake head that
            //it collided with. The food is then brought to the center of
            //the head sprite   在食物和蛇头之间产生约束。然后把食物带到头部雪碧的中心。
            this.constraint = this.game.physics.p2.createRevoluteConstraint(
                this.sprite.body, [0,0], phaserBody, [0,0]
            );
            this.head = phaserBody.sprite;
            this.head.snake.food.push(this);
        }
    },
    /**
     * Call from main update loop  从主更新循环调用
     */
    update: function() {
        //once the food reaches the center of the snake head, destroy it and
        //increment the size of the snake    一旦食物到达蛇头的中心，破坏它并增加蛇的大小。
        if (this.head && Math.round(this.head.body.x) == Math.round(this.sprite.body.x) &&
        Math.round(this.head.body.y) == Math.round(this.sprite.body.y)) {
            this.head.snake.incrementSize();
            this.destroy();
        }
    },
    /**
     * Destroy this food and its constraints  破坏这种食物及其限制
     */
    destroy: function() {
        if (this.head) {
            this.game.physics.p2.removeConstraint(this.constraint);
            this.sprite.destroy();
            this.head.snake.food.splice(this.head.snake.food.indexOf(this), 1);
            this.head = null;
        }
    }
};
