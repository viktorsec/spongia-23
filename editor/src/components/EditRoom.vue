<template>
  <main class="flex">
    <div class="w-1/2 p-2">
      <div class="border relative aspect-[3/2]">
        <img
          v-for="(background, i) in room.background"
          :key="i"
          :src="`/assets/${background.path}`"
          class="absolute"
        >
        <img
          :src="room.mask.path"
          :style="{
            opacity: room.mask.opacity,
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
          v-for="(background, i) in room.background"
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
            <input type="range" v-model.number="room.mask.opacity" min="0" max="1" step="0.01">
          </div>
        </div>
      </div>
    </div>

    <div class="w-1/2 p-2 overflow-scroll">
      <button class="p-1 border" @click="load()">Load</button>
      <pre
        v-text="room"
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
    room.background.push(this.generate());
  },
  remove: () => {
    room.background.splice(room.background.length - 1, 1);
  },
  setFile: (files, i) => {
    const file = files[0];
    room.background[i].path = file.name;
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        // convert image file to base64 string
        room.background[i].file = reader.result;
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
    room.mask.path = file.name;
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        // convert image file to base64 string
        room.mask.file = reader.result;
      },
      false,
    );

    if (file) {
      reader.readAsDataURL(file);
    }
  },
};

const room = reactive({
  background: [
    backgroundHandler.generate(),
  ],
  mask: {
    file: '',
    path: '',
    opacity: 0.5,
  },
  items: [

  ],
});


const load = () => {
  const payload = prompt('Input JSON');
  if (payload) {
    const payloadParsed = JSON.parse(payload);
    Object.assign(room, payloadParsed);
  }
};

</script>

<style scoped>

</style>
