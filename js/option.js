$(function() {
	var listSheetId;
	var infoSheetId;
	
	// load
	getLocalStorage([
		"sheetId",
		"info",
		"list",
		"auto_play",
		"just_scroll",
		"screen_click",
		"always_load",
		"list_sheet_id",
		"info_sheet_id",
	]).then((values) => {
		$('#sheetId').val(values.sheetId);
		$('#info').val(values.info);
		$('#list').val(values.list);
		$('#autoPlay').prop('checked', values.auto_play);
		$('#justmeetScroll').prop('checked', values.just_scroll);
		$('#screenClick').prop('checked', values.screen_click);
		$('#alwaysLoad').prop('checked', values.always_load);
		listSheetId = values.list_sheet_id;
		infoSheetId = values.info_sheet_id;
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
			auto_play:$('#autoPlay').prop('checked'),
			just_scroll:$('#justmeetScroll').prop('checked'),
			screen_click:$('#screenClick').prop('checked'),
			always_load:$('#alwaysLoad').prop('checked')
		})
		.then(() => {
			if (!listSheetId || !infoSheetId) {
				api.bookId = $('#sheetId').val();
				api.GetBookInfo().then((obj) => {
					if (obj.error) { // シートへのアクセス失敗
						location.href = '/option.html?status=error'+obj.error.code;
						throw new Error();
					}
					$.each(obj.sheets, (i, one) => {
						switch(one.properties.title) {
							case "list": listSheetId = one.properties.sheetId; break;
							case "info": infoSheetId = one.properties.sheetId; break;
						}
					});
					setLocalStorage({
						list_sheet_id:listSheetId,
						info_sheet_id:infoSheetId
					});
				});
			}
		});
		
		
	});
	
	
	// $('#add_').click(function() {
	// 
	// 	chrome.runtime.sendMessage({id:"create_book"}, function(response) {
	// 		console.log(response);
	// 	});
	// });
	
});