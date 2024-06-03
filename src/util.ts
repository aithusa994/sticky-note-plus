function getCurrentCleanUrl() {
  let url = window.location.href.split("&")[0];
  url = url.split("#")[0];

  return url;
}

function calculateWidth() {
  var body = document.body,
    html = document.documentElement;

  var width = Math.max(
    body.scrollWidth,
    body.offsetWidth,
    html.clientWidth,
    html.scrollWidth,
    html.offsetWidth
  );
  return width;
}

function calculateHeight() {
  var body = document.body,
    html = document.documentElement;

  var height = Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight
  );
  return height;
}

function promptPayment() {
  alert(
    "Save unlimitted notes per page by purchasing the premium version. Right click the extension icon to manage your subscription"
  );
}
export { getCurrentCleanUrl, calculateHeight, calculateWidth, promptPayment };
