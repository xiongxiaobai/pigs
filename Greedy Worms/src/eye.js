/**
 * The black and white parts of a snake eye, with constraints   有约束的蛇眼的黑白部分
 * @param  {Phaser.Game} game  game object
 * @param  {Phaser.Sprite} head  snake head sprite   头蛇妖
 * @param  {Number} scale scale of the new eye   新眼标度尺
 */
Eye = function(game, head, scale) {
    this.game = game;
    this.head = head;
    this.scale = scale;
    this.eyeGroup = this.game.add.group();
    this.collisionGroup = this.game.physics.p2.createCollisionGroup();
    this.debug = false;

    //constraints that will hold the circles in place    约束圈子的约束
    //the lock will hold the white circle on the head, and the distance    锁会保持头部上的白色圆圈和距离。
    //constraint (dist) will keep the black circle within the white one     约束（DIST）将保持白圈内的黑圈。
    this.lock = null;
    this.dist = null;

    //initialize the circle sprites  初始化圆精灵
    this.whiteCircle = this.game.add.sprite(
        this.head.body.x, this.head.body.y, "eye-white"
    );
    this.whiteCircle = this.initCircle(this.whiteCircle);

    this.blackCircle = this.game.add.sprite(
        this.whiteCircle.body.x, this.whiteCircle.body.y, "eye-black"
    );
    this.blackCircle = this.initCircle(this.blackCircle);
    this.blackCircle.body.mass = 0.01;



}

Eye.prototype = {
    /**
     * Initialize a circle, whether it is the black or white one   初始化一个圆圈，无论是黑色还是白色
     * @param  {Phaser.Sprite} circle sprite to initialize   循环精灵初始化
     * @return {Phaser.Sprite}        initialized circle     初始化圆
     */
    initCircle: function(circle) {
        circle.scale.setTo(this.scale);
        this.game.physics.p2.enable(circle, this.debug);
        circle.body.clearShapes();
        //give the circle a circular physics body   给圆一个圆形的物理体
        circle.body.addCircle(circle.width*0.5);
        circle.body.setCollisionGroup(this.collisionGroup);
        circle.body.collides([]);
        this.eyeGroup.add(circle);
        return circle;
    },
    /**
     * Ensure that the circles of the eye are constrained to the head    确保眼睛的圆受到头部的约束
     * @param  {Array} offset Array in the form [x,y] of offset from the snake head   从蛇形头偏移的形式[x，y]中的偏移数组
     */
    updateConstraints: function(offset) {
        //change where the lock constraint of the white circle    改变白环的锁约束
        //is if it already exists   如果它已经存在
        if (this.lock) {
            this.lock.localOffsetB = [
                this.game.physics.p2.pxmi(offset[0]),
                this.game.physics.p2.pxmi(Math.abs(offset[1]))
            ];
        }
        //create a lock constraint if it doesn't already exist    如果不存在锁约束，则创建
        else {
            this.lock = this.game.physics.p2.createLockConstraint(
                this.whiteCircle.body, this.head.body, offset, 0
            );
        }

        //change the distance of the distance constraint for
        //the black circle if it exists already   如果黑色圆圈已经存在，则改变距离约束的距离
        if (this.dist) {
            this.dist.distance = this.game.physics.p2.pxm(this.whiteCircle.width*0.25);
        }
        //create a distance constraint if it doesn't exist already   创建一个距离约束，如果它不存在
        else {
            this.dist = this.game.physics.p2.createDistanceConstraint(
                this.blackCircle.body, this.whiteCircle.body, this.whiteCircle.width*0.25
            );
        }
    },
    /**
     * Set the eye scale   定眼量表
     * @param  {Number} scale new scale  新比例尺
     */
    setScale: function(scale) {
        this.scale = scale;
        for (var i = 0 ; i < this.eyeGroup.children.length ; i++) {
            var circle = this.eyeGroup.children[i];
            circle.scale.setTo(this.scale);
            //change the radii of the circle bodies using pure p2 physics   用纯P2物理学改变圆体的半径
            circle.body.data.shapes[0].radius = this.game.physics.p2.pxm(circle.width*0.5);
        }

    },
    /**
     * Call from the update loop   从更新循环调用
     */
    update: function() {
        var mousePosX = this.game.input.activePointer.worldX;
        var mousePosY = this.game.input.activePointer.worldY;
        var headX = this.head.body.x;
        var headY = this.head.body.y;
        var angle = Math.atan2(mousePosY-headY, mousePosX-headX);
        var force = 300;
        //move the black circle of the eye towards the mouse  将黑眼圈移向鼠标
        this.blackCircle.body.moveRight(force*Math.cos(angle));
        this.blackCircle.body.moveDown(force*Math.sin(angle));
    },
    /**
     * Destroy this eye    销毁这只眼睛
     */
    destroy: function() {
        this.whiteCircle.destroy();
        this.blackCircle.destroy();
        this.game.physics.p2.removeConstraint(this.lock);
        this.game.physics.p2.removeConstraint(this.dist);
    }
};
