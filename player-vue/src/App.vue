<template>
  <div class="interface">
    <div class="interface-main">
      <div class="viewport">
        <img src="@/assets/comet.png" alt="">
      </div>
      <div class="items">

      </div>
      <div class="console">
        <ul>
          <li>Skoda, ale aspon mi ostala flasa.</li>
          <li>Mesacny lektvar.</li>
          <li>Mnam, banan.</li>
          <li>Hmm nic zaujimave, musim sa rozhliadnut.</li>
          <li>AAAAh! To sa ruti rovno na nas!</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.interface {
  padding: 1rem;
  height: 100%;
  display: flex;
  justify-content: center;
}
.interface-main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.viewport {
  flex: 1;
  height: calc(100vh - 17rem);
  display: flex;
  align-items: center;
  justify-content: center;
}
.console ul {
  padding: 0;
  list-style: none;
  height: 10rem;
}
.items {
  height: 4rem;
}
</style>
