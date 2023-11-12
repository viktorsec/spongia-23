import { reactive } from 'vue';

const clientState = reactive({
  maskVisible: false,
  language: 'sk',
  debugVisible: false,
  debugMode: false,
});

export default clientState;
