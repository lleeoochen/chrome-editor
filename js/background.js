//Background script with a very simple task that opens extension editor whenever needed.
//Author: Wei Tung Chen
//Date: April 2, 2018


//Show user how to enable file url access
chrome.extension.isAllowedFileSchemeAccess(function(isAllowedAccess) {
	if (isAllowedAccess)
		return;
	alert('Please enable access to File URLs in the extension setting.');
	chrome.tabs.create({
		url: 'chrome://extensions/?id=' + chrome.runtime.id
	});
});


//Onclick response to address bar icon to open chrome editor
chrome.browserAction.onClicked.addListener(function(tab) {
	openEditor();
});


//Response to chrome-editor.js to open chrome editor
chrome.runtime.onMessage.addListener(function(request, sender, callback) {
	openEditor();
});


//Open chrome editor extension
function openEditor() {
	var editor_address = chrome.extension.getURL("chrome-editor.html");
	chrome.tabs.create({
		url: editor_address
	});
}
