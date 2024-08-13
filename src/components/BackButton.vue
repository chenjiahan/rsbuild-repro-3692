<template>
  <v-image
    class="btn-back"
    :class="showQuestionText ? 'btn-back-with-text' : ''"
    :src="btn_back"
    @click.native="clickBtn"
  />
</template>

<script>
import btn_back from '@/assets/record-portarit/btn-back.png';
export default {
  props: {
    showQuestionText: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      btn_back,
    };
  },
  methods: {
    clickBtn() {
      if (this.disabled) return false;
      this.$emit('click');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/common/variable.scss';

.btn-back {
  position: absolute;
  z-index: $zIndexBtnSystem;
  left: 0.375rem;
  width: 1.2rem;
  height: 1.2rem;
}

.btn-back {
  top: 0.45rem;
}
</style>
