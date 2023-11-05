<template>
  <div class="interface">
    <AppHeader />
    <ViewPort
      class="ui-viewport"
      :room="activeRoom"
      :maskVisible="clientState.maskVisible"
      :holdingItem="clientState.holdingItem"
      @click="holdingItemSet(null)"
    />
    <ItemsPanel
      v-show="!activeRoom.hideInterface"
      class="ui-items"
      :items="gameState.items"
      :holdingItem="clientState.holdingItem"
      @holding-item-set="holdingItemSet($event)"
    />
    <ConsolePanel
      v-show="!activeRoom.hideInterface"
      class="ui-console"
      :lines="gameState.console"
    />
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, computed, watch } from 'vue';
import clientState from '@/store/clientState';
import gameState from '@/store/gameState';
import rooms from '@/rooms';

import AppHeader from '@/components/AppHeader.vue'
import ViewPort from '@/components/ViewPort.vue'
import ItemsPanel from '@/components/ItemsPanel.vue'
import ConsolePanel from '@/components/ConsolePanel.vue'

const activeRoom = computed(() => {
  const match = rooms.find(room => room.id === gameState.currentRoom);
  return match;
});

const holdingItemSet = (item) => {
  if (clientState.holdingItem === item) {
    clientState.holdingItem = null;
  } else {
    clientState.holdingItem = item;
  }
}

const handleKeyDown = (event) => {
  if (event.key === 'm' && clientState.debugMode) {
    clientState.maskVisible = !clientState.maskVisible;
  }
  if (event.key === 'd' && clientState.debugMode) {
    clientState.debugVisible = !clientState.debugVisible;
  }
  if (event.key === 'g' && clientState.debugMode) {
    const roomId = prompt('enter room id');
    if (rooms.find(room => room.id === roomId)) {
      gameState.currentRoom = roomId;
    }
  }
};

const saveGame = () => {
  const state = {
    currentRoom: gameState.currentRoom,
    items: gameState.items,
    itemsTaken: gameState.itemsTaken,
    flags: gameState.flags,
  };
  localStorage.setItem('FDL_S23_SAVEFILE', JSON.stringify(state));
};

const loadGame = () => {
  const saveFile = JSON.parse(localStorage.getItem('FDL_S23_SAVEFILE'));
  Object.assign(gameState, saveFile);
};

watch(gameState, saveGame);

onMounted(() => {
  loadGame();
  document.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown);
});

</script>

<style scoped>
.interface {
  height: 100vh;
  display: flex;
  flex-direction: column;
  @media screen and (min-width: 768px) {
    padding-top: 2rem;
  }
}

.ui-viewport {
  flex: 0 0 calc(100vh - 10rem);
  @media screen and (min-width: 768px) {
    flex: 0 0 calc(100vh - 12rem);
  }
}

.ui-items {
}

.ui-console {
  height: 6rem;
}

</style>
