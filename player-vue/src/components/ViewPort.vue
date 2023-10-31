<template>
  <div class="viewport-wrapper">
    <div
      class="viewport"
      @mousemove="moveHandler"
      @click="clickHandler"
      :style="{
        cursor: activeZone?.cursor,
      }"
    >
      <img
        :src="loadImage(room.background)"
        class="background"
      />
      <div v-if="room.objects">
        <img
          v-for="[key, object] in objectsDisplayed"
          :key="key"
          :src="loadImage(object.image)"
          class="object"
          :data-label="key"
        />
      </div>
      <img
        :src="loadImage(room.mask)"
        class="mask"
        ref="maskElement"
        :style="{
          opacity: maskVisible ? 0.8 : 0,
        }"
      />
    </div>
    <div>
      <p>Hovering zone: {{ activeZone }}</p>
      <p>Hovering object: {{ activeObject }}</p>
      <p>Active item: {{ activeItem }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, toRaw, watch, computed } from 'vue';
import gameState from '@/store/gameState';

const props = defineProps({
  room: Object,
  maskVisible: Boolean,
  activeItem: String,
});

const maskElement = ref(null);
const activeZone = ref(null);
const activeObject = ref(null);

const rgbaToHex = (rgba) => {
  function hexByte(x) {
    return ('0' + x.toString(16)).slice(-2).toUpperCase();
  }
  return '#' + hexByte(rgba[0]) + hexByte(rgba[1]) + hexByte(rgba[2]);
}

const randomArrayItem = (array) => {
  if (array.length === 1) {
    return array[0];
  }
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

const loadImage = (path) => {
  const url = new URL(`/src/content/${path}`, import.meta.url).href;
  return url;
}

const getPixel = (image, x, y) => {
  // TODO cache this when screen changes, not every click

  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, image.width, image.height);

  // TODO items on top of background should go first.

  return context.getImageData(x, y, 1, 1).data;
}

const getHovering = (x, y) => {
  let hoveredObject = null;
  if (props.room.objects) {
    for (const label in props.room.objects) {
      const objectImg = document.querySelector(`img[data-label=${label}]`);
      if (objectImg == null) continue;
      const rgba = getPixel(objectImg, x, y);
      if (rgba[3] != 0) {
        hoveredObject = label;
      }
    }
  }

  const maskColor = rgbaToHex(getPixel(maskElement.value, x, y));
  const zone = props.room.zones.find((zone) => zone.color === maskColor);

  activeObject.value = hoveredObject ? props.room.objects[hoveredObject] : null;
  activeZone.value = zone;
}

const moveHandler = (event) => {
  const x = event.layerX;
  const y = event.layerY;

  getHovering(x, y);
}

const selectAction = (actions, trigger) => {
  const matchedActions = trigger
    ? actions.filter((action) => action.trigger === trigger)
    : actions.filter((action) => !action.tirgger);
  const selectedAction = randomArrayItem(matchedActions);
  return selectedAction;
}

const handleAction = (action) => {
  if (!action) {
    return;
  }
  const say = (value) => {
    gameState.console.push(value);
  }
  const goto = (value) => {
    gameState.currentRoom = value;
  }
  const giveItem = (value) => {
    gameState.itemsTaken.push(value);
    gameState.items.push(value);
  }
  const setFlag = (value) => {
    if (!gameState.flags.includes(value)) {
      gameState.flags.push(value);
    }
  }
  const unsetFlag = (value) => {
    const index = gameState.flags.indexOf(value);
    gameState.flags.array.splice(index, 1);
  }
  const flipFlag = (value) => {
    if (gameState.flags.includes(value)) {
      unsetFlag(value);
    } else {
      setFlag(value);
    }
  }

  if(action.say) {
    say(action.say);
  }
  if(action.goto) {
    goto(action.goto);
  }
  if(action.giveItem) {
    giveItem(action.giveItem);
  }
  if(action.setFlag) {
    setFlag(action.setFlag);
  }
  if(action.unsetFlag) {
    unsetFlag(action.unsetFlag);
  }
  if(action.flipFlag) {
    flipFlag(action.flipFlag);
  }
}

const clickHandler = () => {
  if (activeObject.value) {
    const object = toRaw(activeObject.value);
    const selectedAction = selectAction(object.actions);
    handleAction(selectedAction);
  } else if (activeZone.value) {
    const zone = toRaw(activeZone.value);
    const selectedAction = selectAction(zone.actions, props.activeItem);
    handleAction(selectedAction);
  }
}

const processRoomLoad = () => {
  if (props.room.enterAction) {
    handleAction(props.room.enterAction);
  }
}

watch(() => props.room, processRoomLoad);

const objectsDisplayed = computed(() => {
  const objectArray = Object.entries(props.room.objects);
  return objectArray.filter(([key]) => !gameState.itemsTaken.includes(key));
})

</script>

<style scoped>
.viewport-wrapper {
  width: 800px;
}
.viewport {
  position: relative;
  aspect-ratio: 3 / 2.05;
  outline: 1px solid rgba(255, 255, 255, 0.15);
}

.viewport .background,
.viewport .mask,
.viewport .object {
  display: block;
  width: 100%;
  position: absolute;
}

.viewport .mask {
  user-select: none;
}
</style>