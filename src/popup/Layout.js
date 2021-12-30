import React from "react";
import ReactDOM from "react-dom";

import "./popup.scss";
import { _storage, _url, uploadJson } from "./../function.js";

class Layout extends React.Component {
	constructor() {
		super();
		this.state = {
			preload: false, draw: true,
			folder: [],
			dest: 0,
			play: false,
			videoInfo: {
				url: '',
				title: '',
				thumbnail: '',
				tag: '',
				length: '',
				comment: '',
				time: '',
			}
		}

		const init = async () => {
			let tab = await new Promise((resolve, reject) => {
				chrome.tabs.query({ active: true, currentWindow: true }, tabs => resolve(tabs[0]))
			})
			let nico = tab.url.match(/www\.nicovideo\.jp\/watch\/.+/);
			let yout = tab.url.match(/www\.youtube\.com\/watch\?v=.+/);
			
			if (!nico && !yout && !this.state.play) {
				// ビデオページでなく、連続再生中でもない場合即マイリスト表示
				chrome.tabs.create({url: '/mylist.html'});
				return false;
			}

			this.data_id = await _storage.getSync('data_id')
			if (!this.data_id) {
				chrome.tabs.create({url: '/mylist.html'});
				return false;
			}
			const folder = await _storage.getLocal('folder')
			if (folder) {
				this.setState({folder, dest: folder[0].id})
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
					let xml = new DOMParser().parseFromString(xmlSrc, "text/xml"), now = new Date()
					this.setState({
						videoInfo: {
							url:       xml.querySelector('watch_url'    ).textContent,
							title:     xml.querySelector('title'        ).textContent,
							thumbnail: xml.querySelector('thumbnail_url').textContent,
							tag:   [...xml.querySelectorAll('tag')].map(t => t.innerHTML).join(' '),
							length:    xml.querySelector('length'       ).textContent,
							comment: '', time: `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
						}
					});
				})
			}
			if (yout) {
				let url = _url.create('https://www.googleapis.com/youtube/v3/videos', {
					id,
					key: 'AIzaSyDMf1FvRzwTRKbOzD0AtzD8k9UoEejbDsA',
					part: 'snippet,contentDetails',
					fields: 'items(id,snippet(title,thumbnails,tags),contentDetails(duration))'
				})
				
				fetch(url, {
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
				})
				.catch(err => {throw err});
			}
		}
		init();
	}

	onAdd = () => {
		this.setState({preload: true}, async () => {

			let tmp_id = `tmp_${Date.now()}`;
			let data = {
				folder_id: this.state.dest,
				videoInfo: this.state.videoInfo
			};
			// await _storage.setSync({reload: true})
			let arg = {id: this.data_id, json: {video: data}}
			let res = await uploadJson(arg)
			
			let tmp_data = _storage.getLocal('tmp_data');
			
			
		})
	}
	
	
	render() {

		const onOpen = () => {
			chrome.tabs.create({url: '/mylist.html'});
		}
		const onDest = (e) => {
			this.setState({dest: e.target.value})
		}
		const onTag = (e) => {
			this.setState({...videoInfo, videoInfo:{tag: e.target.value}})
		}
		const onComment = (e) => {
			this.setState({...videoInfo, videoInfo:{comment: e.target.value}})
		}

		const v = this.state.videoInfo;
		return (
			<div class="main">
				<div class="video-info">
						<div class="open-mylist">
							<a class="btn waves-effect waves-light" onClick={onOpen}>マイリストを表示</a>
						</div>
						<div class="title">
							<span class="truncate">{v.title}</span>
						</div>
						<div class="folder">
							<a class="btn waves-effect waves-light" onClick={this.onAdd}>追加</a>
							<div class="input-field f-sel">
								<select class="browser-default" defaultValue="0" onChange={onDest}>
									{this.state.folder.map((f, i) => <option key={i} value={f.id}>{f.name}</option>)}
								</select>
								<label>フォルダ</label>
							</div>
						</div>
						<div class="tag">
							<div class="input-field">
								<input id="tags" type="text" value={v.tag} onChange={onTag}/>
								<label for="tags">タグ</label>
							</div>
						</div>
						<div class="comment">
							<div class="input-field">
								<textarea id="comment" class="materialize-textarea" value={v.comment} onChange={onComment}></textarea>
								<label for="comment">コメント</label>
							</div>
						</div>
				</div>
			</div>
		);
	}
}

ReactDOM.render(
	<Layout />,
	document.querySelector('#app')
);

