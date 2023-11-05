import { reactive } from 'vue';

const initialState = () => ({
  currentRoom: 'a0_inside',
  items: [],
  itemsTaken: [],
  flags: ['dud_level_3'], // TODO: move this to content
  console: [], // TODO: move this to clientState
});

const gameState = reactive({
  ...initialState(),
});

gameState.restart = () => {
  Object.assign(gameState, initialState());
}

export default gameState;
