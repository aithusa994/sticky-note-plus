import { toggleMenu } from "./menu";
import { openPaymentPage, isPaid } from "./payments";

function createContexts() {
  chrome.contextMenus.removeAll();

  const menuItems = [
    { id: "manage-subscription", title: "Manage Subscription" },
    { id: "open-editor", title: "Open Editor (Ctrl + Shift + Y)" },
    { id: "open-menu", title: "Toggle Menu (Ctrl + Shift + H)" },
    { id: "contact-developers", title: "Contact Developer" },
  ];

  menuItems.forEach((item) => {
    chrome.contextMenus.create({
      id: item.id,
      title: item.title,
      contexts: ["action"],
    });
  });

  chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "manage-subscription") {
      openPaymentPage();
    }
    if (info.menuItemId === "open-editor") {
      chrome.tabs.create({ url: chrome.runtime.getURL("html/editor.html") });
    }
    if (info.menuItemId === "open-menu") {
      toggleMenu();
    }
    if (info.menuItemId === "contact-developers") {
      chrome.tabs.create({
        url: chrome.runtime.getURL("html/contact.html"),
      });
    }
    if (info.menuItemId === "highlightMenu") {
      // Perform action when the menu item is clicked
      console.log("Highlighted text:", info.selectionText);
      // You can perform any action here, such as sending the highlighted text to a content script or background script
    }
  });
}

export { createContexts };
