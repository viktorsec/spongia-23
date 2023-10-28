import { reactive } from 'vue';

const room = reactive({
  id: '',
  music: '',
  background: [],
  mask: {
    file: '',
    path: '',
    opacity: 0.5,
  },
  zones: [],
});

export default room;
