import React, { useRef } from 'react';

const Screen = ({
  image,
  mask,
  onHover,
  onClick,
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

  const callCallback = (value, callback) => {
    if (!callback) {
      return;
    }

    switch (value) {
      case 250:
        callback(1);
        break;
      case 200:
        callback(2);
        break;
      case 150:
        callback(3);
        break;
      case 100:
        callback(4);
        break;
      case 50:
        callback(5);
        break;
      default:
        callback(0);
    }
  };

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
    callCallback(color, onHover);
  };

  const handleClick = (event) => {
    const color = getMaskColorBasedOnEvent(event);
    callCallback(color, onClick);
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
