Array.prototype.inArray = function(eeee) {
	for (aaa = 0; aaa < this.length; aaa++) {
		if (this[aaa] == eeee) {
			return true;
		}
	}
	return false;
}

String.prototype.startsWith = function(str) {
	return this.slice(0, str.length) == str;
};

// 判断当前字符串是否以str结束
String.prototype.endsWith = function(str) {
	return this.slice(-str.length) == str;
};
String.prototype.trim = function() {
	return this.replace(/(^\s*)|(\s*$)/g, '');
}

$.hh = $.hh || {};

$.hh.property = {
	pageSize : 15,
	img_add : '/hhcommon/images/extjsico/add.gif',
	img_delete : '/hhcommon/images/extjsico/delete2.gif',
	img_edit : '/hhcommon/images/extjsico/edit.gif',
	img_email_open : '/hhcommon/images/icons/email/email_open.png',
	img_email : '/hhcommon/images/icons/email/email.png',
	img_email_close : '/hhcommon/images/icons/email/email_close.gif',
	img_refresh : '/hhcommon/images/icons/arrow/arrow_refresh.png',
	img_excel : '/hhcommon/images/myimage/excel.png',
	img_wenjianjia : '/hhcommon/images/framework/wenjianjia.jpg',
	img_wenjian : '/hhcommon/images/framework/wenjian.jpg',
	loginUser : {},
	execLoad : {},
	fileTypeIcon : {
		"rar" : "icon_rar.gif",
		"zip" : "icon_rar.gif",
		"tar" : "icon_rar.gif",
		"gz" : "icon_rar.gif",
		"bz2" : "icon_rar.gif",
		"doc" : "icon_doc.gif",
		"docx" : "icon_doc.gif",
		"pdf" : "icon_pdf.gif",
		"mp3" : "icon_mp3.gif",
		"xls" : "icon_xls.gif",
		"chm" : "icon_chm.gif",
		"ppt" : "icon_ppt.gif",
		"pptx" : "icon_ppt.gif",
		"avi" : "icon_mv.gif",
		"rmvb" : "icon_mv.gif",
		"wmv" : "icon_mv.gif",
		"flv" : "icon_mv.gif",
		"swf" : "icon_mv.gif",
		"rm" : "icon_mv.gif",
		"exe" : "icon_exe.gif",
		"psd" : "icon_psd.gif",
		"txt" : "icon_txt.gif",
		"jpg" : "icon_jpg.gif",
		"png" : "icon_jpg.gif",
		"jpeg" : "icon_jpg.gif",
		"gif" : "icon_jpg.gif",
		"ico" : "icon_jpg.gif",
		"bmp" : "icon_jpg.gif"
	},
	getFileTypeIcon:function(fileType){
		var fileType= $.hh.property.fileTypeIcon[fileType];
		if(fileType){
			return '<img src="'+'/hhcommon/images/fileTypeImages/'+fileType+'"/>';
		}else{
			return '';
		}
	},
	defaultValueConfig:['${当前登录人}', '${当前登录人岗位}', '${当前登录人所在部门}', '${当前登录人所在机构}'

		, '${当前时间yyyy-MM-dd}', '${当前时间yyyy-MM-dd HH:mm:ss}', '${当前时间yyyy-MM}',
				'${当前时间yyyy}', '${当前时间HH:mm:ss}', '${当前时间HH:mm}',
				'${当前时间yyyy-MM-dd HH}']
}

$.hh.params = {};
$.hh.objsToStr = function(objList, key) {
	var ids = '';
	for (var i = 0; i < objList.length; i++) {
		if (key) {
			ids += objList[i][key] + ',';
		} else {
			ids += objList[i]['id'] + ',';
		}
	}
	if (ids != '') {
		ids = ids.substr(0, ids.length - 1);
	}
	return ids;
}

$.hh.getTime = function() {
	if ($.hh.time) {
		$.hh.time++;
	} else {
		$.hh.time = new Date().getTime();
	}
	return $.hh.time;
}

$.hh.log = function(dd) {
	if ($.hh.browser.type.indexOf('IE') > -1) {
		alert(dd);
	} else {
		console.log(dd);
	}
}

$.hh.getUUID = function(length) {
	if (length) {
		var uuid = UUID.prototype.createUUID();
		return uuid.substr(uuid.length - length);
	} else {
		return UUID.prototype.createUUID();
	}
}
$.hh.getDate = function() {
	try {
		return new Date(timelong);
	} catch (e) {
		return new Date();
	}
}

$.hh.toObject = function(string) {
	try {
		var a = new Function("return " + string);
		return a();
	} catch (e) {
		try {
			console.log(e);
		} catch (e) {
		}
	}
}

$.hh.getObject = function(string) {
	try {
		if ($.isPlainObject(string) || $.isArray(string)) {
			return string;
		} else {
			return $.hh.toObject(string);
		}
	} catch (e) {
		try {
			console.log(e);
		} catch (e) {
		}
	}
}

$.hh.toInt = function(str) {
	if (str) {
		return parseInt(str);
	} else {
		return 0;
	}
}
$.hh.listToObject = function(dataList) {
	var params = {};
	if (dataList) {
		if (typeof dataList == 'string') {
			dataList = $.hh.toObject(dataList);
		}
		for (var i = 0; i < dataList.length; i++) {
			params[dataList[i].id] = dataList[i];
		}
	}
	return params;
}
$.hh.renderValue = function(value, render, item) {
	if (render == 'datetime') {
		value = $.hh.formatDate(value, 'yyyy-MM-dd HH:mm:ss');
	} else if (render == 'date') {
		value = $.hh.formatDate(value);
	} else if (render == 'bool') {
		if (value == 1) {
			value = '<font color=green>是</font>'
		} else {
			value = '<font color=red>否</font>'
		}
	} else if (render) {
		if (typeof render == "string") {
			value = eval(render + "(value,item)");
		} else {
			value = render(value, item);
		}
	}
	if (value != 0) {
		value = value || '';
	}
	return value;
}
$.hh.cmpchar = function(value, length, cr) {
	var l = length - ((value + "").length);
	var chr = '';
	for (var i = 0; i < l; i++) {
		chr += cr;
	}
	return chr + value;
}
$.hh.millisecondTOHHMMSS = function(millisecond) {
	if (!millisecond) {
		return "0天00时00分00秒";
	}
	var hour = parseInt(millisecond / (60 * 60 * 1000));
	var day = parseInt(hour / 24);
	var minute = parseInt((millisecond - hour * 60 * 60 * 1000) / (60 * 1000));
	var second = parseInt((millisecond - hour * 60 * 60 * 1000 - minute * 60
			* 1000)
			/ 1000);
	if (second >= 60) {
		second = second % 60;
		minute += parseInt(second / 60);
	}
	if (minute >= 60) {
		minute = minute % 60;
		hour += parseInt(minute / 60);
	}
	if (hour >= 24) {
		hour = hour % 24;
		day += parseInt(hour / 24);
	}
	var sh = "";
	var sm = "";
	var ss = "";
	if (hour < 10) {
		sh = "0" + hour;
	} else {
		sh = hour;
	}
	if (minute < 10) {
		sm = "0" + minute;
	} else {
		sm = minute;
	}
	if (second < 10) {
		ss = "0" + second;
	} else {
		ss = second;
	}
	var returnStr = '';
	if (day != 0) {
		returnStr += day + "天";
	}
	if (sh != '00') {
		returnStr += sh + "时";
	}
	if (sm != '00') {
		returnStr += sm + "分";
	}
	if (ss != '00') {
		returnStr += ss + "秒";
	}
	return returnStr;
}

$.hh.toString = function(o) {
	return JSON.stringify(o);
}
$.hh.iframeLoad = function(iframe, callback) {
	if (iframe.attachEvent) {
		iframe.attachEvent("onload", callback);
	} else {
		iframe.onload = callback;
	}
}
$.hh.clearIframe = function(id){
    var el = document.getElementById(id);
    if(el){
    	var iframe = el.contentWindow;
        el.src = 'about:blank';
        try{
            iframe.document.write('');
            iframe.document.clear();
        }catch(e){};
        //以上可以清除大部分的内存和文档节点记录数了
        //最后删除掉这个 iframe 就哦咧。
        el.parentElement.removeChild(el);
    }
}
$.hh.isE = function(value) {
	return new RegExp(/^[a-zA-Z\ \']+$/).test(value);
}
$.hh.isDate = function(value) {
	return new RegExp(/^\d{4}-(0\d|1[0-2])-([0-2]\d|3[01])( ([01]\d|2[0-3])\:[0-5]\d\:[0-5]\d)?$/)
			.test(value)
			|| new RegExp(/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/)
					.test(value);
}
$.hh.watermark = function(input, watermark) {
	var c = 'watermark';
	input.attr('placeholder', watermark);
	// if(input.attr('type')=='password'){
	// input.data('password','1');
	// }
	input.data('color', input.css('color'))
	var e = function() {
		if ($(this).data('watermark_focus') != '1'
				|| !$(this).data('watermark_focus')) {
			var input2 = $(this);
			var placeholder = input2.attr('placeholder');
			if (input2.val() && input2.val() != placeholder) {
				// if(input2.data('password')=='1'){
				// input2.attr('type','password');
				// }
				$(this).data('watermark_value', '0');
				input2.css('color', input2.data('color'))
			} else {
				// if(input2.data('password')=='1'){
				// input2.attr('type','text');
				// }
				$(this).data('watermark_value', '1');
				input2.val(placeholder);
				input2.css('color', '#999')
			}
		}
	}
	input.focus(function() {
				$(this).data('watermark_focus', '1');
				var t = $(this).attr('placeholder');
				if ($(this).val() == t) {
					$(this).val('');
				}
			});
	input.blur(function() {
				$(this).data('watermark_focus', '0');
			}).keyup(function() {
				$(this).data('watermark_focus', '0');
			});

	input.change(e).blur(e).focus(e);
	//input.change().blur();
}

$.hh.stringToDate = function(str) {
	return new Date(str.replace(/-/g, "/"));
}
$.hh.formatDate = function(d, fmt) {
	fmt = fmt || 'yyyy-MM-dd';
	var zeroize = function(value, length) {
		if (!length)
			length = 2;
		value = String(value);
		for (var i = 0, zeros = ''; i < (length - value.length); i++) {
			zeros += '0';
		}
		return zeros + value;
	};
	if (d) {

		if ($.type(d) == 'string') {
			// '2014-10-31T09:53:51 07:00'
			if (d.indexOf('T') > -1 && d.lastIndexOf('-') > -1) {
				if (d.indexOf('T') < d.lastIndexOf('-')) {
					d = d.substr(0, d.lastIndexOf('-'));
				}
			}
			d = d.replace(/-/g, '/').replace(/\.0/g, '').replace('T', ' ');
			if (d.indexOf('+') > -1) {
				d = d.split('+')[0];
			}
			if (d.indexOf('.') > -1) {
				d = d.split('.')[0];
			}
			if (d.indexOf(':000') > -1) {
				d = d.split(':000')[0];
				d = d + ":00";
			}
			d = new Date(d.replace(/-/g, '/').replace(/\.0/g, '').replace('T',
					' '));
		}
		var o = {
			"M+" : d.getMonth() + 1, // 月份
			"d+" : d.getDate(), // 日
			"h+" : d.getHours() % 12 == 0 ? 12 : d.getHours() % 12, // 小时
			"H+" : d.getHours(), // 小时
			"m+" : d.getMinutes(), // 分
			"s+" : d.getSeconds(), // 秒
			"q+" : Math.floor((d.getMonth() + 3) / 3), // 季度
			"S" : d.getMilliseconds()
			// 毫秒
		};
		var week = {
			"0" : "日",
			"1" : "一",
			"2" : "二",
			"3" : "三",
			"4" : "四",
			"5" : "五",
			"6" : "六"
		};
		if (/(y+)/.test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4
							- RegExp.$1.length));
		}
		if (/(E+)/.test(fmt)) {
			fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1)
							? (RegExp.$1.length > 2 ? "星期" : "周")
							: "")
							+ week[d.getDay() + ""]);
		}
		for (var k in o) {
			if (new RegExp("(" + k + ")").test(fmt)) {
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1)
								? (o[k])
								: (("00" + o[k]).substr(("" + o[k]).length)));
			}
		}
		return fmt;
	} else {
		return '';
	}
};
$.hh.formatText = function(value, format) {
	if (format == '#,##0.00') {
		return Lawyee.outputmoney(value, 2);
	} else if (format == '#,##0') {
		return Lawyee.outputmoney(value, 0);
	} else if (format == '0.00') {
		if (isNaN(value) || value == "") {
			return "";
		}
		return (Math.round(value * 100) / 100).toFixed(2);
	} else if (format == '#0.0#') {
		if (isNaN(value) || value == "") {
			return "";
		}
		return (Math.round(value * 10) / 10).toFixed(1);
	} else if (format == '#0%') {
		value = value.replace(/\%/g, "");
		if (isNaN(value) || value == "") {
			return "";
		}
		return (Math.round(value * 1) / 1) + '%';
	} else if (format == '#0.0%') {
		value = value.replace(/\%/g, "");
		if (isNaN(value) || value == "") {
			return "";
		}
		return (Math.round(value * 10) / 10).toFixed(1) + '%';
	} else if (format == '#0.00%') {
		value = value.replace(/\%/g, "");
		if (isNaN(value) || value == "") {
			return "";
		}
		return (Math.round(value * 100) / 100).toFixed(2) + '%';
	} else if (format == '¤#0') {
		value = value.replace(/\￥/g, "");
		if (isNaN(value) || value == "") {
			return "";
		}
		return '￥' + (Math.round(value * 1) / 1);
	} else if (format == '¤#0.00') {
		value = value.replace(/\￥/g, "");
		if (isNaN(value) || value == "") {
			return "";
		}
		return '￥' + (Math.round(value * 100) / 100).toFixed(2);
	} else if (format == '¤#,##0') {
		value = value.replace(/\￥/g, "");
		value = Lawyee.outputmoney(value, 0)
		return '￥' + value;
	} else {
		return value;
	}
}

$.hh.getRootFrame = function() {
	if (window.parent && window.parent.set_height != null) {
		return $.hh.getRootFrame2(window.parent);
	} else {
		return window;
	}
};
$.hh.getRootFrame2 = function(param) {
	if (param != param.parent && param.parent.set_height != null) {
		return $.hh.getRootFrame2(param.parent);
	} else {
		return param;
	}
};

$.hh.setFrameParams = function(iframeId, params) {
	$.hh.getRootFrame().$.hh.params[iframeId] = params;
}
$.hh.getIframeParams = function() {
	if (window.frameElement) {
		var params = $.hh.getRootFrame().$.hh.params[window.frameElement.id];
		// delete
		// $.hh.getRootFrame().$.hh.params[window.frameElement.id];
		return params || {};
	} else {
		return {};
	}
};
// 全局的ajax访问，处理ajax清求时sesion超时
$.ajaxSetup({
			contentType : "application/x-www-form-urlencoded;charset=utf-8",
			complete : function(XMLHttpRequest, textStatus) {
				/*
				 * if (XMLHttpRequest.getResponseHeader) { var sessionstatus =
				 * XMLHttpRequest .getResponseHeader("sessionstatus"); //
				 * 通过XMLHttpRequest取得响应头，sessionstatus， if (sessionstatus ==
				 * "timeout") { $.hh.timeout(); return false; } }
				 */
			}
		});

var Request = {
	request : function(url, config, callb) {
		if (config == null) {
			config = {};
		}
		if (config.callback == null) {
			config.callback = callb;
		}
		if (config.doing != false) {
			Doing.show();
		}
		$.ajax({
			type : "POST",
			url : url,
			async : config.async != false,
			data : config.data,
			timeout : config.timeout,
			error : function(resulttext) {
				try {
					var result = $.hh.toObject(resulttext.responseText);
					Doing.hide();
					Dialog.error(result.msg);
					delete result;
				} catch (ex) {
					if (config.callback) {
						config.callback({
									success : false
								});
					}
					Dialog.error('服务器异常！重新登录系统，或联系管理员.....');
				}
			},
			success : function(resulttext) {
				var result = $.hh.toObject(resulttext);
				delete resulttext;
				if (result && result.sessionstatus == 'no_authority') {
					Doing.hide();
					Dialog.alert(result.sessionstatusMsg);
					result.success = false;
					return;
				} else if (result && result.sessionstatus == 'timeout') {
					Doing.hide();
					$.hh.timeout();
					result.success = false;
					return;
				}
				Doing.hide();
				if ((resulttext != null && resulttext != '' && resulttext != 'null')
						&& result == null) {
					Dialog.error(resulttext);
					return;
				}
				result = result || {
					success : true
				};
				if (config.defaultMsg != false && result.success == true) {
					if (result && result.returnModel) {
						result.success = false;
						var returnModel = result.returnModel;
						if (returnModel.href == null || returnModel.href == "") {
							switch (returnModel.type) {
								case "error" :
									Dialog.error(returnModel.msg);
									break;
								default :
									Dialog.alert(returnModel.msg);
									break;
							}
						} else {
							Doing.show();
							Request.href(returnModel.href);
						}
					} else {
						Dialog.okmsg('操作成功！！');
					}
				}
				if (config.callback) {
					config.callback(result);
				}
				delete result;
				delete config;
			}

		});
	},
	href : function(url) {
		window.location.href = url;
	},
	openwin : function(pageURL, config) {
		config = config || {};
		var fulls = "left=0,screenX=0,top=0,screenY=0,scrollbars=1"; // 定义弹出窗口的参数
		if (window.screen) {
			var ah = screen.availHeight - 65;
			var aw = screen.availWidth - 10;
			fulls += ",height=" + ah;
			fulls += ",innerHeight=" + ah;
			fulls += ",width=" + aw;
			fulls += ",innerWidth=" + aw;
			fulls += ",resizable"
		} else {
			fulls += ",resizable"; // 对于不支持screen属性的浏览器，可以手工进行最大化。 manually
		}
		var name = (config.id || new Date().getTime()) + '';
		name = ('name' + name).replace(/-/g, '').replace(/_/g, '');
		var subwin = window.open(pageURL, name, fulls);
		subwin.focus();
		return subwin;
	},
	getHref : function(url, params) {
		if (params) {
			if (url.indexOf('?') > -1) {
				return url + '&' + $.param(params);
			} else {
				return url + '?' + $.param(params);
			}
		} else {
			return url;
		}
	},
	submit : function(action, params) {
		var form = document.getElementById('system_open_page_form');
		if (form == null) {
			var bodys = document.getElementsByTagName('body');
			form = document.createElement('form');
			form.setAttribute('id', 'system_open_page_form');
			form.setAttribute('method', 'post');
			form.setAttribute('target', '_blank');
			var input = document.createElement('input');
			input.setAttribute('type', 'hidden');
			input.setAttribute('name', 'params');
			input.setAttribute('id', 'system_open_page_form_params');
			form.appendChild(input);
			bodys[0].appendChild(form);
		}
		form.target = '_blank';
		form.action = action;
		document.getElementById('system_open_page_form_params').value = $.hh
				.toString(params);
		form.submit();
	},
	download : function(id, config) {
		if (config && config.downloadUrl) {
			this.submit(config.downloadUrl + '?params=' + $.hh.toString({
								'id' : id
							}), null);
		} else {
			this.submit('system-File-download?params=' + $.hh.toString({
								'id' : id
							}), null);

		}
	},
	viewFile : function(id, config) {
		var URL = 'jsp-system-tools-viewFile?id=' + id;
		if (config && config.viewFileUrl) {
			URL = config.viewFileUrl + '?id=' + id;
		}
		if (config) {
			if (config.type) {
				URL += '&type=' + config.type;
			}
		}
		Request.openwin(URL);
	}
}

function UUID() {
	this.id = this.createUUID();
}
UUID.prototype.valueOf = function() {
	return this.id;
};
UUID.prototype.toString = function() {
	return this.id;
};
UUID.prototype.createUUID = function() {
	var dg = new Date(1582, 10, 15, 0, 0, 0, 0);
	var dc = new Date();
	var t = dc.getTime() - dg.getTime();
	var tl = UUID.getIntegerBits(t, 0, 31);
	var tm = UUID.getIntegerBits(t, 32, 47);
	var thv = UUID.getIntegerBits(t, 48, 59) + '1'; // version 1, security
	var csar = UUID.getIntegerBits(UUID.rand(4095), 0, 7);
	var csl = UUID.getIntegerBits(UUID.rand(4095), 0, 7);
	var n = UUID.getIntegerBits(UUID.rand(8191), 0, 7)
			+ UUID.getIntegerBits(UUID.rand(8191), 8, 15)
			+ UUID.getIntegerBits(UUID.rand(8191), 0, 7)
			+ UUID.getIntegerBits(UUID.rand(8191), 8, 15)
			+ UUID.getIntegerBits(UUID.rand(8191), 0, 15); // this last number
	return tl + tm + thv + csar + csl + n;
};
UUID.getIntegerBits = function(val, start, end) {
	var base16 = UUID.returnBase(val, 16);
	var quadArray = new Array();
	var quadString = '';
	var i = 0;
	for (i = 0; i < base16.length; i++) {
		quadArray.push(base16.substring(i, i + 1));
	}
	for (i = Math.floor(start / 4); i <= Math.floor(end / 4); i++) {
		if (!quadArray[i] || quadArray[i] == '')
			quadString += '0';
		else
			quadString += quadArray[i];
	}
	return quadString;
};
UUID.returnBase = function(number, base) {
	return (number).toString(base).toUpperCase();
};
UUID.rand = function(max) {
	return Math.floor(Math.random() * (max + 1));
};
/* UUID END */

$.hh.browser = {
	type : null,
	getWidth : function() {
		if (window.ActiveXObject) {
			if (document.documentElement == null) {
				return null;
			}
			return document.documentElement.clientWidth;
		} else {
			if (document.body == null) {
				return null;
			}
			return document.body.clientWidth;
		}
	},
	getHeight : function() {
		if (window.ActiveXObject) {
			if (document.documentElement == null) {
				return null;
			}
			return document.documentElement.clientHeight;
		} else {
			if (document.body == null) {
				return null;
			}
			return document.body.clientHeight;
		}
	}
}

if (window.navigator.userAgent.indexOf("MSIE") >= 1) {
	var g = window.navigator.userAgent.substring(30, 33);
	if (g == "6.0") {
		$.hh.browser.type = "IE6";
	} else if (g == "7.0") {
		$.hh.browser.type = "IE7";
	} else if (g == "8.0") {
		$.hh.browser.type = "IE8";
	} else if (g == "9.0") {
		$.hh.browser.type = "IE9";
	} else if (g == "10.") {
		$.hh.browser.type = "IE10";
	} else {
		$.hh.browser.type = "IEOther";
	}
} else {
	if (window.navigator.userAgent.indexOf("Firefox") >= 1) {
		$.hh.browser.type = "Firefox";
	} else if (window.navigator.userAgent.indexOf("Opera") >= 0) {
		$.hh.browser.type = "Opera";
	} else if (window.navigator.userAgent.indexOf("Chrome") >= 0) {
		$.hh.browser.type = "Chrome";
	} else if (window.navigator.userAgent.indexOf("Safari") >= 1) {
		$.hh.browser.type = "Safari";
	} else {
		$.hh.browser.type = "Other";
	}
}

$.hh.browser.isIE = $.hh.browser.type.indexOf('IE') > -1;

$.hh.browser.getMainWidth = function() {
	return $.hh.getRootFrame().$.hh.browser.getWidth();
};
$.hh.browser.getMainHeight = function() {
	return $.hh.getRootFrame().$.hh.browser.getHeight();
};

$.hh.nheight = function(dom, height, mheight) {
	if (height && height > 0) {
		var funObj = {
			fun : function(bodyHeight) {
				var hheight = bodyHeight - height;
				if (mheight >= hheight) {
					hheight = mheight;
				}
				var obj = {
					'height' : hheight
				}
				if (!this.dom.hasClass('cke_contents')) {
					obj['overflow'] = 'auto';
				}
				this.dom.css(obj);
				delete obj;
			},
			'dom' : dom,
			'zuixiao' : mheight
		};
		$.hh.setHeightMap[$.hh.getUUID()] = funObj;
		funObj.fun($.hh.browser.getHeight());
		delete funObj;
	}
}

$.hh.getConfig = function(input) {
	var config = input.attr('config');
	if (config) {
		config = $.hh.toObject('{' + config + '}');
	} else {
		var configVar = input.attr('configVar');
		if (configVar) {
			var configVarObj = eval(configVar);
			var obj = {};
			for (var p in configVarObj) {
				obj[p] = configVarObj[p];
			}

			config = obj;
			delete configVarObj;
			delete obj;
		}
	}
	if (config == null || config == '') {
		config = {};
	}
	if (input.data()) {
		$.extend(config, input.data());
	}
	config.xtype = input.attr("xtype");
	return config;
}

$.hh.validation = {
	validation : function(form) {
		form.validationEngine();
	},
	check : function(formId, callback) {
		if ($("#" + formId).validationEngine('validate')) {
			return callback($("#" + formId).getValue());
		} else {
			Dialog.errormsg("验证失败！！");
		}
	},
	getValidate : function(config) {
		var validate = '';
		if (config.required) {
			validate += 'required,';
		}
		if (config.maxSize) {
			validate += 'maxSize[' + config.maxSize + '],';
		}
		if (config.minSize) {
			validate += 'minSize[' + config.minSize + '],';
		}
		if (config.min || config.min == 0) {
			validate += 'min[' + config.min + '],';
		}
		if (config.max) {
			validate += 'max[' + config.max + '],';
		}
		if (config.email) {
			validate += 'custom[email],';
		}
		if (config.integer) {
			validate += 'custom[integer],';
		}
		if (config.number) {
			validate += 'custom[number],';
		}
		if (config.yw) {
			validate += 'custom[onlyLetterSp],';
		}
		if (config.image) {
			validate += 'custom[image],';
		}

		if (config.validateClass) {
			validate += config.validateClass + ','
		}
		if (validate) {
			validate = validate.substr(0, validate.length - 1);
			return 'validate[' + validate + ']';
		}
		return '';
	}
}
var Doing = {
	doingdivhtml : '<div id="doing" class="hh_overlay"></div>',
	doingdivhtml2 : '<div id="loading" class="hh_loading">'
			+ '<div class="loading-indicator">'
			+ '<img src="/hhcommon/images/loading/loadingred.gif"'
			+ ' 	style="margin-right: 8px;margin-top: 3px;  float: left; vertical-align: top;" />&nbsp;&nbsp;'
			+ '<a href="javascript:Doing.hide();">关闭</a>' + '</div>' + '</div>',
	doingdivhtml3 : '<img src="/hhcommon/images/loading/loadingred.gif" '
			+ ' 	style="margin-left: 18px;margin-top: 15px; float: left; vertical-align: top;" />',
	doingdiv : null,
	hide : function() {
		// var parneframe = $.hh.getRootFrame();
		$("#doing").fadeOut(100);
		$("#loading").fadeOut(100);
	},
	show : function() {
		// var parneframe = $.hh.getRootFrame();
		if (Doing.doingdiv == null) {
			Doing.doingdiv = $(Doing.doingdivhtml + Doing.doingdivhtml2);
			$("body").append(Doing.doingdiv);
		}
		$("#doing").fadeIn(200);
		$("#loading").fadeIn(200);
	}
}
var HeightSet = {
	cResizeTimer : null,
	triggerCustomHeightSet : function() {
		var a = $.hh.browser.getHeight();
		try {
			set_height(a);
		} catch (e) {
		}
	}
}
function set_height(height) {
	var isHidden2 = $("div[xtype=hh_main_content]").eq(0).css('overflow');
	$("div[xtype=hh_main_content]").eq(0).css( {
		'padding': '1',
		'overflow': isHidden2=='hidden'?'hidden':'auto',
		height:(height - 2)
	});
	
	var isHidden = $("div[xtype=hh_content]").eq(0).css('overflow');
	if(isHidden=='hidden'){
		$("div[xtype=hh_content]").eq(0).css( {
			'padding': '1',
			'overflow': 'hidden',
			height:(height - 42)
		});
	}else{
		$("div[xtype=hh_content]").eq(0).css( {
			'padding': '1',
			'overflow': 'auto',
			height:(height - 42)
		});
	}
	for (var p in $.hh.setHeightMap) {
		try {
			if ($.hh.setHeightMap[p]) {
				$.hh.setHeightMap[p].fun(height);
			}
		} catch (e) {
		}
	}
	setHeight(height);
}
function setHeight() {
}
function init() {
}
var hh_onload = window.onload;
window.onload = function() {
	if ($.hh.property) {
		for (var p in $.hh.property.execLoad) {
			$.hh.property.execLoad[p]();
		}
	}
	if (hh_onload) {
		hh_onload();
	}
};
// 用这个鼠标移开控件就会触发事件
$(document).ready(function() {
			$("[xtype=form]").each(function() {
						var config = $.hh.getConfig($(this));
						if ($(this).is('form')) {
							$.hh.validation.validation($(this), config);
						}
					});
		});
// 监听div宽度发生改变
(function($, h, c) {
	var a = $([]), e = $.resize = $.extend($.resize, {}), i, k = "setTimeout", j = "resize", d = j
			+ "-special-event", b = "delay", f = "throttleWindow";
	e[b] = 250;
	e[f] = true;
	$.event.special[j] = {
		setup : function() {
			if (!e[f] && this[k]) {
				return false
			}
			var l = $(this);
			a = a.add(l);
			$.data(this, d, {
						w : l.width(),
						h : l.height()
					});
			if (a.length === 1) {
				g()
			}
		},
		teardown : function() {
			if (!e[f] && this[k]) {
				return false
			}
			var l = $(this);
			a = a.not(l);
			l.removeData(d);
			if (!a.length) {
				clearTimeout(i)
			}
		},
		add : function(l) {
			if (!e[f] && this[k]) {
				return false
			}
			var n;
			function m(s, o, p) {
				var q = $(this), r = $.data(this, d);
				r.w = o !== c ? o : q.width();
				r.h = p !== c ? p : q.height();
				n.apply(this, arguments)
			}
			if ($.isFunction(l)) {
				n = l;
				return m
			} else {
				n = l.handler;
				l.handler = m
			}
		}
	};
	function g() {
		i = h[k](function() {
					a.each(function() {
								var n = $(this), m = n.width(), l = n.height(), o = $
										.data(this, d);
								if (m !== o.w || l !== o.h) {
									n.trigger(j, [o.w = m, o.h = l])
								}
							});
					g()
				}, e[b])
	}
})(jQuery, this);