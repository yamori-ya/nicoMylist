var playTabId;
var nowIndex;

function showLoad() {
	$('#load-layer, #loader').show();
}
function hideLoad() {
	$('#load-layer, #loader').hide();
}
function getListUrl(index) {
	$('.spinner').remove();
	var spinner = $("#spinner").clone().addClass('spinner');
	
	var item = $(`#list-${index}`);
	item.find('.thumbnail-area').append(spinner);
	scroll(item.offset().top-60);
	return item.find('a:eq(0)').attr('href');
}
function getCheckedLines() {
	var checked_video = [];
	$("input[type='checkbox']").filter(":checked").each((i,e) => {
		checked_video.push(Number($(e).val())+1);
	});
	return checked_video;
}
function scroll(height) {
	$('body,html').animate({ scrollTop: height }, 300);
  return false;
}

function loadBook(bookId) {
	showLoad();
	$('#folder-list, #list').empty();
	
	const sTime = Date.now();
	
	getSyncStorage(["bookId"])
	.then((value) => {
		if (!value.bookId) { // ブックIDが未設定
			location.href = '/option.html?status=empty';
			return;
		}
		api.bookId = value.bookId;
		return api.GetRange(["info!A:A", "list!A:I"]);
	})
	.then((obj) => {
		console.dir(obj);
		if (obj.error) { // シートへのアクセス失敗
			location.href = '/option.html?status=error'+obj.error.code;
			return;
		}
		
		cache_data = {
			folder: obj.valueRanges[0].values.flat(),
			data: obj.valueRanges[1].values.map((val, i) => {
				return {
					line:i, folder:val[0], index:val[1], url:val[2], title:val[3],
					thumbnail:val[4], tag:val[5], time:val[6], comment:val[7], instm:val[8]
				};
			})
		};
		setLocalStorage({
			cache: cache_data,
			have_to_reload: false
		});
		createList(cache_data, params["list"]);
		const endTime = Date.now();
		console.log("load book time: " + (endTime - sTime));
	});
}

function createList(obj, name) {
	const startTime = Date.now();
	var str = "";
	var cnt = 0;
	$.each(obj.data, function(i, one) {
		if (one.folder != name)
			return true;
		
		var tags = "";
		if (one.tag && one.tag.length > 0)
		tags = one.tag.split(' ').map(t => `<li><span>${t}</span></li>`).join('');
		
		cnt++;
		str += `
<li data-id="${cnt}" id="list-${cnt}" class="list">
	<div class="video">
		<label class="check-label">
			<input type="checkbox" class="video-check" value="${one.line}">
			<div class="check-box"></div>
		</label>
		<a class="thumbnail-area" href="${one.url}"><img src="${one.thumbnail}"></a>
		<div>
			<div class="title-area"><a href="${one.url}">${one.title}</a></div>
			<ul class="tag-area">${tags}</ul>
			<div class="comment-area">${one.comment}</div>
		</div>
		<div class="handle-area">
			<span id="menuButton" class="handle"><span></span></span>
		</div>
		
		<div class="play-here">
			<button class="play-button" value="${cnt}">
				<svg id="play-here"><use xlink:href="sprite.svg#icon-play_here"/></svg>
			</button>
		</div>
	</div>
</li>`;
	});
	$('#video').html(str);
	
	
	// マイリスト一覧作成
	$('#folder-list').html(
		obj.folder.map((f) => {
			var name = decodeURI(f);
			return `<li><a target="_self" href="/mylist.html?list=${name}">${name}</a></li>`;
		}).join('')
	);
	
	// チェックボックスの動作
	$('.video-check').on('change', function() {
		$(this).next().toggleClass('check');
		$(this).parents('.video').toggleClass('video-checked');
	});
	
	// 連続再生ボタンの動作
	$('.play-button').on('click', function() {
		nowIndex = $(this).val();
		console.log("button index: " + nowIndex);
		
		setLocalStorage({nico_full_screen:false});
		chrome.tabs.create({url:getListUrl(nowIndex), active:true}, function(tab) {
			playTabId = tab.id;
			setLocalStorage({player_tab_id:playTabId});
		});
	});
	
	console.log("create list time: " + (Date.now() - startTime));
	
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
		
	});
	$('#reload').click(() => {
		loadBook();
	});
	$('#option').click(() => {
		chrome.tabs.create({url:'/option.html', active:true}, null);
	});
	
	// $('#move').on('click', () => {
	// 	$('.modal').show('500');
	// });
	// $('.modal-back').on('click', function() {
	// 	$('.modal').hide('500');
	// });
	
	
	$('#delete').click(() => {
		
		var checked_video = getCheckedLines();
		if (checked_video.length == 0 || !window.confirm(checked_video.length + "件 削除します")) return false;
		
		showLoad();
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
	
	// 一番上、一番下ボタン
	$('.scroll-btn > .top'   ).on('click', () => scroll(0) );
	$('.scroll-btn > .bottom').on('click', () => scroll($(document).height()) );	
	
	
	// ######################## 検索 ########################
	$('.search').on('submit', function() {
		alert('test');
	})
	
	
	// ########################連続再生関係########################
	
	// 動画終了通知を受け取って次の動画へ移動
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			if (request.id == "video_ended" && playTabId == sender.tab.id) {
				var url = getListUrl(++nowIndex);
				console.log("next url: " + url);
				if (url) chrome.tabs.update(playTabId, {url: url}, function(tab) {});
			}
			return true;
		}
	);
	
	chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
		if (tabId == playTabId) {
			console.log('closed player tab.');
			$('.spinner').remove();
		}
	});
});