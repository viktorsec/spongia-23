<template>
  <select
    class="border w-full"
    @change="$emit('update:modelValue', $event.target.value)"
  >
    <option
      v-for="option in options"
      :key="option"
      :selected="option === modelValue"
      v-text="option"
    />
  </select>
</template>

<script setup>
defineProps({
  modelValue: String,
  options: Array,
});
</script>