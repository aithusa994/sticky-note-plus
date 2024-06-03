//browser related files
import { deleteDrawing } from "../drawings";
import { getAllNotes, removeNote } from "../notes";
import { createNoteElement } from "../notes/notes";

chrome.storage.local.getBytesInUse().then((bytes) => {
  chrome.storage.sync.getBytesInUse().then((sbytes) => {
    const el = document.createElement("p");
    const total =
      chrome.storage.sync.QUOTA_BYTES + chrome.storage.local.QUOTA_BYTES;
    el.innerText = String(bytes + sbytes) + "/" + total;
    document.body.appendChild(el);
  });
});

chrome.storage.local.get({ previews: [] }, function (result) {
  result.previews.forEach((preview: Preview) => {
    const link = document.createElement("a");
    link.href = preview.url;
    link.target = "_blank";

    const container = document.createElement("div");
    container.style.width = "30%";
    container.style.padding = "10px";
    container.style.display = "inline-block";

    const image = document.createElement("img");
    image.style.width = "100%";
    image.src = preview.data;

    const deleteButton = document.createElement("button");
    deleteButton.style.position = "absolute";
    deleteButton.innerText = "Delete";
    deleteButton.style.zIndex = "10";

    deleteButton.onclick = (e) => {
      deleteDrawing(preview.url);
      link.remove();
      e.preventDefault();
      location.reload();
    };

    document.getElementById("drawings").appendChild(container);
    container.appendChild(link);
    link.appendChild(deleteButton);
    link.appendChild(image);
  });
  console.log(result);
});

loadPage(1);

function loadPage(page: number) {
  const itemsPerPage = 2;
  getAllNotes().then((notes) => {
    //group by url
    notes.sort((a, b) => {
      if (a.url < b.url) {
        return -1;
      }
      if (a.url > b.url) {
        return 1;
      }
      return 0;
    });

    createTable(notes);
  });
}

function createTable(notes: Note[]) {
  // names must be equal)
  const table: HTMLTableElement = document.createElement("table");
  const headerRow = table.insertRow();
  ["Url", "Text", ""].forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    headerRow.appendChild(th);
  });

  notes.forEach((note) => {
    const row = table.insertRow();
    const link = document.createElement("a");
    link.href = note.url;
    link.innerText = note.url;
    const del = document.createElement("a");

    del.onclick = () => {
      removeNote(note.id);
      row.remove();
    };

    del.innerText = "Delete";
    del.style.cursor = "pointer";

    row.insertCell().appendChild(link);
    row.insertCell().textContent = note.text;
    row.insertCell().appendChild(del);
  });

  table.style.textAlign = "left";
  document.getElementById("notes").appendChild(table);
}
