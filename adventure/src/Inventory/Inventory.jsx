import React from 'react';
import './Inventory.css';

const Inventory = ({
  items,
  activeItem,
  onClick,
}) => {

  return (
    <div style={{ height: "8rem" }}>
      { items.map(item =>
        <button
          onClick={() => onClick(item)}
          className="inventoryItem"
          style={{
            border: activeItem === item && "2px solid gold",
          }}
          key={item}
        >
          {item}
        </button>  
      ) }
    </div>
  );
};

export { Inventory };
