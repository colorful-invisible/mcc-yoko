export function initializeCamCapture(sketch) {
  const camFeed = sketch.createCapture(sketch.VIDEO, {
    flipped: true,
    video: {
      width: { min: 1024, ideal: 1440, max: 1920 },
      height: { min: 768, ideal: 1080, max: 1080 },
    },
    audio: false,
  });

  camFeed.elt.setAttribute("playsinline", "");

  camFeed.elt.addEventListener("loadedmetadata", () => {
    const captureAspectRatio = camFeed.width / camFeed.height;
    const canvasAspectRatio = sketch.width / sketch.height;
    let scaledWidth, scaledHeight;

    if (captureAspectRatio > canvasAspectRatio) {
      // Capture is wider than canvas (fit height and crop width)
      scaledHeight = sketch.height;
      scaledWidth = sketch.height * captureAspectRatio;
    } else {
      // Capture is taller than canvas (fit width and crop height)
      scaledWidth = sketch.width;
      scaledHeight = sketch.width / captureAspectRatio;
    }
    camFeed.size(scaledWidth, scaledHeight);
    console.log("camFeed size", camFeed.width, camFeed.height);

    // Center the video element
    camFeed.position(
      (sketch.width - scaledWidth) / 2,
      (sketch.height - scaledHeight) / 2
    );

    console.log(camFeed);

    camFeed.hide();
  });

  return camFeed;
}
