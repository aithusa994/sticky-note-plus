let tooltip: HTMLElement | null = null;
let lastSelection: string = "";
/*
document.addEventListener("mouseup", (event) => {
  const selection = window.getSelection().toString().trim();

  if (selection !== "" && lastSelection != selection) {
    lastSelection = selection;
    const { shadow, element } = createTooltip(event.pageX, event.pageY);

    //three buttons => highlight, create note, and delete higlight
    createHighlightButton(
      shadow,
      chrome.runtime.getURL("assets/highlight-alt.svg"),
      "Highlight Text",
      () => {
        highlight(selection);
      }
    );

    createHighlightButton(
      shadow,
      chrome.runtime.getURL("assets/add-files.svg"),
      "Create a new note",
      () => {
        alert("note!");
      }
    );

    tooltip = element;
  }
});

document.addEventListener("mousedown", function (event) {
  if (tooltip) {
    tooltip.remove();
  }
});

function createHighlightButton(
  shadow: ShadowRoot,
  url: string,
  hover: string,
  action: () => void
) {
  const button = document.createElement("button");
  const img = document.createElement("img");
  img.src = url;
  button.appendChild(img);

  button.title = hover;
  button.onclick = (e) => {
    alert("a");
  };
  shadow.appendChild(button);
}

function createTooltip(x: number, y: number) {
  const element = document.createElement("div");
  element.id = "sticky--notes_highlight";

  element.className = "highlight-popup";
  element.innerText = "Popup content";
  element.style.backgroundColor = "purple";
  // Position the popup near the selection
  element.style.position = "absolute";
  element.style.top = y + 10 + "px";
  element.style.left = x + 10 + "px";
  element.style.zIndex = "9999";
  element.style.display = "flex";
  document.body.appendChild(element);

  const shadow = element.attachShadow({ mode: "open" });

  return { shadow, element };
}*/

function highlight() {
  var userSelection = window.getSelection().getRangeAt(0);
  var safeRanges = getSafeRanges(userSelection);
  for (var i = 0; i < safeRanges.length; i++) {
    highlightRange(safeRanges[i]);
  }
  clearSelection();
}

function highlightRange(range: any) {
  var newNode = document.createElement("div");
  newNode.onclick = () => {
    const del = confirm("Do you want to remove this highlight?");
    if (del) {
      var textNode = document.createTextNode(newNode.textContent);
      newNode.parentNode.replaceChild(textNode, newNode);
    }
  };
  newNode.setAttribute("style", "background-color: yellow; display: inline;");
  range.surroundContents(newNode);
}

function getSafeRanges(dangerous: any) {
  //from stack overflow
  var a = dangerous.commonAncestorContainer;
  // Starts -- Work inward from the start, selecting the largest safe range
  var s = new Array(0),
    rs = new Array(0);
  if (dangerous.startContainer != a) {
    for (let i = dangerous.startContainer; i != a; i = i.parentNode) {
      s.push(i);
    }
  }
  if (s.length > 0) {
    for (let i = 0; i < s.length; i++) {
      var xs = document.createRange();
      if (i) {
        xs.setStartAfter(s[i - 1]);
        xs.setEndAfter(s[i].lastChild);
      } else {
        xs.setStart(s[i], dangerous.startOffset);
        xs.setEndAfter(s[i].nodeType == Node.TEXT_NODE ? s[i] : s[i].lastChild);
      }
      rs.push(xs);
    }
  }

  // Ends -- basically the same code reversed
  var e = new Array(0),
    re = new Array(0);
  if (dangerous.endContainer != a) {
    for (let i = dangerous.endContainer; i != a; i = i.parentNode) {
      e.push(i);
    }
  }
  if (e.length > 0) {
    for (let i = 0; i < e.length; i++) {
      var xe = document.createRange();
      if (i) {
        xe.setStartBefore(e[i].firstChild);
        xe.setEndBefore(e[i - 1]);
      } else {
        xe.setStartBefore(
          e[i].nodeType == Node.TEXT_NODE ? e[i] : e[i].firstChild
        );
        xe.setEnd(e[i], dangerous.endOffset);
      }
      re.unshift(xe);
    }
  }

  // Middle -- the uncaptured middle
  if (s.length > 0 && e.length > 0) {
    var xm = document.createRange();
    xm.setStartAfter(s[s.length - 1]);
    xm.setEndBefore(e[e.length - 1]);
  } else {
    return [dangerous];
  }

  // Concat
  rs.push(xm);
  let response = rs.concat(re);

  // Send to Console
  return response;
}
function clearSelection() {
  window.getSelection().removeAllRanges();
}

export { highlight };
