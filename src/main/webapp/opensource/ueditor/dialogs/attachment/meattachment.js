/**
 * User: Jinqn
 * Date: 14-04-08
 * Time: 下午16:34
 * 上传图片对话框逻辑代码,包括tab: 远程图片/上传图片/在线图片/搜索图片
 */

(function () {

    var uploadFile,
        onlineFile;

    window.onload = function () {
        initTabs();
        initButtons();
    };

    /* 初始化tab标签 */
    function initTabs() {
        var tabs = $G('tabhead').children;
        for (var i = 0; i < tabs.length; i++) {
            domUtils.on(tabs[i], "click", function (e) {
                var target = e.target || e.srcElement;
                setTabFocus(target.getAttribute('data-content-id'));
            });
        }

        setTabFocus('upload');
    }

    /* 初始化tabbody */
    function setTabFocus(id) {
        if(!id) return;
        var i, bodyId, tabs = $G('tabhead').children;
        for (i = 0; i < tabs.length; i++) {
            bodyId = tabs[i].getAttribute('data-content-id')
            if (bodyId == id) {
                domUtils.addClass(tabs[i], 'focus');
                domUtils.addClass($G(bodyId), 'focus');
            } else {
                domUtils.removeClasses(tabs[i], 'focus');
                domUtils.removeClasses($G(bodyId), 'focus');
            }
        }
        switch (id) {
            case 'upload':
                break;
            case 'online':
	           if( $('#pagelist').find('[xtype=toolbar]').length==0){
	           		$('#pagelist').render();
	           }
	            break;
        }
    }

    /* 初始化onok事件 */
    function initButtons() {

        dialog.onok = function () {
        	var list = [], id, tabs = $G('tabhead').children;
            for (var i = 0; i < tabs.length; i++) {
                if (domUtils.hasClass(tabs[i], 'focus')) {
                    id = tabs[i].getAttribute('data-content-id');
                    break;
                }
            }
            switch (id) {
                case 'upload':
                	var dataList = $('#span_ueditorfile').getValueData();
                	for(var i=0;i<dataList.length;i++){
                		var data = dataList[i];
                		list.push({
                			title : data.text,
                			url : data.baseHttpFilePath+data.path
                		});
                	}
                    break;
                case 'online':
                    var dataList = $('#pagelist').getWidget().getSelectDataList();
                    for(var i=0;i<dataList.length;i++){
                		var data = dataList[i];
                		list.push({
                			title : data.text,
                			url : data.baseHttpFilePath+data.path
                		});
                	}
                    break;
            }

            editor.execCommand('insertfile', list);
        };
    }


   


})();