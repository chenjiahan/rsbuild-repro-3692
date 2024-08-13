<template>
  <div class="apngWrap" ref="apngWrap">
    <canvas ref="canvas" class="canvas"></canvas>
  </div>
</template>
<script>
import parseAPNG from 'apng-js';
import { getCtx } from '@/utils/canvas';
import { isAndroid } from '@/utils/os';
import { sleep } from '@/utils';
import { APNGPlayState } from '@/data/data';

export default {
  props: {
    bindStart: null,
    bindEnd: null,
    src: {
      default: '',
      type: String,
    },
    playState: {
      default: APNGPlayState.Initial,
      type: Number,
    },
    isLoop: {
      default: false,
      type: Boolean,
    },
    index: {
      default: -1,
      type: Number,
    },
    interval: {
      default: 0,
      type: Number,
    },
    numPlays: {
      default: 1,
      type: Number,
    },
  },
  data() {
    return {
      isEnd: false,
      apng: {},
      player: {},
    };
  },
  watch: {
    playState(val) {
      if (Object.keys(this.player).length) {
        switch (val) {
          case APNGPlayState.Paused:
            this.apng.numPlays = this.numPlays + 1;
            this.player.pause();
            break;
          case APNGPlayState.Playing:
            if (this.player.paused) {
              if (this.isLoop) {
                this.apng.numPlays = 0;
              } else {
                this.apng.numPlays = this.numPlays;
                this.timer = setTimeout(() => {
                  if (!this.isEnd) {
                    this.bindEnd?.(this.index);
                    this.$logger.writeAndSend('apng_error', { src: this.src });
                  }
                }, this.apng.playTime * this.numPlays + 500 || 3000);
              }
              this.player.play();
            }
            break;
          case APNGPlayState.Initial:
            this.player.stop();
            break;
          default:
            break;
        }
      }
    },
    src: {
      async handler(value) {
        if (!value) return;
        try {
          const buffer = await this.loadImage(value);
          this.apng = parseAPNG(buffer);
        } catch {
          return;
        }
        if (this.apng instanceof Error) return;
        !this.isLoop && (this.apng.numPlays = this.numPlays);
        this.$nextTick(() => {
          if (!this.$refs.apngWrap || !this.$refs.canvas) return;
          if (isAndroid) {
            const { offsetWidth } = this.$refs.apngWrap;
            this.init({ scale: Math.max(Math.round(offsetWidth / this.apng.width), 1) });
          } else {
            this.init({ scale: 1 });
          }
        });
      },
      immediate: true,
    },
  },
  beforeDestroy() {
    this.player.stop?.();
    this.player.removeAllListeners?.();
    this.$refs.canvas = null;
    this.ctx = null;
  },
  methods: {
    async init({ scale = 1 }) {
      this.$refs.canvas.width = this.apng.width * scale;
      this.$refs.canvas.height = this.apng.height * scale;
      this.ctx = getCtx(this.$refs.canvas);
      this.ctx.scale(scale, scale);
      this.player = await this.apng.getPlayer(this.ctx, false);

      this.$emit('loaded', this.apng.playTime * this.numPlays, this.index);

      this.bindStart && this.player.addListener('play', this.bindStart);

      this.player.addListener('end', this.endPlay);
      if (this.playState === APNGPlayState.Playing && this.player.paused) {
        this.isLoop ? (this.apng.numPlays = 0) : (this.apng.numPlays = this.numPlays);
        this.player.play();
      }
    },
    async endPlay() {
      this.isEnd = true;
      this.bindEnd?.(this.index);
      if (this.interval) {
        this.player.stop();
        await sleep(this.interval);
        this.player.play();
      }
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
  },
};
</script>

<style lang="scss" scoped>
.apngWrap {
  width: 100%;
  height: 100%;
  .canvas {
    width: 100%;
    height: 100%;
    position: absolute;
  }
}
</style>
