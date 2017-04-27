var s = "";
if(navigator.userAgent.indexOf("MSIE") > 0){    
s += "<OBJECT id=TrustedPDF1 align='middle'  style='LEFT: 0px; WIDTH: 100%; TOP: 0px; HEIGHT: 100%'"
s += "classid='clsid:FF1FE7A0-0578-4FEE-A34E-FB21B277D561' codebase='js/TrustedPDF_Free_v1.0.0.8.cab#version=1,0,0,8' >"
s += "<PARAM NAME='_Version' VALUE='65536'>"
s += "<PARAM NAME='_ExtentX' VALUE='17410'>"
s += "<PARAM NAME='_ExtentY' VALUE='10874'>"
s += "<PARAM NAME='_StockProps' VALUE='0'>"
s += "</OBJECT>"
}else{
	s += "<object  id='TrustedPDF1' ";
	s += " TYPE='application/x-itst-activex'";
	s += " ALIGN='middle' BORDER='0'";
	s += " style='margin: 0px 0px 0px 0px;LEFT: 0px; WIDTH: 100%; TOP: 0px; HEIGHT: 100% '";
	s += " clsid='{FF1FE7A0-0578-4FEE-A34E-FB21B277D561}'";
	s += " event_NotifyCtrlReady=''";
	s += " event_NotifyToolBarClick='NotifyToolBarClick'";
	s += " event_NotifyWordEvent='NotifyWordEvent'>";
	s += "</object> ";
}
document.write(s);