<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="">
<meta name="author" content="">
<script type="text/javascript" src="ckeditor.js"></script>
<%
	String path = request.getContextPath();
	String basePath = request.getScheme() + "://"
			+ request.getServerName() + ":" + request.getServerPort()
			+ path + "/";
	request.setCharacterEncoding("UTF-8");
	String height =request.getParameter("height");
	String value =request.getParameter("value");
%>
<script type="text/javascript">
	var editor = null;
	window.onload = function() {
		 editor = CKEDITOR.replace('editor', {
			height : <%=height%>,
			fullPage : true
		});
	};
</script>
</head>
<body>
	<textarea rows="100" cols="50" name="editor"></textarea>
</body>
</html>
