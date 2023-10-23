import React from 'react';

const Inventory = ({
  items,
  onClick,
}) => {

  return (
    <div>
      { items.map(item =>
        <button
          onClick={() => onClick(item)}
          style={{ fontSize: "24pt", margin: "1rem" }}
        >
          {item}
        </button>  
      ) }
    </div>
  );
};

export { Inventory };
