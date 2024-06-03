import { promptPayment } from "../util";

const storage = chrome.storage.local;

function saveFile(textContent: string, fileName: string) {
  const blob = new Blob([textContent], { type: "text/plain" });

  const anchor = document.createElement("a");
  anchor.style.display = "none";
  anchor.download = fileName;

  const url = window.URL.createObjectURL(blob);
  anchor.href = url;

  document.body.appendChild(anchor);
  anchor.click();

  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}

function removeNote(id: number) {
  storage.get({ savedNotes: [] }, function (result: any) {
    const notes = result.savedNotes;
    const index = notes.findIndex((note: any) => note.id == id);

    if (index > -1) {
      notes.splice(index, 1);
    }

    storage.set({ savedNotes: notes }, () => {});
  });
}

async function getAllNotes(url?: string): Promise<Note[]> {
  return new Promise<Note[]>((resolve, reject) => {
    storage.get({ savedNotes: [] }, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        if (url) {
          const filtered = result.savedNotes.filter(
            (note: any) => note.url === url
          );

          resolve(filtered);
        } else {
          resolve(result.savedNotes);
        }
      }
    });
  });
}

async function saveNote(old_note: Note) {
  const result = await storage.get({ savedNotes: [] });

  const notes = result.savedNotes || [];

  let index = notes.findIndex((note: any) => note.id === old_note.id);

  if (index > -1) {
    notes.splice(index, 1);
  }
  index = notes.findIndex(
    (note: any) => note.x === old_note.x && note.y == old_note.y
  );
  if (index > -1) {
    notes.splice(index, 1);
  }

  notes.push({
    id: old_note.id,
    url: old_note.url,
    x: old_note.x,
    y: old_note.y,
    text: old_note.text,
  });

  let message = "";

  try {
    await storage.set({ savedNotes: notes });
  } catch (error) {
    message = "Out of space";
  }

  return message;
}

function exportNotes(url: string, filename: string) {
  getAllNotes(url).then((notes) => {
    let body = "Url: " + url + "\n";
    body += serializeNotes(notes);
    saveFile(body, filename);
  });
}

function serializeNote(note: Note): string {
  const pos = `(${note.x},${note.y})`;
  return `${pos}: ${note.text}`;
}

function serializeNotes(notes: Note[]): string {
  if (notes.length == 0) {
    return "No notes to save";
  }

  let result = "";

  result += `Last updated: ${new Date().toLocaleTimeString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })}\n\n`;

  notes.forEach((note) => {
    result += serializeNote(note) + "\n";
  });

  return result;
}

export { saveNote, removeNote, exportNotes, getAllNotes };
