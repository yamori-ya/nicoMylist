var videoInfo; // 動画情報
var play; // 連続再生中か


window.onload = function() {
	
	getLocalStorage('cacheF').then(f => {
		console.log(f);
		$('#folder').append(f.cacheF.map(i => `<option value="${i}">${i}</option>`).join())
	})
	
	
	// 現ウインドアクティブダブへ命令
	chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
		
		let tab = tabs[0];
		let nico = tab.url.match(/www\.nicovideo\.jp\/watch\/.+/);
		let yout = tab.url.match(/www\.youtube\.com\/watch\?v=.+/);
		
		if (!nico && !yout) {
			$('#video-info').hide();
			
			if (!play) { // ビデオページでなく、連続再生中でもない場合即マイリスト表示
				chrome.tabs.create({url: URL_MYLIST + '?list=歌'});
			}
			return;
		}
		
		let id = nico ? tab.url.match(/watch\/([^\/]+)/)[1] : tab.url.match(/watch\?v=([^&]+)/)[1]
		if (nico) {
			fetch('https://ext.nicovideo.jp/api/getthumbinfo/' + id)
			.then(res => {
				if (res.status < 200 && res.status >= 300) {
					const error = new Error(res.statusText);
					error.response = res;
					throw error
				}
				return res
			})
			.then(res => res.text())
			.then(xmlSrc => {
				let xml = $(new DOMParser().parseFromString(xmlSrc, "text/xml")), now = new Date()
				videoInfo = [
					"def", "index",
					xml.find('watch_url'    ).text(),
					xml.find('title'        ).text(),
					xml.find('thumbnail_url').text(),
					xml.find('tag').get().map(t => t.innerHTML).join(' '),
					xml.find('length'       ).text(),
					"", `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
				];
				console.log(videoInfo)
				$('#title').text(videoInfo[3])
				$('#tag').val(videoInfo[5])
			})
		}
		if (yout) {
			let param = {
				key: 'AIzaSyDMf1FvRzwTRKbOzD0AtzD8k9UoEejbDsA',
				id: id,
				part: 'snippet,contentDetails',
				fields: 'items(id,snippet(title,thumbnails,tags),contentDetails(duration))'
			}
			let search = Object.keys(param).map(k => `${k}=${param[k]}`).join('&')
			
			fetch('https://www.googleapis.com/youtube/v3/videos?' + search, {
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			})
			.then(res => res.json())
			.then(data => {
				let duration2time = function(dur) {
					let m = dur.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
					,hh = m[1] ? m[1].replace('H', '') : null
					,mm = m[2] ? m[2].replace('M', '') : 0
					,ss = m[3] ? m[3].replace('S', '') : 0
					return (hh ? `${hh}:${('00'+mm).slice(-2)}` : mm) + `:${('00'+ss).slice(-2)}`;
				}, now = new Date();
				videoInfo = [
					"def", "index",
					tab.url,
					data.items[0].snippet.title,
					data.items[0].snippet.thumbnails.medium.url,
					data.items[0].snippet.tags ? data.items[0].snippet.tags.join(' ') : '',
					duration2time(data.items[0].contentDetails.duration),
					"",
					`${now.toLocaleDateString()} ${now.toLocaleTimeString()}`
				]
				console.log(videoInfo)
				$('#title').text(videoInfo[3])
				$('#tag').val(videoInfo[5])
			})
			.catch(err => {throw err});
		}
	});
	
	
	
	$('#add').on('click', async function() {
		videoInfo[0] = $('#folder').val()
		videoInfo[5] = $('#tag').val()
		videoInfo[7] = $('#comment').val()
		
		$('#add').hide()
		$('#result').addClass('busy')
		
		let res = await sendMessage({id:"add_video", videoInfo:videoInfo})
		console.log(res);
		$('#result').removeClass('busy')
		
		if (!res || res.result == "faild") {
			$('#result').addClass('err')
			console.log("失敗");
		} else {
			$('#result').addClass('done')
			setSyncStorage({reload:true});
			console.log("追加完了");
		}
	});
	
}