import React, { useState, useEffect } from 'react';
import room1 from './assets/room-1.jpg';
import room1Mask from './assets/room-1-mask.png';
import room1NoLantern from './assets/room-1-no-lantern.jpg';
import room1NoLanternMask from './assets/room-1-no-lantern-mask.png';
import { Banner } from './Banner';
import { Inventory } from './Inventory';
import { Log } from './Log';
import { Screen } from './Screen';
import './App.css';

const START_PROMPT = "As you slowly open your eyes, a disorienting sense of confusion washes over you as you realize you have no recollection of who you are or how you came to be here.";

const ITEMS = {
  KEY: "Key",
  OIL_LANTERN: "Oil Lantern",
};

function App() {
  const [roomImage, setRoomImage] = useState(room1);
  const [roomMask, setRoomMask] = useState(room1Mask);
  const [banner, setBanner] = useState("");
  const [log, setLog] = useState("");
  const [items, setItems] = useState([]);
  const [activeItem, setActiveItem] = useState("");

  useEffect(()=>{
    setLog(START_PROMPT);
  }, []);

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
        if (activeItem === ITEMS.KEY) {
          addLog("The key doesn\'t fit. It made sense to try, though.");
        } else if (activeItem === ITEMS.OIL_LANTERN) {
          addLog("You oil the window hinge and manage to open the window. You are free!");
        } else {
          addLog("The window won't budge…");
        }
        break;
      case 2:
        if (activeItem === ITEMS.KEY) {
          addLog("The key doesn\'t fit.");
        } else if (activeItem === ITEMS.OIL_LANTERN) {
          addLog("There zero chance you are going to burn the door down with a lantern.");
        } else {
          addLog("The door won't budge…");
        }
        break;
      case 3:
        if (activeItem === ITEMS.KEY) {
          addLog("It would be rather pointless if the key locked the empty cupboard, wouldn\'t it? And… it doesn\'t fit. Surely this key will be useful for something.");
        } else if (activeItem === ITEMS.OIL_LANTERN) {
          addLog("You oil the cupboard hinges. Nice.");
        } else if (items.includes(ITEMS.KEY)) {
          addLog("It's hard to believe, but the cupboard is empty.");
        } else {
          addLog("Hey! You found a key!");
          addItem(ITEMS.KEY);
        }
        break;
      case 4:
        addLog("You took the oil lamp!");
        addItem(ITEMS.OIL_LANTERN);
        setRoomImage(room1NoLantern);
        setRoomMask(room1NoLanternMask);
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
        image={roomImage}
        mask={roomMask}
        onHover={handleScreenHover}
        onClick={handleScreenClick}
      />
      <Inventory items={items} onClick={handleInventoryClick} />
      <Log value={log} />
    </>
  );
}

export default App;
