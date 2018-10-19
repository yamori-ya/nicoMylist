$(function() {
	
	// load
	getLocalStorage([
		"sheetId",
		"info",
		"list",
		"auto_play",
		"just_scroll",
	]).then((values) => {
		$('#sheetId').val(values.sheetId);
		$('#info').val(values.info);
		$('#list').val(values.list);
		$('#autoPlay').prop('checked', values.auto_play);
		$('#justmeetScroll').prop('checked', values.just_scroll);
	});
	
	var params = [];
	if (location.search != "") {
		$.each(location.search.substring(1).split("&"), function(i, one) {
			let p = one.split("=");
			params[p[0]] = decodeURI(p[1]);
		});
	}
	if (Object.keys(params).length != 0) {
		if (params["status"] == "empty") {
			$('#error_str').html("シートIDが設定されていません");
		} else if (params["status"].match(/^error(\d+)/)) {
			$('#error_str').html("シートIDが不正です: " + params["status"]);
		}
	}
	
	$('#save').click(function() {
		console.log("保存");
		setLocalStorage({
			sheetId:$('#sheetId').val(),
			info:$('#info').val(),
			list:$('#list').val(),
			auto_play:$('#autoPlay').prop('checked'),
			just_scroll:$('#justmeetScroll').prop('checked')
		});
	});
	
	
	// $('#add_').click(function() {
	// 
	// 	chrome.runtime.sendMessage({id:"create_book"}, function(response) {
	// 		console.log(response);
	// 	});
	// });
	
});