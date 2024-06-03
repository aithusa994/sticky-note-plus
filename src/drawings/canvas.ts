import { calculateHeight, calculateWidth } from "../util";

enum DrawMode {
  PEN,
  ERASE,
  DISABLED,
}

class Drawing {
  mode: DrawMode = DrawMode.PEN;
  clickable: boolean = true;
  //rendering
  context: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  pointer: HTMLElement;

  private constructor() {
    this.setupPointer();
    this.setupCanvas();
  }

  private setupCanvas() {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    this.canvas.id = "sticky--canvas";
    this.canvas.width = calculateWidth();
    this.canvas.height = calculateHeight();
    this.context.save();
    document.body.append(this.canvas);
  }

  private setupPointer() {
    this.pointer = document.createElement("div");
    this.pointer.style.position = "absolute";
    this.pointer.style.display = "none";
    this.pointer.style.pointerEvents = "none";
    document.body.appendChild(this.pointer);
  }

  setMode(mode: DrawMode) {
    this.mode = mode;
    if (this.mode == DrawMode.DISABLED) {
      this.canvas.style.pointerEvents = "none";
    } else {
      this.canvas.style.pointerEvents = "auto";
    }
  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  resize() {
    const data = this.canvas.toDataURL();
    const image = new Image();
    this.canvas.height = calculateHeight();
    this.canvas.width = calculateWidth();
    this.context = this.canvas.getContext("2d");
    const drawing = this;
    image.onload = function () {
      drawing.context.drawImage(image, 0, 0);
    };
    image.src = data;
  }

  static createBlankDrawing(): Drawing {
    const drawing = new Drawing();

    var isIdle = true;

    function drawstart(event: any) {
      drawing.context.beginPath();
      drawing.context.moveTo(
        event.pageX - drawing.canvas.offsetLeft,
        event.pageY - drawing.canvas.offsetTop
      );

      isIdle = false;
    }

    function draw(x: number, y: number) {
      drawing.context.globalCompositeOperation = "source-over";
      drawing.context.strokeStyle = "red";
      drawing.context.lineTo(
        x - drawing.canvas.offsetLeft,
        y - drawing.canvas.offsetTop
      );
      drawing.context.stroke();
      movePointer(x, y, 2);
    }

    function movePointer(x: number, y: number, size: number) {
      drawing.pointer.style.display = "block";
      drawing.pointer.style.width = size + "px";
      drawing.pointer.style.height = size + "px";
      drawing.pointer.style.pointerEvents = "none";
      drawing.pointer.style.zIndex = "9999999";
      drawing.pointer.style.top = y - size / 2 + "px";
      drawing.pointer.style.left = x - size / 2 + "px";
      drawing.pointer.style.border = "2px solid " + drawing.context.strokeStyle;
      drawing.pointer.style.borderRadius = "100%";
    }

    function erase(x: number, y: number) {
      drawing.context.globalCompositeOperation = "destination-out";
      drawing.context.strokeStyle = "black";
      let eraserSize = 100;
      var radius = eraserSize / 2;

      drawing.context.beginPath();
      drawing.context.arc(x, y, radius, 0, 2 * Math.PI);
      drawing.context.fill();
      movePointer(x, y, eraserSize);
    }

    function drawmove(event: any) {
      if (isIdle) return;

      if (drawing.mode == DrawMode.PEN) {
        draw(event.pageX, event.pageY);
      } else {
        erase(event.pageX, event.pageY);
      }
    }

    function drawend(event: any) {
      if (isIdle) return;
      drawmove(event);
      isIdle = true;
      drawing.pointer.style.display = "none";
    }

    drawing.canvas.addEventListener("touchstart", (ev) =>
      drawstart(ev.touches[0])
    );

    drawing.canvas.addEventListener("touchmove", (ev) => {
      drawmove(ev.touches[0]);
      ev.preventDefault();
    });

    drawing.canvas.addEventListener("touchend", (ev) => {
      drawend(ev.changedTouches[0]);
    });

    //resizing (look into multiple canvas per screen)
    const body = document.getElementsByTagName("body")[0];

    let resizeObserver = new ResizeObserver(() => {
      drawing.resize();
    });

    resizeObserver.observe(body);
    //end resizing

    drawing.canvas.addEventListener("mousedown", drawstart);
    drawing.canvas.addEventListener("mousemove", drawmove);
    drawing.canvas.addEventListener("mouseup", drawend);

    return drawing;
  }
}

export { Drawing, DrawMode };
