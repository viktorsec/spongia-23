import { reactive } from 'vue';

const gameState = reactive({
  // currentRoom: 'a1_spawn',
  currentRoom: 'a2_quarry',
  visitedRooms: [],
  items: ['wrench'],
  itemsTaken: [],
  flags: ['dud_level_3', 'cave_door_unlocked'], // TODO: move this to content
  console: [],
});

export default gameState;
