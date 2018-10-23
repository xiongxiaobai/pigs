/*
   Copyright 2014 Nebez Briefkani
   floppybird - main.js

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var fenshu = 0;
var isb = true;
var debugmode = false;

var states = Object.freeze({
	SplashScreen: 0,
	GameScreen: 1,
	ScoreScreen: 2
});

var currentstate;

var gravity = 0.25;
var velocity = 0;
var position = 180;
var rotation = 0;
var jump = -4.6;
var flyArea = $("#flyarea").height();

var score = 0;
var highscore = 0;

var pipeheight = 90;
var pipewidth = 52;
var pipes = new Array();

var replayclickable = false;

//sounds  声音
var volume = 30;
var soundJump = new buzz.sound("assets/sounds/sfx_wing.ogg");
var soundScore = new buzz.sound("assets/sounds/sfx_point.ogg");
var soundHit = new buzz.sound("assets/sounds/sfx_hit.ogg");
var soundDie = new buzz.sound("assets/sounds/sfx_die.ogg");
var soundSwoosh = new buzz.sound("assets/sounds/sfx_swooshing.ogg");
buzz.all().setVolume(volume);

//loops  循环
var loopGameloop;
var loopPipeloop;

var uid = "";
var phone = "";
var coin = 1;
uid = getLocal("pigUID")
phone = getLocal("pigphone")
setItem("pigphone", phone)
setItem("pigUID", uid)
setLocal("pigphone", phone)
setLocal("pigUID", uid)
coin = getUrlParam("coin") || 1;

$(document).ready(function() {

	if(uid && uid != null && uid != "null") {

	} else {
		window.location.href = "../index.html";
	}

	if(window.location.search == "?debug")
		debugmode = true;
	if(window.location.search == "?easy")
		pipeheight = 200;

	//get the highscore  获得高分
	var savedscore = getCookie("highscore");
	if(savedscore != "")
		highscore = parseInt(savedscore);

	//start with the splash screen   从飞溅屏幕开始
	showSplash();
});

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
	var r = window.location.search.substr(1).match(reg); //匹配目标参数
	if(r != null) return unescape(r[2]);
	return null; //返回参数值
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++) {
		var c = ca[i].trim();
		if(c.indexOf(name) == 0) return c.substring(name.length, c.length);
	}
	return "";
}

function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toGMTString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}

function showSplash() {
	currentstate = states.SplashScreen;

	//set the defaults (again)   设置默认值（再次）
	velocity = 0;
	position = 180;
	rotation = 0;
	score = 0;

	//update the player in preparation for the next game  更新玩家准备下一场比赛
	$("#player").css({
		y: 0,
		x: 0
	});
	updatePlayer($("#player"));

	soundSwoosh.stop();
	soundSwoosh.play();

	//clear out all the pipes if there are any   清除所有管道，如果有
	$(".pipe").remove();
	pipes = new Array();

	//make everything animated again   让一切重新焕发活力
	$(".animated").css('animation-play-state', 'running');
	$(".animated").css('-webkit-animation-play-state', 'running');

	//fade in the splash   褪色飞溅
	$("#splash").transition({
		opacity: 1
	}, 2000, 'ease');
}

function startGame() {
	currentstate = states.GameScreen;

	//fade out the splash  褪色飞溅
	$("#splash").stop();
	$("#splash").transition({
		opacity: 0
	}, 500, 'ease');

	//update the big score   更新大比分
	setBigScore();

	//debug mode?  调试模式？
	if(debugmode) {
		//show the bounding boxes  显示边界框
		$(".boundingbox").show();
	}

	//start up our loops  启动我们的循环
	var updaterate = 1000.0 / 60.0; //60 times a second   第二次在60
	loopGameloop = setInterval(gameloop, updaterate);
	loopPipeloop = setInterval(updatePipes, 1400);

	//jump from the start!  从一开始就跳！
	playerJump();
}

function updatePlayer(player) {
	//rotation   旋转
	rotation = Math.min((velocity / 10) * 90, 90);

	//apply rotation and position   应用旋转和位置
	$(player).css({
		rotate: rotation,
		top: position
	});
}

function gameloop() {
	var player = $("#player");

	//update the player speed/position  更新玩家速度/位置
	velocity += gravity;
	position += velocity;

	//update the player  更新玩家
	updatePlayer(player);

	//create the bounding box  创建边界框
	var box = document.getElementById('player').getBoundingClientRect();
	var origwidth = 34.0;
	var origheight = 24.0;

	var boxwidth = origwidth - (Math.sin(Math.abs(rotation) / 90) * 8);
	var boxheight = (origheight + box.height) / 2;
	var boxleft = ((box.width - boxwidth) / 2) + box.left;
	var boxtop = ((box.height - boxheight) / 2) + box.top;
	var boxright = boxleft + boxwidth;
	var boxbottom = boxtop + boxheight;

	//if we're in debug mode, draw the bounding box  如果我们处于调试模式，请绘制边界框。
	if(debugmode) {
		var boundingbox = $("#playerbox");
		boundingbox.css('left', boxleft);
		boundingbox.css('top', boxtop);
		boundingbox.css('height', boxheight);
		boundingbox.css('width', boxwidth);
	}

	//did we hit the ground?  我们撞到地面了吗？
	if(box.bottom >= $("#land").offset().top) {
		playerDead();
		return;
	}

	//have they tried to escape through the ceiling? :o  他们试图从天花板逃走吗？
	var ceiling = $("#ceiling");
	if(boxtop <= (ceiling.offset().top + ceiling.height()))
		position = 0;

	//we can't go any further without a pipe  没有管道我们不能再走了。
	if(pipes[0] == null)
		return;

	//determine the bounding box of the next pipes inner area  确定下一个管道内部区域的包围盒
	var nextpipe = pipes[0];
	var nextpipeupper = nextpipe.children(".pipe_upper");

	var pipetop = nextpipeupper.offset().top + nextpipeupper.height();
	var pipeleft = nextpipeupper.offset().left - 2; // for some reason it starts at the inner pipes offset, not the outer pipes.  由于某种原因，它开始在内部管道偏移，而不是外部管道。
	var piperight = pipeleft + pipewidth;
	var pipebottom = pipetop + pipeheight;

	if(debugmode) {
		var boundingbox = $("#pipebox");
		boundingbox.css('left', pipeleft);
		boundingbox.css('top', pipetop);
		boundingbox.css('height', pipeheight);
		boundingbox.css('width', pipewidth);
	}

	//have we gotten inside the pipe yet?  我们进入管道了吗？
	if(boxright > pipeleft) {
		//we're within the pipe, have we passed between upper and lower pipes?  我们在管道里，我们经过上下管道了吗？
		if(boxtop > pipetop && boxbottom < pipebottom) {
			//yeah! we're within bounds 是啊！我们在界内

		} else {
			//no! we touched the pipe  不！我们碰了一下烟斗
			playerDead();
			return;
		}
	}

	//have we passed the imminent danger?  我们经历了迫在眉睫的危险吗？
	if(boxleft > piperight) {
		//yes, remove it  是的，删除它
		pipes.splice(0, 1);

		//and score a point  得分
		playerScore();
	}
}

//Handle space bar  句柄空格键
$(document).keydown(function(e) {
	//space bar! 空格吧！
	if(e.keyCode == 32) {
		//in ScoreScreen, hitting space should click the "replay" button. else it's just a regular spacebar hit  在得分屏幕上，击球空间应该点击“重放”按钮。否则它只是一个普通的空格键
		if(currentstate == states.ScoreScreen)
			$("#replay").click();
		else
			screenClick();
	}
});

//Handle mouse down OR touch start  鼠标按下或触摸启动
if("ontouchstart" in window)
	$(document).on("touchstart", screenClick);
else
	$(document).on("mousedown", screenClick);

function screenClick() {
	if(currentstate == states.GameScreen) {
		playerJump();
	} else if(currentstate == states.SplashScreen) {
		startGame();
	}
}

function playerJump() {
	velocity = jump;
	//play jump sound  播放跳转声音
	soundJump.stop();
	soundJump.play();
}

function setBigScore(erase) {
	var elemscore = $("#bigscore");
	elemscore.empty();

	if(erase)
		return;

	var digits = score.toString().split('');
	for(var i = 0; i < digits.length; i++)
		elemscore.append("<img src='assets/font_big_" + digits[i] + ".png' alt='" + digits[i] + "'>");
}

function setSmallScore() {
	var elemscore = $("#currentscore");
	elemscore.empty();

	var digits = score.toString().split('');
	for(var i = 0; i < digits.length; i++)
		elemscore.append("<img src='assets/font_small_" + digits[i] + ".png' alt='" + digits[i] + "'>");
}

function setHighScore() {
	var elemscore = $("#highscore");
	elemscore.empty();

	var digits = highscore.toString().split('');
	for(var i = 0; i < digits.length; i++)
		elemscore.append("<img src='assets/font_small_" + digits[i] + ".png' alt='" + digits[i] + "'>");
}

function setMedal() {
	var elemmedal = $("#medal");
	elemmedal.empty();
	console.log(score)
	var fenshu1 = Number(score)
	if(fenshu1 < 10) {
		fenshu = 0
	} else {
		fenshu = 50 + (parseInt((fenshu1 - 50) / 10) * 60)
	}

	if(score < 10)
		//signal that no medal has been won  没有获得奖牌的信号
		return false;

	if(score >= 10)
		medal = "bronze";
	if(score >= 20)
		medal = "silver";
	if(score >= 30)
		medal = "gold";
	if(score >= 40)
		medal = "platinum";

	elemmedal.append('<img src="assets/medal_' + medal + '.png" alt="' + medal + '">');
	if(isb) {
		isb = false;
		var fenshu1 = fenshu
		fenshu = parseInt(Number(fenshu) * Number(coin) / 500)
		req(IPG_GAME_GET, {
				'uid': uid,
				'game_get_money1': fenshu,
				'score': fenshu1,
				'game_name': 'FlappyCoin'
			}, function(data) {

			},
			function(e) {
				alert(e.msg)
			})
	}
	//signal that a medal has been won  表示获得奖牌的信号
	return true;
}

function playerDead() {
	//stop animating everything!
	$(".animated").css('animation-play-state', 'paused');
	$(".animated").css('-webkit-animation-play-state', 'paused');

	//drop the bird to the floor  把鸟掉在地板上
	var playerbottom = $("#player").position().top + $("#player").width(); //we use width because he'll be rotated 90 deg  用宽度 因为会旋转90度
	var floor = flyArea;
	var movey = Math.max(0, floor - playerbottom);
	$("#player").transition({
		y: movey + 'px',
		rotate: 90
	}, 1000, 'easeInOutCubic');

	//it's time to change states. as of now we're considered ScoreScreen to disable left click/flying  到了改变状态的时候了  现在我们考虑使左键失效
	currentstate = states.ScoreScreen;

	//destroy our gameloops 销毁我们的游戏循环
	clearInterval(loopGameloop);
	clearInterval(loopPipeloop);
	loopGameloop = null;
	loopPipeloop = null;

	//mobile browsers don't support buzz bindOnce event   移动浏览器不支持Buff-Boin一次事件
	if(isIncompatible.any()) {
		//skip right to showing score  跳过显示分数
		showScore();
	} else {
		//play the hit sound (then the dead sound) and then show score   播放敲击声（然后死声）然后显示得分
		soundHit.play().bindOnce("ended", function() {
			soundDie.play().bindOnce("ended", function() {
				showScore();
			});
		});
	}
}

function showScore() {
	//unhide us  揭开我们的面纱
	$("#scoreboard").css("display", "block");

	//remove the big score  删除大比分
	setBigScore(true);

	//have they beaten their high score?  他们打败高分了吗？
	if(score > highscore) {
		//yeah!
		highscore = score;
		//save it!  救救它！
		setCookie("highscore", highscore, 999);
	}

	//update the scoreboard  更新记分牌
	setSmallScore();
	setHighScore();
	var wonmedal = setMedal();

	//SWOOSH!  嗖嗖！
	soundSwoosh.stop();
	soundSwoosh.play();

	//show the scoreboard  显示记分牌
	$("#scoreboard").css({
		y: '40px',
		opacity: 0
	}); //move it down so we can slide it up
	$("#replay").css({
		y: '40px',
		opacity: 0
	});
	$("#scoreboard").transition({
		y: '0px',
		opacity: 1
	}, 600, 'ease', function() {
		//When the animation is done, animate in the replay button and SWOOSH!  当动画完成后，在重放按钮和SWOOSH中动画！
		soundSwoosh.stop();
		soundSwoosh.play();
		$("#replay").transition({
			y: '0px',
			opacity: 1
		}, 600, 'ease');

		//also animate in the MEDAL! WOO!  还激活了奖牌！求爱！
		if(wonmedal) {
			$("#medal").css({
				scale: 2,
				opacity: 0
			});
			$("#medal").transition({
				opacity: 1,
				scale: 1
			}, 1200, 'ease');
		}
	});

	//make the replay button clickable  使重放按钮可点击
	replayclickable = true;
}

$("#replay").click(function() {
	//make sure we can only click once  确保我们只能点击一次
	if(!replayclickable)
		return;
	else
		replayclickable = false;
	//SWOOSH!
	soundSwoosh.stop();
	soundSwoosh.play();

	//fade out the scoreboard  淡出记分牌
	$("#scoreboard").transition({
		y: '-40px',
		opacity: 0
	}, 1000, 'ease', function() {
		//when that's done, display us back to nothing
		$("#scoreboard").css("display", "none");

		//start the game over!  游戏开始！
		showSplash();
	});
});

function playerScore() {
	score += 1;
	//play score sound  播放分数声音
	soundScore.stop();
	soundScore.play();
	setBigScore();
}

function updatePipes() {
	//Do any pipes need removal?  任何管道都需要拆卸吗？
	$(".pipe").filter(function() {
		return $(this).position().left <= -100;
	}).remove()

	//add a new pipe (top height + bottom height  + pipeheight == flyArea) and put it in our tracker  添加一个新的管道（顶部高度+底部高度+ PiPeeLeal= = FieldAs）并将其放入我们的跟踪器中。
	var padding = 80;
	var constraint = flyArea - pipeheight - (padding * 2); //double padding (for top and bottom)  双垫（顶部和底部）
	var topheight = Math.floor((Math.random() * constraint) + padding); //add lower padding  添加下填充
	var bottomheight = (flyArea - pipeheight) - topheight;
	var newpipe = $('<div class="pipe animated"><div class="pipe_upper" style="height: ' + topheight + 'px;"></div><div class="pipe_lower" style="height: ' + bottomheight + 'px;"></div></div>');
	$("#flyarea").append(newpipe);
	pipes.push(newpipe);
}

var isIncompatible = {
	Android: function() {
		return navigator.userAgent.match(/Android/i);
	},
	BlackBerry: function() {
		return navigator.userAgent.match(/BlackBerry/i);
	},
	iOS: function() {
		return navigator.userAgent.match(/iPhone|iPad|iPod/i);
	},
	Opera: function() {
		return navigator.userAgent.match(/Opera Mini/i);
	},
	Safari: function() {
		return(navigator.userAgent.match(/OS X.*Safari/) && !navigator.userAgent.match(/Chrome/));
	},
	Windows: function() {
		return navigator.userAgent.match(/IEMobile/i);
	},
	any: function() {
		return(isIncompatible.Android() || isIncompatible.BlackBerry() || isIncompatible.iOS() || isIncompatible.Opera() || isIncompatible.Safari() || isIncompatible.Windows());
	}
};