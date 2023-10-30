import { reactive } from 'vue';

const room = reactive({
  id: '',
  say: '',
  music: '',
  background: [],
  mask: {
    path: '',
  },
  zones: [],
  items: [],
});

export default room;
