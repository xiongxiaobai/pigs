const defaultErrorHandler = function(error) {
	if(error.msg) {
		console.log(error.msg);
	} else {
		console.log(error);
	}
}
const req = function(url, data, successCallBack, errorCallBack) {
	if(arguments.length < 2) {
		defaultErrorHandler({
			msg: '请求参数错误'
		});
		return;
	}
	if(typeof arguments[arguments.length - 1] != "function") {
		defaultErrorHandler(page, {
			"code": -101,
			"msg": "最后一个参数必须是函数"
		})
		return;
	}
	//  console.log(url, data)

	$.ajax({
		type: "post",
		url: url,
		data:data,
		async: true,
		crossDomain: true,
		xhrFields: {
			withCredentials: true
		},
		dataType: "json",
		success: function(result) {
			if(result.code == 0) {
				successCallBack(result.data);
			} else {
				console.error(url, data, result)
				if(errorCallBack) {
					errorCallBack(result)
				} else {
					defaultErrorHandler(result)
				}
			};
		},
		error: function(e) {
			defaultErrorHandler(e)
		}
	});

//	$.post(url, data, crossDomain: true, xhrFields: {
//		withCredentials: true
//	}, dataType: "json", function(result) {
//		if(result.code == 0) {
//			successCallBack(result.data);
//		} else {
//			console.error(url, data, result)
//			if(errorCallBack) {
//				errorCallBack(result)
//			} else {
//				defaultErrorHandler(result)
//			}
//		}
//
//	});
}