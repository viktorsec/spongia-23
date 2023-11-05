import { reactive } from 'vue';

const gameState = reactive({
  currentRoom: 'a3_crossroads',
  visitedRooms: [],
  items: ['barrel', 'match_lit', 'cannonball'],
  itemsTaken: [],
  flags: ['dud_level_3'], // TODO: move this to content
  console: [],
});

export default gameState;
