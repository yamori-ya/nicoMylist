var data; // 動画情報
var play; // 連続再生中か


$(function() {
	
	$('#show-mylist button').on('click', function() {
		chrome.tabs.create({url: 'mylist.html'});
	});
	
	
	
	// 現ウインドアクティブダブへ命令
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		
		var tab = tabs[0];
		var nico = tab.url.match(/www\.nicovideo\.jp\/watch\/.+/);
		
		if (!nico) {
			$('#video-info').hide();
			
			if (!play) { // ビデオページでなく、連続再生中でもない場合即マイリスト表示
				chrome.tabs.create({url: 'mylist.html'});
			}
			return;
		}
		
		chrome.tabs.sendMessage(tab.id, 
			{ id: "getVideoInfo" },
			function (response) {
				data = response.data;
				$('#title').text(data[3]);
			}
		);
	});
	
	
	$('#def-list').on('click', function() {
		
		sendMessage({id:"add_video", videoInfo:data})
		.then((response) => {
			if (response.result == "success") {
				setLocalStorage({have_to_reload:true});
				alert("追加完了");
			} else if (response.result == "faild") {
				alert("追加失敗");
			}
		});
		
	}); 
	
	
});