const URL_OPTION = '/html/option.html';
const URL_MYLIST = '/html/mylist.html';


/**
 * オプションページへ遷移
 */
function goOption(status = '') {
	if (status && status.length > 0) {
		location.href = URL_OPTION + '?status=' + status;
	} else {
		location.href = URL_OPTION;
	}
}
/**
 * urlからパラメータ取得
 */
function getUrlParams(debug = false) {
	let params = [];
	let url = new URL(location.href);
	for (let [key, value] of url.searchParams) {
		params[key] = value;
	}
	if (debug) console.log(params);
	return params;
}

/**
 * local strage から値を取得
 */
function getLocalStorage(getNames) {
	return new Promise(function(resolve, reject) {
		chrome.storage.local.get(getNames, function(values) {
			resolve(values);
		});
	});
}
/**
 * sync strage から値を取得
 */
function getSyncStorage(getNames) {
	return new Promise(function(resolve, reject) {
		chrome.storage.sync.get(getNames, function(values) {
			resolve(values);
		});
	});
}

/**
 * local strage へ値を保存
 */
function setLocalStorage(setParamMap) {
	return new Promise(function(resolve, reject) {
		chrome.storage.local.set(setParamMap, function() {
			resolve();
		});
	});
}
/**
 * sync strage へ値を保存
 */
function setSyncStorage(setParamMap) {
	return new Promise(function(resolve, reject) {
		chrome.storage.sync.set(setParamMap, function() {
			resolve();
		});
	});
}

/**
 * chrome.runtime.sendMessage のラッパー
 */
function sendMessage(paramMap) {
	return new Promise(function(resolve, reject) {
		chrome.runtime.sendMessage(paramMap, function(response) {
			resolve(response);
		});
	});
}

var timerMap = {}
class Timer {
	static start(name) {
		timerMap[name] = Date.now()
	}
	static end(name) {
		let t = Date.now() - timerMap[name]
		delete timerMap[name]
		return t
	}
}

class Template {
	constructor(selector) {
		this.temp = document.querySelector(selector).content
	}
	static createFragment() {
		return document.createDocumentFragment()
	}
	clone() {
		return document.importNode(this.temp, true)
	}
}