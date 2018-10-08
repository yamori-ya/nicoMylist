$(function() {
	
	chrome.runtime.sendMessage({id:"option_load"}, function(response) {
		console.dir(response);
		$('#sheetId').val(response.val.sheetId);
		$('#info').val(response.val.info);
		$('#list').val(response.val.list);
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
		var map = {
			sheetId:$('#sheetId').val(),
			info:$('#info').val(),
			list:$('#list').val()
		};
		chrome.runtime.sendMessage({id:"option_save", save:map}, function(response) {
			console.log(response);
		});
	});
	
	
	chrome.storage.local.get(["auto_play"], function(value) {
		$('#autoPlay').prop('checked', value.auto_play);
	});
	$('#autoPlay').on('change', function() {
		chrome.storage.local.set({auto_play:$('#autoPlay').prop('checked')}, function() {
		
		});
	});
	
	// $('#add_').click(function() {
	// 
	// 	chrome.runtime.sendMessage({id:"create_book"}, function(response) {
	// 		console.log(response);
	// 	});
	// });
	
});