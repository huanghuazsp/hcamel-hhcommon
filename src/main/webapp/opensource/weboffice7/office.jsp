<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<META HTTP-EQUIV="content-type" CONTENT="text/html;charset=UTF-8" />
<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7" />
<title>office</title>
<SCRIPT ID=clientEventHandlersJS LANGUAGE=javascript>

	//判断当前字符串是否以str结束
	String.prototype.endsWith = function(str) {
		return this.slice(-str.length) == str;
	};

	function WebOffice1_Close() {
		document.all.WebOffice1.HideMenuArea("show", "", "", "");
		document.all.WebOffice1.HideMenuArea("showmenu", "", "", "");
		document.all.WebOffice1.HideMenuArea("Menu Bar", "Standard",
				"Formatting", "");
		document.all.WebOffice1.Close();
	}
	function WebOffice1_NotifyCtrlReady(url) {
		//AIP初始化完成事件
		if (url == null) {
			document.all.WebOffice1.LoadOriginalFile("", "doc");
		} else {
			if(url.endsWith('xls') || url.endsWith('xlsx')){
				document.all.WebOffice1.LoadOriginalFile(url, "xls");
			}else{
				document.all.WebOffice1.LoadOriginalFile(url, "doc");
			}
		}
	}
</SCRIPT>

<SCRIPT LANGUAGE=javascript FOR=WebOffice1 EVENT=NotifyCtrlReady>
	document.all.WebOffice1.ReadOnly = 1;
	<%
	String fileId = request.getParameter("fileId")==null?"":request.getParameter("fileId");
	String contextPath = request.getParameter("contextPath")==null?"":request.getParameter("contextPath");
	String fileType = request.getParameter("fileType")==null?"mp4":request.getParameter("fileType");
	String path = request.getParameter("path")==null?"":request.getParameter("path");
	String url = "";
	if(path!=null && !"".equals(path)){
		//url = contextPath+"outsystem-File-download?params={id:'"+fileId+"'}";
		url = contextPath+path;
	}
	%>
	WebOffice1_NotifyCtrlReady('<%=url%>');
	document.all.WebOffice1.ShowToolBar = false;
	//隐藏2007功能区
	document.all.WebOffice1.HideMenuArea("", "", "", "");
	//隐藏2007全部菜单
	document.all.WebOffice1.HideMenuArea("hideall", "", "", "");

	document.all.WebOffice1.height = document.documentElement.clientHeight
</SCRIPT>
<style type="text/css">
BODY {
	scrollbar-face-color: #DEE3E7;
	scrollbar-highlight-color: #FFFFFF;
	scrollbar-shadow-color: #DEE3E7;
	scrollbar-3dlight-color: #D1D7DC;
	scrollbar-arrow-color: #006699;
	scrollbar-track-color: #EFEFEF;
	scrollbar-darkshadow-color: #98AAB1;
}
html,body {
	height: 100%;
}
</style>
</head>
<body style="margin: 0px; 0 px; 0 px ,0px; overflow: hidden"
	onresize="document.all.WebOffice1.height=document.documentElement.clientHeight"
	onbeforeunload="WebOffice1_Close()">
	<form name="form1" method="post" action="" id="form1">
		<div style="width: 100%;">
			<script type="text/javascript" src="LoadWebOffice.js"></script>
		</div>
	</form>
</body>
</html>