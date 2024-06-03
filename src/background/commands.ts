import { toggleMenu } from "./menu";

interface Command {
  name: string;
  onCommand: () => void;
}

function registerCommand(cmd: Command) {
  chrome.commands.onCommand.addListener(async (command) => {
    console.log(command);
    if (command === cmd.name) {
      cmd.onCommand();
    }
  });
}

function registerCommands() {
  registerCommand({
    name: "open-full-notes",
    onCommand: () => {
      chrome.tabs.create({ url: chrome.runtime.getURL("html/editor.html") });
    },
  });
  registerCommand({
    name: "toggle-notes-menu",
    onCommand: () => {
      toggleMenu();
    },
  });
}

export { registerCommands };
