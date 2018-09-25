/**
 * Shadow below snake    蛇下阴影
 * @param  {Phaser.Game} game     game object
 * @param  {Array} sections Array of snake section sprites   蛇形精灵截面数组
 * @param  {Number} scale    scale of the shadow     阴影标度标度
 */
Shadow = function(game, sections, scale) {
    this.game = game;
    this.sections = sections;
    this.scale = scale;
    this.shadowGroup = this.game.add.group();
    this.shadows = [];
    this.isLightingUp = false;

    this.lightStep = 0;
    this.maxLightStep = 3;

    this.lightUpdateCount = 0;
    this.updateLights = 3;

    //various tints that the shadow could have
    //since the image is white   由于图像是白色的，阴影可能会有不同的色调。
    this.darkTint = 0xaaaaaa;
    this.lightTintBright = 0xaa3333;
    this.lightTintDim = 0xdd3333;
}

Shadow.prototype = {
    /**
     * Add a new shadow at a position    在一个位置添加新阴影
     * @param  {Number} x coordinate
     * @param  {Number} y coordinate
     */
    add: function(x, y) {
        var shadow = this.game.add.sprite(x, y, "shadow");
        shadow.scale.setTo(this.scale);
        shadow.anchor.set(0.5);
        this.shadowGroup.add(shadow);
        this.shadows.push(shadow);
    },
    /**
     * Call from the snake update loop  从蛇更新循环调用
     */
    update: function() {
        var lastPos = null;
        for (var i = 0 ; i < this.sections.length ; i++) {
            var shadow = this.shadows[i];
            var pos = {
                x: this.sections[i].body.x,
                y: this.sections[i].body.y
            };

            //hide the shadow if the previous shadow is in the same position   如果先前阴影位于同一位置，则隐藏阴影。
            if (lastPos && pos.x == lastPos.x && pos.y == lastPos.y) {
                shadow.alpha = 0;
                shadow.naturalAlpha = 0;
            }
            else {
                shadow.alpha = 1;
                shadow.naturalAlpha = 1;
            }
            //place each shadow below a snake section   把每个阴影放在蛇的下面
            shadow.position.x = pos.x;
            shadow.position.y = pos.y;

            lastPos = pos;
        }

        //light up shadow with bright tints   亮光亮影
        if (this.isLightingUp) {
            this.lightUpdateCount++;
            if (this.lightUpdateCount >= this.updateLights) {
                this.lightUp();
            }
        }
        //make shadow dark   使阴影变暗
        else {
            for (var i = 0 ; i < this.shadows.length ; i++) {
                var shadow = this.shadows[i];
                shadow.tint = this.darkTint;
            }
        }
    },
    /**
     * Set scale of the shadow  设置阴影的比例
     * @param  {Number} scale scale of shadow  阴影尺度
     */
    setScale: function(scale) {
        this.scale = scale;
        for (var i = 0 ; i < this.shadows.length ; i++) {
            this.shadows[i].scale.setTo(scale);
        }
    },
    /**
     * Light up the shadow from a gray to a bright color   照亮阴影从灰色到明亮的颜色
     */
    lightUp: function() {
        this.lightUpdateCount = 0;
        for (var i = 0 ; i < this.shadows.length ; i++) {
            var shadow = this.shadows[i];
            if (shadow.naturalAlpha > 0) {
                //create an alternating effect so shadow is not uniform   产生交替效果，阴影不均匀
                if ((i - this.lightStep) % this.maxLightStep === 0 ) {
                    shadow.tint = this.lightTintBright;
                }
                else {
                    shadow.tint = this.lightTintDim;
                }
            }
        }
        //use a counter to decide how to alternate shadow tints  使用计数器决定如何交替阴影着色
        this.lightStep++;
        if (this.lightStep == this.maxLightStep) {
            this.lightStep = 0;
        }
    },
    /**
     * destroy the shadow  摧毁阴影
     */
    destroy: function() {
        for (var i = this.shadows.length - 1 ; i >= 0 ; i--) {
            this.shadows[i].destroy();
        }
    }
};
