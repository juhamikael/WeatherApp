export function destroyChart() {
  canvasElement.remove();
  const newCanvas = document.createElement("canvas");
  canvasDiv.appendChild(newCanvas);
  canvasElement = newCanvas;
}
