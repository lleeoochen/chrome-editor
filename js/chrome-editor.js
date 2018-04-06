//This is the extension content script for modifying pages with file:// address and the extension editor page.
//Note: The code editor is borrowed from Ace Community Project: https://github.com/ajaxorg/ace. 
//Author: Wei Tung Chen
//Date: April 4, 2018


//Useful constants of pages
var FILE_LINK = "file://";
var EXTENSION_LINK = chrome.extension.getURL("chrome-editor.html");
var address = unescape(window.location.href);
main();


//Main function
function main() {

	//Enter if the address is a local file system
	if (address.includes(FILE_LINK)) {

		//Open link in new page if the address if a directory
		if (address.charAt(address.length - 1) == '/')
			modify_folder();

		//Otherwise, convert text file to our chrome extension editor if wanted
		else if (confirm('Chrome Editor: Do you want to edit this HTML file?'))
			modify_file();
	}

	//Enter if the address is our extension editor
	else if (address.includes(EXTENSION_LINK))
		setup_editor();
}


//Function that modifies folder links to open file in new page
function modify_folder() {
	var links = document.getElementsByTagName('a');

	for (var i = 0; i < links.length; i++) {
		var link = links[i].getAttribute('href');

		if (link.includes(address.substring(7)) && link.charAt(link.length - 1) != '/' && link.charAt(link.length - 1) != '.')
			links[i].setAttribute('target', '_blank');
	}
}


//Function that sends file information to background script
function modify_file() {
	var file = address.substring(address.lastIndexOf('/') + 1);
	var filepath = address.substring(FILE_LINK.length, address.lastIndexOf('/') + 1);

	var text;
	if (file.includes('.htm'))
		text = '<!DOCTYPE HTML>' + '\n' + document.documentElement.outerHTML;
	else
		text = document.getElementsByTagName('pre')[0].innerText;

	//Store text file info and tell background script to open extension editor
	chrome.storage.local.set({"user_text":text, "user_file":file, "user_path":filepath}, function() {
		chrome.runtime.sendMessage({text:text});
		window.close();
	});
}


//Function that setup ace editor with call back functions
function setup_editor() {
	//Setup up ace.js editor
	var editor = ace.edit("editor");
	var modelist = ace.require("ace/ext/modelist");
	var title = null;
	var fpath = null;
	var mode = null;
	var saved = true;
	editor.setTheme("ace/theme/chrome");
	editor.setFontSize(14);

	//Retreive text file info and modify text editor accordingly
	chrome.storage.local.get(["user_text", "user_file", "user_path"], function(items) {
		title = items.user_file;
		fpath = items.user_path;
		mode = modelist.getModeForPath(title).mode;
		editor.session.setMode(mode);
		editor.setValue(items.user_text, -1);
		document.getElementsByTagName('title')[0].innerText = title;
		saved = true;
	});

	//Overwrite control save event
	document.onkeydown = function(event) {
		if (event.ctrlKey && event.keyCode == 83) {
			event.preventDefault();

			//Prompt to copy file path
			var okay = prompt("Copy and paste to save to the same location.\n", fpath + title);

			//Export important contents
			if (okay != null) {
				saved = true;
				var link = document.createElement('a');
				link.setAttribute('download', title);
				link.setAttribute('href', 'data:text/plain; charset=utf-8,' + encodeURIComponent(editor.getValue()));
				link.click();
			}

			return false;
		}
		return true;
	};

	//Detect editor changes
	editor.on('change', function() {
		chrome.storage.local.set({"user_text":editor.getValue(), "user_file":title, "user_path":fpath}, function(){});
		saved = false;
	});

	//Save everything before exiting
	window.onbeforeunload = function(event) {
		if (!saved)
			return "Chrome Editor:\n\nAre you sure to leave before saving?";
	};
}
