import React, { useState } from 'react';
import room1 from './assets/room-1.jpg';
import room1mask from './assets/room-1-mask.png';
import { Banner } from './Banner';
import { Log } from './Log';
import { Screen } from './Screen';
import './App.css';

function App() {
  const [banner, setBanner] = useState("");
  const [log, setLog] = useState("");

  const addLog = (line) => {
    const newLog = line + "\n" + log;
    setLog(newLog);
  }

  return (
    <>
      <Banner value={banner} />
      <Screen
        image={room1}
        mask={room1mask}
        onHovers={[
          () => setBanner("Window"),
          () => setBanner("Door"),
          () => setBanner("Cupboard"),
          () => setBanner("Oil lamp"),
        ]}
        onHoverOut={() => setBanner("")}
        onClicks={[
          () => addLog("The window won't budge…"),
          () => addLog("The door won't budge…"),
          () => addLog("You found a key!"),
          () => addLog("You took the oil lamp!"),
        ]}
      />
      <Log value={log} />
    </>
  );
}

export default App;
