const PROP = [
	"player_tab_id",
	"nico_full_screen",
	"nico_setting",
];

// videoを正常に取得できるまで500ms間隔で取得
function getVideo() {
	return new Promise(function(resolve, reject) {
		setTimeout(function() {
			console.log("video load");
			var video = document.getElementsByTagName('video')[0];
			
			// 正常にvideo取得できなかったらもう一度
			if (!video || !$(video).prop('src')) {
				getVideo().then((video) => resolve(video));
			}
			// videoロードが完了したら
			if (video && $(video).prop('src')) {
				console.log("loaded video element: ->");
				console.log(video);
				resolve(video);
			}
		}, 500);
	});
}




Promise.all([
	getLocalStorage(PROP),
	sendMessage({id:"get_current_tab"}),
	new Promise(function(resolve, reject) {
		$(function() { resolve(); });
	}),
]).then((values) => {
	
	var storage = values[0];
	var nico_setting = storage.nico_setting;
	var currentTabId = values[1].tab.id;
	var popopLayerHeight;
	
	if (document.domain == "www.nicovideo.jp") {
		popopLayerHeight = $('#js-app').height();
		
		$('.CommentPanelContainer').css('top','88px');
		var nicoMylistArea = '<div class="nicoMylist"></div>';
		var buttons = `
			<div class="nicoDeflist" style="padding-left: 8px;">
				<button id="nicoDeflist" class="hide-button">
					<div class="but_frame free">
						<svg id="but_svg" class="but_svg" class="path" viewBox="0 0 101 84" >
						<path 
						d="M43.9 0a9 9 0 0 1 2 .3 7.9 7.9 0 0 1 5 4.1l3 7.7h39.3a8 8 0 0 1 6.4 5.2 8 8 0 0 1 .5 2.7 4462.2 4462.2 0 0 1-.1 57 8 8 0 0 1-7.8 7A6639.4 6639.4 0 0 1 7 84a8 8 0 0 1-7-7.8V72 8a8.5 8.5 0 0 1 .6-2.8A8 8 0 0 1 5.4.4C6.2.2 7 0 7.8 0h36zM12 8a4 4 0 0 0-4 4v60a4 4 0 0 0 4 4h76a4 4 0 0 0 4-4V24a4 4 0 0 0-4-4 26704.4 26704.4 0 0 1-35.8-.1 8 8 0 0 1-5.5-4.3l-2-5.1A4 4 0 0 0 41 8H12zm47 44.2l-7.7 7.5a3.8 3.8 0 0 1-4.1.7c-1.4-.6-2.3-2-2.3-3.5l.7-22.6c.1-2 1.7-3.5 3.7-3.6l23.1-.7c1.6 0 3 .8 3.6 2.2.6 1.4.3 3-.8 4.1l-5 5C74.8 47.4 84.8 62.6 85 74c0 0-11.5-16.4-25.9-21.8z"></path>
						</svg>
					</div>
				</button>
				<button id="select-list" class="hide-button">
					<div class="but_frame free">
						<svg viewBox="0 0 100 84" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.4" id="but_svg" class="but_svg">
							<path d="M22 0h22c.4 0 .8 0 1.1.2A8 8 0 0 1 51 4.9l3 7.1H92a8 8 0 0 1 8 8v56a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8V8a8 8 0 0 1 8-8h14zm48.2 53.4v-11a1.3 1.3 0 0 1 1.2-1.2h5.2a1.3 1.3 0 0 1 1.2 1.3v10.9h11a1.3 1.3 0 0 1 1.2 1.2v5.2a1.3 1.3 0 0 1-1.3 1.2H77.8v11a1.3 1.3 0 0 1-1.2 1.2h-5.2a1.3 1.3 0 0 1-1.2-1.3V61h-11a1.3 1.3 0 0 1-1.2-1.2v-5.2a1.3 1.3 0 0 1 1.3-1.2h10.9zM24 61.2v-8H12v8h12zm28 0v-8H28v8h24zm-28-14v-8H12v8h12zm40 0v-8H28v8h36zm-40-14v-8H12v8h12zm40 0v-8H28v8h36z"></path>
						</svg>
					</div>
			</div>`;
		$('.MainContainer-commentPanel').prepend(nicoMylistArea);
		$('.nicoMylist').append(buttons);
		
		
		$('#nicoDeflist').one('click', function() {
			$('.but_frame').removeClass('free');
			$('.but_frame').addClass('added');
			
			sendMessage({id:"add_video", videoInfo:getNicoData("def")}).then((response) => {
				if (response.result == "success") {
					setLocalStorage({have_to_reload:true});
					alert("追加完了");
				} else if (response.result == "faild") {
					alert("追加失敗");
				}
			});
			
		});
		
		// 動画が見えるところまでスクロール
		var justScroll = function() {
			var metaRow = $(".HeaderContainer-row").eq(1);
			var pos = metaRow.position().top;
			$(window).first().scrollTop(pos);
		}
		
		if (storage.player_tab_id == currentTabId) {
			if (storage.nico_full_screen) {
				// 前回動画終了時にフルスクリーンだったら今動画もフルスクリーンに
				$('.EnableFullScreenButton').first().click();
			}
			else {
				justScroll();
			}
			$('.PlayerPlayButton').first().click();
		}
		else {
			if (nico_setting.just_scroll) justScroll();
			if (nico_setting.auto_play) $('.PlayerPlayButton').first().click();
		}
		if (nico_setting.screen_click) {
			addNicoPlayButton();
			screen_click = nico_setting.screen_click;
		}
		
		getVideo().then((video) => {
			console.log("loaded video element: ->" + video);
			
			$(video).on('ended', function() {
				console.log("video ended");
				// 現在動画がフルスクリーンだったら次もフルスクリーンにするために状態を保存
				setLocalStorage({nico_full_screen:$('body').hasClass('is-fullscreen')});
				// マイリストタブへ動画終了を通知
				sendMessage({id:"video_ended"});
				
				// 再生終了したらover-layerを非表示
				$('#over-layer').hide();
			});
			
			$(video).on('pause', function() {
				console.log('pause');
				$('#play.controll-button').show();
				$('#pause.controll-button').hide();
			});
			$(video).on('play', function() {
				console.log('play');
				$('#play.controll-button').hide();
				$('#pause.controll-button').show();
				// ループ等で再生再開したとき用にover-layerを再表示
				$('#over-layer').show();
			});
			$(video).on('seeked', function() {
				console.log('seeked');
				// 終了後に非表示にしてるのでシークでボタンがまた表示されるように
				$('#over-layer').show();
			});
		});
		
	}
	
	if (document.domain == "www.youtube.com") {
		
	}
	
	
	
	
	// フォルダ選択ポップアップ挿入
	var popup_body = function(list) {
		var li = "";
		$.each(list, (i, o) => {
			li += `<button value="${i}">${o}</button>`;
		});
		li += '<button><div class="center"><span class="plus icon"></span><span class="add-list">新規リスト作成</span></div></button>';
		return li;
	}
	
	// ポップアップ部分挿入
	$('body').append(
		`<div id="select-list-layer"></div>
		<div id="select-list-popup">
		<div id="close-pop" class="close icon"></div>
		<div id="select-list-title" style="padding:10px;">マイリストを選択</div>
		<div id="select-list-body"></div>
		</div>`);
	// フォルダ選択ボタンの動作
	$('#select-list').on('click', (e) => {
		// スクロールバーを消すときのズレを解消
		var shift_dom = "body";
		if (document.domain == "www.nicovideo.jp") {
			shift_dom += ", #siteHeaderInner, #siteHeader";
		}
		$(shift_dom).addClass("shift");
		
		// マイリスト一覧作成
		$('#select-list-body').empty();
		getLocalStorage(["cache"]).then((value) => {
			$('#select-list-body').append(
				popup_body(value.cache ? value.cache.folder : ["def"])
			);
		});
		
		// 画面外に出るようなら左側に表示
		var popX = e.clientX, popY = e.clientY;
		if (e.clientX + 350 > $(window).width()) {
			popX = e.clientX - 350;
		}
		$('#select-list-popup').css({top:popY, left:popX});
		$('#select-list-popup, #select-list-layer').toggle();
		$('#select-list-layer').height(popopLayerHeight);
		
		// ポップアップ以外 or ×ボタン押したら閉じる
		$('#select-list-layer, #close-pop').on('click', () => {
			$(shift_dom).removeClass("shift");
			$('#select-list-popup, #select-list-layer').hide();
		});
	});
});



function addNicoPlayButton() {
	// play/pauseボタン
	$('.InView.VideoContainer').append(`
		<div id="over-layer">
			<div id="hover-layer"></div>
			<div id="play" class="controll-button">
				<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 13.229 13.229">
					<path d="M13.23 6.615a6.615 6.615 0 0 1-6.615 6.614A6.615 6.615 0 0 1 0 6.615 6.615 6.615 0 0 1 6.615 0a6.615 6.615 0 0 1 6.614 6.615z"/>
					<path d="M10.054 6.615l-5.16 2.978V3.636z" fill="#fff"/>
				</svg>
			</div>
			<div id="pause" class="controll-button" style="display: none;">
				<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 13.229 13.229">
					<g transform="translate(0 -283.77)">
						<circle cx="6.615" cy="290.385" r="6.615"/>
						<path fill="#fff" d="M3.969 287.21h1.852v6.35H3.969zM7.408 287.21H9.26v6.35H7.408z"/>
					</g>
				</svg>
			</div>
		</div>`
	);
	$('.controll-button').on('click', function() {
		$('.PlayerPlayButton, .PlayerPauseButton').click();
	});
	
}

function getNicoData(group) {
	var json = JSON.parse($('#js-initial-watch-data').attr('data-api-data'));
	
	var now = new Date();
	var yyyy = now.getFullYear(),
		MM = (now.getMonth() + 1),
		dd = now.getDate(),
		hh = now.getHours(),
		mm = now.getMinutes(),
		sc = now.getSeconds();
	
	return [
		group, "index",
		location.href,
		json.video.title,
		json.video.largeThumbnailURL,
		json.tags.map((tag) => tag.name).join(" "),
		$('span.PlayerPlayTime-duration').text(),
		"", `${yyyy}/${MM}/${dd} ${hh}:${mm}:${sc}`,
	];
}
