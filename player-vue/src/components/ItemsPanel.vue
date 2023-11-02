<template>
  <div class="items-panel">
    <TransitionGroup
    >
      <button
        v-for="item in items"
        :key="item"
        @click="$emit('holding-item-set', item)"
        class="item-single"
        :class="{
          'active' : holdingItem === item,
        }"
      >
        <img
          :src="loadItemImage(item)"
          alt=""
        >
      </button>
    </TransitionGroup>
  </div>
</template>

<script setup>
defineProps({
  items: Array,
  holdingItem: String,
});

const loadItemImage = (key) => {
  const url = new URL(`/src/content/items/${key}.png`, import.meta.url).href;
  return url;
}

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
  background-color: transparent;
  cursor: pointer;
  border: 0;
  min-width: 5rem;
  width: 5rem;
  height: 5rem;
  opacity: 0.9;
  transform: scale(0.8);
  transition: all .3s;
  border-bottom: 4px solid transparent;
  &:hover {
    transform: scale(1);
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