
console.log("load content_script");

// 動画情報
var video_info;


if (document.domain == "www.nicovideo.jp") {
	var json = JSON.parse($('#js-initial-watch-data').attr('data-api-data'));
	var now = new Date();
	var yyyy = now.getFullYear(),
		MM = (now.getMonth() + 1),
		dd = now.getDate(),
		hh = now.getHours(),
		mm = now.getMinutes(),
		sc = now.getSeconds();
	
	video_info = [
		"def", "index",
		location.href,
		json.video.title,
		json.video.largeThumbnailURL || json.video.thumbnailURL,
		json.tags.map((tag) => tag.name).join(" "),
		$('span.PlayerPlayTime-duration').text(),
		"", `${yyyy}/${MM}/${dd} ${hh}:${mm}:${sc}`,
	];
}
else if (document.domain == "www.youtube.com") {
	
}

// popでデータ受け取りテスト
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.id == "getVideoInfo") {
			sendResponse({data: video_info});
		}
		return true;
	}
);


const PROP = [
	"player_tab_id",
	"nico_full_screen",
	"nico_setting",
];
var hover_time, dilayTm;

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
		}
		
		getVideo().then((video) => {
			console.log("loaded video element: ->");
			console.log(video);
			
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
		getVideo().then((video) => {
			console.log("loaded video element: ->");
			console.log(video);
			
			$(video).on('ended', function() {
				console.log("video ended");
				// マイリストタブへ動画終了を通知
				sendMessage({id:"video_ended"});
			});
		});
	}
	
	
	
	
	// フォルダ選択ポップアップ挿入
	var popup_body = function(list) {
		var li = "";
		$.each(list, (i, o) => {
			li += `<button class="folder" value="${i}">${o}</button>`;
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
		
		var closePop = function() {
			$(shift_dom).removeClass("shift");
			$('#select-list-popup, #select-list-layer').hide();
		};
		
		// マイリスト一覧作成
		$('#select-list-body').empty();
		getLocalStorage(["cache"]).then((value) => {
			$('#select-list-body').append(
				popup_body(value.cache ? value.cache.folder : ["def"])
			);
			$('#select-list-body button').on('click', function() {
				saveVideo($(this).text());
				closePop();
			});
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
		$('#select-list-layer, #close-pop').on('click', closePop);
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
	
	// マウスを乗せて2秒で見えなくなる、動かすとまた見えるように
	var onHov = function() {
		hover_time = setTimeout(function() {
			$('#play, #pause').addClass('too-hover');
		}, 2000);
	};
	var outHov = function() {
		$('#play, #pause').removeClass('too-hover');
		clearTimeout(hover_time);
	};
	$('.controll-button').hover(onHov, outHov);
	$('.controll-button').on('mousemove', function() {
		$('#play, #pause').removeClass('too-hover');
		clearTimeout(dilayTm);
		dilayTm = setTimeout(onHov, 100);
	}).on('mouseout', function() {
		clearTimeout(dilayTm);
		outHov();
	});
	
	// 既存の再生ボタン非表示
	$('button.VideoStartButton').css('display','none');
}
