<template>
  <div class="container" ref="container">
  </div>
</template>

<script lang="ts">
import { Component, Vue, Ref } from 'vue-property-decorator';

@Component
export default class AIPracticeExpress extends Vue {
  @Ref('container') public container!: HTMLElement;

  private app;
  public spine;
}
</script>

<style lang="scss" scoped>
.container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}
html,
body {
  background-color: transparent !important;
  margin: 0;
  padding: 0;
}
</style>
