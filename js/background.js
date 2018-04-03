//Background script with a very simple task that opens extension editor whenever needed.
//Author: Wei Tung Chen
//Date: April 2, 2018

chrome.runtime.onMessage.addListener(function(request, sender, callback) {
	var editor_address = chrome.extension.getURL("chrome-editor.html");
	chrome.tabs.create({url: editor_address});
});
