
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	switch(request.id) {
	case "get_current_tab":
		sendResponse({tab:sender.tab});
		break;
	}
	return true;
});
