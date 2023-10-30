<template>
  <main class="flex">
    <div class="w-1/2 p-2">
      <div class="border relative aspect-[3/2] mb-2">
        <div title="backgrounds">
          <img
            v-for="(background, i) in roomState.background"
            :key="i"
            :src="`/assets/${background.path}`"
            class="absolute"
          >
        </div>
        <div title="items">
          <img
            v-for="(item, i) in roomState.items"
            :key="i"
            :src="`/assets/${item.path}`"
            class="absolute"
          >
        </div>
        <img
          :src="`/assets/${roomState.mask.path}`"
          :style="{
            opacity: editorState.mask.opacity,
          }"
          class="absolute"
        >
      </div>

      <div class="border p-2 mb-2">
        <h2 class="font-bold">Basics</h2>
        <div class="flex gap-2">
          <label>
            ID
            <input
              type="text"
              class="w-full border"
              :value="roomState.id"
              @input="roomState.id = slugify($event.target.value)"
            >
          </label>
          <label>
            Say
            <input
              type="text"
              class="w-full border"
              v-model="roomState.say"
            >
          </label>
          <label>
            Music
            <input
              type="text"
              class="w-full border"
              v-model="roomState.music"
            >
          </label>
        </div>
      </div>

      <div class="border p-2 mb-2">
        <header class="flex gap-2">
          <h2 class="font-bold">Background</h2>
          <button @click="backgroundHandler.remove()">-</button>
          <button @click="backgroundHandler.add()">+</button>
        </header>
        <div
          v-for="(background, i) in roomState.background"
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
          <div class="w-1/2">
            <input type="text" class="w-full border" v-model="roomState.mask.path">
          </div>
          <div class="w-1/2">
            <input type="range" v-model.number="editorState.mask.opacity" min="0" max="1" step="0.01">
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
            v-for="(zone, i) in roomState.zones"
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
                Action sequence
                <InputSelect
                  v-model="zone.actionSequence"
                  :options="zoneHandler.actionSequenceOptions"
                />
              </label>
              <label class="flex-1">
                Cursor
                <input type="text" class="border w-full" v-model="zone.cursor">
              </label>
              <label class="flex-1">
                Tooltip
                <input type="text" class="border w-full" v-model="zone.tooltip">
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
                  class="border p-2 flex flex-col gap-2"
                >
                  <div class="flex gap-2">
                    <div>Trigger:</div>
                    <input type="text" class="border w-full" v-model="action.trigger" placeholder="trigger">
                    <button @click="action.trigger = '__FALLBACK__'" class="border">fallback</button>
                  </div>
                  <div class="flex gap-2" v-if="action.require">
                    <div>Require:</div>
                    <input type="text" class="border w-full" v-model="action.require.items" placeholder="items">
                    <input type="text" class="border w-full" v-model="action.require.flags" placeholder="flags">
                  </div>
                  <div class="flex gap-2" v-if="action.do">
                    <div>Do:</div>
                    <input type="text" class="border w-full" v-model="action.do.say" placeholder="say">
                    <input type="text" class="border w-full" v-model="action.do.itemAdd" placeholder="itemAdd">
                    <input type="text" class="border w-full" v-model="action.do.itemRemove" placeholder="itemRemove">
                    <input type="text" class="border w-full" v-model="action.do.flagAdd" placeholder="flagAdd">
                    <input type="text" class="border w-full" v-model="action.do.flagRemove" placeholder="flagRemove">
                    <input type="text" class="border w-full" v-model="action.do.move" placeholder="move">
                  </div>
                  <div class="flex gap-2">
                    <input type="text" class="border w-full" v-model="action.soundEffect" placeholder="soundEffect">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="border p-2 mb-2">
        <header class="flex gap-2 mb-2">
          <h2 class="font-bold">Items</h2>
          <button @click="itemHandler.remove()">-</button>
          <button @click="itemHandler.add()">+</button>
        </header>

        <div class="flex flex-col gap-2">
          <div
            v-for="(item, i) in roomState.items"
            :key="i"
            class="flex gap-2"
          >
            <input type="text" :value="item.id" @input="item.id = slugify($event.target.value)" placeholder="id" class="flex-1 border">
            <input type="text" v-model="item.path" placeholder="path" class="flex-1 border">
          </div>
        </div>
      </div>
    </div>

    <div class="w-1/2 p-2 overflow-scroll">
      <div class="flex gap-2">
        <button class="p-1 border" @click="copy()">Copy to clipboard</button>
        <button class="p-1 border" @click="loadString()">Load from string</button>
        <input type="file" @change="loadFile($event.target.files)" accept=".json">
      </div>

      <pre
        v-text="roomState"
      />
    </div>
  </main>
</template>

<script setup>
import roomState from '@/util/roomState';
import editorState from '@/util/editorState';
import slugify from '@/util/slugify';

import InputSelect from '@/components/InputSelect.vue';

const removeLast = (arr) => {
  arr.splice(arr.length - 1, 1);
};

const backgroundHandler = {
  generate: () => ({
    file: '',
    path: '',
  }),
  add() {
    roomState.background.push(this.generate());
  },
  remove() {
    removeLast(roomState.background);
  },
  setFile: (files, i) => {
    const file = files[0];
    roomState.background[i].path = file.name;
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        // convert image file to base64 string
        roomState.background[i].file = reader.result;
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
    require: {
      items: '',
      flags: '',
    },
    do: {
      say: '',
      itemAdd: '',
      itemRemove: '',
      flagAdd: '',
      flagRemove: '',
      move: '',
      // TODO: Modify state
      // TODO: Eval
    },
    soundEffect: ''
  }),
  generate() {
    return {
      id: '',
      color: '',
      actionSequence: 'RANDOM',
      cursor: '',
      tooltip: '',
      actions: [
        this.generateAction(),
      ],
    }
  },
  add() {
    roomState.zones.push(this.generate());
  },
  remove() {
    removeLast(roomState.zones);
  },
  addAction(i) {
    roomState.zones[i].actions.push(this.generateAction());
  },
  removeAction(i) {
    roomState.zones[i].actions.splice(roomState.zones[i].actions.length - 1, 1);
  },
  actionSequenceOptions: [
    'RANDOM',
    'SERIAL',
  ],
};

const itemHandler = {
  generate: () => ({
    id: '',
    path: '',
  }),
  add() {
    roomState.items.push(this.generate());
  },
  remove() {
    removeLast(roomState.items);
  },
};

const setRoom = (payload) => {
  if (payload) {
    const payloadParsed = JSON.parse(payload);
    Object.assign(roomState, payloadParsed);
  }
};

const loadString = () => {
  const payload = prompt('Input JSON');
  setRoom(payload);
};

const loadFile = (files) => {
  const file = files[0];
  const reader = new FileReader();
  reader.addEventListener(
    'load',
    () => {
      setRoom(reader.result);
    },
    false,
  );

  if (file) {
    reader.readAsText(file);
  }
}

const copy = async () => {
  await navigator.clipboard.writeText(JSON.stringify(roomState));
  alert('Copied!');
}

</script>

<style scoped>

</style>
