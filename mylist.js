var playTabId;
var nowIndex;
var api;
var ids;
var params = getUrlParams();


const view = {
	showLoad: function() {
		$('#load-layer').show()
	},
	hideLoad: function() {
		$('#load-layer').hide()
	},
	scroll: function(height) {
		$('body,html').animate({ scrollTop: height }, 300)
	},
	view: function(index) {
		scroll($(`#list-${index}`).offset().top-60)
	},
	spinner: function(index) {
		$('.spinner').remove();
		var tmp = $('#video-tmp')[0].content
		var clone = document.importNode(tmp, true)
		$(clone).addClass('spinner')
		$(`#list-${index}`).find('.thumbnail').append(clone)
	}
}
const data = {
	getUrl: function(index) {
		return $(`#list-${index} a:eq(0)`).attr('href')
	},
	getChecked: function() {
		return $('.video input:checked').get().map(e => $(e).val()*1+1)
	}
}
const edit = {
	add: async function() {
		let name = window.prompt("フォルダ名", "");
		if (name) {
			view.showLoad()
			$('#edit').click()
			await api.AppendData('info', [name])
			loadBook()
		}
	},
	move: function() {
		let checked = data.getChecked()
		let dist = $('#editor select').val()
		if (checked.length == 0 || !window.confirm(`${params['list']} から ${dist} へ ${checked.length}件移動します`))
			return false
		
		view.showLoad()
		Timer.start('move')
		let m = checked.map(i => { return {row: i-1, col: 0, val: dist} })
		
		api.Update(ids.list, m).then(response => {
			console.log(`移動にかかった時間: ${Timer.end('move')}ms`)
			loadBook()
		})
	},
	copy: function() {
		alert('作成中')
	},
	delete: function() {
		var checked = data.getChecked()
		if (checked.length == 0 || !window.confirm(checked.length + "件 削除します"))
			return false
		
		view.showLoad()
		Timer.start('del')
		console.log("削除する行: " + checked)
		
		api.DeleteLine(ids.list, checked).then(response => {
			console.log(`削除にかかった時間: ${Timer.end('del')}ms`)
			loadBook()
		})
	}
}

function loadBook() {
	$('#video > li').remove()
	$('#folder-list > li').remove()
	$('#editor select').empty()
	
	view.showLoad()
	Timer.start('load')
	
	api.GetRange(["info!A:A", "list!A:I"])
	.then(obj => {
		if (obj.error) { // シートへのアクセス失敗
			goOption('error' + obj.error.code)
			return
		}
		console.log(`ブック読込時間: ${Timer.end('load')}ms`);
		
		var cacheF = (obj.valueRanges[0].values || []).flat()
		var cacheL = (obj.valueRanges[1].values || []).map((val, i) => {
			return {
				line:i, folder:val[0], index:val[1], url:val[2], title:val[3],
				thumbnail:val[4], tag:val[5], time:val[6], comment:val[7], instm:val[8]
			}
		})
		setLocalStorage({ cacheL: cacheL, cacheF: cacheF })
		setSyncStorage({ reload: false })
		createList(cacheL, cacheF);
	});
}

function createList(listData, folderData) {
	Timer.start('list')
	var cnt = 0;
	
	var folder = params['list'] || "def"
	var fstr   = params['fstr'] || ""
	
	var videoTmp = new Template('#video-tmp')
	var tagTmp = new Template('#tag-tmp')
	var fragment = Template.createFragment()
	
	for (var item of listData) {
		if (item.folder != folder)
			continue
			
		if (fstr.length > 0)
		if (item.tag.indexOf(fstr) == -1 &&
			item.title.indexOf(fstr) == -1)
			continue
		
		cnt++;
		var video = videoTmp.clone()
		$('.list',          video).prop({'data-id':cnt, 'id':`list-${cnt}`})
		$('.check input',   video).prop({'id':`chk${cnt}`, 'value':item.line})
		$('.check label',   video).prop({'for':`chk${cnt}`})
		$('.thumbnail',     video).prop({'href':item.url})
		$('.thumbnail img', video).prop({'src':item.thumbnail})
		$('.title a',       video).prop({'href':item.url}).text(item.title)
		$('.comment',       video).text(item.comment)
		$('.play-button',   video).prop({'value':cnt})
		if (item.tag && item.tag.length > 0) {
			item.tag.split(' ').forEach(e => {
				var tag = tagTmp.clone()
				$('span', tag).text(e)
				$('.tag', video).append(tag)
			})
		}
		fragment.appendChild(video)
	}
	$('#video').append(fragment)
	
	
	// マイリスト一覧作成
	let folderTmp = new Template('#folder-tmp')
	let folderFrag = Template.createFragment()
	folderData.forEach(f => {
		let folder = folderTmp.clone()
		let name = decodeURI(f);
		$('a', folder).prop({'href': `${URL_MYLIST}?list=${name}`}).text(name)
		folderFrag.appendChild(folder)
	})
	$('#folder-list').append(folderFrag)
	
	
	// プルダウン作成
	$('#editor select').append(
		folderData.map(f => `<option value="${f}">${f}</option>`).join('')
	)
	
	
	// 連続再生ボタンの動作
	$('.play-button').on('click', function() {
		nowIndex = $(this).val();
		console.log("button index: " + nowIndex);
		
		setLocalStorage({nico_full_screen:false});
		chrome.tabs.create({url:data.getUrl(nowIndex), active:true}, function(tab) {
			playTabId = tab.id;
			setLocalStorage({player_tab_id:playTabId});
		});
	});
	console.log(`リスト作成時間: ${Timer.end('list')}ms`);
	view.hideLoad();
	$('#content').height($('#mylist').height());
}


$(function() {
	view.showLoad();
	$('.search input[name="list"]').val(params['list'])
	
	
	Promise.all([
		getSyncStorage(['ids', 'reload']),
		getLocalStorage(['cacheL', 'cacheF']),
	]).then(values => {
		
		ids = values[0].ids
		if (!ids || !ids.book) { // ブックIDが未設定
			goOption('empty')
			return
		}
		api = new SheetApi(ids.book)
		
		var cacheL = values[1].cacheL
		var cacheF = values[1].cacheF
		if (cacheL && cacheF && !values[0].reload) {
			console.log("キャッシュから読込");
			createList(cacheL, cacheF)
		} else {
			console.log(`ブックから読込`);
			loadBook()
		}
	})
	
	
	
	// 一番上、一番下ボタン
	$('.scroll-btn > .top'   ).on('click', () => view.scroll(0) );
	$('.scroll-btn > .bottom').on('click', () => view.scroll($(document).height()) );
	
	// ボタン動作
	$('#edit'  ).on('click', () => $('#content, #editor').toggleClass('edit'));
	$('#reload').on('click', loadBook)
	$('#option').on('click', goOption)
	
	$('#editor #add'   ).on('click', edit.add)
	$('#editor #move'  ).on('click', edit.move)
	$('#editor #copy'  ).on('click', edit.copy)
	$('#editor #delete').on('click', edit.delete)
	
	// ########################連続再生関係########################
	
	// 動画終了通知を受け取って次の動画へ移動
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.id == "video_ended" && playTabId == sender.tab.id) {
			var url = data.getUrl(++nowIndex);
			console.log("next url: " + url);
			if (url) chrome.tabs.update(playTabId, {url: url}, tab => {});
		}
		return true;
	});
	chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
		if (tabId == playTabId) {
			console.log('closed player tab.');
			$('.spinner').remove();
		}
	});
});