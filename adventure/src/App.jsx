import React from 'react';
import room1 from './assets/room-1.jpg';
import room1mask from './assets/room-1-mask.png';
import { Screen } from './Screen';
import './App.css';

function App() {
  return (
    <>
      <Screen
        image={room1}
        mask={room1mask}
        onHovers={[
          () => console.log("Window"),
          () => console.log("Door"),
          () => console.log("Cupboard"),
          () => console.log("Oil lamp"),
        ]}
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
