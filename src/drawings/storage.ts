import { Drawing } from "./canvas";

async function deleteDrawing(url: string) {
  chrome.storage.local.get([url], function (result) {
    const data = result[url];

    if (data) {
      chrome.storage.local.remove([url]);
    }

    chrome.storage.local.get({ previews: [] }, function (result: any) {
      const previews = result.previews;
      const index = previews.findIndex((preview: any) => preview.url == url);

      if (index > -1) {
        previews.splice(index, 1);
      }

      chrome.storage.local.set({ previews: previews }, () => {});
    });
  });
}

async function saveDrawing(url: string, drawing: Drawing) {
  //save preview
  const canvas = drawing.canvas;
  const data = canvas.toDataURL("image/webp");
  const screenshot = await chrome.runtime.sendMessage({
    message: "save-preview",
    url: url,
  }); //this is for creating page previews in notes section

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  await delay(1000); //enough time to read the loading icon

  await chrome.storage.local.set({ [url]: data });
}

function loadDrawing(url: string, drawing: Drawing) {
  const context = drawing.context;

  chrome.storage.local.get([url], function (result) {
    const data = result[url];

    if (data) {
      const image = new Image();
      image.onload = function () {
        context.drawImage(image, 0, 0);
      };
      image.src = data;
    }
  });
}

export { saveDrawing, loadDrawing, deleteDrawing };
