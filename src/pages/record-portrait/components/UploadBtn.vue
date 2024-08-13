<template>
  <div
    class="btn-upload"
    v-show="status === RECORD_STATUS.WAIT_SUBMIT"
    v-press="{
      methods: {
        start: showPressIcon,
        cancel: hidePressIcon,
        end: emitUpload,
      },
    }"
  >
    <img class="u-icon" :src="resources.iconUpload" v-show="!isPress" />
    <img class="u-icon" :src="resources.iconUpload" v-show="isPress" />
  </div>
</template>

<script>
import { RECORD_STATUS } from '@/data/data';

export default {
  props: {
    resources: {
      default: () => ({}),
      type: Object,
    },
    status: {
      default: RECORD_STATUS.WAIT_SUBMIT,
    },
    disabled: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      RECORD_STATUS,
      isPress: false,
    };
  },
  methods: {
    showPressIcon() {
      if (this.disabled) return false;
      this.isPress = true;
    },
    hidePressIcon() {
      if (this.disabled) return false;
      this.isPress = false;
    },
    emitUpload() {
      if (this.disabled) return false;
      this.hidePressIcon();
      this.$emit('upload');
    },
  },
};
</script>
<style lang="scss" scoped>
.btn-upload {
  position: absolute;
  width: 1.22rem;
  height: 1.22rem;
  .u-icon {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
