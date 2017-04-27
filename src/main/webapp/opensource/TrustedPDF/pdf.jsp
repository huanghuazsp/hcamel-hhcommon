<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="content-type" content="text/html;charset=UTF-8" />
<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7" />
<title>PDF</title>
<script type="text/javascript" src="/hhcommon/opensource/jquery/web/jquery-1.9.1.js"></script>
<script defer="defer" ID=clientEventHandlersJS type="text/javascript">
	function TrustedPDF1_Close() { 
		try{
			var pdfObj=document.getElementById("TrustedPDF1");
			pdfObj.CloseDoc(false);
		}catch(e){
			//alert("异常\r\nError:"+e+"\r\nError Code:"+e.number+"\r\nError Des:"+e.description);
		}
	}
	function TrustedPDF1_NotifyCtrlReady(url) {
		TrustedPDF1_Close();
		if(url !=null && url != ""){
			try{
				var pdfObj=document.getElementById("TrustedPDF1");
				pdfObj.LoadFile(url);	
			}catch(e){
				//alert("异常\r\nError:"+e+"\r\nError Code:"+e.number+"\r\nError Des:"+e.description);
			}
		}
	}
	function init(){
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
		TrustedPDF1_NotifyCtrlReady('<%=url%>');
		var pdfObj = document.getElementById("TrustedPDF1");
		pdfObj.ForceSignType2 = pdfObj.ForceSignType2 | 0x02;//处于内部调用状态,这时可能会不弹出某些操作提示
		pdfObj.ForceSignType = pdfObj.ForceSignType | 0x80000000;//进入pdf模式
	}
	function Test() {
		var pdfObj = document.getElementById("TrustedPDF1");
		pdfObj.LoadFile("F:\\undefined.pdf");
	}
	
	function getHeight() {
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
</script>
<SCRIPT LANGUAGE=javascript FOR=TrustedPDF1 EVENT=NotifyCtrlReady>
	
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
<body onload="init()" id="bodyId" style="margin: 0px 0px 0px 0px;"
	onresize="document.getElementById('TrustedPDF1').height=getHeight();$('#pdf').height(getHeight());">
	<div id="pdf">
		<script type="text/javascript" src="js/loadtrustedpdf.js"></script>
	</div>
</body>
</html>