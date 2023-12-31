<template>
  <div>
    <div class="viewport-wrapper">
      <div
        class="viewport"
        @mousemove="moveHandler"
        @mouseleave="leaveHandler"
        @click="clickHandler"
        :class="[ activeCursor ]"
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
            draggable="false"
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
        <div
          class="loading-overlay"
          :class="{ hidden: imagesLoaded }"
        />
      </div>
      <div class="debug" v-if="clientState.debugVisible">
        <p>Images loaded: {{ imagesLoaded }}</p>
        <p>Hovering zone: {{ activeZone?.color }}</p>
        <p>Hovering item: {{ activeItem?.id }}</p>
        <p>Holding item: {{ holdingItem }}</p>
        <p>Flags: {{ gameState.flags }}</p>
        <p>Action count: {{ actionCount }}</p>
        <p>Max action count: {{ props.room.maxActions }}</p>
        <p>Active cursor: {{ activeCursor }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, toRaw, watch, computed, nextTick } from 'vue';
import gameState from '@/store/gameState';
import clientState from '@/store/clientState';

const props = defineProps({
  room: Object,
  holdingItem: String,
});

const imagesLoaded = ref(false);
const maskElement = ref(null);
const tooltipElement = ref(null);
const activeZone = ref(null);
const activeItem = ref(null);
const maskSource = ref(null);

const actionCount = ref(0);
const lastCoordinates = ref({ x: null, y: null });

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
    tooltipElement.value.style.left = `${x}px`;
    tooltipElement.value.style.top = `${y - 50}px`;
  }
}

const setLastCoordinates = (x, y) => {
  lastCoordinates.value.x = x;
  lastCoordinates.value.y = y;
}

const moveHandler = (event) => {
  if (!event) {
    getHovering(lastCoordinates.value.x, lastCoordinates.value.y);
    return;
  }
  const x = event.layerX;
  const y = event.layerY;
  setLastCoordinates(x, y);

  getHovering(x, y);
  tooltipFollow(x, y);
}

const leaveHandler = () => {
  activeItem.value = null;
  activeZone.value = null;
  setLastCoordinates(null, null);
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

const maybePlayDubbing = (line) => {
  window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(line)).then(
    (result_buffer) => {
      const digest = Array.from(new Uint8Array(result_buffer))
        .map((byte) => byte.toString(16).padStart(2, "0")).join("");
      const url = new URL(`/src/content/dubbing/${digest}.mp3`, import.meta.url).href;
      new Audio(url).play();
    }
  );
};

const handleAction = (action) => {
  if (!action) {
    return;
  }

  const handlers = {
    say: (translations) => {
      const string = clientState.language === "sk"
        ? translations.sk ?? translations
        : translations.en ?? translations;
      maybePlayDubbing(string);
      gameState.console.push(string);
    },
    goto: (value) => {
      actionCount.value = -1; // incremented to zero below.
      gameState.currentRoom = value;
    },
    giveItem(value) {
      gameState.itemsTaken.push(value);
      gameState.items.push(value);
    },
    takeItem(values) {
      for (const value of values.split(",")) {
        const index = gameState.items.indexOf(value);
        if (index !== -1) {
          gameState.items.splice(index, 1);
        }
      }
    },
    setFlag(values) {
      for (const value of values.split(",")) {
        if (!gameState.flags.includes(value)) {
          gameState.flags.push(value);
        }
      }
    },
    unsetFlag(values) {
      for (const value of values.split(",")) {
        const index = gameState.flags.indexOf(value);
        if (index !== -1) {
          gameState.flags.splice(index, 1);
        }
      }
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
  if (props.room.maxActions && actionCount.value >= props.room.maxActions) {
    // Ignore action and override it with leaveAction when exceeding the limit.
    handleAction(props.room.leaveAction);
    return;
  }

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
  imagesLoaded.value = false;
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

  nextTick(() => {
    const images = document.querySelectorAll('.viewport img');
    console.log(images);

    const imageLoader = Array.from(images).map((image) => {
      return new Promise((resolve, reject) => {
        const loader = new Image();
        loader.src = image.src;
        loader.onload = resolve;
        loader.onerror = reject;
      });
    });

    Promise.all(imageLoader).then(() => { 
      imagesLoaded.value = true;
      // TODO: Improve this
      moveHandler();
    }).catch(error => {
      console.error('Some image(s) failed loading!');
      console.error(error.message)
    });
  });
  setTimeout(() => {
  }, 200);
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
    if (overlay.conditions.hasFlags) {
      const flagArray = overlay.conditions.hasFlags.split(',');
      if(flagArray.some((flag) => !gameState.flags.includes(flag))) {
        return false;
      }
    }
    if (overlay.conditions.hasFlagsNot) {
      const flagArray = overlay.conditions.hasFlagsNot.split(',');
      if(!flagArray.some((flag) => !gameState.flags.includes(flag))) {
        return false;
      }
    }

    return true;
  });
})

const activeTooltip = computed(() => {
  if (activeItem.value?.tooltip) {
    const translations = activeItem.value.tooltip;
    const string = clientState.language === "sk"
      ? translations.sk ?? translations
      : translations.en ?? translations;

    return string;
  }
  if (activeZone.value?.tooltip) {
    const translations = activeZone.value.tooltip;
    const string = clientState.language === "sk"
      ? translations.sk ?? translations
      : translations.en ?? translations;

    return string;
  }
  return null;
});

const activeCursor = computed(() => {
  if (activeItem.value) {
    return 'cursor-grab';
  }
  if (activeZone.value?.cursor) {
    return `cursor-${activeZone.value?.cursor}`;
  }
  if (activeZone.value) {
    return 'cursor-help';
  }
  return '';
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
  max-width: min(100%, calc(calc(100vh - 10rem) * 1.46));
  max-height: calc(100vh - 12rem);
  aspect-ratio: 3 / 2.05;
  outline: 1px solid rgba(255, 255, 255, 0.15);
  position: relative;
  @media screen and (min-width: 768px) {
    max-width: min(100%, calc(calc(100vh - 11rem) * 1.46));
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

.loading-overlay {
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  background-color: #000;
  transition: opacity .2s;
  &.hidden {
    opacity: 0;
  }
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
  transform: translateX(-50%);
  white-space: nowrap;
  &.hidden {
    opacity: 0;
    transition: none;
  }
}

.cursor-nw-resize { cursor: url("@/assets/cursors/nw-resize.png") 16 16, nw-resize; }
.cursor-n-resize { cursor: url("@/assets/cursors/n-resize.png") 16 16, n-resize; }
.cursor-ne-resize { cursor: url("@/assets/cursors/ne-resize.png") 16 16, ne-resize; }
.cursor-w-resize { cursor: url("@/assets/cursors/w-resize.png") 16 16, w-resize; }
.cursor-e-resize { cursor: url("@/assets/cursors/e-resize.png") 16 16, e-resize; }
.cursor-sw-resize { cursor: url("@/assets/cursors/sw-resize.png") 16 16, sw-resize; }
.cursor-s-resize { cursor: url("@/assets/cursors/s-resize.png") 16 16, s-resize; }
.cursor-se-resize { cursor: url("@/assets/cursors/se-resize.png") 16 16, se-resize; }
.cursor-zoom { cursor: url("@/assets/cursors/zoom.png") 16 16, zoom-in; }
.cursor-move { cursor: url("@/assets/cursors/move.png") 16 16, move; }
.cursor-door-right { cursor: url("@/assets/cursors/door-right.png") 16 16, move; }
.cursor-door-left { cursor: url("@/assets/cursors/door-left.png") 16 16, move; }
.cursor-help { cursor: url("@/assets/cursors/help.png") 16 16, help; }
.cursor-grab { cursor: url("@/assets/cursors/grab.png") 16 16, grab; }

</style>
