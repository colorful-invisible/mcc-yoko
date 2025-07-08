import p5 from "p5";
import { initializeCamCapture } from "./cameraUtils";
import { saveCanvasAsPNG } from "./utils";
import fontUrl from "../assets/fonts/MonaspaceNeon-WideExtraLight.otf";

new p5((sk) => {
  // ---- SETTINGS
  let numSlices = 12;
  let delay = 12;
  let isHorizontal = false; // false = vertical, true = horizontal

  let capture;
  let sliceWidth, sliceHeight, sliceStartX, sliceStartY;
  let sliceSlider;
  let orientationToggle;
  let customFont;
  let startTime;
  let experienceStarted = false;
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
    orientationToggle = document.getElementById("orientationToggle");

    // Add event listener for orientation toggle
    orientationToggle.addEventListener("change", (e) => {
      isHorizontal = e.target.checked;
      updateSliceDimensions();
    });

    updateSliceDimensions();
  };

  // Function to update slice dimensions based on orientation
  const updateSliceDimensions = () => {
    if (isHorizontal) {
      sliceWidth = sk.width;
      sliceHeight = Math.floor(sk.height / numSlices);
      sliceStartX = 0;
      sliceStartY = sk.height / 2 - sliceHeight / 2;
    } else {
      sliceWidth = Math.floor(sk.width / numSlices);
      sliceHeight = sk.height;
      sliceStartX = sk.width / 2 - sliceWidth / 2;
      sliceStartY = 0;
    }
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

    // Update slice dimensions when numSlices changes
    if (isHorizontal) {
      sliceHeight = Math.floor(sk.height / numSlices);
    } else {
      sliceWidth = Math.floor(sk.width / numSlices);
    }

    updateSliceDimensions();

    if (numSlices > 72 && numSlices < 120) {
      delay = 4;
    } else if (numSlices > 48 && numSlices < 72) {
      delay = 8;
    } else if (numSlices > 12 && numSlices < 48) {
      delay = 12;
    } else if (numSlices < 12) {
      delay = 16;
    }

    // Capture frames based on orientation
    if (isHorizontal) {
      // For horizontal: capture different horizontal strips
      const capturedSlices = [];
      for (let i = 0; i < numSlices; i++) {
        let captureY = Math.floor((i * capture.height) / numSlices);
        let captureHeight = Math.floor(capture.height / numSlices);
        let slice = capture.get(0, captureY, capture.width, captureHeight);
        capturedSlices.push(slice);
      }
      buffer.push(capturedSlices);
    } else {
      // For vertical: capture from center (original behavior)
      let currentFrame = capture.get(
        sliceStartX,
        sliceStartY,
        sliceWidth,
        sliceHeight
      );
      buffer.push(currentFrame);
    }

    let bufferSizeLimit = numSlices * delay;

    if (buffer.length > bufferSizeLimit) {
      buffer.shift();
    }

    for (let i = 0; i < numSlices; i++) {
      let bufferIndex = buffer.length - 1 - i * delay;

      if (bufferIndex >= 0) {
        sk.push();
        // let tintHue = (sk.frameCount - i * delay) % 360;
        // let tintOpacity = pulse(sk, 0, 100, delay * i + 120);
        // sk.tint(tintHue, 100, 50, 100);

        if (isHorizontal) {
          // Horizontal slicing: use the captured slice for this position
          let sliceArray = buffer[bufferIndex];
          if (sliceArray && sliceArray[i]) {
            let slice = sliceArray[i];
            // Position each slice directly at its correct Y position with integer values
            let yPos = i * sliceHeight;
            // For the last slice, extend it to fill any remaining pixels
            let currentSliceHeight =
              i === numSlices - 1 ? sk.height - yPos : sliceHeight;
            sk.image(slice, 0, yPos, sk.width, currentSliceHeight);
          }
        } else {
          // Vertical slicing: translate horizontally (original behavior)
          let slice = buffer[bufferIndex];
          sk.translate(i * sliceWidth - sliceWidth, 0);
          sk.image(slice, sliceWidth, 0);
        }

        sk.pop();
      }
    }
  };

  sk.windowResized = () => {
    sk.resizeCanvas(sk.windowWidth, sk.windowHeight);
    updateSliceDimensions();
  };

  saveCanvasAsPNG(sk);
});
