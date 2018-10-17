
function justmeetScroll() {
	// 動画が見えるところまでスクロール
	var metaRow = $(".HeaderContainer-row").eq(1);
	var pos = metaRow.position().top;
	$(window).first().scrollTop(pos);
}

$(function() {
	
	if (document.domain == "www.nicovideo.jp") {
		$('.CommentPanelContainer').css('top','88px');
		$('.VideoMenuContainer').css({
			'top':'40px',
			'position':'absolute'
		});
		var nicoMylistArea = '<div class="nicoMylist"></div>';
		var defListBut = `
			<div class="nicoMylist" style="padding-left: 8px;">
				<button id="nicoDeflist" class="but">
					<div class="but_frame free">
						<svg id="but_svg" class="but_svg" class="path" viewBox="0 0 101 84" >
						<path 
						d="M43.9 0a9 9 0 0 1 2 .3 7.9 7.9 0 0 1 5 4.1l3 7.7h39.3a8 8 0 0 1 6.4 5.2 8 8 0 0 1 .5 2.7 4462.2 4462.2 0 0 1-.1 57 8 8 0 0 1-7.8 7A6639.4 6639.4 0 0 1 7 84a8 8 0 0 1-7-7.8V72 8a8.5 8.5 0 0 1 .6-2.8A8 8 0 0 1 5.4.4C6.2.2 7 0 7.8 0h36zM12 8a4 4 0 0 0-4 4v60a4 4 0 0 0 4 4h76a4 4 0 0 0 4-4V24a4 4 0 0 0-4-4 26704.4 26704.4 0 0 1-35.8-.1 8 8 0 0 1-5.5-4.3l-2-5.1A4 4 0 0 0 41 8H12zm47 44.2l-7.7 7.5a3.8 3.8 0 0 1-4.1.7c-1.4-.6-2.3-2-2.3-3.5l.7-22.6c.1-2 1.7-3.5 3.7-3.6l23.1-.7c1.6 0 3 .8 3.6 2.2.6 1.4.3 3-.8 4.1l-5 5C74.8 47.4 84.8 62.6 85 74c0 0-11.5-16.4-25.9-21.8z"></path>
						</svg>
					</div>
				</button>
			</div>`;
		$('.MainContainer-commentPanel').prepend(nicoMylistArea);
		$('.nicoMylist').append(defListBut);
		
		
		$('#nicoDeflist').one('click', function() {
			$('.but_frame').removeClass('free');
			$('.but_frame').addClass('added');
			
			VideoInfo.getVideoInfoArray(location.href,"def")
			.then((arr) => {
				chrome.runtime.sendMessage({id:"nicoMylist", videoInfo:arr}, function(response) {
					if (response.result == "success") {
						alert("追加完了");
					} else if (response.result == "faild") {
						alert("追加失敗");
					}
				});
			});
		});
		
		
		const GET_VALUE = [
			"player_tab_id",
			"nico_full_screen",
			//"youtube_full_screen",
			"just_scroll",
			"auto_play",
		];
		var task1 = sendMessage({id:"get_current_tab"});
		var task2 = getLocalStorage(GET_VALUE);
		Promise.all([task1, task2]).then((values) => {
			var currentTabId = values[0].tab.id;
			var storage = values[1];
			if (storage.player_tab_id == currentTabId) {
				if (storage.nico_full_screen) {
					// 前回動画終了時にフルスクリーンだったら今動画もフルスクリーンに
					$('.EnableFullScreenButton').first().click();
				}
				else {
					justmeetScroll();
				}
				$('.PlayerPlayButton').first().click();
			}
			else {
				if (storage.just_scroll) justmeetScroll();
				if (storage.auto_play) $('.PlayerPlayButton').first().click();
			}
		});
		
	}
	
	if (document.domain == "www.youtube.com") {
		
	}
	
	// ニコニコは1秒くらい待たないとvideoが正常に取得できない
	setTimeout(function() {
		var video = document.getElementsByTagName('video')[0];
		video.onended = function(){
			console.log("video ended");
			setLocalStorage({nico_full_screen:$('body').hasClass('is-fullscreen')});
			chrome.runtime.sendMessage(
				{id:"video_ended"},
				(response) => {}
			);
		}
	}, 1000);
	
});
