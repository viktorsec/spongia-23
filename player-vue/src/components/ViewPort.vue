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
      <div v-if="overlaysDisplayed">
        <img
          v-for="overlay in overlaysDisplayed"
          :key="overlay.image"
          :src="loadImage(overlay.image)"
          class="object"
        />
      </div>
      <div v-if="itemsDisplayed">
        <img
          v-for="item in itemsDisplayed"
          :key="item.id"
          :src="loadImage(item.image)"
          class="overlay"
          :data-label="item.id"
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
      <p>Hovering object: {{ activeItem }}</p>
      <p>Active item: {{ holdingItem }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, toRaw, watch, computed } from 'vue';
import gameState from '@/store/gameState';

const props = defineProps({
  room: Object,
  maskVisible: Boolean,
  holdingItem: String,
});

const maskElement = ref(null);
const activeZone = ref(null);
const activeItem = ref(null);

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
  if (props.room.items) {
    props.room.items.forEach((item) => {
      const objectImg = document.querySelector(`img[data-label=${item.id}]`);
      if (objectImg == null) return;
      const rgba = getPixel(objectImg, x, y);
      if (rgba[3] != 0) {
        hoveredObject = item;
      }
    });
  }

  const maskColor = rgbaToHex(getPixel(maskElement.value, x, y));
  const zone = props.room.zones.find((zone) => zone.color === maskColor);

  activeItem.value = hoveredObject;
  activeZone.value = zone;
}

const moveHandler = (event) => {
  const x = event.layerX;
  const y = event.layerY;

  getHovering(x, y);
}

const selectAction = (actions, trigger = null) => {
  const matchedActions = trigger
    ? actions.filter((action) => action.trigger === trigger)
    : actions.filter((action) => !action.trigger);
  const eligibleActions = matchedActions.filter((action) => {
    if (action.conditions?.hasItem && !gameState.items.includes(action.conditions.hasItem)) {
      return false;
    }
    if (action.conditions?.hasItemNot && gameState.items.includes(action.conditions.hasItemNot)) {
      return false;
    }
    if (action.conditions?.hasFlags) {
      const flagArray = action.conditions.hasFlags.split(',');
      if(flagArray.some((flag) => !gameState.flags.includes(flag))) {
        return false;
      }
    }
    if (action.conditions?.hasFlagsNot) {
      const flagArray = action.conditions.hasFlagsNot.split(',');
      if(!flagArray.some((flag) => !gameState.flags.includes(flag))) {
        return false;
      }
    }

    return true;
  });
  console.log(`eligible ${eligibleActions.length} actions`);

  const selectedAction = randomArrayItem(eligibleActions);
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
  const takeItem = (value) => {
    const index = gameState.items.indexOf(value);
    gameState.items.splice(index, 1);
  }
  const setFlag = (value) => {
    if (!gameState.flags.includes(value)) {
      gameState.flags.push(value);
    }
  }
  const unsetFlag = (value) => {
    const index = gameState.flags.indexOf(value);
    gameState.flags.splice(index, 1);
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
  if(action.takeItem) {
    takeItem(action.takeItem);
  }
}

const clickHandler = () => {
  if (activeItem.value) {
    const item = toRaw(activeItem.value);
    handleAction({
      ...item,
      giveItem: item.id,
    });
  } else if (activeZone.value) {
    const zone = toRaw(activeZone.value);
    const selectedAction = selectAction(zone.actions, props.holdingItem);
    handleAction(selectedAction);
  }
}

const processRoomLoad = () => {
  if (props.room.enterAction) {
    handleAction(props.room.enterAction);
  }
}

watch(() => props.room, processRoomLoad);

const itemsDisplayed = computed(() => {
  if (!props.room.items) {
    return [];
  }
  return props.room.items.filter((item) => !gameState.itemsTaken.includes(item.id));
})

const overlaysDisplayed = computed(() => {
  if (!props.room.overlays) {
    return [];
  }
  return props.room.overlays.filter((overlay) => {
    if (!overlay.conditions) {
      return true;
    }
    if (overlay.conditions.hasFlags && gameState.flags.includes(overlay.conditions.hasFlags)) {
      return true;
    }
    if (overlay.conditions.hasFlags) {
      const flagArray = overlay.conditions.hasFlags.split(',');
      if(flagArray.every((flag) => gameState.flags.includes(flag))) {
        return true;
      }
    }

    return false;
  });
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
.viewport .object,
.viewport .overlay {
  display: block;
  width: 100%;
  position: absolute;
}

.viewport .mask {
  user-select: none;
}
</style>