var playTabId;
var nowIndex;
function getSheetId() {
	return new Promise(function(resolve, reject) {
		chrome.storage.local.get(["sheetId"], function(value) {
			resolve(value.sheetId);
		});
	});
}
function getListUrl(index) {
	return  $(`ul > li:eq(${index})`).find('a:eq(0)').attr('href');
}
function nextVideo() {
	var ur = getListUrl(++nowIndex);
	console.log("next url: " + ur);
	if (ur) chrome.tabs.update(playTabId, {url: ur}, function(tab) {
	});
}
var ttt = new Date();;
function runtime(msg) {
	var nt = new Date();
	console.log(msg + (nt - ttt));
	ttt = nt;
}

$(function() {
	getSheetId()
	.then((sheetId) => {
		runtime("strage");
		// スプレッドシートIDが設定されてなかったらoptionページへ
		if (!sheetId) {
			location.href = '/option.html?status=empty';
			throw new Error();
		}
		api.bookId = sheetId;
		// 先頭列取得
		return api.GetRange("list", "A:A", true);
	})
	.then((obj) => {
		runtime("A列取得");
		if (obj.error) {
			location.href = '/option.html?status=error'+obj.error.code;
			throw new Error();
		}
		var params = [];
		if (location.search != "") {
			$.each(location.search.substring(1).split("&"), function(i, one) {
				let p = one.split("=");
				params[p[0]] = decodeURI(p[1]);
			});
		} else {
			params["list"] = "def";
		}
		console.log("look: " + params["list"]);
		
		// 目的のフォルダの開始から終了を検索(sortされてること前提)
		var startRow, endRow;
		$.each(obj.values[0], function(i, dir) {
			if (!startRow && dir == params["list"]) {
				startRow = i + 1;
			}
			if (startRow && dir != params["list"]) {
				return false;
			}
			endRow = i + 1;
		});
		// 目的のフォルダの行全て取得(sortされてること前提)
		return api.GetRange("list", `${startRow}:${endRow}`);
	})
	.then((obj) => {
		runtime("全行取得");
		var list = [];
		$.each(obj.values, function(i, one) {
			var video = {
				id:one[0], index:one[1], url:one[2], title:one[3],
				thumbnail:one[4], tag:one[5], time:one[6], instm:one[7]
			};
			list.push(video);
		});
		console.log(list);
		
		var str = "";
		$.each(list, function(i, one) {
				str += `
					<li data-id="${i}">
						<table name="video-table" border="1">
							<tr class="title-row">
								<td rowspan="3" width="32px">
									<div class="check">
										<input type="checkbox" id="">
									</div>
								</td>
								<td class="thumbnail-col" rowspan="3" width="130px">
									<div class="img-area">
										<img class="thumbnail" width="130px" src="${one.thumbnail}">
									</div>
								</td>
								<td>
									<div class="play-here">
										<button value="${i}">ここから連続再生</button>
									</div>
									<div class="title">
										<a href="${one.url}">${one.title}</a>
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
	})
	.then(() => {
		runtime("list作成");
		$('.play-here').each(function() {
			$(this).find('button').on('click', function() {
				nowIndex = $(this).val();
				var ur = getListUrl(nowIndex);
				chrome.tabs.create({url:ur, active:true}, function(tab) {
					playTabId = tab.id;
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
		runtime("event");
	})
	.catch(reason => {
		console.log("error");
	});
	
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			if (request.id == "video_ended" && playTabId == sender.tab.id) {
				nextVideo();
			}
			return true;
		}
	);
	
});