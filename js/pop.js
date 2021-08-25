var videoInfo; // 動画情報
var play; // 連続再生中か



$(function() {
	
	$('#show-mylist button').on('click', function() {
		chrome.tabs.create({url: URL_MYLIST});
	});
	
	
	getLocalStorage('cacheF')
	.then(f => {
		console.log(f);
		$('#folder').append(f.cacheF.map(i => `<option value="${i}">${i}</option>`).join())
	})
	
	
	// 現ウインドアクティブダブへ命令
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		
		var tab = tabs[0];
		var nico = tab.url.match(/www\.nicovideo\.jp\/watch\/.+/);
		var yout = tab.url.match(/www\.youtube\.com\/watch\?v=.+/);
		
		if (!nico && !yout) {
			$('#video-info').hide();
			
			if (!play) { // ビデオページでなく、連続再生中でもない場合即マイリスト表示
				chrome.tabs.create({url: URL_MYLIST + '?list=歌'});
			}
			return;
		}
		if (nico) {
			var id = tab.url.match(/(?<=watch\/)[^\/]+/)[0]
			$.ajax({
				url: 'https://ext.nicovideo.jp/api/getthumbinfo/' + id,
				type: 'GET',
				timeout: 500
			})
			.done(xmlDoc => {
				var  xml = $(xmlDoc), now = new Date()
				videoInfo = [
					"def", "index",
					xml.find('watch_url'    ).text(),
					xml.find('title'        ).text(),
					xml.find('thumbnail_url').text(),
					xml.find('tag').get().map(t => t.innerHTML).join(' '),
					xml.find('length'       ).text(),
					"", `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
				];
				$('#title').text(videoInfo[3]);
			})
			.fail(error => {})
		}
		if (yout) {
			videoInfo = chrome.extension.getBackgroundPage().videoInfo
			console.log(videoInfo);
			$('#title').text(videoInfo[3]);
		}
	});
	
	
	$('#add').on('click', function() {
		videoInfo[0] = $('#folder').val()
		sendMessage({id:"add_video", videoInfo:videoInfo})
		.then(response => {
			console.log(response);
			
			if (response.result == "success") {
				setSyncStorage({reload:true});
				alert("追加完了");
			} else if (response.result == "faild") {
				alert("失敗");
			}
		});
		
	});
	
});