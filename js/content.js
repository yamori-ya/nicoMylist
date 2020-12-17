
$.fn.tap = function() {
	return $(this).on({
		touchstart: function(e) {
			$(this).data('tap', true)
			var to = setTimeout(() => {
				$(this).data('tap', false)
				$(this).trigger('subfocus')
			}, 200)
			$(this).data('tap_to', to)
		},
		touchmove: function(e) {
			if ($(this).data('tap')) {
				$(this).trigger('subfocus')
				$(this).data('tap', false)
				clearTimeout($(this).data('tap_to'))
			}
		},
		touchend: function(e) {
			if ($(this).data('tap')) {
				$(this).data('tap', false)
				clearTimeout($(this).data('tap_to'))
				e.type = 'temp'
				$(this).trigger(e)
				e.preventDefault()
			}
		},
		temp: function(e) {
			e.touches = e.changedTouches
			e.changedTouches = void(0)
			if ($(this).data('dbltap')) {
				$(this).data('dbltap', false)
				clearTimeout($(this).data('dbltap_to'))
				e.type = 'doubletap'
				$(this).trigger(e)
			} else {
				$(this).data('dbltap', true)
				var to = setTimeout(() => {
					$(this).data('dbltap', false)
					e.type = 'tap'
					$(this).trigger(e)
				}, 200)
				$(this).data('dbltap_to', to)
			}
		}
	})
}

const OVER_LAYER = `
<div id="over-layer">
	<div id="play" class="controll-button">
		<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 13.229 13.229">
			<path d="M13.23 6.615a6.615 6.615 0 0 1-6.615 6.614A6.615 6.615 0 0 1 0 6.615 6.615 6.615 0 0 1 6.615 0a6.615 6.615 0 0 1 6.614 6.615z"/>
			<path d="M10.054 6.615l-5.16 2.978V3.636z" fill="#fff"/>
		</svg>
	</div>
	<div id="pause" class="controll-button">
		<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 13.229 13.229">
			<g transform="translate(0 -283.77)">
				<circle cx="6.615" cy="290.385" r="6.615"/>
				<path fill="#fff" d="M3.969 287.21h1.852v6.35H3.969zM7.408 287.21H9.26v6.35H7.408z"/>
			</g>
		</svg>
	</div>
</div>`



// 動画情報
var video_info;
if (document.domain == "www.nicovideo.jp") {
	
}
else if (document.domain == "www.youtube.com") {
	
}

// popへ動画情報送信
// chrome.runtime.onMessage.addListener(
// 	function(request, sender, sendResponse) {
// 		if (request.id == "getVideoInfo") {
// 			sendResponse({data: video_info});
// 		}
// 		return true;
// 	}
// );


const PROP = [
	"player_tab_id",
	"nico_full_screen",
	"nico_setting",
];

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
	getLocalStorage(PROP),
	sendMessage({id:"get_current_tab"}),
]).then((values) => {
	
	var storage = values[0];
	var nico_setting = storage.nico_setting;
	var currentTabId = values[1].tab.id;
	
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
			if (nico_setting.just_scroll) justScroll();
		}
		
		getVideo().then(video => {
			$('.PlayerContainer').focus();
			$(video).on('ended', function() {
				console.log("video ended");
				// 現在動画がフルスクリーンだったら次もフルスクリーンにするために状態を保存
				setLocalStorage({nico_full_screen:$('body').hasClass('is-fullscreen')});
				// マイリストタブへ動画終了を通知
				sendMessage({id:"video_ended"});
			});
			
			// タップ操作処理
			$('.InView.VideoContainer').tap()
			.on('tap click', function(e) {
				$('.PlayerPlayButton, .PlayerPauseButton').click()
			})
			.on('doubletap', function(e) {
				var lr = ($(this).width() / 2 < e.touches[0].pageX - $(this).offset().left)
				$(lr ? '.PlayerSeekForwardButton' : '.PlayerSeekBackwardButton').click()
			})
			.on('subfocus', function(e) {
				if ($('.is-fullscreen').length && !$('.is-fixedFullscreenController').length) {
					var container = $(this).parent()
					container.addClass('is-mouseMoving')
					clearTimeout($(this).data('focus_to'))
					var to = setTimeout(() => {
						container.removeClass('is-mouseMoving')
					}, 2000)
					$(this).data('focus_to', to)
				}
			})
			// 初回再生で再生停止機能、アイコン追加
			$(video).on('play', function() {
				$('.InView.VideoContainer').append(OVER_LAYER)
				$(video).off('play')
			})
			// アイコン処理
			var pause_play = function() {
				if (video.paused) {
					$('#pause').css('visibility', 'hidden' ).removeClass('click')
					$('#play' ).css('visibility', 'visible').addClass('click')
				} else {
					$('#pause').css('visibility', 'visible').addClass('click')
					$('#play' ).css('visibility', 'hidden' ).removeClass('click')
				}
			}
			$('.ControllerContainer-inner').on('click', '.PlayerPlayButton, .PlayerPauseButton', pause_play)
			$('.PlayerContainer').on('keydown', e => { if (e.keyCode == 32) pause_play() })
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


