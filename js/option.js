var listSheetId
var infoSheetId
var changeBookId = false

function addBook() {
	if (!window.confirm("スプレッドシートを新規作成します"))
		return false
		
	var api = new SheetApi('')
	api.CreateBook()
	.then(ids => {
		$('#bookId').val(ids.book);
		listSheetId = ids.list;
		infoSheetId = ids.info;
		return Promise.all([
			api.AppendData('info', ['def']),
			setSyncStorage({ids: ids, reload: true})
		])
	})
	.then(() => {
		alert('スプレッドシートを作成しました！')
	})
}
function getSheetId(bookId) {
	var api = new SheetApi(bookId)
	api.GetBookInfo()
	.then(obj => {
		if (obj.error) { // シートへのアクセス失敗
			goOption('error' + obj.error.code)
			return;
		}
		for (var one of obj.sheets) {
			switch(one.properties.title) {
			case "list": listSheetId = one.properties.sheetId; break;
			case "info": infoSheetId = one.properties.sheetId; break; }
		}
		if (listSheetId == null || infoSheetId == null) {
			goOption('error' + obj.error.code)
			return;
		}
		setSyncStorage({
			ids : {
				book: bookId,
				list: listSheetId,
				info: infoSheetId
			},
			reload: true
		});
	});
}


$(function() {
	getSyncStorage(["ids", "nico_setting"])
	.then(value => {
		// 設定系
		if (value.ids) {
			$('#bookId').val(value.ids.book)
			listSheetId = value.ids.list
			infoSheetId = value.ids.info
		}
		if (value.nico_setting) {
			$('#nico-scroll'    ).prop('checked', value.nico_setting.scroll)
			$('#nico-click2play').prop('checked', value.nico_setting.click2play)
		}
	})
	
	var params = getUrlParams();
	if (Object.keys(params).length != 0) {
		if (params["status"] == "empty") {
			$('#error_str').html("BookIDが設定されていません");
		} else if (params["status"].match(/^error(\d+)/)) {
			$('#error_str').html("BookIDが不正です: " + params["status"]);
		}
	}
	
	$('#bookId').on('keyup', e => {
		$('#save').removeAttr('disabled')
		changeBookId = true
	})
	$('.tgl-chk').on('change', e => {
		$('#save').removeAttr('disabled')
	})
	
	
	$('#create').on('click', addBook)
	
	$('#save').on('click', function() {
		if (changeBookId) {
			getSheetId($('#bookId').val())
		}
		setSyncStorage({
			nico_setting : {
				scroll:     $('#nico-scroll').prop('checked'),
				click2play: $('#nico-click2play').prop('checked')
			}
		})
		$('#save').attr('disabled','')
	});
});