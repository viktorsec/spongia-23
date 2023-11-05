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
      class="ui-items"
      :items="gameState.items"
      :holdingItem="clientState.holdingItem"
      @holding-item-set="holdingItemSet($event)"
    />
    <ConsolePanel
      class="ui-console"
      :lines="gameState.console"
    />
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, computed } from 'vue';
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
  if (event.key === 'm') {
    clientState.maskVisible = !clientState.maskVisible;
  }
  if (event.key === 'd') {
    clientState.debugVisible = !clientState.debugVisible;
  }
  if (event.key === 'g') {
    const roomId = prompt('enter room id');
    if (rooms.find(room => room.id === roomId)) {
      gameState.currentRoom = roomId;
    }
  }

};

onMounted(() => {
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
    flex: 0 1 calc(100vh - 17rem);
  }
}

.ui-viewport {
  flex: 0 1 calc(100vh - 15rem);
}

.ui-items {
}

.ui-console {
  height: 10rem;
}

</style>
