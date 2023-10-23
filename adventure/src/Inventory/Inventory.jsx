import React from 'react';

const Inventory = ({
  items,
  onClick,
}) => {

  return (
    <div style={{ height: "8rem" }}>
      { items.map(item =>
        <button
          onClick={() => onClick(item)}
          style={{ fontSize: "24pt", margin: "1rem" }}
          key={item}
        >
          {item}
        </button>  
      ) }
    </div>
  );
};

export { Inventory };
