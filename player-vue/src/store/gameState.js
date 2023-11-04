import { reactive } from 'vue';

const gameState = reactive({
  currentRoom: 'a1_spawn',
  visitedRooms: [],
  items: [],
  itemsTaken: [],
  flags: ['dud_level_3'], // TODO: move this to content
  console: [],
});

export default gameState;
