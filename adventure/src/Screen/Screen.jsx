import React, { useRef } from 'react';

const Screen = ({
  image,
  mask,
  onHovers,
  onClicks,
  onHoverOut,
}) => {

  const imageRef = useRef();

  const getColorAtPos = (x, y) => {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    const image = document.getElementById("mask");

    // Set the canvas dimensions to match the image
    canvas.width = image.width;
    canvas.height = image.height;

    // Draw the image onto the canvas
    context.drawImage(image, 0, 0, image.width, image.height);

    // Get the image data for the (X, Y) pixel
    const imageData = context.getImageData(x, y, 1, 1).data;

    // Extract RGB values
    const red = imageData[0];
    //const green = imageData[1];
    //const blue = imageData[2];

    return red
  };

  const callCallback = (value, callbacks) => {
    // not sure what to say about this other than apologize
    switch (value) {
      case 250:
        callbacks[0] && callbacks[0]();
        break;
      case 200:
        callbacks[1] && callbacks[1]();
        break;
      case 150:
        callbacks[2] && callbacks[2]();
        break;
      case 100:
        callbacks[3] && callbacks[3]();
        break;
      case 50:
        callbacks[4] && callbacks[4]();
        break;
      default:
        onHoverOut && onHoverOut();
    }
  }

  const getMaskColorBasedOnEvent = (event) => {
    const { left, top } = imageRef.current.getBoundingClientRect();
    const offsetX = Math.floor(left);
    const offsetY = Math.floor(top);
    
    const x = event.clientX - offsetX;
    const y = event.clientY - offsetY;
    
    return getColorAtPos(x, y);
  };

  const handleMouseMove = (event) => {
    const color = getMaskColorBasedOnEvent(event);
    callCallback(color, onHovers);
  };

  const handleClick = (event) => {
    const color = getMaskColorBasedOnEvent(event);
    callCallback(color, onClicks);
  }

  return (
    <>
      <img
        ref={imageRef}
        src={image}
        width={1080}
        height={720}
        alt="game"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      />
      <img
        id="mask"
        src={mask}
        alt="internal image"
        style={{display: "none"}}
      /> 
      <canvas
        id="canvas"
        style={{display: "none"}}
      />
    </>
  );
};

export { Screen };
