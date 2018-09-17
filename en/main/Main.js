var loadingLayer;
var backgroundLayer, backLayer;
var wallLayer;
var bird, centerlayer;
var bitmap, slingshotJoin;
var imglist = {};
var shape, shape1;
var imgData = new Array({
	type: "js",
	path: "./main/Bird.js"
}, {
	type: "js",
	path: "./main/Pig.js"
}, {
	type: "js",
	path: "./main/Stage.js"
}, {
	type: "js",
	path: "./main/RemoveObject.js"
}, {
	name: "back",
	path: "./images/back.jpg"
}, {
	name: "bird1",
	path: "./images/bird1.png"
}, {
	name: "slingshot1",
	path: "./images/slingshot1.png"
}, {
	name: "slingshot2",
	path: "./images/slingshot2.png"
}, {
	name: "remove",
	path: "./images/remove.png"
}, {
	name: "pig01",
	path: "./images/pig01.png"
}, {
	name: "pig02",
	path: "./images/pig02.png"
}, {
	name: "st01",
	path: "./images/st01.png"
}, {
	name: "st02",
	path: "./images/st02.png"
}, {
	name: "st11",
	path: "./images/st11.png"
}, {
	name: "st12",
	path: "./images/st12.png"
}, {
	name: "st21",
	path: "./images/st21.png"
}, {
	name: "st22",
	path: "./images/st22.png"
}, {
	name: "st31",
	path: "./images/st31.png"
}, {
	name: "st32",
	path: "./images/st32.png"
}, {
	name: "desk",
	path: "./images/desk.png"
});
var startX, startY;

function main() {
	console.log('ok');
	if(LGlobal.canTouch) {
		LGlobal.stageScale = LStageScaleMode.NO_BORDER;
		//        手机屏幕设置全屏
		LSystem.screen(LStage.FULL_SCREEN);
	}
	//添加鼠标事件
	LMouseEventContainer.set(LMouseEvent.MOUSE_DOWN, true);
	LMouseEventContainer.set(LMouseEvent.MOUSE_UP, true);
	LMouseEventContainer.set(LMouseEvent.MOUSE_MOVE, true);
	LGlobal.setDebug(true);
	//添加三张背景层
	backgroundLayer = new LSprite();
	addChild(backgroundLayer);
	backLayer = new LSprite();
	addChild(backLayer);
	loadingLayer = new LoadingSample3();
	backLayer.addChild(loadingLayer);
	//具体loading干什么
	LLoadManage.load(
		imgData,
		//进度条
		function(progress) {
			loadingLayer.setProgress(progress);
		},
		//进度条结束之后进入下一个场景
		function(result) {
			imglist = result;
			backLayer.removeChild(loadingLayer);
			loadingLayer = null;
			gameInit();
		}
	);
}
//加载完毕
function gameInit(event) {
	LGlobal.box2d = new LBox2d();
	var back = new LBitmap(new LBitmapData(imglist["back"]));
	back.scaleX = LGlobal.width / back.getWidth(); //can beyond 1
	back.scaleY = LGlobal.height / back.getHeight();
	//	alert("back.scaleX="+back.scaleX);
	backgroundLayer.addChild(back);
	shape = new LShape();
	backgroundLayer.addChild(shape);
	shape1 = new LShape();
	backgroundLayer.addChild(shape1);
	backLayer.graphics.drawRect(0, "#fffff0", [0, 0, 1600, 480]);

	wallLayer = new LSprite();
	wallLayer.y = 480;
	backLayer.addChild(wallLayer);
	wallLayer.addBodyPolygon(1600, 10, 0); //地面是矩形刚体
	backLayer.graphics.drawRect(1, "#ffffff", [0, 490, 1600, 2], true, "#000000");

	bitmap = new LBitmap(new LBitmapData(imglist["slingshot1"]));
	bitmap.x = 215; //弹弓
	bitmap.y = 290;
	backLayer.addChild(bitmap);

	bird = new LSprite();
	bird.name = "bird01";
	backLayer.addChild(bird);
	bitmap = new LBitmap(new LBitmapData(imglist["bird1"]));
	bird.addChild(bitmap);

	bitmap = new LBitmap(new LBitmapData(imglist["slingshot2"]));
	bitmap.x = 190; //挂钩
	bitmap.y = 290;
	backLayer.addChild(bitmap);
	setStage(["desk"], 800, 430, 0, 10, false);
	setStage(["desk"], 970, 430, 0, 10, false);
	setStage(["st11", "st12"], 935, 410, 0, 1, true);
	setStage(["st01", "st02"], 905, 370, 90, 1, true);
	setStage(["st01", "st02"], 965, 370, 90, 1, true);
	setStage(["st11", "st12"], 935, 310, 0, 1, true);
	setStage(["st31", "st32"], 817, 370, 90, 1, true);
	setStage(["st31", "st32"], 970, 370, 90, 1, true);
	setStage(["st31", "st32"], 895, 250, 0, 1, true);
	setStage(["st21", "st22"], 955, 230, 0, 1, true);
	setStage(["st31", "st32"], 858, 150, 90, 1, true);
	setStage(["st31", "st32"], 925, 150, 90, 1, true);
	setStage(["st11", "st12"], 935, 50, 0, 1, true);
	setStage(["st21", "st22"], 950, 30, 90, 1, true);
	setStage(["st21", "st22"], 800, 430, 90, 1, true);
	setStage(["st21", "st22"], 1100, 430, 90, 1, true);
	var pig = new Pig();
	pig.x = 950;
	pig.y = 173;
	backLayer.addChild(pig);
	console.log("LGlobal.width:"+LGlobal.width);
	backLayer.x = LGlobal.width - 1200;
	LGlobal.box2d.synchronous();
	LTweenLite.to(backLayer, 1, {
		x: 0,
		delay: 0.1,
		onUpdate: function() {
			// console.log(backLayer.x );
			LGlobal.box2d.synchronous();
		},
		onComplete: run,
		ease: Sine.easeIn
	});
}

function run() {
	bird.rotate = 0;
	bird.x = 300; //鸟初始位置
	bird.y = 430; //鸟初始位置
	bird.yspeed = -5;
	LTweenLite.to(bird, 1, {
		x: 200, //鸟跳弹弓
		yspeed: 5,
		delay: 1,
		rotate: -360,
		onUpdate: function() {
			bird.y += bird.yspeed;
		},
		onComplete: function() {
			start();
		},
		ease: Sine.easeIn
	});
}

function downStart(event) {

	if(event.offsetX > bird.x && event.offsetX < bird.x + bird.getWidth() &&
		event.offsetY > bird.y + 70 && event.offsetY < bird.y + bird.getHeight() + 110) { //点击拉动弹弓位置
		backLayer.removeEventListener(LMouseEvent.MOUSE_DOWN, downStart);
		backLayer.addEventListener(LMouseEvent.MOUSE_MOVE, downMove);
		backLayer.addEventListener(LMouseEvent.MOUSE_UP, downOver);
	}
}

function downOver(event) {
	backLayer.removeEventListener(LMouseEvent.MOUSE_UP, downOver);
	backLayer.removeEventListener(LMouseEvent.MOUSE_MOVE, downMove);
	//拖动后的中心位置
	var startX2 = bird.x + bird.getWidth() * 0.5;
	var startY2 = bird.y + bird.getHeight() * 0.5;
	var r = Math.sqrt(Math.pow((startX - startX2), 2) + Math.pow((startY - startY2), 2));
	var angle = Math.atan2(startY2 - startY, startX2 - startX);

	bird.addBodyCircle(bird.getWidth() * 0.5, bird.getHeight() * 0.5, bird.getWidth() * 0.5, 1, 5, .4, .3);
	bird.setBodyMouseJoint(true); //meaning?
	var force = 70; //弹射
	var vec = new LGlobal.box2d.b2Vec2(-force * r * Math.cos(angle), -force * r * Math.sin(angle));
	bird.box2dBody.ApplyForce(vec, bird.box2dBody.GetWorldCenter());
	backLayer.addEventListener(LEvent.ENTER_FRAME, onframe);
	shape.graphics.clear();
	shape1.graphics.clear();
}

function downMove(event) { //event.selfX=event.offsetX;event.selfY=offsetY  for now
	//	alert("event.selfX="+event.selfX+";event.selfY="+event.selfY+";event.offsetX="+event.offsetX+";event.offsetY="+event.offsetY);
	var r = Math.sqrt(Math.pow((startX - event.selfX), 2) + Math.pow((startY - event.selfY), 2));
	if(r > 100) r = 100; //拉弹弓力度
	var angle = Math.atan2(event.selfY - startY, event.selfX - startX);
	bird.x = Math.cos(angle) * r + startX - bird.getWidth() * 0.5;
	bird.y = Math.sin(angle) * r + startY - bird.getHeight() * 0.5 - 30; //鸟拉动跟的位置
	shape.graphics.clear();
	shape.graphics.drawLine(2, "#ff0000", [200, 300, bird.x, bird.y]); //引线
	shape1.graphics.clear();
	shape1.graphics.drawLine(2, "#ff0000", [250, 300, bird.x, bird.y]);
}

function postSolve(contact, impulse) {
	if(contact.GetFixtureA().GetBody().GetUserData().hit) contact.GetFixtureA().GetBody().GetUserData().hit(impulse.normalImpulses[0]);
	if(contact.GetFixtureB().GetBody().GetUserData().hit) contact.GetFixtureB().GetBody().GetUserData().hit(impulse.normalImpulses[0]);
}

function start() {
	LGlobal.box2d.setEvent(LEvent.POST_SOLVE, postSolve);
	bird.x = 200, bird.y = 320; //鸟的跳到弹弓位置
	backLayer.addEventListener(LMouseEvent.MOUSE_DOWN, downStart);
	startX = bird.x + bird.getWidth() * 0.5;
	startY = bird.y + bird.getHeight() * 0.5;
	//bird中心的位置
}
console.log(LGlobal.width);

function onframe() {
	//	alert("backLayer.x="+backLayer.x+";bird="+bird.x);
	if(bird) {
		backLayer.x = LGlobal.width * 0.5 - (bird.x + bird.getWidth() * 0.5);
		if(backLayer.x > 0) { //bird只有超过大约中心位置才视图跟着走
			backLayer.x = 0;
		} else if(backLayer.x < LGlobal.width - 1600) { //屏幕移到“最右边”就不往前走了
			backLayer.x = LGlobal.width - 1600;
		}
		LGlobal.box2d.synchronous();
	}
	var child;
	for(var key in backLayer.childList) {
		child = backLayer.childList[key];
		if(child.name == null || child.name.indexOf("instance") >= 0) continue;
		if(child.x < -child.getWidth() || child.x > backLayer.getWidth()) {
			child.name = null;
			backLayer.removeChild(child);

			//以下代码从不执行
			if(child.name == "bird01") {
				bird = null;
				backLayer.addEventListener(LMouseEvent.MOUSE_DOWN, moveStart);
				backLayer.addEventListener(LMouseEvent.MOUSE_MOVE, moveRun);
				backLayer.addEventListener(LMouseEvent.MOUSE_UP, moveEnd);
			}
		} else if((child.name == "stage" || child.name == "pig") && child.hp <= 0) {
			if(child.name == "pig") {
				var removeObj = new RemoveObject();
				removeObj.x = child.x;
				removeObj.y = child.y;
				backLayer.addChild(removeObj);
				//				console.log(111)   ////小猪打掉
				//				game()
				isok = true;
				if(uid == '' || uid == null || uid == "null") {
					setTimeout(function() {
						$("#gameok").show()
					}, 1000)
					setTimeout(function() {
						alert("您赢得了50IPG，请输入打币地址领取")
						window.location.href = "zhuce.html"
					}, 2000)
					return
				} else {
					req(PIG_SEND, {
							'uid': uid
						}, function(data) {
							is_back = true
							setTimeout(function() {
								$("#gameok").show()
							}, 1000)
							setTimeout(function() {
								window.location.href = "index.html"
							}, 3000)

						},
						function(e) {
							is_back = true
							var dat = e.code;
							if(dat == 190 || dat == '190') {
								alert("您已经领取过了");
								window.location.href = "index.html"
							} else if(dat == 191 || dat == '191') {
								alert("名额已满感谢参与");
								window.location.href = "index.html"
							} else {
								alert("请完整填写参数")
							}
							return false
						})
				}

			}
			backLayer.removeChild(child);
		} else if(child.name == "remove") {
			child.run();
		}
	}
}

function setStage(list, x, y, rotate, m, ctrl) {
	var stageLayer = new Stage(list, rotate, m, ctrl);
	stageLayer.x = x;
	stageLayer.y = y;
	backLayer.addChild(stageLayer);
	return stageLayer;
}
/*var mouseDownX = -1,saveX;
function moveStart(event){
	mouseDownX = event.offsetX;
	saveX = backLayer.x;
}
function moveRun(event){
	alert("backLayer.x="+backLayer.x+";mouseDownX="+mouseDownX+";event.offsetX="+event.offsetX);
	if(mouseDownX<0)return;
	backLayer.x = saveX + (event.offsetX - mouseDownX);
	LGlobal.box2d.synchronous();
}
function moveEnd(event){
	mouseDownX = -1;
}*/