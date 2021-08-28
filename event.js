importScripts('js/function.js');
importScripts('js/SheetApi.js');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	switch(request.id) {
	case "add_video":
		// await化失敗(onMessageがasyncだと失敗するらしい)
		getSyncStorage("ids")
		.then(value => {
			console.log(value);
			var api = new SheetApi(value.ids.book)
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
	case "get_current_tab":
		sendResponse({tab:sender.tab});
		break;

	case "GetRange":
		getSyncStorage(["ids"]).then((value) => {
			var api = new SheetApi(value.ids.book)
			api.GetRange(request.ranges).then((value) => {
				sendResponse(value);
			});
		});
		break;
	}
	return true;
});
