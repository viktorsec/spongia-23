import React from 'react';

const Log = ({
  value
}) => {

  return (
    <textarea
      defaultValue={value}
      style={{ width: "1080px", height: "400px", fontSize: "24pt" }}
    />
  );
};

export { Log };
