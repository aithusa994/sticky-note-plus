import { sendMessage } from "./util";

const state = {
  isMenuVisible: false,
};

function toggleMenu() {
  state.isMenuVisible = !state.isMenuVisible;
  sendMessage({
    action: "toggle-notes-menu",
    visible: state.isMenuVisible,
  });
}

export { toggleMenu };
