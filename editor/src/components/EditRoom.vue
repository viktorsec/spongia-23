<template>
  <main class="flex">
    <div class="w-1/2 p-2">
      <div class="border relative aspect-[3/2] mb-2">
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
        <h2 class="font-bold">Room identification</h2>
        <input
          type="text"
          class="w-full border"
          :value="room.id"
          @input="room.id = slugify($event.target.value)"
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

      <div class="border p-2 mb-2">
        <header class="flex gap-2">
          <h2 class="font-bold">Zones</h2>
          <button @click="zoneHandler.remove()">-</button>
          <button @click="zoneHandler.add()">+</button>
        </header>

        <div class="flex flex-col gap-2">
          <div
            v-for="(zone, i) in room.zones"
            :key="i"
            class="border p-2"
          >
            <div class="flex gap-2">
              <label class="flex-1">
                ID
                <input type="text" class="border w-full" v-model="zone.id">
              </label>
              <label class="flex-1">
                Color
                <input type="color" class="border w-full" v-model="zone.color">
              </label>
              <label class="flex-1">
                Action precendece
                <InputSelect
                  v-model="zone.actionSequence"
                  :options="zoneHandler.actionSequenceOptions"
                />
              </label>
            </div>
            <div>
              <header class="flex gap-2">
                <h3 class="font-bold">Actions</h3>
                <button @click="zoneHandler.removeAction(i)">-</button>
                <button @click="zoneHandler.addAction(i)">+</button>
              </header>
              <div class="flex flex-col gap-2">
                <div
                  v-for="(action, j) in zone.actions"
                  :key="j"
                  class="flex gap-2"
                >
                  <input type="text" class="border w-full" v-model="action.trigger" placeholder="trigger">
                  <input type="text" class="border w-full" v-model="action.itemAdd" placeholder="itemAdd">
                  <input type="text" class="border w-full" v-model="action.itemRemove" placeholder="itemRemove">
                  <input type="text" class="border w-full" v-model="action.flagAdd" placeholder="flagAdd">
                  <input type="text" class="border w-full" v-model="action.flagRemove" placeholder="flagRemove">
                  <input type="text" class="border w-full" v-model="action.move" placeholder="move">
                </div>
              </div>
            </div>
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
import room from '@/util/roomState';
import slugify from '@/util/slugify';

import InputSelect from '@/components/InputSelect.vue';

const backgroundHandler = {
  generate: () => ({
    file: '',
    path: '',
  }),
  add() {
    room.background.push(this.generate());
  },
  remove() {
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

const zoneHandler = {
  generateAction: () => ({
    trigger: '',

    say: '',
    itemAdd: '',
    itemRemove: '',
    flagAdd: '',
    flagRemove: '',
    move: '',
  }),
  generate() {
    return {
      id: '',
      color: '',
      actionSequence: 'RANDOM',
      actions: [
        this.generateAction(),
      ],
    }
  },
  add() {
    room.zones.push(this.generate());
  },
  remove() {
    room.zones.splice(room.zones.length - 1, 1);
  },
  addAction(i) {
    room.zones[i].actions.push(this.generateAction());
  },
  removeAction(i) {
    room.zones[i].actions.splice(room.zones[i].actions.length - 1, 1);
  },
  actionSequenceOptions: [
    'RANDOM',
    'SERIAL',
  ],
};

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
