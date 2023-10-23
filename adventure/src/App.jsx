import React, { useState } from 'react';
import room1 from './assets/room-1.jpg';
import room1mask from './assets/room-1-mask.png';
import { Banner } from './Banner';
import { Inventory } from './Inventory';
import { Log } from './Log';
import { Screen } from './Screen';
import './App.css';

function App() {
  const [banner, setBanner] = useState("");
  const [log, setLog] = useState("");
  const [items, setItems] = useState([]);
  const [activeItem, setActiveItem] = useState("");

  const addLog = (line) => {
    const newLog = line + "\n" + log;
    setLog(newLog);
  }

  const addItem = (item) => {
    const newItems = [...items, item];
    setItems(newItems);
  }

  const updateBanner = (object) => {
    const action = activeItem ? `Use ${activeItem} on ` : "";
    setBanner(action + object);
  }

  const handleScreenHover = (zone) => {
    switch (zone) {
    case 1:
      updateBanner("Window");
      break;
    case 2:
      updateBanner("Door");
      break;
    case 3:
      updateBanner("Cupboard");
      break;
    case 4:
      updateBanner("Oil Lamp");
      break;
    default:
      updateBanner("");
    }
  };

  const handleScreenClick = (zone) => {
    switch (zone) {
      case 1:
        addLog("The window won't budge…");
        break;
      case 2:
        addLog("The door won't budge…");
        break;
      case 3:
        addLog("You found a key!");
        addItem("Key");
        break;
      case 4:
        addLog("You took the oil lamp!");
        addItem("Oil Lamp");
        break;
    }
  };

  const handleInventoryClick = (item) => {
    if (activeItem === item) {
      setActiveItem("");
    } else {
      setActiveItem(item);
    }
  };

  return (
    <>
      <Banner value={banner} />
      <Screen
        image={room1}
        mask={room1mask}
        onHover={handleScreenHover}
        onClick={handleScreenClick}
      />
      <Inventory items={items} onClick={handleInventoryClick} />
      <Log value={log} />
    </>
  );
}

export default App;
