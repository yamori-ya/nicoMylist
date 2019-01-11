var playTabId;
var nowIndex;
function showLoad() {
	$('#load-layer, #loader').show();
}
function hideLoad() {
	$('#load-layer, #loader').hide();
}
function getListUrl(index) {
	return  $(`ul > #list-${index}`).find('a:eq(0)').attr('href');
}
function getCheckedLines() {
	var checked_video = [];
	$("input[type='checkbox']").filter(":checked").each((i,e) => {
		checked_video.push(Number($(e).val())+1);
	});
	return checked_video;
}

function loadBook(bookId) {
	showLoad();
	$('#folder-list, #list').empty();
	getSyncStorage(["bookId"])
	.then((value) => {
		if (!value.bookId) { // ブックIDが未設定
			location.href = '/option.html?status=empty';
			return;
		}
		api.bookId = value.bookId;
		return api.GetRange(["info!A:A", "list!A:H"]);
	})
	.then((obj) => {
		if (obj.error) { // シートへのアクセス失敗
			location.href = '/option.html?status=error'+obj.error.code;
			return;
		}
		var list = [];
		$.each(obj.valueRanges[1].values, (i, one) => {
			list.push({
				line:i, folder:one[0], index:one[1], url:one[2], title:one[3],
				thumbnail:one[4], tag:one[5], time:one[6], comment:one[7], instm:one[8]
			});
		});
		cache_data = {
			folder: obj.valueRanges[0].values.flat(),
			data: list
		};
		setLocalStorage({
			cache:cache_data,
			have_to_reload:false
		});
		createList(cache_data, params["list"]);
	});
}

function createList(obj, name) {
	var str = "";
	var cnt = 0;
	$.each(obj.data, function(i, one) {
		if (one.folder != name)
			return true;
		cnt++;
		str += `
<li data-id="${cnt}" id="list-${cnt}">
	<table name="video-table" border="1">
		<tr class="title-row">
			<td rowspan="3" width="32px" class="check-area">
				<div>
					<input type="checkbox" value="${one.line}" class="check_css"/>
				</div>
			</td>
			<td class="thumbnail-col" rowspan="3" width="130px">
				<div class="img-area">
					<a target="_brank" href="${one.url}">
						<img class="thumbnail" width="130px" src="${one.thumbnail}">
					</a>
				</div>
			</td>
			<td>
				<div class="play-here">
					<button value="${cnt}">ここから連続再生</button>
				</div>
				<div class="title">
					<a target="_brank" href="${one.url}">${one.title}</a>
				</div>
			</td>
			<td rowspan="3" width="32px">
				<span id="menuButton" class="handle">
					<span></span>
				</span>
			</td>
		</tr>
		<tr class="tags-row">
			<td>
				<div>${one.tag}</div>
			</td>
		</tr>
		<tr class="comment-row">
			<td class="comment-col">
				<div class="comment">${one.comment}</div>
			</td>
		</tr>
	</table>
	<br>
	<br>
</li>`;
	});
	$('#list').html(str);
	
	str = "";
	$.each(obj.folder, (i, f) => {
		var name = decodeURI(f);
		str += `<li><a href="/mylist.html?list=${name}">${name}</a></li>`;
	})
	$('#folder-list').html(str);
	
	$('.play-here').each(function() {
		$(this).find('button').on('click', function() {
			nowIndex = $(this).val();
			console.log("button index: " + nowIndex);
			
			setLocalStorage({nico_full_screen:false});
			chrome.tabs.create({url:getListUrl(nowIndex), active:true}, function(tab) {
				playTabId = tab.id;
				setLocalStorage({player_tab_id:playTabId});
			});
		});
	});
	// 各テーブルにマウスが乗ると再生ボタン表示
	$('[name=video-table]').each(function() {
		$(this).hover(
			() => $(this).find('.play-here').toggle(),
			() => $(this).find('.play-here').toggle()
		);
	});
	
	// リストが作成されたらぐるぐる非表示
	hideLoad();
}


$(function() {
	// ページ表示前にぐるぐる表示
	showLoad();
	
	params = getUrlParams();
	if (!params["list"]) {
		params["list"] = "def";
	}
	console.log("look: " + params["list"]);
	
	getLocalStorage(["cache", "have_to_reload"])
	.then((value) => {
		if (value.cache && !value.have_to_reload) {
			// キャッシュからロード
			console.log("load cache");
			createList(value.cache, params["list"]);
		}
		else {
			// ブックからロード
			console.log("load sheet");
			loadBook();
		}
	});
	
	// ボタン動作
	$('#edit').on('click', () => {
		if ($('.check-area').css('display') == 'none') {
			$('.check-area').animate( { width: 'show' }, () => {
				$('.check-area').find('input').show();
			});
		} else {
			$('.check-area').animate( { width: 'hide' } );
			$('.check-area').find('input').hide();
		}
	});
	$('#reload').click(() => {
		loadBook();
	});
	$('#option').click(() => {
		location.href = '/option.html';
	});
	
	$('#delete').click(() => {
		showLoad();
		var checked_video = getCheckedLines();
		console.log("delete line index: " + checked_video);
		getSyncStorage(["bookId", "sheetIds"])
		.then((value) => {
			api.bookId = value.bookId;
			return api.DeleteLine(value.sheetIds.list, checked_video);
		})
		.then((response) => {
			loadBook();
		})
	});
	
	// 動画終了通知を受け取って次の動画へ移動
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			if (request.id == "video_ended" && playTabId == sender.tab.id) {
				var ur = getListUrl(++nowIndex);
				console.log("next url: " + ur);
				if (ur) chrome.tabs.update(playTabId, {url: ur}, function(tab) {});
			}
			return true;
		}
	);
});