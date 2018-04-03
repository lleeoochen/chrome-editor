//This is the extension content script for modifying pages with file:// address and the extension editor page.
//Note: The code editor is borrowed from Ace Community Project: https://github.com/ajaxorg/ace. 
//Author: Wei Tung Chen
//Date: April 3, 2018


//Useful constants of pages
const FILE_LINK = "file://";
const EXTENSION_LINK = chrome.extension.getURL("chrome-editor.html");
var address = unescape(window.location.href);


//Enter if the address is a local file system
if (address.includes(FILE_LINK)) {

	//Open link in new page if the address if a directory
	if (address.charAt(address.length - 1) == '/') {
		var links = document.getElementsByTagName('a');
		
		for (var i = 0; i < links.length; i++) {
			var link = links[i].getAttribute('href');

			if (link.includes(address.substring(7)) && link.charAt(link.length - 1) != '/' && link.charAt(link.length - 1) != '.')
				links[i].setAttribute('target', '_blank');
		}
	}

	//Otherwise, convert text file to our chrome extension editor
	else {
		var text = document.getElementsByTagName('pre')[0].innerHTML;
		var file = address.substring(address.lastIndexOf('/') + 1);
		var filepath = address.substring(FILE_LINK.length, address.lastIndexOf('/') + 1).decodeHTML;

		//Store text file info and tell background script to open extension editor
		chrome.storage.local.set({"user_text":text, "user_file":file, "user_path":filepath}, function() {
			chrome.runtime.sendMessage({text:text});
			window.close();
		});
	}
}


//Enter if the address is our extension editor
if (address.includes(EXTENSION_LINK)) {

	//Setup up ace.js editor
	var editor = ace.edit("editor");
	var modelist = ace.require("ace/ext/modelist");
	var title = null;
	var mode = null;
	editor.setTheme("ace/theme/chrome");
	editor.setFontSize(14);

	//Retreive text file info and modify text editor accordingly
	chrome.storage.local.get(["user_text", "user_file", "user_path"], function(items) {
		title = items.user_file;
		mode = modelist.getModeForPath(title).mode;
		editor.session.setMode(mode);
		editor.setValue(items.user_text + "\n", -1);
		document.getElementsByTagName('title')[0].innerText = title;
	});

	//Overwrite control save event
	document.onkeydown = function(event) {
	    if (event.ctrlKey && event.keyCode == 83) {
		    event.preventDefault();

		    //Export important contents
		    var link = document.createElement('a');
		    link.setAttribute('download', title);
		    link.setAttribute('href', 'data:text/plain; charset=utf-8,' + encodeURIComponent(editor.getValue()));
		    link.click();
		    return false;
		}
		return true;
	};
}
