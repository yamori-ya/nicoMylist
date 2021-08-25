
// 動画情報
var video_info;
if (document.domain == "www.nicovideo.jp") {
	
}
else if (document.domain == "www.youtube.com") {
	
	function getDomText(selector) {
		return new Promise((resolve, reject) => {
			let cnt = 0;
			let iv = setInterval(() => {
				if (++cnt > 10) {
					clearInterval(iv)
					resolve('')
				}
				let dom = document.querySelector(selector)
				if (dom && dom.textContent.trim()) {
					clearInterval(iv)
					resolve(dom.textContent)
				}
			}, 500)
		})
	}
	Promise.all([
		getDomText('h1.title'),
		getDomText('.super-title'),
		getDomText('.ytp-time-duration')
	]).then(val => {
		let id = location.href.match(/watch\?v=(.+)/)[1], now = new Date()
		videoInfo = [
			"def", "index", location.href, val[0],
			`http://img.youtube.com/vi/${id}/hqdefault.jpg`,
			val[1], val[2], "",
			 `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
		];
		// popへ動画情報送信　のためにbackgroundへ送信
		sendMessage({id:"getVideoInfo", data:videoInfo})
	})
}






// videoを正常に取得できるまで500ms間隔で取得
function getVideo() {
	return new Promise(function(resolve, reject) {
		var iv = setInterval(function() {
			console.log('video load');
			var video = $('video')[0];
			if (!video || !$(video).prop('src')) 
				return;
			clearInterval(iv);
			resolve(video);
		}, 500)
	})
}


Promise.all([
	getLocalStorage(["player_tab_id", "nico_full_screen"]),
	getSyncStorage("nico_setting"),
	sendMessage({id:"get_current_tab"}),
]).then((values) => {
	
	var storage = values[0];
	var nico_setting = values[1];
	var currentTabId = values[2].tab.id;
	
	if (document.domain == "www.nicovideo.jp") {
		
		// 動画が見えるところまでスクロール
		var justScroll = function() {
			var metaRow = $(".HeaderContainer-row").eq(1);
			var pos = metaRow.position().top;
			$(window).first().scrollTop(pos);
		}
		
		// 連続再生時
		if (storage.player_tab_id == currentTabId) {
			if (storage.nico_full_screen) {
				// 前回動画終了時にフルスクリーンだったら今動画もフルスクリーンに
				$('.EnableFullScreenButton').first().click();
			} else {
				justScroll();
			}
			$('.PlayerPlayButton').first().click();
		}
		// 通常再生時
		else {
			if (nico_setting.scroll) justScroll();
		}
		
		getVideo().then(video => {
			$(video).on('ended', function() {
				console.log("video ended");
				// 現在動画がフルスクリーンだったら次もフルスクリーンにするために状態を保存
				setLocalStorage({nico_full_screen:$('body').hasClass('is-fullscreen')});
				// マイリストタブへ動画終了を通知
				sendMessage({id:"video_ended"});
			});
		});
		
	}
	
	if (document.domain == "www.youtube.com") {
		getVideo().then((video) => {
			$(video).on('ended', function() {
				console.log("video ended");
				// マイリストタブへ動画終了を通知
				sendMessage({id:"video_ended"});
			});
		});
	}
});


