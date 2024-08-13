<template>
  <span v-if="src" class="vImage" :data-index="dataIndex" :class="{ 'f-hide': hidden }">
    <img :src="src" :class="imgLargeScale ? 'imgScale' : ''" :data-index="dataIndex" />
  </span>
</template>
<script>
import { isAndroid, getAndroidVersion } from '@/utils/os';

export default {
  props: {
    src: {
      default: '',
      type: String,
    },
    hidden: {
      default: false,
      type: Boolean,
    },
    dataIndex: {
      default: 0,
      type: Number,
    },
  },
  data() {
    return {
      imgLargeScale: false,
    };
  },
  mounted() {
    this.imgLargeScale = isAndroid && getAndroidVersion() === 5;
  },
};
</script>

<style lang="scss" scoped>
.f-hide {
  display: none;
}
.vImage {
  display: block;
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    z-index: 2;
  }
  img {
    display: block;
    width: 100%;
    height: 100%;
  }
  .imgScale {
    width: 50%;
    height: 50%;
    transform-origin: left top 0;
    transform: scale3d(2, 2, 1);
  }
}
</style>
