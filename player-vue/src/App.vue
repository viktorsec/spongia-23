<template>
  <div class="interface">
    <ViewPort
      :room="activeRoom"
      :maskVisible="clientState.maskVisible"
      :holdingItem="clientState.holdingItem"
      @click="holdingItemSet(null)"
    />
    <div class="items">
      <button
        v-for="item in gameState.items"
        :key="item"
        @click="holdingItemSet(item)"
        :style="{
          backgroundColor: clientState.holdingItem === item ? 'pink' : 'white',
        }"
      >
        {{ item }}
      </button>
      {{ gameState.flags }}
    </div>
    <div
      class="console"
      @keydown="handleKeyDown"
    >
      <ul>
        <li
          v-for="(line, i) in gameState.console"
          :key="i"
          v-text="line"
        />
      </ul>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, computed } from 'vue';
import clientState from '@/store/clientState';
import gameState from '@/store/gameState';
import rooms from '@/rooms';

import ViewPort from '@/components/ViewPort.vue'

const activeRoom = computed(() => {
  const match = rooms.find(room => room.id === gameState.currentRoom);
  return match;
});

const holdingItemSet = (item) => {
  clientState.holdingItem = item;
}

const handleKeyDown = (event) => {
  if (event.key === 'm') {
    clientState.maskVisible = !clientState.maskVisible;
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
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.console ul {
  display: flex;
  flex-direction: column-reverse;
}
</style>
