var time = 60;
var is_code = true;
var isback = true;
var back_code = '';
var uid = '';
$(document).ready(function() {

	changePic()

})


function changePic() {

	if(is_code == false) {
		return false;
	}
	is_code = false;
	$.ajax({
		type: "post",
		url: VERIFICATION_GENERATE_CAPTURE,
		async: true,
		crossDomain: true,
		dataType: "json",
		xhrFields: {
			withCredentials: true
		},
		success: function(data) {
			var body = data.data;
			var img = body.data.content;

			$("#pic_code").attr("src", img);
			is_code = true;
		},
		error: function(e) {
			is_code = true;
		}
	});
}

function goTime() {
	var settime = setInterval(function() {
		$("#btn").text(time + "秒")
		time--;
		if(time <= 0) {
			is_code = true;
			time = 60
			$("#btn").text("获取验证码");
			clearInterval(settime);
			return false;
		}
	}, 1000);
	settime
}

function sendCode() {
	if(is_code == false) {
		return false;
	}
	is_code = false;

	var phone = $("#phone").val()
	if(!(/^1[0-9][0-9]\d{4,8}$/.test(phone))) {
		is_code = true
		alert("不是完整的11位手机号或者正确的手机号前七位");
		//		document.mobileform.mobile.focus();
		return false;
	}
	var pic_id = $("#pic_id").val()
	if(pic_id == '' || pic_id == null || pic_id == 'null') {
		alert("输入正确的图片验证码才能获取短信验证码")
		is_code = true
		return false;
	}
	is_code = false;

	$.ajax({
		type: "post",
		url: VERIFICATION_CAPTURE,
		crossDomain: true,
		xhrFields: {
			withCredentials: true
		},
		dataType: "json",
		data: {
			'captcha': pic_id
		},
		async: true,
		success: function(data) {
			var data = data.data.data;

			if(data.status == "ok") {
				back_code = data.randomCode
				send();

				return false;
			}
		},
		error: function(e) {
			alert('图片验证码有误')

			is_code = true;
			changePic()
			return false;
		}
	});

};

function send() {
	var phone = $("#phone").val()
	req(IPGUSER_SENDFINDPASSWORDCODE_URL, {
			'phone': phone,
			'randomCode': back_code
		}, function(data) {

			alert("验证码获取成功");
			goTime()
		},
		function(e) {
			alert("获取验证码失败！");
			is_code = true;
			changePic()
			return false
		})

}

function register() {
	if(isback == false) {
		return;
	}
	isback = false;
	var phone = $("#phone").val()
	var password = $("#password").val()
	var code = $("#code").val()
	var inviteCode = $("#inviteCode").val()
//	var password_again = $("#password_again").val()
	if(phone == '' || phone == null || phone == 'null') {
		alert("手机号不能为空")
		isback = true;
		return
	}
	if(code == '' || code == null || code == 'null') {
		isback = true;
		alert("验证码不能为空")
		return
	}
	if(password.length < 6) {
		isback = true;
		alert("密码至少6位！")
	} else if(password == '' || password == null || password == 'null') {
		isback = true;
		alert("密码不能为空！")
	} else {
		req(IPGUSER_FINDPASSWORD_URL, {
			'phone': phone,
			'password': password,
			'randomCode': back_code,
			'code': code
		}, function(data) {
			//			alert("注册成功")
			uid = data.user.uid
			var name = data.user.username
			var icon = data.user.icon
			setItem("pigUID", uid)
			setItem("pigphone", phone)
			setLocal("pigUID", uid)
			setLocal("pigphone", phone)
			isback = true;
			alert("修改成功！请记住新密码："+password)
//			var is_news = confirm("注册成功，每天抽奖必中奖，中奖率100%,是否立即去抽奖？");
//			if(is_news == true) {
//				isback = true;
//				window.location = "choujiang.html";
//			} else {
				window.location = 'index.html'
//			}
		}, function(err) {
			alert(err.msg)
			isback = true;
		})
	} 
//	else {
//		isback = true;
//		alert("两次密码不一致");
//		$("#password").val('')
//		$("#password_again").val('')
//	}

}

function back() {
	history.go(-1)
}


function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
	var r = window.location.search.substr(1).match(reg); //匹配目标参数
	if(r != null) return unescape(r[2]);
	return null; //返回参数值
}

