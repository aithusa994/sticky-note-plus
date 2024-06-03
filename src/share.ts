const button: HTMLAnchorElement = document.getElementById(
  "action"
) as HTMLAnchorElement;

const title = document.getElementById("title");
const subtext = document.getElementById("subtext");
const url: HTMLAnchorElement = document.getElementById(
  "url"
) as HTMLAnchorElement;
const link = url.href;

if (!button || !title || !subtext) {
  throw "share.html and content script out of sync";
}

//get the url
title.innerText = "You've been shared sticky notes";
button.innerText = "View Notes";
subtext.innerText = "Notes are deleted after 24h.";
button.href = "#";

button.onclick = () => {
  let params = new URL(document.location.href).searchParams;
  let id = params.get("n");
  chrome.runtime.sendMessage({ message: "move", url: link, list_id: id });
};
