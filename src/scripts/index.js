import p5 from "p5";
import { initializeCamCapture } from "./cameraUtils";
import { saveCanvasAsPNG } from "./utils";
import fontUrl from "../assets/fonts/MonaspaceNeon-WideExtraLight.otf";

new p5((sk) => {
  // ---- SETTINGS
  let numSlices = 12;
  let delay = 12;

  let capture;
  let sliceWidth, sliceHeight, sliceStartX, sliceStartY;
  let sliceSlider;
  let customFont;
  let startTime;
  let fadeStartTime;

  const buffer = [];

  sk.preload = () => {
    customFont = sk.loadFont(fontUrl);
  };

  sk.setup = () => {
    sk.createCanvas(sk.windowWidth, sk.windowHeight);
    capture = initializeCamCapture(sk);

    // Initialize timer
    startTime = sk.millis();

    sliceSlider = document.getElementById("sliceSlider");

    sliceWidth = sk.width / numSlices;
    sliceHeight = sk.height;
    sliceStartX = sk.width / 2 - sliceWidth / 2;
    sliceStartY = 0;
  };

  sk.draw = () => {
    sk.background("black");

    let elapsedTime = sk.millis() - startTime;
    let isExperienceReady = capture && capture.loadedmetadata;

    if (elapsedTime < 2000 || !isExperienceReady) {
      sk.push();
      sk.fill(255, 255, 255, 255);
      if (customFont) {
        sk.textFont(customFont);
      }
      sk.textAlign(sk.CENTER);
      sk.textSize(32);
      sk.text("WALKING PIECE", sk.width / 2, sk.height / 2);
      sk.pop();

      return;
    }

    if (!fadeStartTime) {
      fadeStartTime = sk.millis();
    }

    // Fade for 1 second after ready
    if (sk.millis() - fadeStartTime < 1000) {
      let fadeAlpha = sk.map(sk.millis() - fadeStartTime, 0, 1000, 255, 0);

      sk.push();
      sk.fill(255, 255, 255, fadeAlpha);
      if (customFont) {
        sk.textFont(customFont);
      }
      sk.textAlign(sk.CENTER);
      sk.textSize(32);
      sk.text("WALKING PIECE", sk.width / 2, sk.height / 2);
      sk.pop();

      return;
    }

    // Set experience as started after resources are ready
    experienceStarted = true;

    numSlices = parseInt(sliceSlider.value);
    sliceWidth = sk.width / numSlices;

    if (numSlices > 72 && numSlices < 120) {
      delay = 4;
    } else if (numSlices > 48 && numSlices < 72) {
      delay = 8;
    } else if (numSlices > 12 && numSlices < 48) {
      delay = 12;
    } else if (numSlices < 12) {
      delay = 16;
    }

    let currentFrame = capture.get(
      sliceStartX,
      sliceStartY,
      sliceWidth,
      sliceHeight
    );

    buffer.push(currentFrame);

    let bufferSizeLimit = numSlices * delay;

    if (buffer.length > bufferSizeLimit) {
      buffer.shift();
    }

    for (let i = 0; i < numSlices; i++) {
      let bufferIndex = buffer.length - 1 - i * delay;

      if (bufferIndex >= 0) {
        let slice = buffer[bufferIndex];

        sk.push();
        // let tintHue = (sk.frameCount - i * delay) % 360;
        // let tintOpacity = pulse(sk, 0, 100, delay * i + 120);
        // sk.tint(tintHue, 100, 50, 100);
        sk.translate(i * sliceWidth - sliceWidth, 0);
        sk.image(slice, sliceWidth, 0);
        sk.pop();
      }
    }
  };

  saveCanvasAsPNG(sk);
});
