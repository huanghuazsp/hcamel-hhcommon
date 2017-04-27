<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="content-type" content="text/html;charset=UTF-8" />
<title>播放器</title>
<link href="css/video-js.min.css" rel="stylesheet">
<script src="js/video.min.js"></script>
<script type="text/javascript" src="/hhcommon/opensource/jquery/web/jquery-1.9.1.js"></script>
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

<script>
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

function getWidth() {
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
}
</script>
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
<body onresize="$('#example_video_1').height(getHeight());$('#example_video_1').width(getWidth());" style="margin: 0px 0px 0px 0px;">
 <video id="example_video_1" class="video-js vjs-default-skin" controls preload="none" width="500px" height="500px"
      poster="oceans-clip.png"
      data-setup="{}">
    <source src="<%=url %>" type='video/<%=fileType %>' />
</body>
</html>
