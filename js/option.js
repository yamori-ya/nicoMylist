$(function() {
	
	
	// 設定項目用dom生成
	$('div.option-obj').each(function(i, e) {
		var id = $(e).attr("id");
		var cap = $(`<p class="caption font">${$(e).text()}</p>`);
		
		var mod = "";
		if ($(e).hasClass('text')) {
			mod = $(`<div class="txt"></div>`)
				.append(`<input type="text" class="val" id="${id}-txt">`);
		}
		else if ($(e).hasClass('check')) {
			mod = $(`<div class="toggle"></div>`)
				.append(`<input type="checkbox" class="val tgl-chk" id="${id}-chk">`)
				.append(`<label class="tgl-lbl" for="${id}-chk"></label>`);
		}
		$(e).text("");
		$(e).append(cap).append(mod);
	});
	
	
	
	var listSheetId;
	var infoSheetId;
	
	// load
	const SYNC_STORAGE = [
		"bookId",
		"sheetIds",
	];
	const LOCAL_STORAGE = [
		"nico_setting",
	];
	Promise.all([
		getSyncStorage(SYNC_STORAGE),
		getLocalStorage(LOCAL_STORAGE),
	]).then((values) => {
		let sync = values[0];
		let local = values[1];
		
		$('#bookId-txt').val(sync.bookId);
		
		// 設定系
		if (local.nico_setting) {
			let setting = local.nico_setting;
			$('#opt1-chk').prop('checked', setting.auto_play);
			$('#opt2-chk').prop('checked', setting.just_scroll);
			$('#opt3-chk').prop('checked', setting.screen_click);
		}
		if (sync.sheetIds) {
			listSheetId = sync.sheetIds.list;
			infoSheetId = sync.sheetIds.info;
		}
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
		
		if (!$(this).hasClass('active')) {
			return;
		}
		
		console.log("保存！");
		
		// 各シートのIDが取得できていなかったら取得
		if (listSheetId == null || infoSheetId == null ) {
			console.log("シートIDがないため取得");
			
			api.bookId = $('#bookId-txt').val();
			api.GetBookInfo().then((obj) => {
				if (obj.error) { // シートへのアクセス失敗
					location.href = '/option.html?status=error'+obj.error.code;
					return;
				}
				$.each(obj.sheets, (i, one) => {
					switch(one.properties.title) {
						case "list": listSheetId = one.properties.sheetId; break;
						case "info": infoSheetId = one.properties.sheetId; break;
					}
				});
				if (listSheetId == null || infoSheetId == null) {
					location.href = '/option.html?status=error'+obj.error.code;
					return;
				}
				setSyncStorage({
					sheetIds :{
						list:listSheetId,
						info:infoSheetId
					}
				});
			});
		}
		
		// 保存
		setSyncStorage({
			bookId:$('#bookId-txt').val(),
		});
		setLocalStorage({
			nico_setting : {
				auto_play:   $('#opt1-chk').prop('checked'),
				just_scroll: $('#opt2-chk').prop('checked'),
				screen_click:$('#opt3-chk').prop('checked'),
			}
		});
		$('#save').removeClass('active');
	});
	
	
	
	$('.val').on('change keyup', function() {
		console.log("変更されました！");
		$('#save').addClass('active');
	});
	
	// $('#add_').click(function() {
	// 
	// 	chrome.runtime.sendMessage({id:"create_book"}, function(response) {
	// 		console.log(response);
	// 	});
	// });
	
});