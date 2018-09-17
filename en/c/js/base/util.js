const getParam = function(key) {
    var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return r[2];
    } else {
        return null;
    }
};

var inArray = function(val, array) {
    for (var i = 0; i < array.length; ++i) {
        if (array[i] == val) {
            return true;
        }
    }
    return false;
}

function timestampToMD(timestamp) {
    var date = new Date()
    date.setTime(timestamp)

    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    return month + "月" + day + "日";
}

function timestampToM_D(timestamp) {
    var date = new Date()
    date.setTime(timestamp)

    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate();
    return month + "-" + day;
}

function getTimeformatYMD() {
    var date = new Date()
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    return year + "年" + month + "月" + day + "日";
}

function formatTime(time) {
    var date = new Date(time * 1000);
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds();

    var format = function(val) {
        if (val < 10) {
            return "0" + val;
        } else {
            return val;
        }
    }

    return year + "-" + format(month) + "-" + format(day) + " " + format(hour) + ":" + format(minute) + ":" + format(second);
}

const WEEKS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

function getDetailTime(time) {
    var date = new Date(time * 1000);
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var week = date.getDay();

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds();

    var format = function(val) {
        if (val < 10) {
            return "0" + val;
        } else {
            return val;
        }
    }

    return year + "-" + format(month) + "-" + format(day) + " " + WEEKS[week] + " " + format(hour) + ":" + format(minute) + ":" + format(second);

}

function formatTimeYMDW(time) {
    var date = new Date(time * 1000);
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var week = date.getDay();

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds();

    var format = function(val) {
        if (val < 10) {
            return "0" + val;
        } else {
            return val;
        }
    }

    return year + "-" + format(month) + "-" + format(day) + " " + WEEKS[week] + " ";

}

function formatTimeHM(time) {
    var date = new Date(time * 1000);

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds();

    var format = function(val) {
        if (val < 10) {
            return "0" + val;
        } else {
            return val;
        }
    }

    return format(hour) + ":" + format(minute);
}

function timestampToYMD(timestamp) {
    var date = new Date()
    date.setTime(timestamp * 1000)

    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    return year + "-" + month + "-" + day;
}

function putParam(url, name, param) {
    if (typeof(param) == 'object') {
        param = JSON.stringify(param);
    }
    if (url.endsWith('.html')) {
        return url + '?' + name + '=' + param;
    } else {
        return url + '&' + name + '=' + param;
    }
}


var getItem = function(key) {
    var data = sessionStorage.getItem(key);
    return data;
}

var getObjItem = function(key) {
    var data = getItem(key);
    return JSON.parse(data);
}

var setItem = function(key, value) {
    if (typeof value == "object") {
        value = JSON.stringify(value);
    }
    sessionStorage.setItem(key, value);
}

var setToken = function (token) {
    setItem('token',token)
}

var getToken = function () {
    var token = getParam('token')
    if(token) {
        return token
    }
    token = getItem('token')
    return token
}

var setLocal = function(key, value) {
    if (typeof value == "object") {
        value = JSON.stringify(value);
    }
    localStorage.setItem(key, value);
}

var getLocal = function(key) {
    var data = localStorage.getItem(key);
    return data;
}
