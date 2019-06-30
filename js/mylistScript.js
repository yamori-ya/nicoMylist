var playTabId;
var nowIndex;
var list;

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
function scroll(height) {
	$('body,html').animate({ scrollTop: height }, 300);
  return false;
}

function loadBook(bookId) {
	showLoad();
	$('#folder-list, #list').empty();
	
	const startTime = Date.now();
	
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
		const endTime = Date.now();
		console.log("load book time: " + (endTime - startTime));
	});
}

function createList(obj, name) {
	var str = "";
	var cnt = 0;
	$.each(obj.data, function(i, one) {
		if (one.folder != name)
			return true;
		
		var tags = "";
		if (one.tag && one.tag.length > 0)
		$.each(one.tag.split(' '), (i, t) => {
			tags += `<li><span>${t}</span></li>`;
		});
		cnt++;
		str += `
<li data-id="${cnt}" id="list-${cnt}" class="list">
	<div>
		<div class="check-area">
			<label class="check-label">
				<input type="checkbox" class="video-check" value="${one.line}">
				<div class="check-box"></div>
			</label>
		</div>
		
		<div class="thumbnail-area">
			<a target="_brank" href="${one.url}">
				<img class="thumbnail" width="130px" src="${one.thumbnail}">
			</a>
		</div>
		<div>
			<div class="title-area">
				<a target="_brank" href="${one.url}">${one.title}</a>
			</div>
			<ul class="tag-area">${tags}</ul>
			<div class="comment-area">${one.comment}</div>
		</div>
		<div class="handle-area">
			<span id="menuButton" class="handle">
				<span></span>
			</span>
		</div>
		
		<div class="play-here">
			<button value="${cnt}">ここから連続再生</button>
		</div>
	</div>
	
</li>
`;
	});
	$('#video').html(str);
	list = $('.list')
	
	str = "";
	$.each(obj.folder, (i, f) => {
		var name = decodeURI(f);
		str += `<li><a href="/mylist.html?list=${name}">${name}</a></li>`;
	})
	$('#folder-list').html(str);
	
	$('.video-check').on('change', function() {
		$(this).next().toggleClass('check');
	});
	
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
		var found_dom = false;
		var win_h = $(window).height();
		var scrl_top = $(window).scrollTop();
		$(list).each(function(i, e) {
			var top = $(e).offset().top; // ターゲットの位置
			var height = $(e).height();  // ターゲットの高さ
			
			var chk_dom = $(e).find('.check-area');
			var hdl_dom = $(e).find('.handle-area');
			
			if (top <= win_h + scrl_top && top + height > scrl_top ) {
				found_dom = true;
				$(chk_dom).addClass('speed-400');
				$(hdl_dom).addClass('speed-400');
			} else if (found_dom) return false;
		});
		var removeSpeed = (e) => { $(e).removeClass('speed-400') }
		$('.check-area' ).toggleClass('width0'   ).on('transitionend', removeSpeed);
		$('.handle-area').toggleClass('invisible').on('transitionend', removeSpeed);
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
	
	$('.scroll-btn > .top').on('click', () => {
		scroll(0);
	});
	$('.scroll-btn > .bottom').on('click', () => {
		scroll($(document).height());
	});
	
	
	// ########################連続再生関係########################
	
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