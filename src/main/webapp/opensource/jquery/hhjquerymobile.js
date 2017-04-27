$.hh = $.hh || {};
$.hh.resourePath = '/hhcommon/opensource/jquery/';
$.hh.widgetList = ['pagelist', 'button', 'text', 'date', 'textarea',
		'radiogroup', 'checkgroup', 'check', 'selectTree', 'select',
		'multiselect', 'uploadpic', 'selectStaff', 'selectRole', 'tab',
		'asyncFile'];
$.hh.widgetFind = '';
for (var i = 0; i < $.hh.widgetList.length; i++) {
	if (i != 0) {
		$.hh.widgetFind += ',';
	}
	$.hh.widgetFind += '[xtype=' + $.hh.widgetList[i] + ']';
}

$.hh.getRequestParam = function(url2) {
	var url = location.search;
	if (url2) {
		url = url2;
	}
	var theRequest = new Object();
	if (url.indexOf("?") != -1) {
		var str = url.substr(url.indexOf("?") + 1);
		strs = str.split("&");
		for (var i = 0; i < strs.length; i++) {
			theRequest[strs[i].split("=")[0]] = strs[i].split("=")[1];
		}
	}
	return theRequest;
}

$.hh.popclose = function() {
	$('[data-role=popup]').popup('close');
}

$.hh.info = function(message, callback) {
	// Doing.show();
	setTimeout(function() {
		var workflow_minfo = $('#workflow_minfo');
		if (workflow_minfo.length == 0) {
			workflow_minfo = $('<div  id="workflow_minfo" data-role="popup"  data-theme="a" data-overlay-theme="a" class="ui-content" style="max-width:340px; padding-bottom:2em;">'
					+ '<p>'
					+ message
					+ '</p>'
					+ '<a onclick="$(\'#workflow_minfo\').popup(\'close\');" class="ui-shadow ui-btn ui-corner-all ui-btn-b ui-icon-check ui-btn-icon-left ui-btn-inline ui-mini">确定</a>'
					+ '</div>');
			$('body').append(workflow_minfo);
			workflow_minfo.popup();
		}
		workflow_minfo.find('p').html(message);
		workflow_minfo.find('a').eq(0).unbind('click');
		workflow_minfo.find('a').eq(0).click(callback);
		// Doing.hide();
		workflow_minfo.popup('open');
	}, 200);
}
$.hh.iframeHeight = function(iframeId) {
	var frm = window.frames[iframeId];
	if (frm.$) {
		var count = $('#' + iframeId).data('reheightcount');
		if (count && count != 0) {
			$('#' + iframeId).data('reheightcount', count - 1)
			setTimeout(function() {
						$.hh.iframeHeight(iframeId);
					}, 1000);
		}
		var height = frm.$('[data-role=page]').height();
		if (height != 0) {
			$('#' + iframeId).height(height);
		}
	}
}

$.hh.openmenu = function(config) {
	var buttonItems = config.buttonItems || [];
	if (buttonItems.length == 0) {
		return;
	}
	if (buttonItems.length == 1) {
		buttonItems[0].click();
		return;
	}
	var id = config.id || config.text || config.buttonItems[0].text;
	var div = $('#' + id);
	if (div.length == 0) {
		div = $('<div id="' + id
				+ '" data-role="panel" data-display="overlay"></div>');
		var ul = $('<ul data-role="listview" ></ul>');
		if (config.text) {
			var li1 = $('<li  data-role="list-divider" role="heading">'
					+ config.text + '</li>');
			if (config.icon) {
				li1.attr('data-icon', config.icon);
			}
			ul.append(li1);
		}
		for (var i = 0; i < buttonItems.length; i++) {
			var buttonItem = buttonItems[i];
			var li = $('<li  ><a data-ajax="false" href="javascript:void(0);">'
					+ (buttonItem.text || "") + '</a></li>');
			if (buttonItem.click) {
				li.find('a').click(buttonItem.click);
			}
			if (buttonItem.icon) {
				li.attr('data-icon', buttonItem.icon);
			}
			ul.append(li);
		}
		div.append(ul);
		$('[data-role=page]').append(div);
		div.panel();
		div.trigger('create');
		div.find('ul').listview('refresh');
	}
	div.panel('open');
}

$.hh.open = function(url, config) {
	setTimeout(function() {
		var rootWindow = $.hh.getRootFrame();
		var workflow_minfo = rootWindow.$('#hh_window_page');
		if (workflow_minfo.length == 0) {
			var time = $.hh.getTime();
			workflow_minfo = rootWindow
					.$('<div id="hh_window_page" data-role="popup"  data-theme="a" data-overlay-theme="a" class="ui-content" style="top:0px;"><div data-theme="b" data-role="header" role="banner" class="ui-header ui-bar-b"><a href="javascript:void(0)" onclick=$(\'#hh_window_page\').popup(\'close\'); class="ui-btn ui-corner-all ui-icon-delete ui-btn-icon-notext ui-btn-right" >关闭</a><h1 class="ui-title" role="heading" aria-level="1">窗口</h1></div></div>');
			var iframe = rootWindow
					.$('<iframe onload=""  height="100%" width="100%"  frameBorder=0 name="'
							+ time + '" id="' + time + '" src=""></iframe>');
			workflow_minfo.append(iframe);
			rootWindow.$('body').append(workflow_minfo);
			workflow_minfo.popup();
		}
		workflow_minfo.popup('open');
		rootWindow.$('#hh_window_page-popup').css('top',
				$(rootWindow).scrollTop() + 3);
		rootWindow.$('#hh_window_page-popup').css('width', '100%');
		rootWindow.$('#hh_window_page-popup').css('left', '5px');
		workflow_minfo.css('padding', '0px');

		var params = config || {};
		params.base_window_page = workflow_minfo;
		$.hh.setFrameParams(workflow_minfo.find('iframe').attr('id'), params);
		workflow_minfo.find('iframe').data('workflow_minfo', workflow_minfo);
		workflow_minfo.find('iframe').attr('src', url).load(function() {
			var time1 = $(this).attr('id');
			var title = null;
			if ($(this).attr('src') != 'about:blank') {
				title = rootWindow.frames[time1].$('title').text();
				if (title == null || title == '') {
					title = rootWindow.frames[time1].$('[data-role=header]')
							.text();
				}
				rootWindow.frames[time1].$('[data-role=header]').each(
						function() {
							if ($(this).attr('noremove') != "true") {
								$(this).remove();
							}
						});
			}
			if (title) {
				rootWindow.$('#' + time1).data('workflow_minfo')
						.find('[role=heading]').html(title);
			}
			rootWindow.$('#' + time1).height(rootWindow.$.hh.browser
					.getHeight()
					- 60);
		});
	}, 200);
}

$.hh.close = function() {
	$.hh.getIframeParams().base_window_page.find('a').click();
}

$.hh.qinfo = function(message, callback, callback2) {
	// Doing.show();
	setTimeout(function() {
		var workflow_minfo = $('#workflow_mqinfo');
		if (workflow_minfo.length == 0) {
			workflow_minfo = $('<div data-role="popup" id="workflow_mqinfo" data-theme="a" data-overlay-theme="b" class="ui-content" style="max-width:340px; padding-bottom:2em;">'
					+ '<h3>询问</h3>'
					+ '<p>'
					+ message
					+ '</p>'
					+ '<a onclick="$(\'#workflow_mqinfo\').popup(\'close\');" class="ui-shadow ui-btn ui-corner-all ui-btn-b ui-icon-check ui-btn-icon-left ui-btn-inline ui-mini">确定</a>'
					+ '<a onclick="$(\'#workflow_mqinfo\').popup(\'close\');" class="ui-shadow ui-btn ui-corner-all ui-btn-inline ui-mini">取消</a>'
					+ '</div>');
			$('body').append(workflow_minfo);
			workflow_minfo.popup();
		}
		workflow_minfo.find('p').html(message);
		workflow_minfo.find('a').eq(0).unbind('click');
		workflow_minfo.find('a').eq(0).click(callback);

		workflow_minfo.find('a').eq(1).unbind('click');
		workflow_minfo.find('a').eq(1).click(callback2);
		// Doing.hide();
		workflow_minfo.popup('open');
	}, 200);
}

$(function() {
			$.fn.render = function(configParams) {
				var config = $.hh.getConfig($(this));
				if (($(this).attr('id') == null || $(this).attr('id') == '')
						&& (config.name || config.id)) {
					if (config.id) {
						$(this).attr('id', 'span_' + config.id);
					} else {
						$(this).attr('id', 'span_' + config.name);
					}
				}
				config.widget = $(this);
				if (configParams && configParams != 'initRender') {
					$.extend(config, configParams);
				}
				$(this).data(config);
				if ((config.render == false || config.render == 'false')
						&& configParams == 'initRender') {
					return;
				}
				var xtype = config.xtype;

				if ($.hh[xtype] && $.hh[xtype].render) {
					$.hh[xtype].render($(this), config);
				}

				if (config.hidden == true) {
					$(this).hide();
				}
				if (config.disabled) {
					$(this).disabled();
				}
			}
			$.fn.renderAll = function() {
				$(this).find("[xtype]").each(function() {
							if ($(this).attr('xtype') != 'asyncFile') {
								$(this).render();
							}
						});
				$(this).find("[xtype=asyncFile]").each(function() {
							$(this).render();
						});
				$(this).render();
			}

			$.fn.setConfig = function(config) {
				for (var p in config) {
					$(this).data(p, config[p]);
				}
			}

			$.fn.getConfig = function(key) {
				var config = null;
				if (key) {
					config = $(this).data(key);
				} else {
					config = $(this).data();
				}
				return config;
			}

			$.fn.getWidget = function() {
				var xtype = this.attr('xtype');
				var config = $.hh.getConfig($(this));
				var span = $(this);
				if ($.hh[xtype] && $.hh[xtype].getWidget) {
					return $.hh[xtype].getWidget($(this), config);
				}
				var object = {
					widget : span
				};
				return object;
			};

			$.fn.getValue = function() {
				var xtype = this.attr('xtype');
				if ($.hh.widgetList.inArray(xtype)) {
					return $.hh.value.getValueBySpan(this);
				} else {
					return $.hh.value.getAreaValue(this);
				}
			};
			$.fn.setValue = function(value, params) {
				var xtype = this.attr('xtype');
				var config = $.hh.getConfig($(this));
				if (params) {
					$.extend(config, params);
				}
				if ($.hh.widgetList.inArray(xtype)) {
					$.hh.value.setValueBySpan(this, value, config);
					if (config.view == true) {
						this.toView(config);
					}
				} else {
					$.hh.value.setAreaValue(this, value || {}, config);
				}
			};

			$.fn.disabled = function() {
				var xtype = this.attr('xtype');
				var config = $.hh.getConfig($(this));
				if (xtype && $.hh[xtype].disabled) {
					$.hh[xtype].disabled($(this), config);
				}
			}

			$.fn.undisabled = function() {
				var xtype = this.attr('xtype');
				if (xtype && $.hh[xtype].undisabled) {
					$.hh[xtype].undisabled($(this), $.hh.getConfig($(this)));
				}
			};

			$.fn.getValueData = function() {
				var xtype = this.attr('xtype');
				return $.hh[xtype].getValueData($(this), $.hh
								.getConfig($(this)))
			}

			$("[xtype]").each(function() {
						if ($(this).attr('xtype') != 'asyncFile') {
							$(this).render('initRender');
						}
					});
			$("[xtype=asyncFile]").each(function() {
						$(this).render('initRender');
					});
			init();
		});
function init() {
}

$.hh.value = {
	getAreaValue : function(form) {
		var spanList = [];
		form.find($.hh.widgetFind).each(function() {
					spanList.push($(this));
				});
		var values = {};
		for (var i = 0; i < spanList.length; i++) {
			var span = spanList[i];
			var config = $.hh.getConfig(span);
			var value = $.hh.value.getValueBySpan(span, config);
			values[config.name] = value;
		}
		return values;
	},
	getValueBySpan : function(span, config) {
		if (config == null) {
			config = $.hh.getConfig(span);
		}
		var xtype = config.xtype;
		var value = '';
		if (span.getConfig('toView')) {
			return span.getConfig('value');
		}
		if ($.hh[xtype] && $.hh[xtype].getValue) {
			value = $.hh[xtype].getValue(span, config);
		}
		return value;
	},
	setAreaValue : function(form, values, formConfig) {
		form.find($.hh.widgetFind).each(function() {
					var config = $.hh.getConfig($(this));
					$.hh.value.setValueBySpan($(this), values[config.name],
							config);
					if (formConfig.view == true) {
						$(this).toView(config);
					}
				});
	},
	setValueBySpan : function(span, value, config) {
		if (typeof value == "object") {
			if ($.isEmptyObject(value)) {
				value = null;
			}
		}
		if (config == null) {
			config = $.hh.getConfig(span);
		}
		var xtype = config.xtype;
		span.setConfig({
					value : value
				});
		if ($.hh[xtype] && $.hh[xtype].setValue) {
			$.hh[xtype].setValue(span, config, value);
		}
	}
}

$.hh.radiogroup = {
	render : function(span, config) {
		span.empty();
		var dataList = config.data;

		var fieldset = $('<fieldset data-role="controlgroup" data-mini="true" ></fieldset>');

		if (config.horizontal) {
			fieldset.attr('data-type', 'horizontal');
		}

		if (config.text) {
			var requiredHtml = '';
			if (config.required) {
				requiredHtml = '<font color=red>*</font>';
			}
			fieldset.append('<legend>' + config.text + requiredHtml
					+ '</legend>');
		}
		var name = $.hh.getTime();
		if (dataList) {
			for (var i = 0; i < dataList.length; i++) {
				var data = dataList[i];
				var id = $.hh.getTime();
				var input = $('<input id="' + id + '" name="' + name
						+ '" value="' + (data.id) + '"  type="radio" />');
				input.data('span', span);
				if (config.onClick) {
					input.click(function() {
								config.onClick($(this).data('span'));
							});
				}
				if (config.onChange) {
					input.change(function() {
								config.onChange($(this).data('span'));
							});
				}
				var label = '<label for="' + id + '" >' + (data.name)
						+ '</label>';
				input.data('data', data);
				fieldset.append(input);
				fieldset.append(label);
			}
		}

		span.append(fieldset);
		span.trigger('create');
		fieldset.find('input').checkboxradio("refresh");
		var validate = $.hh.validation.getValidate(config);
		fieldset.find('input').addClass(validate);
		span.setValue(config.value || '');
	},
	getValue : function(span, config) {
		var value = span.find('input:radio:checked').val();
		return value;
	},
	setValue : function(span, config, value) {
		span.find("input[type=radio]").prop("checked", false);
		var input = span.find("input[type=radio][value=" + value + "]");
		input.prop("checked", true);
		input.checkboxradio("refresh");
	},
	disabled : function(span) {
		span.find('input').checkboxradio("disable");
	},
	getValueData : function(span) {
		return span.find('input:radio:checked').data("data");
	},
	getWidget : function(span, config) {
		return {
			loadData : function(cfg) {
				var confi = $.extend(config, cfg)
				span.data(confi);
				span.render();
			}
		};
	}
}

$.hh.checkgroup = {
	render : function(span, config) {
		span.empty();
		var dataList = config.data || [];

		var fieldset = $('<fieldset data-role="controlgroup" data-mini="true" ></fieldset>');

		if (config.horizontal) {
			fieldset.attr('data-type', 'horizontal');
		}

		if (config.text) {
			var requiredHtml = '';
			if (config.required) {
				requiredHtml = '<font color=red>*</font>';
			}
			fieldset.append('<legend>' + config.text + requiredHtml
					+ '</legend>');
		}
		var name = $.hh.getTime();
		for (var i = 0; i < dataList.length; i++) {
			var data = dataList[i];
			var id = $.hh.getTime();
			var input = $('<input id="' + id + '" name="' + name + '" value="'
					+ (data.id) + '"  type="checkbox" />');
			input.data('span', span);
			if (config.onClick) {
				input.click(function() {
							config.onClick($(this).data('span'));
						});
			}
			if (config.onChange) {
				input.change(function() {
							config.onChange($(this).data('span'));
						});
			}
			var label = '<label for="' + id + '" >' + (data.name) + '</label>';

			input.data('data', data);
			fieldset.append(input);
			fieldset.append(label);
		}

		span.append(fieldset);
		span.trigger('create');
		fieldset.find('input').checkboxradio("refresh");
		var validate = $.hh.validation.getValidate(config);
		fieldset.find('input').addClass(validate);
		span.setValue(config.value || '');
	},
	getValue : function(span, config) {
		var value = '';
		span.find("input:checkbox:checked").each(function() {
					value += $(this).val() + ","
				});
		if (value != '') {
			value = value.substr(0, value.length - 1);
		}
		return value;
	},
	setValue : function(span, config, value) {
		span.find("input[type=checkbox]").prop("checked", false);
		if (value) {
			value += '';
			var values = value.split(',');
			var text = '';
			for (var i = 0; i < values.length; i++) {
				var input = span.find("input[type=checkbox][value=" + values[i]
						+ "]");
				input.prop("checked", true);
				input.checkboxradio("refresh");
			}
		}
	},
	disabled : function(span) {
		span.find('input').checkboxradio("disable");
	},
	getValueData : function(span) {
		var dataList = [];
		span.find("input:checkbox:checked").each(function() {
					dataList.push($(this).data('data'));
				});
		return dataList;
	},
	getWidget : function(span, config) {
		return {
			loadData : function(cfg) {
				var confi = $.extend(config, cfg)
				span.data(confi);
				span.render();
			}
		};
	}
}

$.hh.check = {
	render : function(span, config) {
		span.empty();
		span.append('<label><input type="checkbox">' + (config.text || '')
				+ '</label>');
		span.trigger('create');
		span.find('input').checkboxradio("refresh");

		if (config.onClick) {
			span.find('input').click(function() {
						config.onClick($(this).data('span'));
					});
		}

		span.setValue(config.value || '');
	},
	getValue : function(span, config) {
		return span.find("input:checkbox").prop('checked') ? true : false;
	},
	setValue : function(span, config, value) {
		span.find("input[type=checkbox]").prop("checked", value ? true : false);
		span.find("input[type=checkbox]").checkboxradio("refresh");
	},
	disabled : function(span) {
		span.find('input').checkboxradio("disable");
	}
}

$.hh.select = {
	render : function(span, config) {
		span.empty();
		var id = $.hh.getTime();
		var dataList = config.data || [];
		var required = config.required;
		var defaultOption = config.defaultOption;
		var selectUniquity = config.selectUniquity;

		var div = $('<div inputtype="select" class="ui-field-contain"></div>');
		var fieldset = $('<select  id="' + id
				+ '" data-native-menu="false"></select>');

		fieldset.data('span', span);
		if (config.onChange) {
			fieldset.change(function() {
						config.onChange($(this).data('span'));
					});
		}

		if (config.onClick) {
			div.click(function() {
						return config.onClick($(this).data('span'));
					});
		}

		fieldset.append('<option value="" >请选择...</option>');
		var name = $.hh.getTime();
		for (var i = 0; i < dataList.length; i++) {
			var data = dataList[i];
			var selectstr = '';
			if ((defaultOption && defaultOption > 0 && i + 1 == defaultOption)
					|| (selectUniquity && dataList.length == 1)) {
				selectstr += ' selected=selected '
			}
			var option = $('<option value="' + data.id + '" ' + selectstr
					+ ' >' + data.name + '</option>');
			option.data('data', data);
			fieldset.append(option);
		}
		if (config.text) {
			if (required) {
				div.append('<label for="' + id + '" class="select">'
						+ config.text
						+ '<span style="color:red;">*</span></label>');
			} else {
				div.append('<label for="' + id + '" class="select">'
						+ config.text + '</label>');
			}
		}
		div.append(fieldset);
		span.append(div);
		span.trigger('create');
		fieldset.selectmenu("refresh");
		if (config.value) {
			span.setValue(config.value || '');
		}
		var validate = $.hh.validation.getValidate(config);
		fieldset.addClass(validate);
		span.find('.ui-select').css('white-space', 'normal');
	},
	getValue : function(span, config) {
		var value = span.find('option:selected').attr('value');
		return value;
	},
	getValueName : function(span, config) {
		var value = span.find('option:selected').text();
		return value;

	},
	setValue : function(span, config, value) {
		span.find('select').val(value);
		span.find('select').selectmenu("refresh");
	},
	disabled : function(span, config) {
		span.find('select').selectmenu('disable');
	},
	getValueData : function(span, config) {
		return span.find('option:selected').data('data');
	},
	getWidget : function(span, config) {
		return {
			loadData : function(cfg) {
				var confi = $.extend(config, cfg)
				span.data(confi);
				span.render();
			},
			selectIndex : function(index) {
				span.setValue($(span.find('option')[parseInt(index) + 1])
						.attr('value'));
			}
		};
	}
}

$.hh.multiselect = {
	render : function(span, config) {
		span.empty();
		var id = $.hh.getTime();
		var dataList = config.data || [];
		var required = config.required;
		var defaultOption = config.defaultOption;
		var selectUniquity = config.selectUniquity;
		var div = $('<div  inputtype="select" class="ui-field-contain"></div>');
		var fieldset = $('<select  id="'
				+ id
				+ '" multiple="multiple" data-native-menu="false" data-icon="grid" data-iconpos="left"></select>');

		fieldset.data('span', span);
		if (config.onChange) {
			fieldset.change(function() {
						config.onChange($(this).data('span'));
					});
		}
		if (config.onClick) {
			div.click(function() {
						return config.onClick($(this).data('span'));
					});
		}
		fieldset.append('<option >请选择...</option>');
		var name = $.hh.getTime();
		for (var i = 0; i < dataList.length; i++) {
			var data = dataList[i];
			var selectstr = '';
			if ((defaultOption && defaultOption > 0 && i + 1 == defaultOption)
					|| (selectUniquity && dataList.length == 1)) {
				selectstr += ' selected=selected '
			}
			var option = $('<option value="' + data.id + '" ' + selectstr
					+ ' >' + data.name + '</option>');
			option.data('data', data);
			fieldset.append(option);
		}
		if (config.text) {
			if (required) {
				div.append('<label for="' + id + '" class="select">'
						+ config.text
						+ '<span style="color:red;">*</span></label>');
			} else {
				div.append('<label for="' + id + '" class="select">'
						+ config.text + '</label>');
			}
		}
		div.append(fieldset);
		span.append(div);
		span.trigger('create');
		fieldset.selectmenu("refresh");

		if (config.value) {
			span.setValue(config.value || '');
		}

		var validate = $.hh.validation.getValidate(config);
		fieldset.addClass(validate);

	},
	getValue : function(span, config) {
		var value = span.find('select').val();
		return value;
	},
	getValueText : function(span, config) {
		var dataList = this.getValueData(span, config);
		var textstr = '';
		for (var i = 0; i < dataList.length; i++) {
			var data = dataList[i];
			textstr += data.name + ',';
		}
		if (textstr) {
			textstr = textstr.substr(0, textstr.length - 1);
		}
		return textstr;
	},
	getValueData : function(span, config) {
		var dataList = [];
		span.find('option:selected').each(function() {
					dataList.push($(this).data('data'));
				});
		return dataList;
	},
	setValue : function(span, config, value) {

		span.find('select').val([]);
		if (value) {
			var valueArr = value.split(",");
			span.find('select').val(valueArr);
		}
		span.find('select').selectmenu("refresh");
	},
	disabled : function(span, config) {
		span.find('select').selectmenu('disable')
	},
	getWidget : function(span, config) {
		return {
			loadData : function(cfg) {
				var confi = $.extend(config, cfg)
				span.data(confi);
				span.render();
			},
			selectIndex : function(index) {
				var indexs = (index + "").split(',');
				var values = '';
				for (var i = 0; i < indexs.length; i++) {
					var idx = indexs[i];
					values += $(span.find('option')[parseInt(idx) + 1])
							.attr('value')
							+ ',';
				}
				if (values) {
					values = values.substr(0, values.length - 1);
				}
				span.setValue(values);
			}
		};
	}
}

$.hh.date = {
	render : function(span, config) {
		span.empty();

		span.append($input);

		var div = $('<div class="ui-field-contain"></div>');
		var id = $.hh.getTime();
		if (config.text) {
			var requiredHtml = '';
			if (config.required) {
				requiredHtml = '<font color=red>*</font>';
			}
			div.append('<label for="' + id + '">' + config.text + requiredHtml
					+ '</label>');
		}

		var $input = $('<input  data-clear-btn="true" type="text" data-role="datebox" id="'
				+ id + '" />');
		div.append($input);
		span.append(div);

		var validate = $.hh.validation.getValidate(config);
		$input.addClass(validate);
		$input.textinput();
		var dateFormat = config.dateFormat || 'yyyy-mm-dd';
		dateFormat = dateFormat.replace(/hh/g, "HH");

		var datatimeConfig = {};
		var endDate = null;
		if (config.endDate) {
			endDate = $.hh.stringToDate(config.endDate);
			datatimeConfig.maxDate = endDate;
		}
		var startDate = null;
		if (config.startDate) {
			startDate = $.hh.stringToDate(config.startDate);
			datatimeConfig.minDate = startDate;
		}

		if (config.onFocus) {
			$input.focus(function() {
						return config.onFocus($(this).data('span'));
					});
		}

		if (dateFormat.indexOf(' ') > -1) {
			datatimeConfig.dateFormat = dateFormat.substr(0, dateFormat
							.indexOf(' '));
			$input.mobiscroll().datetime(datatimeConfig);
			datatimeConfig.dateType = 'datetime';
		} else if (dateFormat.indexOf('HH') > -1) {
			datatimeConfig.dateFormat = dateFormat.replace(/m/g, "i");
			$input.mobiscroll().time(datatimeConfig);
			datatimeConfig.dateType = 'time';
		} else {
			datatimeConfig.dateFormat = dateFormat;
			$input.mobiscroll().date(datatimeConfig);
			datatimeConfig.dateType = 'date';
		}
		span.data('datatimeConfig', datatimeConfig);
		$input.data('span', span);
		if (config.onClick) {
			$input.click(function() {
						return config.onClick($(this).data('span'));
					});
		}
		if (config.onChange) {
			$input.change(function() {
						return config.onChange($(this).data('span'));
					});
		}
		if ((endDate || startDate) && config.value) {
			var tempValue = $.hh.stringToDate(config.value);

			if (tempValue > endDate && endDate) {
				config.value = '';
			}
			if (tempValue < startDate && startDate) {
				config.value = '';
			}
		}
		span.setValue(config.value || '');
	},
	getValue : function(span, config) {
		var value = span.find('input').val();
		return value;
	},
	setValue : function(span, config, value) {
		span.find('input').val(value);
	},
	disabled : function(span) {
		span.find('input').textinput('disable');
	}
}

$.hh.text = {
	render : function(span, config) {
		span.empty();
		var div = $('<div class="ui-field-contain"></div>');
		var id = $.hh.getTime();
		if (config.text) {
			var requiredHtml = '';
			if (config.required) {
				requiredHtml = '<font color=red>*</font>';
			}
			div.append('<label for="' + id + '" >' + config.text + requiredHtml
					+ '</label>');
		}
		var $input = null;
		if (config.password) {
			$input = $('<input  data-clear-btn="true" type="password" id="'
					+ id + '" />');
		} else {
			$input = $('<input  data-clear-btn="true" type="text" id="' + id
					+ '" />');
		}
		if (config.placeholder) {
			$input.attr('placeholder', config.placeholder);
		}

		$input.data('span', span);
		if (config.onClick) {
			$input.click(function() {
						config.onClick($(this).data('span'));
					});
		}
		if (config.onBlur) {
			$input.blur(function() {
						config.onBlur($(this).data('span'));
					});
		}
		if (config.onFocus) {
			$input.focus(function() {
						config.onFocus($(this).data('span'));
					});
		}
		if (config.onDblClick) {
			$input.dblclick(function() {
						config.onDblClick($(this).data('span'));
					});
		}

		div.append($input);
		span.append(div);
		var validate = $.hh.validation.getValidate(config);
		$input.addClass(validate);

		$input.textinput();
		if (config.suffix) {
			div
					.find('input')
					.next()
					.after('<span class="ui-input-clear ui-btn ui-mini ui-corner-all" style="margin-right:20px">'
							+ config.suffix + '</span>');
		}
		span.setValue(config.value || '');
	},
	getValue : function(span, config) {
		var value = span.find('input').val();
		if (config.integer) {
			if ($.isNumeric(value)) {
				value = parseInt(value);
			} else {
				value = 0;
			}
		}
		return value;
	},
	setValue : function(span, config, value) {
		span.find('input').val(value);
	},
	disabled : function(span) {
		span.find('input').textinput('disable');
	}
}

$.hh.button = {
	render : function(span, config) {
		span.empty();
		var $input = $('<input type="button" value="'
				+ (config.text || '&nbsp;') + '"  />');
		$input.click(function() {
					if (config.onClick) {
						config.onClick();
					}
				});
		if (config.icon) {
			$input.attr('data-icon', config.icon);
		}
		span.append($input);
		$input.button();
	},
	disabled : function(span) {
		span.find('input').button('disable');
	},
	undisabled : function(span) {
		span.find('input').button('enable');
	}
}

$.widget("mobile.navbar", $.mobile.widget, {
	options : {
		iconpos : "top",
		grid : null,
		initSelector : ":jqmData(role='navbar')"
	},

	_create : function() {
		var t = this;
		t.refresh();
	},
	refresh : function() {
		var $navbar = this.element, $navbtns = $navbar.find("a"), iconpos = $navbtns
				.filter(":jqmData(icon)").length
				? this.options.iconpos
				: undefined;

		$navbar.addClass("ui-navbar ui-mini").attr("role", "navigation")
				.find("ul").jqmEnhanceable().grid({
							grid : this.options.grid
						});

		$navbtns.buttonMarkup({
					corners : false,
					shadow : false,
					inline : true,
					iconpos : iconpos
				});

		$navbar.delegate("a", "vclick", function(event) {
					if (!$(event.target).hasClass("ui-disabled")) {
						$navbtns.removeClass($.mobile.activeBtnClass);
						$(this).addClass($.mobile.activeBtnClass);
					}
				});

		// Buttons in the navbar with ui-state-persist class should regain their
		// active state before page show
		$navbar.closest(".ui-page").bind("pagebeforeshow", function() {
			$navbtns.filter(".ui-state-persist")
					.addClass($.mobile.activeBtnClass);
		});
	}
});
$.hh.tab = {
	render : function(span, config) {
		span.empty();
		var tab = $('<div data-role="tabs" ></div>');
		var navbar = $('<div data-role="navbar"></div>');
		var ul = $('<ul></ul>');
		navbar.append(ul);
		tab.append(navbar);
		var dataList = config.data || [];
		for (var i = 0; i < dataList.length; i++) {
			var data = dataList[i];
			data.i = i;
			this.addTab(tab, ul, data);
		}

		span.append(tab);
		span.trigger('create');
		tab.tabs('refresh');
		if (config.defaultIndex) {
			span.find('[indexa=' + config.defaultIndex + ']').click();
		}
		if (config.hideTabTitle) {
			span.find('[role=tablist]').hide();
		}
	},
	addTab : function(tab, ul, data) {
		var urlType = data.urlType;
		var title = data.title || '';
		var url = data.url || '';
		if (data.countCell && $('[cellName=c' + data.countCell + ']').text()) {
			title += '<font color=red>('
					+ $('[cellName=c' + data.countCell + ']').text()
					+ ')</font>';
		}
		if (data.newCell && $('[cellName=c' + data.newCell + ']').text()) {
			title += '<img src="/common/images/icons/new.gif" />';
		}
		var ahtml = ' id="' + (data.id) + '_title" countCell="c'
				+ data.countCell + '" newCell="c' + data.newCell + '" title="'
				+ (data.title || '') + '" ';

		if (urlType == 'RANGE') {
			var li = $('<li><a tabida="' + (data.id || '') + '" indexa="'
					+ data.i + '" href="#' + url + '" data-ajax="false" '
					+ ahtml + '>' + title + '</a></li>');
			ul.append(li);
			var layout = $('[layoutid=' + url + ']');
			layout.attr('id', url);
			tab.append(layout);
		} else {
			var time = $.hh.getTime();
			var href = data.url;
			if (data.urlFun) {
				href = data.urlFun();
			}
			var li = $('<li><a tabida="' + (data.id || '') + '" indexa="'
					+ data.i + '" href="#' + time + '" data-ajax="false" '
					+ ahtml + '>' + title + '</a></li>');
			ul.append(li);
			var iframe = $('<iframe onload="" scrolling="no" height="100%" width="100%"  frameBorder=0 name="'
					+ time + '" id="' + time + '" src=""></iframe>');
			li.find('a').data({
						'iframe' : iframe,
						'href' : href,
						'time' : time
					});
			li.find('a').click(function() {
				$(this).data('iframe').attr('src', $(this).data('href'));
				var time1 = $(this).data('time');
				$(this).data('iframe').load(function() {
							try {
								setTimeout(function() {
											$('#' + time1).data(
													'reheightcount', 10);
											$.hh.iframeHeight(time1)
										}, 300);
							} catch (e) {
							}
						});
			});
			tab.append(iframe);
		}
	},
	getWidget : function(span, config) {
		return {
			add : function(cfg) {
				var tab = span.find('[data-role=tabs]');
				var ul = span.find('ul');
				$.hh.tab.addTab(tab, ul, cfg);
				span.trigger('create');
				span.find('[data-role=navbar]').navbar('refresh');
				tab.tabs('refresh');
				if (cfg.activate) {
					ul.find('li').last().find('a').click();
				}
			}
		};
	}
}

$.hh.buttons = {
	render : function(span, config) {
		span.empty();
		var buttonItems = config.buttonItems || [];
		var div = $('<div data-role="navbar" ></div>');
		var ul = $('<ul></ul>');

		div.append(ul);

		for (var i = 0; i < buttonItems.length; i++) {
			var buttonItem = buttonItems[i];
			var button = $('<li><a href="javascript:void(0)">'
					+ (buttonItem.text || '') + '</a></li>');
			if (buttonItem.click) {
				button.click(buttonItem.click);
			}
			if (buttonItem.icon) {
				button.find('a').attr('data-icon', buttonItem.icon);
			}
			ul.append(button);
		}
		span.append(div);
		span.trigger('create');
		div.navbar('refresh');
	}
}

$.hh.textarea = {
	render : function(span, config) {
		span.empty();

		var div = $('<div class="ui-field-contain"></div>');
		var id = $.hh.getTime();
		if (config.text) {
			var requiredHtml = '';
			if (config.required) {
				requiredHtml = '<font color=red>*</font>';
			}
			div.append('<label for="' + id + '">' + config.text + requiredHtml
					+ '</label>');
		}
		var $input = $('<textarea  data-clear-btn="true" id="' + id + '"  />');

		$input.data('span', span);
		if (config.onClick) {
			$input.click(function() {
						config.onClick($(this).data('span'));
					});
		}
		if (config.onChange) {
			$input.change(function() {
						config.onChange($(this).data('span'));
					});
		}

		if (config.placeholder) {
			$input.attr('placeholder', config.placeholder);
		}

		div.append($input);
		span.append(div);

		var validate = $.hh.validation.getValidate(config);
		$input.addClass(validate);
		$input.textinput();
		span.setValue(config.value || '');
	},
	getValue : function(span, config) {
		var value = span.find('textarea').val();
		return value;
	},
	setValue : function(span, config, value) {
		span.find('textarea').val(value);
	},
	disabled : function(span) {
		span.find('textarea').textinput('disable');
	}
}

$.hh.selectTree = {
	render : function(span, config) {
		span.empty();

		var input = $('<input type="text" data-role="none" hhtype="validation" />');
		input.hide();

		var validate = $.hh.validation.getValidate(config);
		input.addClass(validate);
		span.append(input);

		span.data('idKey', 'id');
		span.data('nameKey', 'name');

		var dataListTemp = config.data || [];
		var url = config.url;

		var ulid = $.hh.getTime();
		span.attr('selectTreeId', ulid);
		var ul = $('<ul data-role="listview" data-filter="false" data-inset="true" ></ul>');

		if (config.text) {
			var requiredHtml = '';
			if (config.required) {
				requiredHtml = '<font color=red>*</font>';
			}
			var text = $('<li data-role="list-divider">'
					+ (config.text + requiredHtml) + '</li>');
			ul.append(text);
		}

		var li = $('<li data-icon="false"><a type="item" href="javascript:void(0);"><strong type="nameStrong">请选择...</strong></a></li>');
		li.find('a').data('span', span);
		li.find('a').click(function() {
					$.hh.open($.hh.resourePath
									+ 'hhmobile/page/selectTreePage.html', {
								span : $(this).data('span')
							});
				});

		ul.append(li);
		span.append(ul);
		span.trigger('create');
		ul.listview('refresh');

		if (dataListTemp.length == 0 && url) {
			Request.request(url, {
						data : config.params,
						callback : function(result) {
							$.hh.selectTree.loadData_(span, result, config);
						}
					});
		} else {
			this.loadData_(span, dataListTemp, config);
		}
	},
	loadData_ : function(span, dataListTemp) {
		var config = span.data();
		if (config.resultPro && !$.isArray(dataListTemp)) {
			dataListTemp = dataListTemp[config.resultPro];
		}
		var dataList = [];
		$.hh.tree.treeListToDataList(dataListTemp, dataList);
		span.data('data', dataList);
		var dataMap = {};
		for (var i = 0; i < dataList.length; i++) {
			dataMap[dataList[i][span.data('idKey')]] = dataList[i];
		}
		span.data('dataMap', dataMap);

		span.setValue(config.value || '');
	},
	getValue : function(span, config) {
		return span.data('value');
	},
	getValueData : function(span, config) {
		var valuedata = [];
		if (span.data('valueData')) {
			valuedata = span.data('valueData');
		}
		if (config.selectType != 'check') {
			if (valuedata.length > 0) {
				return valuedata[0];
			} else {
				return null;
			}
		}
		return valuedata;
	},
	setValue : function(span, config, value) {
		if (config.async == true) {
			$.hh.selectStaff.setValue(span, config, value);
		} else {
			if (value) {
				var valueData = [];
				var textStr = '';
				var dataMap = span.data('dataMap');
				var nameKey = span.data('nameKey');
				var valueList = value.split(',');
				if (dataMap) {
					for (var i = 0; i < valueList.length; i++) {
						if (dataMap[valueList[i]]) {
							valueData.push(dataMap[valueList[i]]);
							textStr += dataMap[valueList[i]][nameKey] + ',';
						}
					}
					if (textStr) {
						textStr = textStr.substr(0, textStr.length - 1);
						span.find('[type="nameStrong"]').html(textStr);
					} else {
						span.find('[type="nameStrong"]').html('请选择...');
					}
					span.data('valueData', valueData);
				}
			} else {
				span.data('valueData', null);
				span.find('[type="nameStrong"]').html('请选择...');
			}
			span.data('value', value);
			span.find('input[type="text"]').val(value);
		}
	},
	disabled : function(span) {
		// span.find('a').attr('href', 'javascript:void(0);');
		span.find('a').addClass('ui-state-disabled');
	},
	undisabled : function(span) {
		span.find('a').removeClass('ui-state-disabled');
	},
	getWidget : function(span, config) {
		return {
			loadData : function(cfg) {
				var confi = $.extend(config, cfg)
				span.data(confi);
				span.render();
			}
		};
	}
}

$.hh.selectStaff = {
	render : function(span, config) {
		span.empty();

		var input = $('<input type="text" data-role="none" hhtype="validation" />');
		input.hide();

		var validate = $.hh.validation.getValidate(config);
		input.addClass(validate);
		span.append(input);

		span.data('idKey', 'id');
		span.data('nameKey', 'name');
		span.data('config', config);
		var ulid = $.hh.getTime();
		span.attr('selectTreeId', ulid);
		var ul = $('<ul data-role="listview" data-filter="false" data-inset="true" ></ul>');
		if (config.text) {
			var requiredHtml = '';
			if (config.required) {
				requiredHtml = '<font color=red>*</font>';
			}
			var text = $('<li data-role="list-divider">'
					+ (config.text + requiredHtml) + '</li>');
			ul.append(text);
		}

		var pageId = $('[data-role=page]').attr('id');
		span.data('contextPath', config.contextPath);

		var li = $('<li data-icon="false"><a type="item" href="javascript:void(0);"><strong type="nameStrong">请选择...</strong></a></li>');
		li.find('a').data('span', span);
		li.find('a').click(function() {
					$.hh.open($.hh.resourePath
									+ 'hhmobile/page/selectStaff.html', {
								span : $(this).data('span')
							});
				});

		ul.append(li);
		span.append(ul);
		span.trigger('create');
		ul.listview('refresh');
		span.setValue(config.value || '');

	},
	getValue : function(span, config) {
		return span.data('value');
	},
	getValueData : function(span, config) {
		var valuedata = [];
		if (span.data('valueData')) {
			valuedata = span.data('valueData');
		}
		if (config.selectType != 'check') {
			if (valuedata.length > 0) {
				return valuedata[0];
			} else {
				return null;
			}
		}
		return valuedata;
	},
	setValue : function(span, config, value) {
		if (value) {
			if (value.text) {
				span.find('[type="nameStrong"]').html(value.text);
			} else {
				span.find('[type="nameStrong"]').html('请选择...');
			}
			if (value.data) {
				span.data('valueData', value.data);
			} else if (value.id) {
				var ids = value.id.split(',');
				var texts = value.text.split(',');
				var valuedata = [];
				for (var i = 0; i < ids.length; i++) {
					valuedata.push({
								id : ids[i],
								name : texts[i]
							});
				}
				span.data('valueData', valuedata);
			}
			span.data('value', value.id);
			span.find('input[type="text"]').val(value.id);
		} else {
			span.data('valueData', null);
			span.data('value', '');
			span.find('input[type="text"]').val('');
			span.find('[type="nameStrong"]').html('请选择...');
		}
	},
	disabled : function(span) {
		span.find('a').addClass('ui-state-disabled');
	},
	undisabled : function(span) {
		span.find('a').removeClass('ui-state-disabled');
	}
}

$.hh.selectRole = {
	render : function(span, config) {
		span.empty();
		var input = $('<input type="text" data-role="none" hhtype="validation" />');
		input.hide();
		var validate = $.hh.validation.getValidate(config);
		input.addClass(validate);
		span.append(input);
		span.data('idKey', 'id');
		span.data('nameKey', 'name');
		span.data('config', config);
		var ulid = $.hh.getTime();
		span.attr('selectTreeId', ulid);
		var ul = $('<ul data-role="listview" data-filter="false" data-inset="true" ></ul>');
		if (config.text) {
			var requiredHtml = '';
			if (config.required) {
				requiredHtml = '<font color=red>*</font>';
			}
			var text = $('<li data-role="list-divider">'
					+ (config.text + requiredHtml) + '</li>');
			ul.append(text);
		}
		var pageId = $('[data-role=page]').attr('id');
		span.data('contextPath', config.contextPath);

		var li = $('<li data-icon="false"><a type="item" href="javascript:void(0);"><strong type="nameStrong">请选择...</strong></a></li>');
		li.find('a').data('span', span);
		li.find('a').click(function() {
					$.hh.open($.hh.resourePath
									+ 'hhmobile/page/selectRole.html', {
								span : $(this).data('span')
							});
				});

		ul.append(li);
		span.append(ul);
		span.trigger('create');
		ul.listview('refresh');
		span.setValue(config.value || '');
	},
	getValue : function(span, config) {
		return span.data('value');
	},
	getValueData : function(span, config) {
		var valuedata = [];
		if (span.data('valueData')) {
			valuedata = span.data('valueData');
		}
		if (config.selectType != 'check') {
			if (valuedata.length > 0) {
				return valuedata[0];
			} else {
				return null;
			}
		}
		return valuedata;
	},
	setValue : function(span, config, value) {
		if (value) {
			if (value.text) {
				span.find('[type="nameStrong"]').html(value.text);
			} else {
				span.find('[type="nameStrong"]').html('请选择...');
			}
			span.data('valueData', value.data);
		} else {
			span.data('valueData', null);
			span.find('[type="nameStrong"]').html('请选择...');
		}
		span.data('value', value.id);
		span.find('input[type="text"]').val(value);
	},
	disabled : function(span) {
		span.find('a').addClass('ui-state-disabled');
	},
	undisabled : function(span) {
		span.find('a').removeClass('ui-state-disabled');
	}
}
$.hh.uploadpic = {
	render : function(span, config) {
		span.empty();
		var input = $('<input type="text" data-role="none" hhtype="validation" />');
		input.hide();
		var validate = $.hh.validation.getValidate(config);
		input.addClass(validate);
		span.append(input);

		span.data("uploadPicUrl", config.uploadPicUrl);
		span.data("picvalidate_size_msg", config.fileSize);
		var ulid = $.hh.getTime();
		span.attr('uploadPicId', ulid);
		var ul = $('<ul data-role="listview" data-filter="false" data-inset="true" ></ul>');
		if (config.text) {
			var requiredHtml = '';
			if (config.required) {
				requiredHtml = '<font color=red>*</font>';
			}
			var text = $('<li data-role="list-divider"  >'
					+ (config.text + requiredHtml) + '</li>');
			ul.append(text);
		}
		var pageId = $('[data-role=page]').attr('id');

		var li = $('<li data-icon="false" style="vertical-align:top;margin:0;padding:0" ></li>');

		if (config.disabled == false) {
			var deletePicUrl = config.deleteUrl;
			// 添加图片按钮
			var divButton = $('<div data-inline="true" style="text-align:center;"></div>');
			// 清除图片按钮
			var clearPic = $('<a href="javascript:void(0);" class="ui-shadow ui-btn ui-corner-all ui-btn-inline" data-transition="pop" style="font-size:12px;">清空</a>');
			clearPic.data('span', span);
			clearPic.data('deletePicUrl', deletePicUrl);
			clearPic.click(function() {
						var value = $(this).data('span').getValue();
						if (value) {
							$.hh.uploadpic.deletePic($(this)
									.data('deletePicUrl')
									+ value);
							span.find('img').attr('src', '');
							span.data('value', '');
						}
					});

			var selectPic = $('<a href="javascript:void(0);" class="ui-shadow ui-btn ui-corner-all ui-btn-inline" data-transition="pop" style="font-size:12px;" >选择图片</a>');
			selectPic.data('span', span);
			selectPic.click(function() {
						$.hh.open($.hh.resourePath
										+ 'hhmobile/page/muploadpicwin.html', {
									span : $(this).data('span')
								});
					});

			divButton.append(selectPic);
			divButton.append(clearPic);
			li.append(divButton);
			ul.append(li);
		}

		var imgDiv = $('<div style="padding-top:3px;text-align:center;height:'
				+ config.height + 'px;"><img  width="' + config.width
				+ '" height="' + config.height + '" src=""  /></div>');
		imgDiv.find('img').click(function() {
					// $.hh.info('<a href="#" data-rel="back" class="ui-btn
					// ui-corner-all ui-shadow ui-btn-a ui-icon-delete
					// ui-btn-icon-notext ui-btn-right">Close</a><img
					// width="'+($.hh.browser.getWidth()-100)+'"
					// src="'+$(this).attr('src')+'" alt="Photo landscape">');
				});
		li.prepend(imgDiv);
		span.append(ul);
		span.trigger('create');
		ul.listview('refresh');
		span.setValue(config.value || '');

	},
	getValue : function(span, config) {
		return span.data('value');
	},
	setValue : function(span, config, value) {

		if (value) {
			var readerUrl = config.readerUrl + value;
			span.find('img').attr('src', readerUrl);
			span.data('value', value);
			span.find('input[type="text"]').val(value);
		}

	},
	deletePic : function(url) {
		$.post(url, null, function(result) {
				}, "json");
	},
	disabled : function(span) {
		span.find('a').addClass('ui-state-disabled');
	},
	undisabled : function(span) {
		span.find('a').removeClass('ui-state-disabled');
	}
}

$.hh.asyncFile = {
	render : function(span, config) {
		span.empty();
		// 已上传附件个数
		var fileNum = 0;
		span.attr('fileNumber', fileNum);
		// 是否上传类别
		var uploadFileType = false;
		var id = $.hh.getTime();
		var asyncFileId = "file" + id;
		span.data('asyncFileId', asyncFileId);
		var ul = $('<ul data-role="listview" data-filter="false" data-inset="true" ></ul>');
		if (config.text) {
			var requiredHtml = '';
			if (config.required) {
				requiredHtml = '<font color=red>*</font>';
			}
			var text = $('<li data-role="list-divider">'
					+ (config.text + requiredHtml) + '</li>');
			ul.append(text);
		}
		if (config.uploadFileType) {
			uploadFileType = true;
		}
		// 下拉框 start
		var dataList = config.uploadFileTypeData || [];
		var selectSpan = $('<span xtype="select"></span>');
		selectSpan.data('data', dataList);
		// 下拉框 end
		var attachmentHtml = '<div class="box1"><div class="box_topcenter"><div class="box_topleft"><div class="box_topright"></div></div></div><div class="box_middlecenter"><div class="box_middleleft"><div class="box_middleright"><div class="boxContent" style="overflow: visible;">'
				+ '<div type="filelist" width="100%" ></div>';
		if (config.uploadFileType && config.type == "upload") {
			attachmentHtml += '<div divtype="fileType"></div>';
		}
		attachmentHtml += '</div></div></div></div><div class="box_bottomcenter"><div class="box_bottomleft"><div class="box_bottomright"></div></div></div></div>';
		if (config.type == "upload") {
			attachmentHtml += '<div type="filediv" style="margin-top:3px;font-weight:bold;overflow: hidden; position: relative; direction: ltr;display:block; border:1px solid ; border-radius: 4px; background: none repeat scroll 0 0 #F6F6F6; width:64px; height:19px; text-shadow: 0 1px 0 #F3F3F3;  font-size: 14px; color: #333333; border-color:#DDDDDD; border-radius: 6px; cursor:pointer;padding:5px;" >'
					+ ' 附件上传<input style="filter:alpha(opacity=0); -moz-opacity:0; -khtml-opacity: 0; opacity: 0; margin: 0px;  padding: 0px;  top: 0px;  right: 0px;  font-family: Arial;  font-size: 14px;  position: absolute;  cursor: pointer;" tabIndex="-1" keepDefaultStyle="true" name="'
					+ asyncFileId
					+ '" id="'
					+ asyncFileId
					+ '"  type="file" /> </div>';
		}
		var li = $('<li uploadbtn=true data-icon="false"></li>');

		attachmentHtml = $(attachmentHtml);
		if (config.uploadFileType && config.type == "upload") {
			attachmentHtml.find('[divtype=fileType]').append(selectSpan);
		}
		li.append(attachmentHtml);
		ul.append(li);
		span.append(ul);
		span.trigger('create');
		ul.listview('refresh');
		span.setValue(config.value || '');
		if (config.uploadFileType && config.type == "upload") {
			selectSpan.render();
		}
		var fileInput = span.find('input:file');
		fileInput.data({
					span : span,
					config : config
				});
		fileInput.change(function() {
					$.hh.asyncFile.asyncFileupload($(this).data('span'),
							$(this).data('config'));
				});
		$.hh.asyncFile.loadAttachment(span, config);
	},
	asyncFileupload : function(span, config) {
		config = config || span.data('data');
		// 允许上传附件个数
		var fileTopLimit = config.fileTopLimit;
		var uploadUrl = config.uploadUrl;
		if (fileTopLimit <= span.data('fileNumber')) {
			$.hh.info("超出文件上传个数！");
			return;
		}

		// 是否上传类别的判断 获取类别id及名称 start
		var fileType = "";
		var fileTypeName = "";
		if (config.uploadFileType) {
			fileType = $.hh.select.getValue(span, config);
			if (fileType == "") {
				$.hh.info("请先选择类别再上传附件！");
				return false;
			}
			fileTypeName = $.hh.select.getValueName(span, config);
		}
		// 是否上传类别的判断 获取类别id及名称 end
		// 上传类型的判断 start
		var file = span.find('input:file').val();
		var filename = file.replace(/.*(\/|\\)/, "");
		var fileExt = (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename
				.toLowerCase()) : '';
		var checkFileName = false;
		if (config.fileTypes == "*.*" || config.fileTypes == "") {
			checkFileName = true;
		} else {
			if (config.fileTypes.indexOf(fileExt[0]) >= 0) {
				checkFileName = true;
			} else {
				checkFileName = false;
			}
		}
		// 上传类型的判断 end
		if (checkFileName) {
			var asyncFileId = span.data("asyncFileId");
			$.ajaxFileUpload({
				url : uploadUrl + "&" + $.param(config.uploadDataFun())
						+ "&categoryType=" + fileType + "&categoryTypeName="
						+ fileTypeName, // 需要链接到服务器地址
				secureuri : false,
				async : false,
				fileElementId : asyncFileId, // 文件选择框的id属性
				dataType : 'text', // 服务器返回的格式，可以是json
				success : function(data, textStatus) { // 相当于java中try语句块的用法
					data = eval('('
							+ data
									.replace(
											'<PRE style="word-wrap: break-word; white-space: pre-wrap;">',
											'')
									.replace(
											'<pre style="word-wrap: break-word; white-space: pre-wrap;">',
											'').replace('<pre>', '').replace(
											'</pre>', '').replace('<PRE>', '')
									.replace('</PRE>', '') + ')');

					span.find('[type=filediv]').remove();

					span
							.find('[uploadbtn=true]')
							.append('<div type="filediv" style="font-weight:bold;overflow: hidden; position: relative; direction: ltr;display:block; border:1px solid ; border-radius: 4px; background: none repeat scroll 0 0 #F6F6F6; width:64px; height:19px; text-shadow: 0 1px 0 #F3F3F3;  font-size: 14px; color: #333333; border-color:#DDDDDD; border-radius: 6px; cursor:pointer;padding:5px;"  > 附件上传<input style="filter:alpha(opacity=0); -moz-opacity:0; -khtml-opacity: 0; opacity: 0; margin: 0px;  padding: 0px;  top: 0px;  right: 0px;  font-family: Arial;  font-size: 14px;  position: absolute;  cursor: pointer;" tabIndex="-1" name="'
									+ asyncFileId
									+ '" id="'
									+ asyncFileId
									+ '"  type="file" keepDefaultStyle="true" /> </div>');
					var fileInput = span.find('input:file');
					fileInput.data({
								span : span,
								config : config
							});
					fileInput.change(function() {
								$.hh.asyncFile.asyncFileupload($(this)
												.data('span'), $(this)
												.data('config'));
							});
					$('input[id^=jUploadFile]').remove();
					if (data.code == 10) {
						$.hh.info("附件超过验证大小！");
					} else if (data.fileId) {
						$.hh.asyncFile.loadAttachment(span, config);
					} else {
						$.hh.info("上传失败！");
					}
				},
				error : function(data, status, e) { // 相当于java中catch语句块的用法
					$.hh.info("上传失败！");
				}
			});
		} else {
			$.hh.info("文件格式不正确！");
		}

	},
	loadAttachment : function(span, config) {
		var data = config.uploadDataFun();
		$.post(config.listUrl, data, function(result) {
			var items = result.attachmentList;
			span.find('[type=filelist]').empty();
			var listul = $('<ul data-role="listview" data-filter="false" data-inset="true"></ul>');
			span.find('[type=filelist]').append(listul);
			for (var i = 0; i < items.length; i++) {
				var comment = items[i];
				var downloadUrl = config.downloadUrl + comment.id;
				var textHtml = comment.uploadFileName;
				if (config.uploadFileType && comment.categoryType) {
					textHtml += '[' + comment.categoryType + ']';
				}
				var lihtml = $('<li type=fileitem><a  data-icon="false" href="javascript:$.hh.asyncFile.download(\''
						+ downloadUrl + '\');">' + textHtml + '</a>');

				if (config.type == "upload"
						&& !span.find('[type=filediv]').is(':hidden')) {
					lihtml
							.append('<a deleteA=true attid="'
									+ comment.id
									+ '" class="ui-icon-delete" href="javascript:void(0);">删除</a>');
				}
				lihtml.find('[deleteA=true]').data({
							span : span,
							config : config
						})
				lihtml.find('[deleteA=true]').click(function() {
					var id = $(this).attr('attid');
					var span = $(this).data('span');
					var config = $(this).data('config');
					$.ajax({
								url : config.deleteUrl + id,
								type : "post",
								success : function(responseText, statusText) {
									$.hh.asyncFile.loadAttachment(span, config);
								},
								error : function() {
									$.hh.info("删除失败！");
								}
							});
				});

				listul.append(lihtml);
			}
			span.trigger('create');
			listul.listview('refresh');

			var fileNumber = span.find('[type=filelist]')
					.find("[type=fileitem]").length;
			span.data('fileNumber', fileNumber);

		}, "json");
	},

	download : function(downUrl) {
		window.open(downUrl, "newwindow");
	},
	disabled : function(span) {
		span.find('[deletea=true]').hide();
		span.find('[type=filediv]').hide();
	},
	undisabled : function(span) {
		span.find('[deletea=true]').show();
		span.find('[type=filediv]').show();
	}

}

$.hh.pagelist = {
	render : function(span, config) {
		span.empty();
		var div = $('<div></div>');
		var ul = $('<ul data-role="listview" data-filter="false" data-inset="true"></ul>');
		div.append(ul);
		span.append(div);
		$.hh.pagelist.loadData_(span, config);
	},
	loadData_ : function(span, config) {
		var ul = span.find('ul');
		ul.empty();
		var url = config.url;
		if (url) {
			$.hh.pagelist.loadDataUrl({
						span : span,
						config : config,
						ul : ul
					});
		} else if (config.data) {
			$.hh.pagelist.loadData(ul, config.data, config);
		}
		if (config.url) {
			$(document).unbind('scrollstop');
			$(document).on("scrollstop", {
						span : span,
						ul : ul
					}, function(param) {
						var span = param.data.span;
						var ul = param.data.ul;
						var config = span.getConfig();
						var loadOver = config.loadOver;
						if (loadOver != 1
								&& $(document).scrollTop() + 50 >= $(document)
										.height()
										- $(window).height()
								&& $(document).scrollTop() != 0) {
							$.hh.pagelist.loadDataUrl({
										span : span,
										config : config,
										ul : ul
									});
						}
					});
		}
	},
	loadDataUrl : function(param) {
		var config = param.config;
		var url = config.url;
		var limit = config.limit || 10;
		var page = config.page || 1;
		if (url) {
			var actionParam = {
				'page' : page,
				'limit' : limit,
				'start' : (page - 1) * limit
			};
			$.extend(actionParam, config.params);
			Request.request(url, {
						data : actionParam,
						callback : function(result) {
							param.span.data('data', result.items);
							$.hh.pagelist.loadData(param.ul, result, config);
						}
					});
		}
	},
	getItemDataValue : function(config, filed, data) {
		var bigTitlestr = '';
		if (config[filed]) {
			if ($.isFunction(config[filed])) {
				return config[filed](data);
			} else {
				bigTitlestr = (data[config[filed]] || '');
				if (bigTitlestr == '' && config[filed].indexOf('data.') > -1) {
					bigTitlestr = eval('(' + config[filed] + ')');
				}
			}
		}
		return bigTitlestr;
	},
	getItemDataValue2 : function(column, data) {
		var filed = column.name || '';
		var bigTitlestr = '';
		if (filed) {
			bigTitlestr = (data[filed] || '');
			if (bigTitlestr == '' && filed.indexOf('data.') > -1) {
				bigTitlestr = eval('(' + filed + ')');
			}
		}
		if (column.render) {
			bigTitlestr = column.render(bigTitlestr, data);
		}
		return bigTitlestr;
	},
	loadData : function(ul, result, config) {
		var loadOver = 0;
		var paging = 1;
		if ($.isArray(result)) {
			paging = 0;
			result = {
				items : result,
				'total' : result.length
			};
		}
		if (paging == 0) {
			loadOver = 1;
		}
		var items = result.items;
		var pageSize = config.limit || 10;
		var page = config.page || 1;

		if (parseInt((result['total'] - 1) / pageSize) + 1 == page) {
			loadOver = 1;
		}

		if (paging == 1) {
			ul.append($('<li data-role="list-divider">第' + page + '页,显示'
					+ ((page - 1) * pageSize + 1) + '-'
					+ ((page - 1) * pageSize + items.length) + ',共'
					+ result['total'] + '条</li>'));
		}
		page++;
		config.widget.data('loadOver', loadOver);
		config.widget.data('page', page);

		if (items && items.length > 0) {
			var checkName = $.hh.getTime();

			var columns = config.columns;

			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				// var tr_html = "<li><a href='javascript:void(0)'>"
				// + item[config.displayColumn] + "</a></li>";

				var li_ = $('<li data-icon="false"></li>');
				var lia_ = $('<a type="item" href="javascript:void(0)"></a>');
				li_.append(lia_);

				if (config.itemRender) {
					var tr_html_value = config.itemRender(item);
					lia_.append(tr_html_value);
				} else if (columns) {
					var img_html = '';
					var bigTitle_html = '';
					var title_html = '';
					var content_html = '';
					var rightTop_html = '';
					var rightBottom_html = '';

					var leftTop_html = '';
					var leftBottom_html = '';

					for (var j = 0; j < columns.length; j++) {
						var column = columns[j];
						var columnText = column.text || '';
						if (column.type == 'img') {
							var imgValue = this.getItemDataValue2(column, item);
							if (imgValue) {
								img_html += '<img listpageimg=true width=160px height=160px title="'
										+ columnText
										+ '" src="'
										+ imgValue
										+ '">';
							} else if (column.name) {
								img_html += '<img title="' + columnText
										+ '" src="' + column.name + '">';
							}
						} else if (column.type == 'bigTitle') {
							bigTitle_html += '<h2 style="text-overflow: clip;overflow: hidden;word-wrap: break-word; word-break: break-all;	white-space: pre-wrap;">'
									+ columnText
									+ this.getItemDataValue2(column, item)
									+ '</h2>';
						} else if (column.type == 'title') {
							title_html += '<p style="text-overflow: clip;overflow: hidden;word-wrap: break-word; word-break: break-all;	white-space: pre-wrap;"><strong>'
									+ columnText
									+ this.getItemDataValue2(column, item)
									+ '</strong></p>';
						} else if (column.type == 'content') {
							content_html += '<p style="text-overflow: clip;overflow: hidden;word-wrap: break-word; word-break: break-all;	white-space: pre-wrap;">'
									+ columnText
									+ this.getItemDataValue2(column, item)
									+ '</p>';
						} else if (column.type == 'rightTop') {
							rightTop_html += '<p class="ui-li-aside">'
									+ columnText
									+ this.getItemDataValue2(column, item)
									+ '</p>';
						} else if (column.type == 'rightBottom') {
							rightBottom_html += '<p class="ui-right-bottom">'
									+ columnText
									+ this.getItemDataValue2(column, item)
									+ '</p>';
						} else if (column.type == 'leftTop') {
							leftTop_html += '<p class="ui-left-top">'
									+ columnText
									+ this.getItemDataValue2(column, item)
									+ '</p>';
						} else if (column.type == 'leftBottom') {
							leftBottom_html += '<p class="ui-left-bottom"><br/>'
									+ columnText
									+ this.getItemDataValue2(column, item)
									+ '</p>';
						} else if (column.type == 'hidden') {
						}
					}

					lia_
							.append(img_html
									+ '<div style="height:7px;"></div>'
									+ bigTitle_html + title_html + content_html
									+ '<div style="height:7px;"></div>'
									+ rightTop_html + rightBottom_html
									+ leftTop_html + leftBottom_html);
				} else {
					var tr_html = '';
					var imgValue = this.getItemDataValue(config, 'img', item);
					if (imgValue) {
						tr_html += '<img src="' + imgValue + '">';
					} else if (config.img && item[config.img] == null) {
						if (config.img) {
							tr_html += '<img src="' + config.img + '">';
						}
					}
					tr_html += '<h2>'
							+ this.getItemDataValue(config, 'bigTitle', item)
							+ '</h2>';
					tr_html += '<p><strong>'
							+ this.getItemDataValue(config, 'title', item)
							+ '</strong></p>';
					tr_html += '<p>'
							+ this.getItemDataValue(config, 'content', item)
							+ '</p>';
					tr_html += '<p class="ui-li-aside"><strong>'
							+ this.getItemDataValue(config, 'toprightTitle',
									item) + '</strong></p>';

					lia_.append(tr_html);
				}
				if (config.selectType == 'radio') {
					lia_
							.append('<span class="ui-li-count"><input inputtype="check" data-role="none" type="radio" name="'
									+ checkName + '" /></span>');
				} else if (config.selectType == 'check') {
					lia_
							.append('<span class="ui-li-count"><input inputtype="check" data-role="none" type="checkbox" name="'
									+ checkName + '" /></span>');
				}

				$tr = li_;
				if ($tr.find('[listpageimg=true]').length > 0) {
					$tr.find('[class=ui-left-bottom]').css('left', '8.5em');
					$tr.find('[class=ui-left-top]').css('left', '8.5em');
				}

				var buttonItemList = config.buttonItems;

				if (buttonItemList) {
					if (buttonItemList.length == 1) {
						var buttonItem = buttonItemList[0];
						var a = $('<a href="javascript:void(0);" type="itemA">'
								+ buttonItem.text + '</a>');
						a.click(function(tr) {
									buttonItem.click($(this).data('data'));
								});
						if (buttonItem.icon) {
							a.attr('data-icon', buttonItem.icon);
						}
						$tr.append(a);
					} else if (buttonItemList.length > 1) {
						var id = $.hh.getTime();

						$tr
								.append($('<a href="#'
										+ id
										+ '"  data-rel="popup" data-transition="pop" data-icon="bullets" type="itemA">操作</a>'));
						var popupDiv = $('<div data-role="popup" id="' + id
								+ '" data-theme="a"></div>');
						var ul1 = $('<ul data-role="listview" data-inset="true" style="min-width:90px;" data-mini="true"></ul>');
						popupDiv.append(ul1);
						for (var j = 0; j < buttonItemList.length; j++) {
							var buttonItem = buttonItemList[j];
							var li = $('<li ><a href="javascript:void(0)" data-icon="'
									+ buttonItem.icon
									+ '" >'
									+ buttonItem.text
									+ '</a></li>');
							if (buttonItem.icon) {
								li.attr('data-icon', buttonItem.icon);
							}
							li.find('a').data('click', buttonItem.click);
							li.find('a').click(function(tr) {
										$.hh.popclose();
										$(this).data('click')($(this)
												.data('data'));
									});
							ul1.append(li);
						}
						popupDiv.find('a').data('data', item);
						config.widget.append(popupDiv);
					}
				}

				if (config.itemClick) {
					$tr.find('[type=item]').click(function(tr) {
								config.itemClick($(this).data('data'), $(this));
							});
				}

				$tr.find('[type=item]').click(function(tr) {
					if ($(this).find('[inputtype=check]').prop("checked")) {
						$(this).find('[inputtype=check]')
								.prop("checked", false);
					} else {
						$(this).find('[inputtype=check]').prop("checked", true);
					}
					if ($(this).find('[inputtype=check]').length > 0
							&& config.checkclick) {
						config.checkclick($(this).data('data'), $(this)
										.find('[inputtype=check]'));
					}
				});

				// if (config.checkclick) {
				// $tr.find('[type=radio]').click(function(tr) {
				// config.checkclick($(this).data('data'), $(this));
				// });
				// }

				$tr.data('data', item);
				$tr.find('a').data('data', item);
				$tr.find('[inputtype=check]').data('data', item);
				$tr.find('[inputtype=check]').attr('disabled', 'disabled');

				ul.append($tr);
				if (config.itemRenderAfter) {
					tr_html += config.itemRenderAfter(item, $tr);
				}
			}

			if (loadOver == 1) {
				if (items.length == 0) {
					var buttonItemList = config.buttonItems;
					if (buttonItemList) {
						for (var j = 0; j < buttonItemList.length; j++) {
							var buttonItem = buttonItemList[j];
							if (buttonItem.icon == "plus") {
								var li = $('<li data-role="list-divider"><a href="javascript:void(0)" style="text-decoration:none;" data-icon="'
										+ buttonItem.icon
										+ '" >'
										+ buttonItem.text + '</a></li>');
								if (buttonItem.icon) {
									li.attr('data-icon', buttonItem.icon);
								}
								li.find('a').data('click', buttonItem.click);
								li.find('a').click(function(tr) {
									$(this).data('click')($(this).data('data'));
								});
								ul.append(li);
								break;
							}
						}
					}
				} else {
					ul.append($('<li data-role="list-divider"></li>'));
				}
			}

		} else {
			if (config.emptyTip) {
				ul.append('<center>' + config.emptyTip + '</center>');
			} else {
				ul.append('<center>没有数据可以显示！</center>');
			}
		}
		
		try {
			config.widget.trigger('create');
			ul.listview('refresh');
		} catch (e) {

		}
	},
	getValue : function(span, config) {
		var value = span.find('input').val();
		if (config.integer) {
			if ($.isNumeric(value)) {
				value = parseInt(value);
			} else {
				value = 0;
			}
		}
		return value;
	},
	getWidget : function(span, config) {
		return {
			loadData : function(cfg) {
				cfg.page = 1;
				cfg.limit = 10;
				var confi = $.extend(config, cfg)
				span.data(confi);
				$.hh.pagelist.loadData_(span, confi);
			}
		};
	},
	setValue : function(span, config, value) {
		span.find('input').val(value);
	},
	getValueData : function(span) {
		var dataList = [];
		span.find('input[inputtype]:checked').each(function() {
					dataList.push($(this).parents('[type=item]').data('data'));
				});
		return dataList;
	}
}

$.hh.tree = {
	render : function(span, config) {
		span.empty();
		var pageListSpan = $('<span  xtype="pagelist" ></span>');
		var parentBtnSpan = $('<span xtype="button" ></span>');

		var parentBtnConfig = {
			text : '上一级',
			treeSpan : span,
			onClick : function() {
				$.hh.tree.parentClick(this.treeSpan);
			},
			disabled : true
		}
		parentBtnSpan.data(parentBtnConfig);
		span.append(parentBtnSpan);
		parentBtnSpan.render();

		var pageListviewConfig = {
			// title : 'name',
			treeSpan : span,
			itemRenderAfter : function(data, tr) {
				if (this.treeSpan.data('async')) {

				} else {
					if (data.children == false || data.isParent != true) {
						tr.find('[type=itemA]').remove();
					}
				}
			},
			itemRender : function(data) {
				if (data.children == false || data.isParent != true) {
					return '<img class="ui-li-icon" src="/common/images/icons1/application_view_list.gif">&nbsp;'
							+ (data.name || '');
				} else {
					return '<img class="ui-li-icon" src="/common/images/icons1/folder_page_white.gif">&nbsp;'
							+ (data.name || '');
				}
			},
			buttonItems : [{
				text : '下一级',
				treespan : span,
				pageListSpan : pageListSpan,
				parentBtnSpan : parentBtnSpan,
				click : function(data) {
					if (this.treespan.data('async')) {
						$.hh.tree.getDataList(this.treespan, data);
					} else {
						var dataList = $.hh.tree.getDataList(this.treespan,
								data);
						if (dataList.length > 0) {
							this.pageListSpan.getWidget().loadData({
										data : dataList
									});
							this.parentBtnSpan.undisabled();
						} else {
							$.hh.info('没有下级数据！');
						}
					}
				}
			}]
		}
		if (config.itemClick) {
			pageListviewConfig.itemClick = config.itemClick;
		}

		pageListSpan.data(pageListviewConfig);
		span.append(pageListSpan);
		pageListSpan.render();
		this.loadData(span, config);
	},
	loadData : function(span, config) {
		span.find('[xtype=button]').disabled();
		var data = config.data;
		var url = config.url;
		var async = false;
		var pageListSpan = span.find('[xtype=pagelist]');
		if (data && data.length > 0) {
			var dataListTemp = data || [];
			var dataList = [];
			$.hh.tree.treeListToDataList(dataListTemp, dataList);
			span.data('data', dataList);
			data = this.getDataList(span, 'root');
			pageListSpan.getWidget().loadData({
						data : data
					});
		} else if (url) {
			span.data('hiid', 'root');
			async = true;
			Request.request(url, {
						data : {},
						globalVar : pageListSpan,
						callback : function(result, pageListSpan) {
							if (result) {
								pageListSpan.getWidget().loadData({
											data : result[$.hh.tree.treeNodes]
										});
							}
						}
					});
		}
		span.data('async', async);
		span.data('hiMapNode', {});
	},
	getWidget : function(span, config) {
		return {
			loadData : function(cfg) {
				var confi = $.extend(config, cfg)
				span.data(confi);
				$.hh.tree.loadData(span, confi);
			}
		};
	},
	treeListToDataList : function(treeDataList, dataList, parentId) {
		if (treeDataList) {
			for (var i = 0; i < treeDataList.length; i++) {
				var data2 = treeDataList[i];
				if (!data2.parentId) {
					data2.parentId = parentId;
				}
				dataList.push(data2);
				$.hh.tree.treeListToDataList(treeDataList[i].children,
						dataList, treeDataList[i].id)
			}
		}
	},
	parentClick : function(span) {
		var hiid = span.data('hiid');
		var index = hiid.lastIndexOf(',');
		hiid = hiid.substr(0, index);
		var dataList = [];
		if (hiid == 'root') {
			span.find('[xtype=button]').disabled();
			span.data('hiid', '');
			dataList = this.getDataList(span, 'root');
		} else {
			var dataid = hiid.substr(hiid.lastIndexOf(',') + 1);
			hiid = hiid.substr(0, hiid.lastIndexOf(','));
			span.data('hiid', hiid);
			dataList = this.getDataList(span, span.data('hiMapNode')[dataid]);
		}
		if (!span.data('async')) {
			span.find('[xtype=pagelist]').getWidget().loadData({
						data : dataList
					});
		}
	},
	getRootDataList : function(span, dataList) {
		var rootNodes = [];
		for (var i = 0; i < dataList.length; i++) {
			var data = dataList[i];
			var rootas = true;
			for (var j = 0; j < dataList.length; j++) {
				var data2 = dataList[j];
				if (data.parentId == data2.id) {
					rootas = false;
					break;
				}
			}
			if (rootas) {
				var isParent = this.isParent(dataList, data);
				if (data.isParent == null) {
					data.isParent = isParent;
				}
				data.children = isParent;
				rootNodes.push(data);
			}
		}
		span.data('hiid', 'root');
		return rootNodes;
	},
	id : 'id',
	parentId : 'parentId',
	text : 'name',
	treeNodes : 'treeNodes',
	isParent : function(dataList, data) {
		for (var i = 0; i < dataList.length; i++) {
			var data2 = dataList[i];
			if (data[this.id] == data2[this.parentId]) {
				return true;
				break;
			}
		}
		return false;
	},
	getDataList : function(span, data) {
		if (span.data('async')) {
			var url = span.data('url');
			var clickParam = span.data('clickParam') || 'data';
			var dataParam = data == 'root'
					? null
					: eval('(' + clickParam + ')');
			Request.request(url, {
				data : dataParam,
				globalVar : {
					parentBtnSpan : span.find('[xtype=button]'),
					treespan : span,
					pageListSpan : span.find('[xtype=pagelist]'),
					parentData : data
				},
				callback : function(result, globalVar) {
					if (result && result[$.hh.tree.treeNodes]
							&& result[$.hh.tree.treeNodes].length > 0) {
						if (globalVar.parentData != 'root') {
							var hiMapNode = span.data('hiMapNode');
							hiMapNode[data[$.hh.tree.id]] = data;
							span.data('hiMapNode', hiMapNode);
							globalVar.treespan
									.data(
											'hiid',
											globalVar.treespan.data('hiid')
													+ ','
													+ globalVar.parentData[$.hh.tree.id])
							globalVar.parentBtnSpan.undisabled();
						} else {
							globalVar.treespan.data('hiid', 'root');
						}
						globalVar.pageListSpan.getWidget().loadData({
									data : result[$.hh.tree.treeNodes]
								});
					} else {
						$.hh.info('没有下级数据！');
					}
				}
			});
		} else {
			var dataList = span.data('data');
			var returnData = [];
			if (data == 'root') {
				return this.getRootDataList(span, dataList);
			}

			for (var i = 0; i < dataList.length; i++) {
				var data1 = dataList[i];
				if (data1[this.parentId] == data[$.hh.tree.id]) {
					data1.isParent = this.isParent(dataList, data1);
					returnData.push(data1);
				}
			}
			if (returnData.length > 0) {
				var hiMapNode = span.data('hiMapNode');
				hiMapNode[data[$.hh.tree.id]] = data;
				span.data('hiMapNode', hiMapNode);
				span.data('hiid', span.data('hiid') + ',' + data[$.hh.tree.id])
			}
			return returnData;
		}
	}
}