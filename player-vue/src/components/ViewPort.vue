<template>
  <div>
    <div class="viewport-wrapper">
      <div
        class="viewport"
        @mousemove="moveHandler"
        @mouseleave="leaveHandler"
        @click="clickHandler"
        :style="{
          cursor: activeZone?.cursor,
        }"
      >
        <img
          :src="loadImage(room.background)"
          class="background"
        />
        <img
          :src="maskSource"
          class="mask"
          draggable="false"
          ref="maskElement"
          :style="{
            opacity: clientState.maskVisible ? 0.8 : 0,
          }"
        />
        <div v-if="overlaysDisplayed">
          <img
            v-for="overlay in overlaysDisplayed"
            :key="overlay.image"
            :src="loadImage(overlay.image)"
            class="object"
            draggable="false"
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
        <div
          ref="tooltipElement"
          class="tooltip"
          :class="{
            hidden: !activeTooltip
          }"
        >
          {{ activeTooltip }}
        </div>
      </div>
      <div class="debug" v-if="clientState.debugVisible">
        <p>Hovering zone: {{ activeZone?.color }}</p>
        <p>Hovering item: {{ activeItem?.id }}</p>
        <p>Holding item: {{ holdingItem }}</p>
        <p>Flags: {{ gameState.flags }}</p>
        <p>Action count: {{ actionCount }}</p>
        <p>Max action count: {{ props.room.maxActions }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, toRaw, watch, computed } from 'vue';
import gameState from '@/store/gameState';
import clientState from '@/store/clientState';

const props = defineProps({
  room: Object,
  holdingItem: String,
});

const maskElement = ref(null);
const tooltipElement = ref(null);
const activeZone = ref(null);
const activeItem = ref(null);
const maskSource = ref(null);

const actionCount = ref(0);

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

const tooltipFollow = (x, y) => {
  if (tooltipElement.value) {
    tooltipElement.value.style.left = `${x + 20}px`;
    tooltipElement.value.style.top = `${y - 20}px`;
  }
}

const moveHandler = (event) => {
  const x = event.layerX;
  const y = event.layerY;

  getHovering(x, y);
  tooltipFollow(x, y);
}

const leaveHandler = () => {
  activeItem.value = null;
  activeZone.value = null;
}

const selectAction = (actions, trigger = null) => {
  // TODO: Refactor this
  const matchedActions = trigger
    ? actions.filter((action) => action.trigger === trigger).length
      ? actions.filter((action) => action.trigger === trigger)
      : actions.filter((action) => action.trigger === '$FALLBACK')
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

  const handlers = {
    say: (value) => gameState.console.push(value),
    goto: (value) => gameState.currentRoom = value,
    giveItem(value) {
      gameState.itemsTaken.push(value);
      gameState.items.push(value);
    },
    takeItem(value) {
      const index = gameState.items.indexOf(value);
      gameState.items.splice(index, 1);
    },
    setFlag(value) {
      if (!gameState.flags.includes(value)) {
        gameState.flags.push(value);
      }
    },
    unsetFlag(value) {
      const index = gameState.flags.indexOf(value);
      gameState.flags.splice(index, 1);
    },
    flipFlag(value) {
      if (gameState.flags.includes(value)) {
        this.unsetFlag(value);
      } else {
        this.setFlag(value);
      }
    }
  };

  Object.keys(handlers).forEach((key) => {
    if (action[key]) {
      handlers[key](action[key]);
    }
  });

  actionCount.value++;
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
  actionCount.value = 0;
  if (props.room.enterAction) {
    handleAction(props.room.enterAction);
  }
  const loadMask = () => {
    if (typeof props.room.mask === 'object') {
      const selectedMask = randomArrayItem(props.room.mask);
      return loadImage(selectedMask);
    }
    return loadImage(props.room.mask)
  }
  maskSource.value = loadMask();
}

watch(() => props.room, processRoomLoad);

watch(actionCount, (newValue) => {
  if (props.room.maxActions && props.room.maxActions <= newValue) {
    handleAction(props.room.leaveAction);
  }
})

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

const activeTooltip = computed(() => {
  if (activeItem.value?.tooltip) {
    return activeItem.value.tooltip;
  }
  if (activeZone.value?.tooltip) {
    return activeZone.value.tooltip;
  }

  return null;
});

processRoomLoad();

</script>

<style scoped>
.viewport-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.viewport {
  flex: 1;
  /* TODO optimize */
  max-width: min(100%, calc(calc(100vh - 15rem) * 1.46));
  max-height: calc(100vh - 15rem);
  aspect-ratio: 3 / 2.05;
  outline: 1px solid rgba(255, 255, 255, 0.15);
  position: relative;
  @media screen and (min-width: 768px) {
    max-width: min(100%, calc(calc(100vh - 17rem) * 1.46));
  }
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

.debug {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 10;
  background-color: #333;
  font-family: monospace;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.tooltip {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 2rem;
  padding: 0.25rem 0.75rem;
  opacity: 1;
  transition: opacity .3s;
  &.hidden {
    opacity: 0;
    transition: none;
  }
}
</style>