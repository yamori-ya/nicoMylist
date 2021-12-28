// videoを正常に取得できるまで500ms間隔で取得
function getVideo() {
	return new Promise((resolve, reject) => {
		let cnt = 0
		let iv = setInterval(() => {
			if (++cnt > 2) {
				console.log('video loading failed');
				clearInterval(iv);
				reject(null);
			}
			let video = document.querySelector('video');
			if (!video || !video.getAttribute('src')) 
				return;
			clearInterval(iv);
			resolve(video);
			console.log('video loaded');
		}, 500)
	})
}


window.onload = async function() {
	let storage = await getLocalStorage(["player_tab_id", "nico_full_screen"]);
	let nico_setting = (await getSyncStorage("nico_setting")).nico_setting;
	let currentTabId = (await sendMessage({id:"get_current_tab"})).tab.id;
	
	if (document.domain == "www.nicovideo.jp") {
		
		// 動画が見えるところまでスクロール
		let justScroll = function() {
			let metaRow = document.querySelectorAll('.HeaderContainer-row')[1];
			window.scroll(0, metaRow.offsetTop);
		}
		
		// 連続再生時
		if (storage.player_tab_id == currentTabId) {
			if (storage.nico_full_screen) {
				// 前回動画終了時にフルスクリーンだったら今動画もフルスクリーンに
				document.querySelector('.EnableFullScreenButton').click();
			} else {
				justScroll();
			}
			document.querySelector('.PlayerPlayButton').click();
		}
		// 通常再生時
		else {
			if (nico_setting.scroll) justScroll();
		}
		
		let video = await getVideo();
		if (!video) return;
		video.addEventListener('ended', () => {
			console.log("video ended");
			// 現在動画がフルスクリーンだったら次もフルスクリーンにするために状態を保存
			setLocalStorage({nico_full_screen: document.body.classList.contains('is-fullscreen')});
			// マイリストタブへ動画終了を通知
			sendMessage({id:"video_ended"});
		})
		// 画面クリック再生機能
		if (nico_setting.click2play)
		document.querySelector('.VideoSymbolContainer-canvas').addEventListener('click', () => {
			video.paused ? 
			document.querySelector('.ActionButton.ControllerButton.PlayerPlayButton').click() :
			document.querySelector('.ActionButton.ControllerButton.PlayerPauseButton').click() ;
		})
	}
	
	if (document.domain == "www.youtube.com") {
		let video = await getVideo();
		if (!video) return;
		video.addEventListener('ended', () => {
			console.log("video ended");
			// マイリストタブへ動画終了を通知
			sendMessage({id:"video_ended"});
		});
	}
}