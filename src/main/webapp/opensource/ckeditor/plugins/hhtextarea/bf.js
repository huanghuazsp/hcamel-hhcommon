CKEDITOR.plugins.add('hhtextarea', {
	init : function(editor) {
		hhckeditor.addButton(editor, 'hhtextarea', 'textarea', '多行文本框',
				"/hhcommon/opensource/ckeditor/plugins/hhtextarea/hhtextarea.jpg");

		CKEDITOR.dialog.add('hhtextarea', function(a) {
					return {
						title : "多行文本框",
						minWidth : 350,
						minHeight : 150,
						onShow : function() {
							hhckeditor.onShow(this);
						},
						onOk : function() {
							hhckeditor.onOk(this,
									'/hhcommon/opensource/ckeditor/plugins/hhtextarea/hhtextarea.jpg',
									'textarea');
						},
						onLoad : function() {
							this.foreach(function(a) {
										if (a.commit == null) {
											a.commit = hhckeditor.commit;
										}
										if (a.setup == null) {
											a.setup = hhckeditor.setup;
										}
									});
						},
						contents : [{
									id : 'info',
									label : '多行文本框',
									title : '多行文本框',
									elements : [{
												id : 'name',
												type : 'text',
												label : '名称',
												validate : function() {
													var value = this.getValue();
													if (value) {
														var vd = $.hh
																.isE(value);
														if (vd == false) {
															Dialog
																	.infomsg('名称只能是英文！');
														}
														return vd;
													} else {
														Dialog
																.infomsg('名称不能为空！');
														return false;
													}
												}
											}]
								}]
					};
				});
	},
	requires : ['fakeobjects']
});
