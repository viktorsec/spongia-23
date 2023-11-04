<template>
  <div class="items-panel">
    <TransitionGroup>
      <Vue3Popper
        v-for="item in itemsRich"
        :key="item"
        hover
        placement="bottom"
      >
        <button
          @click="$emit('holding-item-set', item.id)"
          class="item-single"
          :class="{
            'active' : holdingItem === item.id,
          }"
        >
            <img
              :src="loadItemImage(item.image)"
              alt=""
            >
        </button>
        <template #content>
          <div class="item-tooltip">
            <h3>{{ item.name }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </template>
      </Vue3Popper>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import itemsDB from '@/content/items.json';
import Vue3Popper from 'vue3-popper';

const props = defineProps({
  items: Array,
  holdingItem: String,
});


const loadItemImage = (path) => {
  const url = new URL(`/src/content/items/${path}`, import.meta.url).href;
  return url;
}

const itemsRich = computed(() => {
  const getItem = (id) => {
    return itemsDB.find((item) => item.id === id) || {
      id,
      image: `${id}.png`,
      name: id,
    };
  };
  return props.items.map((id) => getItem(id));
});

</script>

<style scoped>
.items-panel {
  display: flex;
  height: 5rem;
  @media screen and (min-width: 768px) {
    justify-content: center;
  }
}
.item-single {
  display: block;
  position: relative;
  z-index: 0;
  background-color: transparent;
  cursor: pointer;
  border: 0;
  min-width: 5rem;
  width: 5rem;
  height: 5rem;
  opacity: 0.9;
  transition: all .3s;
  border-bottom: 4px solid transparent;
  &:hover {
    z-index: 1;
    transform: scale(1.2);
  }
  &.active {
    border-bottom-color: rgba(255, 255, 255, 0.25);
    opacity: 1;
  }
}

.v-enter-active,
.v-leave-active {
  transition: transform 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  transform: scale(0);
}
</style>

<style>
.item-tooltip {
  & h3 {
    margin: 0;
    line-height: 1;
    font-size: 1.25rem;
  }
  & p {
    font-size: 0.9rem;
  }
}
</style>