var text = document.getElementsByTagName('pre')[0].innerHTML;
chrome.runtime.sendMessage({text:text});
window.close();
