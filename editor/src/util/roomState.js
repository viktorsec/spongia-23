import { reactive } from 'vue';

const room = reactive({
  id: '',
  background: [],
  mask: {
    file: '',
    path: '',
    opacity: 0.5,
  },
  zones: [],
});

export default room;
