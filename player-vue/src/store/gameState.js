import { reactive } from 'vue';

const gameState = reactive({
  currentRoom: 'a0_inside',
  visitedRooms: [],
  items: [],
  itemsTaken: [],
  flags: ['dud_level_3'], // TODO: move this to content
  console: [],
});

export default gameState;
