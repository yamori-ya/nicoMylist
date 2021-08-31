var listSheetId
var infoSheetId
var changeBookId = false

async function addBook() {
	if (!window.confirm("スプレッドシートを新規作成します"))
		return false
	
	$('#load-layer').show()
	let api = new SheetApi('')
	let ids = await api.CreateBook()
	$('#bookId').val(ids.book);
	listSheetId = ids.list;
	infoSheetId = ids.info;
	await api.AppendData('info', ['def']),
	await setSyncStorage({ids: ids, reload: true})
	alert('スプレッドシートを作成しました！')
	$('#load-layer').hide()
}
async function getSheetId(bookId) {
	if (!bookId) {
		goOption('error' + 404)
		return;
	}
	let api = new SheetApi(bookId)
	let res = await api.GetBookInfo()
	
	if (res.error) { // シートへのアクセス失敗
		goOption('error' + res.error.code)
		return;
	}
	for (let one of res.sheets) {
		switch(one.properties.title) {
		case "list": listSheetId = one.properties.sheetId; break;
		case "info": infoSheetId = one.properties.sheetId; break; }
	}
	if (listSheetId == null || infoSheetId == null) {
		goOption('error' + res.error.code) // シートID取得できず
		return;
	}
	return setSyncStorage({
		ids : {
			book: bookId,
			list: listSheetId,
			info: infoSheetId
		},
		reload: true
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
	
	let params = getUrlParams();
	if (Object.keys(params).length != 0) {
		if (params["status"] == "empty") {
			$('#error_str').text("BookIDが設定されていません");
		} else if (params["status"].match(/^error(\d+)/)) {
			$('#error_str').text("BookIDが不正です: " + params["status"]);
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
	
	$('#save').on('click', async function() {
		
		$('#load-layer').show()
		await setSyncStorage({
			nico_setting : {
				scroll:     $('#nico-scroll').prop('checked'),
				click2play: $('#nico-click2play').prop('checked')
			}
		})
		if (changeBookId) {
			await getSheetId($('#bookId').val())
		}
		$('#save').attr('disabled','')
		$('#error_str').text('')
		$('#load-layer').hide()
	});
});