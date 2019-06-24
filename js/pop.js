var data;

$(function() {
	
	$('#show-mylist button').on('click', function() {
		chrome.tabs.create({url: 'mylist.html'});
	});
	
	
	
	// 現ウインドアクティブダブへ命令
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		
		var tab = tabs[0];
		var domain;
		try {
			domain = tab.url.match(/^https?:\/{2,}(.*?)(?:\/|\?|#|$)/)[1];
		}
		catch(e) {
			console.log('ドメインの判別に失敗しました url: ' + tab.url);
		}
		
		if (domain != "www.nicovideo.jp") {
			$('#opening').hide();
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