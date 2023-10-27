<template>
  <main class="flex">
    <div class="w-1/2 p-2">
      <div class="border relative aspect-[3/2]">
        <img
          v-for="(background, i) in state.background"
          :key="i"
          :src="background.file"
          class="absolute"
        >
        <img
          :src="state.mask.file"
          :style="{
            opacity: state.mask.opacity,
          }"
          class="absolute"
        >
      </div>

      <div class="border p-2 mb-2">
        <header class="flex gap-2">
          <h2 class="font-bold">Background</h2>
          <button @click="backgroundHandler.remove()">-</button>
          <button @click="backgroundHandler.add()">+</button>
        </header>
        <div
          v-for="(background, i) in state.background"
          :key="i"
          class="flex"
        >
          <div class="w-1/2">
            <input type="file" @change="backgroundHandler.setFile($event.target.files, i)">
          </div>
          <div class="w-1/2">
            <input type="text" class="w-full border" v-model="background.path">
          </div>
        </div>
      </div>

      <div class="border p-2 mb-2">
        <h2 class="font-bold">Mask</h2>
        <div class="flex">
          <div class="w-1/3">
            <input type="file" @change="maskHandler.setFile($event.target.files)">
          </div>
          <div class="w-1/3">
            <input type="text" class="w-full border">
          </div>
          <div class="w-1/3">
            <input type="range" v-model.number="state.mask.opacity" min="0" max="1" step="0.01">
          </div>
        </div>
      </div>
    </div>

    <div class="w-1/2 p-2 overflow-scroll">
      <pre
        v-text="state"
      />
    </div>
  </main>
</template>

<script setup>
import { reactive } from 'vue';

const backgroundHandler = {
  generate: () => ({
    file: '',
    path: '',
  }),
  add() {
    state.background.push(this.generate());
  },
  remove: () => {
    state.background.splice(state.background.length - 1, 1);
  },
  setFile: (files, i) => {
    const file = files[0];
    state.background[i].path = file.name;
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        // convert image file to base64 string
        state.background[i].file = reader.result;
      },
      false,
    );

    if (file) {
      reader.readAsDataURL(file);
    }
  },
};

const maskHandler = {
  setFile: (files) => {
    const file = files[0];
    state.mask.path = file.name;
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        // convert image file to base64 string
        state.mask.file = reader.result;
      },
      false,
    );

    if (file) {
      reader.readAsDataURL(file);
    }
  },
};

const state = reactive({
  background: [
    backgroundHandler.generate(),
  ],
  mask: {
    file: '',
    path: '',
    opacity: 0.5,
  },
});
</script>

<style scoped>

</style>
