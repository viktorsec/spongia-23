import React, { useState } from 'react';
import room1 from './assets/room-1.jpg';
import room1mask from './assets/room-1-mask.png';
import { Banner } from './Banner';
import { Screen } from './Screen';
import './App.css';

function App() {
  const [banner, setBanner] = useState("");

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
          () => console.log("The window won't budge"),
          () => console.log("The door won't budge"),
          () => console.log("You found a key!"),
          () => console.log("You took the oil lamp!"),
        ]}
      />
    </>
  );
}

export default App;
