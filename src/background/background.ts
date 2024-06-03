import { createContexts } from "./contexts";
import { registerCommands } from "./commands";
import { sendMessage } from "./util";
import { isPaid } from "./payments";

createContexts();
registerCommands();

/* Installation page settings */
chrome.runtime.onInstalled.addListener((details) => {
  chrome.tabs.create({ url: chrome.runtime.getURL("html/install.html") });
});

async function getNotes(list_id: number) {
  const response = await fetch(
    `https://stickynoteplus.com/share?json=True&n=${list_id}`
  );
  const notes = await response.json();
  return notes;
}

chrome.runtime.onMessage.addListener((request, sender, res) => {
  if (!request.message) {
    return true;
  }

  if (request.message === "move") {
    const data = {
      url: request.url,
      list_id: request.list_id,
    };

    (async () => {
      const notes = await getNotes(data.list_id);
      console.log(notes);
      chrome.tabs.update(sender.tab.id, { url: data.url }, (tab) => {
        chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
          if (tabId === tab.id && info.status === "complete") {
            chrome.tabs.sendMessage(tabId, {
              action: "load-shared-notes",
              notes: notes.sticky_notes,
            });
            chrome.tabs.onUpdated.removeListener(listener);
          }
        });
      });
    })();
    return true;
  }

  if (request.message === "share-notes") {
    (async () => {
      const response = await fetch(`https://stickynoteplus.com/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes: request.notes }),
      });

      try {
        const result = await response.json();
        console.log(result);
        res(result.url);
      } catch (e) {
        res("error");
      }
    })();

    return true;
  }

  if (request.message === "browse-notes") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("html/browser.html"),
    });
    return false;
  }

  if (request.message === "save-preview") {
    (async () => {
      const screenshot = await chrome.tabs.captureVisibleTab(null, {
        format: "jpeg",
        quality: 0,
      });
      const url: string = request.url;

      chrome.storage.local.get({ previews: [] }, function (result: any) {
        const previews: Preview[] = result.previews;
        let found = false;

        previews.forEach((preview) => {
          if (preview.url === url) {
            preview.data = screenshot;
            found = true;
          }
        });

        if (!found) {
          previews.push({ url: url, data: screenshot });
        }

        chrome.storage.local.set({ previews: previews }, () => {
          if (chrome.runtime.lastError) {
            //ran out of space
          }
        });
      });
    })();

    return false;
  }

  if (request.message === "is-paid") {
    (async () => {
      const paid = await isPaid();
      console.log("paid? " + paid);
      res(paid);
    })();

    return true;
  }
});
