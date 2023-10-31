import { reactive } from 'vue';

const gameState = reactive({
  currentRoom: 'a1_spawn',
  visitedRooms: [],
  items: [],
  flags: [],
  console: [],
});

export default gameState;
