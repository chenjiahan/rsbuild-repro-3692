<template>
  <div class="btn-audio audio-container">
    <v-image
      class="audio-warp"
      :src="sprites"
      :class="{ 'f-animate': isPlaying }"
      v-press="{ methods: { end: clickBtn } }"
    />
  </div>
</template>

<style lang="scss" scoped>
@import '@/common/variable.scss';

.audio-container {
  // 位置, 宽高需要自定义
  overflow: hidden;
  .audio-warp {
    position: absolute;
    left: 0;
    top: 0;
    width: 300%;
    height: 100%;
    transform: translate3d(calc(-2 / 3 * 100%), 0, 0);
    &.f-animate {
      will-change: transform;
      animation: sequence 1s steps(3, end) infinite;
      -webkit-animation: sequence 1s steps(3, end) infinite;
    }
  }
}

@keyframes sequence {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(-100%, 0, 0);
  }
}
</style>

<script>
import VImage from '@/components/VImage';

export default {
  props: {
    sprites: {
      default: '',
      type: String,
    },
    isPlaying: {
      default: false,
    },
  },
  components: {
    VImage,
  },
  methods: {
    clickBtn() {
      this.$emit('clickHintBtnFrog');
    },
  },
};
</script>
