/**
 * 現在のtabを取得
 */
function getCurrentTab() {
	return new Promise(function(resolve, reject) {
		chrome.tabs.getCurrent(function(tab) {
			resolve(tab);
		});
	});
}

/**
 * urlからパラメータ取得
 */
function getUrlParams() {
	var params = [];
	if (location.search != "") {
		$.each(location.search.substring(1).split("&"), function(i, one) {
			let p = one.split("=");
			params[p[0]] = decodeURI(p[1]);
		});
	}
	return params;
}

/**
 * local strage から値を取得
 */
function getLocalStorage(getNames) {
	return new Promise(function(resolve, reject) {
		chrome.storage.local.get(getNames, function(value) {
			resolve(value);
		});
	});
}
/**
 * sync strage から値を取得
 */
function getSyncStorage(getNames) {
	return new Promise(function(resolve, reject) {
		chrome.storage.sync.get(getNames, function(value) {
			resolve(value);
		});
	});
}

/**
 * local strage へ値を保存
 */
function setLocalStorage(setParamMap, callback) {
	return new Promise(function(resolve, reject) {
		chrome.storage.local.set(setParamMap, function() {
			callback({message: "保存成功"});
		});
	});
}
/**
 * sync strage へ値を保存
 */
function setSyncStorage(setParamMap, callback) {
	return new Promise(function(resolve, reject) {
		chrome.storage.sync.set(setParamMap, function() {
			callback({message: "保存成功"});
		});
	});
}