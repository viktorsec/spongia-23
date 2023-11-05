import { reactive } from 'vue';

const clientState = reactive({
  maskVisible: false,
  debugVisible: false,
  debugMode: false,
});

export default clientState;
