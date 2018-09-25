/**
 * Phaser snake  移相器蛇
 * @param  {Phaser.Game} game      game object
 * @param  {String} spriteKey Phaser sprite key
 * @param  {Number} x         coordinate
 * @param  {Number} y         coordinate
 */
Snake = function(game, spriteKey, x, y) {
    this.game = game;
    //create an array of snakes in the game object and add this snake  在游戏对象中创建一个蛇数组并添加这个蛇
    if (!this.game.snakes) {
        this.game.snakes = [];
    }
    this.game.snakes.push(this);
    this.debug = false;
    this.snakeLength = 0;
    this.spriteKey = spriteKey;

    //various quantities that can be changed  可改变的各种量
    this.scale = 0.6;
    this.fastSpeed = 200;
    this.slowSpeed = 130;
    this.speed = this.slowSpeed;
    this.rotationSpeed = 40;

    //initialize groups and arrays   初始化组和数组
    this.collisionGroup = this.game.physics.p2.createCollisionGroup();
    this.sections = [];
    //the head path is an array of points that the head of the snake has
    //traveled through   头部路径是蛇头穿过的点的数组
    this.headPath = [];
    this.food = [];

    this.preferredDistance = 17 * this.scale;
    this.queuedSections = 0;

    //initialize the shadow  初始化阴影
    this.shadow = new Shadow(this.game, this.sections, this.scale);
    this.sectionGroup = this.game.add.group();
    //add the head of the snake   加上蛇的头
    this.head = this.addSectionAtPosition(x,y);
    this.head.name = "head";
    this.head.snake = this;

    this.lastHeadPosition = new Phaser.Point(this.head.body.x, this.head.body.y);
    //add 30 sections behind the head   头后加30节
    this.initSections(30);

    //initialize the eyes    初始化眼睛
    this.eyes = new EyePair(this.game, this.head, this.scale);

    //the edge is the front body that can collide with other snakes
    //it is locked to the head of this snake   边缘是可以与其他蛇碰撞的前身，它被锁定在这条蛇的头部。
    this.edgeOffset = 4;
    this.edge = this.game.add.sprite(x, y - this.edgeOffset, this.spriteKey);
    this.edge.name = "edge";
    this.edge.alpha = 0;
    this.game.physics.p2.enable(this.edge, this.debug);
    this.edge.body.setCircle(this.edgeOffset);

    //constrain edge to the front of the head  约束头部的前部
    this.edgeLock = this.game.physics.p2.createLockConstraint(
        this.edge.body, this.head.body, [0, -this.head.width*0.5-this.edgeOffset]
    );

    this.edge.body.onBeginContact.add(this.edgeContact, this);

    this.onDestroyedCallbacks = [];
    this.onDestroyedContexts = [];
}

Snake.prototype = {
    /**
     * Give the snake starting segments   给蛇启动段
     * @param  {Number} num number of snake sections to create   创建的蛇的数量
     */
    initSections: function(num) {
        //create a certain number of sections behind the head
        //only use this once   在头部后面创建一定数量的部分只使用这一次
        for (var i = 1 ; i <= num ; i++) {
            var x = this.head.body.x;
            var y = this.head.body.y + i * this.preferredDistance;
            this.addSectionAtPosition(x, y);
            //add a point to the head path so that the section stays there  添加一个指向头部路径的点，以便该部分保持在那里。
            this.headPath.push(new Phaser.Point(x,y));
        }

    },
    /**
     * Add a section to the snake at a given position  在给定位置向蛇添加截面
     * @param  {Number} x coordinate
     * @param  {Number} y coordinate
     * @return {Phaser.Sprite}   new section  新剖面
     */
    addSectionAtPosition: function(x, y) {
        //initialize a new section  初始化一个新的部分
        var sec = this.game.add.sprite(x, y, this.spriteKey);
        this.game.physics.p2.enable(sec, this.debug);
        sec.body.setCollisionGroup(this.collisionGroup);
        sec.body.collides([]);
        sec.body.kinematic = true;

        this.snakeLength++;
        this.sectionGroup.add(sec);
        sec.sendToBack();
        sec.scale.setTo(this.scale);

        this.sections.push(sec);

        this.shadow.add(x,y);
        //add a circle body to this section  在这个部分添加一个圆。
        sec.body.clearShapes();
        sec.body.addCircle(sec.width*0.5);

        return sec;
    },
    /**
     * Add to the queue of new sections  添加到新区段的队列中
     * @param  {Integer} amount Number of sections to add to queue  要添加到队列中的节的数量
     */
    addSectionsAfterLast: function(amount) {
        this.queuedSections += amount;
    },
    /**
     * Call from the main update loop  从主更新循环调用
     */
    update: function() {
        var speed = this.speed;
        this.head.body.moveForward(speed);

        //remove the last element of an array that contains points which
        //the head traveled through
        //then move this point to the front of the array and change its value
        //to be where the head is located  移除数组的最后一个元素，该元素包含头部经过的点，然后将该点移动到数组的前面，并将其值更改为头部所在的位置
        var point = this.headPath.pop();
        point.setTo(this.head.body.x, this.head.body.y);
        this.headPath.unshift(point);

        //place each section of the snake on the path of the snake head,
        //a certain distance from the section before it  将蛇的每一部分放在蛇头的路径上，与它之前的部分有一定距离。
        var index = 0;
        var lastIndex = null;
        for (var i = 0 ; i < this.snakeLength ; i++) {

            this.sections[i].body.x = this.headPath[index].x;
            this.sections[i].body.y = this.headPath[index].y;

            //hide sections if they are at the same position  隐藏区段如果它们位于同一位置
            if (lastIndex && index == lastIndex) {
                this.sections[i].alpha = 0;
            }
            else {
                this.sections[i].alpha = 1;
            }

            lastIndex = index;
            //this finds the index in the head path array that the next point
            //should be at 这就找到了下一个点应该在头路径数组中的索引。
            index = this.findNextPointIndex(index);
        }

        //continuously adjust the size of the head path array so that we
        //keep only an array of points that we need   连续调整磁头路径数组的大小，以便只保留需要的点数组。
        if (index >= this.headPath.length - 1) {
            var lastPos = this.headPath[this.headPath.length - 1];
            this.headPath.push(new Phaser.Point(lastPos.x, lastPos.y));
        }
        else {
            this.headPath.pop();
        }

        //this calls onCycleComplete every time a cycle is completed
        //a cycle is the time it takes the second section of a snake to reach
        //where the head of the snake was at the end of the last cycle  每当一个循环完成时，这个调用onCycleComplete就是蛇的第二部分到达蛇头在最后一个循环结束时所处的位置的时间。
        var i = 0;
        var found = false;
        while (this.headPath[i].x != this.sections[1].body.x &&
        this.headPath[i].y != this.sections[1].body.y) {
            if (this.headPath[i].x == this.lastHeadPosition.x &&
            this.headPath[i].y == this.lastHeadPosition.y) {
                found = true;
                break;
            }
            i++;
        }
        if (!found) {
            this.lastHeadPosition = new Phaser.Point(this.head.body.x, this.head.body.y);
            this.onCycleComplete();
        }

        //update the eyes and the shadow below the snake  更新眼睛和阴影下面的蛇
        this.eyes.update();
        this.shadow.update();
    },
    /**
     * Find in the headPath array which point the next section of the snake
     * should be placed at, based on the distance between points  在头路径数组中查找应该放置的蛇的下一个部分，基于点之间的距离。
     * @param  {Integer} currentIndex Index of the previous snake section 前蛇形截面的当前索引
     * @return {Integer}              new index  新指标
     */
    findNextPointIndex: function(currentIndex) {
        var pt = this.headPath[currentIndex];
        //we are trying to find a point at approximately this distance away
        //from the point before it, where the distance is the total length of
        //all the lines connecting the two points   我们试图找到一个点，它距离前面的点大约是这个距离，这个距离是连接两个点的所有线的总长度。
        var prefDist = this.preferredDistance;
        var len = 0;
        var dif = len - prefDist;
        var i = currentIndex;
        var prevDif = null;
        //this loop sums the distances between points on the path of the head
        //starting from the given index of the function and continues until
        //this sum nears the preferred distance between two snake sections  这个循环求和从函数的给定索引开始的头部路径上的点之间的距离，并且继续直到这个和接近两个蛇形部分之间的优选距离。
        while (i+1 < this.headPath.length && (dif === null || dif < 0)) {
            //get distance between next two points   得到下两点之间的距离
            var dist = Util.distanceFormula(
                this.headPath[i].x, this.headPath[i].y,
                this.headPath[i+1].x, this.headPath[i+1].y
            );
            len += dist;
            prevDif = dif;
            //we are trying to get the difference between the current sum and
            //the preferred distance close to zero  我们试图得到当前总和和接近零的优选距离之间的差异。
            dif = len - prefDist;
            i++;
        }

        //choose the index that makes the difference closer to zero
        //once the loop is complete  在循环完成后，选择使差值接近零的索引。
        if (prevDif === null || Math.abs(prevDif) > Math.abs(dif)) {
            return i;
        }
        else {
            return i-1;
        }
    },
    /**
     * Called each time the snake's second section reaches where the
     * first section was at the last call (completed a single cycle)  Called each time the snake's second section reaches where the  first section was at the last call (completed a single cycle)
     */
    onCycleComplete: function() {
        if (this.queuedSections > 0) {
            var lastSec = this.sections[this.sections.length - 1];
            this.addSectionAtPosition(lastSec.body.x, lastSec.body.y);
            this.queuedSections--;
        }
    },
    /**
     * Set snake scale 设置蛇量表
     * @param  {Number} scale Scale
     */
    setScale: function(scale) {
        this.scale = scale;
        this.preferredDistance = 17 * this.scale;

        //update edge lock location with p2 physics 用P2物理学更新边缘锁定位置
        this.edgeLock.localOffsetB = [
            0, this.game.physics.p2.pxmi(this.head.width*0.5+this.edgeOffset)
        ];

        //scale sections and their bodies 鳞片切片及其体
        for (var i = 0 ; i < this.sections.length ; i++) {
            var sec = this.sections[i];
            sec.scale.setTo(this.scale);
            sec.body.data.shapes[0].radius = this.game.physics.p2.pxm(sec.width*0.5);
        }

        //scale eyes and shadows 鳞目影
        this.eyes.setScale(scale);
        this.shadow.setScale(scale);
    },
    /**
     * Increment length and scale  增量长度和尺度
     */ 
    incrementSize: function() {
        this.addSectionsAfterLast(1);
        this.setScale(this.scale * 1.01);
    },
    /**
     * Destroy the snake  销毁蛇
     */
    destroy: function() {
        this.game.snakes.splice(this.game.snakes.indexOf(this), 1);
        //remove constraints  移除约束
        this.game.physics.p2.removeConstraint(this.edgeLock);
        this.edge.destroy();
        //destroy food that is constrained to the snake head  销毁被蛇头约束的食物
        for (var i = this.food.length - 1 ; i >= 0 ; i--) {
            this.food[i].destroy();
        }
        //destroy everything else  摧毁一切
        this.sections.forEach(function(sec, index) {
            sec.destroy();
        });
        this.eyes.destroy();
        this.shadow.destroy();

        //call this snake's destruction callbacks  调用这个蛇的破坏回调
        for (var i = 0 ; i < this.onDestroyedCallbacks.length ; i++) {
            if (typeof this.onDestroyedCallbacks[i] == "function") {
                this.onDestroyedCallbacks[i].apply(
                    this.onDestroyedContexts[i], [this]);
            }
        }
    },
    /**
     * Called when the front of the snake (the edge) hits something  当蛇的前面（边缘）碰到什么东西时
     * @param  {Phaser.Physics.P2.Body} phaserBody body it hit  相撞体
     */
    edgeContact: function(phaserBody) {
        //if the edge hits another snake's section, destroy this snake  如果边缘碰到另一条蛇的部分，破坏这条蛇。
        if (phaserBody && this.sections.indexOf(phaserBody.sprite) == -1) {
            this.destroy();
        }
        //if the edge hits this snake's own section, a simple solution to avoid
        //glitches is to move the edge to the center of the head, where it
        //will then move back to the front because of the lock constraint 如果边缘碰到这条蛇自己的部分，避免出现故障的简单解决方案是将边缘移动到头部的中心，然后由于锁的约束，它会移动回到前面。
        else if (phaserBody) {
            this.edge.body.x = this.head.body.x;
            this.edge.body.y = this.head.body.y;
        }
    },
    /**
     * Add callback for when snake is destroyed  当蛇被破坏时添加回调
     * @param  {Function} callback Callback function   回调回调函数
     * @param  {Object}   context  context of callback  回调的上下文上下文
     */
    addDestroyedCallback: function(callback, context) {
        this.onDestroyedCallbacks.push(callback);
        this.onDestroyedContexts.push(context);
    }
};
