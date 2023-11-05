<template>
  <div class="console-panel">
    <TransitionGroup tag="ul" class="console-list">
      <li
        v-for="(line, i) in lines"
        :key="i"
        class="console-line"
        :class="{
          'last' : i === lines.length - 1
        }"
        v-text="line"
      />
    </TransitionGroup>
  </div>
</template>

<script setup>
defineProps({
  lines: Array,
});
</script>

<style scoped>
.console-panel {
  color: #AAA;
  padding: 0.25rem 1rem;
  overflow: auto;
  @media screen and (min-width: 768px) {
    font-size: 1.2rem;
  }
}
.console-list {
  display: flex;
  flex-direction: column-reverse;
  list-style: none;
  padding: 0;
}

.console-line {
  &.last {
    color: #FFF;
  }
}

.v-enter-active,
.v-leave-active {
  transition: all 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(1rem);
}

</style>