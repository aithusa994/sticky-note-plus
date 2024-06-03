//Known Issues:
//- Does not work with pdf or local files (intentional)
//- google mail export button opens blob url instead of downloading automatically
//- Drawings take up a lot of space

//alert user if they have not paid
//highlight text
//CANVAS MAKES PAGE SCROLL HORIZONTAL

//Fixes for v1.X.X by June 2024
//google mail link broken
//should be able to drag, move, and resize? notes
//view all notes on current page in sidebar?
//Add more export options (google docs, share buttons?, notes apps)
//mouse moves faster than note so there are problems when it reaches the edge
//styles for browser.html
//move draw menu to left of screen
//check payment status on save instead of opening menu?

//v2.0.0
//change size of pen and eraser with drawings
//load notes from txt file onto page
//more options
//canvas drawings take a lot of space (split into multiple canvases?)

//v3.0.0
//user themes
//highlight text on screen freeform but snap to text
export {};
import { exportNotes } from "./notes";
import { createNewMenu, closeMenu } from "./menu";
import {
  createStickyNote,
  loadStickyNotes,
  clearAllNotes,
  shareNotes,
  getSharedNotes,
  loadNotes,
} from "./notes/notes";
import { Drawing, DrawMode, loadDrawing, saveDrawing } from "./drawings";
import { getCurrentCleanUrl } from "./util";
import { highlight } from "./highlight";

//other stuff
const filetype = ".txt";
let drawing: Drawing;

function closeAllMenus() {
  closeMenu("main-menu");
  closeMenu("draw-menu");
}

async function toggleMenu(open: boolean) {
  if (!open) {
    closeAllMenus();
    return;
  }

  createNewMenu(
    "main-menu",
    [
      {
        text: "Draw",
        icon: chrome.runtime.getURL("assets/brush-alt.svg"),
        onclick: (activate, el, icon, text) => {
          if (activate) {
            createNewMenu(
              "draw-menu",
              [
                {
                  text: "Clear",
                  icon: chrome.runtime.getURL("assets/trash-can.svg"),
                  onclick: () => {
                    if (drawing) {
                      drawing.clear();
                    }
                  },
                },
                {
                  text: "Save",
                  icon: chrome.runtime.getURL("assets/save.svg"),
                  onclick: async (active, el, icon, text) => {
                    if (drawing) {
                      text.innerText = "Saving...";
                      await saveDrawing(getCurrentCleanUrl(), drawing);
                      text.innerText = "Save";
                    }
                  },
                },
                {
                  text: "Pen",
                  icon: chrome.runtime.getURL("assets/brush-alt.svg"),
                  onclick: (
                    active: boolean,
                    el: HTMLElement,
                    icon: HTMLImageElement,
                    text: HTMLElement
                  ) => {
                    if (!active) {
                      icon.src = chrome.runtime.getURL("assets/brush-alt.svg");
                      text.innerText = "Pen";
                      drawing.setMode(DrawMode.PEN);
                    } else {
                      icon.src = chrome.runtime.getURL("assets/eraser.svg");
                      text.innerText = "Eraser";
                      drawing.setMode(DrawMode.ERASE);
                    }
                    //update the icon
                  },
                },
              ],
              [0, 70]
            );

            text.innerText = "Exit";
            icon.src = chrome.runtime.getURL("assets/exit.svg");
            drawing.setMode(DrawMode.PEN);
          } else {
            closeMenu("draw-menu");
            text.innerText = "Draw";
            icon.src = chrome.runtime.getURL("assets/brush-alt.svg");
            drawing.setMode(DrawMode.DISABLED);
          }
        },
      },
      {
        text: "Add Note",
        icon: chrome.runtime.getURL("assets/add-files.svg"),
        onclick: () => createStickyNote(),
      },
      {
        text: "Share Notes",
        icon: chrome.runtime.getURL("assets/link.svg"),
        onclick: () => {
          const confirmed = confirm(
            "Sharing will upload all notes on this url to our server. Do you wish to continue?"
          );
          if (confirmed) {
            shareNotes(getCurrentCleanUrl());
          }
        },
      },
      {
        text: "Highlight",
        icon: chrome.runtime.getURL("assets/highlight-alt.svg"),
        onclick: () => {
          highlight();
        },
      },
      {
        text: "Export (.txt)",
        icon: chrome.runtime.getURL("assets/download.svg"),
        onclick: () => {
          exportNotes(
            getCurrentCleanUrl(),
            window.location.hostname + filetype
          );
        },
      },
      {
        text: "Browse Notes",
        icon: chrome.runtime.getURL("assets/book.svg"),
        onclick: () => chrome.runtime.sendMessage({ message: "browse-notes" }),
      },
    ],
    [0, 10]
  );
}

//logic for loading a new page
async function loadPage() {
  closeAllMenus();
  clearAllNotes();

  if (drawing) {
    drawing.canvas.remove();
  }

  loadStickyNotes();
  drawing = Drawing.createBlankDrawing();
  loadDrawing(getCurrentCleanUrl(), drawing);
}

window.addEventListener("load", async (e) => {
  await loadPage();
});

let lastUrl = getCurrentCleanUrl();
new MutationObserver(async () => {
  const url = getCurrentCleanUrl();
  if (url !== lastUrl) {
    lastUrl = url;
    await loadPage();
  }
}).observe(document, { subtree: true, childList: true });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == "toggle-notes-menu") {
    toggleMenu(request.visible);
  }

  if (request.action == "load-shared-notes") {
    clearAllNotes();
    loadNotes(request.notes, true);
  }

  if (request.action == "alert") {
    alert(request.content);
  }

  sendResponse({ status: "ok" });

  return true;
});
