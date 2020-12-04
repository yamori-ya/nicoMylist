/**
 * urlからパラメータ取得
 */
function getUrlParams(debug = false) {
	var params = [];
	if (location.search != "") {
		$.each(location.search.substring(1).split("&"), function(i, one) {
			let p = one.split("=");
			params[p[0]] = decodeURI(p[1]);
		});
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
		chrome.runtime.sendMessage(paramMap, function(responce) {
			resolve(responce);
		});
	});
}