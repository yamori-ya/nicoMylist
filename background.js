chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		
		
		switch(request.id) {
			case "nicoMylist":
				chrome.storage.local.get(["sheetId"], function(value) {
					api.bookId = value.sheetId;
					api.AppendData("list", request.videoInfo)
					.then((obj) => {
						if (obj.error) {
							sendResponse({result: "faild"});
							throw new Error();
						}
						return api.Sort();
					})
					.then(() => {
						if (obj.error) {
							sendResponse({result: "faild"});
							throw new Error();
						}
						sendResponse({result: "success"});
					})
					.catch(reason => {
						
					});
				});
				break;
				
			case "option_save":
				chrome.storage.local.set(request.save, function() {
					sendResponse({message: "保存成功"});
				});
				break;
			case "option_load":
				chrome.storage.local.get(["sheetId","info","list"], function(value) {
					console.dir(value);
					sendResponse({val:value});
				});
				break;
			case "create_book":
				api.bookId = "";
				api.CreateBook()
				.then((obj) => {
					console.log(obj);
					// chrome.storage.local.set(request.save, function() {
					// 	sendResponse({message: "保存成功"});
					// });
				});
				break;
			
			case "test":
				break
		}
		return true;
	}
);

chrome.browserAction.onClicked.addListener(function() {
	chrome.tabs.create({url: 'mylist.html'});
});