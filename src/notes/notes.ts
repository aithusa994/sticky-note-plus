import { saveNote, removeNote, getAllNotes } from "./storage";
import {
  calculateHeight,
  calculateWidth,
  getCurrentCleanUrl,
  promptPayment,
} from "../util";

interface NoteBoxElement {
  note: HTMLElement;
  shadow: ShadowRoot;
}

var g_note: NoteBoxElement;

var mouse = {
  x: 0,
  y: 0,
};

document.addEventListener("mousemove", function (event) {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

document.addEventListener("mousedown", (e) => {
  if (g_note) {
    e.preventDefault();
    g_note.note.classList.add("sticky--placed");
    g_note.note.focus();
    try {
      saveNote({
        id: Number(g_note.note.getAttribute("n_id")),
        url: getCurrentCleanUrl(),
        x: g_note.note.style.left,
        y: g_note.note.style.top,
        text: g_note.shadow.getElementById("sticky--note_body").innerHTML,
      });
    } catch (e) {
      console.error(e);
    }

    g_note = null;
  }
});

document.addEventListener("mousemove", (e) => {
  if (g_note) {
    const x = e.pageX;
    const y = e.pageY;

    if (y > 0 && y < calculateHeight() - 250) {
      g_note.note.style.top = `${y}px`;
    }
    if (x < calculateWidth() - 250) {
      g_note.note.style.left = `${x}px`;
    }
  }
});

async function createStickyNote() {
  const notes = await getAllNotes(getCurrentCleanUrl());

  if (notes.length >= 3) {
    const isPaid: Boolean = await chrome.runtime.sendMessage({
      message: "is-paid",
    });
    if (!isPaid) {
      promptPayment();
      return;
    }
  }

  g_note = createNoteElement(Date.now());
  g_note.note.style.top = mouse.y + "px";
  g_note.note.style.left = mouse.x + "px";
}

function createNoteElement(id: number): NoteBoxElement {
  const note = Object.assign(document.createElement("div"), {
    classList: "sticky--note_container sticky--note_note",
  });

  note.setAttribute("n_id", String(id));
  const shadow = note.attachShadow({ mode: "open" });

  const header = Object.assign(document.createElement("div"), {
    classList: "sticky--note_header",
  });

  const body = Object.assign(document.createElement("div"), {
    id: "sticky--note_body",
    contentEditable: "plaintext-only",
  });

  const saving = document.createElement("div");
  saving.innerText = "";
  saving.style.fontSize = ".75em";
  saving.style.float = "left";

  const del = document.createElement("button");
  const min = document.createElement("button");

  del.innerHTML = "✖";
  min.innerHTML = "🗖";

  let minimized = false;

  min.addEventListener("click", (e) => {
    body.style.display = minimized ? "block" : "none";
    note.style.height = minimized ? "250px" : "0";
    min.innerHTML = !minimized ? "🗗" : "🗖";
    minimized = !minimized;
  });

  del.addEventListener("click", (e) => {
    removeNote(id);
    note.remove();
  });

  header.appendChild(saving);
  header.appendChild(min);
  header.appendChild(del);

  let timer: NodeJS.Timeout;

  body.addEventListener("keydown", (e) => {
    //this prevents events being fired elsewhere in
    //window while typing in box ex) space causes pausing youtube video
    e.stopPropagation();
  });

  body.addEventListener("keyup", (e) => {
    const text = body.innerText;
    clearTimeout(timer);
    saving.innerText = "↻ saving...";

    timer = setTimeout(async () => {
      const message = await saveNote({
        id: id,
        url: getCurrentCleanUrl(),
        text: text,
        x: note.style.left,
        y: note.style.top,
      });
      saving.innerText = message;
    }, 1000);
  });

  shadow.appendChild(header);
  shadow.appendChild(body);

  const style = document.createElement("style");
  style.innerHTML = `  
      .sticky--note_header {
        max-height: 50px;
        background-color: white;
        text-align: right;
        border: 2px solid black;
        opacity: 0.9;
      }
      #sticky--note_body {
        border: 2px solid black;
        flex-grow: 1;
        overflow-y: auto;
        white-space: pre;
      }
  `;

  shadow.appendChild(style);
  document.body.appendChild(note);

  return { note: note, shadow: shadow };
}

function loadNotes(notes: Array<Note>, shared: Boolean = false) {
  notes.forEach((note: any) => {
    const el = createNoteElement(note.id);
    el.note.style.left = note.x;
    el.note.style.top = note.y;
    const body = el.shadow.getElementById("sticky--note_body");
    body.innerHTML = note.text;
    el.note.classList.add("sticky--placed");
    if (shared) {
      el.note.classList.add("sticky--shared");
    }
  });
}

function loadStickyNotes() {
  const url: string = getCurrentCleanUrl();

  getAllNotes(url).then((notes) => {
    loadNotes(notes);
  });
}

function clearAllNotes() {
  Array.from(document.getElementsByClassName("sticky--note_note")).forEach(
    (el) => {
      el.remove();
    }
  );
}

async function getSharedNotes(id: string) {
  const data = await chrome.runtime.sendMessage({
    message: "get-notes",
    id: "a",
  });

  console.log(data);
}

async function shareNotes(url: string) {
  const notes = await getAllNotes(url);
  const response = await chrome.runtime.sendMessage({
    message: "share-notes",
    notes: notes,
  });
  alert(response);
}

export {
  createStickyNote,
  loadStickyNotes,
  createNoteElement,
  clearAllNotes,
  shareNotes,
  getSharedNotes,
  loadNotes,
};
