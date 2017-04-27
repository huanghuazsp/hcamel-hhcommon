var WorkFlow = {
	manager : function(param) {
		Request.request('workflow-Task-manager', {
					data : {
						actionType : param.actionType || 'manager',
						taskId : param.id
					}
				}, function(result) {
					Dialog.open({
								width : $.hh.browser.getMainWidth() * 0.9,
								height : $.hh.browser.getMainHeight() * 0.85,
								url : 'jsp-workflow-service-servicemain',
								params : {
									actionType : param.actionType || 'manager',
									taskResult : result,
									callback : param.callback
								}
							});
				});
	},
	showpic : function(param) {
		$.hh.pagelist.callRow("pagelist", function(row) {
					Dialog.open({
								width : $.hh.browser.getMainWidth() * 0.9,
								height : $.hh.browser.getMainHeight() * 0.85,
								url : 'jsp-workflow-task-pipic?piid='
										+ param.piid + '&pdid=' + param.pdid
							});
				});
	}
}
var WF = {
	showForm : function(piid) {
		Request.request('wf-WFOper-showFormByPiid', {
					data : {
						piid : piid
					}
				}, function(result) {
					var params = {
						piResult : result
					};
					$.hh.addTab({
						params : params,
						id : piid,
						text : '查看表单',
						src : 'jsp-wf-task-piservicemain'
					});
				});
	},
	manager : function(param) {
		Request.request('wf-WFOper-manager', {
					data : {
						taskId : param.id
					}
				}, function(result) {
					var params = {
						param : param,
						taskResult : result,
						callback : param.callback
					};
					// Dialog.open({
					// width : $.hh.browser.getMainWidth() * 0.9,
					// height : $.hh.browser.getMainHeight() * 0.85,
					// url : 'jsp-wf-task-servicemain',
					// params : params
					// });
					if (result.success!=false) {
						$.hh.addTab({
							params : params,
							id : param.id,
							text : '任务办理',
							src : 'jsp-wf-task-servicemain'
						});
					}
					
				});
	},
	openSubmitPage : function(params) {
		var taskResult = params.taskResult;
		var callback = params.callback;
		if (taskResult.serviceObject) {
			Dialog.open({
						url : 'jsp-wf-task-tasksubmit',
						params : {
							taskResult : taskResult,
							callback : callback
						},
						urlParams:{
							piid : taskResult.task.piid
						}
					});
		}
	},
	showpic : function(piid) {
		$.hh.addTab({
					id : piid,
					text : '流程图',
					src : 'jsp-wf-pi-pipic?piid=' + piid
				});
	},
	dataManagerWidgets:function (dataManager){
		$.each(dataManager, function(i, data) {
			
			var xzValue = $('#span_' + data.field).getValue();
			
			if (data.setdefault == 1 && $.hh.defaultValue && !xzValue) {
				$('#span_' + data.field).setValue($.hh.defaultValue[data.field] || '');
			}
		});
		
		$.each(dataManager, function(i, data) {
			if (data.readonly == 1) {
				$('#span_' + data.field).toView();
			}
			if (data.hidden == 1) {
				$('#span_' + data.field).hide();
			}
		});
		
	},
	getDataManager:function(params){
		var dataManager = null;
		if(params.nodeMap && params.nodeMap.currnode && params.nodeMap.currnode.dataManager){
			dataManager = $.hh.toObject(params.nodeMap.currnode.dataManager)||[];
		}else if(params.nodeMap && params.nodeMap.startEvent && params.nodeMap.startEvent.dataManager){
			dataManager = $.hh.toObject(params.nodeMap.startEvent.dataManager)||[];
		}
		return dataManager||[];
	},
	start : function(id,text,params){
		params = params||{};
		Request.request('wf-WFDef-findMaxWFDef', {
			data : {
				wfid : id
			},
			callback : function(wfdef) {
				if(wfdef){
					params.nodeMap=wfdef;
					$.hh.addTab({
						params : params,
						id : 'start_workflow_'+id,
						text : text,
						src : 'jsp-wf-pi-startpage' 
					}); 
				}else{
					Dialog.infomsg("流程未部署！");
				}
			}
		});
	}
}