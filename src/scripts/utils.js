// ---- SAVE P5 CANVAS SNAPSHOT AS PNG
// -----------------------------------
function saveCanvasAsPNG(sk) {
  let snapshotCounter = 1; // Initialize counter
  sk.keyPressed = () => {
    if (sk.key === "s" || sk.key === "S") {
      sk.saveCanvas("canvas-snapshot-" + snapshotCounter, "png");
      snapshotCounter++;
    }
  };
}
// ---- SINOIDAL PULSE
// -------------------
function pulse(sk, min, max, time) {
  const mid = (min + max) / 2;
  const amplitude = (max - min) / 2;
  return amplitude * sk.sin(sk.frameCount * (sk.TWO_PI / time)) + mid;
}

export { saveCanvasAsPNG, pulse };
