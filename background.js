chrome.runtime.onMessage.addListener(function(request, sender, callback) {
		var newURL = chrome.extension.getURL("index.html");
		chrome.tabs.create({url: newURL});
});
