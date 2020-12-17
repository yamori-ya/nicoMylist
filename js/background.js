chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	switch(request.id) {
	case "add_video":
		getSyncStorage("bookId")
		.then((value) => {
			api.bookId = value.bookId;
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
		getSyncStorage(["bookId"]).then((value) => {
			api.bookId = value.bookId; 
			api.GetRange(request.ranges).then((value) => {
				sendResponse(value);
			});
		});
		break;
	}
	return true;
});
