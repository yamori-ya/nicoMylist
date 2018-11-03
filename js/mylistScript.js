var playTabId;
var nowIndex;
function getListUrl(index) {
	return  $(`ul > #list-${index}`).find('a:eq(0)').attr('href');
}

function loadSheet(sheetId) {
	api.bookId = sheetId;
	api.GetRange(["info!A:A", "list!A:H"]).then((obj) => {
		runtime("データ取得");
		if (obj.error) { // シートへのアクセス失敗
			location.href = '/option.html?status=error'+obj.error.code;
			throw new Error();
		}
		var list = [];
		$.each(obj.valueRanges[1].values, (i, one) => {
			list.push({
				line:i, folder:one[0], index:one[1], url:one[2], title:one[3],
				thumbnail:one[4], tag:one[5], time:one[6], instm:one[7]
			});
		});
		cache_data = {
			folder: obj.valueRanges[0].values.flat(),
			data: list
		};
		setLocalStorage({cache:cache_data});
		createList(cache_data, params["list"]);
	});
}

var ttt = new Date();;
function runtime(msg) {
	var nt = new Date();
	console.log(msg + (nt - ttt));
	ttt = nt;
}

function createList(obj, name) {
	var str = "";
	$.each(obj.data, function(i, one) {
		if (one.folder != name)
			return true;
		str += `
			<li data-id="${i}" id="list-${i}">
				<table name="video-table" border="1">
					<tr class="title-row">
						<td rowspan="3" width="32px">
							<div class="">
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
								<button value="${i}">ここから連続再生</button>
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
			</li>
		`;
	});
	$('.list').html(str);
	
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
			var ur = getListUrl(nowIndex);
			setLocalStorage({nico_full_screen:false});
			chrome.tabs.create({url:ur, active:true}, function(tab) {
				playTabId = tab.id;
				setLocalStorage({player_tab_id:playTabId});
			});
		});
	});
	$('[name=video-table]').each(function() {
		var but = $(this).find('.play-here');
		$(this).hover(
			function(){ but.css('visibility', 'visible'); },
			function(){ but.css('visibility', 'hidden'); }
		);
	});
}


$(function() {
	params = getUrlParams();
	if (!params["list"]) {
		params["list"] = "def";
	}
	console.log("look: " + params["list"]);
	
	
	getLocalStorage(["cache", "sheetId", "always_load"])
	.then((value) => {
		if (value.cache && !value.always_load) {
			console.log("load cache");
			createList(value.cache, params["list"]);
		}
		else {
			console.log("load sheet");
			if (!value.sheetId) { // シートIDが未設定
				location.href = '/option.html?status=empty';
				throw new Error();
			}
			loadSheet(value.sheetId);
		}
	})
	.catch(reason => {
		console.log("error");
	});
	
	$('#menu').click(() => {
		$('.menu').first().slideToggle();
	})
	$('#reload').click(() => {
		$('folder-list').empty();
		$('list').empty();
		getLocalStorage(["sheetId"]).then((value) => {
			loadSheet(value.sheetId);
		});
	});
	$('#option').click(() => {
		location.href = '/option.html';
	});
	$('#delete').click(() => {
		var checked_video = [];
		$("input[type='checkbox']").filter(":checked").each((i,ele) => {
			checked_video.push(Number($(ele).val())+1);
		});
		console.log("delete line index: " + checked_video);
		getLocalStorage(["sheetId", "list_sheet_id"]).then((value) => {
			api.bookId = value.sheetId;
			api.DeleteLine(value.list_sheet_id, checked_video);
		});
	});
	
	
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