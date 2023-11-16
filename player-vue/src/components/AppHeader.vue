<template>
  <div class="app-header">
    <div class="name">
      {{ clientState.language === 'sk' ? 'Pozor, padá hviezda!' : 'Watch Out: A Star is Falling' }}
    </div>

    <div class="actions">
      <button class="base-button" @click="restart()">
        {{ clientState.language === 'sk' ? 'Reštartovať hru' : 'Restart Game' }}
      </button>
      <button class="base-button" @click="toggleMusic()">
        {{ getMusicToggleLabel() }}
      </button>
      <button class="base-button" @click="toggleLanguage()">
        {{ clientState.language === 'sk' ? 'English' : 'Slovensky' }}
      </button>
      <button class="base-button" @click="privacyPolicy()">
        {{ clientState.language === 'sk' ? 'Súkromie' : 'Privacy' }}
      </button>
      <button
        class="base-button"
        @click="credits()"
        @keyup.enter="startDebug()"
      >
       {{ clientState.language === 'sk' ? 'Titulky' : 'Credits' }}
      </button>
      <button class="base-button" @click="repository()">GitHub</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import gameState from '@/store/gameState';
import clientState from '@/store/clientState';

const restart = () => {
  const message = clientState.language === 'sk'
    ? 'Skutočne si želáte reštartovať hru?'
    : 'Do you really want to restart the game?';

  if (confirm(message)) {
    gameState.restart();
  }
}

let musicAudio = null;
const musicIsPlaying = ref(false);
const toggleMusic = () => {
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

const toggleLanguage = () => {
  const newLanguage = clientState.language === 'sk' ? 'en' : 'sk';
  clientState.language = newLanguage;
}

const credits = () => {
  const title = clientState.language === 'sk' ? 'Pozor, padá hviezda!' : 'Watch Out: A Star is Falling';
  const lines = [
    title,
    'Faisceau de Lumière ~ Špongia 2023',
    ['Alexander Mravčák', 'Laco Pápay', 'Viktor Seč'].sort(() => Math.random() - 0.5).join(', '),
    'projects.mravcak.com/hviezda/',
    ' ',
    'Music: Ephemeral III (Lilith) by Le Chaos Entre 2 Chaises'
  ].reverse();
  lines.forEach((line, index) => {
    setTimeout(() => {
      gameState.console.push(line);
    }, 1000 * index);
  });
};

const getMusicToggleLabel = () => {
  if (clientState.language === 'sk') {
    return `Hudba ${musicIsPlaying.value ? 'vyp.' : 'zap.'}`;
  }

  return `Sound ${musicIsPlaying.value ? 'on' : 'off'}`;
};

const startDebug = () => {
  console.log('debug started');
  clientState.debugMode = true;
};

const privacyPolicy = () => {
  const message = clientState.language === 'sk'
    ? 'Nesledujeme vaše správanie v hre ani mimo nej. Stav hry je uložený iba na vašom zariadení.'
    : 'We do not track your behavior in the game or outside of it. The game state is saved only on your device.';
  gameState.console.push(message);
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