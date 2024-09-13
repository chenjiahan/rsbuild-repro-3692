<template>
  <div>
    <div class="apngWrap" ref="apngWrap">
      <canvas ref="canvas" class="canvas"></canvas>
    </div>
    <button @click="play">play</button>
    <button @click="stop">stop</button>
    <button @click="stopAndPlay">stopAndPlay</button>
  </div>
</template>

<script>
import { getCtx } from '@/utils/canvas';
import parseAPNG from 'apng-js';
import apngSrc from './shandian-speak-v1.png';

export default {
  data() {
    return {
      src:apngSrc
    };
  },
  async mounted() {
    const arrayBuffer = await this.loadImage(this.src);
    this.apng = await parseAPNG(arrayBuffer);
    this.$refs.canvas.width = this.apng.width;
    this.$refs.canvas.height = this.apng.height;
    this.ctx = getCtx(this.$refs.canvas);
    this.player = await this.apng.getPlayer(this.ctx, false);
  },
  methods: {
    play() {
      this.player.play();
    },
    stop() {
      this.player.stop();
    },
    stopAndPlay() {
      this.player.stop();
      this.player.play();
    },
    loadImage(src) {
      return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', src);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function () {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(this);
          }
        };
        xhr.send();
      });
    },
  }
}


</script>
