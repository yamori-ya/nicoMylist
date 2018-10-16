chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		
		
		switch(request.id) {
			case "nicoMylist":
				getLocalStorage("sheetId")
				.then((value) => {
					api.bookId = value.sheetId;
					return api.AppendData("list", request.videoInfo);
				})
				.then((obj) => {
					if (obj.error) {
						sendResponse({result: "faild"});
						throw new Error();
					}
					sendResponse({result: "success"});
				})
				.catch(reason => {
					
				});
				break;
				
			case "option_save":
				setLocalStorage(request.save)
				.then(() => {
					sendResponse({message: "保存成功"});
				});
				break;
			case "option_load":
				getLocalStorage(["sheetId","info","list"])
				.then((value) => {
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
			case "is_player_tab":
				getLocalStorage("player_tab_id").then((value) => {
					sendResponse({isPlayerTab:value.player_tab_id == sender.tab.id});
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