function sendMessage(message: any) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs[0];
    if (tab) {
      chrome.tabs.sendMessage(tab.id, message, function (response) {});
    } else {
      console.error("No active tab found");
    }
  });
}

export { sendMessage };
