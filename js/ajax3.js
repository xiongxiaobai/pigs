function toStr(data){
	data.t=Math.random();
	var arr=[];
	for(var name in data){
		arr.push(name+"="+data[name]) ;
	}
	return arr.join("&");
}

function ajax(json){
	json = json || {};
	if(!json.url)return;
	json.type = json.type || "GET";
	json.data = json.data ||{};
	json.time = json.time || 3000;
	
	var timer = null;
	
	if(window.XMLHttpRequest){
		var oAjax = new XMLHttpRequest();
	}else{
		var oAjax = new ActiveXObject('Microsoft.XMLHTTP');
	}
	
	switch(json.type.toUpperCase()){
		case "GET":
			oAjax.open("GET",json.url+"?"+toStr(json.data),true);
			oAjax.send();
			break;
		case "POST":
			oAjax.open("POST",json.url,true);
			oAjax.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
			oAjax.send(tostr(json.data));
	}
	
	oAjax.onreadystatechange=function(){
		if(oAjax.readyState==4){
			if(oAjax.status>=200 && oAjax.status<300 || oAjax.status==304){
				oAjax.success && oAjax.success(oAjax.responseText);
				clearTimeout(timer);
			}else{
				oAjax.error && oAjax.error(oAjax.status);
				clearTimeout(timer);
			}
		}
	}
	
	timer = setTimeout(function(){
		alert('网络不给力');
		
		oAjax.onreadystatechange=null;
	},json.time*1000)
}

