import React from "react";
import Data from "./data.js"

const DATA_JSON = 'data.json'; // ドライブのdata.json
const DATA_ID = 'data_id'; // syncstorageに保存するdata.jsonのIDのkey

const UPDATE_JSON = '';
const UPDATE_ID = '';


// reloadを考慮したDataの取得
export async function getData() {
	let reload = await _storage.getSync('reload');
	reload = reload == void(0) ? true : reload
	
	if (!reload) {
		const cache = await _storage.getLocal(['f_order','folder','video']);
		return Promise.resolve(new Data(cache));
	}
	else {
		const json = await getDataJson()
		await _storage.setSync({reload:false});
		return Promise.resolve(new Data(json));
	}
}
// 
export async function saveData(data) {
	let id = await _storage.getSync(DATA_ID);
	if (!id) _url.option(400); // 保存前にSyncStorageからIDを消した
	
	let json = data.getAllJson()
	setCache(json);
	let ret = await uploadJson({id, json});
	return !ret.error ? 0 : 1;
}




// アプリ固有のフォルダを編集する権限 auth/drive.appdata
function getToken() {
	let url = _url.create('https://accounts.google.com/o/oauth2/auth', {
		client_id: '645932863093-oqe5hc67ec4f927bvirkbtd2nlno6mgr.apps.googleusercontent.com',
		redirect_uri: chrome.identity.getRedirectURL("oauth2.html"),
		response_type: 'token',
		scope: "https://www.googleapis.com/auth/drive.appdata"
	});
	
	return new Promise(function(resolve, reject) {
		chrome.identity.launchWebAuthFlow({interactive: true, url}, function(redirectURL) {
			if (chrome.runtime.lastError) {
				console.log(chrome.runtime.lastError);
				reject();
			} else {
				let param = new URL(redirectURL.replace('#', '?'))
				let token = param.searchParams.get("access_token")
				resolve(token);
			}
		});
	});
}

export async function uploadJson({filename, id, json}) {
	let body = null;
	if (filename) {
		let metadata = {
			'name': filename,
			'mimeType': 'application/json',
			'parents': ['appDataFolder'], // ドライブ上での保存ファルダID 
		};
		body = new FormData();
		body.append('metadata', new Blob([JSON.stringify(metadata)], {type:'application/json'} ));
		body.append('file',     new Blob([JSON.stringify(json)],     {type:'application/json'} ));
	} else {
		body = JSON.stringify(json)
	}
	let url = _url.create('https://www.googleapis.com/upload/drive/v3/files' + (id ? '/'+id : ''), {
		uploadType: !!filename ? 'multipart' : 'media',
	})

	let token = await getToken();
	let res = await fetch(url, {
		method: !!id ? 'PATCH' : 'POST',
		headers: new Headers({ 'Authorization': 'Bearer ' + token }),
		body,
	})
	return res.json();
}

export async function downloadJson(fileId) {
	let params = {
		spaces: 'appDataFolder'
	}
	if (fileId != '') {
		params.alt = 'media';
	}
	let url = _url.create('https://www.googleapis.com/drive/v3/files/' + fileId, params);
	
	let token = await getToken();
	let res = await fetch(url, {
		method: 'GET',
		headers: new Headers({ 'Authorization': 'Bearer ' + token }),
	})
	return res.json();
}


function setCache(json) {
	return _storage.setLocal({
		f_order: json.f_order,
		folder: json.folder,
		video: json.video,
	});
}
/**
 * すべてのデータが保存されてるjsonをドライブから取得する
 */
async function getDataJson() {
	let id = await _storage.getSync(DATA_ID);
	if (id) {
		let json = await downloadJson(id);
		if (!json.error) {
			setCache(json);
			return json;
		}
		else {/* syncstorageにidがあるのにファイルが存在しない */}
	}
	else {
		// ファイル検索
		id = null;
		let res = await downloadJson('');
		for (let f of res.files) {
			if (f.name == DATA_JSON) { id = f.id; break; }
		}
		
		if (id) {
			let json = await downloadJson(id);
			_storage.setSync({data_id:id});
			setCache(json);
			return json;
		}
		else {/* そもそもファルが存在しない */}
	}
	
	const now = new Date();
	const defaultJson = {
		f_order: 0,
		folder: [
			{
				id: now.getTime(), name: "マイリスト", order: 0,
				create: now.toLocaleString(),
				update: now.toLocaleString(),
			},
		],
		video: {
			[now.getTime()]: [
				{
					url: 'https://www.nicovideo.jp/watch/sm8628149',
					title: '【東方】Bad Apple!!　ＰＶ【影絵】',
					thumbnail: 'https://nicovideo.cdn.nimg.jp/thumbnails/8628149/8628149',
					tag: '東方 Bad_Apple!! 影絵 重要ニコニコ文化財 あにら ββ時代の英傑',
					length: '3:39', comment: '', time: now.toLocaleString(),
				}
			]
		}
	}
	// ドライブにファイルが存在しないので作成する
	id = (await uploadJson({filename:DATA_JSON, json:defaultJson}) ).id;
	_storage.setSync({data_id:id});
	setCache(defaultJson);
	return defaultJson;
}


export const _url = {
	/** 文字列とオブジェクトでurl作成 */
	create: (opath, searchParams) => {
		let u = new URL(opath);
		Object.keys(searchParams).forEach(key => u.searchParams.set(key, searchParams[key]));
		return u.href;
	},
	/** urlからパラメータ取得 */
	getParam: (href, key) => {
		let params = {}, u = new URL(href);
		u.searchParams.forEach((item, i) => params[i] = item);
		if (key) return params[key];
		else return params;
	},
	/** オプションページへ遷移 */
	option: (status = '') => {
		if (status && status.length > 0) {
			location.href = 'option.html?status=' + status;
		} else {
			location.href = 'option.html';
		}
	}
}
export const _storage = {
	/** local storage から値を取得 */
	getLocal: (getNames) => {
		return new Promise((resolve, reject) => {
			chrome.storage.local.get(getNames, values => {
				let keys = [].concat(getNames);
				if (keys.length == 1) {
					resolve(values[keys[0]])
				} else {
					let ret = {}
					keys.forEach(k => ret[k] = values[k])
					resolve(ret)
				}
			});
		});
	},
	/** sync storage から値を取得 */
	getSync: (getNames) => {
		return new Promise((resolve, reject) => {
			chrome.storage.sync.get(getNames, values => {
				let keys = [].concat(getNames);
				if (keys.length == 1) {
					resolve(values[keys[0]])
				} else {
					let ret = {}
					keys.forEach(k => ret[k] = values[k])
					resolve(ret)
				}
			});
		});
	},
	/** local strage へ値を保存 */
	setLocal: (setParamMap) => {
		return new Promise((resolve, reject) => {
			chrome.storage.local.set(setParamMap, () => resolve());
		});
	},
	/** sync strage へ値を保存 */
	setSync: (setParamMap) => {
		return new Promise((resolve, reject) => {
			chrome.storage.sync.set(setParamMap, () => resolve());
		});
	}
}

/**
 * chrome.runtime.sendMessage のラッパー
 */
export function sendMessage(paramMap) {
	return new Promise(function(resolve, reject) {
		chrome.runtime.sendMessage(paramMap, function(response) {
			resolve(response);
		});
	});
}



export function Preloader({active}) {
	const back = {
		width: "100%",
		height: "100%",
		position: "absolute",
		top: "0",
		left: "0",
		backgroundColor: "rgba(0, 0, 0, 0.15)",
		zIndex: "1000",
	}
	const wap = {
		position: "absolute",
		top: "calc(50% - 32px)",
		left: "calc(50% - 32px)",
	}
	return active ? (
		<div class="preloader-back" style={back}>
			<div class="preloader-wrapper big active" style={wap}>
				<div class="spinner-layer spinner-blue-only">
					<div class="circle-clipper left">
						<div class="circle"></div>
					</div>
					<div class="gap-patch">
						<div class="circle"></div>
					</div>
					<div class="circle-clipper right">
						<div class="circle"></div>
					</div>
				</div>
			</div>
		</div>
	) : (<div></div>);
}