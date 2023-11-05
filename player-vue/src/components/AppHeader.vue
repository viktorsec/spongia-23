<template>
  <div class="app-header">
    <div class="name">
      Pozor, padá hviezda!
    </div>

    <div class="actions">
      <button class="base-button" @click="restart()">Reštartovať hru</button>
      <button class="base-button" @click="musicToggle()">Hudba {{ musicIsPlaying ? 'zap.' : 'vyp.' }}</button>
      <button class="base-button" @click="privacyPolicy()">Súkromie</button>
      <button class="base-button" @click="credits()" @keyup.enter="startDebug()">Titulky</button>
      <button class="base-button" @click="repository()">GitHub</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import gameState from '@/store/gameState';
import clientState from '@/store/clientState';

const restart = () => {
  const yes = confirm('Skutočne si želáte reštartovať hru?');
  if (yes) {
    gameState.restart();
  }
}

let musicAudio = null;
const musicIsPlaying = ref(false);
const musicToggle = () => {
  if (!musicAudio) {
    const musicURL = new URL('/src/assets/ephemeral-3.mp3', import.meta.url);
    musicAudio = new Audio(musicURL);
    musicAudio.loop = true;
  }

  if (!musicIsPlaying.value) {
    musicAudio.play();
    musicIsPlaying.value = true;
  } else {
    musicAudio.pause();
    musicIsPlaying.value = false;
  }
}

const credits = () => {
  const lines = [
    'Pozor, padá hviezda!',
    'Faisceau de Lumière ~ Špongia 2023',
    ['Alexander Mravčák', 'Laco Pápay', 'Viktor Seč'].sort(() => Math.random() - 0.5).join(', '),
    'projects.mravcak.com/hviezda/',
  ].reverse();
  lines.forEach((line, index) => {
    setTimeout(() => {
      gameState.console.push(line);
    }, 1000 * index);
  });
};

const startDebug = () => {
  console.log('debug started');
  clientState.debugMode = true;
};

const privacyPolicy = () => {
  gameState.console.push('Nesledujeme vaše správanie v hre ani mimo nej. Stav hry je uložený iba na vašom zariadení.');
}

const repository = () => {
  window.open('https://github.com/viktorsec/spongia-23/');
}

</script>

<style scoped>
.app-header {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  z-index: 20;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0.5rem;
  & .name {
    color: #999;
  }
  .actions {
    display: flex;
    gap: 1rem;
  }
}


.base-button {
  appearance: none;
  border: 0;
  background-color: transparent;
  color: white;
  padding: 0;
  opacity: 0.25;
  &:hover {
    opacity: 1;
  }
}
</style>