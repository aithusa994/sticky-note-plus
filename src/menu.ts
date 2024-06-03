interface MenuItem {
  text: string;
  icon?: string;
  onclick: (
    active: boolean,
    el: HTMLElement,
    icon: HTMLImageElement,
    text: HTMLElement
  ) => void;
}

function createNewMenu(
  id: string,
  items: MenuItem[],
  offset: [number, number] = [0, 0]
) {
  var bar = Object.assign(document.createElement("div"), {
    id: id,
    classList: "sticky--note_container sticky--note_bar",
  });

  bar.style.top = bar.getBoundingClientRect().top + offset[1] + "px";

  const shadow = bar.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
      button {
        background-color: #d9dadf;
        color: black;
        border: none;
        cursor: pointer;
        padding: 1em;
      }
      button:hover {
        background-color: #c8c9cc;
      }
    `;
  shadow.appendChild(style);

  items.forEach((item) => {
    let active = false;

    const el = document.createElement("button");
    el.title = item.text;
    el.style.display = "flex";
    const icon = document.createElement("img");

    if (item.icon) {
      icon.src = item.icon;
      // icon.style.filter = "invert(100%)";
      el.appendChild(icon);
      el.style.gap = ".5em";
      el.style.alignItems = "center";
    }

    const text = document.createElement("span");
    text.innerText = item.text;
    el.appendChild(text);

    el.onclick = (e: MouseEvent) => {
      active = !active;
      item.onclick(active, e.target as HTMLElement, icon, text);
    };

    shadow.appendChild(el);
  });

  document.body.append(bar);
}

function closeMenu(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.remove();
  }
}

export { createNewMenu, MenuItem, closeMenu };
