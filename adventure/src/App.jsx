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
  const [usedItem, setUsedItem] = useState("");

  const addLog = (line) => {
    const newLog = line + "\n" + log;
    setLog(newLog);
  }

  const addItem = (item) => {
    const newItems = [...items, item];
    setItems(newItems);
  }

  const handleHover = (object) => {
    const action = usedItem ? `Use ${usedItem} on ` : "";
    setBanner(action + object);
  }

  return (
    <>
      <Banner value={banner} />
      <Screen
        image={room1}
        mask={room1mask}
        onHovers={[
          () => handleHover("Window"),
          () => handleHover("Door"),
          () => handleHover("Cupboard"),
          () => handleHover("Oil lamp"),
        ]}
        onHoverOut={() => handleHover("")}
        onClicks={[
          () => addLog("The window won't budge…"),
          () => addLog("The door won't budge…"),
          () => {
            addLog("You found a key!")
            addItem({
              label: "Key",
              onClick: () => setUsedItem("key"),
            })
          },
          () => {
            addLog("You took the oil lamp!"),
            addItem({
              label: "Oil Lamp",
              onClick: () => setUsedItem("lamp"),
            })
          }
        ]}
      />
      <Inventory items={items} />
      <Log value={log} />
    </>
  );
}

export default App;
