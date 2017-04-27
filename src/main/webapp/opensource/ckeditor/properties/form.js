var params = $.hh.getIframeParams();


function init(){
	setValues(params.data);
}
var width = 700;
var height = 600;
function setValues(config) {
//	beRender();
//	$('#form').renderAll();
	$('#form').setValue(config);
//	$("[xtype=form]").each(function() {
//						var config = $.hh.getConfig($(this));
//						if ($(this).is('form')) {
//							$.hh.validation.validation($(this), config);
//						}
//					});
}
function getValues() {
	if ($("#form").validationEngine('validate')) {
		return $("#form").getValue()
	} else {
		Dialog.errormsg("验证失败！！");
		return null;
	}
}

var tableitemConfig = {
	name : 'data',
	required : true,
	valueType : 'object',
	trhtml : '<table width=100%><tr><td  style="width:60px;text-align:right;">提交值：</td><td><span xtype="text" valuekey="id" config=" "></span></td>'
			+ '<td  style="width:60px;text-align:right;">显示值：</td><td><span xtype="text" valuekey="text" config=" "></span></td></tr></table>'
}

var defaultValueConfig = {
	name : 'value',
	data : $.hh.property.defaultValueConfig
};
var defaultValueDateConfig = {
	name : 'value',
	data : $.hh.property.defaultValueConfig
};

var blurEventConfig = {
	name : 'blur'
}
var onChangeEventConfig = {
	name : 'onChange'
}
var setValueEventConfig = {
	name : 'onSetValue'
}

var parentPage = params.parentPage;
var eventList = [];
for (var i = 0; i < parentPage.eventList.length; i++) {
	parentPage.eventList[i].text = parentPage.eventList[i].eventName;
	eventList.push(parentPage.eventList[i]);
}
blurEventConfig.data = eventList;
onChangeEventConfig.data = eventList;
setValueEventConfig.data = eventList;

function beRender() {
	$("[xtype]").each(function() {
				$(this).removeData();
			});
	var eventList = [];
	for (var i = 0; i < parent.eventList.length; i++) {
		parent.eventList[i].text = parent.eventList[i].eventName;
		eventList.push(parent.eventList[i]);
	}
	blurEventConfig.data = eventList;
	onChangeEventConfig.data = eventList;
	setValueEventConfig.data = eventList;
}
function zwblur(){
	if(!$('#span_name').getValue()){
		$('#span_name').setValue(pinyin.getPinyin($('#span_textfield').getValue()));
	}
}
$(function(){
	$('#refreshName').click(function(){
		$('#span_name').setValue(pinyin.getPinyin($('#span_textfield').getValue()));
	});
});

function doSave(){
	
	var values = getValues();
	if (values == null) {
		return false;
	}
	var parentWindow = params.parentPage;
	
	//---------------
	if(params.callback){
		params.callback(values);
	}
	Dialog.close();
	return ;
	//-------------  
	
	var wjj = params.wjj;
	var xtype = params.xtype;
	parentWindow.hhckeditor.onOk(
			params.page,
			'plugins/'
					+ wjj
					+ '/'
					+ wjj
					+ '.jpg',
			xtype,
			values);
	Dialog.close();
}

function doCancel(){
	Dialog.close();
}
