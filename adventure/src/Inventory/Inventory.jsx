import React from 'react';

const Inventory = ({
  items
}) => {

  return (
    <div>
      { items.map(item =>
        <button onClick={item.onClick}>
          {item.label}
        </button>  
      ) }
    </div>
  );
};

export { Inventory };
