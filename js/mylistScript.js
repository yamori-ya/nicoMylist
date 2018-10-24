var playTabId;
var nowIndex;
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

function createList(list) {
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
	$('.play-here').each(function() {
		$(this).find('button').on('click', function() {
			nowIndex = $(this).val();
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
	console.log("start");
	
	getLocalStorage(["cache", "sheetId", "always_load"])
	.then((value) => {
		if (value.cache && !value.always_load) {
			console.log("load cache");
			createList(value.cache);
		}
		else {
			console.log("load sheet");
			if (!value.sheetId) {
				// シートIDが未設定
				location.href = '/option.html?status=empty';
				throw new Error();
			}
			api.bookId = value.sheetId;
			api.GetRange("list", "A:H").then((obj) => {
				runtime("データ取得");
				if (obj.error) {
					// シートへのアクセス失敗
					location.href = '/option.html?status=error'+obj.error.code;
					throw new Error();
				}
				// urlからパラメータ取得
				params = getUrlParams();
				if (!params["list"]) {
					params["list"] = "def";
				}
				console.log("look: " + params["list"]);
				
				var list = [];
				$.each(obj.values, function(i, one) {
					if (one[0] == params["list"]) {
						var video = {
							folder:one[0], index:one[1], url:one[2], title:one[3],
							thumbnail:one[4], tag:one[5], time:one[6], instm:one[7]
						};
						list.push(video);
					}
				});
				setLocalStorage({cache:list});
				createList(list);
			})
		}
	})
	.catch(reason => {
		console.log("error");
	});
	
	$('#menu').click(function() {
		$('.menu').first().slideToggle();
	})
	
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			if (request.id == "video_ended" && playTabId == sender.tab.id) {
				nextVideo();
			}
			return true;
		}
	);
});