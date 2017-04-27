var pathList = [];
var hidata = {};
var hidata2 = {};
var paramKeys = null;;
var requestParams = {
	node : 'root'
};
function refresh() {
	loadData(true);
}
function loadData(editresult) {
	if (editresult) {
		var tempPathList = [];
		var path = '';
		for (var i = 0; i < pathList.length - 1; i++) {
			tempPathList.push(pathList[i]);
			path = pathList[i];
		}
		pathList = tempPathList;
		delete hidata[requestParams.node];
	}
	if (hidata[requestParams.node]) {
		pathList.push(requestParams.node);
		renderList(hidata[requestParams.node]);
	} else {
		if (paramKeys) {
			var paramData1 = hidata2[requestParams.node] || {
				node : 'root'
			};
			for (var i = 0; i < paramKeys.length; i++) {
				var key = paramKeys[i];
				requestParams[key] = paramData1[key];
			}
		}
		Request.request(queryAction, {
					data : requestParams,
					callback : function(result) {
						pathList.push(requestParams.node);
						hidata[requestParams.node] = result;
						renderList(result);
						$.extend(hidata2, $.hh.listToObject(result));
					}
				});
	}
}

function renderList(result) {
	if (pathList.length > 1) {
		$('#backbtn').undisabled();
	} else {
		$('#backbtn').disabled();
	}
	for (var i = 0; i < result.length; i++) {
		if (!result[i].img) {
			result[i].img = result[i].leaf == 0
					? $.hh.property.img_wenjianjia
					: $.hh.property.img_wenjian;
		}
	}
	$('#gridView').render({
		data : result
	});
}
function doBack() {
	var tempPathList = [];
	var path = '';
	for (var i = 0; i < pathList.length - 1; i++) {
		tempPathList.push(pathList[i]);
		path = pathList[i];
	}
	pathList = tempPathList;
	requestParams.node = path;
	renderList(hidata[path]);
}