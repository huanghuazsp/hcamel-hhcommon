var params = $.hh.getIframeParams();
var data = params.data;
var fieldListConfig = {
	name : 'widget',
	data : []
}
for (var i = 0; i < data.jsonConfigObject.length; i++) {
	var jsonData = data.jsonConfigObject[i];
	fieldListConfig.data.push({
				id : jsonData.name,
				text : jsonData.textfield || jsonData.name
			});
}

var radioConfig = {
	name : 'radioConfig',
	data : fieldListConfig.data,
	onChange : function(value) {
		$('#span_formula').setValue($('#span_formula').getValue() + 'data.'
						+ value);
	}
}
function setValues(config) {
	$('#form').setValue(config);
}
function getValues() {
	if ($("#form").validationEngine('validate')) {
		return $("#form").getValue()
	} else {
		Dialog.errormsg("验证失败！！");
		return null;
	}
}

function init(){
	setValues(params.row);
}